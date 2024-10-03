/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import IconButton from '@mui/material/IconButton';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import Stack from '@mui/material/Stack';
import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import { ReaderProgressBarProps } from '@/modules/reader/types/ReaderProgressBar.types.ts';
import { ReaderProgressBar } from '@/modules/reader/components/overlay/progress-bar/ReaderProgressBar.tsx';
import { ReaderProgressBarSlot } from '@/modules/reader/components/overlay/progress-bar/ReaderProgressBarSlot.tsx';
import { getPage } from '@/modules/reader/utils/ReaderProgressBar.utils.tsx';

export const MobileReaderProgressBar = (props: ReaderProgressBarProps) => {
    const { currentPageIndex, pages } = props;

    return (
        <Stack
            sx={{
                flexDirection: 'row',
                alignItems: 'center',
                px: 2,
                gap: 1,
            }}
        >
            <IconButton sx={{ backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.85) }}>
                <SkipPreviousIcon />
            </IconButton>
            <ReaderProgressBar
                {...props}
                createProgressBarSlot={([pageIndexes, pageName]) => (
                    <ReaderProgressBarSlot
                        pageName={pageName}
                        boxProps={{
                            sx: {
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'end',
                                position: 'relative',
                                backgroundColor: 'background.default',
                            },
                        }}
                    >
                        <Box
                            sx={{
                                width: '2px',
                                height: '2px',
                                borderRadius: 100,
                                backgroundColor: 'background.paper',
                                zIndex: 1,
                            }}
                        />
                    </ReaderProgressBarSlot>
                )}
                slotProps={{
                    container: {
                        sx: {
                            flexGrow: 1,
                            position: 'relative',
                            display: 'flex',
                            justifyItems: 'center',
                            alignItems: 'stretch',
                            backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.85),
                            borderRadius: 100,
                        },
                    },
                    progressBarRoot: {
                        sx: {
                            flexGrow: 1,
                            alignItems: 'stretch',
                            gap: 0,
                        },
                    },
                    progressBarSlotsActionArea: {
                        sx: {
                            height: '100%',
                            alignItems: 'center',
                            py: 2,
                            cursor: 'pointer',
                        },
                    },

                    progressBarSlotsContainer: {
                        sx: {
                            borderRadius: 100,
                        },
                    },

                    progressBarSlot: {
                        sx: {
                            height: '20px',
                        },
                    },
                    progressBarReadPages: {
                        sx: {
                            height: '20px',
                            backgroundColor: 'primary.main',
                            borderRadius: '400px 0 0 400px',
                            width: `calc(${(Math.max(0, getPage(currentPageIndex, pages)[2]) / pages.length) * 100}% + 100% / ${pages.length})`,
                        },
                    },
                    progressBarCurrentPageSlot: {
                        sx: {
                            display: 'flex',
                            justifyContent: 'end',
                            alignItems: 'center',
                            zIndex: 1,
                            pointer: 'default',
                        },
                    },

                    progressBarPageTexts: {
                        base: { px: 1 },
                    },
                }}
                slots={{
                    progressBarCurrentPage: (
                        <Box
                            sx={{
                                width: '5px',
                                height: '75%',
                                backgroundColor: 'primary.main',
                                borderRadius: 100,
                            }}
                        />
                    ),
                }}
            />
            <IconButton sx={{ backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.85) }}>
                <SkipNextIcon />
            </IconButton>
        </Stack>
    );
};
