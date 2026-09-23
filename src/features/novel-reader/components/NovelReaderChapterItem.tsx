/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { useLingui } from '@lingui/react/macro';
import React, { memo } from 'react';
import type { TChapterReader } from '@/features/chapter/Chapter.types.ts';
import type {
    NovelReaderSettingsState,
    NovelReaderThemeColors,
} from '@/features/novel-reader/stores/NovelReaderSettingsStore.ts';
import { NovelReaderIframe } from '@/features/novel-reader/components/NovelReaderIframe.tsx';
import { requestManager } from '@/lib/requests/RequestManager.ts';

export interface NovelReaderChapterItemProps {
    chapter: TChapterReader;
    settings: Pick<
        NovelReaderSettingsState,
        'fontFamily' | 'fontSize' | 'lineHeight' | 'maxWidth' | 'textAlign' | 'margin' | 'paragraphSpacing'
    >;
    themeColors: NovelReaderThemeColors;
    onToggleControls: () => void;
    onKeyDown: (key: string) => void;
    onHeightChange: (chapterId: number, height: number) => void;
    onWheelUp: (chapterId: number) => void;
    onWheelDown: (chapterId: number) => void;
    onLoadFailure: (chapterId: number) => void;
}

export const NovelReaderChapterItem: React.FC<NovelReaderChapterItemProps> = memo(
    ({
        chapter,
        settings,
        themeColors,
        onToggleControls,
        onKeyDown,
        onHeightChange,
        onWheelUp,
        onWheelDown,
        onLoadFailure,
    }) => {
        const { t } = useLingui();
        const textResponse = requestManager.useGetChapterTextContent(chapter.id);
        const textContent = textResponse.data?.chapter?.textContent;
        const failed = !!textResponse.error || (!textResponse.loading && (!textContent || !textContent.html));

        React.useEffect(() => {
            if (failed) {
                onLoadFailure(chapter.id);
            }
        }, [failed, chapter.id, onLoadFailure]);

        if (textResponse.loading && !textContent) {
            return (
                <Box
                    sx={{
                        width: '100%',
                        minHeight: 400,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <CircularProgress />
                </Box>
            );
        }

        if (textResponse.error || (!textResponse.loading && (!textContent || !textContent.html))) {
            return (
                <Box
                    sx={{
                        width: '100%',
                        minHeight: 300,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        p: 3,
                        gap: 2,
                    }}
                >
                    <Typography variant="h6" color={textResponse.error ? 'error' : 'text.secondary'}>
                        {t`Failed to load chapter text`}
                    </Typography>
                    {textResponse.error && (
                        <Typography variant="body2" color="text.secondary">
                            {textResponse.error.message}
                        </Typography>
                    )}
                    <Button variant="outlined" onClick={() => textResponse.refetch()}>
                        {t`Retry`}
                    </Button>
                </Box>
            );
        }

        return (
            <NovelReaderIframe
                html={textContent?.html ?? ''}
                customCss={textContent?.customCss}
                customJs={textContent?.customJs}
                settings={settings}
                themeColors={themeColors}
                onToggleControls={onToggleControls}
                onKeyDown={onKeyDown}
                onHeightChange={(h) => onHeightChange(chapter.id, h)}
                onWheelUp={() => onWheelUp(chapter.id)}
                onWheelDown={() => onWheelDown(chapter.id)}
            />
        );
    },
);

NovelReaderChapterItem.displayName = 'NovelReaderChapterItem';
