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
import { MetadataUpdateSettings, ServerSettings } from '@/typings.ts';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { WebUIUpdateIntervalSetting } from '@/components/settings/webUI/WebUIUpdateIntervalSetting.tsx';
import { TextSetting } from '@/components/settings/text/TextSetting.tsx';
import {
    SelectSetting,
    SelectSettingValue,
    SelectSettingValueDisplayInfo,
} from '@/components/settings/SelectSetting.tsx';
import { WebUiChannel, WebUiFlavor, WebUiInterface } from '@/lib/graphql/generated/graphql.ts';
import { LoadingPlaceholder } from '@/components/util/LoadingPlaceholder.tsx';
import { EmptyViewAbsoluteCentered } from '@/components/util/EmptyViewAbsoluteCentered.tsx';
import { defaultPromiseErrorHandler } from '@/util/defaultPromiseErrorHandler.ts';
import {
    createUpdateMetadataServerSettings,
    useMetadataServerSettings,
} from '@/lib/metadata/metadataServerSettings.ts';
import { makeToast } from '@/components/util/Toast.tsx';

type WebUISettingsType = Pick<
    ServerSettings,
    | 'webUIFlavor'
    | 'initialOpenInBrowserEnabled'
    | 'webUIInterface'
    | 'electronPath'
    | 'webUIChannel'
    | 'webUIUpdateCheckInterval'
>;

const FLAVORS = Object.values(WebUiFlavor);
const FLAVOR_TO_TRANSLATION_KEY: { [flavor in WebUiFlavor]: SelectSettingValueDisplayInfo } = {
    [WebUiFlavor.Webui]: {
        text: 'settings.webui.title.webui',
        description: 'settings.webui.flavor.option.webui.label.description',
        disclaimer: 'settings.webui.flavor.label.info',
    },
    [WebUiFlavor.Vui]: {
        text: 'settings.webui.flavor.option.vui.label.title',
        description: 'settings.webui.flavor.option.vui.label.description',
        disclaimer: 'settings.webui.flavor.label.info',
    },
    [WebUiFlavor.Custom]: {
        text: 'settings.webui.flavor.option.custom.label.title',
        description: 'settings.webui.flavor.option.custom.label.description',
    },
};
const FLAVOR_SELECT_VALUES: SelectSettingValue<WebUiFlavor>[] = FLAVORS.map((flavor) => [
    flavor,
    FLAVOR_TO_TRANSLATION_KEY[flavor],
]);

const CHANNELS = Object.values(WebUiChannel);
const CHANNEL_TO_TRANSLATION_KEYS: {
    [channel in WebUiChannel]: SelectSettingValueDisplayInfo;
} = {
    [WebUiChannel.Bundled]: {
        text: 'settings.webui.channel.option.bundled.label.title',
        description: 'settings.webui.channel.option.bundled.label.description',
        disclaimer: 'settings.webui.flavor.label.info',
    },
    [WebUiChannel.Stable]: {
        text: 'settings.webui.channel.option.stable.label.title',
        description: 'settings.webui.channel.option.stable.label.description',
        disclaimer: 'settings.webui.flavor.label.info',
    },
    [WebUiChannel.Preview]: {
        text: 'settings.webui.channel.option.preview.label.title',
        description: 'settings.webui.channel.option.preview.label.description',
        disclaimer: 'settings.webui.channel.option.preview.label.disclaimer',
    },
};
const CHANNEL_SELECT_VALUES: SelectSettingValue<WebUiChannel>[] = CHANNELS.map((channel) => [
    channel,
    CHANNEL_TO_TRANSLATION_KEYS[channel],
]);

