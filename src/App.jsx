import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import Providers from './utils/Providers';
import Diagram from './pages/Diagram';
import './App.css';

function App() {
    return (
        <Providers components={[]}>
            <Route exact path="/diagram" component={Diagram} />
            <Redirect from="/" to="/diagram" />
        </Providers>
    );
}

export default App;
