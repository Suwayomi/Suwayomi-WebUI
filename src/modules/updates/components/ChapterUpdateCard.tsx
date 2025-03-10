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
import IconButton from '@mui/material/IconButton';
import { Link, useLocation } from 'react-router-dom';
import Refresh from '@mui/icons-material/Refresh';
import { useTranslation } from 'react-i18next';
import { memo } from 'react';
import { CustomTooltip } from '@/modules/core/components/CustomTooltip.tsx';
import { DownloadStateIndicator } from '@/modules/core/components/DownloadStateIndicator.tsx';
import { ChapterUpdateListFieldsFragment, DownloadState } from '@/lib/graphql/generated/graphql.ts';
import { AppRoutes } from '@/modules/core/AppRoute.constants.ts';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { makeToast } from '@/modules/core/utils/Toast.ts';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';
import { Chapters } from '@/modules/chapter/services/Chapters.ts';
import { ChapterCardThumbnail } from '@/modules/chapter/components/cards/ChapterCardThumbnail.tsx';
import { ChapterCardMetadata } from '@/modules/chapter/components/cards/ChapterCardMetadata.tsx';
import { ChapterDownloadButton } from '@/modules/chapter/components/buttons/ChapterDownloadButton.tsx';

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
                        <ChapterCardThumbnail
                            mangaId={manga.id}
                            mangaTitle={manga.title}
                            thumbnailUrl={manga.thumbnailUrl}
                            thumbnailUrlLastFetched={manga.thumbnailUrlLastFetched}
                        />
                        <ChapterCardMetadata title={manga.title} secondaryText={chapter.name} />
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
                    <ChapterDownloadButton chapterId={chapter.id} isDownloaded={chapter.isDownloaded} />
                </CardContent>
            </CardActionArea>
        </Card>
    );
});
