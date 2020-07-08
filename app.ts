import { Application } from "https://deno.land/x/oak/mod.ts";
import { GraphQLService } from './schema.ts';

const app = new Application();
const gqlService = await GraphQLService('/graphql');
app.use(gqlService.routes(), gqlService.allowedMethods());

console.log("Server start at http://localhost:8080");
await app.listen({ port: 8080 });