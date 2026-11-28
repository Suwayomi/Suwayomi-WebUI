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
import { WebUIUpdateIntervalSetting } from '@/views/settings/components/webUI/WebUIUpdateIntervalSetting.tsx';
import { TextSetting } from '@/views/base/components/settings/text/TextSetting.tsx';
import { SelectSetting } from '@/views/base/components/settings/SelectSetting.tsx';
import type { WebUiChannel, WebUiInterface } from '@/lib/graphql/generated/graphql-base.types.ts';
import { WebUiFlavor } from '@/lib/graphql/generated/graphql-base.types.ts';
import { LoadingPlaceholder } from '@/views/base/components/feedback/LoadingPlaceholder.tsx';
import { EmptyViewAbsoluteCentered } from '@/views/base/components/feedback/EmptyViewAbsoluteCentered.tsx';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import {
    createUpdateMetadataServerSettings,
    useMetadataServerSettings,
} from '@/controllers/settings/services/ServerSettingsMetadata.ts';
import type { WebUISettingsType } from '@/models/settings/Settings.types.ts';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';
import { useAppTitle } from '@/controllers/navigation-bar/hooks/useAppTitle.ts';
import {
    WEB_UI_CHANNEL_SELECT_VALUES,
    WEB_UI_FLAVOR_SELECT_VALUES,
    WEB_UI_INTERFACE_SELECT_VALUES,
} from '@/models/settings/Settings.constants.ts';
import type { MetadataUpdateSettings } from '@/models/app-updates/AppUpdateChecker.types.ts';
import { Notifications } from '@/controllers/base/services/notification/Notifications.ts';

export const WebUISettings = () => {
    const { t } = useLingui();

    useAppTitle(t`WebUI`);

    const {
        settings: { webUIInformAvailableUpdate, webUIInformVersionUpdated },
        loading: areMetadataServerSettingsLoading,
        request: { error: metadataServerSettingsError, refetch: refetchServerMetadataSettings },
    } = useMetadataServerSettings();
    const updateMetadataServerSettings = createUpdateMetadataServerSettings<
        keyof Pick<MetadataUpdateSettings, 'webUIInformAvailableUpdate' | 'webUIInformVersionUpdated'>
    >((e) => Notifications.error(t`Failed to save changes`, getErrorMessage(e)));

    const {
        data,
        loading: areServerSettingsLoading,
        error: serverSettingsError,
        refetch: refetchServerSettings,
    } = requestManager.useGetServerSettings();
    const [mutateSettings] = requestManager.useUpdateServerSettings();

    const updateSetting = <Setting extends keyof WebUISettingsType>(
        setting: Setting,
        value: WebUISettingsType[Setting],
    ) => {
        if (setting === 'webUIChannel') {
            requestManager.graphQLClient.client.cache.evict({ fieldName: 'checkForWebUIUpdate' });
        }

        mutateSettings({ variables: { input: { settings: { [setting]: value } } } }).catch((e) =>
            Notifications.error(t`Failed to save changes`, getErrorMessage(e)),
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
            <ListItem>
                <ListItemText
                    primary={t`Inform about updated version`}
                    secondary={t`Shows a dialog in case the version got updated. This dialog will be shown in case an app refresh is required, regardless of this setting.`}
                />
                <Switch
                    edge="end"
                    checked={webUIInformVersionUpdated}
                    onChange={(e) => updateMetadataServerSettings('webUIInformVersionUpdated', e.target.checked)}
                />
            </ListItem>
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
