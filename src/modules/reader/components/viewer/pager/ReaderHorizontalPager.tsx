/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useTheme } from '@mui/material/styles';
import { ReaderService } from '@/modules/reader/services/ReaderService.ts';
import { BasePager } from '@/modules/reader/components/viewer/pager/BasePager.tsx';
import { applyStyles } from '@/modules/core/utils/ApplyStyles.ts';
import { ReaderPagerProps, ReadingDirection } from '@/modules/reader/types/Reader.types.ts';
import { createReaderPage } from '@/modules/reader/utils/ReaderPager.utils.tsx';

export const ReaderHorizontalPager = ({
    onLoad,
    onError,
    pageLoadStates,
    retryFailedPagesKeyPrefix,
    ...props
}: ReaderPagerProps) => {
    const { currentPageIndex, totalPages } = props;

    const { pageGap, readingDirection } = ReaderService.useSettings();
    const { direction: themeDirection } = useTheme();

    const isLtrReadingDirection = readingDirection.value === ReadingDirection.LTR;

    return (
        <BasePager
            {...props}
            createPage={(page, pagesIndex, shouldLoad, _, setRef) =>
                createReaderPage(
                    page,
                    () => onLoad?.(pagesIndex),
                    () => onError?.(page.primary.index),
                    shouldLoad,
                    true,
                    currentPageIndex,
                    totalPages,
                    pageLoadStates[page.primary.index].error ? retryFailedPagesKeyPrefix : undefined,
                    undefined,
                    undefined,
                    setRef,
                )
            }
            slots={{
                stackProps: {
                    sx: {
                        my: 'auto',
                        ...applyStyles(themeDirection === 'ltr', {
                            flexDirection: isLtrReadingDirection ? 'row' : 'row-reverse',
                            justifyContent: isLtrReadingDirection ? 'flex-start' : 'flex-end',
                        }),
                        ...applyStyles(themeDirection === 'rtl', {
                            flexDirection: isLtrReadingDirection ? 'row-reverse' : 'row',
                            justifyContent: isLtrReadingDirection ? 'flex-end' : 'flex-start',
                        }),
                        flexWrap: 'nowrap',
                        alignItems: 'center',
                        gap: `${pageGap.value}px`,
                    },
                },
            }}
        />
    );
};
