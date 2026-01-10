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
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListSubheader from '@mui/material/ListSubheader';
import { useEventListener, useMergedRef, useWindowEvent } from '@mantine/hooks';
import { AwaitableComponent } from 'awaitable-component';
import { useLingui } from '@lingui/react/macro';
import { plural } from '@lingui/core/macro';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { makeToast } from '@/base/utils/Toast.ts';
import { BackupRestoreState } from '@/lib/graphql/generated/graphql.ts';
import { Progress } from '@/base/components/feedback/Progress.tsx';
import { TextSetting } from '@/base/components/settings/text/TextSetting.tsx';
import { NumberSetting } from '@/base/components/settings/NumberSetting.tsx';
import { TimeSetting } from '@/base/components/settings/TimeSetting.tsx';
import { LoadingPlaceholder } from '@/base/components/feedback/LoadingPlaceholder.tsx';
import { EmptyViewAbsoluteCentered } from '@/base/components/feedback/EmptyViewAbsoluteCentered.tsx';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';
import { useAppTitle } from '@/features/navigation-bar/hooks/useAppTitle.ts';
import { BackupFlagInclusionDialog } from '@/features/backup/component/BackupFlagInclusionDialog.tsx';
import { BackupValidationDialog } from '@/features/backup/component/BackupValidationDialog.tsx';
import {
    convertToAutoBackupFlags,
    convertToBackupFlags,
    getAutoBackupFlagsInfo,
    getBackupCleanupDisplayValue,
} from '@/features/backup/Backup.utils.ts';
import { BackupSettingsType } from '@/features/backup/Backup.types.ts';

let backupRestoreId: string | undefined;

