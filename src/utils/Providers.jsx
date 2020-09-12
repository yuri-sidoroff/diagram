import React from 'react';
import { isEmpty, reverse } from 'lodash';

const Providers = ({ components, children }) => {
    if (isEmpty(components)) return children;
    return reverse(components)
        .reduce((sum, Provider) => <Provider>{sum}</Provider>, children);
};

export default Providers;
