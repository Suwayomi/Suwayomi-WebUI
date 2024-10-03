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
import { useCallback, useState } from 'react';
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

export const ReaderNavBarDesktop = ({
    manga,
    chapter,
    chapters,
    currentChapterIndex,
    pages,
    currentPageIndex,
    setCurrentPageIndex,
    isVisible,
    setIsVisible,
}: ReaderNavBarDesktopProps) => {
    const { t } = useTranslation();
    const { setReaderNavBarWidth } = useNavBarContext();

    const [navBarElement, setNavBarElement] = useState<HTMLDivElement | null>();
    useResizeObserver(
        navBarElement,
        useCallback(() => {
            setReaderNavBarWidth(navBarElement!.clientWidth);
        }, [navBarElement]),
    );

    const handleBack = useBackButton();
    const getOptionForDirection = useGetOptionForDirection();

    return (
        <Drawer
            variant="permanent"
            open={isVisible}
            onClose={() => {
                setIsVisible(false);
                setReaderNavBarWidth(0);
            }}
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
                        <Tooltip title={t('reader.button.exit')}>
                            <IconButton color="inherit">
                                <PushPinIcon />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                    <ReaderNavBarDesktopMetadata mangaTitle={manga.title} chapterTitle={chapter.name} />
                    <ReaderNavBarDesktopActions chapter={chapter} />
                </Stack>
                <Stack sx={{ p: 2, gap: 2 }}>
                    <Stack sx={{ gap: 1 }}>
                        <ReaderNavBarDesktopPageNavigation
                            currentPageIndex={currentPageIndex}
                            setCurrentPageIndex={setCurrentPageIndex}
                            pages={pages}
                        />
                        <ReaderNavBarDesktopChapterNavigation
                            currentChapterIndex={currentChapterIndex}
                            chapter={chapter}
                            chapters={chapters}
                        />
                    </Stack>
                    <Divider />
                    <ReaderNavBarDesktopQuickSettings />
                </Stack>
            </ReaderNavContainer>
        </Drawer>
    );
};
