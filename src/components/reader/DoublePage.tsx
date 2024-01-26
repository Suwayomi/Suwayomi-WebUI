/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { forwardRef, useRef } from 'react';
import { Box, SxProps, Theme } from '@mui/material';
import { IReaderSettings } from '@/typings';
import { SpinnerImage } from '@/components/util/SpinnerImage';
import { imageStyle } from '@/components/reader/Page';

interface IProps {
    index: number;
    image1src: string;
    image2src: string;
    onImageLoad?: () => void;
    settings: IReaderSettings;
}

export const DoublePage = forwardRef((props: IProps, ref: any) => {
    const { image1src, image2src, index, onImageLoad, settings } = props;

    const imgRef = useRef<HTMLImageElement>(null);
    const baseImgStyle = imageStyle(settings);
    const imgStyle = {
        ...baseImgStyle,
        width: settings.fitPageToWindow ? baseImgStyle.width : `calc(${baseImgStyle.width} * 0.5)`,
    };

    const spinnerStyle: SxProps<Theme> = {
        ...imgStyle,
        height: '100vh',
        width: '70vw',
        backgroundColor: '#525252',
    };

    return (
        <Box
            ref={ref}
            sx={{
                display: 'flex',
                justifyContent: 'center',
                width: '100%',
            }}
        >
            <SpinnerImage
                src={image1src}
                onImageLoad={onImageLoad}
                alt={`Page #${index}`}
                imgRef={imgRef}
                spinnerStyle={spinnerStyle}
                imgStyle={imgStyle}
            />
            <SpinnerImage
                src={image2src}
                onImageLoad={onImageLoad}
                alt={`Page #${index + 1}`}
                imgRef={imgRef}
                spinnerStyle={{
                    ...spinnerStyle,
                    marginLeft: '5px',
                }}
                imgStyle={imgStyle}
            />
        </Box>
    );
});
