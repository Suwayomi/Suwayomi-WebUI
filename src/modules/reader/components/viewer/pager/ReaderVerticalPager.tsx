/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { ReaderService } from '@/modules/reader/services/ReaderService.ts';
import { BasePager } from '@/modules/reader/components/viewer/pager/BasePager.tsx';
import { ReaderPagerProps } from '@/modules/reader/types/Reader.types.ts';
import { createReaderPage } from '@/modules/reader/utils/ReaderPager.utils.tsx';

export const ReaderVerticalPager = ({
    onLoad,
    onError,
    pageLoadStates,
    retryFailedPagesKeyPrefix,
    ...props
}: ReaderPagerProps) => {
    const { currentPageIndex, totalPages } = props;

    const { pageGap } = ReaderService.useSettings();

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
                        margin: 'auto',
                        flexWrap: 'nowrap',
                        alignItems: 'center',
                        gap: `${pageGap.value}px`,
                    },
                },
            }}
        />
    );
};
