/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useState } from 'react';
import { useLingui } from '@lingui/react/macro';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import type { ManagedUser } from '@/features/settings/components/UserAccountDialog.tsx';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';
import { requestManager } from '@/lib/requests/RequestManager.ts';

export function DeleteUserDialog({
    user,
    onClose,
    onDeleted,
}: {
    user: ManagedUser;
    onClose: () => void;
    onDeleted: () => void;
}) {
    const { t } = useLingui();
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState('');

    const confirm = async () => {
        if (deleting) {
            return;
        }
        setDeleting(true);
        setError('');
        try {
            await requestManager.deleteUser(user.id).response;
        } catch (reason) {
            setError(getErrorMessage(reason) || t`Could not delete user`);
            setDeleting(false);
            return;
        }
        onDeleted();
    };

    return (
        <Dialog
            open
            onClose={deleting ? undefined : onClose}
            aria-labelledby="delete-user-title"
            aria-describedby="delete-user-description"
        >
            <DialogTitle id="delete-user-title">{t`Delete ${user.username}?`}</DialogTitle>
            <DialogContent>
                <DialogContentText id="delete-user-description">{t`Their account and library data will be permanently deleted.`}</DialogContentText>
                {error && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                        {error}
                    </Alert>
                )}
            </DialogContent>
            <DialogActions>
                <Button autoFocus disabled={deleting} onClick={onClose}>{t`Cancel`}</Button>
                <Button color="error" variant="contained" loading={deleting} onClick={confirm}>{t`Delete user`}</Button>
            </DialogActions>
        </Dialog>
    );
}
