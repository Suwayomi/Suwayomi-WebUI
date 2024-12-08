/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Box from '@mui/material/Box';
import { ReaderService } from '@/modules/reader/services/ReaderService.ts';
import { useNavBarContext } from '@/modules/navigation-bar/contexts/NavbarContext.tsx';

export const ReaderRGBAFilter = () => {
    const { readerNavBarWidth } = useNavBarContext();
    const {
        customFilter: {
            rgba: {
                value: { red, green, blue, alpha },
                enabled,
            },
        },
    } = ReaderService.useSettings();

    if (!enabled) {
        return null;
    }

    return (
        <Box
            sx={{
                position: 'fixed',
                top: 0,
                left: readerNavBarWidth,
                right: 0,
                bottom: 0,
                pointerEvents: 'none',
                background: `rgba(${red} ${green} ${blue} / ${alpha}%)`,
            }}
        />
    );
};
