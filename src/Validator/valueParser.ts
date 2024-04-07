import validator from "validator";
import { SchemaOptions } from "../type";
import { SchemaOptionsHelper } from "../SchemaOptionsHelper";
import { Schema } from "../Schema";
import { ValidateOption } from "./type";

export type VauleParser = (value: any) => any;


export const STR2VALUE = {
  "object": (value: string) => value ? JSON.parse(value) : undefined,
  "array": (value: string) => value ? JSON.parse(value) : undefined,
  "number": (value: string) => value ? parseInt(value) : undefined,
  "string": (value: string) => value,
  "date": (value: string) => value ? validator.toDate(value) : undefined,
  "boolean": (value: string) => value !== undefined ? value === "true" : value
}

export function transform(value: any, schema: SchemaOptions, validateOption?: ValidateOption) {
  
  let transformFunc = schema.transform ?? validateOption?.transformValue;
  if (transformFunc && (schema.type.type !== "object" && schema.type.type !== "array"))
    value = transformFunc === "string" ? (STR2VALUE as any)[schema.type.type](value) : transformFunc(value);
  SchemaOptionsHelper.getChilds(schema).forEach(childs => {
    if (childs.key === Schema.ARRAY_KEYWORD) childs.key = "0";
    value[childs.key] = transform(value[childs.key], childs.child,validateOption);
  });

  return value;
}