/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { memo, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { useLingui } from '@lingui/react/macro';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { Chapters } from '@/features/chapter/services/Chapters.ts';
import { LoadingPlaceholder } from '@/base/components/feedback/LoadingPlaceholder.tsx';
import { EmptyViewAbsoluteCentered } from '@/base/components/feedback/EmptyViewAbsoluteCentered.tsx';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';
import type { TChapterReader } from '@/features/chapter/Chapter.types.ts';

const buildSrcDoc = (body: string, fontSize: number, background: string, text: string): string =>
    `<!doctype html><html><head><meta charset="utf-8">` +
    `<style>` +
    `body{margin:0 !important;padding:28px 20px !important;font-family:Georgia,serif;` +
    `font-size:${fontSize}px !important;line-height:1.75 !important;` +
    `color:${text} !important;background:${background} !important;}` +
    `body *{color:${text} !important;background-color:transparent !important;}` +
    `a{color:${text} !important;text-decoration:underline !important;}` +
    `p{margin:0 0 1.1em;}img{max-width:100% !important;height:auto !important;}` +
    `</style>` +
    `</head><body>${body}</body></html>`;

const BaseNovelReader = ({
    mangaId,
    mangaTitle,
    currentChapter,
    mangaChapters,
}: {
    mangaId: number;
    mangaTitle: string;
    currentChapter: TChapterReader;
    mangaChapters: TChapterReader[];
}) => {
    const { t } = useLingui();
    const navigate = useNavigate();
    const appTheme = useTheme();

    const background = appTheme.palette.background.default;
    const textColor = appTheme.palette.getContrastText(background);

    const [html, setHtml] = useState<string | null>(null);
    const [error, setError] = useState<unknown>(null);
    const [fontSize, setFontSize] = useState<number>(19);

    const chapterIndex = currentChapter.sourceOrder;

    const { prevChapter, nextChapter } = useMemo(() => {
        const sorted = [...mangaChapters].sort((a, b) => a.sourceOrder - b.sourceOrder);
        const idx = sorted.findIndex((c) => c.sourceOrder === chapterIndex);
        return {
            prevChapter: idx > 0 ? sorted[idx - 1] : undefined,
            nextChapter: idx >= 0 && idx < sorted.length - 1 ? sorted[idx + 1] : undefined,
        };
    }, [mangaChapters, chapterIndex]);

    useEffect(() => {
        let cancelled = false;
        setHtml(null);
        setError(null);

        const url = requestManager.getValidImgUrlFor(
            `manga/${mangaId}/chapter/${chapterIndex}/text`,
            '/api/v1/',
        );

        requestManager
            .getClient()
            .fetcher(url, { checkResponseIsJson: false })
            .then((res) => res.text())
            .then((text) => {
                if (!cancelled) {
                    if (!text.trim()) {
                        throw new Error('Empty chapter');
                    }
                    setHtml(text);
                }
            })
            .catch((e) => {
                if (!cancelled) {
                    setError(e);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [mangaId, chapterIndex]);

    const openChapter = (chapter?: TChapterReader) => {
        if (chapter) {
            navigate(Chapters.getReaderUrl(chapter));
        }
    };

    if (error) {
        return <EmptyViewAbsoluteCentered message={t`Unable to load chapter`} messageExtra={getErrorMessage(error)} />;
    }

    return (
        <Box
            sx={{
                position: 'fixed',
                inset: 0,
                zIndex: (theme) => theme.zIndex.appBar + 2,
                bgcolor: 'background.default',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                userSelect: 'text',
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    px: 2,
                    py: 1,
                    borderBottom: 1,
                    borderColor: 'divider',
                    flexShrink: 0,
                }}
            >
                <Typography variant="body2" color="text.secondary" noWrap sx={{ flex: 1 }}>
                    {mangaTitle} · {currentChapter.name}
                </Typography>
                <Button size="small" onClick={() => setFontSize((s) => Math.max(12, s - 2))}>
                    A-
                </Button>
                <Button size="small" onClick={() => setFontSize((s) => Math.min(40, s + 2))}>
                    A+
                </Button>
            </Box>

            <Box sx={{ flex: 1, overflow: 'auto', display: 'flex' }}>
                {html === null ? (
                    <LoadingPlaceholder />
                ) : (
                    <Box
                        component="iframe"
                        title={currentChapter.name}
                        sandbox=""
                        srcDoc={buildSrcDoc(html, fontSize, background, textColor)}
                        sx={{ flex: 1, width: '100%', maxWidth: 800, mx: 'auto', border: 0 }}
                    />
                )}
            </Box>

            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: 2,
                    px: 2,
                    py: 1,
                    borderTop: 1,
                    borderColor: 'divider',
                    flexShrink: 0,
                }}
            >
                <Button disabled={!prevChapter} onClick={() => openChapter(prevChapter)}>
                    {t`Previous`}
                </Button>
                <Button disabled={!nextChapter} onClick={() => openChapter(nextChapter)}>
                    {t`Next`}
                </Button>
            </Box>
        </Box>
    );
};

export const NovelReader = memo(BaseNovelReader);
