# graphql-playground

project to learn and experiment with [graphql](https://graphql.org/) using [Apollo](https://www.apollographql.com/)

## server

* location - `src/server'
* run - `npm start`

## Examples

Run via GraphiQL @ <http://localhost:3000/graphiql>

```js
query {
  books {
    id,
    title,
    author
  }
}

mutation {
  createBook(id: "2", title: "How To", author: "John Doe") {
    id,
    title
    author
  }
}
```

