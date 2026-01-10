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
import Switch from '@mui/material/Switch';
import { useLingui } from '@lingui/react/macro';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { WebUIUpdateIntervalSetting } from '@/features/settings/components/webUI/WebUIUpdateIntervalSetting.tsx';
import { TextSetting } from '@/base/components/settings/text/TextSetting.tsx';
import { SelectSetting } from '@/base/components/settings/SelectSetting.tsx';
import { WebUiChannel, WebUiFlavor, WebUiInterface } from '@/lib/graphql/generated/graphql.ts';
import { LoadingPlaceholder } from '@/base/components/feedback/LoadingPlaceholder.tsx';
import { EmptyViewAbsoluteCentered } from '@/base/components/feedback/EmptyViewAbsoluteCentered.tsx';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import {
    createUpdateMetadataServerSettings,
    useMetadataServerSettings,
} from '@/features/settings/services/ServerSettingsMetadata.ts';
import { makeToast } from '@/base/utils/Toast.ts';
import { MetadataUpdateSettings } from '@/features/app-updates/AppUpdateChecker.types.ts';
import { WebUISettingsType } from '@/features/settings/Settings.types.ts';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';
import { useAppTitle } from '@/features/navigation-bar/hooks/useAppTitle.ts';
import {
    WEB_UI_CHANNEL_SELECT_VALUES,
    WEB_UI_FLAVOR_SELECT_VALUES,
    WEB_UI_INTERFACE_SELECT_VALUES,
} from '@/features/settings/Settings.constants.ts';

export const WebUISettings = () => {
    const { t } = useLingui();

    useAppTitle(t`WebUI`);

    const {
        settings: { webUIInformAvailableUpdate },
        loading: areMetadataServerSettingsLoading,
        request: { error: metadataServerSettingsError, refetch: refetchServerMetadataSettings },
    } = useMetadataServerSettings();
    const updateMetadataServerSettings = createUpdateMetadataServerSettings<
        keyof Pick<MetadataUpdateSettings, 'webUIInformAvailableUpdate'>
    >((e) => makeToast(t`Failed to save changes`, 'error', getErrorMessage(e)));

    const {
        data,
        loading: areServerSettingsLoading,
        error: serverSettingsError,
        refetch: refetchServerSettings,
    } = requestManager.useGetServerSettings({
        notifyOnNetworkStatusChange: true,
    });
    const [mutateSettings] = requestManager.useUpdateServerSettings();

    const updateSetting = <Setting extends keyof WebUISettingsType>(
        setting: Setting,
        value: WebUISettingsType[Setting],
    ) => {
        if (setting === 'webUIChannel') {
            requestManager.graphQLClient.client.cache.evict({ fieldName: 'checkForWebUIUpdate' });
        }

        mutateSettings({ variables: { input: { settings: { [setting]: value } } } }).catch((e) =>
            makeToast(t`Failed to save changes`, 'error', getErrorMessage(e)),
        );
    };

    const loading = areMetadataServerSettingsLoading || areServerSettingsLoading;
    if (loading) {
        return <LoadingPlaceholder />;
    }

    const error = metadataServerSettingsError ?? serverSettingsError;
    if (error) {
        return (
            <EmptyViewAbsoluteCentered
                message={t`Unable to load data`}
                messageExtra={getErrorMessage(error)}
                retry={() => {
                    if (metadataServerSettingsError) {
                        refetchServerMetadataSettings().catch(
                            defaultPromiseErrorHandler('WebUISettings::refetchServerMetadataSettings'),
                        );
                    }

                    if (serverSettingsError) {
                        refetchServerSettings().catch(
                            defaultPromiseErrorHandler('WebUISettings::refetchServerSettings'),
                        );
                    }
                }}
            />
        );
    }

    const webUISettings = data!.settings;
    const isCustomWebUI = webUISettings.webUIFlavor === WebUiFlavor.Custom;

    return (
        <List sx={{ pt: 0 }}>
            <SelectSetting<WebUiFlavor>
                settingName={t`Flavor`}
                value={webUISettings.webUIFlavor}
                values={WEB_UI_FLAVOR_SELECT_VALUES}
                handleChange={(flavor) => updateSetting('webUIFlavor', flavor)}
            />
            <ListItem>
                <ListItemText primary={t`Open the WebUI when starting the server`} />
                <Switch
                    edge="end"
                    checked={webUISettings.initialOpenInBrowserEnabled}
                    onChange={(e) => updateSetting('initialOpenInBrowserEnabled', e.target.checked)}
                />
            </ListItem>
            <SelectSetting<WebUiInterface>
                settingName={t`Interface`}
                value={webUISettings.webUIInterface}
                values={WEB_UI_INTERFACE_SELECT_VALUES}
                handleChange={(webUIInterface) => updateSetting('webUIInterface', webUIInterface)}
            />
            <TextSetting
                settingName={t`Electron path`}
                dialogDescription={t`The path to the electron installation on the server`}
                value={webUISettings.electronPath}
                settingDescription={webUISettings.electronPath.length ? webUISettings.electronPath : t`Default`}
                handleChange={(path) => updateSetting('electronPath', path)}
            />
            <SelectSetting<WebUiChannel>
                settingName={t`Channel`}
                value={webUISettings.webUIChannel}
                values={WEB_UI_CHANNEL_SELECT_VALUES}
                handleChange={(channel) => updateSetting('webUIChannel', channel)}
                disabled={isCustomWebUI}
            />
            <WebUIUpdateIntervalSetting
                disabled={isCustomWebUI}
                updateCheckInterval={webUISettings.webUIUpdateCheckInterval}
            />
            {!webUISettings.webUIUpdateCheckInterval && (
                <ListItem>
                    <ListItemText
                        primary={t`Inform about available update`}
                        secondary={t`Shows a dialog in case a new version is available`}
                    />
                    <Switch
                        edge="end"
                        checked={webUIInformAvailableUpdate}
                        onChange={(e) => updateMetadataServerSettings('webUIInformAvailableUpdate', e.target.checked)}
                    />
                </ListItem>
            )}
        </List>
    );
};
