import * as React from 'react';
import './App.css';

import logo from './logo.svg';

import ApolloClient from "apollo-boost";
import gql from "graphql-tag";
import { ApolloProvider } from "react-apollo";
import { Query } from "react-apollo";

const client = new ApolloClient({
  uri: "http://localhost:3000/graphql"
});

// manual example
client
  .query({
    query: gql`
      {
        books {
          id,
          title,
          author,
        }
      }
    `
  })
  .then(result => console.log(result));

  const Books = () => (
    <div style={{border: "solid 1px black"}}>
    <h1>Books</h1>
    <Query
      query={gql`
        {
          books {
            id,
            title,
            author,
          }
        }
      `}
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
      </div>
      </ApolloProvider>
    );
  }
}

export default App;
