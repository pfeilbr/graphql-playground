import * as React from 'react';
import './App.css';

// import ApolloClient, { gql } from "apollo-boost";
import { InMemoryCache } from "apollo-cache-inmemory";
import { ApolloClient } from "apollo-client";
import { split } from "apollo-link";
import { setContext } from "apollo-link-context";
import { HttpLink } from "apollo-link-http";
import { WebSocketLink } from "apollo-link-ws";
import { getMainDefinition } from "apollo-utilities";
import { DocumentNode, OperationDefinitionNode } from "graphql";
import gql from "graphql-tag"
import { ApolloProvider } from "react-apollo";
import { Mutation, Query } from "react-apollo";

// Create an http link:
const httpLink = new HttpLink({
  uri: 'http://localhost:3000/graphql'
});

// set "Authorization" header on each request to server
// see https://www.apollographql.com/docs/react/recipes/authentication.html#Header
const authLink = setContext((_, { headers }) => {
  // get the authentication token from local storage if it exists
  // const token = localStorage.getItem('token');
  const token = "my-secret-auth-token"
  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    }
  }
});

// Create a WebSocket link:
const wsLink = new WebSocketLink({
  uri: `ws://localhost:3000/subscriptions`,
  options: {
    reconnect: true,
    connectionParams: {
      authToken: "my-secret-auth-token",
  },    
  }
});

// using the ability to split links, you can send data to each link
// depending on what kind of operation is being sent
const link = split(
  // split based on operation type
  ({ query }) => {
    const { kind, operation } = getMainDefinition(query as DocumentNode) as OperationDefinitionNode;
    return kind === 'OperationDefinition' && operation === 'subscription';
  },
  wsLink,
  authLink.concat(httpLink),
);

const client = new ApolloClient({
  link,
  cache: new InMemoryCache(),
});

// const client = new ApolloClient({
//   request: async (operation) => {
//     const token = "my-secret-auth-token" // await AsyncStorage.getItem('token');
//     operation.setContext({
//       headers: {
//         authorization: token
//       }
//     });
//   },
//   uri: "http://localhost:3000/graphql",  
// });

const GET_BOOKS = gql`
query {
  books {
    id,
    title,
    author,
  }
}
`

// manual query example
client
  .query({
    query: GET_BOOKS
  })
  .then(result => console.log(result));


class BookSubscriptions extends React.Component<any, any, any> {

  constructor(props: any) {
    super(props);
    this.state = {books: []};
  }  
    
  public render() {
    return (
      <div>
        <h3>Book Subscriptions (GraphQL Subscription)</h3>
        <ul>
        {this.state.books.map((book: any) =>
          <li key={book.id}>Title: {book.title} Author: {book.author}</li>
        )}
        </ul>
      </div>
    )
  }

  public componentWillMount() {
    const that = this
    // manual subscribe example
    client.subscribe({
      query: gql`
        subscription onBookAdded {
          bookAdded {
            id
            title
            author
          }
        }`,
      variables: {}
    }).subscribe({
      next (data) {
        console.log("data", data)
        that.setState((prev: any) => {
          return Object.assign(prev, {books: prev.books.concat([data.data.bookAdded])})
        })
      }
    });
  }

}

  const Books = () => (
    <div style={{border: "solid 1px black"}}>
    <h3>Books</h3>
    <Query
      query={GET_BOOKS}
    >
      {({ loading, error, data }) => {
        if (loading) { return <p>Loading...</p>; }
        if (error) { return <p>Error :(</p>; }
  
        return data.books.map(({ id, title, author }: any) => (
          <div key={id}>
            <p>{`Title:${title} Author:${author}`}</p>
          </div>
        ));
      }}
    </Query>
    </div>
  );

  const ADD_BOOK = gql`
  mutation addBook($title: String!, $author: String!) {
    createBook(title: $title, author: $author) {
      id
      title
      author
    }
  }
`;

const AddBook = () => {
  let titleInput: any;
  let authorInput: any;

  return (
    <Mutation
      mutation={ADD_BOOK}
      update={(cache, { data: { createBook } }) => {
        const { books }: any = cache.readQuery({ query: GET_BOOKS });
        // console.log("books", books) // cached books
        // console.log("addBook", createBook) // newly created book
        cache.writeQuery({
          data: { books: books.concat([createBook]) },          
          query: GET_BOOKS,
        });
      }}
    >
      {(addBook, { data }) => (
        <div style={{border: "solid 1px black", padding: "40px"}}>
        <h3>Add Book</h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              addBook({ variables: { title: titleInput.value, author: authorInput.value } });
              titleInput.value = "";
              authorInput.value = ""
            }}
          >
            Title: <input
              ref={node => {
                titleInput = node;
              }}
            />
            Author: <input
              ref={node => {
                authorInput = node;
              }}
            />
            
            <button type="submit">Add</button>
          </form>
        </div>
      )}
    </Mutation>
  );
};  

class App extends React.Component {
  public render() {
    return (
      <ApolloProvider client={client}>
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Apollo GraphQL Playground</h1>
        </header>
        <p className="App-intro">
          Example usage of Apollo GraphQL
        </p>
        <AddBook />        
        <Books />
        <BookSubscriptions />
      </div>
      </ApolloProvider>
    );
  }
}

export default App;
