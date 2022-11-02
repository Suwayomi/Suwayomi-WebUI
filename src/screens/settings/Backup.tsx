/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import React, { useContext, useEffect } from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { fromEvent } from 'file-selector';
import client from 'util/client';
import makeToast from 'components/util/Toast';
import ListItemLink from '../../components/util/ListItemLink';
import NavbarContext from '../../components/context/NavbarContext';

export default function Backup() {
    const { setTitle, setAction } = useContext(NavbarContext);
    useEffect(() => { setTitle('Backup'); setAction(<></>); }, []);

    const { baseURL } = client.defaults;

    const submitBackup = (file: File) => {
        if (file.name.toLowerCase().endsWith('proto.gz')) {
            const formData = new FormData();
            formData.append('backup.proto.gz', file);

            makeToast('Restoring backup....', 'info');
            client.post('/api/v1/backup/import/file',
                formData, { headers: { 'Content-Type': 'multipart/form-data' } })
                .then(() => makeToast('Backup restore finished!', 'success'))
                .catch(() => makeToast('Backup restore failed!', 'error'));
        } else if (file.name.toLowerCase().endsWith('json')) {
            makeToast('legacy backups are not supported!', 'error');
        } else {
            makeToast('invalid file type!', 'error');
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
                <ListItemLink to={`${baseURL}/api/v1/backup/export/file`} directLink>
                    <ListItemText
                        primary="Create Backup"
                        secondary="Backup library as a Tachiyomi backup"
                    />
                </ListItemLink>
                <ListItem button onClick={() => document.getElementById('backup-file')?.click()}>
                    <ListItemText
                        primary="Restore Backup"
                        secondary="You can also drag and drop the backup file here to restore"
                    />
                </ListItem>
            </List>
            <input
                type="file"
                id="backup-file"
                style={{ display: 'none' }}
            />
        </>

    );
}
