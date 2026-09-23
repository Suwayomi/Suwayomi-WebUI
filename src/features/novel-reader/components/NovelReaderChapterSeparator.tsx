/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { useLingui } from '@lingui/react/macro';
import React from 'react';
import type { TChapterReader } from '@/features/chapter/Chapter.types.ts';

export interface NovelReaderChapterSeparatorProps {
    previousChapter: TChapterReader;
    currentChapter: TChapterReader;
}

export const NovelReaderChapterSeparator: React.FC<NovelReaderChapterSeparatorProps> = ({
    previousChapter,
    currentChapter,
}) => {
    const { t } = useLingui();
    const theme = useTheme();

    return (
        <Stack
            className="novel-reader-chapter-separator"
            sx={{
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '280px',
                py: 6,
                px: 2,
                userSelect: 'none',
            }}
        >
            <Stack sx={{ gap: 4, width: 'max-content', maxWidth: '100%', alignItems: 'flex-start' }}>
                <Stack sx={{ gap: 0.5, alignItems: 'flex-start' }}>
                    <Typography sx={{ color: theme.palette.text.secondary, fontSize: '0.95rem' }}>
                        {t`Previous:`}
                    </Typography>
                    <Typography sx={{ color: theme.palette.text.primary, fontWeight: 500 }} variant="h6" component="h2">
                        {previousChapter.name}
                    </Typography>
                    {previousChapter.scanlator && (
                        <Typography variant="body2" sx={{ color: theme.palette.text.disabled }}>
                            {previousChapter.scanlator}
                        </Typography>
                    )}
                </Stack>
                <Stack sx={{ gap: 0.5, alignItems: 'flex-start' }}>
                    <Typography sx={{ color: theme.palette.text.secondary, fontSize: '0.95rem' }}>
                        {t`Current:`}
                    </Typography>
                    <Typography sx={{ color: theme.palette.text.primary, fontWeight: 500 }} variant="h6" component="h2">
                        {currentChapter.name}
                    </Typography>
                    {currentChapter.scanlator && (
                        <Typography variant="body2" sx={{ color: theme.palette.text.disabled }}>
                            {currentChapter.scanlator}
                        </Typography>
                    )}
                </Stack>
            </Stack>
        </Stack>
    );
};
