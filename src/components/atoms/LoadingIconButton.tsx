import { CircularProgress, IconButton, IconButtonProps } from '@mui/material';
import React, { useState } from 'react';

interface IProps extends Omit<IconButtonProps, 'onClick'> {
    loading?: boolean;
    onClick: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => Promise<any>;
}

const LoadingIconButton = ({ onClick, children, loading: iLoading, ...rest }: IProps) => {
    const [sLoading, setLoading] = useState(false);
    const loading = sLoading || iLoading;

    const handleClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        setLoading(true);
        onClick(e).finally(() => setLoading(false));
    };

    return (
        <IconButton disabled={loading} {...rest} onClick={handleClick}>
            {loading ? <CircularProgress size={24} /> : children}
        </IconButton>
    );
};

LoadingIconButton.defaultProps = {
    loading: false,
};

export default LoadingIconButton;
