import { Schema } from "../srcv2/Schema";


interface IUserSchema {
    name: string;
    age: number;
    props: {
        prop1: string;
        prop2: number;
    },
    items: number[];
    item2: {test: string}[]
}


describe('Unittest Schema class', () => {
    describe('Test create rules method', () => {
        const userSchema = new Schema<IUserSchema>({
            type: "object", attributes: {
                age: "number",
                name: {
                    type: "string"
                },
                props: {
                    type: "object",
                    attributes: {
                        prop1: "string",
                        prop2: "number"
                    }
                },
                items: {
                    type: "array",
                    item: "number"
                },
                item2: {
                    type: "array",
                    item: {
                        type: "object",
                        attributes: {
                         test: "string"
                        }
                    }
                }
            }
        });
        test('1. ', () => {
            const rules = userSchema.Rules;
            const keys = Object.keys(rules)
            expect(keys).toContainEqual("name")
            expect(keys).toContainEqual("age")
            expect(keys).toContainEqual("props")
            expect(keys).toContainEqual("props.prop1")
            expect(keys).toContainEqual("props.prop1")
            expect(keys).toContainEqual("items")
            expect(keys).toContainEqual("items.*")
            expect(keys).toContainEqual("item2");  
            expect(keys).toContainEqual("item2.*");  
            expect(keys).toContainEqual("item2.*.test");  
            

            expect(rules["name"]).toEqual( {type: { type: 'string' }, required: undefined });
            expect(rules["age"]).toEqual( { type: { type: 'number' }, required: undefined });
            expect(rules["props"]).toEqual({
                type: { type: 'object' },
                required: undefined
            });
            expect(rules["props.prop1"]).toEqual({ type: { type: 'string' }, required: undefined });
            expect(rules["item2"]).toEqual({ type: { type: 'array' }, required: undefined})
            expect(rules["item2.*"]).toEqual({  type: { type: 'object' }, required: undefined})
            expect(rules["item2.*.test"]).toEqual( { type: { type: 'string' }, required: undefined });

        })
    });
})