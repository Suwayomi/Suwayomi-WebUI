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
import Tooltip from '@mui/material/Tooltip';
import { useTranslation } from 'react-i18next';
import Slide from '@mui/material/Slide';
import { useLayoutEffect } from 'react';
import { ReaderBottomBarMobileProps } from '@/modules/reader/types/ReaderOverlay.types.ts';
import { MobileReaderProgressBar } from '@/modules/reader/components/overlay/progress-bar/variants/MobileReaderProgressBar.tsx';
import { ReaderChapterList } from '@/modules/reader/components/overlay/navigation/ReaderChapterList.tsx';
import { ReaderBottomBarMobileQuickSettings } from '@/modules/reader/components/overlay/navigation/mobile/ReaderBottomBarMobileQuickSettings.tsx';
import { useReaderStateChaptersContext } from '@/modules/reader/contexts/state/ReaderStateChaptersContext.tsx';
import { useReaderScrollbarContext } from '@/modules/reader/contexts/ReaderScrollbarContext.tsx';

export const ReaderBottomBarMobile = ({ openSettings, isVisible }: ReaderBottomBarMobileProps) => {
    const { t } = useTranslation();
    const { currentChapter, chapters } = useReaderStateChaptersContext();
    const { scrollbarXSize, scrollbarYSize } = useReaderScrollbarContext();

    const chapterListPopupState = usePopupState({ variant: 'dialog', popupId: 'reader-chapter-list-dialog' });
    const quickSettingsPopupState = usePopupState({ variant: 'dialog', popupId: 'reader-quick-settings-dialog' });

    useLayoutEffect(() => {
        chapterListPopupState.close();
    }, [currentChapter?.id]);

    return (
        <>
            <Slide direction="up" in={isVisible} mountOnEnter unmountOnExit>
                <Stack
                    sx={{
                        position: 'fixed',
                        right: `${scrollbarYSize}px`,
                        bottom: 0,
                        left: 0,
                        gap: 2,
                        pointerEvents: 'all',
                    }}
                >
                    <MobileReaderProgressBar />
                    <Stack
                        sx={{
                            alignItems: 'center',
                            backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.95),
                            pb: `max(${scrollbarXSize}px, env(safe-area-inset-bottom))`,
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
                                <IconButton {...bindTrigger(chapterListPopupState)} size="large" color="inherit">
                                    <FormatListBulletedIcon />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title={t('reader.settings.label.reader_type')}>
                                <IconButton {...bindTrigger(quickSettingsPopupState)} size="large" color="inherit">
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
            {chapterListPopupState.isOpen && (
                <Dialog {...bindDialog(chapterListPopupState)} fullWidth maxWidth="md" scroll="paper">
                    <DialogContent sx={{ p: 0, pb: 1 }}>
                        <ReaderChapterList
                            style={{
                                minHeight: '15vh',
                                maxHeight: '75vh',
                            }}
                            currentChapter={currentChapter}
                            chapters={chapters}
                        />
                    </DialogContent>
                </Dialog>
            )}
            {quickSettingsPopupState.isOpen && (
                <Dialog {...bindDialog(quickSettingsPopupState)} fullWidth maxWidth="md" scroll="paper">
                    <DialogContent>
                        <ReaderBottomBarMobileQuickSettings />
                    </DialogContent>
                </Dialog>
            )}
        </>
    );
};
