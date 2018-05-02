import { graphiqlExpress, graphqlExpress } from "apollo-server-express"
import bodyParser from "body-parser"
import cors from "cors"
import express from "express"
import { makeExecutableSchema } from "graphql-tools"
import morgan from "morgan"
import uuidv4 from "uuid/v4"

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
      return book
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
app.use("/graphiql", graphiqlExpress({ endpointURL: "/graphql" }))

app.listen(3000, () => {
  console.log("Go to http://localhost:3000/graphiql to run queries!")
})
