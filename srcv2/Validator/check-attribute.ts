import { BaseRuleOptions, SchemaOptions } from "../type";
import { DescriptionAttribute, ResultCheckRule, ResultValidate, ValidateOption } from "./type";
import { rules } from "../Rules";

const MustCheckRule = ["required", "matchSchema"];
/**
 * Check attribute by list rules.
 */
export function checkAttribute(
  attribute: any,
  schema: SchemaOptions,
  description: DescriptionAttribute,
  validationOptions: ValidateOption
): ResultValidate {
  const listRules = rules as any;
  const ruleNames = Object.keys(listRules);
  const schemOpts = schema as any;

  for (let i = 0; i < ruleNames.length; i++) {
    const ruleName = ruleNames[i];
    if (schemOpts[ruleName] || MustCheckRule.includes(ruleName)) {
      const result = listRules[ruleName](attribute, schemOpts[ruleName], {
        schema,
        validationOptions,
      }) as ResultCheckRule;
      const baseRuleOpts = schemOpts[ruleName] as BaseRuleOptions;

      const message = (description.attributeName ?? "value") + " " + result.message;

      if (result.forceSkip) return { valid: true, errors: [] };
      if (!result.valid) {
        return {
          valid: false,
          errors: [
            {
              ...description,
              ruleName,
              message: baseRuleOpts?.message
                ? baseRuleOpts.message({
                    message,
                    propertyValue: attribute,
                    ruleName,
                    propertyName: description.attributeName,
                  })
                : message,
            },
          ],
        };
      }
    }
  }

  return { valid: true, errors: []};
}
