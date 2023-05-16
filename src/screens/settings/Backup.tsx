/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import React, { useContext, useEffect } from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { fromEvent } from 'file-selector';
import makeToast from 'components/util/Toast';
import ListItemLink from 'components/util/ListItemLink';
import NavbarContext from 'components/context/NavbarContext';
import { useTranslation } from 'react-i18next';
import requestManager from 'lib/RequestManager';

export default function Backup() {
    const { t } = useTranslation();
    const { setTitle, setAction } = useContext(NavbarContext);
    useEffect(() => {
        setTitle(t('settings.backup.title'));
        setAction(null);
    }, [t]);

    const submitBackup = (file: File) => {
        if (file.name.toLowerCase().endsWith('proto.gz')) {
            makeToast(t('settings.backup.label.restoring_backup'), 'info');
            requestManager
                .restoreBackupFile(file)
                .then(() => makeToast(t('settings.backup.label.restored_backup'), 'success'))
                .catch(() => makeToast(t('settings.backup.label.backup_restore_failed'), 'error'));
        } else if (file.name.toLowerCase().endsWith('json')) {
            makeToast(t('settings.backup.label.legacy_backup_unsupported'), 'error');
        } else {
            makeToast(t('global.error.label.invalid_file_type'), 'error');
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

    useEffect(() => {
        document.addEventListener('drop', dropHandler);
        document.addEventListener('dragover', dragOverHandler);

        const input = document.getElementById('backup-file');
        input?.addEventListener('change', async (evt) => {
            const files = await fromEvent(evt);
            submitBackup(files[0] as File);
        });

        return () => {
            document.removeEventListener('drop', dropHandler);
            document.removeEventListener('dragover', dragOverHandler);
        };
    }, []);

    return (
        <>
            <List sx={{ padding: 0 }}>
                <ListItemLink to={requestManager.getExportBackupUrl()} directLink>
                    <ListItemText
                        primary={t('settings.backup.label.create_backup')}
                        secondary={t('settings.backup.label.create_backup_info')}
                    />
                </ListItemLink>
                <ListItem button onClick={() => document.getElementById('backup-file')?.click()}>
                    <ListItemText
                        primary={t('settings.backup.label.restore_backup')}
                        secondary={t('settings.backup.label.restore_backup_info')}
                    />
                </ListItem>
            </List>
            <input type="file" id="backup-file" style={{ display: 'none' }} />
        </>
    );
}
