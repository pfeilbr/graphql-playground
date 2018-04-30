import { graphiqlExpress, graphqlExpress } from "apollo-server-express"
import bodyParser from "body-parser"
import express from "express"
import { makeExecutableSchema } from "graphql-tools"

// Some fake data
const books = [
  {
    id: 0,
    title: "Harry Potter and the Sorcerer's stone",
    author: "J.K. Rowling",
  },
  {
    id: 1,
    title: "Jurassic Park",
    author: "Michael Crichton",
  },
]

// The GraphQL schema in string form
const typeDefs = `
  type Query { books: [Book],  oneBook: Book }
  type Book { id: ID!, title: String, author: String }
  type Mutation { createBook(id:String, title:String, author:String): Book}
`

// The resolvers
const resolvers = {
  Query: {
    books: () => books,
    oneBook: () => books[0],
  },
  Mutation: {
    createBook: (root: any, arg: { id: string, title: string, author: string } | any) => {
      const book = {id: arg.id, title: arg.title, author: arg.author}
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

// Initialize the app
const app = express()

// The GraphQL endpoint
app.use("/graphql", bodyParser.json(), graphqlExpress({ schema }))

// GraphiQL, a visual editor for queries
app.use("/graphiql", graphiqlExpress({ endpointURL: "/graphql" }))

// Start the server
app.listen(3000, () => {
  console.log("Go to http://localhost:3000/graphiql to run queries!");
})
