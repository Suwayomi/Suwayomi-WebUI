/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import React, { useEffect, useState } from 'react';
import CircularProgress from '@mui/material/CircularProgress';

interface IProps {
    src: string
    alt: string

    imgRef?: React.RefObject<HTMLImageElement>

    spinnerClassName?: string
    imgClassName?: string

    onImageLoad?: () => void
}

export default function SpinnerImage(props: IProps) {
    const {
        src, alt, onImageLoad, imgRef, spinnerClassName, imgClassName,
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
            <div className={spinnerClassName}>
                <CircularProgress thickness={5} />
            </div>
        );
    }

    if (imageSrc === 'Not Found') {
        return <div className={spinnerClassName} />;
    }

    return (
        <img
            className={imgClassName}
            ref={imgRef}
            src={imageSrc}
            alt={alt}
        />
    );
}

SpinnerImage.defaultProps = {
    spinnerClassName: '',
    imgClassName: '',
    onImageLoad: () => {},
    imgRef: undefined,
};
