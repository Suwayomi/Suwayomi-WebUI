/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import List from '@mui/material/List';
import ListSubheader from '@mui/material/ListSubheader';
import { useTranslation } from 'react-i18next';
import { GlobalUpdateSettingsCategories } from '@/components/settings/globalUpdate/GlobalUpdateSettingsCategories.tsx';
import { GlobalUpdateSettingsEntries } from '@/components/settings/globalUpdate/GlobalUpdateSettingsEntries.tsx';
import { GlobalUpdateSettingsInterval } from '@/components/settings/globalUpdate/GlobalUpdateSettingsInterval.tsx';

export const GlobalUpdateSettings = () => {
    const { t } = useTranslation();

    return (
        <List
            subheader={
                <ListSubheader component="div" id="global-update-settings">
                    {t('library.settings.global_update.title')}
                </ListSubheader>
            }
        >
            <GlobalUpdateSettingsInterval />
            <GlobalUpdateSettingsEntries />
            <GlobalUpdateSettingsCategories />
        </List>
    );
};
