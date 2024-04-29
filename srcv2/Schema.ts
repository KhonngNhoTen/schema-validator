import { AttributeDescriptionHelper } from "./AttributeDescriptionHelper";
import { AttributeDescription, BaseAttributeDescription, DataAttributeTraversal } from "./type";
export class Schema<T> {
  attributes: AttributeDescription<T>;
  description: T;

  rules: Record<string, BaseAttributeDescription>;
  constructor(attributeDescription: AttributeDescription<T>) {
    this.attributes = attributeDescription;
  }

  createRule(attributeDescription: AttributeDescription<T>) {
    const createRule = (data: DataAttributeTraversal<T>) => {
      this.rules[data.attributeName!] = data.attribute;
    };
    AttributeDescriptionHelper.attributeTraversal(attributeDescription, createRule);
  }
}
