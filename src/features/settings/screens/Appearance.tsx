/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import ListSubheader from '@mui/material/ListSubheader';
import Switch from '@mui/material/Switch';
import Link from '@mui/material/Link';
import { useColorScheme } from '@mui/material/styles';
import { useLingui } from '@lingui/react/macro';
import { useAppThemeContext } from '@/features/theme/AppThemeContext.tsx';
import { Select } from '@/base/components/inputs/Select.tsx';
import { MediaQuery } from '@/base/utils/MediaQuery.tsx';
import { NumberSetting } from '@/base/components/settings/NumberSetting.tsx';
import { I18nResourceCode, i18nResources, loadCatalog } from '@/i18n';
import { languageCodeToName } from '@/base/utils/Languages.ts';
import { ThemeList } from '@/features/theme/components/ThemeList.tsx';
import {
    createUpdateMetadataServerSettings,
    useMetadataServerSettings,
} from '@/features/settings/services/ServerSettingsMetadata.ts';
import { LoadingPlaceholder } from '@/base/components/feedback/LoadingPlaceholder.tsx';
import { EmptyViewAbsoluteCentered } from '@/base/components/feedback/EmptyViewAbsoluteCentered.tsx';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import { makeToast } from '@/base/utils/Toast.ts';
import { MetadataThemeSettings, ThemeMode } from '@/features/theme/AppTheme.types.ts';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';
import { AppStorage } from '@/lib/storage/AppStorage.ts';
import { useAppTitle } from '@/features/navigation-bar/hooks/useAppTitle.ts';
import { MANGA_GRID_WIDTH, SERVER_SETTINGS_METADATA_DEFAULT } from '@/features/settings/Settings.constants.ts';
import { MUI_THEME_MODE_KEY } from '@/lib/mui/MUI.constants.ts';

export const Appearance = () => {
    const { t, i18n } = useLingui();
    const { themeMode, setThemeMode, shouldUsePureBlackMode, setShouldUsePureBlackMode } = useAppThemeContext();
    const { mode, setMode } = useColorScheme();
    const actualThemeMode = (mode ?? themeMode) as ThemeMode;

    useAppTitle(t`Appearance`);

    const {
        settings: { mangaThumbnailBackdrop, mangaDynamicColorSchemes, mangaGridItemWidth },
        request: { loading, error, refetch },
    } = useMetadataServerSettings();
    const updateMetadataSetting = createUpdateMetadataServerSettings<keyof MetadataThemeSettings>((e) =>
        makeToast(t`Failed to save changes`, 'error', getErrorMessage(e)),
    );

    const isDarkMode = MediaQuery.getThemeMode(actualThemeMode) === ThemeMode.DARK;

    if (loading) {
        return <LoadingPlaceholder />;
    }

    if (error) {
        return (
            <EmptyViewAbsoluteCentered
                message={t`Unable to load data`}
                messageExtra={getErrorMessage(error)}
                retry={() => refetch().catch(defaultPromiseErrorHandler('Appearance::refetch'))}
            />
        );
    }

    return (
        <List
            subheader={
                <ListSubheader component="div" id="appearance-theme">
                    {t`Theme`}
                </ListSubheader>
            }
        >
            <ListItem>
                <ListItemText primary={t`Theme mode`} />
                <Select<ThemeMode>
                    value={actualThemeMode}
                    onChange={(e) => {
                        const newMode = e.target.value as 'system' | 'light' | 'dark';

                        setThemeMode(newMode as ThemeMode);
                        setMode(newMode);
                        // in case a non "colorSchemes" mui theme is active, "setMode" does not update the mode ("mui-mode") value
                        AppStorage.local.setItem(MUI_THEME_MODE_KEY, newMode, true);
                    }}
                >
                    <MenuItem key={ThemeMode.SYSTEM} value={ThemeMode.SYSTEM}>
                        {t`System`}
                    </MenuItem>
                    <MenuItem key={ThemeMode.DARK} value={ThemeMode.DARK}>
                        {t`Dark`}
                    </MenuItem>
                    <MenuItem key={ThemeMode.LIGHT} value={ThemeMode.LIGHT}>
                        {t`Light`}
                    </MenuItem>
                </Select>
            </ListItem>
            <ThemeList />
            {isDarkMode && (
                <ListItem>
                    <ListItemText primary={t`Pure black dark mode`} />
                    <Switch
                        checked={shouldUsePureBlackMode}
                        onChange={(_, enabled) => setShouldUsePureBlackMode(enabled)}
                    />
                </ListItem>
            )}
            <List
                subheader={
                    <ListSubheader component="div" id="appearance-theme">
                        {t`Display`}
                    </ListSubheader>
                }
            >
                <ListItem>
                    <ListItemText
                        primary={t`Language`}
                        secondary={
                            <>
                                <span>{t`Feel free to translate the project on`} </span>
                                <Link
                                    href="https://hosted.weblate.org/projects/suwayomi/suwayomi-webui"
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    {t`Weblate`}
                                </Link>
                            </>
                        }
                    />
                    <Select
                        value={i18nResources.includes(i18n.locale as I18nResourceCode) ? i18n.locale : 'en'}
                        onChange={({ target: { value: language } }) =>
                            loadCatalog(language).catch((e: Error) => {
                                makeToast(t`Could not load language`, 'error', getErrorMessage(e));
                            })
                        }
                    >
                        {i18nResources.map((language) => (
                            <MenuItem key={language} value={language}>
                                {languageCodeToName(language)}
                            </MenuItem>
                        ))}
                    </Select>
                </ListItem>
                <NumberSetting
                    settingTitle={t`Manga item width`}
                    settingValue={`px: ${mangaGridItemWidth}`}
                    value={mangaGridItemWidth}
                    defaultValue={SERVER_SETTINGS_METADATA_DEFAULT.mangaGridItemWidth}
                    minValue={MANGA_GRID_WIDTH.min}
                    maxValue={MANGA_GRID_WIDTH.max}
                    stepSize={MANGA_GRID_WIDTH.step}
                    valueUnit="px"
                    showSlider
                    handleUpdate={(width) => updateMetadataSetting('mangaGridItemWidth', width)}
                />

                <ListItem>
                    <ListItemText
                        primary={t`Manga thumbnail as background`}
                        secondary={t`Sets the manga thumbnail as the background image on the manga page`}
                    />
                    <Switch
                        edge="end"
                        checked={mangaThumbnailBackdrop}
                        onChange={(e) => updateMetadataSetting('mangaThumbnailBackdrop', e.target.checked)}
                    />
                </ListItem>

                <ListItem>
                    <ListItemText
                        primary={t`Dynamic theme colors on manga page`}
                        secondary={t`Changes the theme colors on the manga page based on the thumbnail`}
                    />
                    <Switch
                        edge="end"
                        checked={mangaDynamicColorSchemes}
                        onChange={(e) => updateMetadataSetting('mangaDynamicColorSchemes', e.target.checked)}
                    />
                </ListItem>
            </List>
        </List>
    );
};
