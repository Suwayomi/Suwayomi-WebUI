/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { forwardRef, useMemo } from 'react';
import { CacheProvider } from '@emotion/react';
import { ThemeProvider } from '@mui/material/styles';
import Box, { BoxProps } from '@mui/material/Box';
import { useMetadataServerSettings } from '@/modules/settings/services/ServerSettingsMetadata.ts';
import { getTheme } from '@/modules/theme/services/AppThemes.ts';
import { createTheme } from '@/modules/theme/services/ThemeCreator.ts';
import { ReaderService } from '@/modules/reader/services/ReaderService.ts';
import { DIRECTION_TO_CACHE } from '@/modules/theme/ThemeDirectionCache.ts';
import { withPropsFrom } from '@/modules/core/hoc/withPropsFrom.tsx';

const BaseReaderProgressBarDirectionWrapper = forwardRef<
    HTMLElement,
    BoxProps & {
        direction: ReturnType<typeof ReaderService.useGetThemeDirection>;
    }
>(({ direction, ...boxProps }, ref) => {
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
                <Box {...boxProps} ref={ref} dir={direction} />
            </ThemeProvider>
        </CacheProvider>
    );
});

export const ReaderProgressBarDirectionWrapper = withPropsFrom(
    BaseReaderProgressBarDirectionWrapper,
    [() => ({ direction: ReaderService.useGetThemeDirection() })],
    ['direction'],
);
