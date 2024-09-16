/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { CSSProperties, forwardRef } from 'react';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { IReaderSettings, ReaderType } from '@/typings';
import { SpinnerImage } from '@/components/util/SpinnerImage';
import { MediaQuery } from '@/lib/ui/MediaQuery.tsx';

export const isHorizontalReaderType = (readerType: ReaderType): boolean =>
    ['ContinuesHorizontalLTR', 'ContinuesHorizontalRTL'].includes(readerType);

export function imageStyle(settings: IReaderSettings): CSSProperties {
    const isDoublePageReader = ['DoubleRTL', 'DoubleLTR'].includes(settings.readerType);
    const isVertical = settings.readerType === 'ContinuesVertical';
    const isHorizontal = isHorizontalReaderType(settings.readerType);

    const scrollbarHeight = MediaQuery.useGetScrollbarSize('height');

    const baseStyling: CSSProperties = {
        margin: 0,
        width: `${settings.readerWidth}%`,
        objectFit: 'contain',
    };

    const continuesVerticalStyling: CSSProperties = {
        marginBottom: '15px',
    };

    const continuesHorizontalStyling: CSSProperties = {
        width: undefined,
        minHeight: `calc(100vh - ${scrollbarHeight}px)`,
        maxHeight: `calc(100vh - ${scrollbarHeight}px)`,
        marginLeft: '7px',
        marginRight: '7px',
    };

    const fitToPageStyling: CSSProperties = {
        width: undefined,
        height: undefined,
        minWidth: settings.scalePage ? 'calc(100vw - (100vw - 100%))' : undefined,
        maxWidth: 'calc(100vw - (100vw - 100%))',
        minHeight: settings.scalePage ? `calc(100vh - ${scrollbarHeight}px)` : undefined,
        maxHeight: `calc(100vh - ${scrollbarHeight}px)`,
    };

    return {
        ...baseStyling,
        ...(isHorizontal ? continuesHorizontalStyling : undefined),
        ...(isVertical ? continuesVerticalStyling : undefined),
        ...(settings.fitPageToWindow && !isHorizontal ? fitToPageStyling : undefined),
    };
}

interface IProps {
    src: string;
    index: number;
    onImageLoad: () => void;
    settings: IReaderSettings;
    display?: boolean;
}

export const Page = forwardRef((props: IProps, ref: any) => {
    const { src, index, onImageLoad, settings, display = true } = props;

    const theme = useTheme();
    const isMobileWidth = useMediaQuery(theme.breakpoints.down('md'));

    const imgStyle = imageStyle(settings);
    const isDoublePageReader = ['DoubleRTL', 'DoubleLTR'].includes(settings.readerType);

    return (
        <Box
            ref={ref}
            sx={{
                display: display ? 'flex' : 'none',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: isDoublePageReader ? '100%' : undefined,
            }}
        >
            <SpinnerImage
                src={src}
                onImageLoad={onImageLoad}
                alt={`Page #${index}`}
                spinnerStyle={{
                    ...imgStyle,
                    height: '100vh',
                    // eslint-disable-next-line no-nested-ternary
                    width: isMobileWidth
                        ? '100vw'
                        : isHorizontalReaderType(settings.readerType)
                          ? '50vw'
                          : 'calc(100% * 0.5)',
                    backgroundColor: 'background.paper',
                }}
                imgStyle={imgStyle}
            />
        </Box>
    );
});
