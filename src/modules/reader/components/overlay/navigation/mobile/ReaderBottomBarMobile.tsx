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
import { useTranslation } from 'react-i18next';
import Slide from '@mui/material/Slide';
import { memo, useCallback, useLayoutEffect, useRef, useState } from 'react';
import { CustomTooltip } from '@/modules/core/components/CustomTooltip.tsx';
import { ReaderBottomBarMobileProps } from '@/modules/reader/types/ReaderOverlay.types.ts';
import { MobileReaderProgressBar } from '@/modules/reader/components/overlay/progress-bar/variants/MobileReaderProgressBar.tsx';
import { ReaderChapterList } from '@/modules/reader/components/overlay/navigation/ReaderChapterList.tsx';
import { ReaderBottomBarMobileQuickSettings } from '@/modules/reader/components/overlay/navigation/mobile/ReaderBottomBarMobileQuickSettings.tsx';
import { useReaderStateChaptersContext } from '@/modules/reader/contexts/state/ReaderStateChaptersContext.tsx';
import { useReaderScrollbarContext } from '@/modules/reader/contexts/ReaderScrollbarContext.tsx';
import { ReaderStateChapters, TReaderScrollbarContext } from '@/modules/reader/types/Reader.types.ts';
import { withPropsFrom } from '@/modules/core/hoc/withPropsFrom.tsx';
import { useResizeObserver } from '@/modules/core/hooks/useResizeObserver.tsx';

const BaseReaderBottomBarMobile = ({
    openSettings,
    isVisible,
    currentChapter,
    chapters,
    scrollbarXSize,
    scrollbarYSize,
    topOffset = 0,
}: ReaderBottomBarMobileProps &
    Pick<ReaderStateChapters, 'currentChapter' | 'chapters'> &
    Pick<TReaderScrollbarContext, 'scrollbarXSize' | 'scrollbarYSize'> & { topOffset?: number }) => {
    const { t } = useTranslation();

    const chapterListPopupState = usePopupState({ variant: 'dialog', popupId: 'reader-chapter-list-dialog' });
    const quickSettingsPopupState = usePopupState({ variant: 'dialog', popupId: 'reader-quick-settings-dialog' });

    const [bottomBarRefHeight, setBottomBarRefHeight] = useState(0);
    const bottomBarRef = useRef<HTMLDivElement>(null);
    useResizeObserver(
        bottomBarRef,
        useCallback(() => setBottomBarRefHeight(bottomBarRef.current?.clientHeight ?? 0), [bottomBarRefHeight]),
    );

    useLayoutEffect(() => {
        chapterListPopupState.close();
    }, [currentChapter?.id]);

    return (
        <>
            <Stack
                sx={{
                    position: 'fixed',
                    right: `${scrollbarYSize}px`,
                    bottom: 0,
                    left: 0,
                    height: `calc(100% - ${topOffset}px)`,
                }}
            >
                <MobileReaderProgressBar topOffset={topOffset} bottomOffset={bottomBarRefHeight} />
                <Slide direction="up" in={isVisible}>
                    <Stack
                        ref={bottomBarRef}
                        sx={{
                            alignItems: 'center',
                            backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.95),
                            pb: `max(${scrollbarXSize}px, env(safe-area-inset-bottom))`,
                            boxShadow: 2,
                            pointerEvents: 'all',
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
                            <CustomTooltip title={t('reader.button.chapter_list')}>
                                <IconButton {...bindTrigger(chapterListPopupState)} size="large" color="inherit">
                                    <FormatListBulletedIcon />
                                </IconButton>
                            </CustomTooltip>
                            <CustomTooltip title={t('reader.settings.title.quick_settings')}>
                                <IconButton {...bindTrigger(quickSettingsPopupState)} size="large" color="inherit">
                                    <AppSettingsAltIcon />
                                </IconButton>
                            </CustomTooltip>
                            <CustomTooltip title={t('settings.title')}>
                                <IconButton onClick={openSettings} size="large" color="inherit">
                                    <SettingsIcon />
                                </IconButton>
                            </CustomTooltip>
                        </Stack>
                    </Stack>
                </Slide>
            </Stack>
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

export const ReaderBottomBarMobile = withPropsFrom(
    memo(BaseReaderBottomBarMobile),
    [useReaderStateChaptersContext, useReaderScrollbarContext],
    ['currentChapter', 'chapters', 'scrollbarXSize', 'scrollbarYSize'],
);
