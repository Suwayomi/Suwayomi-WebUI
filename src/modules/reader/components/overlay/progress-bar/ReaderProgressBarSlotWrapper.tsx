/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Box, { BoxProps } from '@mui/material/Box';
import { memo, ReactNode, useMemo } from 'react';
import { styled } from '@mui/material/styles';
import { ReaderProgressBarProps } from '@/modules/reader/types/ReaderProgressBar.types.ts';
import { shouldForwardProp } from '@/modules/core/utils/ShouldForwardProp.ts';

type StyledWrapperProps = {
    isFirstPage: boolean;
    isLastPage: boolean;
};
const StyledWrapper = memo(
    styled(Box, {
        shouldForwardProp: shouldForwardProp<StyledWrapperProps>(['isFirstPage', 'isLastPage']),
    })<BoxProps & StyledWrapperProps>(({ isFirstPage, isLastPage }) => ({
        flexGrow: 1,
        height: '100%',
        cursor: 'pointer',
        borderLeftWidth: isFirstPage ? 0 : undefined,
        borderRightWidth: isLastPage ? 0 : undefined,
    })),
);

export const ReaderProgressBarSlotWrapper = memo(
    ({
        page,
        pagesIndex,
        isCurrentPage,
        isLeadingPage,
        isTrailingPage,
        totalPages,
        primaryPageLoadState,
        secondaryPageLoadState,
        createProgressBarSlot,
        ...boxProps
    }: {
        page: ReaderProgressBarProps['pages'][number];
        pagesIndex: number;
        isCurrentPage: boolean;
        isLeadingPage: boolean;
        isTrailingPage: boolean;
        totalPages: number;
        primaryPageLoadState: ReaderProgressBarProps['pageLoadStates'][number]['loaded'];
        secondaryPageLoadState: ReaderProgressBarProps['pageLoadStates'][number]['loaded'];
        createProgressBarSlot: (
            page: ReaderProgressBarProps['pages'][number],
            pagesIndex: number,
            primaryPageLoadState: ReaderProgressBarProps['pageLoadStates'][number]['loaded'],
            secondaryPageLoadState: ReaderProgressBarProps['pageLoadStates'][number]['loaded'],
            isCurrentPage: boolean,
            isLeadingPage: boolean,
            isTrailingPage: boolean,
            totalPages: number,
        ) => ReactNode;
    } & BoxProps) => {
        const slot = useMemo(
            () =>
                createProgressBarSlot(
                    page,
                    pagesIndex,
                    primaryPageLoadState,
                    secondaryPageLoadState,
                    isCurrentPage,
                    isLeadingPage,
                    isTrailingPage,
                    totalPages,
                ),
            [
                page,
                pagesIndex,
                primaryPageLoadState,
                secondaryPageLoadState,
                isCurrentPage,
                isLeadingPage,
                isTrailingPage,
                totalPages,
            ],
        );

        return (
            <StyledWrapper {...boxProps} isFirstPage={pagesIndex === 0} isLastPage={pagesIndex === totalPages - 1}>
                {slot}
            </StyledWrapper>
        );
    },
);
