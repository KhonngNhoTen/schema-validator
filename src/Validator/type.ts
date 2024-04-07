import { SchemaOptions } from "../type";
import { VauleParser } from "./valueParser";

export type DescriptionAttribute = {
  attributeName?: string;
  attributeValue: any;
  path: string;
  ruleName?: string;
};

export type ValidateErrorDetail = {
  message: string;
} & DescriptionAttribute;

export type ResultCheckRule = {
  message?: string;
  valid: boolean;
  forceSkip?: boolean;
};

export type ResultValidate = {
  valid: boolean;
  errors: ValidateErrorDetail[];
  value?: any;
};

export type ValidateOption = {
  /** Cancel checking when error exist */
  abortEarly?: boolean;
  
  /** Allow "value" to have properties other than Schema */
  isFullMatch?: boolean;
  
  /** Global function convert data */
  transformValue?: "string" | VauleParser
};

export type CustomMessageOptions = {
  message: string;
  propertyName?: string;
  propertyValue: string;
  ruleName: string;
};

export type MetaDataRule = {
  schema: SchemaOptions;
  validationOptions: ValidateOption;
};

export type CustomMessage = (data: CustomMessageOptions) => string;