const INTERFACES = Object.values(WebUiInterface);
const INTERFACE_TO_TRANSLATION_KEYS: {
    [webUIInterface in WebUiInterface]: SelectSettingValueDisplayInfo;
} = {
    [WebUiInterface.Browser]: {
        text: 'settings.webui.interface.option.label.browser',
        description: 'settings.webui.interface.label.description',
    },
    [WebUiInterface.Electron]: {
        text: 'settings.webui.interface.option.label.electron',
        description: 'settings.webui.interface.label.description',
    },
};
const INTERFACE_SELECT_VALUES: SelectSettingValue<WebUiInterface>[] = INTERFACES.map((webUIInterface) => [
    webUIInterface,
    INTERFACE_TO_TRANSLATION_KEYS[webUIInterface],
]);

const extractWebUISettings = (settings: ServerSettings): WebUISettingsType => ({
    webUIFlavor: settings.webUIFlavor,
    initialOpenInBrowserEnabled: settings.initialOpenInBrowserEnabled,
    webUIInterface: settings.webUIInterface,
    electronPath: settings.electronPath,
    webUIChannel: settings.webUIChannel,
    webUIUpdateCheckInterval: settings.webUIUpdateCheckInterval,
});

export const WebUISettings = () => {
    const { t } = useTranslation();
    const { setTitle, setAction } = useContext(NavBarContext);

    useEffect(() => {
        setTitle(t('settings.webui.title.settings'));
        setAction(null);

        return () => {
            setTitle('');
            setAction(null);
        };
    }, [t]);

    const {
        settings: { webUIInformAvailableUpdate },
        loading: areMetadataServerSettingsLoading,
        request: { error: metadataServerSettingsError, refetch: refetchServerMetadataSettings },
    } = useMetadataServerSettings();
    const updateMetadataServerSettings = createUpdateMetadataServerSettings<
        keyof Pick<MetadataUpdateSettings, 'webUIInformAvailableUpdate'>
    >(() => makeToast(t('global.error.label.failed_to_save_changes'), 'error'));

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

        mutateSettings({ variables: { input: { settings: { [setting]: value } } } }).catch(() =>
            makeToast(t('global.error.label.failed_to_save_changes'), 'error'),
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
                message={t('global.error.label.failed_to_load_data')}
                messageExtra={error.message}
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

    const webUISettings = extractWebUISettings(data!.settings);
    const isCustomWebUI = webUISettings.webUIFlavor === WebUiFlavor.Custom;

    return (
        <List sx={{ pt: 0 }}>
            <SelectSetting<WebUiFlavor>
                settingName={t('settings.webui.flavor.label.title')}
                value={webUISettings.webUIFlavor}
                values={FLAVOR_SELECT_VALUES}
                handleChange={(flavor) => updateSetting('webUIFlavor', flavor)}
            />
            <ListItem>
                <ListItemText primary={t('settings.webui.label.initial_open_browser')} />
                <Switch
                    edge="end"
                    checked={webUISettings.initialOpenInBrowserEnabled}
                    onChange={(e) => updateSetting('initialOpenInBrowserEnabled', e.target.checked)}
                />
            </ListItem>
            <SelectSetting<WebUiInterface>
                settingName={t('settings.webui.interface.label.title')}
                value={webUISettings.webUIInterface}
                values={INTERFACE_SELECT_VALUES}
                handleChange={(webUIInterface) => updateSetting('webUIInterface', webUIInterface)}
            />
            <TextSetting
                settingName={t('settings.webui.electron_path.label.title')}
                dialogDescription={t('settings.webui.electron_path.label.description')}
                value={webUISettings.electronPath}
                settingDescription={
                    webUISettings.electronPath.length ? webUISettings.electronPath : t('global.label.default')
                }
                handleChange={(path) => updateSetting('electronPath', path)}
            />
            <SelectSetting<WebUiChannel>
                settingName={t('settings.webui.channel.label.title')}
                value={webUISettings.webUIChannel}
                values={CHANNEL_SELECT_VALUES}
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
                        primary={t('global.update.settings.inform.label.title')}
                        secondary={t('global.update.settings.inform.label.description')}
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
