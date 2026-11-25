import { ModelFieldDefinition, validatePresence } from "components-care";

/**
 * validatePresence for a localized string field: refuses it while no language
 * has a text. Which languages the backend needs on top of that (e.g. the
 * app's default language) it checks itself.
 */
const validateLocalizedPresence = (
  value: Record<string, string> | null,
  values: Record<string, unknown>,
  fieldDef: Pick<ModelFieldDefinition<never, never, never, never>, "getLabel">,
) => {
  const filled =
    !!value &&
    Object.values(value).some(
      (text) => typeof text === "string" && text.trim() !== "",
    );
  return filled ? null : validatePresence(null, values, fieldDef);
};

export default validateLocalizedPresence;
