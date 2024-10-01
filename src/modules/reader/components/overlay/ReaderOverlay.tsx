/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Box from '@mui/material/Box';
import { BaseReaderOverlayProps, MobileHeaderProps } from '@/modules/reader/types/ReaderOverlay.types.ts';
import { ReaderBottomBarMobile } from '@/modules/reader/components/overlay/navigation/mobile/ReaderBottomBarMobile.tsx';
import { ReaderOverlayHeaderMobile } from '@/modules/reader/components/overlay/ReaderOverlayHeaderMobile.tsx';
import { ReaderNavBarDesktop } from '@/modules/reader/components/overlay/navigation/desktop/ReaderNavBarDesktop.tsx';

export const ReaderOverlay = ({
    manga,
    chapter,
    isVisible,
    setIsVisible,
}: BaseReaderOverlayProps & MobileHeaderProps) => {
    const a = false;

    return (
        <Box sx={{ position: 'absolute', width: '100%', height: '100%', pointerEvents: 'none' }}>
            {/* <StandardReaderProgressBar /> */}

            <ReaderNavBarDesktop isVisible={isVisible} setIsVisible={setIsVisible} openSettings={() => undefined} />

            <ReaderOverlayHeaderMobile manga={manga} chapter={chapter} isVisible={isVisible} />

            <ReaderBottomBarMobile openSettings={() => undefined} isVisible={isVisible} />
        </Box>
    );
};
