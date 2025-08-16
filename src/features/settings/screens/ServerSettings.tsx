/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { Trans, useTranslation } from 'react-i18next';
import { useMemo } from 'react';
import Link from '@mui/material/Link';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Switch from '@mui/material/Switch';
import ListSubheader from '@mui/material/ListSubheader';
import { t as translate } from 'i18next';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { useLocalStorage } from '@/base/hooks/useStorage.tsx';
import { TextSetting } from '@/base/components/settings/text/TextSetting.tsx';
import { NumberSetting } from '@/base/components/settings/NumberSetting.tsx';
import { SelectSetting } from '@/base/components/settings/SelectSetting.tsx';
import { LoadingPlaceholder } from '@/base/components/feedback/LoadingPlaceholder.tsx';
import { EmptyViewAbsoluteCentered } from '@/base/components/feedback/EmptyViewAbsoluteCentered.tsx';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import {
    createUpdateMetadataServerSettings,
    useMetadataServerSettings,
} from '@/features/settings/services/ServerSettingsMetadata.ts';
import { makeToast } from '@/base/utils/Toast.ts';
import { MetadataUpdateSettings } from '@/features/app-updates/AppUpdateChecker.types.ts';
import { ServerSettings as GqlServerSettings, ServerSettingsType } from '@/features/settings/Settings.types.ts';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';
import { useAppTitle } from '@/features/navigation-bar/hooks/useAppTitle.ts';
import { AuthMode, SortOrder } from '@/lib/graphql/generated/graphql';
import { AUTH_MODES_SELECT_VALUES } from '@/features/settings/Settings.constants.ts';

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
    systemTrayEnabled: settings.systemTrayEnabled,
    maxLogFiles: settings.maxLogFiles,
    maxLogFileSize: settings.maxLogFileSize,
    maxLogFolderSize: settings.maxLogFolderSize,
    authMode: settings.authMode,
    authUsername: settings.authUsername,
    authPassword: settings.authPassword,
    flareSolverrEnabled: settings.flareSolverrEnabled,
    flareSolverrTimeout: settings.flareSolverrTimeout,
    flareSolverrUrl: settings.flareSolverrUrl,
    flareSolverrSessionName: settings.flareSolverrSessionName,
    flareSolverrSessionTtl: settings.flareSolverrSessionTtl,
    flareSolverrAsResponseFallback: settings.flareSolverrAsResponseFallback,
    opdsUseBinaryFileSizes: settings.opdsUseBinaryFileSizes,
    opdsItemsPerPage: settings.opdsItemsPerPage,
    opdsEnablePageReadProgress: settings.opdsEnablePageReadProgress,
    opdsMarkAsReadOnDownload: settings.opdsMarkAsReadOnDownload,
    opdsShowOnlyUnreadChapters: settings.opdsShowOnlyUnreadChapters,
    opdsShowOnlyDownloadedChapters: settings.opdsShowOnlyDownloadedChapters,
    opdsChapterSortOrder: settings.opdsChapterSortOrder,
});

const getLogFilesCleanupDisplayValue = (ttl: number): string => {
    if (ttl === 0) {
        return translate('global.label.never');
    }

    return translate('settings.server.misc.log_files.file_cleanup.value', { days: ttl, count: ttl });
};

