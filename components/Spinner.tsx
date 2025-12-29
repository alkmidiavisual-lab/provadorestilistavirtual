
import React from 'react';

interface SpinnerProps {
    size?: 'main' | 'small';
}

const Spinner: React.FC<SpinnerProps> = ({ size = 'main' }) => {
    const sizeClass = size === 'main' ? 'spinner-main' : 'spinner-small';
    return <div className={`rounded-full border-4 border-t-4 ${sizeClass}`}></div>;
};

export default Spinner;
