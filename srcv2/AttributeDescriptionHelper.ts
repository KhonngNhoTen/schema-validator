import { AttributeDescription, BaseAttributeDescription, DataAttributeTraversal } from "./type";
export class AttributeDescriptionHelper {
  static attributeTraversal<T>(
    attributeDescription: AttributeDescription<T>,
    callback: (data: DataAttributeTraversal<T>) => void
  ) {
    Object.keys(attributeDescription.attributes ?? {}).map((e) => {
      callback({ attribute: attributeDescription.attributes![e], attributeName: e });
    });
  }
}
