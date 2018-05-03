import { graphiqlExpress, graphqlExpress } from "apollo-server-express"
import bodyParser from "body-parser"
import cors from "cors"
import express from "express"
import { execute, subscribe } from "graphql"
import { PubSub } from "graphql-subscriptions"
import { makeExecutableSchema } from "graphql-tools"
import { createServer } from "http"
import morgan from "morgan"
import { SubscriptionServer } from "subscriptions-transport-ws"
import url from "url"
import uuidv4 from "uuid/v4"

const PORT = 3000
export const pubsub = new PubSub()

// Some fake data
const books = [
  {
    id: uuidv4(),
    title: "Harry Potter and the Sorcerer's stone",
    author: "J.K. Rowling",
  },
  {
    id: uuidv4(),
    title: "Jurassic Park",
    author: "Michael Crichton",
  },
]

// The GraphQL schema in string form
const typeDefs = `
  type Query { books: [Book],  oneBook: Book }
  type Book { id: ID!, title: String, author: String }
  type Mutation { createBook(title:String, author:String): Book}
  type Subscription { bookAdded: Book }
`

// The resolvers
const resolvers = {
  Query: {
    books: () => books,
    oneBook: () => books[0],
  },
  Mutation: {
    createBook: (root: any, arg: {title: string, author: string } | any, context: any) => {
      console.log("context", context)
      const book = {id: uuidv4(), title: arg.title, author: arg.author}
      books.push(book)
      pubsub.publish("bookAdded", { bookAdded: book })
      return book
    },
  },
  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator("bookAdded"),
    },
  },
}

// Put together a schema
const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
})

const app = express()

app.use(morgan(":method :url :req[authorization]"))
app.use(cors())

app.use(
  "/graphql",
  bodyParser.json(),
  graphqlExpress((req) => {
    // fetch user example / authenticate here. e.g. req.headers["authorization"]
    const user = {id: 0, username: "johndoe"}
    return {
      schema,
      context: {
        user,
      },
    }
  }))

// GraphiQL, a visual editor for queries
app.use("/graphiql", graphiqlExpress((req) => ({
  endpointURL: "/graphql",
  subscriptionsEndpoint: url.format({
    host: req!.get("host"),
    protocol: req!.protocol === "https" ? "wss" : "ws",
    pathname: "/subscriptions",
  }),
})))

const ws = createServer(app)

// app.listen(PORT, () => {
//   console.log("Go to http://localhost:3000/graphiql to run queries!")
// })

ws.listen(PORT, () => {
  console.log(`Apollo Server is now running on http://localhost:${PORT}`)
  console.log(`Go to http://localhost:${PORT}/graphiql to run queries!`)
  // Set up the WebSocket for handling GraphQL subscriptions
  new SubscriptionServer({
    execute,
    subscribe,
    schema,
    onConnect: (connectionParams: any, webSocket: any, context: any) => {
      console.log("onConnect", "connectionParams", connectionParams)
    },
    onOperation: (message: any, params: any, webSocket: any) => {
      console.log("onOperation", "message", message, "params", params)
      return {}
    },
    onOperationComplete: (webSocket: any) => {
      console.log("onOperationComplete")
    },
    onDisconnect: (webSocket: any, context: any) => {
      console.log("onDisconnect")
    },
  }, {
    server: ws,
    path: "/subscriptions",
  })
})