export const ServerSettings = () => {
    const { t } = useTranslation();

    useAppTitle(t('settings.server.title.server'));

    const {
        settings: { serverInformAvailableUpdate },
        loading: areMetadataServerSettingsLoading,
        request: { error: metadataServerSettingsError, refetch: refetchServerMetadataSettings },
    } = useMetadataServerSettings();
    const updateMetadataServerSettings = createUpdateMetadataServerSettings<
        keyof Pick<MetadataUpdateSettings, 'serverInformAvailableUpdate'>
    >((e) => makeToast(t('global.error.label.failed_to_save_changes'), 'error', getErrorMessage(e)));

    const {
        data,
        loading: areServerSettingsLoading,
        error: serverSettingsError,
        refetch: refetchServerSettings,
    } = requestManager.useGetServerSettings({
        notifyOnNetworkStatusChange: true,
    });
    const [mutateSettings] = requestManager.useUpdateServerSettings();

    const [serverAddress, setServerAddress] = useLocalStorage<string>(
        'serverBaseURL',
        import.meta.env.VITE_SERVER_URL_DEFAULT,
    );

    const handleServerAddressChange = (address: string) => {
        const serverBaseUrl = address.replaceAll(/(\/)+$/g, '');
        setServerAddress(serverBaseUrl);
        requestManager.reset();
    };

    const updateSetting = <Setting extends keyof ServerSettingsType>(
        setting: Setting,
        value: ServerSettingsType[Setting],
    ) => {
        mutateSettings({ variables: { input: { settings: { [setting]: value } } } }).catch((e) =>
            makeToast(t('global.error.label.failed_to_save_changes'), 'error', getErrorMessage(e)),
        );
    };

    const localSettings = useMemo(
        () => (
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
                <ListItem>
                    <ListItemText
                        primary={t('global.update.settings.inform.label.title')}
                        secondary={t('global.update.settings.inform.label.description')}
                    />
                    <Switch
                        edge="end"
                        checked={serverInformAvailableUpdate}
                        onChange={(e) => updateMetadataServerSettings('serverInformAvailableUpdate', e.target.checked)}
                    />
                </ListItem>
            </List>
        ),
        [serverAddress, serverInformAvailableUpdate],
    );

    const loading = areMetadataServerSettingsLoading || areServerSettingsLoading;
    if (loading) {
        return (
            <>
                {localSettings}
                <LoadingPlaceholder />
            </>
        );
    }

    const error = metadataServerSettingsError ?? serverSettingsError;
    if (error) {
        return (
            <>
                {localSettings}
                <EmptyViewAbsoluteCentered
                    message={t('global.error.label.failed_to_load_data')}
                    messageExtra={getErrorMessage(error)}
                    retry={() => {
                        if (metadataServerSettingsError) {
                            refetchServerMetadataSettings().catch(
                                defaultPromiseErrorHandler('ServerSettings::refetchServerMetadataSettings'),
                            );
                        }

                        if (serverSettingsError) {
                            refetchServerSettings().catch(
                                defaultPromiseErrorHandler('ServerSettings::refetchServerSettings'),
                            );
                        }
                    }}
                />
            </>
        );
    }

    const serverSettings = extractServerSettings(data!.settings);
    const authModeDisabled = !serverSettings.authUsername.trim() || !serverSettings.authPassword.trim();

    return (
        <List sx={{ pt: 0 }}>
            {localSettings}
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
                    value={serverSettings.ip}
                    placeholder="0.0.0.0"
                />
                <NumberSetting
                    settingTitle={t('settings.server.address.server.label.port')}
                    settingValue={serverSettings.port.toString()}
                    handleUpdate={(port) => updateSetting('port', port)}
                    value={serverSettings.port}
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
                        checked={serverSettings.socksProxyEnabled}
                        onChange={(e) => updateSetting('socksProxyEnabled', e.target.checked)}
                    />
                </ListItem>
                <SelectSetting<number>
                    settingName={t('settings.server.socks_proxy.label.version')}
                    value={serverSettings.socksProxyVersion}
                    values={[
                        [4, { text: '4' }],
                        [5, { text: '5' }],
                    ]}
                    handleChange={(socksProxyVersion) => updateSetting('socksProxyVersion', socksProxyVersion)}
                />
                <TextSetting
                    settingName={t('settings.server.socks_proxy.label.host')}
                    value={serverSettings.socksProxyHost}
                    handleChange={(proxyHost) => updateSetting('socksProxyHost', proxyHost)}
                />
                <TextSetting
                    settingName={t('settings.server.socks_proxy.label.port')}
                    value={serverSettings.socksProxyPort}
                    handleChange={(proxyPort) => updateSetting('socksProxyPort', proxyPort)}
                />
                <TextSetting
                    settingName={t('settings.server.socks_proxy.label.username')}
                    value={serverSettings.socksProxyUsername}
                    handleChange={(proxyUsername) => updateSetting('socksProxyUsername', proxyUsername)}
                />
                <TextSetting
                    settingName={t('settings.server.socks_proxy.label.password')}
                    value={serverSettings.socksProxyPassword}
                    handleChange={(proxyPassword) => updateSetting('socksProxyPassword', proxyPassword)}
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
                <SelectSetting<AuthMode>
                    settingName={t('settings.server.auth.label.title')}
                    value={serverSettings.authMode}
                    values={AUTH_MODES_SELECT_VALUES}
                    handleChange={(mode) => updateSetting('authMode', mode)}
                    disabled={authModeDisabled}
                />
                <TextSetting
                    settingName={t('settings.server.auth.label.username')}
                    value={serverSettings.authUsername}
                    validate={(value) => serverSettings.authMode === AuthMode.None || !!value.trim()}
                    handleChange={(authUsername) => updateSetting('authUsername', authUsername)}
                />
                <TextSetting
                    settingName={t('settings.server.auth.label.password')}
                    value={serverSettings.authPassword}
                    isPassword
                    validate={(value) => serverSettings.authMode === AuthMode.None || !!value.trim()}
                    handleChange={(authPassword) => updateSetting('authPassword', authPassword)}
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
                        checked={serverSettings.flareSolverrEnabled}
                        onChange={(e) => updateSetting('flareSolverrEnabled', e.target.checked)}
                    />
                </ListItem>
                <TextSetting
                    settingName={t('settings.server.cloudflare.flaresolverr.url.label.title')}
                    dialogDescription={t('settings.server.cloudflare.flaresolverr.url.label.description')}
                    value={serverSettings.flareSolverrUrl}
                    handleChange={(url) => updateSetting('flareSolverrUrl', url)}
                />
                <NumberSetting
                    settingTitle={t('settings.server.cloudflare.flaresolverr.timeout.label.title')}
                    settingValue={t('global.time.seconds.value', { count: serverSettings.flareSolverrTimeout })}
                    dialogDescription={t('settings.server.cloudflare.flaresolverr.timeout.label.description')}
                    value={serverSettings.flareSolverrTimeout}
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
                    value={serverSettings.flareSolverrSessionName}
                    handleChange={(sessionName) => updateSetting('flareSolverrSessionName', sessionName)}
                />
                <NumberSetting
                    settingTitle={t('settings.server.cloudflare.flaresolverr.session.ttl.label.title')}
                    settingValue={t('global.time.minutes.value', { count: serverSettings.flareSolverrSessionTtl })}
                    dialogDescription={t('settings.server.cloudflare.flaresolverr.session.ttl.label.description')}
                    value={serverSettings.flareSolverrSessionTtl}
                    defaultValue={15}
                    minValue={1}
                    maxValue={60}
                    stepSize={1}
                    showSlider
                    valueUnit={t('global.time.minutes.minute_other')}
                    handleUpdate={(sessionTTL) => updateSetting('flareSolverrSessionTtl', sessionTTL)}
                />
                <ListItem>
                    <ListItemText
                        primary={t('settings.server.cloudflare.flaresolverr.response_fallback.label.title')}
                        secondary={t('settings.server.cloudflare.flaresolverr.response_fallback.label.description')}
                    />
                    <Switch
                        edge="end"
                        checked={serverSettings.flareSolverrAsResponseFallback}
                        onChange={(e) => updateSetting('flareSolverrAsResponseFallback', e.target.checked)}
                    />
                </ListItem>
            </List>
            <List
                subheader={
                    <ListSubheader component="div" id="server-settings-opds">
                        {t('settings.server.opds.title')}
                    </ListSubheader>
                }
            >
                <ListItem>
                    <ListItemText
                        primary={t('settings.server.opds.binary_file_sizes.label.title')}
                        secondary={t('settings.server.opds.binary_file_sizes.label.description')}
                    />
                    <Switch
                        edge="end"
                        checked={serverSettings.opdsUseBinaryFileSizes}
                        onChange={(e) => updateSetting('opdsUseBinaryFileSizes', e.target.checked)}
                    />
                </ListItem>
                <NumberSetting
                    settingTitle={t('settings.server.opds.items_per_page.label.title')}
                    settingValue={serverSettings.opdsItemsPerPage.toString()}
                    dialogDescription={t('settings.server.opds.items_per_page.label.description')}
                    value={serverSettings.opdsItemsPerPage}
                    defaultValue={50}
                    minValue={10}
                    maxValue={5000}
                    stepSize={10}
                    showSlider
                    valueUnit={t('settings.server.opds.items_per_page.label.unit_other')}
                    handleUpdate={(value) => updateSetting('opdsItemsPerPage', value)}
                />
                <ListItem>
                    <ListItemText
                        primary={t('settings.server.opds.enable_page_read_progress.label.title')}
                        secondary={t('settings.server.opds.enable_page_read_progress.label.description')}
                    />
                    <Switch
                        edge="end"
                        checked={serverSettings.opdsEnablePageReadProgress}
                        onChange={(e) => updateSetting('opdsEnablePageReadProgress', e.target.checked)}
                    />
                </ListItem>
                <ListItem>
                    <ListItemText
                        primary={t('settings.server.opds.mark_as_read_on_download.label.title')}
                        secondary={t('settings.server.opds.mark_as_read_on_download.label.description')}
                    />
                    <Switch
                        edge="end"
                        checked={serverSettings.opdsMarkAsReadOnDownload}
                        onChange={(e) => updateSetting('opdsMarkAsReadOnDownload', e.target.checked)}
                    />
                </ListItem>
                <ListItem>
                    <ListItemText
                        primary={t('settings.server.opds.show_only_unread_chapters.label.title')}
                        secondary={t('settings.server.opds.show_only_unread_chapters.label.description')}
                    />
                    <Switch
                        edge="end"
                        checked={serverSettings.opdsShowOnlyUnreadChapters}
                        onChange={(e) => updateSetting('opdsShowOnlyUnreadChapters', e.target.checked)}
                    />
                </ListItem>
                <ListItem>
                    <ListItemText
                        primary={t('settings.server.opds.show_only_downloaded_chapters.label.title')}
                        secondary={t('settings.server.opds.show_only_downloaded_chapters.label.description')}
                    />
                    <Switch
                        edge="end"
                        checked={serverSettings.opdsShowOnlyDownloadedChapters}
                        onChange={(e) => updateSetting('opdsShowOnlyDownloadedChapters', e.target.checked)}
                    />
                </ListItem>
                <SelectSetting<SortOrder>
                    settingName={t('settings.server.opds.chapter_sort_order.label.title')}
                    dialogDescription={t('settings.server.opds.chapter_sort_order.label.description')}
                    value={serverSettings.opdsChapterSortOrder}
                    values={[
                        [SortOrder.Asc, { text: t('global.sort.label.asc') }],
                        [SortOrder.Desc, { text: t('global.sort.label.desc') }],
                    ]}
                    handleChange={(value) => updateSetting('opdsChapterSortOrder', value)}
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
                        checked={serverSettings.debugLogsEnabled}
                        onChange={(e) => updateSetting('debugLogsEnabled', e.target.checked)}
                    />
                </ListItem>
                <ListItem>
                    <ListItemText
                        primary={t('settings.server.misc.tray_icon.label.title')}
                        secondary={t('settings.server.misc.tray_icon.label.description')}
                    />
                    <Switch
                        edge="end"
                        checked={serverSettings.systemTrayEnabled}
                        onChange={(e) => updateSetting('systemTrayEnabled', e.target.checked)}
                    />
                </ListItem>
                <NumberSetting
                    settingTitle={t('settings.server.misc.log_files.file_cleanup.title')}
                    settingValue={getLogFilesCleanupDisplayValue(serverSettings.maxLogFiles)}
                    value={serverSettings.maxLogFiles}
                    valueUnit={t('global.date.label.day_one')}
                    handleUpdate={(maxFiles) => updateSetting('maxLogFiles', maxFiles)}
                />
                <TextSetting
                    settingName={t('settings.server.misc.log_files.file_size.title')}
                    value={serverSettings.maxLogFileSize}
                    dialogDescription={t('settings.server.misc.log_files.file_size.description')}
                    validate={(value) => !!value.match(/^[0-9]+(|kb|KB|mb|MB|gb|GB)$/g)}
                    handleChange={(maxLogFileSize) => updateSetting('maxLogFileSize', maxLogFileSize)}
                />
                <TextSetting
                    settingName={t('settings.server.misc.log_files.total_size.title')}
                    value={serverSettings.maxLogFolderSize}
                    dialogDescription={t('settings.server.misc.log_files.total_size.description')}
                    validate={(value) => !!value.match(/^[0-9]+(|kb|KB|mb|MB|gb|GB)$/g)}
                    handleChange={(maxLogFolderSize) => updateSetting('maxLogFolderSize', maxLogFolderSize)}
                />
            </List>
        </List>
    );
};
