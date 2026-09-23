/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Box from '@mui/material/Box';
import { memo, useCallback, useRef, useState } from 'react';
import { ReaderSettings } from '@/features/reader/settings/screens/ReaderSettings.tsx';
import { ReaderPageNumber } from '@/features/reader/overlay/components/ReaderPageNumber.tsx';
import { SourceContentType } from '@/lib/graphql/generated/graphql-base.types.ts';
import { StandardReaderProgressBar } from '@/features/reader/overlay/progress-bar/desktop/StandardReaderProgressBar.tsx';
import { ReaderNavBarDesktop } from '@/features/reader/overlay/navigation/desktop/ReaderNavBarDesktop.tsx';
import { ReaderOverlayHeaderMobile } from '@/features/reader/overlay/mobile/ReaderOverlayHeaderMobile.tsx';
import { ReaderBottomBarMobile } from '@/features/reader/overlay/navigation/mobile/ReaderBottomBarMobile.tsx';
import { ReaderService } from '@/features/reader/services/ReaderService.ts';
import { withPropsFrom } from '@/base/hoc/withPropsFrom.tsx';
import { useResizeObserver } from '@/base/hooks/useResizeObserver.tsx';
import { useReaderOverlayStore, useReaderStore } from '@/features/reader/stores/ReaderStore.ts';
import { NovelReaderSettingsDrawer } from '@/features/novel-reader/components/NovelReaderSettingsDrawer.tsx';
import { NovelReaderProgressBar } from '@/features/novel-reader/components/NovelReaderProgressBar.tsx';

const BaseReaderOverlay = ({
    isDesktop,
    isMobile,
}: Pick<ReturnType<typeof ReaderService.useOverlayMode>, 'isDesktop' | 'isMobile'>) => {
    const isVisible = useReaderOverlayStore('isVisible');
    const manga = useReaderStore('manga');
    const isNovel = manga?.contentType === SourceContentType.LightNovel;

    const [areSettingsOpen, setAreSettingsOpen] = useState(false);

    const [mobileHeaderHeight, setMobileHeaderHeight] = useState(0);
    const mobileHeaderRef = useRef<HTMLDivElement>(null);
    useResizeObserver(
        mobileHeaderRef,
        useCallback(() => setMobileHeaderHeight(mobileHeaderRef.current?.clientHeight ?? 0), [isMobile]),
    );

    return (
        <Box sx={{ position: 'absolute', width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}>
            {isNovel && <NovelReaderProgressBar openSettings={() => setAreSettingsOpen(true)} />}

            {isDesktop && (
                <>
                    {!isNovel && <StandardReaderProgressBar />}
                    <ReaderNavBarDesktop isVisible={isVisible} openSettings={() => setAreSettingsOpen(true)} />
                </>
            )}

            {isMobile && (
                <>
                    <ReaderOverlayHeaderMobile ref={mobileHeaderRef} isVisible={isVisible} />
                    {!isNovel && (
                        <ReaderBottomBarMobile
                            openSettings={() => setAreSettingsOpen(true)}
                            isVisible={isVisible}
                            topOffset={mobileHeaderHeight}
                        />
                    )}
                </>
            )}

            {isNovel ? (
                <NovelReaderSettingsDrawer open={areSettingsOpen} onClose={() => setAreSettingsOpen(false)} />
            ) : (
                <ReaderSettings isOpen={areSettingsOpen} close={() => setAreSettingsOpen(false)} />
            )}

            {!isNovel && <ReaderPageNumber />}
        </Box>
    );
};

export const ReaderOverlay = withPropsFrom(
    memo(BaseReaderOverlay),
    [ReaderService.useOverlayMode],
    ['isDesktop', 'isMobile'],
);
