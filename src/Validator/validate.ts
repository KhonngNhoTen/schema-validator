import { Schema } from "../Schema";
import { SchemaOptionsHelper } from "../SchemaOptionsHelper";
import { transform } from "./valueParser";
import { SchemaOptions } from "../type";
import { checkAttribute } from "./check-attribute";
import { DescriptionAttribute, ResultValidate, ValidateOption } from "./type";
import { getType } from "../Helpers/getType";

/**
 * Check value.
 * If value is object, the function check properties.
 * If value is array, the function check item (value[0])
 */
// function check(
//   value: any,
//   schema: SchemaOptions,
//   options: ValidateOption,
//   descriptionAttribute?: DescriptionAttribute
// ): ResultValidate {
//   const description = descriptionAttribute ?? { attributeValue: value, path: '"value"', attributeName: '"value"' };
//   const result = checkAttribute(value, schema, description);

//   if (result.valid && schema.properties) {
//     const fieldNames = Object.keys(schema.properties);
//     for (let i = 0; i < fieldNames.length; i++) {
//       const fieldName = fieldNames[i];
//       const attribute = value !== undefined && value[fieldName] !== undefined ? value[fieldName] : undefined;

//       const checAttribute = check(attribute, schema.properties[fieldName], options, {
//         attributeValue: attribute,
//         attributeName: fieldName,
//         path: description.path + "." + fieldName,
//       });

//       if (!checAttribute.valid) {
//         result.valid = false;
//         result.errors.push(...checAttribute.errors);
//         if (options.abortEarly) return result;
//       }
//     }
//   } else if (result.valid && schema.item) {
//     const attribute = value !== undefined && value[0] !== undefined ? value[0] : undefined;
//     const checkItem = checkAttribute(attribute, schema.item, {
//       attributeValue: attribute,
//       attributeName: "*",
//       path: description.path + ".*",
//     });

//     if (!checkItem.valid) {
//       result.valid = false;
//       result.errors.push(...checkItem.errors);
//       if (options.abortEarly) return result;
//     }
//   }

//   return result;
// }

function getValue(value: any, key: string) {
  if (getType(value) === "object") {
    return value[key];
  }

  if (getType(value) === "array") {
    return value[0];
  }

  return undefined;
}

function check(
  value: any,
  schema: SchemaOptions,
  options: ValidateOption,
  descriptionAttribute?: DescriptionAttribute
): ResultValidate {
  

  const description = descriptionAttribute ?? { attributeValue: value, path: '"value"', attributeName: '"value"' };
  const result = checkAttribute(value, schema, description, options);

  if (result.valid) {
    SchemaOptionsHelper.getChilds(schema).every((child) => {
      const key = child.key === Schema.ARRAY_KEYWORD ? undefined : child.key;
      const resultCheck = check(getValue(value, child.key), child.child, options, {
        attributeValue: getValue(value, child.key),
        attributeName: key,
        path: description.path + "." + key,
      });
      if (!resultCheck.valid) {
        result.valid = false;
        result.errors.push(...resultCheck.errors);
        if (options.abortEarly) return false;
      }

      return true;
    });
  };

  return result;
}

/**
 * Function validate value
 */
export function validate(value: any, schema: Schema, options?: ValidateOption) {
  
 value = transform(value, schema.Validations,options);

  options = { ...{ isFullMatch: false, abortEarly: false }, ...options };
  const result: ResultValidate = check(value, schema.Validations, options);
  result.value = value

  return result;
}
