/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import { useTranslation } from 'react-i18next';
import IconButton from '@mui/material/IconButton';
import ArrowBack from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PushPinIcon from '@mui/icons-material/PushPin';
import Divider from '@mui/material/Divider';
import { useCallback, useRef, useState } from 'react';
import Drawer from '@mui/material/Drawer';
import { useGetOptionForDirection } from '@/theme.tsx';
import { ReaderNavBarDesktopProps } from '@/modules/reader/types/ReaderOverlay.types.ts';
import { useBackButton } from '@/modules/core/hooks/useBackButton.ts';
import { ReaderNavContainer } from '@/modules/reader/components/overlay/navigation/desktop/ReaderNavContainer.tsx';
import { ReaderNavBarDesktopMetadata } from '@/modules/reader/components/overlay/navigation/desktop/ReaderNavBarDesktopMetadata.tsx';
import { ReaderNavBarDesktopPageNavigation } from '@/modules/reader/components/overlay/navigation/desktop/ReaderNavBarDesktopPageNavigation.tsx';
import { ReaderNavBarDesktopChapterNavigation } from '@/modules/reader/components/overlay/navigation/desktop/ReaderNavBarDesktopChapterNavigation.tsx';
import { ReaderNavBarDesktopQuickSettings } from '@/modules/reader/components/overlay/navigation/desktop/quick-settings/ReaderNavBarDesktopQuickSettings.tsx';
import { ReaderNavBarDesktopActions } from '@/modules/reader/components/overlay/navigation/desktop/ReaderNavBarDesktopActions.tsx';
import { useNavBarContext } from '@/modules/navigation-bar/contexts/NavbarContext.tsx';
import { useResizeObserver } from '@/modules/core/hooks/useResizeObserver.tsx';
import { useReaderStateMangaContext } from '@/modules/reader/contexts/state/ReaderStateMangaContext.tsx';
import {
    createUpdateReaderSettings,
    getReaderSettingsFor,
    useDefaultReaderSettings,
} from '@/modules/reader-deprecated/services/ReaderSettingsMetadata.ts';
import { makeToast } from '@/modules/core/utils/Toast.ts';
import { userReaderStatePagesContext } from '@/modules/reader/contexts/state/ReaderStatePagesContext.tsx';
import { useReaderStateChaptersContext } from '@/modules/reader/contexts/state/ReaderStateChaptersContext.tsx';

const useGetPreviousNavBarStaticValue = (isVisible: boolean, staticNav: boolean) => {
    const wasNavBarStaticRef = useRef(staticNav);
    const wasNavBarStaticPreviousRef = useRef(staticNav);

    const resetWasNavBarStaticValue = wasNavBarStaticPreviousRef.current !== wasNavBarStaticRef.current && !isVisible;
    if (resetWasNavBarStaticValue) {
        wasNavBarStaticRef.current = false;
    }

    const didNavBarStaticValueChange = wasNavBarStaticPreviousRef.current !== staticNav;
    if (didNavBarStaticValueChange) {
        wasNavBarStaticRef.current = wasNavBarStaticPreviousRef.current;
        wasNavBarStaticPreviousRef.current = staticNav;
    }

    return wasNavBarStaticRef.current;
};

export const ReaderNavBarDesktop = ({ isVisible, setIsVisible }: ReaderNavBarDesktopProps) => {
    const { t } = useTranslation();
    const { setReaderNavBarWidth } = useNavBarContext();
    const { manga } = useReaderStateMangaContext();
    const { chapters, currentChapter, nextChapter, previousChapter } = useReaderStateChaptersContext();
    const { pages, currentPageIndex, setCurrentPageIndex } = userReaderStatePagesContext();

    const handleBack = useBackButton();
    const getOptionForDirection = useGetOptionForDirection();

    const updateReaderSettings = createUpdateReaderSettings(manga ?? { id: -1 }, () =>
        makeToast(t('reader.settings.error.label.failed_to_save_settings')),
    );

    const defaultReaderSettings = useDefaultReaderSettings();
    const readerSettings = getReaderSettingsFor(manga, defaultReaderSettings.settings);

    const [navBarElement, setNavBarElement] = useState<HTMLDivElement | null>();
    useResizeObserver(
        navBarElement,
        useCallback(() => {
            if (!readerSettings?.staticNav) {
                return;
            }

            setReaderNavBarWidth(navBarElement!.clientWidth);
        }, [navBarElement, readerSettings?.staticNav]),
    );

    const wasNavBarStatic = useGetPreviousNavBarStaticValue(isVisible, readerSettings.staticNav);
    const changedNavBarStaticValue = wasNavBarStatic && isVisible;
    const drawerTransitionDuration = changedNavBarStaticValue ? 0 : undefined;

    if (!manga || !currentChapter) {
        return null;
    }

    return (
        <Drawer
            variant={readerSettings.staticNav ? 'permanent' : 'temporary'}
            open={isVisible || readerSettings.staticNav}
            onClose={() => {
                setIsVisible(false);
                setReaderNavBarWidth(0);
            }}
            transitionDuration={drawerTransitionDuration}
        >
            <ReaderNavContainer
                ref={(ref) => setNavBarElement(ref)}
                sx={{ backgroundColor: 'background.paper', pointerEvents: 'all' }}
            >
                <Stack sx={{ p: 2, gap: 2, backgroundColor: 'action.hover' }}>
                    <Stack sx={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Tooltip title={t('reader.button.exit')}>
                            <IconButton onClick={handleBack} color="inherit">
                                {getOptionForDirection(<ArrowBack />, <ArrowForwardIcon />)}
                            </IconButton>
                        </Tooltip>
                        <Tooltip title={t('reader.settings.label.static_navigation')}>
                            <IconButton
                                onClick={() => {
                                    setReaderNavBarWidth(0);
                                    updateReaderSettings('staticNav', !readerSettings.staticNav);
                                }}
                                color={readerSettings.staticNav ? 'primary' : 'inherit'}
                            >
                                <PushPinIcon />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                    <ReaderNavBarDesktopMetadata mangaTitle={manga.title} chapterTitle={currentChapter.name} />
                    <ReaderNavBarDesktopActions currentChapter={currentChapter} />
                </Stack>
                <Stack sx={{ p: 2, gap: 2 }}>
                    <Stack sx={{ gap: 1 }}>
                        <ReaderNavBarDesktopPageNavigation
                            currentPageIndex={currentPageIndex}
                            setCurrentPageIndex={setCurrentPageIndex}
                            pages={pages}
                        />
                        <ReaderNavBarDesktopChapterNavigation
                            chapters={chapters}
                            currentChapter={currentChapter}
                            nextChapter={nextChapter}
                            previousChapter={previousChapter}
                        />
                    </Stack>
                    <Divider />
                    <ReaderNavBarDesktopQuickSettings settings={readerSettings} updateSetting={updateReaderSettings} />
                </Stack>
            </ReaderNavContainer>
        </Drawer>
    );
};
