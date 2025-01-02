/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Box from '@mui/material/Box';
import { memo, useCallback, useRef, useState } from 'react';
import { BaseReaderOverlayProps, MobileHeaderProps } from '@/modules/reader/types/ReaderOverlay.types.ts';
import { ReaderSettings } from '@/modules/reader/components/settings/ReaderSettings.tsx';
import { ReaderPageNumber } from '@/modules/reader/components/ReaderPageNumber.tsx';
import { StandardReaderProgressBar } from '@/modules/reader/components/overlay/progress-bar/variants/StandardReaderProgressBar.tsx';
import { ReaderNavBarDesktop } from '@/modules/reader/components/overlay/navigation/desktop/ReaderNavBarDesktop.tsx';
import { ReaderOverlayHeaderMobile } from '@/modules/reader/components/overlay/ReaderOverlayHeaderMobile.tsx';
import { ReaderBottomBarMobile } from '@/modules/reader/components/overlay/navigation/mobile/ReaderBottomBarMobile.tsx';
import { ReaderService } from '@/modules/reader/services/ReaderService.ts';
import { withPropsFrom } from '@/modules/core/hoc/withPropsFrom.tsx';
import { useResizeObserver } from '@/modules/core/hooks/useResizeObserver.tsx';

const BaseReaderOverlay = ({
    isVisible,
    isDesktop,
    isMobile,
}: BaseReaderOverlayProps &
    MobileHeaderProps &
    Pick<ReturnType<typeof ReaderService.useOverlayMode>, 'isDesktop' | 'isMobile'>) => {
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
