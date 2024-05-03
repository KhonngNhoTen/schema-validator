declare function require(name: string): any;

const clone = require("clone") as Function;

import { DataSchemaTraversal, DataType, InputSchema, SchemaOptions } from "./type";

import { isInputSchema } from "./helper";
import { rules } from "./Rules/index";
import { SchemaOptionsHelper } from "./SchemaOptionsHelper";
import { stringify } from "querystring";

export class Schema {
  private validations: SchemaOptions;
  private examples?: Record<string, any>;

  static ARRAY_SYMBOL = "*";
  static ARRAY_KEYWORD = "$_array_item_$";

  //#region Setter and Getter
  get Validations() {
    return this.validations;
  }

  get Examples() {
    return this.examples;
  }

  //#endregion

  constructor(schema?: Record<string, any> | InputSchema) {
    if(!schema) return;
    if (isInputSchema(schema)) this.validations = SchemaOptionsHelper.inputSchema2SchemaOptions(schema);
    else this.validations = SchemaOptionsHelper.compile(schema);
  }

  /**
   * Method set rule required for list of field
   * @param {string | string[]} paths - The path string to specify the field
   * @param {boolean} required - True is required, false is optional
   */
  private setRequired(paths: string[] | string, required: boolean) {
    if (!Array.isArray(paths)) paths = [paths];

    const setOptional = (data: DataSchemaTraversal) => (data.schema.required = required ? {} : undefined);
    for (let i = 0; i < paths.length; i++)
      SchemaOptionsHelper.findAttribute(paths[i], { schema: this.validations }, setOptional);
  }

  /**
   * Set required = false for fields.
   * @param {string | string[]} paths - The path string to specify the field
   * @example
   * Suppose the schema's structure mapping is: '{node: { id: 1, types: [{value:0}]} }'.
   * To set optional for "id" field, path string is: "node.id".
   * To set optional for "types" field, path string is: "node.types.*.value".
   */
  optional(paths: string[] | string) {
    this.setRequired(paths, false);
    return this;
  }

  /**
   * Set required = true for fields.
   * @param {string | string[]} paths - The path string to specify the field
   * @example
   * Suppose the schema's structure mapping is: '{node: { id: 1, types: [{value:0}]} }'.
   * To set required for "id" field, path string is: "node.id".
   * To set required for "types" field, path string is: "node.types.*.value".
   */
  required(paths: string[] | string) {
    this.setRequired(paths, true);
    return this;
  }

  /**
   * Remove field in schema instance
   * @param {string | string[]} paths - The path string to specify the field
   */
  remove(paths: string[] | string) {
    if (!Array.isArray(paths)) paths = [paths];

    const removeAttribute = (data: DataSchemaTraversal) => {
      SchemaOptionsHelper.removeChild(data.parentSchema, data.schemaName);
    };
    for (let i = 0; i < paths.length; i++)
      SchemaOptionsHelper.findAttribute(paths[i], { schema: this.Validations }, removeAttribute);
    return this;
  }

  /**
   * Select attributes in schema instance.
   * Attribute not included in the fields will be ignored
   * @param {string | string[]} paths - The path string to specify the field
   */
  attribute(paths: string[]) {
    let outSchema = null;
    for (let i = 0; i < paths.length; i++) {
      const selectedSchema = SchemaOptionsHelper.copy(paths[i], this.Validations);
      if (!outSchema) outSchema = selectedSchema;
      else outSchema = SchemaOptionsHelper.merge(outSchema, selectedSchema);
    }
    if (outSchema) this.validations = outSchema;
    return this;
  }

  /**
   * Add a field in schema instance. Field can is schema instance or InputSchema.
   * Required: parent's filed must be object type.
   */
  add(field: InputSchema | DataType | Schema, path: string) {
    field = field instanceof Schema ? field.Validations : field;

    const addCallBack = ({ parentSchema, schema, wildcards }: DataSchemaTraversal) => {
      if (!parentSchema || !SchemaOptionsHelper.checkType(parentSchema, "object"))
        throw new Error("Method only support for object-type");
      let tempSchema: SchemaOptions = parentSchema;

      for (let i = 0; wildcards && i < wildcards.length; i++) {
        const wildcard = wildcards[i];
        const isArrayType = wildcard === Schema.ARRAY_KEYWORD;

        let childOption: InputSchema | DataType =
          i < wildcards.length - 1 ? (isArrayType ? "array" : "object") : (field as InputSchema | DataType);

        let newChild: SchemaOptions = SchemaOptionsHelper.defaultSchema(childOption);

        SchemaOptionsHelper.addChild(tempSchema, wildcard, newChild);
        tempSchema = newChild;
      }
    };

    SchemaOptionsHelper.findAttribute(path, { schema: this.Validations }, undefined, addCallBack);
    return this;
  }

  /**
   * Update a option for rule, If rule not exists in field. Rule will added in field.
   */
  setRule(rules: InputSchema | DataType, paths: string | string[]) {
    const _rules: SchemaOptions = SchemaOptionsHelper.inputSchema2SchemaOptions(rules);
    const setRuleCallback = (data: DataSchemaTraversal) => {
      data.schema = {
        ...data.schema,
        ..._rules,
      };
    };

    if (!Array.isArray(paths)) paths = [paths];
    for (let i = 0; i < paths.length; i++)
      SchemaOptionsHelper.findAttribute(paths[i], { schema: this.Validations }, setRuleCallback);

    return this;
  }

  /** Remove list of rule in field */
  deleteRule(ruleNames: (keyof typeof rules)[], paths: string | string[]) {
    const removeRuleCallback = (data: DataSchemaTraversal) => {
      ruleNames.forEach((ruleName) => {
        if ((data.schema as any)[ruleName]) delete (data.schema as any)[ruleName];
      });
    };

    if (!Array.isArray(paths)) paths = [paths];
    for (let i = 0; i < paths.length; i++)
      SchemaOptionsHelper.findAttribute(paths[i], { schema: this.Validations }, removeRuleCallback);

    return this;
  }

  /** Merge tow schema to one schema */
  merge(schema: Schema) {
    this.validations = SchemaOptionsHelper.merge(this.Validations, schema.Validations);
    return this;
  }

  /** Copy new schmea */
  clone() {
    return clone(this) as Schema;
  }

  /** Wrap current SchemaOptions by string  */
  wrap(path: string) {
    this.validations = SchemaOptionsHelper.wrap(path, this.Validations);
    return this;
  }
}
