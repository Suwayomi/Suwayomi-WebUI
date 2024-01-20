/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useState, useEffect, forwardRef, useRef } from 'react';
import Box from '@mui/material/Box';
import { IReaderSettings, ReaderType } from '@/typings';
import { SpinnerImage } from '@/components/util/SpinnerImage';

export const isFillsPageReaderType = (readerType: ReaderType): boolean =>
    ['DoubleRTL', 'DoubleLTR', 'ContinuesHorizontalLTR', 'ContinuesHorizontalRTL'].includes(readerType);

function imageStyle(settings: IReaderSettings): any {
    const [dimensions, setDimensions] = useState({
        height: window.innerHeight,
        width: window.innerWidth,
    });
    useEffect(() => {
        function handleResize() {
            setDimensions({
                height: window.innerHeight,
                width: window.innerWidth,
            });
        }

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);
    if (settings.fitPageToWindow || isFillsPageReaderType(settings.readerType)) {
        return {
            display: 'block',
            marginLeft: '7px',
            marginRight: '7px',
            width: 'auto',
            minHeight: '99vh',
            height: 'auto',
            maxHeight: '99vh',
            objectFit: 'contain',
        };
    }

    return {
        display: 'block',
        marginBottom: settings.readerType === 'ContinuesVertical' ? '15px' : 0,
        minWidth: '10vw',
        width: dimensions.width < dimensions.height ? '100vw' : `${settings.readerWidth}%`,
        maxWidth: '100%',
        marginLeft: 'auto',
        marginRight: 'auto',
    };
}

interface IProps {
    src: string;
    index: number;
    onImageLoad: () => void;
    settings: IReaderSettings;
}

export const Page = forwardRef((props: IProps, ref: any) => {
    const { src, index, onImageLoad, settings } = props;

    const imgRef = useRef<HTMLImageElement>(null);

    const imgStyle = imageStyle(settings);

    return (
        <Box ref={ref} sx={{ margin: 'auto' }}>
            <SpinnerImage
                src={src}
                onImageLoad={onImageLoad}
                alt={`Page #${index}`}
                imgRef={imgRef}
                spinnerStyle={{
                    ...imgStyle,
                    height: '100vh',
                    width: '70vw',
                    backgroundColor: '#525252',
                }}
                imgStyle={imgStyle}
            />
        </Box>
    );
});
