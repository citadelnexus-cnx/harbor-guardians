// Alpha A4 interactive Windows player flow — ES-module DOM glue over the
// compiled AUTHORITATIVE sim (./engine, built by `pnpm run ui:engine`). No
// gameplay logic lives here: every button drives the real ExpeditionController;
// save/resume goes through the Tauri save_game/load_game commands. Strict CSP
// (default-src 'self') — same-origin module + fetch only, no external hosts.

import { ExpeditionController } from "./engine/ui/engine.js";

const SEED = 20260723;
const CORE_RESOURCES = ["Crowns", "Provisions", "Iron", "Aether"];

// Tauri IPC (present only inside the desktop app; absent in a plain browser).
const tauri = typeof window !== "undefined" ? window.__TAURI__ : undefined;
const invoke = tauri && tauri.core ? tauri.core.invoke : null;

let seeds = null;
let controller = null;

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function newController(scenario) {
  controller = new ExpeditionController(seeds.storage, seeds.expedition, SEED, scenario);
  render();
}

function statusRow(label, value, cls) {
  const row = el("div", "status-row");
  row.appendChild(el("span", "status-label", label));
  row.appendChild(el("span", "status-value" + (cls ? " " + cls : ""), value));
  return row;
}

function renderStatus(v) {
  const grid = document.getElementById("status");
  grid.textContent = "";
  grid.appendChild(statusRow("Phase", v.phase));
  grid.appendChild(statusRow("Guardian", v.guardian_id ? v.guardian_id.replace("gdn.", "") : "—"));
  grid.appendChild(statusRow("Objective (event)", v.event_state || "—"));
  grid.appendChild(statusRow("Outcome", v.outcome || "—"));
  grid.appendChild(statusRow("Vessel", v.vessel_condition || "—", v.vessel_condition === "damaged" ? "bad" : ""));
  grid.appendChild(statusRow("Crew", v.crew_condition || "—", v.crew_condition === "damaged" ? "bad" : ""));
  grid.appendChild(statusRow("Guardian readiness", v.guardian_condition || "—", v.guardian_condition === "damaged" ? "bad" : ""));
  grid.appendChild(statusRow("Route-anchor ops", v.route_anchor_unlocked ? "unlocked" : "locked", v.route_anchor_unlocked ? "good" : ""));
  grid.appendChild(statusRow("Completed expeditions", String(v.completed_expeditions)));
  const supplies = Object.keys(v.supply_set).map((k) => v.supply_set[k] + " " + k).join(", ");
  grid.appendChild(statusRow("Supply loadout", supplies || "—"));
}

function storageBar(resource, band, overflow, overflowCap) {
  const scale = band.total_capacity + overflowCap; // 3S + 3×S overflow headroom
  const row = el("div", "bar-row");
  row.appendChild(el("span", "bar-label", resource));
  const bar = el("div", "bar");
  const seg = (cls, amount) => {
    const s = el("span", cls);
    s.style.width = (100 * amount) / scale + "%";
    bar.appendChild(s);
  };
  seg("seg-safe", band.safe);
  seg("seg-exposed", band.exposed);
  seg("seg-overflow", overflow || 0);
  row.appendChild(bar);
  const parts = ["safe " + band.safe + "/" + band.safe_capacity, "exposed " + band.exposed];
  if (overflow) parts.push("overflow " + overflow + "/" + overflowCap);
  row.appendChild(el("span", "bar-val", parts.join(" · ")));
  return row;
}

function renderStorage(v) {
  const wrap = document.getElementById("storage");
  wrap.textContent = "";
  for (const r of CORE_RESOURCES) {
    wrap.appendChild(storageBar(r, v.harbor[r], v.overflow[r], v.overflow_cap[r]));
  }
  const cargo = document.getElementById("cargo");
  const keys = Object.keys(v.cargo_aboard);
  if (keys.length > 0) {
    const text = keys.map((k) => v.cargo_aboard[k] + " " + k).join(", ");
    cargo.textContent = (v.unload_blocked ? "Blocked — still aboard (preserved): " : "Aboard: ") + text;
    cargo.className = v.unload_blocked ? "cargo blocked" : "cargo";
  } else {
    cargo.textContent = "Hold empty";
    cargo.className = "cargo empty";
  }
}

