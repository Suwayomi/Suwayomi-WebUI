/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Slider from '@mui/material/Slider';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import FormatSizeIcon from '@mui/icons-material/FormatSize';
import React, { useState } from 'react';
import { useReaderChaptersStore, useReaderOverlayStore } from '@/features/reader/stores/ReaderStore.ts';
import { novelSeekHandleRef } from '@/features/novel-reader/viewer/NovelReaderViewer.tsx';
import { useNovelReaderProgressStore } from '@/features/novel-reader/stores/NovelReaderProgressStore.ts';
import { ReaderControls } from '@/features/reader/services/ReaderControls.ts';

export const NovelReaderProgressBar: React.FC<{ openSettings?: () => void }> = ({ openSettings }) => {
    const isVisible = useReaderOverlayStore('isVisible');
    const { currentChapter, previousChapter, nextChapter } = useReaderChaptersStore(
        'currentChapter',
        'previousChapter',
        'nextChapter',
    );
    const [seekVal, setSeekVal] = useState<number | null>(null);
    const liveProgress = useNovelReaderProgressStore();

    const progress =
        seekVal ??
        (liveProgress.chapterId === currentChapter?.id ? liveProgress.progress : (currentChapter?.textProgress ?? 0));
    const percent = Math.round(progress * 100);

    return (
        <Paper
            elevation={3}
            sx={{
                position: 'fixed',
                bottom: 16,
                left: '50%',
                transform: isVisible ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(150%)',
                transition: 'transform 0.3s ease',
                zIndex: (theme) => theme.zIndex.appBar,
                py: 0.5,
                px: { xs: 1.5, sm: 3 },
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                borderRadius: 4,
                width: { xs: '92%', sm: 460 },
                pointerEvents: 'all',
            }}
        >
            <Tooltip title="Previous Chapter">
                <span>
                    <IconButton
                        size="small"
                        disabled={!previousChapter}
                        onClick={() => ReaderControls.openChapter('previous')}
                    >
                        <SkipPreviousIcon />
                    </IconButton>
                </span>
            </Tooltip>
            <Slider
                value={percent}
                min={0}
                max={100}
                step={1}
                size="small"
                valueLabelDisplay="auto"
                valueLabelFormat={(v) => `${v}%`}
                onChange={(_, val) => {
                    const frac = (val as number) / 100;
                    setSeekVal(frac);
                    novelSeekHandleRef.current?.scrollToProgress(frac);
                }}
                onChangeCommitted={() => setSeekVal(null)}
                sx={{ mx: 0.5, flex: 1 }}
            />
            <Typography variant="caption" sx={{ minWidth: 38, fontWeight: 'bold', textAlign: 'center' }}>
                {percent}%
            </Typography>
            <Tooltip title="Next Chapter">
                <span>
                    <IconButton size="small" disabled={!nextChapter} onClick={() => ReaderControls.openChapter('next')}>
                        <SkipNextIcon />
                    </IconButton>
                </span>
            </Tooltip>
            {openSettings && (
                <Tooltip title="Typography">
                    <IconButton size="small" onClick={openSettings}>
                        <FormatSizeIcon />
                    </IconButton>
                </Tooltip>
            )}
        </Paper>
    );
};
