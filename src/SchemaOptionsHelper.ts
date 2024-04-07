import { isDataType, isSchemaOption } from "./helper";
import { getType } from "./Helpers/getType";
import { Schema } from "./Schema";
import {
  DataSchemaTraversal,
  DataType,
  InputSchema,
  RequiredRuleOptions,
  SchemaOptions,
  TypeRuleOptions,
} from "./type";

export class SchemaOptionsHelper {
  /**
   * Check current schema is container-schema.
   * A Container-schema is have type, is "object" or "array"
   */
  static haveChilds(schema: SchemaOptions | InputSchema) {
    return SchemaOptionsHelper.checkType(schema, "object") || SchemaOptionsHelper.checkType(schema, "array");
  }

  /**
   * Get childs-schema in current schema.
   * If current schema is array, then childs-schema is "item".
   * If current schema is object, then childs-schema is "properties".
   */
  static getChilds(schema: SchemaOptions): { child: SchemaOptions; key: string }[] {
    if (!SchemaOptionsHelper.haveChilds(schema)) {
      //throw new Error(`Only schema "object" and "array" have childs`);
      return [];
    }
    const result: { child: SchemaOptions; key: string }[] = [];
    if (SchemaOptionsHelper.checkType(schema, "array") && schema.item) {
      const child = isSchemaOption(schema.item) ? schema.item : SchemaOptionsHelper.defaultSchema(schema.item);
      result.push({ child, key: Schema.ARRAY_KEYWORD });
    } else if (SchemaOptionsHelper.checkType(schema, "object") && schema.properties) {
      for (const [key, value] of Object.entries(schema.properties)) {
        const child = isSchemaOption(value) ? value : SchemaOptionsHelper.defaultSchema(value);
        result.push({ child, key });
      }
    }
    return result;
  }

  /**
   * Add childs in current schema
   */
  static addChild(schema: SchemaOptions | InputSchema, key: string, child: SchemaOptions | InputSchema) {
    if (SchemaOptionsHelper.checkType(schema, "array")) schema.item = child;

    if (SchemaOptionsHelper.checkType(schema, "object")) {
      if (!schema.properties) schema.properties = {};
      schema.properties[key] = child;
    }

    return schema;
  }

  /**
   * Remove child in schema
   */
  static removeChild(schema?: SchemaOptions | InputSchema, key?: string) {
    if (!schema || !key) return false;
    if (SchemaOptionsHelper.checkType(schema, "object")) throw new Error("Method only support for object-type");
    if (schema.properties && schema.properties[key]) {
      delete schema.properties[key];
      return true;
    }

    return false;
  }

  /**
   * Create a Schema by a inputSchema or DataType
   * Default value:
   * - type: input.type or input
   * - requried: undefine
   */
  static defaultSchema(input: InputSchema | DataType) {
    input = isDataType(input) ? { type: { type: input } } : input;

    const type: TypeRuleOptions = isDataType(input.type) ? { type: input.type } : input.type;

    let requried: RequiredRuleOptions | undefined = undefined;
    if (input.required === true) requried = {};
    else if (input.required) requried = input.required;

    input.type = type;
    input.required = requried;
    return input as SchemaOptions;
  }

  /**
   * Check type of schema
   */
  static checkType(schema: InputSchema | SchemaOptions, type: DataType) {
    if (isSchemaOption(schema)) return schema.type.type === type;
    const myType = schema.type;
    if (isDataType(myType) && myType === type) return true;
    else if (!isDataType(myType) && myType?.type === type) return true;
  }

  /**
   * Convert InputSchema or DataType to SchemaOptions
   */
  static inputSchema2SchemaOptions(input: InputSchema | DataType): SchemaOptions {
    if (isDataType(input)) return SchemaOptionsHelper.defaultSchema(input);

    const result = SchemaOptionsHelper.defaultSchema(input);
    if (SchemaOptionsHelper.haveChilds(result))
      SchemaOptionsHelper.getChilds(input as SchemaOptions).forEach((child, i) => {
        // result.type.type === "array"
        //   ? (result.item = SchemaOptionsHelper.inputSchema2SchemaOptions(child.child))
        //   : result.properties;
        SchemaOptionsHelper.addChild(result, child.key, SchemaOptionsHelper.inputSchema2SchemaOptions(child.child));
      });

    return result;
  }

  /**
   * Convert Object into SchemaOptions
   */
  static compile(data: any): SchemaOptions {
    const type = getType(data);
    const schema: SchemaOptions = { ...SchemaOptionsHelper.defaultSchema(type) };

    if (type === "object") {
      for (const [key, value] of Object.entries(data))
        SchemaOptionsHelper.addChild(schema, key, SchemaOptionsHelper.compile(value));
    } else if (type === "array") SchemaOptionsHelper.addChild(schema, "0", SchemaOptionsHelper.compile(data[0]));
    return schema;
  }

  /**
   * Travel all attribute in schema and callback when find attribute.
   */
  static schemaTraveral(data: DataSchemaTraversal, callBack?: (data: DataSchemaTraversal) => void) {
    if (SchemaOptionsHelper.haveChilds(data.schema))
      SchemaOptionsHelper.getChilds(data.schema).forEach((child) => {
        if (callBack)
          SchemaOptionsHelper.schemaTraveral(
            {
              schema: child.child,
              schemaName: child.key,
              parentSchema: data.schema,
              parentSchemaName: data.schemaName,
              deepth: data.deepth ? data.deepth + 1 : undefined,
            },
            callBack
          );
      });

    if (callBack) callBack(data);
  }

