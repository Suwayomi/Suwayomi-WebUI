/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { BasePager } from '@/modules/reader/components/viewer/pager/BasePager.tsx';
import { IReaderSettings, ReaderPagerProps, ReadingMode } from '@/modules/reader/types/Reader.types.ts';
import { createReaderPage } from '@/modules/reader/utils/ReaderPager.utils.tsx';
import { ReaderService } from '@/modules/reader/services/ReaderService.ts';
import { withPropsFrom } from '@/modules/core/hoc/withPropsFrom.tsx';

const BaseReaderVerticalPager = ({
    onLoad,
    onError,
    pageLoadStates,
    retryFailedPagesKeyPrefix,
    readingMode,
    pageGap,
    ...props
}: ReaderPagerProps & Pick<IReaderSettings, 'pageGap' | 'readingMode'>) => {
    const { currentPageIndex, totalPages } = props;

    const isWebtoonMode = readingMode === ReadingMode.WEBTOON;
    const actualPageGap = isWebtoonMode ? 0 : pageGap;

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
                    page.primary.index !== 0 ? actualPageGap : 0,
                    setRef,
                )
            }
        />
    );
};

export const ReaderVerticalPager = withPropsFrom(
    BaseReaderVerticalPager,
    [ReaderService.useSettingsWithoutDefaultFlag],
    ['pageGap', 'readingMode'],
);
