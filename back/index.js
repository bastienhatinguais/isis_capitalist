const express = require("express");
const { ApolloServer, gql } = require("apollo-server-express");
const typeDefs = require("./schema");
const resolvers = require("./resolvers");
const world = require("./world.ts");

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => ({
    world: await readUserWorld(req.headers["x-user"]),
    user: req.headers["x-user"],
  }),
});
const app = express();
app.use(express.static("public"));

server.start().then((res) => {
  server.applyMiddleware({ app });
  app.listen({ port: 4000 }, () =>
    console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
  );
});

function readUserWorld(user) {
  try {
    const data = fs.readFileSync(`userworlds/${user}-world.json`);
    return JSON.parse(data);
  } catch (e) {
    return world;
  }
}
