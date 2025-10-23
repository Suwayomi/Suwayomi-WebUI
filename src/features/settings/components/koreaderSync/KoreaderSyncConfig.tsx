/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useTranslation } from 'react-i18next';
import List from '@mui/material/List';
import ListSubheader from '@mui/material/ListSubheader';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';

import { requestManager } from '@/lib/requests/RequestManager.ts';
import { SelectSetting } from '@/base/components/settings/SelectSetting.tsx';
import { NumberSetting } from '@/base/components/settings/NumberSetting.tsx';
import { makeToast } from '@/base/utils/Toast.ts';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';
import { GET_SERVER_SETTINGS } from '@/lib/graphql/queries/SettingsQuery.ts';
import { ServerSettings } from '@/features/settings/Settings.types.ts';
import { KoreaderSyncChecksumMethod, KoreaderSyncConflictStrategy } from '@/lib/graphql/generated/graphql.ts';
import { KOREADER_SYNC_PERCENTAGE_TOLERANCE } from '@/features/settings/Settings.constants.ts';
import { TextSetting } from '@/base/components/settings/text/TextSetting.tsx';

export const KoreaderSyncConfig = ({ settings }: { settings: ServerSettings }) => {
    const { t } = useTranslation();

    const [logout, { loading }] = requestManager.useLogoutKoSyncAccount({
        update(cache, { data }) {
            if (data?.logoutKoSyncAccount.success) {
                cache.writeQuery({
                    query: GET_SERVER_SETTINGS,
                    data: { settings: data.logoutKoSyncAccount.settings },
                });
            }
        },
    });

    const handleLogout = async () => {
        try {
            await logout({ variables: { input: {} } });
            makeToast(t('settings.server.koreader.sync.message.disconnect_success'), 'success');
        } catch (e) {
            makeToast(t('settings.server.koreader.sync.message.disconnect_error'), 'error', getErrorMessage(e));
        }
    };

    return (
        <List
            subheader={
                <ListSubheader component="div" id="koreader-sync-config-settings">
                    {t('settings.server.koreader.sync.title')}
                </ListSubheader>
            }
        >
            <ListItem>
                <ListItemText
                    primary={t('settings.server.koreader.sync.logged_in_as')}
                    secondary={settings.koreaderSyncUsername}
                />
            </ListItem>

            <SelectSetting<KoreaderSyncConflictStrategy>
                settingName={t('settings.server.koreader.sync.strategy_forward_title')}
                value={settings.koreaderSyncStrategyForward}
                values={[
                    [KoreaderSyncConflictStrategy.Prompt, { text: t('settings.server.koreader.sync.strategy_prompt') }],
                    [
                        KoreaderSyncConflictStrategy.KeepLocal,
                        { text: t('settings.server.koreader.sync.strategy_keep_local') },
                    ],
                    [
                        KoreaderSyncConflictStrategy.KeepRemote,
                        { text: t('settings.server.koreader.sync.strategy_keep_remote') },
                    ],
                    [
                        KoreaderSyncConflictStrategy.Disabled,
                        { text: t('settings.server.koreader.sync.strategy_disabled') },
                    ],
                ]}
                handleChange={(value) => requestManager.updateServerSettings('koreaderSyncStrategyForward', value)}
            />

            <SelectSetting<KoreaderSyncConflictStrategy>
                settingName={t('settings.server.koreader.sync.strategy_backward_title')}
                value={settings.koreaderSyncStrategyBackward}
                values={[
                    [KoreaderSyncConflictStrategy.Prompt, { text: t('settings.server.koreader.sync.strategy_prompt') }],
                    [
                        KoreaderSyncConflictStrategy.KeepLocal,
                        { text: t('settings.server.koreader.sync.strategy_keep_local') },
                    ],
                    [
                        KoreaderSyncConflictStrategy.KeepRemote,
                        { text: t('settings.server.koreader.sync.strategy_keep_remote') },
                    ],
                    [
                        KoreaderSyncConflictStrategy.Disabled,
                        { text: t('settings.server.koreader.sync.strategy_disabled') },
                    ],
                ]}
                handleChange={(value) => requestManager.updateServerSettings('koreaderSyncStrategyBackward', value)}
            />

            <SelectSetting<KoreaderSyncChecksumMethod>
                settingName={t('settings.server.koreader.sync.check_sum_method.title')}
                value={settings.koreaderSyncChecksumMethod}
                values={[
                    [
                        KoreaderSyncChecksumMethod.Binary,
                        { text: t('settings.server.koreader.sync.check_sum_method.binary') },
                    ],
                    [
                        KoreaderSyncChecksumMethod.Filename,
                        { text: t('settings.server.koreader.sync.check_sum_method.filename') },
                    ],
                ]}
                handleChange={(value) => requestManager.updateServerSettings('koreaderSyncChecksumMethod', value)}
            />

            <TextSetting
                settingName={t('settings.server.koreader.sync.device_id')}
                value={settings.koreaderSyncDeviceId}
                handleChange={(value) => requestManager.updateServerSettings('koreaderSyncDeviceId', value)}
            />

            <NumberSetting
                settingTitle={t('settings.server.koreader.sync.tolerance.title')}
                dialogDescription={t('settings.server.koreader.sync.tolerance.description')}
                settingValue={settings.koreaderSyncPercentageTolerance.toString()}
                value={settings.koreaderSyncPercentageTolerance}
                defaultValue={KOREADER_SYNC_PERCENTAGE_TOLERANCE.default}
                minValue={KOREADER_SYNC_PERCENTAGE_TOLERANCE.min}
                maxValue={KOREADER_SYNC_PERCENTAGE_TOLERANCE.max}
                stepSize={KOREADER_SYNC_PERCENTAGE_TOLERANCE.step}
                valueUnit=""
                handleUpdate={(value) => requestManager.updateServerSettings('koreaderSyncPercentageTolerance', value)}
            />

            <Stack direction="row" justifyContent="flex-end" sx={{ p: 2 }}>
                <Button variant="outlined" color="error" onClick={handleLogout} disabled={loading}>
                    {t('settings.server.koreader.sync.disconnect')}
                </Button>
            </Stack>
        </List>
    );
};
