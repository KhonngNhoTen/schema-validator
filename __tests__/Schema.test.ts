import { Schema } from "../srcv2/Schema";

interface IUserSchema {
  name: string;
  age: number;
  props: {
    prop1: string;
    prop2: number;
  };
  items: number[];
  item2: { test: string }[];
}

describe("Unittest Schema class", () => {
  describe("Test create rules method", () => {
    const userSchema = new Schema<IUserSchema>(
      {
        type: "object",
        attributes: {
          age: "number",
          name: {
            type: "string",
          },
          props: {
            type: "object",
            attributes: {
              prop1: "string",
              prop2: "number",
            },
          },
          items: {
            type: "array",
            item: "number",
          },
          item2: {
            type: "array",
            item: {
              type: "object",
              attributes: {
                test: "string",
              },
            },
          },
        },
      },
      {
        name: "name",
        age: 1,
        item2: [{ test: "test" }],
        items: [1],
        props: { prop1: "prop1", prop2: 1 },
      }
    );
    test("1. ", () => {
      const rules = userSchema.Rules;
      const keys = Object.keys(rules);
      expect(keys).toContainEqual("name");
      expect(keys).toContainEqual("age");
      expect(keys).toContainEqual("props");
      expect(keys).toContainEqual("props.prop1");
      expect(keys).toContainEqual("props.prop1");
      expect(keys).toContainEqual("items");
      expect(keys).toContainEqual("items.*");
      expect(keys).toContainEqual("item2");
      expect(keys).toContainEqual("item2.*");
      expect(keys).toContainEqual("item2.*.test");

      expect(rules["name"]).toEqual({ type: { type: "string" }, required: undefined });
      expect(rules["age"]).toEqual({ type: { type: "number" }, required: undefined });
      expect(rules["props"]).toEqual({
        type: { type: "object" },
        required: undefined,
      });
      expect(rules["props.prop1"]).toEqual({ type: { type: "string" }, required: undefined });
      expect(rules["item2"]).toEqual({ type: { type: "array" }, required: undefined });
      expect(rules["item2.*"]).toEqual({ type: { type: "object" }, required: undefined });
      expect(rules["item2.*.test"]).toEqual({ type: { type: "string" }, required: undefined });
    });

    test("2 Test remove methods", () => {
      const schema = userSchema.remove<{ name: string }>("name");

      expect(Object.keys(schema.Rules)).not.toContainEqual("name");
      expect(schema.Description).toEqual({
        age: 1,
        item2: [{ test: "test" }],
        items: [1],
        props: { prop1: "prop1", prop2: 1 },
      });
    });

    test("3 Test Add methods", () => {
      const schema = userSchema.add("test.t", "number", { test: { t: 1 } });
      expect(Object.keys(schema.Rules)).toContainEqual("test.t");
      //   expect(Object.keys(schema.Rules)).toContainEqual("test");
      expect(schema.Description).toEqual({
        name: "name",
        age: 1,
        item2: [{ test: "test" }],
        items: [1],
        props: { prop1: "prop1", prop2: 1 },
        test: { t: 1 },
      });
    });

    // test("4 Test remove methods: remove deep attributes", () => {
    //   const schema1 = userSchema.add("a.b.c", "number", { a: { b: { c: 1 } } });
    //   const schema2 = schema1.remove<{ a: { b: object } }>("a.b.c");

    //   expect(Object.keys(schema2.Rules)).not.toContainEqual("a.b.c");
    //   expect(schema2.Description).toEqual({
    //     age: 1,
    //     name: "name",
    //     item2: [{ test: "test" }],
    //     items: [1],
    //     props: { prop1: "prop1", prop2: 1 },
    //   });
    // });

    test("5 Test wrap methods", () => {
      const schema = userSchema.wrap<{ a: { b: object } }>("a.b");

      const rules = schema.Rules;
      const keys = Object.keys(rules);
      expect(keys).toContainEqual("a.b.name");
      expect(keys).toContainEqual("a.b.age");
      expect(keys).toContainEqual("a.b.props");
      expect(keys).toContainEqual("a.b.props.prop1");
      expect(keys).toContainEqual("a.b.props.prop1");
      expect(keys).toContainEqual("a.b.items");
      expect(keys).toContainEqual("a.b.items.*");
      expect(keys).toContainEqual("a.b.item2");
      expect(keys).toContainEqual("a.b.item2.*");
      expect(keys).toContainEqual("a.b.item2.*.test");
      expect(schema.Description).toEqual({
        a: {
          b: {
            age: 1,
            name: "name",
            item2: [{ test: "test" }],
            items: [1],
            props: { prop1: "prop1", prop2: 1 },
          },
        },
      });
    });
  });
});
