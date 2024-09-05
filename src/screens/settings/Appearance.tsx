/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useTranslation } from 'react-i18next';
import { useContext, useEffect, useMemo } from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import ListSubheader from '@mui/material/ListSubheader';
import Switch from '@mui/material/Switch';
import Link from '@mui/material/Link';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import { styled, ThemeProvider } from '@mui/material/styles';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { NavBarContext } from '@/components/context/NavbarContext.tsx';
import { ThemeMode, ThemeModeContext } from '@/components/context/ThemeModeContext.tsx';
import { Select } from '@/components/atoms/Select.tsx';
import { MediaQuery } from '@/lib/ui/MediaQuery.tsx';
import { NumberSetting } from '@/components/settings/NumberSetting.tsx';
import { useLocalStorage } from '@/util/useStorage.tsx';
import { I18nResourceCode, i18nResources } from '@/i18n';
import { langCodeToName } from '@/util/language.tsx';
import { AppTheme, appThemes } from '@/lib/ui/AppThemes.ts';
import { createTheme } from '@/theme.ts';

const ThemePreviewBage = styled(Box)(({ theme }) => ({
    width: '15px',
    height: '20px',
    borderRadius: theme.shape.borderRadius,
}));

const ThemePreview = ({ theme }: { theme: AppTheme }) => {
    const { getName } = theme;

    const { themeMode, setAppTheme, appTheme, pureBlackMode } = useContext(ThemeModeContext);

    const isSelected = theme.id === appTheme;

    const muiTheme = useMemo(
        () => createTheme(themeMode, theme.id, pureBlackMode),
        [theme.id, themeMode, pureBlackMode],
    );

    return (
        <Stack
            sx={{
                padding: 1,
                justifyContent: 'center',
                alignItems: 'center',
                minWidth: '150px',
                maxWidth: '150px',
                gap: 1,
            }}
        >
            <ThemeProvider theme={muiTheme}>
                <Stack
                    sx={{
                        cursor: 'pointer',
                        backgroundColor: 'background.default',
                        width: '100%',
                        height: '225px',
                        outline: '4px solid',
                        outlineColor: isSelected ? muiTheme.palette.primary.light : muiTheme.palette.background.paper,
                        borderRadius: 1,
                    }}
                    onClick={() => setAppTheme(theme.id)}
                >
                    <Stack sx={{ height: '100%', gap: 2, p: 1 }}>
                        <Stack
                            sx={{
                                maxHeight: '20px',
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                            }}
                        >
                            <Box
                                sx={{ width: '65%', height: '20px', backgroundColor: 'primary.dark', borderRadius: 1 }}
                            />
                            {isSelected && (
                                <CheckCircleIcon
                                    sx={{ visibility: isSelected ? 'visible' : 'hidden', color: 'primary.light' }}
                                    // color="primary"
                                />
                            )}
                        </Stack>
                        <Stack
                            sx={{
                                flexDirection: 'row',
                                width: '55%',
                                height: '65%',
                                backgroundColor: 'background.paper',
                                borderRadius: 1,
                                p: 1,
                            }}
                        >
                            <ThemePreviewBage sx={{ backgroundColor: 'primary.main' }} />
                            <ThemePreviewBage sx={{ backgroundColor: 'secondary.main' }} />
                        </Stack>
                    </Stack>
                    <Stack
                        sx={{
                            height: '80px',
                            backgroundColor: muiTheme.palette.background.paper,
                            justifyContent: 'center',
                            alignItems: 'center',
                            flexDirection: 'row',
                            gap: 1,
                        }}
                    >
                        <Box
                            sx={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'primary.main' }}
                        />
                        <Box
                            sx={{
                                flexGrow: 0.75,
                                height: '20px',
                                borderRadius: 1,
                                backgroundColor: 'primary.light',
                            }}
                        />
                    </Stack>
                </Stack>
            </ThemeProvider>
            <Typography>{getName()}</Typography>
        </Stack>
    );
};

const ThemePicker = () => (
    <Stack sx={{ flexDirection: 'row', flexWrap: 'no-wrap', overflowX: 'auto', gap: 3, mx: 1 }}>
        {appThemes.map((theme) => (
            <ThemePreview key={theme.id} theme={theme} />
        ))}
    </Stack>
);

export const Appearance = () => {
    const { t, i18n } = useTranslation();
    const { themeMode, setThemeMode, pureBlackMode, setPureBlackMode } = useContext(ThemeModeContext);
    const isDarkMode = MediaQuery.getThemeMode() === ThemeMode.DARK;

    const { setTitle, setAction } = useContext(NavBarContext);
    useEffect(() => {
        setTitle(t('settings.appearance.title'));
        setAction(null);

        return () => {
            setTitle('');
            setAction(null);
        };
    }, [t]);

    const DEFAULT_ITEM_WIDTH = 300;
    const [itemWidth, setItemWidth] = useLocalStorage<number>('ItemWidth', DEFAULT_ITEM_WIDTH);

    return (
        <List
            subheader={
                <ListSubheader component="div" id="appearance-theme">
                    {t('settings.appearance.theme')}
                </ListSubheader>
            }
        >
            <ListItem>
                <ListItemText primary={t('settings.appearance.device_theme')} />
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
            <ThemePicker />
            {isDarkMode && (
                <ListItem>
                    <ListItemText primary={t('settings.appearance.pure_black_mode')} />
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
            </List>
        </List>
    );
};
