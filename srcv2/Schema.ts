declare function require(name: string): any;
const clone = require("clone") as Function;

import { AttributeDescriptionHelper } from "./AttributeDescriptionHelper";
import { AttributeDescription, BaseAttributeDescription, DataAttributeTraversal, DataType } from "./type";
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
 
  
  constructor(attributeDescription?: AttributeDescription<T>) {
    if(!attributeDescription) return;
    this.rules = this.createRule(attributeDescription);
  }

  /**
   * Create keys list rule for validation
   */
  private createRule(attributeDescription: AttributeDescription<T>) {
    const rules: Record<string, BaseAttributeDescription> = {}
    const createRule = (data: DataAttributeTraversal<T>) => {
      if(data.path)
        rules[data.path] = AttributeDescriptionHelper.defaultAttributeDescription(data.attribute);
    };
    AttributeDescriptionHelper.attributeTraversal(attributeDescription, createRule);

    return rules;
  }

  /**
   * Method set rule required for list of attributes
   * @param {string | string[]} paths - The path to specify the attribute
   * @param {boolean} required - True is required, false is optional
   */
  private setRequired(paths: string[]|string, required: boolean) {
    if(!Array.isArray(paths)) paths = [paths];

    for (let i = 0; i < paths.length; i++) {
      const path = paths[i];
      if(!this.rules[path]) throw new Error(`Attribute ${path} not found.`);
      this.rules[path].required = required;
    }
  }

  
  /**
   * Method to set require of attribute or list of attribute to false.
   * @param {string | string[]} paths - The path to specify the attribute
   */
  optional(paths: string[]|string) {
    this.setRequired(paths, false);
    return this;
  }

  /**
   * Method to set require of attribute or list of attribute to true.
   * @param {string | string[]} paths - The path to specify the attribute
   */
  required(paths: string[]|string) {
    this.setRequired(paths, true);
    return this;
  }

  /**
   * Remove attribute or list of attributes by paths
   */
  remove<DeletedAttributes>(paths: string[]|string) {
    for (let i = 0; i < paths.length; i++) {
      const path = paths[i];
      if(!this.rules[path]) throw new Error(`Not found attribute "${path}"`);
      delete this.rules[path];
      delete this.description[path];
    }

    const schema = new Schema<Omit<T, keyof DeletedAttributes>>();
    schema.description = this.description;
    schema.rules = this.rules;
    return schema;
  }


  add<U>(paths: string, field: Schema<U> | DataType | BaseAttributeDescription, description: U|undefined) {
    this.Rules
  }

  /** Create new Schema from current schema */
  clone() {
    return clone(this) as Schema<T>; 
  }

  
}
