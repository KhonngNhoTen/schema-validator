declare function require(name: string): any;
const clone = require("clone") as Function;

import { AttributeDescriptionHelper } from "./AttributeDescriptionHelper";
import {
  AttributeDescription,
  BaseAttributeDescription,
  DataAttributeTraversal,
  DataType,
  LeftMerge,
  WrapType,
} from "./type";
export class Schema<T> {
  static ARRAY_KEYWORD = "$_array_item_$";

  private description: T;
  private rules: Record<string, BaseAttributeDescription>;

  //#region GETTER
  public get Description(): T {
    return this.description;
  }

  public get Rules(): Record<string, BaseAttributeDescription> {
    return this.rules;
  }
  //#endregion

  constructor(attributeDescription?: AttributeDescription<T>, description?: T) {
    if (description) this.description = description;
    if (!attributeDescription) return;
    this.rules = this.createRule(attributeDescription);
  }

  /**
   * Create keys list rule for validation
   */
  private createRule(attributeDescription: AttributeDescription<T>) {
    const rules: Record<string, BaseAttributeDescription> = {};
    const createRule = (data: DataAttributeTraversal<T>) => {
      if (data.path) rules[data.path] = AttributeDescriptionHelper.defaultAttributeDescription(data.attribute);
    };
    AttributeDescriptionHelper.attributeTraversal(attributeDescription, createRule);

    return rules;
  }

  /**
   * Method set rule required for list of attributes
   * @param {string | string[]} paths - The path to specify the attribute
   * @param {boolean} required - True is required, false is optional
   */
  private setRequired(paths: string[] | string, required: boolean) {
    if (!Array.isArray(paths)) paths = [paths];

    for (let i = 0; i < paths.length; i++) {
      const path = paths[i];
      if (!this.rules[path]) throw new Error(`Attribute ${path} not found.`);
      this.rules[path].required = required;
    }
  }

  /**
   * Method to set require of attribute or list of attribute to false.
   * @param {string | string[]} paths - The path to specify the attribute
   */
  optional(paths: string[] | string) {
    this.setRequired(paths, false);
    return this;
  }

  /**
   * Method to set require of attribute or list of attribute to true.
   * @param {string | string[]} paths - The path to specify the attribute
   */
  required(paths: string[] | string) {
    this.setRequired(paths, true);
    return this;
  }

  /**
   * Remove attribute or list of attributes by paths
   */
  remove<U>(paths: string[] | string) {
    const schema = this.copy<U extends object ? LeftMerge<T, U> : T>();

    paths = this.formatPath(paths);
    for (let i = 0; i < paths.length; i++) {
      const path = paths[i];
      if (!schema.rules[path]) throw new Error(`Not found attribute "${path}"`);
      delete schema.rules[path];
      delete schema.description[path];
    }

    return schema;
  }

  wrap<U>(wrap: string) {
    const { rules, rootExample, leafExample, paths } = AttributeDescriptionHelper.createByPath(wrap);

    Array.isArray(leafExample)
      ? leafExample.push(this.description)
      : (leafExample[paths.length - 1] = this.description);

    const schema = this.copy<U extends object ? WrapType<U, T> : T>(
      rootExample as U extends object ? WrapType<U, T> : T
    );
    schema.rules = { ...schema.rules, ...rules };
    return schema;
  }

  add<U>(path: string, field: DataType | BaseAttributeDescription, description?: U | undefined) {
    const desc = { ...this.description, ...(description ?? {}) } as U extends undefined ? T : T & U;
    const schema = this.copy<U extends undefined ? T : T & U>(desc);
    const { rules } = AttributeDescriptionHelper.createByPath(path);
    schema.rules = { ...schema.rules, ...rules };

    return schema;
  }

  setRule(path: string, field: DataType | BaseAttributeDescription) {
    const schema = this.copy<T>();
    schema.rules[path] = AttributeDescriptionHelper.defaultAttributeDescription(field);
    return schema;
  }

  merge<U>(t: Schema<U>) {
    const schema = this.copy<T & U>();
    schema.description = { ...this.description, ...t.Description } as T & U;
    schema.rules = { ...this.rules, ...t.rules };
    return schema;
  }

  private formatPath(path: string | string[]) {
    if (!Array.isArray(path)) return [path];
    return path;
  }
  private copy<U extends object | T>(desc?: U) {
    const schema = new Schema<U>(undefined, desc);
    if (!desc)
      schema.description = (
        Array.isArray(this.description)
          ? [...this.description]
          : typeof this.description === "object"
          ? { ...this.description }
          : desc
      ) as U;
    schema.rules = { ...this.rules };

    return schema;
  }

  /** Create new Schema from current schema */
  clone() {
    return clone(this) as Schema<T>;
  }
}
