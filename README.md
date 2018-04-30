# graphql-playground

project to learn and experiment with [graphql](https://graphql.org/) using [Apollo](https://www.apollographql.com/)

## server

* location - `src/server'
* run - `npm start`

## client

* location - `src/client'
* run - `npm start`

> ensure server is running

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
  createBook(title: "How To", author: "John Doe") {
    id,
    title
    author
  }
}
```

## Scratch

```



```