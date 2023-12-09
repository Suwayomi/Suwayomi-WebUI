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
import { ListItem, ListItemText, Switch } from '@mui/material';
import { NavBarContext, useSetDefaultBackTo } from '@/components/context/NavbarContext.tsx';
import { ServerSettings } from '@/typings.ts';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { WebUIUpdateIntervalSetting } from '@/components/settings/webUI/WebUIUpdateIntervalSetting.tsx';
import { TextSetting } from '@/components/settings/TextSetting.tsx';
import {
    SelectSetting,
    SelectSettingValue,
    SelectSettingValueDisplayInfo,
} from '@/components/settings/SelectSetting.tsx';
import { WebUiChannel, WebUiFlavor, WebUiInterface } from '@/lib/graphql/generated/graphql.ts';

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
    },
    [WebUiChannel.Stable]: {
        text: 'settings.webui.channel.option.stable.label.title',
        description: 'settings.webui.channel.option.stable.label.description',
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

    useSetDefaultBackTo('settings');

    useEffect(() => {
        setTitle(t('settings.webui.title.settings'));
        setAction(null);
    }, [t]);

    const { data } = requestManager.useGetServerSettings();
    const webUISettings = data ? extractWebUISettings(data.settings) : undefined;
    const [mutateSettings] = requestManager.useUpdateServerSettings();

    const isDefaultWebUI = webUISettings?.webUIFlavor === WebUiFlavor.Webui;

    const updateSetting = <Setting extends keyof WebUISettingsType>(
        setting: Setting,
        value: WebUISettingsType[Setting],
    ) => {
        mutateSettings({ variables: { input: { settings: { [setting]: value } } } });
    };

    return (
        <List>
            <SelectSetting<WebUiFlavor>
                settingName={t('settings.webui.flavor.label.title')}
                value={webUISettings?.webUIFlavor}
                defaultValue={WebUiFlavor.Webui}
                values={FLAVOR_SELECT_VALUES}
                handleChange={(flavor) => updateSetting('webUIFlavor', flavor)}
            />
            <ListItem>
                <ListItemText primary={t('settings.webui.label.initial_open_browser')} />
                <Switch
                    edge="end"
                    checked={!!webUISettings?.initialOpenInBrowserEnabled}
                    onChange={(e) => updateSetting('initialOpenInBrowserEnabled', e.target.checked)}
                />
            </ListItem>
            <SelectSetting<WebUiInterface>
                settingName={t('settings.webui.interface.label.title')}
                value={webUISettings?.webUIInterface}
                defaultValue={WebUiInterface.Browser}
                values={INTERFACE_SELECT_VALUES}
                handleChange={(webUIInterface) => updateSetting('webUIInterface', webUIInterface)}
            />
            <TextSetting
                settingName={t('settings.webui.electron_path.label.title')}
                dialogDescription={t('settings.webui.electron_path.label.description')}
                value={webUISettings?.electronPath}
                handleChange={(path) => updateSetting('electronPath', path)}
            />
            <SelectSetting<WebUiChannel>
                settingName={t('settings.webui.channel.label.title')}
                value={webUISettings?.webUIChannel}
                defaultValue={WebUiChannel.Stable}
                values={CHANNEL_SELECT_VALUES}
                handleChange={(channel) => updateSetting('webUIChannel', channel)}
                disabled={!isDefaultWebUI}
            />
            <WebUIUpdateIntervalSetting disabled={!isDefaultWebUI} />
        </List>
    );
};
