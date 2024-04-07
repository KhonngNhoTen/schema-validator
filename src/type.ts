import { CustomMessage } from "./Validator/type";
import { VauleParser } from "./Validator/valueParser";
export type BaseRuleOptions = { message?: CustomMessage };
export type DataType = "string" | "number" | "boolean" | "object" | "array";

export type IsEmailRuleOptions = BaseRuleOptions & { emailOption?: validator.IsEmailOptions };
export type IsUrlRuleOptions = BaseRuleOptions & { urlOptions?: validator.IsURLOptions };
export type IsAlphaRuleOptions = BaseRuleOptions & {locale?:validator.AlphaLocale};
export type IsAlphanumericRuleOptions = BaseRuleOptions & {locale?:validator.AlphanumericLocale};
export type RequiredRuleOptions = BaseRuleOptions;
export type TypeRuleOptions = BaseRuleOptions & { type: DataType };

export type InputSchema = {
  type: TypeRuleOptions | DataType;
  description?: string;
  properties?: Record<string, InputSchema | DataType>;
  item?: InputSchema | DataType;
  required?: RequiredRuleOptions | boolean;

  isEmail?: IsEmailRuleOptions | boolean;
  isAscii?: boolean | BaseRuleOptions;
  isAlpha?: boolean | BaseRuleOptions;
  isAlphanumeric?: boolean | BaseRuleOptions;
  isEmpty?: boolean | BaseRuleOptions;
  isUrl?: IsUrlRuleOptions | boolean;
  isRgbColor?: boolean | BaseRuleOptions;
  isMD5?: boolean | BaseRuleOptions;

  transform?: "string" |  VauleParser

  length?: number;
  range?: { gte?: any; gt?: any; lte?: any; lt?: any; message: string | string[] };

  enum?: any[];
  actions?: [(data: any) => any];
};

export type SchemaOptions = {
  type: TypeRuleOptions;
  description?: string;
  properties?: Record<string, SchemaOptions>;
  item?: SchemaOptions;
  required?: RequiredRuleOptions;

  isEmail?: IsEmailRuleOptions;
  isAscii?: BaseRuleOptions;
  isAlpha?: IsAlphaRuleOptions;
  isAlphanumeric?: IsAlphanumericRuleOptions;
  isEmpty?: BaseRuleOptions;
  isUrl?: IsUrlRuleOptions;
  isRgbColor?: BaseRuleOptions;
  isMD5?: BaseRuleOptions;

  transform?: "string" |  VauleParser

  length?: number;
  range?: { gte?: any; gt?: any; lte?: any; lt?: any; message: string | string[] };

  enum?: any[];
  actions?: [(data: any) => any];
};

export type DataSchemaTraversal = {
  schema: SchemaOptions;
  schemaName?: string;
  parentSchema?: SchemaOptions;
  parentSchemaName?: string;
  traversingAllField?: boolean;
  wildcards?: string[];
  deepth?: number;
};