  /**
   * Find attribute by path. When find attribute, call onFindAttribute function.
   * If not exist, onNotFound is trigged
   */
  static findAttribute(
    path: string,
    data: DataSchemaTraversal,
    onFindAttribute?: (data: DataSchemaTraversal) => void,
    onNotFound?: (data: DataSchemaTraversal) => void,
    wildcards?: string[]
  ) {
    if (!wildcards || wildcards.length === 0) wildcards = path.split(".");
    const key = wildcards.pop() ?? "";
    data.wildcards = wildcards;
    const ALL_FIELD = "*";

    if (data.schemaName === key && onFindAttribute) {
      onFindAttribute(data);
      return;
    }
    data.traversingAllField = key === ALL_FIELD;

    if (data.traversingAllField) {
      if (SchemaOptionsHelper.haveChilds(data.schema))
        SchemaOptionsHelper.getChilds(data.schema).forEach((child) => {
          SchemaOptionsHelper.findAttribute(
            path,
            {
              schema: child.child,
              schemaName: child.key,
              parentSchema: data.schema,
              parentSchemaName: data.schemaName,
              traversingAllField: data.traversingAllField,
            },
            onFindAttribute,
            onNotFound,
            wildcards
          );

          if (data.traversingAllField && onFindAttribute) onFindAttribute(data);
        });
      if (onNotFound) onNotFound(data);
    } else {
      if (data.schema.properties && data.schema.properties[key])
        SchemaOptionsHelper.findAttribute(
          path,
          {
            schema: data.schema.properties[key],
            schemaName: key,
            parentSchema: data.schema,
            parentSchemaName: data.schemaName,
            traversingAllField: data.traversingAllField,
          },
          onFindAttribute,
          onNotFound,
          wildcards
        );
      else if (onNotFound) onNotFound(data);
    }
  }

  /**
   * Merge target schema into source schema, copy all properties in target into source scheam
   * @example
   * source = {a: {b}}
   * target = {a: {c}}
   * result of merge = {a : { b, c }}
   *
   * @param source - Source schema is container
   * @param target - childs schema is added container
   */
  static merge(source: SchemaOptions, target: SchemaOptions) {
    const targetChilds = SchemaOptionsHelper.getChilds(target);
    const sourceChilds = SchemaOptionsHelper.getChilds(source);

    for (let i = 0; i < targetChilds.length; i++) {
      const targetChild = targetChilds[i];
      const index = sourceChilds.findIndex((e) => e.key === targetChild.key);
      if (index > 0) SchemaOptionsHelper.merge(sourceChilds[index].child, targetChild.child);
      else SchemaOptionsHelper.addChild(source, targetChild.key, targetChild.child);
    }

    return source;
  }

  /**
   * Copy one or all properties from the source schema.
   * If you want to copy all properties from the source, use the "*" keyword.
   * If you want to copy partial data from the source, use an absolute path. EX: "a.b.c"
   * @example
   * source = {a: {b: {c,d}}}
   * 1. stringPath = *
   *    result = source
   * 2. stringPath = "a.b.c"
   *    result = {a: {b: {c}}}
   *
   * @param source - create new schema from source
   * @param stringPath - part of source is coppied. "*" is copy whole source
   * @param paths - Array of path key from stringPath. Default is stringPath.split(".")
   */
  static copy(stringPath: string, source: SchemaOptions, paths?: string[]) {
    paths = paths ?? stringPath.split(".").reverse();

    source = { ...source };
    const result = { ...source };
    delete result.properties;
    delete result.item;

    const key = paths.pop();
    const isAllField = key === Schema.ARRAY_SYMBOL;
    if (isAllField) {
      SchemaOptionsHelper.getChilds(source).forEach((child) => {
        if (paths?.length !== 0)
          SchemaOptionsHelper.addChild(result, child.key, SchemaOptionsHelper.copy(stringPath, child.child, paths));
      });
    } else {
      if (!source.properties || !key || source.properties[key] === undefined)
        throw new Error(`Not found attribute ${key} by path = "${stringPath}"`);
      let coppiedSchema = source.properties[key];
      if (paths?.length > 0) coppiedSchema = SchemaOptionsHelper.copy(stringPath, source.properties[key], paths);
      SchemaOptionsHelper.addChild(result, key, coppiedSchema);
    }

    return result;
  }

  /** Wrap current SchemaOption by blank schema */
  static wrap(path: string, schema: SchemaOptions) {
    const keys = path.split(".");

    let newSchema ;
    let rootSchema;
    for (let i = 0; i < keys.length ; i++) {
      const key = keys[i];
      const cloneSchema = SchemaOptionsHelper.defaultSchema(key === Schema.ARRAY_SYMBOL ? "array" : "object");
      if(i === 0 )rootSchema=cloneSchema;
      if(newSchema) SchemaOptionsHelper.addChild(newSchema, key, cloneSchema);
      newSchema = cloneSchema;
    }

    if(!rootSchema || !newSchema) return schema;
    SchemaOptionsHelper.addChild(newSchema,keys[keys.length-1], schema);


    return rootSchema;
  }
}
