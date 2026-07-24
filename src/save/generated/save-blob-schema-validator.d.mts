/**
 * Hand-written type surface for the GENERATED, dependency-free SaveBlob
 * JSON-Schema validator (save-blob-schema-validator.mjs). The .mjs is emitted by
 * `node scripts/build-save-validator.mjs` from the committed schema (H2) and is
 * plain ESM; this declaration is its stable typed contract. Do not edit the .mjs
 * by hand; regenerate it. This declaration only describes the ajv standalone
 * function shape (a boolean-returning predicate that stamps `.errors`).
 */

/** One ajv validation error (subset of ajv's ErrorObject we surface in messages). */
export interface SchemaValidationErrorObject {
  instancePath?: string;
  schemaPath?: string;
  keyword?: string;
  message?: string;
  params?: Record<string, unknown>;
}

/** The precompiled validator: returns true on a valid SaveBlob, else false and sets `.errors`. */
export interface SaveBlobSchemaValidator {
  (data: unknown): boolean;
  errors?: SchemaValidationErrorObject[] | null;
}

declare const validate: SaveBlobSchemaValidator;
export default validate;
export { validate };
