/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { Direction, useTheme } from '@mui/material/styles';
import { Fragment, memo, useMemo } from 'react';
import { BasePager } from '@/modules/reader/components/viewer/pager/BasePager.tsx';
import { ReaderService } from '@/modules/reader/services/ReaderService.ts';
import {
    IReaderSettings,
    ReaderPagerProps,
    ReaderPageScaleMode,
    ReadingDirection,
} from '@/modules/reader/types/Reader.types.ts';
import { applyStyles } from '@/modules/core/utils/ApplyStyles.ts';
import { createReaderPage } from '@/modules/reader/utils/ReaderPager.utils.tsx';
import { getNextIndexFromPage, getPage } from '@/modules/reader/utils/ReaderProgressBar.utils.tsx';
import { withPropsFrom } from '@/modules/core/hoc/withPropsFrom.tsx';

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

const BaseReaderDoublePagedPager = ({
    onLoad,
    onError,
    pageLoadStates,
    retryFailedPagesKeyPrefix,
    readingDirection,
    pageScaleMode,
    ...props
}: ReaderPagerProps & Pick<IReaderSettings, 'readingDirection' | 'pageScaleMode'>) => {
    const { currentPageIndex, pages, totalPages } = props;

    const { direction: themeDirection } = useTheme();

    const currentPage = useMemo(() => getPage(currentPageIndex, pages), [currentPageIndex, pages]);
    const isLtrReadingDirection = readingDirection === ReadingDirection.LTR;

    return (
        <BasePager
            {...props}
            createPage={(page, pagesIndex, shouldLoad, shouldDisplay) => {
                const { primary, secondary } = page;

                const currentSecondaryPageIndex = getNextIndexFromPage(currentPage);

                const hasSecondaryPage = !!secondary;
                const isPrimaryPage = currentPage.primary.index === primary.index;
                const isSecondaryPage = !!secondary && currentSecondaryPageIndex === secondary.index;

                return (
                    <Fragment key={`${primary.url}_${secondary?.url}`}>
                        {createReaderPage(
                            page,
                            pagesIndex,
                            true,
                            onLoad,
                            onError,
                            shouldLoad,
                            shouldDisplay && isPrimaryPage,
                            currentPage.primary.index,
                            totalPages,
                            pageLoadStates[primary.index].error ? retryFailedPagesKeyPrefix : undefined,
                            hasSecondaryPage ? getPagePosition('first', themeDirection, readingDirection) : undefined,
                            hasSecondaryPage,
                        )}
                        {hasSecondaryPage &&
                            createReaderPage(
                                { ...page, primary: { ...page.secondary! } },
                                pagesIndex,
                                false,
                                onLoad,
                                onError,
                                shouldLoad,
                                shouldDisplay && isSecondaryPage,
                                currentSecondaryPageIndex,
                                totalPages,
                                pageLoadStates[secondary.index].error ? retryFailedPagesKeyPrefix : undefined,
                                getPagePosition('second', themeDirection, readingDirection),
                                true,
                            )}
                    </Fragment>
                );
            }}
            slots={{
                boxProps: {
                    sx: {
                        ...applyStyles(pageScaleMode === ReaderPageScaleMode.ORIGINAL, {
                            margin: 'auto',
                        }),
                        width: '100%',
                        minWidth: 'fit-content',
                        height: '100%',
                        minHeight: 'fit-content',
                        display: 'flex',
                        flexDirection: 'row',
                        flexWrap: 'nowrap',
                        ...applyStyles(themeDirection === 'ltr', {
                            flexDirection: isLtrReadingDirection ? 'row' : 'row-reverse',
                        }),
                        ...applyStyles(themeDirection === 'rtl', {
                            flexDirection: isLtrReadingDirection ? 'row-reverse' : 'row',
                        }),
                    },
                },
            }}
        />
    );
};

export const ReaderDoublePagedPager = withPropsFrom(
    memo(BaseReaderDoublePagedPager),
    [ReaderService.useSettingsWithoutDefaultFlag],
    ['readingDirection', 'pageScaleMode'],
);
