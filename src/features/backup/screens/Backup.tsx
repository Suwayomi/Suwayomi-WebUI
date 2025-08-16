/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useEffect, useRef, useState } from 'react';
import List from '@mui/material/List';
import ListItemText from '@mui/material/ListItemText';
import { fromEvent } from 'file-selector';
import { useTranslation } from 'react-i18next';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListSubheader from '@mui/material/ListSubheader';
import { t as translate } from 'i18next';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import ListItem from '@mui/material/ListItem';
import { Link } from 'react-router-dom';
import Stack from '@mui/material/Stack';
import { useEventListener, useMergedRef, useWindowEvent } from '@mantine/hooks';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { makeToast } from '@/base/utils/Toast.ts';
import { BackupRestoreState, ValidateBackupQuery } from '@/lib/graphql/generated/graphql.ts';
import { Progress } from '@/base/components/feedback/Progress.tsx';
import { TextSetting } from '@/base/components/settings/text/TextSetting.tsx';
import { NumberSetting } from '@/base/components/settings/NumberSetting.tsx';
import { TimeSetting } from '@/base/components/settings/TimeSetting.tsx';
import { LoadingPlaceholder } from '@/base/components/feedback/LoadingPlaceholder.tsx';
import { EmptyViewAbsoluteCentered } from '@/base/components/feedback/EmptyViewAbsoluteCentered.tsx';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import { ServerSettings } from '@/features/settings/Settings.types.ts';
import { AppRoutes } from '@/base/AppRoute.constants.ts';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';
import { useAppTitle } from '@/features/navigation-bar/hooks/useAppTitle.ts';
import { BrowseTab } from '@/features/browse/Browse.types.ts';

type BackupSettingsType = Pick<ServerSettings, 'backupPath' | 'backupTime' | 'backupInterval' | 'backupTTL'>;

const extractBackupSettings = (settings: ServerSettings): BackupSettingsType => ({
    backupPath: settings.backupPath,
    backupTime: settings.backupTime,
    backupInterval: settings.backupInterval,
    backupTTL: settings.backupTTL,
});

const getBackupCleanupDisplayValue = (ttl: number): string => {
    if (ttl === 0) {
        return translate('global.label.never');
    }

    return translate('settings.backup.automated.cleanup.label.value', { days: ttl, count: ttl });
};

let backupRestoreId: string | undefined;

