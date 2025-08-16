/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { AppTheme, AppThemes } from '@/features/theme/services/AppThemes.ts';
import { ThemeMode } from '@/features/theme/AppThemeContext.tsx';

export type MetadataThemeSettings = {
    appTheme: AppThemes;
    themeMode: ThemeMode;
    shouldUsePureBlackMode: boolean;
    customThemes: Record<string, AppTheme>;
    mangaThumbnailBackdrop: boolean;
    mangaDynamicColorSchemes: boolean;
    mangaGridItemWidth: number;
};