function renderActions() {
  const wrap = document.getElementById("actions");
  wrap.textContent = "";
  const actions = controller.availableActions();
  if (actions.length === 0) {
    wrap.appendChild(el("p", "hint", "No actions in this phase."));
    return;
  }
  actions.forEach((action, i) => {
    const btn = el("button", "action-btn", (i + 1) + ". " + action.label);
    btn.setAttribute("type", "button");
    btn.addEventListener("click", () => perform(action));
    wrap.appendChild(btn);
  });
}

function perform(action) {
  const res = controller.perform(action);
  if (!res.ok) setMessage("Rejected: " + res.error, true);
  render();
}

function setMessage(text, isError) {
  const m = document.getElementById("message");
  m.textContent = text;
  m.className = isError ? "message error" : "message";
}

function render() {
  const v = controller.view();
  document.getElementById("context").textContent =
    "Content: " + v.content_id + " · Route: " + v.route_id + " · Outpost: " + v.outpost_id;
  setMessage(v.message, false);
  renderStatus(v);
  renderStorage(v);
  renderActions();
}

// ── Keyboard: number keys 1–9 trigger the corresponding action ───────────────
document.addEventListener("keydown", (e) => {
  if (!controller) return;
  const n = Number(e.key);
  if (Number.isInteger(n) && n >= 1) {
    const actions = controller.availableActions();
    if (n <= actions.length) {
      perform(actions[n - 1]);
      e.preventDefault();
    }
  }
});

// ── Persistence (Tauri only) ─────────────────────────────────────────────────
async function doSave() {
  if (!invoke) return;
  try {
    await invoke("save_game", { json: controller.serialize(new Date().toISOString()) });
    setMessage("Saved. Close and relaunch to resume this exact state.", false);
  } catch (err) {
    setMessage("Save failed: " + err, true);
  }
}

async function doLoad() {
  if (!invoke) return;
  try {
    const json = await invoke("load_game");
    if (!json) {
      setMessage("No saved game found.", false);
      return;
    }
    controller = ExpeditionController.fromSerialized(json, seeds.storage, seeds.expedition, SEED);
    render();
  } catch (err) {
    setMessage("Load failed (save left untouched): " + err, true);
  }
}

function wireControls() {
  document.getElementById("sc-fresh").addEventListener("click", () => newController("fresh"));
  document.getElementById("sc-overflow").addEventListener("click", () => newController("overflow_demo"));
  document.getElementById("sc-cancelblock").addEventListener("click", () => newController("cancel_block_demo"));
  const saveBtn = document.getElementById("btn-save");
  const loadBtn = document.getElementById("btn-load");
  const note = document.getElementById("persistence-note");
  if (invoke) {
    saveBtn.disabled = false;
    loadBtn.disabled = false;
    saveBtn.addEventListener("click", doSave);
    loadBtn.addEventListener("click", doLoad);
    note.textContent = "local save file (atomic)";
  } else {
    note.textContent = "unavailable outside the desktop app";
  }
}

async function boot() {
  try {
    const res = await fetch("./seeds.json");
    seeds = await res.json();
  } catch (err) {
    setMessage("Could not load seed data: " + err, true);
    return;
  }
  wireControls();
  // Resume an existing save if present; otherwise start fresh.
  if (invoke) {
    try {
      const json = await invoke("load_game");
      if (json) {
        controller = ExpeditionController.fromSerialized(json, seeds.storage, seeds.expedition, SEED);
        render();
        return;
      }
    } catch (err) {
      setMessage("Existing save could not be loaded (starting fresh): " + err, true);
    }
  }
  newController("fresh");
}

boot();
