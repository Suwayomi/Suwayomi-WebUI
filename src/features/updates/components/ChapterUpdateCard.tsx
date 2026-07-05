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
import { Link } from 'react-router-dom';
import { memo, useMemo } from 'react';
import { DownloadStateIndicator } from '@/base/components/downloads/DownloadStateIndicator.tsx';
import type { ChapterUpdateListFieldsFragment } from '@/lib/graphql/generated/graphql.ts';
import { AppRoutes } from '@/base/AppRoute.constants.ts';
import { ChapterCardThumbnail } from '@/features/chapter/components/cards/ChapterCardThumbnail.tsx';
import { ChapterCardMetadata } from '@/features/chapter/components/cards/ChapterCardMetadata.tsx';
import { ChapterDownloadButton } from '@/features/chapter/components/buttons/ChapterDownloadButton.tsx';
import { ChapterDownloadRetryButton } from '@/features/chapter/components/buttons/ChapterDownloadRetryButton.tsx';
import { Chapters } from '@/features/chapter/services/Chapters.ts';
import { ListCardContent } from '@/base/components/lists/cards/ListCardContent.tsx';
import { useLingui } from '@lingui/react/macro';
import { plural } from '@lingui/core/macro';

export const ChapterUpdateCard = memo(
    ({
        chapter,
        otherChapters,
    }: {
        chapter: ChapterUpdateListFieldsFragment;
        otherChapters: ChapterUpdateListFieldsFragment[];
    }) => {
        const { manga } = chapter;

        const { t } = useLingui();

        const uniqueOtherChapters = useMemo(
            () => Chapters.removeDuplicates(chapter, otherChapters),
            [chapter, otherChapters],
        );
        const otherChaptersCount = uniqueOtherChapters.length;
        const firstFewOtherChapters = uniqueOtherChapters.slice(-3);

        const otherChaptersText = (() => {
            if (!otherChaptersCount) {
                return '';
            }

            const firstFewUpdatesString = firstFewOtherChapters
                .map((otherChapter) => `#${otherChapter.chapterNumber}`)
                .toReversed()
                .join(', ');

            if (otherChaptersCount > firstFewOtherChapters.length) {
                const remainingUpdatesCount = otherChaptersCount - firstFewOtherChapters.length;

                return t`Plus chapters ${firstFewUpdatesString} and ${remainingUpdatesCount} more`;
            }

            return plural(firstFewOtherChapters.length, {
                one: `Plus chapter ${firstFewUpdatesString}`,
                other: `Plus chapters ${firstFewUpdatesString}`,
            });
        })();

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
                    <ListCardContent sx={{ justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', flexGrow: 1, gap: 1 }}>
                            <ChapterCardThumbnail
                                mangaId={manga.id}
                                sourceId={manga.sourceId}
                                mangaTitle={manga.title}
                                thumbnailUrl={manga.thumbnailUrl}
                                thumbnailUrlLastFetched={manga.thumbnailUrlLastFetched}
                            />
                            <ChapterCardMetadata
                                title={manga.title}
                                secondaryText={chapter.name}
                                ternaryText={otherChaptersText}
                            />
                        </Box>
                        <DownloadStateIndicator chapterId={chapter.id} />
                        <ChapterDownloadRetryButton chapterId={chapter.id} />
                        <ChapterDownloadButton chapterId={chapter.id} isDownloaded={chapter.isDownloaded} />
                    </ListCardContent>
                </CardActionArea>
            </Card>
        );
    },
);
