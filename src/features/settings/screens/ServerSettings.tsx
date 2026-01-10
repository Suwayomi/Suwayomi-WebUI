/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useMemo } from 'react';
import Link from '@mui/material/Link';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Switch from '@mui/material/Switch';
import ListSubheader from '@mui/material/ListSubheader';
import { d } from 'koration';
import { Trans, useLingui } from '@lingui/react/macro';
import { plural, t as translate } from '@lingui/core/macro';
import { requestManager } from '@/lib/requests/RequestManager.ts';
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
import { getErrorMessage } from '@/lib/HelperFunctions.ts';
import { useAppTitle } from '@/features/navigation-bar/hooks/useAppTitle.ts';
import { AuthMode, CbzMediaType, DatabaseType, SortOrder } from '@/lib/graphql/generated/graphql';
import {
    AUTH_MODES_SELECT_VALUES,
    JWT_ACCESS_TOKEN_EXPIRY,
    JWT_REFRESH_TOKEN_EXPIRY,
} from '@/features/settings/Settings.constants.ts';
import { ServerAddressSetting } from '@/features/settings/components/ServerAddressSetting.tsx';
import { AuthManager } from '@/features/authentication/AuthManager.ts';
import { ServerSettings as ServerSettingsType } from '@/features/settings/Settings.types.ts';
import { KoreaderSyncSettings } from '@/features/settings/components/koreaderSync/KoreaderSyncSettings.tsx';

const getLogFilesCleanupDisplayValue = (ttl: number): string => {
    if (ttl === 0) {
        return translate`Never`;
    }

    return plural(ttl, {
        one: 'Delete log files that are older than # day',
        other: 'Delete log files that are older than # days',
    });
};

