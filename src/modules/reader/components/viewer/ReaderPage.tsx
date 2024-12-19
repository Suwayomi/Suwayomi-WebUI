/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { ComponentProps, ForwardedRef, forwardRef } from 'react';
import { SpinnerImage } from '@/modules/core/components/SpinnerImage.tsx';
import { ReaderService } from '@/modules/reader/services/ReaderService.ts';
import { ReaderCustomFilter } from '@/modules/reader/types/Reader.types.ts';
import {
    getImageMarginStyling,
    getImagePlaceholderStyling,
    getImageWidthStyling,
} from '@/modules/reader/utils/ReaderPager.utils.tsx';
import { applyStyles } from '@/modules/core/utils/ApplyStyles.ts';
import { useReaderScrollbarContext } from '@/modules/reader/contexts/ReaderScrollbarContext.tsx';
import { MediaQuery } from '@/modules/core/utils/MediaQuery.tsx';

const getCustomFilterString = (customFilter: ReaderCustomFilter): string =>
    Object.keys(customFilter)
        .map((key) => {
            const filter = key as keyof ReaderCustomFilter;
            const value = customFilter[filter];

            switch (filter) {
                case 'brightness':
                case 'contrast':
                case 'saturate':
                    return (value as ReaderCustomFilter['brightness' | 'contrast' | 'saturate']).enabled
                        ? `${filter}(${(value as ReaderCustomFilter['brightness' | 'contrast' | 'saturate']).value / 100})`
                        : '';
                case 'hue':
                    return (value as ReaderCustomFilter['hue']).enabled
                        ? `hue-rotate(${(value as ReaderCustomFilter['brightness' | 'contrast' | 'saturate']).value}deg)`
                        : '';
                case 'rgba':
                    return '';
                case 'sepia':
                case 'grayscale':
                case 'invert':
                    return value ? `${filter}(${Number(value)})` : '';
                default:
                    throw new Error(`Unexpected "CustomFilter" (${filter})`);
            }
        })
        .join(' ');

export const ReaderPage = forwardRef(
    (
        {
            display,
            doublePage = false,
            position,
            marginTop,
            shouldLoad,
            ...props
        }: Omit<ComponentProps<typeof SpinnerImage>, 'ref' | 'spinnerStyle' | 'imgStyle'> & {
            display: boolean;
            doublePage?: boolean;
            position?: 'left' | 'right';
            marginTop?: number;
        },
        ref: ForwardedRef<HTMLImageElement | null>,
    ) => {
        const { readingMode, customFilter, pageScaleMode, shouldStretchPage, readerWidth } =
            ReaderService.useSettings();
        const { scrollbarXSize, scrollbarYSize } = useReaderScrollbarContext();
        const isTabletWidth = MediaQuery.useIsTabletWidth();

        if (!display && !shouldLoad) {
            return null;
        }

        return (
            <SpinnerImage
                {...props}
                shouldLoad={shouldLoad}
                shouldDecode
                ref={ref}
                spinnerStyle={{
                    backgroundColor: 'background.paper',
                    ...getImagePlaceholderStyling(
                        readingMode.value,
                        shouldStretchPage.value,
                        pageScaleMode.value,
                        readerWidth.value,
                        scrollbarXSize,
                        scrollbarYSize,
                        doublePage,
                        isTabletWidth,
                    ),
                    ...applyStyles(!display, {
                        display: 'none',
                    }),
                    ...getImageMarginStyling(doublePage, position),
                    ...applyStyles(marginTop !== undefined, {
                        mt: `${marginTop}px`,
                    }),
                }}
                imgStyle={{
                    ...getImageWidthStyling(
                        readingMode.value,
                        shouldStretchPage.value,
                        pageScaleMode.value,
                        doublePage,
                        readerWidth.value,
                        true,
                    ),
                    display: 'block',
                    ...applyStyles(!display, {
                        display: 'none',
                    }),
                    filter: getCustomFilterString(customFilter),
                    objectFit: 'contain',
                    objectPosition: position,
                    userSelect: 'none',
                    ...getImageMarginStyling(doublePage, position),
                    ...applyStyles(marginTop !== undefined, {
                        mt: `${marginTop}px`,
                    }),
                }}
            />
        );
    },
);
