/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { forwardRef, useRef } from 'react';
import { Box, styled } from '@mui/material';
import { IReaderSettings } from '@/typings';
import { SpinnerImage } from '@/components/util/SpinnerImage';

const Image = styled('img')({
    marginBottom: 0,
    width: 'auto',
    minHeight: '99vh',
    height: 'auto',
    maxHeight: '99vh',
    objectFit: 'contain',
});

const imgStyles = {
    display: 'block',
    marginBottom: 0,
    width: 'auto',
    minHeight: '99vh',
    height: 'auto',
    maxHeight: '99vh',
    objectFit: 'contain',
};

interface IProps {
    index: number;
    image1src: string;
    image2src: string;
    onImageLoad: () => void;
    settings: IReaderSettings;
}

export const DoublePage = forwardRef((props: IProps, ref: any) => {
    const { image1src, image2src, index, onImageLoad, settings } = props;

    const imgRef = useRef<HTMLImageElement>(null);

    // const imgStyle = imageStyle(settings);

    return (
        <Box
            ref={ref}
            sx={{
                display: 'flex',
                flexDirection: settings.readerType === 'DoubleLTR' ? 'row' : 'row-reverse',
                justifyContent: 'center',
                margin: '0 auto',
                width: 'auto',
                height: 'auto',
                overflowX: 'scroll',
            }}
        >
            <SpinnerImage
                src={image1src}
                onImageLoad={onImageLoad}
                alt={`Page #${index}`}
                imgRef={imgRef}
                spinnerStyle={{
                    ...imgStyles,
                    height: '100vh',
                    width: '35vw',
                    padding: '50px 18vw',
                    backgroundColor: '#525252',
                    marginBottom: 10,
                }}
                imgStyle={imgStyles}
            />
            <SpinnerImage
                src={image2src}
                onImageLoad={onImageLoad}
                alt={`Page #${index + 1}`}
                imgRef={imgRef}
                spinnerStyle={{
                    ...imgStyles,
                    height: '100vh',
                    width: '35vw',
                    padding: '50px 18vw',
                    backgroundColor: '#525252',
                    marginBottom: 10,
                }}
                imgStyle={imgStyles}
            />
        </Box>
    );
});
