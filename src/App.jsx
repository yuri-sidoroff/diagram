import React from 'react';
import {
    Route, Redirect, BrowserRouter, Switch,
} from 'react-router-dom';
import Providers from './utils/Providers';
import Diagram from './pages/Diagram';
import DiagramProvider from './providers/DiagramProvider';
import './App.css';

function App() {
    return (
        <Providers
            components={[
                BrowserRouter,
                Switch,
                DiagramProvider,
            ]}
        >
            <Route exact path="/diagram" component={Diagram} />
            <Redirect from="/" to="/diagram" />
        </Providers>
    );
}

export default App;
