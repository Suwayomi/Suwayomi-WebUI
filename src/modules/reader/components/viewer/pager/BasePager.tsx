/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Stack, { StackProps } from '@mui/material/Stack';
import { ReactNode, useEffect, useMemo, useRef } from 'react';
import { ReaderService } from '@/modules/reader/services/ReaderService.ts';
import { getImageWidthStyling, getPageIndexesToLoad } from '@/modules/reader/utils/ReaderPager.utils.tsx';
import { ReaderStatePages } from '@/modules/reader/types/ReaderProgressBar.types.ts';
import { applyStyles } from '@/modules/core/utils/ApplyStyles.ts';
import { isContinuousReadingMode, isReaderWidthEditable } from '@/modules/reader/utils/ReaderSettings.utils.tsx';
import { ReaderPagerProps, ReaderTransitionPageMode } from '@/modules/reader/types/Reader.types.ts';
import { ReaderTransitionPage } from '@/modules/reader/components/viewer/ReaderTransitionPage.tsx';

export const BasePager = ({
    currentPageIndex,
    pages,
    transitionPageMode,
    imageRefs,
    createPage,
    slots,
}: ReaderPagerProps & {
    createPage: (
        page: ReaderStatePages['pages'][number],
        pagesIndex: number,
        shouldLoad: boolean,
        shouldDisplay: boolean,
        setRef: (element: HTMLElement | null) => void,
    ) => ReactNode;
    slots?: { stackProps?: StackProps };
}) => {
    const { readingMode, pageScaleMode, shouldStretchPage, readerWidth, imagePreLoadAmount } =
        ReaderService.useSettings();

    const previousCurrentPageIndex = useRef(-1);
    const pagesIndexesToRender = useMemo(
        () => getPageIndexesToLoad(currentPageIndex, pages, previousCurrentPageIndex.current, imagePreLoadAmount),
        [currentPageIndex, pages, imagePreLoadAmount],
    );
    useEffect(() => {
        previousCurrentPageIndex.current = currentPageIndex;
    }, [pagesIndexesToRender]);

    return (
        <Stack
            {...slots?.stackProps}
            sx={[
                ...(Array.isArray(slots?.stackProps?.sx) ? (slots?.stackProps?.sx ?? []) : [slots?.stackProps?.sx]),
                getImageWidthStyling(
                    readingMode.value,
                    shouldStretchPage.value,
                    pageScaleMode.value,
                    false,
                    readerWidth.value,
                ),
                applyStyles(!!readerWidth?.value.enabled && isReaderWidthEditable(pageScaleMode.value), {
                    alignItems: 'center',
                    // both continuous pagers have content that causes scrollbars, centering this content causes content
                    // to be cut off
                    ...applyStyles(!isContinuousReadingMode(readingMode.value), {
                        justifyContent: 'center',
                    }),
                }),
            ]}
        >
            <ReaderTransitionPage
                type={ReaderTransitionPageMode.PREVIOUS}
                mode={transitionPageMode}
                readingMode={readingMode.value}
                pageScaleMode={pageScaleMode.value}
            />
            {pages.map((page, pagesIndex) =>
                createPage(
                    page,
                    pagesIndex,
                    pagesIndexesToRender.includes(pagesIndex),
                    [ReaderTransitionPageMode.NONE, ReaderTransitionPageMode.BOTH].includes(transitionPageMode),
                    (element) => {
                        // eslint-disable-next-line no-param-reassign
                        imageRefs.current[pagesIndex] = element;
                    },
                ),
            )}
            <ReaderTransitionPage
                type={ReaderTransitionPageMode.NEXT}
                mode={transitionPageMode}
                readingMode={readingMode.value}
                pageScaleMode={pageScaleMode.value}
            />
        </Stack>
    );
};
