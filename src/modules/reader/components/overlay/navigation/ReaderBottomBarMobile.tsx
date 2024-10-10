/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import IconButton from '@mui/material/IconButton';
import SettingsIcon from '@mui/icons-material/Settings';
import Stack from '@mui/material/Stack';
import AppSettingsAltIcon from '@mui/icons-material/AppSettingsAlt';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import { alpha } from '@mui/material/styles';
import { bindDialog, bindTrigger, usePopupState } from 'material-ui-popup-state/hooks';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import { Virtuoso } from 'react-virtuoso';
import Tooltip from '@mui/material/Tooltip';
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';
import Slide from '@mui/material/Slide';
import { ReaderBottomBarMobileProps } from '@/modules//reader/types/ReaderOverlay.types.ts';
import { ChapterCard } from '@/modules//chapter/components/cards/ChapterCard.tsx';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { IChapterWithMeta } from '@/modules//chapter/components/ChapterList.tsx';
import { MobileReaderProgressBar } from '@/modules/reader/components/overlay/progress-bar/variants/MobileReaderProgressBar.tsx';
import { ReaderProgressBarProps } from '@/modules/reader/types/ReaderProgressBar.types.ts';

export const ReaderBottomBarMobile = ({
    openSettings,
    chapters,
    currentChapterIndex,
    isVisible,
    ...progressBarProps
}: ReaderBottomBarMobileProps & ReaderProgressBarProps) => {
    const { t } = useTranslation();

    const popupState = usePopupState({ variant: 'dialog', popupId: 'reader-chapter-list-dialog' });

    const { data: downloaderData } = requestManager.useGetDownloadStatus();
    const queue = downloaderData?.downloadStatus.queue ?? [];

    const chaptersWithMeta: IChapterWithMeta[] = useMemo(
        () =>
            chapters.map((chapter) => {
                const downloadChapter = queue?.find((cd) => cd.chapter.id === chapter.id);

                return {
                    chapter,
                    downloadChapter,
                    selected: null,
                };
            }),
        [queue],
    );

    return (
        <>
            <Slide direction="up" in={isVisible} mountOnEnter unmountOnExit>
                <Stack
                    sx={{
                        position: 'fixed',
                        bottom: 0,
                        width: '100%',
                        gap: 2,
                        pointerEvents: 'all',
                    }}
                >
                    <MobileReaderProgressBar {...progressBarProps} />
                    <Stack
                        sx={{
                            alignItems: 'center',
                            backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.95),
                        }}
                    >
                        <Stack
                            sx={{
                                width: '50%',
                                flexDirection: 'row',
                                p: 2,
                                gap: 1,
                                justifyContent: 'space-evenly',
                                alignItems: 'center',
                            }}
                        >
                            <Tooltip title={t('reader.button.chapter_list')}>
                                <IconButton {...bindTrigger(popupState)} size="large" color="inherit">
                                    <FormatListBulletedIcon />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title={t('reader.settings.label.reader_type')}>
                                <IconButton size="large" color="inherit">
                                    <AppSettingsAltIcon />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title={t('settings.title')}>
                                <IconButton onClick={openSettings} size="large" color="inherit">
                                    <SettingsIcon />
                                </IconButton>
                            </Tooltip>
                        </Stack>
                    </Stack>
                </Stack>
            </Slide>
            {popupState.isOpen && (
                <Dialog {...bindDialog(popupState)} fullWidth maxWidth="md" scroll="paper">
                    <DialogContent sx={{ p: 0, pb: 1 }}>
                        <Virtuoso
                            style={{
                                height: `calc(${chapters.length} * 100px)`,
                                minHeight: '15vh',
                                maxHeight: '75vh',
                            }}
                            initialTopMostItemIndex={currentChapterIndex}
                            totalCount={chaptersWithMeta.length}
                            itemContent={(index) => (
                                <ChapterCard
                                    key={chaptersWithMeta[index].chapter.id}
                                    mode="reader"
                                    chapter={chaptersWithMeta[index].chapter}
                                    downloadChapter={chaptersWithMeta[index].downloadChapter}
                                    allChapters={chapters}
                                    showChapterNumber
                                    selected={null}
                                    onSelect={() => undefined}
                                    selectable={false}
                                />
                            )}
                            overscan={window.innerHeight * 0.5}
                        />
                    </DialogContent>
                </Dialog>
            )}
        </>
    );
};
