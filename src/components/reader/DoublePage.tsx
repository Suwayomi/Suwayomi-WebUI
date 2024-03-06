/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { CSSProperties, forwardRef } from 'react';
import { Box } from '@mui/material';
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

    const baseImgStyle = imageStyle(settings);
    const imgStyle = {
        ...baseImgStyle,
        width: settings.fitPageToWindow ? baseImgStyle.width : `calc(${baseImgStyle.width} * 0.5)`,
        minWidth:
            settings.fitPageToWindow && settings.scalePage
                ? `calc(${baseImgStyle.minWidth} * 0.5)`
                : baseImgStyle.minWidth,
        maxWidth: settings.fitPageToWindow ? `calc(${baseImgStyle.maxWidth} * 0.5)` : baseImgStyle.maxWidth,
    };

    const spinnerStyle: CSSProperties = {
        ...imgStyle,
        height: '100vh',
        width: '50%',
        backgroundColor: '#525252',
    };

    return (
        <Box
            ref={ref}
            sx={{
                display: 'flex',
                flexDirection: settings.readerType === 'DoubleLTR' ? 'row' : 'row-reverse',
                justifyContent: 'center',
                width: '100%',
            }}
        >
            <SpinnerImage
                src={image1src}
                onImageLoad={onImageLoad}
                alt={`Page #${index}`}
                spinnerStyle={spinnerStyle}
                imgStyle={{ ...imgStyle, objectPosition: settings.readerType === 'DoubleLTR' ? 'right' : 'left' }}
            />
            <SpinnerImage
                src={image2src}
                onImageLoad={onImageLoad}
                alt={`Page #${index + 1}`}
                spinnerStyle={{
                    ...spinnerStyle,
                    width: 'calc(50% - 5px)',
                    marginLeft: '5px',
                }}
                imgStyle={{ ...imgStyle, objectPosition: settings.readerType === 'DoubleLTR' ? 'left' : 'right' }}
            />
        </Box>
    );
});
