/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { ReactNode, useMemo } from 'react';
import { CacheProvider } from '@emotion/react';
import { ThemeProvider } from '@mui/material/styles';
import { useMetadataServerSettings } from '@/modules/settings/services/ServerSettingsMetadata.ts';
import { useLocalStorage } from '@/modules/core/hooks/useStorage.tsx';
import { AppThemes, getTheme } from '@/modules/theme/services/AppThemes.ts';
import { ThemeMode } from '@/modules/theme/contexts/ThemeModeContext.tsx';
import { createTheme } from '@/modules/theme/services/ThemeCreator.ts';
import { ReaderService } from '@/modules/reader/services/ReaderService.ts';
import { DIRECTION_TO_CACHE } from '@/modules/theme/ThemeDirectionCache.ts';

export const ReaderProgressBarDirectionWrapper = ({ children }: { children: ReactNode }) => {
    const direction = ReaderService.useGetThemeDirection();
    const [appTheme] = useLocalStorage<AppThemes>('appTheme', 'default');
    const [themeMode] = useLocalStorage<ThemeMode>('themeMode', ThemeMode.SYSTEM);
    const [pureBlackMode] = useLocalStorage<boolean>('pureBlackMode', false);

    const {
        settings: { customThemes },
    } = useMetadataServerSettings();

    const readerTheme = useMemo(
        () => createTheme(themeMode, getTheme(appTheme, customThemes), pureBlackMode, direction),
        [themeMode, appTheme, customThemes, pureBlackMode, direction],
    );

    return (
        <CacheProvider value={DIRECTION_TO_CACHE[direction]}>
            <ThemeProvider theme={readerTheme}>
                <div dir={direction}>{children}</div>
            </ThemeProvider>
        </CacheProvider>
    );
};
