/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useTranslation, Trans } from 'react-i18next';
import { useContext, useEffect } from 'react';
import { List, ListItem, ListItemText, Switch } from '@mui/material';
import ListSubheader from '@mui/material/ListSubheader';
import { NavBarContext, useSetDefaultBackTo } from '@/components/context/NavbarContext.tsx';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { useLocalStorage } from '@/util/useLocalStorage.tsx';
import { TextSetting } from '@/components/settings/text/TextSetting.tsx';
import { ServerSettings as GqlServerSettings } from '@/typings.ts';
import { NumberSetting } from '@/components/settings/NumberSetting.tsx';
import { MutableListSetting } from '@/components/settings/MutableListSetting.tsx';

type ServerSettingsType = Pick<
    GqlServerSettings,
    | 'ip'
    | 'port'
    | 'socksProxyEnabled'
    | 'socksProxyHost'
    | 'socksProxyPort'
    | 'debugLogsEnabled'
    | 'gqlDebugLogsEnabled'
    | 'systemTrayEnabled'
    | 'basicAuthEnabled'
    | 'basicAuthUsername'
    | 'basicAuthPassword'
    | 'maxSourcesInParallel'
    | 'localSourcePath'
    | 'extensionRepos'
>;

const extractDownloadSettings = (settings: GqlServerSettings): ServerSettingsType => ({
    ip: settings.ip,
    port: settings.port,
    socksProxyEnabled: settings.socksProxyEnabled,
    socksProxyHost: settings.socksProxyHost,
    socksProxyPort: settings.socksProxyPort,
    debugLogsEnabled: settings.debugLogsEnabled,
    gqlDebugLogsEnabled: settings.gqlDebugLogsEnabled,
    systemTrayEnabled: settings.systemTrayEnabled,
    basicAuthEnabled: settings.basicAuthEnabled,
    basicAuthUsername: settings.basicAuthUsername,
    basicAuthPassword: settings.basicAuthPassword,
    maxSourcesInParallel: settings.maxSourcesInParallel,
    localSourcePath: settings.localSourcePath,
    extensionRepos: settings.extensionRepos,
});

