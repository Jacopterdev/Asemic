// src/components/Button.jsx
import PropTypes from 'prop-types';

function Button({ onClick, children}) {
    return (
        <button
            onClick={onClick}
        >
            {children}
        </button>
    );
}

// Define prop types
Button.propTypes = {
    children: PropTypes.node.isRequired, // `node` covers any renderable content
    onClick: PropTypes.func.isRequired,
};

export default Button;
