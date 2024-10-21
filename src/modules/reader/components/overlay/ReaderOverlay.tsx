/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Box from '@mui/material/Box';
import { useState } from 'react';
import { BaseReaderOverlayProps, MobileHeaderProps } from '@/modules/reader/types/ReaderOverlay.types.ts';
import { ReaderSettings } from '@/modules/reader/components/settings/ReaderSettings.tsx';
import { ReaderOverlayHeaderMobile } from '@/modules/reader/components/overlay/ReaderOverlayHeaderMobile';
import { ReaderBottomBarMobile } from '@/modules/reader/components/overlay/navigation/mobile/ReaderBottomBarMobile.tsx';
import { ReaderNavBarDesktop } from '@/modules/reader/components/overlay/navigation/desktop/ReaderNavBarDesktop';

export const ReaderOverlay = ({
    isVisible,
    setIsVisible,
    manga,
    chapter,
}: BaseReaderOverlayProps & MobileHeaderProps) => {
    const [areSettingsOpen, setAreSettingsOpen] = useState(false);

    return (
        <Box sx={{ position: 'absolute', width: '100%', height: '100%', pointerEvents: 'none' }}>
            {/* <StandardReaderProgressBar /> */}

            <ReaderNavBarDesktop
                isVisible={isVisible}
                setIsVisible={setIsVisible}
                openSettings={() => setAreSettingsOpen(true)}
            />

            <ReaderOverlayHeaderMobile manga={manga} chapter={chapter} isVisible={isVisible} />

            <ReaderBottomBarMobile openSettings={() => setAreSettingsOpen(true)} isVisible={isVisible} />

            <ReaderSettings isOpen={areSettingsOpen} close={() => setAreSettingsOpen(false)} />
        </Box>
    );
};
