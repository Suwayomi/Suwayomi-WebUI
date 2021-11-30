/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import React, { useEffect, useState, CSSProperties } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/system/Box';
import { Theme } from '@mui/system/createTheme';
import { SxProps } from '@mui/system/styleFunctionSx';

interface IProps {
    src: string
    alt: string

    imgRef?: React.RefObject<HTMLImageElement>

    spinnerStyle?: SxProps<Theme>
    imgStyle?: CSSProperties

    onImageLoad?: () => void
}

export default function SpinnerImage(props: IProps) {
    const {
        src, alt, onImageLoad, imgRef, spinnerStyle, imgStyle,
    } = props;
    const [imageSrc, setImagsrc] = useState<string>('');

    useEffect(() => {
        const img = new Image();
        img.src = src;

        img.onload = () => {
            setImagsrc(src);
            onImageLoad?.();
        };

        img.onerror = () => {
            // Setting to an actual image so CSS styling works consistently
            setImagsrc('/notFound.svg');
        };

        return () => {
            img.onload = null;
            img.onerror = null;
        };
    }, [src]);

    if (imageSrc.length === 0) {
        return (
            <Box sx={spinnerStyle}>
                <CircularProgress thickness={5} />
            </Box>
        );
    }

    if (imageSrc === 'Not Found') {
        return <Box sx={spinnerStyle} />;
    }

    return (
        <img
            style={imgStyle}
            ref={imgRef}
            src={imageSrc}
            alt={alt}
        />
    );
}

SpinnerImage.defaultProps = {
    spinnerStyle: {},
    imgStyle: {},
    onImageLoad: () => {},
    imgRef: undefined,
};
