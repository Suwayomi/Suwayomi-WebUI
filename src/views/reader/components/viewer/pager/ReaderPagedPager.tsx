/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { memo } from 'react';
import { BasePager } from '@/views/reader/components/viewer/pager/BasePager.tsx';
import type { ReaderPagerProps } from '@/models/reader/Reader.types.ts';
import { createReaderPage } from '@/utils/reader/viewer/pager/ReaderPager.utils.tsx';

const BaseReaderPagedPager = ({
    onLoad,
    onError,
    pageLoadStates,
    retryFailedPagesKeyPrefix,
    isPreloadMode,
    ...props
}: ReaderPagerProps) => {
    const { currentPageIndex, totalPages } = props;

    return (
        <BasePager
            {...props}
            createPage={(page, pagesIndex, shouldLoad, shouldDisplay, _setRef, ...baseProps) =>
                createReaderPage(
                    page,
                    pagesIndex,
                    true,
                    pageLoadStates[page.primary.index].loaded,
                    isPreloadMode,
                    onLoad,
                    onError,
                    shouldLoad,
                    shouldDisplay && shouldLoad && currentPageIndex === page.primary.index,
                    currentPageIndex,
                    totalPages,
                    ...baseProps,
                    pageLoadStates[page.primary.index].error ? retryFailedPagesKeyPrefix : undefined,
                )
            }
            slots={{
                boxProps: {
                    sx: {
                        margin: 'auto',
                    },
                },
            }}
        />
    );
};

export const ReaderPagedPager = memo(BaseReaderPagedPager);
