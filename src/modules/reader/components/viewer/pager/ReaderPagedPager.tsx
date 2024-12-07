/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { BasePager } from '@/modules/reader/components/viewer/pager/BasePager.tsx';
import { ReaderPagerProps } from '@/modules/reader/types/Reader.types.ts';
import { createReaderPage } from '@/modules/reader/utils/ReaderPager.utils.tsx';

export const ReaderPagedPager = ({
    onLoad,
    onError,
    pageLoadStates,
    retryFailedPagesKeyPrefix,
    ...props
}: ReaderPagerProps) => {
    const { currentPageIndex, totalPages } = props;

    return (
        <BasePager
            {...props}
            createPage={(page, pagesIndex, shouldLoad, shouldDisplay) =>
                createReaderPage(
                    page,
                    () => onLoad?.(pagesIndex),
                    () => onError?.(page.primary.index),
                    shouldLoad,
                    shouldDisplay && currentPageIndex === page.primary.index,
                    currentPageIndex,
                    totalPages,
                    pageLoadStates[page.primary.index].error ? retryFailedPagesKeyPrefix : undefined,
                )
            }
            slots={{
                stackProps: {
                    sx: {
                        margin: 'auto',
                    },
                },
            }}
        />
    );
};
