/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import List from '@mui/material/List';
import ListSubheader from '@mui/material/ListSubheader';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';

import { useLingui } from '@lingui/react/macro';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { SelectSetting } from '@/base/components/settings/SelectSetting.tsx';
import { NumberSetting } from '@/base/components/settings/NumberSetting.tsx';
import { makeToast } from '@/base/utils/Toast.ts';
import { getErrorMessage, noOp } from '@/lib/HelperFunctions.ts';
import {
    KoreaderSyncChecksumMethod,
    KoreaderSyncConflictStrategy,
    KoSyncStatusPayload,
} from '@/lib/graphql/generated/graphql.ts';
import {
    KOREADER_SYNC_CHECKSUM_METHOD_SELECT_VALUES,
    KOREADER_SYNC_CONFLICT_STRATEGY_SELECT_VALUES,
    KOREADER_SYNC_PERCENTAGE_TOLERANCE,
} from '@/features/settings/Settings.constants.ts';
import { CredentialsLogin } from '@/base/components/modals/LoginDialog.tsx';
import { ServerSettings as ServerSettingsType, ServerSettings } from '@/features/settings/Settings.types.ts';
import { assertIsDefined } from '@/base/Asserts.ts';

export const KoreaderSyncSettings = ({
    settings: {
        koreaderSyncPercentageTolerance,
        koreaderSyncStrategyBackward,
        koreaderSyncStrategyForward,
        koreaderSyncChecksumMethod,
    },
    serverAddress: currentServerAddress,
    username: currentUsername,
    isLoggedIn,
    updateSetting,
}: {
    settings: ServerSettings;

    updateSetting: <Setting extends keyof ServerSettingsType>(
        setting: Setting,
        value: ServerSettingsType[Setting],
        onCompletion?: (success: boolean) => void,
    ) => Promise<void>;
} & Omit<KoSyncStatusPayload, '__typename'>) => {
    const { t } = useLingui();

    const handleLogout = async () => {
        const { data } = await requestManager.koSyncLogout().response;

        if (data?.logoutKoSyncAccount.status.isLoggedIn) {
            throw new Error(t`Could not log out from KOReader Sync`);
        }
    };

    const handleLogin = async (serverAddress: string, username: string, password: string) => {
        const { data } = await requestManager.koSyncLogin(serverAddress, username, password).response;

        if (!data?.connectKoSyncAccount.status.isLoggedIn) {
            throw new Error(data?.connectKoSyncAccount.message ?? t`Unknown`);
        }
    };

    const handleLoginLogout = async (
        initialServerAddress: string = 'https://sync.koreader.rocks/',
        initialUsername?: string,
        initialPassword?: string,
    ) => {
        const controlled = CredentialsLogin.showControlled(
            {
                title: isLoggedIn ? t`Disconnect from KOReader Sync server` : t`Connect to KOReader Sync server`,
                description: isLoggedIn ? t`Connected as ${initialUsername} to ${initialServerAddress}` : undefined,
                isLoading: false,
                isLoggedIn,
                withServerAddress: true,
                username: initialUsername,
                password: initialPassword,
                serverAddress: initialServerAddress,
                loginLogout: async (username, password, serverAddress) => {
                    controlled.update({ isLoading: true, loginLogout: noOp });

                    if (isLoggedIn) {
                        try {
                            await handleLogout();

                            controlled.submit();
                        } catch (e) {
                            makeToast(t`Failed to disconnect from KOReader Sync server.`, 'error', getErrorMessage(e));
                        }

                        return;
                    }

                    try {
                        assertIsDefined(serverAddress);
                        await handleLogin(serverAddress, username, password);

                        controlled.submit();
                    } catch (e) {
                        makeToast(t`Failed to connect to KOReader Sync server.`, 'error', getErrorMessage(e));

                        const RETRY_KEY = '__retry__';
                        const retry = await Promise.race([controlled.promise, Promise.resolve(RETRY_KEY)]);
                        if (retry === RETRY_KEY) {
                            handleLoginLogout(serverAddress, username, password);
                        }
                    }
                },
            },
            { id: 'koreader-sync-login-logout' },
        );
    };

    return (
        <List
            subheader={
                <ListSubheader component="div" id="koreader-sync-settings">
                    {t`KOReader Sync`}
                </ListSubheader>
            }
        >
            <ListItemButton
                onClick={() => handleLoginLogout(currentServerAddress ?? undefined, currentUsername ?? undefined)}
            >
                <ListItemText
                    primary={t`Sync status`}
                    secondary={
                        isLoggedIn ? t`Connected as ${currentUsername} to ${currentServerAddress}` : t`Disconnected`
                    }
                />
            </ListItemButton>
            <SelectSetting<KoreaderSyncConflictStrategy>
                settingName={t`Sync to a newer state`}
                value={koreaderSyncStrategyForward}
                values={KOREADER_SYNC_CONFLICT_STRATEGY_SELECT_VALUES}
                handleChange={(value) => updateSetting('koreaderSyncStrategyForward', value)}
            />
            <SelectSetting<KoreaderSyncConflictStrategy>
                settingName={t`Sync to an older state`}
                value={koreaderSyncStrategyBackward}
                values={KOREADER_SYNC_CONFLICT_STRATEGY_SELECT_VALUES}
                handleChange={(value) => updateSetting('koreaderSyncStrategyBackward', value)}
            />
            <SelectSetting<KoreaderSyncChecksumMethod>
                settingName={t`Document matching method`}
                value={koreaderSyncChecksumMethod}
                values={KOREADER_SYNC_CHECKSUM_METHOD_SELECT_VALUES}
                handleChange={(value) => updateSetting('koreaderSyncChecksumMethod', value)}
            />
            <NumberSetting
                settingTitle={t`Percentage Tolerance`}
                dialogDescription={t`Sync will not be triggered if the progress difference is within this tolerance.`}
                settingValue={koreaderSyncPercentageTolerance.toString()}
                value={koreaderSyncPercentageTolerance}
                defaultValue={KOREADER_SYNC_PERCENTAGE_TOLERANCE.default}
                minValue={KOREADER_SYNC_PERCENTAGE_TOLERANCE.min}
                maxValue={KOREADER_SYNC_PERCENTAGE_TOLERANCE.max}
                stepSize={KOREADER_SYNC_PERCENTAGE_TOLERANCE.step}
                valueUnit=""
                handleUpdate={(value) => updateSetting('koreaderSyncPercentageTolerance', value)}
            />
        </List>
    );
};
