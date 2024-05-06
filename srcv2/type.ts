import { CustomMessage } from "./Validator/type";
import { VauleParser } from "./Validator/valueParser";
export type BaseRuleOptions = { message?: CustomMessage };
export type DataType = "string" | "number" | "boolean" | "object" | "array";

export const DataTypeValue = {
  string: "",
  number: 0,
  boolean: false,
  object: {},
  array: [],
};

export type IsEmailRuleOptions = BaseRuleOptions & { emailOption?: validator.IsEmailOptions };
export type IsUrlRuleOptions = BaseRuleOptions & { urlOptions?: validator.IsURLOptions };
export type IsAlphaRuleOptions = BaseRuleOptions & { locale?: validator.AlphaLocale };
export type IsAlphanumericRuleOptions = BaseRuleOptions & { locale?: validator.AlphanumericLocale };
export type RequiredRuleOptions = BaseRuleOptions;
export type TypeRuleOptions = BaseRuleOptions & { type: DataType };

export interface BaseAttributeDescription {
  type: TypeRuleOptions | DataType;
  description?: string;
  required?: RequiredRuleOptions | boolean;

  isEmail?: IsEmailRuleOptions | boolean;
  isAscii?: boolean | BaseRuleOptions;
  isAlpha?: boolean | BaseRuleOptions;
  isAlphanumeric?: boolean | BaseRuleOptions;
  isEmpty?: boolean | BaseRuleOptions;
  isUrl?: IsUrlRuleOptions | boolean;
  isRgbColor?: boolean | BaseRuleOptions;
  isMD5?: boolean | BaseRuleOptions;

  range?: { gte?: any; gt?: any; lte?: any; lt?: any; message: string | string[] };
  length?: number;

  transform?: "string" | VauleParser;
  enum?: any[];
  actions?: [(data: any) => any];
}

// interface BaseAttributeDescription {
//   type: TypeRuleOptions | DataType;
//   description?: string;
//   required?: RequiredRuleOptions | boolean;

//   transform?: "string" | VauleParser;

//   enum?: any[];
//   actions?: [(data: any) => any];
// }

interface NumberAttributeDescription extends BaseAttributeDescription {
  range?: { gte?: any; gt?: any; lte?: any; lt?: any; message: string | string[] };
  length?: number;
  type: "number" | (BaseRuleOptions & { type: "number" });
}

interface StringAttributeDescription extends BaseAttributeDescription {
  isEmail?: IsEmailRuleOptions | boolean;
  isAscii?: boolean | BaseRuleOptions;
  isAlpha?: boolean | BaseRuleOptions;
  isAlphanumeric?: boolean | BaseRuleOptions;
  isEmpty?: boolean | BaseRuleOptions;
  isUrl?: IsUrlRuleOptions | boolean;
  isRgbColor?: boolean | BaseRuleOptions;
  isMD5?: boolean | BaseRuleOptions;
  type: "string" | (BaseRuleOptions & { type: "string" });
}

export interface AttributeDescription<T> extends BaseAttributeDescription {
  attributes?: {
    [K in keyof T]: T[K] extends object
      ? AttributeDescription<T[K]>
      : // : T[K] extends string
        // ? StringAttributeDescription | DataType
        // : T[K] extends number
        // ? NumberAttributeDescription | DataType
        // : BaseAttributeDescription | DataType;
        BaseAttributeDescription | DataType;
  };
}

interface userSchema {
  name: string;
  age: number;
  props: {
    prop1: string;
  };
}

const attributes: AttributeDescription<userSchema> = {
  type: "object",
  attributes: {
    props: {
      type: "object",
      attributes: {
        prop1: {
          type: "string",
        },
      },
    },
    age: "number",
    name: "string",
  },
};

export type DataAttributeTraversal<T> = {
  attribute: AttributeDescription<T>;
  attributeName?: string;
  parentSchema?: AttributeDescription<T>;
  parentSchemaName?: string;
};

type LeftMergePrimitiveKey<T, U> = Omit<T, Extract<keyof T, keyof U>>;

type PrimitivesType = string | boolean | number;
type ObjectMergeFull<T, U> = keyof U extends never ? never : Exclude<keyof T, keyof U> extends never ? never : object;
type CheckMergeFull<T, U> = T extends object
  ? ObjectMergeFull<T, U>
  : T extends any[]
  ? U extends any[]
    ? ObjectMergeFull<T[0], U[0]>
    : never
  : never;

export type LeftMerge<T, U> = {
  [K in Extract<keyof T, keyof U> as T[K] extends PrimitivesType
    ? never
    : CheckMergeFull<T[K], U[K]> extends never
    ? never
    : K]: T[K] extends PrimitivesType
    ? never
    : CheckMergeFull<T[K], U[K]> extends never
    ? never
    : LeftMerge<T[K], U[K]>;
} & LeftMergePrimitiveKey<T, U>;
