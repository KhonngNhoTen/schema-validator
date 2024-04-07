import validator from "validator";
import { IsAlphaRuleOptions } from "../type";
import { ResultCheckRule } from "../Validator/type";

export function isAlpha(str: string, options?: IsAlphaRuleOptions): ResultCheckRule {
  const DEFAULT_MESSAGE = "should be alpha";
  if (validator.isAlpha(str, options?.locale)) return { valid: true };
  return { valid: false, message: DEFAULT_MESSAGE };
}
