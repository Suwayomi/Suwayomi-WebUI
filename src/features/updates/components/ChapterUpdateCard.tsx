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
import { memo, useState } from 'react';
import { DownloadStateIndicator } from '@/base/components/downloads/DownloadStateIndicator.tsx';
import type { ChapterUpdateListFieldsFragment } from '@/lib/graphql/generated/graphql.ts';
import { AppRoutes } from '@/base/AppRoute.constants.ts';
import { ChapterCardThumbnail } from '@/features/chapter/components/cards/ChapterCardThumbnail.tsx';
import { ChapterCardMetadata } from '@/features/chapter/components/cards/ChapterCardMetadata.tsx';
import { ChapterDownloadButton } from '@/features/chapter/components/buttons/ChapterDownloadButton.tsx';
import { ChapterDownloadRetryButton } from '@/features/chapter/components/buttons/ChapterDownloadRetryButton.tsx';
import { Chapters } from '@/features/chapter/services/Chapters.ts';
import { ListCardContent } from '@/base/components/lists/cards/ListCardContent.tsx';
import { plural } from '@lingui/core/macro';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { MUIUtil } from '@/lib/mui/MUI.util.ts';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import Collapse from '@mui/material/Collapse';
import { STABLE_EMPTY_ARRAY } from '@/base/Base.constants.ts';
import { useTheme } from '@mui/material/styles';

export const ChapterUpdateCard = memo(
    ({
        chapter,
        otherChapters = STABLE_EMPTY_ARRAY,
    }: {
        chapter: ChapterUpdateListFieldsFragment;
        otherChapters?: ChapterUpdateListFieldsFragment[];
    }) => {
        const { manga } = chapter;

        const theme = useTheme();

        const [isExpanded, setIsExpanded] = useState(false);

        const isGroup = !!otherChapters.length;

        return (
            <Card>
                <CardActionArea
                    component={Link}
                    to={AppRoutes.reader.path(chapter.manga.id, chapter.sourceOrder)}
                    state={Chapters.getReaderOpenChapterLocationState(chapter)}
                    sx={{
                        color: theme.palette.text[chapter.isRead ? 'disabled' : 'primary'],
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
                                slots={
                                    isGroup
                                        ? {
                                              listCardAvatar: {
                                                  slots: {
                                                      spinnerImageProps: {
                                                          spinnerStyle: {
                                                              height: 74,
                                                              aspectRatio: '3 / 4',
                                                          },
                                                          imgStyle: {
                                                              height: 74,
                                                              aspectRatio: '3 / 4',
                                                          },
                                                      },
                                                      avatarProps: {
                                                          sx: {
                                                              height: 74,
                                                          },
                                                      },
                                                  },
                                              },
                                          }
                                        : undefined
                                }
                            />
                            <Stack>
                                <ChapterCardMetadata title={manga.title} secondaryText={chapter.name} />
                                {isGroup && (
                                    <Button
                                        sx={{ width: 'fit-content', ...theme.typography.caption }}
                                        variant="text"
                                        size="small"
                                        endIcon={isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                        {...MUIUtil.preventRippleProp()}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setIsExpanded(!isExpanded);
                                        }}
                                    >
                                        {plural(otherChapters.length, {
                                            one: 'Show # more chapter',
                                            other: 'Show # more chapters',
                                        })}
                                    </Button>
                                )}
                            </Stack>
                        </Box>
                        <DownloadStateIndicator chapterId={chapter.id} />
                        <ChapterDownloadRetryButton chapterId={chapter.id} />
                        <ChapterDownloadButton chapterId={chapter.id} isDownloaded={chapter.isDownloaded} />
                    </ListCardContent>
                </CardActionArea>
                {isGroup && (
                    <Collapse in={isExpanded} unmountOnExit>
                        {otherChapters.map((otherChapter) => (
                            <ChapterUpdateCard key={otherChapter.id} chapter={otherChapter} />
                        ))}
                    </Collapse>
                )}
            </Card>
        );
    },
);
