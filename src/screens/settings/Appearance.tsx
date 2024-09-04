/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useTranslation } from 'react-i18next';
import { useContext, useEffect } from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Switch from '@mui/material/Switch';
import { NavBarContext } from '@/components/context/NavbarContext.tsx';
import { DarkTheme } from '@/components/context/DarkTheme';

export const Appearance = () => {
    const { t } = useTranslation();
    const { darkTheme, setDarkTheme } = useContext(DarkTheme);

    const { setTitle, setAction } = useContext(NavBarContext);
    useEffect(() => {
        setTitle(t('settings.appearance.title'));
        setAction(null);

        return () => {
            setTitle('');
            setAction(null);
        };
    }, [t]);

    return (
        <List>
            <ListItem>
                <ListItemText primary={t('settings.label.dark_theme')} />
                <Switch edge="end" checked={darkTheme} onChange={() => setDarkTheme(!darkTheme)} />
            </ListItem>
        </List>
    );
};
