/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import List from '@mui/material/List';
import ListSubheader from '@mui/material/ListSubheader';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { TextSetting } from '@/base/components/settings/text/TextSetting.tsx';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { makeToast } from '@/base/utils/Toast.ts';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';
import { GET_SERVER_SETTINGS } from '@/lib/graphql/queries/SettingsQuery.ts';
import { ServerSettings } from '@/features/settings/Settings.types.ts';

export const KoreaderSyncLogin = ({ settings }: { settings: ServerSettings }) => {
    const { t } = useTranslation();

    const [username, setUsername] = useState(settings.koreaderSyncUsername);
    const [password, setPassword] = useState('');
    const [serverUrl, setServerUrl] = useState(settings.koreaderSyncServerUrl);

    const [connect, { loading }] = requestManager.useConnectKoSyncAccount({
        update(cache, { data }) {
            if (data?.connectKoSyncAccount.success) {
                cache.writeQuery({
                    query: GET_SERVER_SETTINGS,
                    data: { settings: data.connectKoSyncAccount.settings },
                });
            }
        },
    });

    const handleConnect = async () => {
        try {
            // Primero, guarda la URL del servidor
            await requestManager.updateServerSettings('koreaderSyncServerUrl', serverUrl).response;

            // Luego, intenta conectar
            const { data } = await connect({ variables: { input: { username, password } } });

            if (data?.connectKoSyncAccount.success) {
                makeToast(t('settings.server.koreader.sync.message.connect_success'), 'success');
            } else {
                throw new Error(data?.connectKoSyncAccount.message ?? t('global.error.label.unknown'));
            }
        } catch (e) {
            makeToast(t('settings.server.koreader.sync.message.connect_error'), 'error', getErrorMessage(e));
        }
    };

    return (
        <List
            subheader={
                <ListSubheader component="div" id="koreader-sync-login-settings">
                    {t('settings.server.koreader.sync.title')}
                </ListSubheader>
            }
        >
            <TextSetting
                settingName={t('settings.server.koreader.sync.server_url')}
                value={serverUrl}
                handleChange={setServerUrl}
            />
            <TextSetting
                settingName={t('settings.server.koreader.sync.username')}
                value={username}
                handleChange={setUsername}
            />
            <TextSetting
                settingName={t('global.label.password')}
                value={password}
                handleChange={setPassword}
                isPassword
            />
            <Stack direction="row" justifyContent="flex-end" sx={{ p: 2 }}>
                <Button
                    variant="contained"
                    onClick={handleConnect}
                    disabled={loading || !username || !password || !serverUrl}
                >
                    {t('settings.server.koreader.sync.connect')}
                </Button>
            </Stack>
        </List>
    );
};
