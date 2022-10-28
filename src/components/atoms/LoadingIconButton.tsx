import { CircularProgress, IconButton, IconButtonProps } from '@mui/material';
import React, { useState } from 'react';

interface IProps extends Omit<IconButtonProps, 'onClick'> {
    onClick: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => Promise<any>
}

const LoadingIconButton = ({ onClick, children, ...rest }: IProps) => {
    const [loading, setLoading] = useState(false);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        setLoading(true);
        onClick(e).finally(() => setLoading(false));
    };

    return (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <IconButton disabled={loading} {...rest} onClick={handleClick}>
            {loading ? (<CircularProgress size={24} />) : children}
        </IconButton>
    );
};

export default LoadingIconButton;