export function Backup() {
    const { t } = useTranslation();

    useAppTitle(t('settings.backup.title'));

    const {
        data: settingsData,
        loading,
        error,
        refetch,
    } = requestManager.useGetServerSettings({ notifyOnNetworkStatusChange: true });
    const [mutateSettings] = requestManager.useUpdateServerSettings();

    const { data } = requestManager.useGetBackupRestoreStatus(backupRestoreId ?? '', {
        skip: !backupRestoreId,
        pollInterval: 1000,
    });

    const [currentBackupFile, setCurrentBackupFile] = useState<File | null>(null);
    const [isInvalidBackupDialogOpen, setIsInvalidBackupDialogOpen] = useState(false);
    const [validationResult, setValidationResult] = useState<ValidateBackupQuery['validateBackup']>();

    const [, setTriggerReRender] = useState(0);

    const inputRef = useRef<HTMLInputElement>(null);

    const restoreProgress = (() => {
        if (!data?.restoreStatus) {
            return 0;
        }

        const progress = 100 * (data.restoreStatus.mangaProgress / data.restoreStatus.totalManga);
        return Number.isNaN(progress) ? 0 : progress;
    })();

    const updateSetting = <Setting extends keyof BackupSettingsType>(
        setting: Setting,
        value: BackupSettingsType[Setting],
    ) => {
        mutateSettings({ variables: { input: { settings: { [setting]: value } } } }).catch((e) =>
            makeToast(t('global.error.label.failed_to_save_changes'), 'error', getErrorMessage(e)),
        );
    };

    useEffect(() => {
        if (!data?.restoreStatus) {
            return;
        }

        const isSuccess = data.restoreStatus.state === BackupRestoreState.Success;
        const isFailure = data.restoreStatus.state === BackupRestoreState.Failure;

        const isRestoreFinished = isSuccess || isFailure;
        if (isRestoreFinished) {
            if (isSuccess) {
                makeToast(t('settings.backup.action.restore.label.success'), 'success');
            }

            if (isFailure) {
                makeToast(t('settings.backup.action.restore.error.label.failure'), 'error');
            }

            requestManager.reset();
            backupRestoreId = undefined;
            setTriggerReRender(Date.now());
        }
    }, [data?.restoreStatus?.state]);

    const resetBackupState = () => {
        setCurrentBackupFile(null);

        const input = document.getElementById('backup-file') as HTMLInputElement;
        if (input) {
            input.value = '';
        }
    };

    const validateBackup = async (file: File) => {
        try {
            const {
                data: { validateBackup: validateBackupData },
            } = await requestManager.validateBackupFile(file, { fetchPolicy: 'network-only' }).response;

            if (validateBackupData.missingSources.length || validateBackupData.missingTrackers.length) {
                setValidationResult(validateBackupData);
                setIsInvalidBackupDialogOpen(true);
                return false;
            }

            return true;
        } catch (e) {
            makeToast(t('settings.backup.action.validate.error.label.failure'), 'error', getErrorMessage(e));
            resetBackupState();
        }

        return false;
    };

    const restoreBackup = async (file: File) => {
        try {
            makeToast(t('settings.backup.action.restore.label.in_progress'), 'info');

            const response = await requestManager.restoreBackupFile(file).response;
            backupRestoreId = response.data?.restoreBackup.id;
            setTriggerReRender(Date.now());
        } catch (e) {
            makeToast(t('settings.backup.action.restore.error.label.failure'), 'error', getErrorMessage(e));
        } finally {
            resetBackupState();
        }
    };

    const submitBackup = async (file: File) => {
        if (file.name.toLowerCase().endsWith('json')) {
            makeToast(t('settings.backup.action.restore.error.label.legacy_backup_unsupported'), 'error');
            return;
        }

        const isValidFilename = file.name.toLowerCase().match(/proto\.gz$|tachibk$/g);
        if (!isValidFilename) {
            makeToast(t('global.error.label.invalid_file_type'), 'error');
            return;
        }

        setCurrentBackupFile(file);
        const isBackupValid = await validateBackup(file);
        if (isBackupValid) {
            await restoreBackup(file);
        }
    };

    const closeInvalidBackupDialog = () => {
        setIsInvalidBackupDialogOpen(false);
        resetBackupState();
    };

    useWindowEvent('drop', async (e) => {
        e.preventDefault();
        const files = await fromEvent(e);

        submitBackup(files[0] as File);
    });
    useWindowEvent('dragover', (e) => {
        e.preventDefault();
    });
    const inputEventListenerRef = useEventListener('change', async (event) => {
        const files = await fromEvent(event);
        submitBackup(files[0] as File);
    });
    const mergedInputRef = useMergedRef(inputRef, inputEventListenerRef);

    if (loading) {
        return <LoadingPlaceholder />;
    }

    if (error) {
        return (
            <EmptyViewAbsoluteCentered
                message={t('global.error.label.failed_to_load_data')}
                messageExtra={getErrorMessage(error)}
                retry={() => refetch().catch(defaultPromiseErrorHandler('Backup::refetch'))}
            />
        );
    }

    const backupSettings = extractBackupSettings(settingsData!.settings);

    return (
        <>
            <List sx={{ padding: 0 }}>
                <ListItemButton component="a" href={requestManager.getExportBackupUrl()} download>
                    <ListItemText
                        primary={t('settings.backup.action.create.label.title')}
                        secondary={t('settings.backup.action.create.label.description')}
                    />
                </ListItemButton>
                <ListItemButton onClick={() => inputRef.current?.click()} disabled={!!backupRestoreId}>
                    <ListItemText
                        primary={t('settings.backup.action.restore.label.title')}
                        secondary={t('settings.backup.action.restore.label.description')}
                    />
                    {backupRestoreId ? (
                        <ListItemIcon>
                            <Progress progress={restoreProgress} />
                        </ListItemIcon>
                    ) : null}
                </ListItemButton>
                <List
                    subheader={
                        <ListSubheader component="div" id="backup-settings">
                            Automated backup
                        </ListSubheader>
                    }
                >
                    <TextSetting
                        settingName={t('settings.backup.automated.location.label.title')}
                        dialogDescription={t('settings.backup.automated.location.label.description')}
                        value={backupSettings.backupPath}
                        settingDescription={
                            backupSettings.backupPath.length ? backupSettings.backupPath : t('global.label.default')
                        }
                        handleChange={(path) => updateSetting('backupPath', path)}
                    />
                    <TimeSetting
                        settingName={t('settings.backup.automated.label.time')}
                        value={backupSettings.backupTime}
                        defaultValue="00:00"
                        handleChange={(time: string) => updateSetting('backupTime', time)}
                    />
                    <NumberSetting
                        settingTitle={t('settings.backup.automated.label.interval')}
                        settingValue={t('global.date.value.label.day', {
                            days: backupSettings.backupInterval,
                            count: backupSettings.backupInterval,
                        })}
                        value={backupSettings.backupInterval}
                        defaultValue={1}
                        minValue={1}
                        maxValue={31}
                        stepSize={1}
                        valueUnit={t('global.date.label.day_one')}
                        showSlider
                        handleUpdate={(interval: number) => updateSetting('backupInterval', interval)}
                    />
                    <NumberSetting
                        settingTitle={t('settings.backup.automated.cleanup.label.title')}
                        settingValue={getBackupCleanupDisplayValue(backupSettings.backupTTL)}
                        value={backupSettings.backupTTL}
                        defaultValue={14}
                        minValue={0}
                        maxValue={1000}
                        stepSize={1}
                        valueUnit={t('global.date.label.day_one')}
                        showSlider
                        handleUpdate={(ttl: number) => updateSetting('backupTTL', ttl)}
                    />
                </List>
            </List>
            <input ref={mergedInputRef} type="file" style={{ display: 'none' }} />
            <Dialog open={isInvalidBackupDialogOpen}>
                <DialogTitle>{t('settings.backup.action.validate.dialog.title')}</DialogTitle>
                <DialogContent dividers>
                    {!!validationResult?.missingSources.length && (
                        <List
                            sx={{ listStyleType: 'initial', listStylePosition: 'inside' }}
                            subheader={t('settings.backup.action.validate.dialog.content.label.missing_sources')}
                        >
                            {validationResult?.missingSources.map(({ id, name }) => (
                                <ListItem sx={{ display: 'list-item' }} key={id}>
                                    {`${name} (${id})`}
                                </ListItem>
                            ))}
                        </List>
                    )}
                    {!!validationResult?.missingTrackers.length && (
                        <List
                            sx={{ listStyleType: 'initial', listStylePosition: 'inside' }}
                            subheader={t('settings.backup.action.validate.dialog.content.label.missing_trackers')}
                        >
                            {validationResult?.missingTrackers.map(({ name }) => (
                                <ListItem sx={{ display: 'list-item' }} key={name}>
                                    {`${name}`}
                                </ListItem>
                            ))}
                        </List>
                    )}
                </DialogContent>
                <DialogActions>
                    <Stack
                        direction="row"
                        sx={{
                            justifyContent: 'space-between',
                            width: '100%',
                        }}
                    >
                        {!!validationResult?.missingSources.length && (
                            <Button
                                onClick={closeInvalidBackupDialog}
                                component={Link}
                                to={AppRoutes.browse.path(BrowseTab.EXTENSIONS)}
                                autoFocus={!!validationResult?.missingSources.length}
                                variant={validationResult?.missingSources.length ? 'contained' : 'text'}
                            >
                                {t('extension.action.label.install')}
                            </Button>
                        )}
                        {!!validationResult?.missingTrackers.length && (
                            <Button
                                onClick={closeInvalidBackupDialog}
                                component={Link}
                                to={AppRoutes.tracker.path}
                                autoFocus={!!validationResult?.missingTrackers.length}
                                variant={validationResult?.missingTrackers.length ? 'contained' : 'text'}
                            >
                                {t('global.button.log_in')}
                            </Button>
                        )}
                        <Stack direction="row">
                            <Button onClick={closeInvalidBackupDialog}>{t('global.button.cancel')}</Button>
                            <Button
                                onClick={() => {
                                    closeInvalidBackupDialog();
                                    restoreBackup(currentBackupFile!);
                                }}
                                autoFocus={
                                    !validationResult?.missingSources.length &&
                                    !validationResult?.missingTrackers.length
                                }
                                variant={
                                    !validationResult?.missingSources.length &&
                                    !validationResult?.missingTrackers.length
                                        ? 'contained'
                                        : 'text'
                                }
                            >
                                {t('global.button.restore')}
                            </Button>
                        </Stack>
                    </Stack>
                </DialogActions>
            </Dialog>
        </>
    );
}
