import validator from "validator";
import { ResultCheckRule } from "../Validator/type";
import { IsAlphanumericRuleOptions } from "../type";

export function isAlphanumeric(str: string, options?: IsAlphanumericRuleOptions): ResultCheckRule {
  const DEFAULT_MESSAGE = "should be ascii";
  if (validator.isAlphanumeric(str, options?.locale)) return { valid: true };
  return { valid: false, message: DEFAULT_MESSAGE };
}
