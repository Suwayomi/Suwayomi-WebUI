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
import type { ChapterHistoryListFieldsFragment } from '@/lib/graphql/generated/graphql.ts';
import { AppRoutes } from '@/base/AppRoute.constants.ts';
import { epochToDate, timeFormatter } from '@/base/utils/DateHelper.ts';
import { ChapterCardThumbnail } from '@/features/chapter/components/cards/ChapterCardThumbnail.tsx';
import { ChapterCardMetadata } from '@/features/chapter/components/cards/ChapterCardMetadata.tsx';
import { ListCardContent } from '@/base/components/lists/cards/ListCardContent';
import { Chapters } from '@/features/chapter/services/Chapters.ts';

export const GroupedChapterHistoryCard = memo(({ chapters }: { chapters: ChapterHistoryListFieldsFragment[] }) => {
    const processedData = useMemo(() => {
        if (chapters.length === 0) {return null;}

        const sortedByNumber = [...chapters].sort((a, b) => (a.chapterNumber ?? 0) - (b.chapterNumber ?? 0));

        const sortedByReadDate = [...chapters].sort((a, b) => Number(b.lastReadAt) - Number(a.lastReadAt));

        const [first] = sortedByNumber;
        const last = sortedByNumber[sortedByNumber.length - 1];
        const [mostRecent] = sortedByReadDate;

        return {
            firstChapterName: first?.name,
            lastChapterName: last?.name,
            lastReadAt: mostRecent?.lastReadAt,
            mostRecentChapter: mostRecent,
            manga: mostRecent.manga, // Extraemos el manga aquí
        };
    }, [chapters]);

    if (!processedData) {return null;}

    const { firstChapterName, lastChapterName, lastReadAt, mostRecentChapter, manga } = processedData;

    const formattedDate = timeFormatter.format(epochToDate(Number(lastReadAt)).valueOf());
    const chapterRange =
        firstChapterName === lastChapterName ? firstChapterName : `${firstChapterName} — ${lastChapterName}`;

    return (
        <Card>
            <CardActionArea
                component={Link}
                to={AppRoutes.reader.path(manga.id, mostRecentChapter.sourceOrder)}
                state={Chapters.getReaderOpenChapterLocationState(mostRecentChapter)}
                sx={{
                    color: (theme) => theme.palette.text[mostRecentChapter.isRead ? 'disabled' : 'primary'],
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
                        <ChapterCardMetadata title={manga.title} secondaryText={`${chapterRange} • ${formattedDate}`} />
                    </Box>
                </ListCardContent>
            </CardActionArea>
        </Card>
    );
});
