/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useMemo } from 'react';
import { CacheProvider } from '@emotion/react';
import { ThemeProvider } from '@mui/material/styles';
import type { BoxProps } from '@mui/material/Box';
import Box from '@mui/material/Box';
import { useMetadataServerSettings } from '@/controllers/settings/services/ServerSettingsMetadata.ts';
import { getTheme } from '@/controllers/theme/services/AppThemes.ts';
import { createTheme } from '@/controllers/theme/services/ThemeCreator.ts';
import { ReaderService } from '@/controllers/reader/services/ReaderService.ts';
import { DIRECTION_TO_CACHE } from '@/controllers/theme/services/ThemeDirectionCache.ts';
import { withPropsFrom } from '@/hoc/base/withPropsFrom.tsx';

const BaseReaderProgressBarDirectionWrapper = ({
    direction,
    ...boxProps
}: BoxProps & {
    direction: ReturnType<typeof ReaderService.useGetThemeDirection>;
}) => {
    const {
        settings: { customThemes, appTheme, themeMode, shouldUsePureBlackMode },
    } = useMetadataServerSettings();

    const readerTheme = useMemo(
        () => createTheme(themeMode, getTheme(appTheme, customThemes), shouldUsePureBlackMode, direction),
        [themeMode, appTheme, customThemes, shouldUsePureBlackMode, direction],
    );

    return (
        <CacheProvider value={DIRECTION_TO_CACHE[direction]}>
            <ThemeProvider theme={readerTheme}>
                <Box {...boxProps} dir={direction} />
            </ThemeProvider>
        </CacheProvider>
    );
};

export const ReaderProgressBarDirectionWrapper = withPropsFrom(
    BaseReaderProgressBarDirectionWrapper,
    [() => ({ direction: ReaderService.useGetThemeDirection() })],
    ['direction'],
);
