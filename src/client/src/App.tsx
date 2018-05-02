import * as React from 'react';
import './App.css';

import logo from './logo.svg';

import ApolloClient, { gql } from "apollo-boost";
// import gql from "graphql-tag";
import { ApolloProvider } from "react-apollo";
import { Mutation, Query } from "react-apollo";

const client = new ApolloClient({
  request: async (operation) => {
    const token = "my-secret-auth-token" // await AsyncStorage.getItem('token');
    operation.setContext({
      headers: {
        authorization: token
      }
    });
  },
  uri: "http://localhost:3000/graphql",  
});

const GET_BOOKS = gql`
{
  books {
    id,
    title,
    author,
  }
}
`

// manual example
client
  .query({
    query: GET_BOOKS
  })
  .then(result => console.log(result));

  const Books = () => (
    <div style={{border: "solid 1px black"}}>
    <h1>Books</h1>
    <Query
      query={GET_BOOKS}
    >
      {({ loading, error, data }) => {
        if (loading) { return <p>Loading...</p>; }
        if (error) { return <p>Error :(</p>; }
  
        return data.books.map(({ id, title, author }: any) => (
          <div key={id}>
            <p>{`${title}: ${author}`}</p>
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
      // tslint:disable-next-line:jsx-no-lambda
      update={(cache, { data: { createBook } }) => {
        const { books }: any = cache.readQuery({ query: GET_BOOKS });
        console.log("books", books) // cached books
        console.log("addBook", createBook) // newly created book
        cache.writeQuery({
          data: { books: books.concat([createBook]) },          
          query: GET_BOOKS,
        });
      }}
    >
      {(addBook, { data }) => (
        <div>
          <form
            // tslint:disable-next-line:jsx-no-lambda
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
            
            <button type="submit">Add Book</button>
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
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro">
          To get started, edit <code>src/App.tsx</code> and save to reload.
        </p>
        <Books />
        <AddBook />
      </div>
      </ApolloProvider>
    );
  }
}

export default App;
