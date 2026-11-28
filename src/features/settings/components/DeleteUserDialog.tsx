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
import type { ManagedUser } from '@/features/settings/Settings.types.ts';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';
import { requestManager } from '@/lib/requests/RequestManager.ts';

export const DeleteUserDialog = ({
    user,
    onClose,
    onDeleted,
}: {
    user: ManagedUser;
    onClose: () => void;
    onDeleted: () => void;
}) => {
    const { t } = useLingui();

    const [isDeleting, setIsDeleting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleDialogSubmit = async () => {
        if (isDeleting) {
            return;
        }

        setIsDeleting(true);
        setErrorMessage('');

        try {
            await requestManager.deleteUser(user.id).response;
        } catch (e) {
            setErrorMessage(getErrorMessage(e) || t`Could not delete user`);
            setIsDeleting(false);

            return;
        }

        onDeleted();
    };

    return (
        <Dialog
            open
            onClose={isDeleting ? undefined : onClose}
            aria-labelledby="delete-user-title"
            aria-describedby="delete-user-description"
        >
            <DialogTitle id="delete-user-title">{t`Delete ${user.username}?`}</DialogTitle>
            <DialogContent>
                <DialogContentText id="delete-user-description">
                    {t`Their account and library data will be permanently deleted.`}
                </DialogContentText>
                {errorMessage && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                        {errorMessage}
                    </Alert>
                )}
            </DialogContent>
            <DialogActions>
                <Button autoFocus disabled={isDeleting} onClick={onClose}>
                    {t`Cancel`}
                </Button>
                <Button color="error" variant="contained" loading={isDeleting} onClick={handleDialogSubmit}>
                    {t`Delete user`}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
