/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Box from '@mui/material/Box';
import CardActionArea from '@mui/material/CardActionArea';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { Link } from 'react-router-dom';
import { memo } from 'react';
import { DownloadStateIndicator } from '@/modules/core/components/DownloadStateIndicator.tsx';
import { ChapterUpdateListFieldsFragment } from '@/lib/graphql/generated/graphql.ts';
import { AppRoutes } from '@/modules/core/AppRoute.constants.ts';
import { ChapterCardThumbnail } from '@/modules/chapter/components/cards/ChapterCardThumbnail.tsx';
import { ChapterCardMetadata } from '@/modules/chapter/components/cards/ChapterCardMetadata.tsx';
import { ChapterDownloadButton } from '@/modules/chapter/components/buttons/ChapterDownloadButton.tsx';
import { ChapterDownloadRetryButton } from '@/modules/chapter/components/buttons/ChapterDownloadRetryButton.tsx';
import { Chapters } from '@/modules/chapter/services/Chapters.ts';

export const ChapterUpdateCard = memo(({ chapter }: { chapter: ChapterUpdateListFieldsFragment }) => {
    const { manga } = chapter;

    return (
        <Card>
            <CardActionArea
                component={Link}
                to={AppRoutes.reader.path(chapter.manga.id, chapter.sourceOrder)}
                state={Chapters.getReaderOpenChapterLocationState(chapter)}
                sx={{
                    color: (theme) => theme.palette.text[chapter.isRead ? 'disabled' : 'primary'],
                }}
            >
                <CardContent
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: 1.5,
                    }}
                >
                    <Box sx={{ display: 'flex', flexGrow: 1, gap: 1 }}>
                        <ChapterCardThumbnail
                            mangaId={manga.id}
                            mangaTitle={manga.title}
                            thumbnailUrl={manga.thumbnailUrl}
                            thumbnailUrlLastFetched={manga.thumbnailUrlLastFetched}
                        />
                        <ChapterCardMetadata title={manga.title} secondaryText={chapter.name} />
                    </Box>
                    <DownloadStateIndicator chapterId={chapter.id} />
                    <ChapterDownloadRetryButton chapterId={chapter.id} />
                    <ChapterDownloadButton chapterId={chapter.id} isDownloaded={chapter.isDownloaded} />
                </CardContent>
            </CardActionArea>
        </Card>
    );
});
