/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useTranslation } from 'react-i18next';
import { useContext, useLayoutEffect } from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import ListSubheader from '@mui/material/ListSubheader';
import Switch from '@mui/material/Switch';
import Link from '@mui/material/Link';
import { NavBarContext } from '@/modules/navigation-bar/contexts/NavbarContext.tsx';
import { ThemeMode, ThemeModeContext } from '@/modules/theme/contexts/ThemeModeContext.tsx';
import { Select } from '@/modules/core/components/inputs/Select.tsx';
import { MediaQuery } from '@/modules/core/utils/MediaQuery.tsx';
import { NumberSetting } from '@/modules/core/components/settings/NumberSetting.tsx';
import { useLocalStorage } from '@/modules/core/hooks/useStorage.tsx';
import { I18nResourceCode, i18nResources } from '@/i18n';
import { langCodeToName } from '@/modules/core/utils/Languages.ts';
import { getTheme } from '@/modules/theme/services/AppThemes.ts';
import { ThemeList } from '@/modules/theme/components/ThemeList.tsx';
import {
    createUpdateMetadataServerSettings,
    useMetadataServerSettings,
} from '@/modules/settings/services/ServerSettingsMetadata.ts';
import { LoadingPlaceholder } from '@/modules/core/components/placeholder/LoadingPlaceholder.tsx';
import { EmptyViewAbsoluteCentered } from '@/modules/core/components/placeholder/EmptyViewAbsoluteCentered.tsx';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import { makeToast } from '@/modules/core/utils/Toast.ts';
import { MetadataThemeSettings } from '@/modules/theme/AppTheme.types.ts';

export const Appearance = () => {
    const { t, i18n } = useTranslation();
    const { themeMode, setThemeMode, pureBlackMode, setPureBlackMode, appTheme } = useContext(ThemeModeContext);

    const { setTitle, setAction } = useContext(NavBarContext);
    useLayoutEffect(() => {
        setTitle(t('settings.appearance.title'));
        setAction(null);

        return () => {
            setTitle('');
            setAction(null);
        };
    }, [t]);

    const {
        settings,
        request: { loading, error, refetch },
    } = useMetadataServerSettings();
    const updateMetadataSetting = createUpdateMetadataServerSettings<keyof MetadataThemeSettings>(() =>
        makeToast(t('global.error.label.failed_to_save_changes'), 'error'),
    );

    const isDarkMode =
        getTheme(appTheme).muiTheme.palette?.mode === 'dark' || MediaQuery.getThemeMode() === ThemeMode.DARK;

    const DEFAULT_ITEM_WIDTH = 300;
    const [itemWidth, setItemWidth] = useLocalStorage<number>('ItemWidth', DEFAULT_ITEM_WIDTH);

    if (loading) {
        return <LoadingPlaceholder />;
    }

    if (error) {
        return (
            <EmptyViewAbsoluteCentered
                message={t('global.error.label.failed_to_load_data')}
                messageExtra={error.message}
                retry={() => refetch().catch(defaultPromiseErrorHandler('Appearance::refetch'))}
            />
        );
    }

    return (
        <List
            subheader={
                <ListSubheader component="div" id="appearance-theme">
                    {t('settings.appearance.theme.title')}
                </ListSubheader>
            }
        >
            <ListItem>
                <ListItemText primary={t('settings.appearance.theme.mode')} />
                <Select<ThemeMode> value={themeMode} onChange={(e) => setThemeMode(e.target.value as ThemeMode)}>
                    <MenuItem key={ThemeMode.SYSTEM} value={ThemeMode.SYSTEM}>
                        System
                    </MenuItem>
                    <MenuItem key={ThemeMode.DARK} value={ThemeMode.DARK}>
                        Dark
                    </MenuItem>
                    <MenuItem key={ThemeMode.LIGHT} value={ThemeMode.LIGHT}>
                        Light
                    </MenuItem>
                </Select>
            </ListItem>
            <ThemeList />
            {isDarkMode && (
                <ListItem>
                    <ListItemText primary={t('settings.appearance.theme.pure_black_mode')} />
                    <Switch checked={pureBlackMode} onChange={(_, enabled) => setPureBlackMode(enabled)} />
                </ListItem>
            )}
            <List
                subheader={
                    <ListSubheader component="div" id="appearance-theme">
                        {t('global.label.display')}
                    </ListSubheader>
                }
            >
                <ListItem>
                    <ListItemText
                        primary={t('global.language.label.language')}
                        secondary={
                            <>
                                <span>{t('settings.label.language_description')} </span>
                                <Link
                                    href="https://hosted.weblate.org/projects/suwayomi/suwayomi-webui"
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    {t('global.language.title.weblate')}
                                </Link>
                            </>
                        }
                    />
                    <Select
                        value={i18nResources.includes(i18n.language as I18nResourceCode) ? i18n.language : 'en'}
                        onChange={({ target: { value: language } }) => i18n.changeLanguage(language)}
                    >
                        {i18nResources.map((language) => (
                            <MenuItem key={language} value={language}>
                                {langCodeToName(language)}
                            </MenuItem>
                        ))}
                    </Select>
                </ListItem>
                <NumberSetting
                    settingTitle={t('settings.label.manga_item_width')}
                    settingValue={`px: ${itemWidth}`}
                    value={itemWidth}
                    defaultValue={DEFAULT_ITEM_WIDTH}
                    minValue={100}
                    maxValue={1000}
                    stepSize={10}
                    valueUnit="px"
                    showSlider
                    handleUpdate={setItemWidth}
                />

                <ListItem>
                    <ListItemText
                        primary={t('settings.appearance.manga_thumbnail_backdrop.title')}
                        secondary={t('settings.appearance.manga_thumbnail_backdrop.description')}
                    />
                    <Switch
                        edge="end"
                        checked={settings.mangaThumbnailBackdrop}
                        onChange={(e) => updateMetadataSetting('mangaThumbnailBackdrop', e.target.checked)}
                    />
                </ListItem>
            </List>
        </List>
    );
};
