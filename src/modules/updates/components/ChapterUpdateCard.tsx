/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import DownloadIcon from '@mui/icons-material/Download';
import Box from '@mui/material/Box';
import CardActionArea from '@mui/material/CardActionArea';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import IconButton from '@mui/material/IconButton';
import { Link, useLocation } from 'react-router-dom';
import Refresh from '@mui/icons-material/Refresh';
import { useTranslation } from 'react-i18next';
import { memo } from 'react';
import { CustomTooltip } from '@/modules/core/components/CustomTooltip.tsx';
import { DownloadStateIndicator } from '@/modules/core/components/DownloadStateIndicator.tsx';
import { ChapterUpdateListFieldsFragment, DownloadState } from '@/lib/graphql/generated/graphql.ts';
import { Mangas } from '@/modules/manga/services/Mangas.ts';
import { SpinnerImage } from '@/modules/core/components/SpinnerImage.tsx';
import { TypographyMaxLines } from '@/modules/core/components/TypographyMaxLines.tsx';
import { AppRoutes } from '@/modules/core/AppRoute.constants.ts';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { makeToast } from '@/modules/core/utils/Toast.ts';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';
import { Chapters } from '@/modules/chapter/services/Chapters.ts';

export const ChapterUpdateCard = memo(({ chapter }: { chapter: ChapterUpdateListFieldsFragment }) => {
    const { manga } = chapter;
    const download = Chapters.useDownloadStatusFromCache(chapter.id);

    const { t } = useTranslation();
    const location = useLocation();

    const handleRetry = async () => {
        try {
            await requestManager.addChapterToDownloadQueue(chapter.id).response;
        } catch (e) {
            makeToast(t('download.queue.error.label.failed_to_retry'), 'error', getErrorMessage(e));
        }
    };

    const downloadChapter = () => {
        requestManager
            .addChapterToDownloadQueue(chapter.id)
            .response.catch((e) =>
                makeToast(t('global.error.label.failed_to_save_changes'), 'error', getErrorMessage(e)),
            );
    };

    return (
        <Card>
            <CardActionArea
                component={Link}
                to={AppRoutes.reader.path(chapter.manga.id, chapter.sourceOrder)}
                state={location.state}
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
                    <Box sx={{ display: 'flex', flexGrow: 1 }}>
                        <Link to={AppRoutes.manga.path(chapter.manga.id)} style={{ textDecoration: 'none' }}>
                            <Avatar
                                variant="rounded"
                                sx={{
                                    width: 56,
                                    height: 56,
                                    flex: '0 0 auto',
                                    marginRight: 1,
                                    background: 'transparent',
                                }}
                            >
                                <SpinnerImage
                                    imgStyle={{
                                        objectFit: 'cover',
                                        width: '100%',
                                        height: '100%',
                                        imageRendering: 'pixelated',
                                    }}
                                    spinnerStyle={{ small: true }}
                                    alt={manga.title}
                                    src={Mangas.getThumbnailUrl(manga)}
                                />
                            </Avatar>
                        </Link>
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                flexGrow: 1,
                                flexShrink: 1,
                                wordBreak: 'break-word',
                            }}
                        >
                            <TypographyMaxLines variant="h6" component="h3">
                                {manga.title}
                            </TypographyMaxLines>
                            <TypographyMaxLines variant="caption" display="block" lines={1}>
                                {chapter.name}
                            </TypographyMaxLines>
                        </Box>
                    </Box>
                    <DownloadStateIndicator chapterId={chapter.id} />
                    {download?.state === DownloadState.Error && (
                        <CustomTooltip title={t('global.button.retry')}>
                            <IconButton
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleRetry();
                                }}
                                size="large"
                            >
                                <Refresh />
                            </IconButton>
                        </CustomTooltip>
                    )}
                    {download == null && !chapter.isDownloaded && (
                        <CustomTooltip title={t('chapter.action.download.add.label.action')}>
                            <IconButton
                                onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    downloadChapter();
                                }}
                                size="large"
                            >
                                <DownloadIcon />
                            </IconButton>
                        </CustomTooltip>
                    )}
                </CardContent>
            </CardActionArea>
        </Card>
    );
});