export const ServerSettings = () => {
    const { t } = useLingui();

    useAppTitle(t`Server`);

    const {
        settings: { serverInformAvailableUpdate },
        loading: areMetadataServerSettingsLoading,
        request: { error: metadataServerSettingsError, refetch: refetchServerMetadataSettings },
    } = useMetadataServerSettings();
    const updateMetadataServerSettings = createUpdateMetadataServerSettings<
        keyof Pick<MetadataUpdateSettings, 'serverInformAvailableUpdate'>
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

    const koSyncStatus = requestManager.useKoSyncStatus();

    const updateSetting = async <Setting extends keyof ServerSettingsType>(
        setting: Setting,
        value: ServerSettingsType[Setting],
        onCompletion?: (success: boolean) => void,
    ) => {
        try {
            await mutateSettings({ variables: { input: { settings: { [setting]: value } } } });
            onCompletion?.(true);
        } catch (e) {
            makeToast(t`Failed to save changes`, 'error', getErrorMessage(e));
            onCompletion?.(false);
        }
    };

    const localSettings = useMemo(
        () => (
            <List
                subheader={
                    <ListSubheader component="div" id="server-settings-client">
                        {t`Client`}
                    </ListSubheader>
                }
            >
                <ServerAddressSetting />
                <ListItem>
                    <ListItemText
                        primary={t`Inform about available update`}
                        secondary={t`Shows a dialog in case a new version is available`}
                    />
                    <Switch
                        edge="end"
                        checked={serverInformAvailableUpdate}
                        onChange={(e) => updateMetadataServerSettings('serverInformAvailableUpdate', e.target.checked)}
                    />
                </ListItem>
            </List>
        ),
        [serverInformAvailableUpdate],
    );

    const loading = areMetadataServerSettingsLoading || areServerSettingsLoading || koSyncStatus.loading;
    if (loading) {
        return (
            <>
                {localSettings}
                <LoadingPlaceholder />
            </>
        );
    }

    const error = metadataServerSettingsError ?? serverSettingsError ?? koSyncStatus.error;
    if (error) {
        return (
            <>
                {localSettings}
                <EmptyViewAbsoluteCentered
                    message={t`Unable to load data`}
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

                        if (koSyncStatus.error) {
                            koSyncStatus
                                .refetch()
                                .catch(defaultPromiseErrorHandler('ServerSettings::koSyncStatus.refetch'));
                        }
                    }}
                />
            </>
        );
    }

    const serverSettings = data!.settings;
    const koreaderSyncStatus = koSyncStatus.data!.koSyncStatus;
    const authModeDisabled = !serverSettings.authUsername?.trim() || !serverSettings.authPassword?.trim();
    const isH2Database = serverSettings.databaseType === DatabaseType.H2;

    return (
        <List sx={{ pt: 0 }}>
            {localSettings}
            <List
                subheader={
                    <ListSubheader component="div" id="server-settings-server-address">
                        {t`Server bindings`}
                    </ListSubheader>
                }
            >
                <TextSetting
                    settingName={t`IP`}
                    handleChange={(ip) => updateSetting('ip', ip)}
                    value={serverSettings.ip}
                    placeholder="0.0.0.0"
                />
                <NumberSetting
                    settingTitle={t`Port`}
                    settingValue={serverSettings.port.toString()}
                    handleUpdate={(port) => updateSetting('port', port)}
                    value={serverSettings.port}
                    defaultValue={4567}
                    valueUnit={t`Port`}
                />
            </List>
            <List
                subheader={
                    <ListSubheader component="div" id="server-settings-socks-proxy">
                        {t`SOCKS proxy`}
                    </ListSubheader>
                }
            >
                <ListItem>
                    <ListItemText primary={t`Use SOCKS proxy`} />
                    <Switch
                        edge="end"
                        checked={serverSettings.socksProxyEnabled}
                        onChange={(e) => updateSetting('socksProxyEnabled', e.target.checked)}
                    />
                </ListItem>
                <SelectSetting<number>
                    settingName={t`SOCKS version`}
                    value={serverSettings.socksProxyVersion}
                    values={[
                        [4, { text: '4' }],
                        [5, { text: '5' }],
                    ]}
                    handleChange={(socksProxyVersion) => updateSetting('socksProxyVersion', socksProxyVersion)}
                />
                <TextSetting
                    settingName={t`SOCKS host`}
                    value={serverSettings.socksProxyHost}
                    handleChange={(proxyHost) => updateSetting('socksProxyHost', proxyHost)}
                />
                <TextSetting
                    settingName={t`SOCKS port`}
                    value={serverSettings.socksProxyPort}
                    handleChange={(proxyPort) => updateSetting('socksProxyPort', proxyPort)}
                />
                <TextSetting
                    settingName={t`SOCKS username`}
                    value={serverSettings.socksProxyUsername}
                    handleChange={(proxyUsername) => updateSetting('socksProxyUsername', proxyUsername)}
                />
                <TextSetting
                    settingName={t`SOCKS password`}
                    value={serverSettings.socksProxyPassword}
                    handleChange={(proxyPassword) => updateSetting('socksProxyPassword', proxyPassword)}
                    isPassword
                />
            </List>
            <List
                subheader={
                    <ListSubheader component="div" id="server-settings-auth">
                        {t`Authentication`}
                    </ListSubheader>
                }
            >
                <SelectSetting<AuthMode>
                    settingName={t`Authentication Mode`}
                    value={serverSettings.authMode}
                    values={AUTH_MODES_SELECT_VALUES}
                    handleChange={(mode) => {
                        updateSetting('authMode', mode, (success) => {
                            if (!success) {
                                return;
                            }

                            if (mode !== AuthMode.UiLogin) {
                                AuthManager.removeTokens();
                            }

                            AuthManager.setAuthRequired(mode === AuthMode.UiLogin);
                        });
                    }}
                    disabled={authModeDisabled}
                />
                <TextSetting
                    settingName={t`Username`}
                    value={serverSettings.authUsername}
                    validate={(value) => serverSettings.authMode === AuthMode.None || !!value.trim()}
                    handleChange={(authUsername) => updateSetting('authUsername', authUsername)}
                />
                <TextSetting
                    settingName={t`Password`}
                    value={serverSettings.authPassword}
                    isPassword
                    validate={(value) => serverSettings.authMode === AuthMode.None || !!value.trim()}
                    handleChange={(authPassword) => updateSetting('authPassword', authPassword)}
                />
                {serverSettings.authMode === AuthMode.UiLogin && (
                    <>
                        <TextSetting
                            settingName={t`JWT audience claim`}
                            value={serverSettings.jwtAudience}
                            handleChange={(audience) => updateSetting('jwtAudience', audience)}
                        />
                        <NumberSetting
                            settingTitle={t`JWT access token expiry`}
                            settingValue={d(serverSettings.jwtTokenExpiry).minutes.humanize()}
                            value={d(serverSettings.jwtTokenExpiry).minutes.inWholeMinutes}
                            valueUnit={t`Minute`}
                            defaultValue={JWT_ACCESS_TOKEN_EXPIRY.default}
                            minValue={JWT_ACCESS_TOKEN_EXPIRY.min}
                            maxValue={JWT_ACCESS_TOKEN_EXPIRY.max}
                            handleUpdate={(expiry) => updateSetting('jwtTokenExpiry', d(expiry).minutes.toISOString())}
                            showSlider
                        />
                        <NumberSetting
                            settingTitle={t`JWT refresh token expiry`}
                            settingValue={d(serverSettings.jwtRefreshExpiry).days.humanize()}
                            value={d(serverSettings.jwtRefreshExpiry).days.inWholeDays}
                            valueUnit={t`Day`}
                            defaultValue={JWT_REFRESH_TOKEN_EXPIRY.default}
                            minValue={JWT_REFRESH_TOKEN_EXPIRY.min}
                            maxValue={JWT_REFRESH_TOKEN_EXPIRY.max}
                            handleUpdate={(expiry) => updateSetting('jwtRefreshExpiry', d(expiry).days.toISOString())}
                            showSlider
                        />
                    </>
                )}
            </List>
            <List
                subheader={
                    <ListSubheader component="div" id="server-settings-clouadflare-bypass">
                        {t`Cloudflare bypass`}
                    </ListSubheader>
                }
            >
                <ListItem>
                    <ListItemText
                        primary={t`FlareSolverr enabled`}
                        secondary={
                            <Trans>
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
                    settingName={t`FlareSolverr server url`}
                    dialogDescription={t`The address of the FlareSolverr server`}
                    value={serverSettings.flareSolverrUrl}
                    handleChange={(url) => updateSetting('flareSolverrUrl', url)}
                />
                <NumberSetting
                    settingTitle={t`FlareSolverr request timeout`}
                    settingValue={plural(serverSettings.flareSolverrTimeout, {
                        one: '# second',
                        other: '# seconds',
                    })}
                    dialogDescription={t`How much time FlareSolverr has to handle the request`}
                    value={serverSettings.flareSolverrTimeout}
                    defaultValue={60}
                    minValue={20}
                    maxValue={60 * 5}
                    stepSize={1}
                    showSlider
                    valueUnit={t`Second`}
                    handleUpdate={(timeout) => updateSetting('flareSolverrTimeout', timeout)}
                />
                <TextSetting
                    settingName={t`FlareSolverr session name`}
                    value={serverSettings.flareSolverrSessionName}
                    handleChange={(sessionName) => updateSetting('flareSolverrSessionName', sessionName)}
                />
                <NumberSetting
                    settingTitle={t`FlareSolverr session TTL`}
                    settingValue={plural(serverSettings.flareSolverrSessionTtl, {
                        one: '# minute',
                        other: '# minutes',
                    })}
                    dialogDescription={t`FlareSolverr will automatically rotate expired sessions based on the TTL provided in minutes`}
                    value={serverSettings.flareSolverrSessionTtl}
                    defaultValue={15}
                    minValue={1}
                    maxValue={60}
                    stepSize={1}
                    showSlider
                    valueUnit={t`Minute`}
                    handleUpdate={(sessionTTL) => updateSetting('flareSolverrSessionTtl', sessionTTL)}
                />
                <ListItem>
                    <ListItemText
                        primary={t`Response fallback`}
                        secondary={t`Use the FlareSolverr response in case the server runs into a Cloudflare challenge while FlareSolverr does not and is therefore unable to solve the challenge (does not work for images)`}
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
                        {t`OPDS`}
                    </ListSubheader>
                }
            >
                <ListItem>
                    <ListItemText
                        primary={t`Binary file size`}
                        secondary={t`Display file sizes in binary (KiB, MiB, GiB) instead of decimal (KB, MB, GB)`}
                    />
                    <Switch
                        edge="end"
                        checked={serverSettings.opdsUseBinaryFileSizes}
                        onChange={(e) => updateSetting('opdsUseBinaryFileSizes', e.target.checked)}
                    />
                </ListItem>
                <NumberSetting
                    settingTitle={t`Items per page`}
                    settingValue={serverSettings.opdsItemsPerPage.toString()}
                    dialogDescription={t`Number of items per page in OPDS feeds (e.g., Library History, Manga Chapters).\nHigher values may affect client performance.`}
                    value={serverSettings.opdsItemsPerPage}
                    defaultValue={50}
                    minValue={10}
                    maxValue={5000}
                    stepSize={10}
                    showSlider
                    valueUnit={t`item`}
                    handleUpdate={(value) => updateSetting('opdsItemsPerPage', value)}
                />
                <ListItem>
                    <ListItemText
                        primary={t`Enable page read progress`}
                        secondary={t`Track and update your reading progress by page for each chapter during page streaming`}
                    />
                    <Switch
                        edge="end"
                        checked={serverSettings.opdsEnablePageReadProgress}
                        onChange={(e) => updateSetting('opdsEnablePageReadProgress', e.target.checked)}
                    />
                </ListItem>
                <ListItem>
                    <ListItemText
                        primary={t`Mark chapters as read on download`}
                        secondary={t`Automatically mark chapters as read when you download them.`}
                    />
                    <Switch
                        edge="end"
                        checked={serverSettings.opdsMarkAsReadOnDownload}
                        onChange={(e) => updateSetting('opdsMarkAsReadOnDownload', e.target.checked)}
                    />
                </ListItem>
                <ListItem>
                    <ListItemText
                        primary={t`Show only unread chapters`}
                        secondary={t`Filter manga feed to display only chapters you haven’t read yet.`}
                    />
                    <Switch
                        edge="end"
                        checked={serverSettings.opdsShowOnlyUnreadChapters}
                        onChange={(e) => updateSetting('opdsShowOnlyUnreadChapters', e.target.checked)}
                    />
                </ListItem>
                <ListItem>
                    <ListItemText
                        primary={t`Show only downloaded chapters`}
                        secondary={t`Filter manga feed to display only chapters you have downloaded.`}
                    />
                    <Switch
                        edge="end"
                        checked={serverSettings.opdsShowOnlyDownloadedChapters}
                        onChange={(e) => updateSetting('opdsShowOnlyDownloadedChapters', e.target.checked)}
                    />
                </ListItem>
                <SelectSetting<SortOrder>
                    settingName={t`Chapter sort order`}
                    dialogDescription={t`Choose the order in which chapters are displayed.`}
                    value={serverSettings.opdsChapterSortOrder}
                    values={[
                        [
                            SortOrder.Asc,
                            {
                                text: t`Ascending`,
                            },
                        ],
                        [
                            SortOrder.Desc,
                            {
                                text: t`Descending`,
                            },
                        ],
                    ]}
                    handleChange={(value) => updateSetting('opdsChapterSortOrder', value)}
                />
                <SelectSetting<CbzMediaType>
                    settingName={t`CBZ MIME-Type`}
                    dialogDescription={t`Controls the MimeType that Suwayomi sends in OPDS entries for CBZ archives. Also affects global CBZ download.\nModern follows recent IANA standard (2017), while LEGACY (deprecated mimetype for .cbz) and COMPATIBLE (deprecated mimetype for all comic archives) might be more compatible with older clients.`}
                    value={serverSettings.opdsCbzMimetype}
                    values={[
                        [
                            CbzMediaType.Legacy,
                            {
                                text: t`Legacy`,
                            },
                        ],
                        [
                            CbzMediaType.Modern,
                            {
                                text: t`Modern`,
                            },
                        ],
                        [
                            CbzMediaType.Compatible,
                            {
                                text: t`Compatible`,
                            },
                        ],
                    ]}
                    handleChange={(value) => updateSetting('opdsCbzMimetype', value)}
                />
            </List>
            <KoreaderSyncSettings
                settings={serverSettings}
                serverAddress={koreaderSyncStatus.serverAddress}
                username={koreaderSyncStatus.username}
                isLoggedIn={koreaderSyncStatus.isLoggedIn}
                updateSetting={updateSetting}
            />
            <List
                subheader={
                    <ListSubheader component="div" id="server-settings-database">
                        {t`Database`}
                    </ListSubheader>
                }
            >
                <SelectSetting<DatabaseType>
                    settingName={t`Type`}
                    value={serverSettings.databaseType}
                    values={[
                        [
                            DatabaseType.H2,
                            {
                                text: t`H2`,
                            },
                        ],
                        [
                            DatabaseType.Postgresql,
                            {
                                text: t`PostgreSQL`,
                            },
                        ],
                    ]}
                    handleChange={(value) => updateSetting('databaseType', value)}
                />
                <TextSetting
                    settingName={t`Database url`}
                    handleChange={(url) => updateSetting('databaseUrl', url)}
                    value={serverSettings.databaseUrl}
                    placeholder="postgresql://localhost:5432/suwayomi"
                    disabled={isH2Database}
                />
                <TextSetting
                    settingName={t`Username`}
                    value={serverSettings.databaseUsername}
                    handleChange={(username) => updateSetting('databaseUsername', username)}
                    disabled={isH2Database}
                />
                <TextSetting
                    settingName={t`Password`}
                    value={serverSettings.databasePassword}
                    handleChange={(password) => updateSetting('databasePassword', password)}
                    disabled={isH2Database}
                    isPassword
                />
                <ListItem>
                    <ListItemText
                        primary={t`Hikari connection pool`}
                        secondary={t`Improves performance, but may cause issues for some installations where data cannot be read from the database`}
                    />
                    <Switch
                        edge="end"
                        checked={serverSettings.useHikariConnectionPool}
                        onChange={(e) => updateSetting('useHikariConnectionPool', e.target.checked)}
                    />
                </ListItem>
            </List>
            <List
                subheader={
                    <ListSubheader component="div" id="server-settings-misc">
                        {t`Misc`}
                    </ListSubheader>
                }
            >
                <ListItem>
                    <ListItemText primary={t`Enable debug logs`} />
                    <Switch
                        edge="end"
                        checked={serverSettings.debugLogsEnabled}
                        onChange={(e) => updateSetting('debugLogsEnabled', e.target.checked)}
                    />
                </ListItem>
                <ListItem>
                    <ListItemText
                        primary={t`Show icon in system tray`}
                        secondary={t`This icon will be shown on the system that is running the server`}
                    />
                    <Switch
                        edge="end"
                        checked={serverSettings.systemTrayEnabled}
                        onChange={(e) => updateSetting('systemTrayEnabled', e.target.checked)}
                    />
                </ListItem>
                <NumberSetting
                    settingTitle={t`Log file cleanup`}
                    settingValue={getLogFilesCleanupDisplayValue(serverSettings.maxLogFiles)}
                    value={serverSettings.maxLogFiles}
                    valueUnit={t`Day`}
                    handleUpdate={(maxFiles) => updateSetting('maxLogFiles', maxFiles)}
                />
                <TextSetting
                    settingName={t`Maximum log file size`}
                    value={serverSettings.maxLogFileSize}
                    dialogDescription={t`Example for possible values: 1 (bytes), 1KB (kilobytes), 1MB (megabytes), 1GB (gigabytes)`}
                    validate={(value) => !!value.match(/^[0-9]+(|kb|KB|mb|MB|gb|GB)$/g)}
                    handleChange={(maxLogFileSize) => updateSetting('maxLogFileSize', maxLogFileSize)}
                />
                <TextSetting
                    settingName={t`Maximum size of all log files`}
                    value={serverSettings.maxLogFolderSize}
                    dialogDescription={t`Example for possible values: 1 (bytes), 1KB (kilobytes), 1MB (megabytes), 1GB (gigabytes)`}
                    validate={(value) => !!value.match(/^[0-9]+(|kb|KB|mb|MB|gb|GB)$/g)}
                    handleChange={(maxLogFolderSize) => updateSetting('maxLogFolderSize', maxLogFolderSize)}
                />
            </List>
        </List>
    );
};
