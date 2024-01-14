/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import React, { useState, CSSProperties, useEffect } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { Theme, SxProps, Stack, Button } from '@mui/material';

import BrokenImageIcon from '@mui/icons-material/BrokenImage';
import RefreshIcon from '@mui/icons-material/Refresh';

interface IProps {
    src: string;
    alt: string;

    imgRef?: React.RefObject<HTMLImageElement>;

    spinnerStyle?: SxProps<Theme>;
    imgStyle?: CSSProperties;

    onImageLoad?: () => void;
}

export function SpinnerImage(props: IProps) {
    const { src, alt, onImageLoad, imgRef, spinnerStyle, imgStyle } = props;

    const [imgLoadRetryKey, setImgLoadRetryKey] = useState(0);
    const [isLoading, setIsLoading] = useState<boolean | undefined>(undefined);
    const [hasError, setHasError] = useState(false);

    const updateImageState = (loading: boolean, error: boolean = false) => {
        setIsLoading(loading);
        setHasError(error);

        if (!loading && !error) {
            onImageLoad?.();
        }
    };

    useEffect(() => {
        // only activate the loading state in case the image has not been cached yet.
        // otherwise, the loading placeholder will always be visible before the actual image is shown, which looks like flickering
        const timeout = setTimeout(() => setIsLoading((prevState) => (prevState === undefined ? true : prevState)), 1);
        return () => clearTimeout(timeout);
    }, []);

    return (
        <>
            {(isLoading || hasError) && (
                <Box sx={spinnerStyle}>
                    <Stack height="100%" alignItems="center" justifyContent="center">
                        {isLoading && <CircularProgress thickness={5} />}
                        {hasError && (
                            <>
                                <BrokenImageIcon />
                                <Button
                                    startIcon={<RefreshIcon />}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        setIsLoading(true);
                                        setHasError(false);
                                        setImgLoadRetryKey((prevState) => (prevState + 1) % 100);
                                    }}
                                    size="large"
                                >
                                    Retry
                                </Button>
                            </>
                        )}
                    </Stack>
                </Box>
            )}
            <img
                key={`${src}_${imgLoadRetryKey}`}
                style={{ ...imgStyle, display: isLoading || hasError ? 'none' : undefined }}
                ref={imgRef}
                src={src}
                alt={alt}
                onLoad={() => updateImageState(false)}
                onError={() => updateImageState(false, true)}
                draggable={false}
            />
        </>
    );
}

SpinnerImage.defaultProps = {
    spinnerStyle: {},
    imgStyle: {},
    onImageLoad: () => {},
    imgRef: undefined,
};