export function Backup() {
    const { t } = useLingui();

    useAppTitle(t`Backup`);

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
            makeToast(t`Failed to save changes`, 'error', getErrorMessage(e)),
        );
    };

    const updateSettings = <Setting extends keyof BackupSettingsType>(
        settings: Record<Setting, BackupSettingsType[Setting]>,
    ) => {
        mutateSettings({ variables: { input: { settings } } }).catch((e) =>
            makeToast(t`Failed to save changes`, 'error', getErrorMessage(e)),
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
                makeToast(t`Backup restored.`, 'success');
            }

            if (isFailure) {
                makeToast(t`Could not restore backup`, 'error');
            }

            requestManager.reset();
            backupRestoreId = undefined;
            setTriggerReRender(Date.now());
        }
    }, [data?.restoreStatus?.state]);

    const resetBackupState = () => {
        const input = document.getElementById('backup-file') as HTMLInputElement;
        if (input) {
            input.value = '';
        }
    };

    const createBackup = async () => {
        const flags = await AwaitableComponent.show(BackupFlagInclusionDialog, {
            title: t`Create backup`,
        });

        makeToast(t`Creating backup…`, 'info');

        try {
            const backupFileResponse = await requestManager.createBackupFile({ flags }).response;

            const backupFileUrl = backupFileResponse.data?.createBackup.url;
            if (!backupFileUrl) {
                makeToast(t`Could not create backup`, 'error', getErrorMessage(backupFileResponse.errors));
                return;
            }

            const link = document.createElement('a');
            link.href = requestManager.getValidUrlFor(backupFileUrl, '');
            link.download = '';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (e) {
            makeToast(t`Could not create backup`, 'error', getErrorMessage(e));
        }
    };

    const validateBackup = async (file: File) => {
        try {
            const {
                data: { validateBackup: validateBackupData },
            } = await requestManager.validateBackupFile(file, { fetchPolicy: 'network-only' }).response;

            if (validateBackupData.missingSources.length || validateBackupData.missingTrackers.length) {
                try {
                    await AwaitableComponent.show(
                        BackupValidationDialog,
                        {
                            validationResult: validateBackupData,
                        },
                        { id: `backup-validate-${file.name}` },
                    );
                } catch (_) {
                    return false;
                }
            }

            return true;
        } catch (e) {
            makeToast(t`Could not validate backup`, 'error', getErrorMessage(e));
        } finally {
            resetBackupState();
        }

        return false;
    };

    const restoreBackup = async (backup: File) => {
        const flags = await AwaitableComponent.show(BackupFlagInclusionDialog, {
            title: t`Restore Backup`,
        });

        try {
            makeToast(t`Restoring backup…`, 'info');

            const response = await requestManager.restoreBackupFile({ backup, flags }).response;
            backupRestoreId = response.data?.restoreBackup.id;
            setTriggerReRender(Date.now());
        } catch (e) {
            makeToast(t`Could not restore backup`, 'error', getErrorMessage(e));
        } finally {
            resetBackupState();
        }
    };

    const submitBackup = async (file: File) => {
        if (file.name.toLowerCase().endsWith('json')) {
            makeToast(t`legacy backups are not supported!`, 'error');
            return;
        }

        const isValidFilename = file.name.toLowerCase().match(/proto\.gz$|tachibk$/g);
        if (!isValidFilename) {
            makeToast(t`Invalid filetype`, 'error');
            return;
        }

        const isBackupValid = await validateBackup(file);
        if (isBackupValid) {
            await restoreBackup(file);
        }
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
                message={t`Unable to load data`}
                messageExtra={getErrorMessage(error)}
                retry={() => refetch().catch(defaultPromiseErrorHandler('Backup::refetch'))}
            />
        );
    }

    const backupSettings = settingsData!.settings;

    const autoBackupFlagsInfo = getAutoBackupFlagsInfo(backupSettings);
    const includedCategoriesText = autoBackupFlagsInfo.true;
    const excludedCategoriesText = autoBackupFlagsInfo.false;

    return (
        <>
            <List sx={{ padding: 0 }}>
                <ListItemButton onClick={createBackup}>
                    <ListItemText primary={t`Create backup`} secondary={t`Back up library as a Tachiyomi backup`} />
                </ListItemButton>
                <ListItemButton onClick={() => inputRef.current?.click()} disabled={!!backupRestoreId}>
                    <ListItemText
                        primary={t`Restore Backup`}
                        secondary={t`You can also drag and drop the backup file here to restore it`}
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
                        settingName={t`Backup location`}
                        dialogDescription={t`The path to the directory on the server where automated backups should get saved in`}
                        value={backupSettings.backupPath}
                        settingDescription={backupSettings.backupPath.length ? backupSettings.backupPath : t`Default`}
                        handleChange={(path) => updateSetting('backupPath', path)}
                    />
                    <ListItemButton
                        onClick={async () => {
                            try {
                                const flags = await AwaitableComponent.show(BackupFlagInclusionDialog, {
                                    title: t`Backup data`,
                                    flags: convertToBackupFlags(backupSettings),
                                });

                                updateSettings(convertToAutoBackupFlags(flags));
                            } catch (e) {
                                // Ignore
                            }
                        }}
                    >
                        <ListItemText
                            primary={t`Backup data`}
                            secondary={
                                <>
                                    <span>{t`Include: ${includedCategoriesText}`}</span>
                                    <span>{t`Exclude: ${excludedCategoriesText}`}</span>
                                </>
                            }
                            secondaryTypographyProps={{ style: { display: 'flex', flexDirection: 'column' } }}
                        />
                    </ListItemButton>
                    <TimeSetting
                        settingName={t`Backup time`}
                        value={backupSettings.backupTime}
                        defaultValue="00:00"
                        handleChange={(time: string) => updateSetting('backupTime', time)}
                    />
                    <NumberSetting
                        settingTitle={t`Backup interval`}
                        settingValue={plural(backupSettings.backupInterval, {
                            one: '# day',
                            other: '# days',
                        })}
                        value={backupSettings.backupInterval}
                        defaultValue={1}
                        minValue={1}
                        maxValue={31}
                        stepSize={1}
                        valueUnit={t`Day`}
                        showSlider
                        handleUpdate={(interval: number) => updateSetting('backupInterval', interval)}
                    />
                    <NumberSetting
                        settingTitle={t`Backup cleanup`}
                        settingValue={getBackupCleanupDisplayValue(backupSettings.backupTTL)}
                        value={backupSettings.backupTTL}
                        defaultValue={14}
                        minValue={0}
                        maxValue={1000}
                        stepSize={1}
                        valueUnit={t`Day`}
                        showSlider
                        handleUpdate={(ttl: number) => updateSetting('backupTTL', ttl)}
                    />
                </List>
            </List>
            <input ref={mergedInputRef} type="file" style={{ display: 'none' }} />
        </>
    );
}
