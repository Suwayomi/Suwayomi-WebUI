/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useTranslation } from 'react-i18next';
import { useContext, useEffect } from 'react';
import { List, ListItem, ListItemText, Switch } from '@mui/material';
import ListSubheader from '@mui/material/ListSubheader';
import { NavBarContext, useSetDefaultBackTo } from '@/components/context/NavbarContext.tsx';
import { GlobalUpdateSettings } from '@/components/settings/globalUpdate/GlobalUpdateSettings.tsx';
import { useSearchSettings } from '@/util/searchSettings.ts';
import { SearchMetadataKeys } from '@/typings.ts';
import { convertToGqlMeta, requestUpdateServerMetadata } from '@/util/metadata.ts';
import { makeToast } from '@/components/util/Toast.tsx';

export function LibrarySettings() {
    const { t } = useTranslation();
    const { setTitle, setAction } = useContext(NavBarContext);

    useEffect(() => {
        setTitle(t('library.settings.title'));
        setAction(null);
    }, [t]);

    useSetDefaultBackTo('settings');

    const { metadata, settings } = useSearchSettings();

    const setSettingValue = (key: SearchMetadataKeys, value: boolean) => {
        requestUpdateServerMetadata(convertToGqlMeta(metadata)! ?? {}, [[key, value]]).catch(() =>
            makeToast(t('search.error.label.failed_to_save_settings'), 'warning'),
        );
    };

    return (
        <List>
            <List
                subheader={
                    <ListSubheader component="div" id="library-search-filter">
                        {t('search.title.search')}
                    </ListSubheader>
                }
            >
                <ListItem>
                    <ListItemText primary={t('search.label.ignore_filters')} />
                    <Switch
                        edge="end"
                        checked={settings.ignoreFilters}
                        onChange={(e) => setSettingValue('ignoreFilters', e.target.checked)}
                    />
                </ListItem>
            </List>
            <GlobalUpdateSettings />
        </List>
    );
}
