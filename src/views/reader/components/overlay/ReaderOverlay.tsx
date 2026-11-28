/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Box from '@mui/material/Box';
import { memo, useCallback, useRef, useState } from 'react';
import { ReaderSettings } from '@/views/reader/screens/settings/ReaderSettings.tsx';
import { ReaderPageNumber } from '@/views/reader/components/overlay/ReaderPageNumber.tsx';
import { StandardReaderProgressBar } from '@/views/reader/components/overlay/progress-bar/desktop/StandardReaderProgressBar.tsx';
import { ReaderNavBarDesktop } from '@/views/reader/components/overlay/navigation/desktop/ReaderNavBarDesktop.tsx';
import { ReaderOverlayHeaderMobile } from '@/views/reader/components/overlay/mobile/ReaderOverlayHeaderMobile.tsx';
import { ReaderBottomBarMobile } from '@/views/reader/components/overlay/navigation/mobile/ReaderBottomBarMobile.tsx';
import { ReaderService } from '@/controllers/reader/services/ReaderService.ts';
import { withPropsFrom } from '@/hoc/base/withPropsFrom.tsx';
import { useResizeObserver } from '@/controllers/base/hooks/useResizeObserver.tsx';
import { useReaderOverlayStore } from '@/controllers/reader/stores/ReaderStore.ts';

const BaseReaderOverlay = ({
    isDesktop,
    isMobile,
}: Pick<ReturnType<typeof ReaderService.useOverlayMode>, 'isDesktop' | 'isMobile'>) => {
    const isVisible = useReaderOverlayStore('isVisible');

    const [areSettingsOpen, setAreSettingsOpen] = useState(false);

    const [mobileHeaderHeight, setMobileHeaderHeight] = useState(0);
    const mobileHeaderRef = useRef<HTMLDivElement>(null);
    useResizeObserver(
        mobileHeaderRef,
        useCallback(() => setMobileHeaderHeight(mobileHeaderRef.current?.clientHeight ?? 0), [isMobile]),
    );

    return (
        <Box sx={{ position: 'absolute', width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}>
            {isDesktop && (
                <>
                    <StandardReaderProgressBar />
                    <ReaderNavBarDesktop isVisible={isVisible} openSettings={() => setAreSettingsOpen(true)} />
                </>
            )}

            {isMobile && (
                <>
                    <ReaderOverlayHeaderMobile ref={mobileHeaderRef} isVisible={isVisible} />
                    <ReaderBottomBarMobile
                        openSettings={() => setAreSettingsOpen(true)}
                        isVisible={isVisible}
                        topOffset={mobileHeaderHeight}
                    />
                </>
            )}

            <ReaderSettings isOpen={areSettingsOpen} close={() => setAreSettingsOpen(false)} />

            <ReaderPageNumber />
        </Box>
    );
};

export const ReaderOverlay = withPropsFrom(
    memo(BaseReaderOverlay),
    [ReaderService.useOverlayMode],
    ['isDesktop', 'isMobile'],
);
