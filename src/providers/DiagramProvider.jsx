import React from 'react';
import { observer, useLocalStore } from 'mobx-react';
import DiagramContext from '../context/DiagramContext';
import DiagramState from '../state/DiagramState';

function DiagramProvider({ children }) {
    const data = useLocalStore(() => new DiagramState());

    return (
        <DiagramContext.Provider value={data}>
            {children}
        </DiagramContext.Provider>
    );
}

export default observer(DiagramProvider);
