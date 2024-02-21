/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useTranslation, Trans } from 'react-i18next';
import { useContext, useEffect } from 'react';
import { Link, List, ListItem, ListItemText, Switch } from '@mui/material';
import ListSubheader from '@mui/material/ListSubheader';
import { NavBarContext, useSetDefaultBackTo } from '@/components/context/NavbarContext.tsx';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { useLocalStorage } from '@/util/useLocalStorage.tsx';
import { TextSetting } from '@/components/settings/text/TextSetting.tsx';
import { ServerSettings as GqlServerSettings } from '@/typings.ts';
import { NumberSetting } from '@/components/settings/NumberSetting.tsx';
import { SelectSetting } from '@/components/settings/SelectSetting.tsx';

type ServerSettingsType = Pick<
    GqlServerSettings,
    | 'ip'
    | 'port'
    | 'socksProxyEnabled'
    | 'socksProxyVersion'
    | 'socksProxyHost'
    | 'socksProxyPort'
    | 'socksProxyUsername'
    | 'socksProxyPassword'
    | 'debugLogsEnabled'
    | 'gqlDebugLogsEnabled'
    | 'systemTrayEnabled'
    | 'basicAuthEnabled'
    | 'basicAuthUsername'
    | 'basicAuthPassword'
    | 'flareSolverrEnabled'
    | 'flareSolverrTimeout'
    | 'flareSolverrUrl'
    | 'flareSolverrSessionName'
    | 'flareSolverrSessionTtl'
>;

const extractServerSettings = (settings: GqlServerSettings): ServerSettingsType => ({
    ip: settings.ip,
    port: settings.port,
    socksProxyEnabled: settings.socksProxyEnabled,
    socksProxyVersion: settings.socksProxyVersion,
    socksProxyHost: settings.socksProxyHost,
    socksProxyPort: settings.socksProxyPort,
    socksProxyUsername: settings.socksProxyUsername,
    socksProxyPassword: settings.socksProxyPassword,
    debugLogsEnabled: settings.debugLogsEnabled,
    gqlDebugLogsEnabled: settings.gqlDebugLogsEnabled,
    systemTrayEnabled: settings.systemTrayEnabled,
    basicAuthEnabled: settings.basicAuthEnabled,
    basicAuthUsername: settings.basicAuthUsername,
    basicAuthPassword: settings.basicAuthPassword,
    flareSolverrEnabled: settings.flareSolverrEnabled,
    flareSolverrTimeout: settings.flareSolverrTimeout,
    flareSolverrUrl: settings.flareSolverrUrl,
    flareSolverrSessionName: settings.flareSolverrSessionName,
    flareSolverrSessionTtl: settings.flareSolverrSessionTtl,
});

export const ServerSettings = () => {
    const { t } = useTranslation();
    const { setTitle, setAction } = useContext(NavBarContext);

    useSetDefaultBackTo('settings');

    useEffect(() => {
        setTitle(t('settings.server.title.settings'));
        setAction(null);

        return () => {
            setTitle('');
            setAction(null);
        };
    }, [t]);

    const { data } = requestManager.useGetServerSettings();
    const serverSettings = data ? extractServerSettings(data.settings) : undefined;
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
                <SelectSetting<number>
                    settingName={t('settings.server.socks_proxy.label.version')}
                    value={serverSettings?.socksProxyVersion}
                    defaultValue={5}
                    values={[
                        [4, { text: '4' }],
                        [5, { text: '5' }],
                    ]}
                    handleChange={(socksProxyVersion) => updateSetting('socksProxyVersion', socksProxyVersion)}
                    disabled={!serverSettings?.socksProxyEnabled}
                />
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
                <TextSetting
                    settingName={t('settings.server.socks_proxy.label.username')}
                    value={serverSettings?.socksProxyUsername}
                    handleChange={(proxyUsername) => updateSetting('socksProxyUsername', proxyUsername)}
                    disabled={!serverSettings?.socksProxyEnabled}
                />
                <TextSetting
                    settingName={t('settings.server.socks_proxy.label.password')}
                    value={serverSettings?.socksProxyPassword}
                    handleChange={(proxyPassword) => updateSetting('socksProxyPassword', proxyPassword)}
                    disabled={!serverSettings?.socksProxyEnabled}
                    isPassword
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
                    <ListSubheader component="div" id="server-settings-clouadflare-bypass">
                        {t('settings.server.cloudflare.title')}
                    </ListSubheader>
                }
            >
                <ListItem>
                    <ListItemText
                        primary={t('settings.server.cloudflare.flaresolverr.enabled.label.title')}
                        secondary={
                            <Trans i18nKey="settings.server.cloudflare.flaresolverr.enabled.label.description">
                                See{' '}
                                <Link
                                    href="https://github.com/FlareSolverr/FlareSolverr?tab=readme-ov-file#installation"
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    FlareSolverr
                                </Link>{' '}
                                for information on how to set it up
                            </Trans>
                        }
                    />
                    <Switch
                        edge="end"
                        checked={!!serverSettings?.flareSolverrEnabled}
                        onChange={(e) => updateSetting('flareSolverrEnabled', e.target.checked)}
                    />
                </ListItem>
                <TextSetting
                    settingName={t('settings.server.cloudflare.flaresolverr.url.label.title')}
                    dialogDescription={t('settings.server.cloudflare.flaresolverr.url.label.description')}
                    value={serverSettings?.flareSolverrUrl}
                    handleChange={(url) => updateSetting('flareSolverrUrl', url)}
                />
                <NumberSetting
                    settingTitle={t('settings.server.cloudflare.flaresolverr.timeout.label.title')}
                    settingValue={
                        serverSettings?.flareSolverrTimeout !== undefined
                            ? t('global.time.seconds.value', { count: serverSettings.flareSolverrTimeout })
                            : undefined
                    }
                    dialogDescription={t('settings.server.cloudflare.flaresolverr.timeout.label.description')}
                    value={serverSettings?.flareSolverrTimeout ?? 60}
                    defaultValue={60}
                    minValue={20}
                    maxValue={60 * 5}
                    stepSize={1}
                    showSlider
                    valueUnit={t('global.time.seconds.second_other')}
                    handleUpdate={(timeout) => updateSetting('flareSolverrTimeout', timeout)}
                />
                <TextSetting
                    settingName={t('settings.server.cloudflare.flaresolverr.session.name.label.title')}
                    value={serverSettings?.flareSolverrSessionName}
                    handleChange={(sessionName) => updateSetting('flareSolverrSessionName', sessionName)}
                />
                <NumberSetting
                    settingTitle={t('settings.server.cloudflare.flaresolverr.session.ttl.label.title')}
                    settingValue={
                        serverSettings?.flareSolverrTimeout !== undefined
                            ? t('global.time.minutes.value', { count: serverSettings.flareSolverrSessionTtl })
                            : undefined
                    }
                    dialogDescription={t('settings.server.cloudflare.flaresolverr.session.ttl.label.description')}
                    value={serverSettings?.flareSolverrSessionTtl ?? 15}
                    defaultValue={15}
                    minValue={1}
                    maxValue={60}
                    stepSize={1}
                    showSlider
                    valueUnit={t('global.time.minutes.minute_other')}
                    handleUpdate={(sessionTTL) => updateSetting('flareSolverrSessionTtl', sessionTTL)}
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
