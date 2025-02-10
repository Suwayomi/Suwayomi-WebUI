/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { forwardRef, memo } from 'react';
import { BasePager } from '@/modules/reader/components/viewer/pager/BasePager.tsx';
import { ReaderPagerProps } from '@/modules/reader/types/Reader.types.ts';
import { createReaderPage } from '@/modules/reader/utils/ReaderPager.utils.tsx';

const BaseReaderPagedPager = forwardRef<HTMLDivElement, ReaderPagerProps>(
    ({ onLoad, onError, pageLoadStates, retryFailedPagesKeyPrefix, isPreloadMode, ...props }, ref) => {
        const { currentPageIndex, totalPages } = props;

        return (
            <BasePager
                ref={ref}
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
    },
);

export const ReaderPagedPager = memo(BaseReaderPagedPager);
