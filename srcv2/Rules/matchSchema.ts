import { getType } from "../Helpers/getType";
import { SchemaOptionsHelper } from "../SchemaOptionsHelper";
import { MetaDataRule, ResultCheckRule } from "../Validator/type";

export function matchSchema(value: any, options: any, meta: MetaDataRule): ResultCheckRule {
  const DEFAULT_MESSAGE = "is not match schema";
  if (getType(value) !== "object") return { valid: true };
  if (!meta.validationOptions.isFullMatch) return { valid: true };
  const keys = Object.keys(value ?? {});
  const schemaProps = SchemaOptionsHelper.getChilds(meta.schema).map((e) => e.key);
  const matchSchema = keys.filter((e) => !schemaProps.includes(e)).length === 0;

  if (matchSchema) return { valid: true };
  else return { valid: false, message: DEFAULT_MESSAGE };
}