export const ServerSettings = () => {
    const { t } = useTranslation();
    const { setTitle, setAction } = useContext(NavBarContext);

    useSetDefaultBackTo('settings');

    useEffect(() => {
        setTitle(t('settings.server.title.settings'));
        setAction(null);
    }, [t]);

    const { data } = requestManager.useGetServerSettings();
    const serverSettings = data ? extractDownloadSettings(data.settings) : undefined;
    const [mutateSettings] = requestManager.useUpdateServerSettings();

    const [serverAddress, setServerAddress] = useLocalStorage<string>('serverBaseURL', '');

    const handleServerAddressChange = (address: string) => {
        const serverBaseUrl = address.replaceAll(/(\/)+$/g, '');
        setServerAddress(serverBaseUrl);
        requestManager.updateClient({ baseURL: serverBaseUrl });
    };

    const updateSetting = <Setting extends keyof ServerSettingsType>(
        setting: Setting,
        value: ServerSettingsType[Setting],
    ) => {
        mutateSettings({ variables: { input: { settings: { [setting]: value } } } });
    };

    return (
        <List>
            <List
                subheader={
                    <ListSubheader component="div" id="server-settings-client">
                        {t('global.label.client')}
                    </ListSubheader>
                }
            >
                <TextSetting
                    settingName={t('settings.about.server.label.address')}
                    handleChange={handleServerAddressChange}
                    value={serverAddress}
                    placeholder="http://localhost:4567"
                />
            </List>
            <List
                subheader={
                    <ListSubheader component="div" id="server-settings-requests">
                        {t('settings.server.requests.title')}
                    </ListSubheader>
                }
            >
                <NumberSetting
                    settingTitle={t('settings.server.requests.sources.parallel.label.title')}
                    settingValue={t('settings.server.requests.sources.parallel.label.value', {
                        value: serverSettings?.maxSourcesInParallel,
                        count: serverSettings?.maxSourcesInParallel,
                    })}
                    valueUnit={t('source.title')}
                    value={serverSettings?.maxSourcesInParallel ?? 6}
                    defaultValue={6}
                    minValue={1}
                    maxValue={20}
                    showSlider
                    stepSize={1}
                    dialogTitle={t('settings.server.requests.sources.parallel.label.title')}
                    handleUpdate={(parallelSources) => updateSetting('maxSourcesInParallel', parallelSources)}
                />
            </List>
            <List
                subheader={
                    <ListSubheader component="div" id="server-settings-extension-repos">
                        {t('extension.title')}
                    </ListSubheader>
                }
            >
                <MutableListSetting
                    settingName={t('extension.settings.repositories.custom.label.title')}
                    description={t('extension.settings.repositories.custom.label.description')}
                    dialogDisclaimer={
                        <Trans i18nKey="extension.settings.repositories.custom.label.disclaimer">
                            <strong>
                                Suwayomi does not provide any support for 3rd party repositories or extensions!
                            </strong>
                            <br />
                            Use with caution as there could be malicious actors making those repositories.
                            <br />
                            You as the user need to verify the security and that you trust any repository or extension.
                        </Trans>
                    }
                    handleChange={(repos) => {
                        updateSetting('extensionRepos', repos);
                        requestManager.clearExtensionCache();
                    }}
                    values={serverSettings?.extensionRepos}
                    addItemButtonTitle={t('extension.settings.repositories.custom.dialog.action.button.add')}
                    placeholder="https://github.com/MY_ACCOUNT/MY_REPO/tree/repo"
                    validateItem={(repo) =>
                        !!repo.match(
                            /https:\/\/(?:www|raw)?(?:github|githubusercontent)\.com\/([^/]+)\/([^/]+)(?:\/(?:tree|blob)\/(.*))?\/?/g,
                        )
                    }
                    invalidItemError={t('extension.settings.repositories.custom.error.label.invalid_url')}
                />
            </List>
            <List
                subheader={
                    <ListSubheader component="div" id="server-settings-requests">
                        {t('source.local_source.title')}
                    </ListSubheader>
                }
            >
                <TextSetting
                    settingName={t('settings.server.local_source.path.label.title')}
                    dialogDescription={t('settings.server.local_source.path.label.description')}
                    value={serverSettings?.localSourcePath}
                    handleChange={(path) => updateSetting('localSourcePath', path)}
                />
            </List>
            <List
                subheader={
                    <ListSubheader component="div" id="server-settings-server-address">
                        {t('settings.server.address.server.title')}
                    </ListSubheader>
                }
            >
                <TextSetting
                    settingName={t('settings.server.address.server.label.ip')}
                    handleChange={(ip) => updateSetting('ip', ip)}
                    value={serverSettings?.ip}
                    placeholder="0.0.0.0"
                />
                <NumberSetting
                    settingTitle={t('settings.server.address.server.label.port')}
                    settingValue={serverSettings?.port.toString()}
                    dialogTitle={t('settings.server.address.server.label.port')}
                    handleUpdate={(port) => updateSetting('port', port)}
                    value={serverSettings?.port ?? 4567}
                    defaultValue={4567}
                    valueUnit={t('settings.server.address.server.label.port')}
                />
            </List>
            <List
                subheader={
                    <ListSubheader component="div" id="server-settings-socks-proxy">
                        {t('settings.server.socks_proxy.title')}
                    </ListSubheader>
                }
            >
                <ListItem>
                    <ListItemText primary={t('settings.server.socks_proxy.label.enable')} />
                    <Switch
                        edge="end"
                        checked={!!serverSettings?.socksProxyEnabled}
                        onChange={(e) => updateSetting('socksProxyEnabled', e.target.checked)}
                    />
                </ListItem>
                <TextSetting
                    settingName={t('settings.server.socks_proxy.label.host')}
                    value={serverSettings?.socksProxyHost}
                    handleChange={(proxyHost) => updateSetting('socksProxyHost', proxyHost)}
                    disabled={!serverSettings?.socksProxyEnabled}
                />
                <TextSetting
                    settingName={t('settings.server.socks_proxy.label.port')}
                    value={serverSettings?.socksProxyPort}
                    handleChange={(proxyPort) => updateSetting('socksProxyPort', proxyPort)}
                    disabled={!serverSettings?.socksProxyEnabled}
                />
            </List>
            <List
                subheader={
                    <ListSubheader component="div" id="server-settings-auth">
                        {t('settings.server.auth.title')}
                    </ListSubheader>
                }
            >
                <ListItem>
                    <ListItemText primary={t('settings.server.auth.basic.label.enable')} />
                    <Switch
                        edge="end"
                        checked={!!serverSettings?.basicAuthEnabled}
                        onChange={(e) => updateSetting('basicAuthEnabled', e.target.checked)}
                    />
                </ListItem>
                <TextSetting
                    settingName={t('settings.server.auth.basic.label.username')}
                    value={serverSettings?.basicAuthUsername}
                    handleChange={(authUsername) => updateSetting('basicAuthUsername', authUsername)}
                    disabled={!serverSettings?.basicAuthEnabled}
                />
                <TextSetting
                    settingName={t('settings.server.auth.basic.label.password')}
                    value={serverSettings?.basicAuthPassword}
                    isPassword
                    handleChange={(authPassword) => updateSetting('basicAuthPassword', authPassword)}
                    disabled={!serverSettings?.basicAuthEnabled}
                />
            </List>
            <List
                subheader={
                    <ListSubheader component="div" id="server-settings-misc">
                        {t('settings.server.misc.title')}
                    </ListSubheader>
                }
            >
                <ListItem>
                    <ListItemText primary={t('settings.server.misc.log_level.label.server')} />
                    <Switch
                        edge="end"
                        checked={!!serverSettings?.debugLogsEnabled}
                        onChange={(e) => updateSetting('debugLogsEnabled', e.target.checked)}
                    />
                </ListItem>
                <ListItem>
                    <ListItemText
                        primary={t('settings.server.misc.log_level.graphql.label.title')}
                        secondary={t('settings.server.misc.log_level.graphql.label.description')}
                    />
                    <Switch
                        edge="end"
                        checked={!!serverSettings?.gqlDebugLogsEnabled}
                        onChange={(e) => updateSetting('gqlDebugLogsEnabled', e.target.checked)}
                    />
                </ListItem>
                <ListItem>
                    <ListItemText
                        primary={t('settings.server.misc.tray_icon.label.title')}
                        secondary={t('settings.server.misc.tray_icon.label.description')}
                    />
                    <Switch
                        edge="end"
                        checked={!!serverSettings?.systemTrayEnabled}
                        onChange={(e) => updateSetting('systemTrayEnabled', e.target.checked)}
                    />
                </ListItem>
            </List>
        </List>
    );
};
