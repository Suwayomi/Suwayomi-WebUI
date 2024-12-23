/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { alpha, darken, lighten, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import { memo } from 'react';
import { applyStyles } from '@/modules/core/utils/ApplyStyles.ts';
import { ReaderProgressBarSlot } from '@/modules/reader/components/overlay/progress-bar/ReaderProgressBarSlot.tsx';
import { IReaderSettings } from '@/modules/reader/types/Reader.types.ts';
import { getProgressBarPositionInfo } from '@/modules/reader/utils/ReaderProgressBar.utils.tsx';

export const ReaderProgressBarSlotDesktop = memo(
    ({
        pageName,
        pageUrl,
        primaryPageLoadState,
        secondaryPageLoadState,
        isHorizontal,
        isVertical,
        progressBarPosition,
        isCurrentPage,
        isFirstPage,
        isLastPage,
        isLeadingPage,
        isDragging,
    }: Pick<IReaderSettings, 'progressBarPosition'> &
        Pick<ReturnType<typeof getProgressBarPositionInfo>, 'isHorizontal' | 'isVertical'> & {
            pageName: string;
            pageUrl: string;
            primaryPageLoadState: boolean;
            secondaryPageLoadState?: boolean;
            isCurrentPage: boolean;
            isFirstPage: boolean;
            isLastPage: boolean;
            isLeadingPage: boolean;
            isDragging: boolean;
        }) => {
        const theme = useTheme();

        return (
            <ReaderProgressBarSlot
                key={pageUrl}
                pageName={pageName}
                progressBarPosition={progressBarPosition}
                slotProps={{
                    box: {
                        sx: {
                            cursor: 'pointer',
                            backgroundColor: darken(theme.palette.background.paper, 0.2),
                            ...applyStyles(isHorizontal, {
                                borderLeftWidth: 2,
                                borderLeftColor: 'background.paper',
                                borderLeftStyle: 'solid',
                            }),
                            ...applyStyles(isVertical, {
                                borderTopWidth: 2,
                                borderTopColor: 'background.paper',
                                borderTopStyle: 'solid',
                            }),
                            ...theme.applyStyles('dark', {
                                backgroundColor: lighten(theme.palette.background.paper, 0.1),
                            }),
                            ...applyStyles(
                                primaryPageLoadState && (secondaryPageLoadState == null || secondaryPageLoadState),
                                {
                                    backgroundColor: darken(theme.palette.background.paper, 0.35),
                                    ...theme.applyStyles('dark', {
                                        backgroundColor: lighten(theme.palette.background.paper, 0.25),
                                    }),
                                },
                            ),
                            borderLeftWidth: isFirstPage ? 0 : undefined,
                            borderRightWidth: isLastPage ? 0 : undefined,
                        },
                    },
                    tooltip: {
                        slotProps: isCurrentPage
                            ? {
                                  tooltip: {
                                      sx: {
                                          backgroundColor: 'primary.main',
                                          color: 'primary.contrastText',
                                      },
                                  },
                              }
                            : undefined,
                    },
                }}
            >
                <Box
                    sx={{
                        width: '100%',
                        height: '100%',
                        ...applyStyles(isLeadingPage, {
                            backgroundColor: alpha(theme.palette.primary.main, 0.5),
                        }),
                        ...applyStyles(isCurrentPage, {
                            cursor: isDragging ? 'grabbing' : 'grab',
                            pointer: 'grabbing',
                            borderRadius: 2,
                            backgroundColor: 'primary.dark',
                            ...theme.applyStyles('dark', {
                                backgroundColor: 'primary.light',
                            }),
                        }),
                    }}
                />
            </ReaderProgressBarSlot>
        );
    },
);
