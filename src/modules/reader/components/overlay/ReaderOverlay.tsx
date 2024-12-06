/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Box from '@mui/material/Box';
import { BaseReaderOverlayProps, MobileHeaderProps } from '@/modules/reader/types/ReaderOverlay.types.ts';
import { ReaderPageNumber } from '@/modules/reader/components/ReaderPageNumber.tsx';
import { StandardReaderProgressBar } from '@/modules/reader/components/overlay/progress-bar/variants/StandardReaderProgressBar.tsx';
import { ReaderNavBarDesktop } from '@/modules/reader/components/overlay/navigation/desktop/ReaderNavBarDesktop.tsx';
import { ReaderOverlayHeaderMobile } from '@/modules/reader/components/overlay/ReaderOverlayHeaderMobile.tsx';
import { ReaderBottomBarMobile } from '@/modules/reader/components/overlay/navigation/mobile/ReaderBottomBarMobile.tsx';
import { MediaQuery } from '@/modules/core/utils/MediaQuery.tsx';

export const ReaderOverlay = ({ isVisible }: BaseReaderOverlayProps & MobileHeaderProps) => {
    const isTouchDevice = MediaQuery.useIsTouchDevice();

    const isDesktop = !isTouchDevice;
    const isMobile = isTouchDevice;

    return (
        <Box sx={{ position: 'absolute', width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}>
            {isDesktop && (
                <>
                    <StandardReaderProgressBar />
                    <ReaderNavBarDesktop isVisible={isVisible} openSettings={() => {}} />
                </>
            )}

            {isMobile && (
                <>
                    <ReaderOverlayHeaderMobile isVisible={isVisible} />
                    <ReaderBottomBarMobile openSettings={() => {}} isVisible={isVisible} />
                </>
            )}

            <ReaderPageNumber />
        </Box>
    );
};
