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
import { memo, useCallback, useLayoutEffect, useRef, useState } from 'react';
import Drawer from '@mui/material/Drawer';
import { useGetOptionForDirection } from '@/modules/theme/services/ThemeCreator.ts';
import { ReaderNavBarDesktopProps } from '@/modules/reader/types/ReaderOverlay.types.ts';
import { ReaderNavContainer } from '@/modules/reader/components/overlay/navigation/desktop/ReaderNavContainer.tsx';
import { ReaderNavBarDesktopMetadata } from '@/modules/reader/components/overlay/navigation/desktop/ReaderNavBarDesktopMetadata.tsx';
import { ReaderNavBarDesktopPageNavigation } from '@/modules/reader/components/overlay/navigation/desktop/ReaderNavBarDesktopPageNavigation.tsx';
import { ReaderNavBarDesktopChapterNavigation } from '@/modules/reader/components/overlay/navigation/desktop/ReaderNavBarDesktopChapterNavigation.tsx';
import { ReaderNavBarDesktopQuickSettings } from '@/modules/reader/components/overlay/navigation/desktop/quick-settings/ReaderNavBarDesktopQuickSettings.tsx';
import { ReaderNavBarDesktopActions } from '@/modules/reader/components/overlay/navigation/desktop/ReaderNavBarDesktopActions.tsx';
import { useNavBarContext } from '@/modules/navigation-bar/contexts/NavbarContext.tsx';
import { useResizeObserver } from '@/modules/core/hooks/useResizeObserver.tsx';
import { useReaderStateMangaContext } from '@/modules/reader/contexts/state/ReaderStateMangaContext.tsx';
import { userReaderStatePagesContext } from '@/modules/reader/contexts/state/ReaderStatePagesContext.tsx';
import { useReaderStateChaptersContext } from '@/modules/reader/contexts/state/ReaderStateChaptersContext.tsx';
import { ReaderService } from '@/modules/reader/services/ReaderService.ts';
import { LoadingPlaceholder } from '@/modules/core/components/placeholder/LoadingPlaceholder.tsx';
import { NavbarContextType } from '@/modules/navigation-bar/NavigationBar.types.ts';
import { IReaderSettings, ReaderStateChapters, TReaderStateMangaContext } from '@/modules/reader/types/Reader.types.ts';
import { withPropsFrom } from '@/modules/core/hoc/withPropsFrom.tsx';
import { FALLBACK_MANGA } from '@/modules/manga/Manga.constants.ts';

const useGetPreviousNavBarStaticValue = (isVisible: boolean, isStaticNav: boolean) => {
    const wasNavBarStaticRef = useRef(isStaticNav);
    const wasNavBarStaticPreviousRef = useRef(isStaticNav);

    const resetWasNavBarStaticValue = wasNavBarStaticPreviousRef.current !== wasNavBarStaticRef.current && !isVisible;
    if (resetWasNavBarStaticValue) {
        wasNavBarStaticRef.current = false;
    }

    const didNavBarStaticValueChange = wasNavBarStaticPreviousRef.current !== isStaticNav;
    if (didNavBarStaticValueChange) {
        wasNavBarStaticRef.current = wasNavBarStaticPreviousRef.current;
        wasNavBarStaticPreviousRef.current = isStaticNav;
    }

    return wasNavBarStaticRef.current;
};

const BaseReaderNavBarDesktop = ({
    isVisible,
    openSettings,
    setReaderNavBarWidth,
    manga,
    chapters,
    currentChapter,
    previousChapter,
    nextChapter,
    isStaticNav,
    exit,
}: ReaderNavBarDesktopProps &
    Pick<NavbarContextType, 'setReaderNavBarWidth'> &
    Pick<TReaderStateMangaContext, 'manga'> &
    Pick<ReaderStateChapters, 'currentChapter' | 'previousChapter' | 'nextChapter' | 'chapters'> &
    Pick<IReaderSettings, 'isStaticNav'> & {
        exit: ReturnType<typeof ReaderService.useExit>;
    }) => {
    const { t } = useTranslation();

    const getOptionForDirection = useGetOptionForDirection();

    const updateReaderSettings = ReaderService.useCreateUpdateSetting(manga ?? FALLBACK_MANGA);

    const [navBarElement, setNavBarElement] = useState<HTMLDivElement | null>();
    useResizeObserver(
        navBarElement,
        useCallback(() => {
            if (!isStaticNav) {
                return;
            }

            setReaderNavBarWidth(navBarElement!.offsetWidth);
        }, [navBarElement, isStaticNav]),
    );
    useLayoutEffect(() => () => setReaderNavBarWidth(0), []);

    const wasNavBarStatic = useGetPreviousNavBarStaticValue(isVisible, isStaticNav);
    const changedNavBarStaticValue = wasNavBarStatic && isVisible;
    const drawerTransitionDuration = changedNavBarStaticValue ? 0 : undefined;

    return (
        <Drawer
            variant={isStaticNav ? 'permanent' : 'persistent'}
            open={isVisible || isStaticNav}
            transitionDuration={drawerTransitionDuration}
            SlideProps={{
                unmountOnExit: true,
            }}
            PaperProps={{
                ref: (ref: HTMLDivElement | null) => setNavBarElement(ref),
            }}
        >
            <ReaderNavContainer sx={{ backgroundColor: 'background.paper', pointerEvents: 'all' }}>
                <Stack sx={{ p: 2, gap: 2, backgroundColor: 'action.hover' }}>
                    <Stack sx={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Tooltip title={t('reader.button.exit')}>
                            <IconButton onClick={exit} color="inherit">
                                {getOptionForDirection(<ArrowBack />, <ArrowForwardIcon />)}
                            </IconButton>
                        </Tooltip>
                        <Tooltip title={t('reader.settings.label.static_navigation')}>
                            <IconButton
                                onClick={() => {
                                    setReaderNavBarWidth(0);
                                    updateReaderSettings('isStaticNav', !isStaticNav);
                                }}
                                color={isStaticNav ? 'primary' : 'inherit'}
                            >
                                <PushPinIcon />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                    {manga && currentChapter ? (
                        <>
                            <ReaderNavBarDesktopMetadata
                                mangaId={manga.id}
                                mangaTitle={manga.title}
                                chapterTitle={currentChapter.name}
                                scanlator={currentChapter.scanlator}
                            />
                            <ReaderNavBarDesktopActions />
                        </>
                    ) : (
                        <LoadingPlaceholder />
                    )}
                </Stack>
                <Stack sx={{ p: 2, gap: 2 }}>
                    <Stack sx={{ gap: 1 }}>
                        <ReaderNavBarDesktopPageNavigation />
                        <ReaderNavBarDesktopChapterNavigation
                            chapters={chapters}
                            currentChapter={currentChapter}
                            nextChapter={nextChapter}
                            previousChapter={previousChapter}
                        />
                    </Stack>
                    <Divider />
                    <ReaderNavBarDesktopQuickSettings openSettings={openSettings} />
                </Stack>
            </ReaderNavContainer>
        </Drawer>
    );
};

export const ReaderNavBarDesktop = withPropsFrom(
    memo(BaseReaderNavBarDesktop),
    [
        useNavBarContext,
        useReaderStateMangaContext,
        useReaderStateChaptersContext,
        userReaderStatePagesContext,
        ReaderService.useSettingsWithoutDefaultFlag,
        () => ({ exit: ReaderService.useExit() }),
    ],
    [
        'setReaderNavBarWidth',
        'manga',
        'chapters',
        'currentChapter',
        'previousChapter',
        'nextChapter',
        'isStaticNav',
        'exit',
    ],
);
