// Alpha A4 minimal Windows desktop viewer — vanilla, self-contained, no
// imports, no network beyond the same-origin transcript (strict CSP
// default-src 'self'). Renders the committed, sim-derived playthrough
// (playthrough.json) — the deterministic Harbor -> route-anchor outpost ->
// Harbor loop the real expedition sim produces. No gameplay input is wired in
// this Alpha viewer (brief §2 minimal interface).

"use strict";

var CORE_RESOURCES = ["Crowns", "Provisions", "Iron", "Aether"];

// Fixed reference scales (per resource) so the bars read consistently across
// steps. These mirror the ST1 3S caps plus the 3x overflow headroom; they are
// display scales only, never gameplay values (the numbers shown come from the
// transcript).
var SAFE_CAP = { Crowns: 500, Provisions: 300, Iron: 300, Aether: 200 };
var TOTAL_CAP = { Crowns: 1500, Provisions: 900, Iron: 900, Aether: 600 };

function el(tag, className, text) {
  var node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function resourceBar(resource, band, overflow) {
  var total = TOTAL_CAP[resource] + SAFE_CAP[resource] * 3; // 3S + 3x Safe overflow headroom
  var row = el("div", "bar-row");
  row.appendChild(el("span", "bar-label", resource));

  var bar = el("div", "bar");
  var safe = el("span", "seg-safe");
  safe.style.width = (100 * band.safe) / total + "%";
  var exposed = el("span", "seg-exposed");
  exposed.style.width = (100 * band.exposed) / total + "%";
  var over = el("span", "seg-overflow");
  over.style.width = (100 * (overflow || 0)) / total + "%";
  bar.appendChild(safe);
  bar.appendChild(exposed);
  bar.appendChild(over);
  row.appendChild(bar);

  var parts = ["safe " + band.safe, "exposed " + band.exposed];
  if (overflow) parts.push("overflow " + overflow);
  row.appendChild(el("span", "bar-val", parts.join(" · ")));
  return row;
}

function stepCard(step) {
  var card = el("div", "step");
  var head = el("div", "step-head");
  head.appendChild(el("span", "cmd", step.command));
  head.appendChild(el("span", "phase", step.phase));
  card.appendChild(head);
  card.appendChild(el("p", "note", step.note));

  var bars = el("div", "bars");
  for (var i = 0; i < CORE_RESOURCES.length; i++) {
    var r = CORE_RESOURCES[i];
    var band = step.harbor[r] || { safe: 0, exposed: 0 };
    bars.appendChild(resourceBar(r, band, step.overflow ? step.overflow[r] : 0));
  }
  card.appendChild(bars);

  var cargoKeys = Object.keys(step.cargo_aboard || {});
  if (cargoKeys.length > 0) {
    var text = cargoKeys
      .map(function (k) {
        return step.cargo_aboard[k] + " " + k;
      })
      .join(", ");
    card.appendChild(el("p", "cargo", "Aboard: " + text));
  } else {
    card.appendChild(el("p", "cargo empty", "Hold empty"));
  }
  return card;
}

function renderRun(run) {
  var steps = document.getElementById("steps");
  steps.textContent = "";
  var legend = el("div", "legend");
  legend.appendChild(el("span", "l-safe", "Safe Storage"));
  legend.appendChild(el("span", "l-exposed", "Exposed"));
  legend.appendChild(el("span", "l-overflow", "Unsafe Overflow (3× Safe cap)"));
  steps.appendChild(legend);
  for (var i = 0; i < run.steps.length; i++) {
    steps.appendChild(stepCard(run.steps[i]));
  }
}

function renderTabs(transcript) {
  var tabs = document.getElementById("run-tabs");
  tabs.textContent = "";
  transcript.runs.forEach(function (run, index) {
    var btn = el("button", null, run.title || run.guardian_id);
    btn.setAttribute("type", "button");
    btn.setAttribute("aria-selected", index === 0 ? "true" : "false");
    btn.addEventListener("click", function () {
      var all = tabs.querySelectorAll("button");
      for (var j = 0; j < all.length; j++) all[j].setAttribute("aria-selected", "false");
      btn.setAttribute("aria-selected", "true");
      renderRun(run);
    });
    tabs.appendChild(btn);
  });
}

function render(transcript) {
  var context = document.getElementById("context");
  context.textContent =
    "Content: " + transcript.content_id + " · Route: " + transcript.route_id + " · Outpost: " + transcript.outpost_id;
  renderTabs(transcript);
  if (transcript.runs.length > 0) renderRun(transcript.runs[0]);
}

fetch("./playthrough.json")
  .then(function (response) {
    if (!response.ok) throw new Error("HTTP " + response.status);
    return response.json();
  })
  .then(render)
  .catch(function (err) {
    var steps = document.getElementById("steps");
    steps.textContent = "";
    steps.appendChild(el("p", "error", "Could not load the expedition transcript: " + err.message));
  });
