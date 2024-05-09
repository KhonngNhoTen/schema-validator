import { Schema } from "./Schema";
import {
  AttributeDescription,
  BaseAttributeDescription,
  DataAttributeTraversal,
  DataType,
  RequiredRuleOptions,
  TypeRuleOptions,
  isDataType,
} from "./type";
export class AttributeDescriptionHelper {
  /**
   * Travel all attribute in schema and callback when find attribute.
   */
  static attributeTraversal<T>(
    root: AttributeDescription<T>,
    callback: (data: DataAttributeTraversal<T>) => void,
    data?: DataAttributeTraversal<T>
  ) {
    callback(data ?? { attribute: root });
    const attribute = data?.attribute ?? root;

    if (this.havingChild(attribute))
      this.getChilds(attribute).forEach((child) => {
        const childKey = child.key === Schema.ARRAY_KEYWORD ? "*" : child.key;
        this.attributeTraversal(root, callback, {
          attribute: child.attribute,
          attributeName: childKey,
          parentAttribute: data?.attribute,
          parentAttributeName: data?.attributeName,
          path: data?.path ? data.path + "." + childKey : childKey,
        });
      });
  }

  /**
   * Get all sub-attribute in current attribute.
   * If current attribute is array, then childs-schema is "item".
   * If current attribute is object, then childs-schema is "attributes".
   */

  static getChilds<T>(attributes: AttributeDescription<T>): { key: string; attribute: BaseAttributeDescription }[] {
    if (attributes.type === "object")
      return Object.keys(attributes.attributes!).map((e) => ({ key: e, attribute: attributes.attributes![e] }));
    if (attributes.type === "array")
      return [{ key: Schema.ARRAY_KEYWORD, attribute: attributes.item as BaseAttributeDescription }];
    return [];
  }

  /**
   * Check current attribute is container.
   * A Container-attribute is have type, is "object" or "array"
   */
  static havingChild<T>(attribute: AttributeDescription<T>) {
    return attribute.type === "array" || attribute.type === "object";
  }

  /** Convert Data type and any rule options to BaseAttributeDescription with full options */
  static defaultAttributeDescription(attribute: DataType | BaseAttributeDescription) {
    attribute = isDataType(attribute) ? { type: { type: attribute } } : { ...attribute };

    const type: TypeRuleOptions = isDataType(attribute.type) ? { type: attribute.type } : attribute.type;

    let requried: RequiredRuleOptions | undefined = undefined;

    if ((attribute as any).attributes) delete (attribute as any).attributes;
    if ((attribute as any).item) delete (attribute as any).item;

    if (attribute.required === true) requried = {};
    else if (attribute.required) requried = attribute.required;

    attribute.type = type;
    attribute.required = requried;
    return attribute;
  }

  static createByPath(path: string) {
    const paths = path.split(".");
    if (paths.length === 0) throw new Error(`Path ${path} is empty`);

    let currentExample: any[] | {} = path[0] === "*" ? [] : {};
    const rootExample = currentExample;
    let currentPath: string = paths[0];
    let rules = {
      [currentPath]:
        path[0] === "*" ? this.defaultAttributeDescription("array") : this.defaultAttributeDescription("object"),
    };

    let example: [] | {};

    for (let i = 1; i < paths.length; i++) {
      example = path[i] === "*" ? [] : {};
      currentPath += "." + paths[i];
      Array.isArray(currentExample) ? currentExample.push(example) : (currentExample[path] = example);

      currentExample = example;
      rules[currentPath] =
        path[0] === "*" ? this.defaultAttributeDescription("array") : this.defaultAttributeDescription("object");
    }

    console.log(rules);
    return { rules, rootExample, leafExample: currentExample, paths };
  }
}
