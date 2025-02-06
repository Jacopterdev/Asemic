// src/components/Container.jsx
import PropTypes from 'prop-types';

function Container({ children }) {

    return <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>{children}</div>;
}

// Define prop types
Container.propTypes = {
    children: PropTypes.node.isRequired, // `node` covers any renderable content
};


export default Container;
