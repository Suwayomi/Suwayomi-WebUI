/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useContext, useEffect, useState } from 'react';
import List from '@mui/material/List';
import ListItemText from '@mui/material/ListItemText';
import { fromEvent } from 'file-selector';
import { useTranslation } from 'react-i18next';
import { ListItemButton } from '@mui/material';
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
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { makeToast } from '@/components/util/Toast';
import { ListItemLink } from '@/components/util/ListItemLink';
import { NavBarContext, useSetDefaultBackTo } from '@/components/context/NavbarContext';
import { BackupRestoreState, ValidateBackupQuery } from '@/lib/graphql/generated/graphql.ts';
import { Progress } from '@/components/util/Progress.tsx';
import { TextSetting } from '@/components/settings/text/TextSetting.tsx';
import { NumberSetting } from '@/components/settings/NumberSetting.tsx';
import { TimeSetting } from '@/components/settings/TimeSetting.tsx';
import { ServerSettings } from '@/typings.ts';

type BackupSettingsType = Pick<ServerSettings, 'backupPath' | 'backupTime' | 'backupInterval' | 'backupTTL'>;

const extractBackupSettings = (settings: ServerSettings): BackupSettingsType => ({
    backupPath: settings.backupPath,
    backupTime: settings.backupTime,
    backupInterval: settings.backupInterval,
    backupTTL: settings.backupTTL,
});

const getBackupCleanupDisplayValue = (ttl?: number) => {
    if (ttl === undefined) {
        return undefined;
    }

    if (ttl === 0) {
        return translate('global.label.never');
    }

    return translate('settings.backup.automated.cleanup.label.value', { days: ttl, count: ttl });
};

let backupRestoreId: string | undefined;

export function Backup() {
    const { t } = useTranslation();
    const { setTitle, setAction } = useContext(NavBarContext);
    useEffect(() => {
        setTitle(t('settings.backup.title'));
        setAction(null);

        return () => {
            setTitle('');
            setAction(null);
        };
    }, [t]);

    useSetDefaultBackTo('settings');

    const { data: settingsData } = requestManager.useGetServerSettings();
    const [mutateSettings] = requestManager.useUpdateServerSettings();

    const backupSettings = settingsData ? extractBackupSettings(settingsData.settings) : undefined;

    const { data } = requestManager.useGetBackupRestoreStatus(backupRestoreId ?? '', {
        skip: !backupRestoreId,
        pollInterval: 1000,
    });

    const [currentBackupFile, setCurrentBackupFile] = useState<File | null>(null);
    const [isInvalidBackupDialogOpen, setIsInvalidBackupDialogOpen] = useState(false);
    const [missingSources, setMissingSources] = useState<ValidateBackupQuery['validateBackup']['missingSources']>([]);

    const [, setTriggerReRender] = useState(0);

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
        mutateSettings({ variables: { input: { settings: { [setting]: value } } } });
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

            if (validateBackupData.missingSources.length) {
                setMissingSources([...validateBackupData.missingSources]);
                setIsInvalidBackupDialogOpen(true);
                return false;
            }

            return true;
        } catch (e) {
            makeToast(t('settings.backup.action.validate.error.label.failure'), 'error');
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
            makeToast(t('settings.backup.action.restore.error.label.failure'), 'error');
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

    const dropHandler = async (e: Event) => {
        e.preventDefault();
        const files = await fromEvent(e);

        submitBackup(files[0] as File);
    };

    const dragOverHandler = (e: Event) => {
        e.preventDefault();
    };

    const closeInvalidBackupDialog = () => {
        setIsInvalidBackupDialogOpen(false);
        resetBackupState();
    };

    useEffect(() => {
        document.addEventListener('drop', dropHandler);
        document.addEventListener('dragover', dragOverHandler);

        const handleFileSelection = async (event: Event) => {
            const files = await fromEvent(event);
            submitBackup(files[0] as File);
        };

        const input = document.getElementById('backup-file');
        input?.addEventListener('change', handleFileSelection);

        return () => {
            document.removeEventListener('drop', dropHandler);
            document.removeEventListener('dragover', dragOverHandler);
            input?.removeEventListener('change', handleFileSelection);
        };
    }, []);

    return (
        <>
            <List sx={{ padding: 0 }}>
                <ListItemLink to={requestManager.getExportBackupUrl()} download target="_self">
                    <ListItemText
                        primary={t('settings.backup.action.create.label.title')}
                        secondary={t('settings.backup.action.create.label.description')}
                    />
                </ListItemLink>
                <ListItemButton
                    onClick={() => document.getElementById('backup-file')?.click()}
                    disabled={!!backupRestoreId}
                >
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
                        value={backupSettings?.backupPath}
                        handleChange={(path) => updateSetting('backupPath', path)}
                    />
                    <TimeSetting
                        settingName={t('settings.backup.automated.label.time')}
                        value={backupSettings?.backupTime}
                        defaultValue="00:00"
                        handleChange={(time: string) => updateSetting('backupTime', time)}
                    />
                    <NumberSetting
                        settingTitle={t('settings.backup.automated.label.interval')}
                        settingValue={
                            backupSettings?.backupInterval
                                ? t('global.date.value.label.day', {
                                      days: backupSettings.backupInterval,
                                      count: backupSettings.backupInterval,
                                  })
                                : undefined
                        }
                        value={backupSettings?.backupInterval ?? 1}
                        defaultValue={1}
                        minValue={1}
                        maxValue={31}
                        stepSize={1}
                        valueUnit={t('global.date.label.day')}
                        showSlider
                        handleUpdate={(interval: number) => updateSetting('backupInterval', interval)}
                    />
                    <NumberSetting
                        settingTitle={t('settings.backup.automated.cleanup.label.title')}
                        settingValue={getBackupCleanupDisplayValue(backupSettings?.backupTTL)}
                        value={backupSettings?.backupTTL ?? 14}
                        defaultValue={14}
                        minValue={0}
                        maxValue={1000}
                        stepSize={1}
                        valueUnit={t('global.date.label.day')}
                        showSlider
                        handleUpdate={(ttl: number) => updateSetting('backupTTL', ttl)}
                    />
                </List>
            </List>
            <input type="file" id="backup-file" style={{ display: 'none' }} />
            <Dialog open={isInvalidBackupDialogOpen}>
                <DialogTitle>{t('settings.backup.action.validate.dialog.title')}</DialogTitle>
                <DialogContent dividers>
                    <List
                        sx={{ listStyleType: 'initial', listStylePosition: 'inside' }}
                        subheader={t('settings.backup.action.validate.dialog.content.label.missing_sources')}
                    >
                        {missingSources.map(({ id, name }) => (
                            <ListItem sx={{ display: 'list-item' }} key={id}>
                                {`${name} (${id})`}
                            </ListItem>
                        ))}
                    </List>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeInvalidBackupDialog}>{t('global.button.cancel')}</Button>
                    <Button
                        onClick={closeInvalidBackupDialog}
                        component={Link}
                        to="/extensions"
                        autoFocus={!!missingSources.length}
                        variant={missingSources.length ? 'contained' : 'text'}
                    >
                        {t('extension.action.label.install')}
                    </Button>
                    <Button
                        onClick={() => {
                            closeInvalidBackupDialog();
                            restoreBackup(currentBackupFile!);
                        }}
                        autoFocus={!missingSources.length}
                        variant={!missingSources.length ? 'contained' : 'text'}
                    >
                        {t('global.button.restore')}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
