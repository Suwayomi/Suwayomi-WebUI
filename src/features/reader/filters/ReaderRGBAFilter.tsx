/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Box from '@mui/material/Box';
import { ReaderService } from '@/features/reader/services/ReaderService.ts';
import { useNavBarContext } from '@/features/navigation-bar/NavbarContext.tsx';
import { NavbarContextType } from '@/features/navigation-bar/NavigationBar.types.ts';
import { withPropsFrom } from '@/base/hoc/withPropsFrom.tsx';
import { IReaderSettings } from '@/features/reader/Reader.types.ts';

const BaseReaderRGBAFilter = ({
    readerNavBarWidth,
    customFilter: {
        rgba: {
            value: { red, green, blue, alpha, blendMode },
            enabled,
        },
    },
}: Pick<NavbarContextType, 'readerNavBarWidth'> & Pick<IReaderSettings, 'customFilter'>) => {
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
                mixBlendMode: `${blendMode}`,
            }}
        />
    );
};

export const ReaderRGBAFilter = withPropsFrom(
    BaseReaderRGBAFilter,
    [useNavBarContext, ReaderService.useSettingsWithoutDefaultFlag],
    ['readerNavBarWidth', 'customFilter'],
);
