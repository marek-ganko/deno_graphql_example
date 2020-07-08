import { Request, Response } from "https://deno.land/x/oak/mod.ts";
import { applyGraphQL, gql, GQLError } from "https://deno.land/x/oak_graphql/mod.ts";

// simulates retained data
let counter = 0;

const typeDefs = (gql as any)`
type Query {
  hello: String!
  helloText(txt: String!): String!
  helloObject(obj: HelloInput!): HelloType!
}

type Mutation {
  add: Int!
  addNum(num: Int!): Int!
  addObject(obj: AddInput!): AddType
}

input HelloInput {
  a: String
  b: String
}

type HelloType {
  a: String
  b: String
  ab: String
}

input AddInput {
  a: Int
  b: Int
}

type AddType {
  a: Int
  b: Int
  ab: Int
}
`;

// to show that we can manipulate req and res objects in the context
const handleContext = (ctx: any, handlerName: string) => {
  const agent: string = ctx.req.headers.get('User-Agent');
  ctx.res.headers.set('handler', `${agent.toLowerCase().replace('/', '-')}-${handlerName}`);
};

const resolvers = {
  Query: {
    hello: (parent: any, { }: any, context: any, info: any) => {
      handleContext(context, 'hello');
      return "world";
    },
    helloText: (parent: any, { txt }: any, context: any, info: any) => {
      handleContext(context, 'hello-text');
      return `${txt} world`;
    },
    helloObject: (parent: any, { obj: { a, b } }: any, context: any, info: any) => {
      handleContext(context, 'hello-object');
      return { a, b, ab: `${a} ${b}` };
    },
  },
  Mutation: {
    add: (parent: any, { }: any, context: any, info: any) => {
      handleContext(context, 'add');
      counter = counter + 1;
      return counter;
    },
    addNum: (parent: any, { num }: any, context: any, info: any) => {
      handleContext(context, 'add-num');
      if (num < 1)
        throw new GQLError({ type: "Invalid value for x" });

      counter = counter + num;
      return counter;
    },
    addObject: (parent: any, { obj: { a, b } }: any, context: any, info: any) => {
      handleContext(context, 'add-object');
      if (a < 1)
        throw new GQLError({ type: "Invalid value for a" });

      if (b < 1)
        throw new GQLError({ type: "Invalid value for b" });

      return { a, b, ab: a + b };
    },
  },
};

export const GraphQLService = async (path: string) => {
  return await applyGraphQL({
    path,
    typeDefs,
    resolvers,
    context: (ctx) => {
      return {
        req: ctx.request,
        res: ctx.response
      };
    }
  });
};
