/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { Direction, useTheme } from '@mui/material/styles';
import { Fragment, useMemo } from 'react';
import { BasePager } from '@/modules/reader/components/viewer/pager/BasePager.tsx';
import { ReaderService } from '@/modules/reader/services/ReaderService.ts';
import { ReaderPagerProps, ReadingDirection } from '@/modules/reader/types/Reader.types.ts';
import { applyStyles } from '@/modules/core/utils/ApplyStyles.ts';
import { createReaderPage } from '@/modules/reader/utils/ReaderPager.utils.tsx';
import { getPage } from '@/modules/reader/utils/ReaderProgressBar.utils.tsx';

const getPagePosition = (
    pageType: 'first' | 'second',
    themeDirection: Direction,
    readingDirection: ReadingDirection,
): 'left' | 'right' => {
    const isLtrReadingDirection = readingDirection === ReadingDirection.LTR;

    if (pageType === 'first') {
        if (themeDirection === 'ltr') {
            return isLtrReadingDirection ? 'right' : 'left';
        }

        return isLtrReadingDirection ? 'left' : 'right';
    }

    if (themeDirection === 'ltr') {
        return isLtrReadingDirection ? 'left' : 'right';
    }

    return isLtrReadingDirection ? 'right' : 'left';
};

export const ReaderDoublePagedPager = ({ onLoad, ...props }: ReaderPagerProps) => {
    const { currentPageIndex, pages, totalPages } = props;

    const { readingDirection } = ReaderService.useSettings();
    const { direction: themeDirection } = useTheme();

    const currentPage = useMemo(() => getPage(currentPageIndex, pages), [currentPageIndex, pages]);
    const isLtrReadingDirection = readingDirection.value === ReadingDirection.LTR;

    return (
        <BasePager
            {...props}
            createPage={(page, pagesIndex, shouldLoad, shouldDisplay) => {
                const { primary, secondary } = page;

                const currentSecondaryPageIndex = currentPage.secondary?.index ?? currentPage.primary.index;

                const hasSecondaryPage = !!secondary;
                const isPrimaryPage = currentPage.primary.index === primary.index;
                const isSecondaryPage = !!secondary && currentSecondaryPageIndex === secondary.index;

                return (
                    <Fragment key={`${primary.url}_${secondary?.url}`}>
                        {createReaderPage(
                            page,
                            () => onLoad?.(pagesIndex),
                            shouldLoad,
                            shouldDisplay && isPrimaryPage,
                            currentPage.primary.index,
                            totalPages,
                            hasSecondaryPage
                                ? getPagePosition('first', themeDirection, readingDirection.value)
                                : undefined,
                            hasSecondaryPage,
                        )}
                        {hasSecondaryPage &&
                            createReaderPage(
                                { ...page, primary: { ...page.secondary! } },
                                () => onLoad?.(pagesIndex, false),
                                shouldLoad,
                                shouldDisplay && isSecondaryPage,
                                currentSecondaryPageIndex,
                                totalPages,
                                getPagePosition('second', themeDirection, readingDirection.value),
                                true,
                            )}
                    </Fragment>
                );
            }}
            slots={{
                stackProps: {
                    sx: {
                        margin: 'auto',
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'center',
                        ...applyStyles(themeDirection === 'ltr', {
                            flexDirection: isLtrReadingDirection ? 'row' : 'row-reverse',
                        }),
                        ...applyStyles(themeDirection === 'rtl', {
                            flexDirection: isLtrReadingDirection ? 'row-reverse' : 'row',
                        }),
                        flexWrap: 'nowrap',
                    },
                },
            }}
        />
    );
};
