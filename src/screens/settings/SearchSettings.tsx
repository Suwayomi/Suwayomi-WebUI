/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { ListItem, ListItemText, Switch } from '@mui/material';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import React from 'react';
import ListItemIcon from '@mui/material/ListItemIcon';
import SearchIcon from '@mui/icons-material/Search';
import { useTranslation } from 'react-i18next';
import { SearchMetadataKeys } from '@/typings';
import { requestUpdateServerMetadata } from '@/util/metadata';
import { useSearchSettings } from '@/util/searchSettings';
import makeToast from '@/components/util/Toast';

export default function SearchSettings() {
    const { t } = useTranslation();
    const { metadata, settings } = useSearchSettings();

    const setSettingValue = (key: SearchMetadataKeys, value: boolean) => {
        requestUpdateServerMetadata(metadata ?? {}, [[key, value]]).catch(() =>
            makeToast(t('search.error.label.failed_to_save_settings'), 'warning'),
        );
    };
    return (
        <ListItem>
            <ListItemIcon>
                <SearchIcon />
            </ListItemIcon>
            <ListItemText primary={t('search.label.ignore_filters')} />
            <ListItemSecondaryAction>
                <Switch
                    edge="end"
                    checked={settings.ignoreFilters}
                    onChange={(e) => setSettingValue('ignoreFilters', e.target.checked)}
                />
            </ListItemSecondaryAction>
        </ListItem>
    );
}
