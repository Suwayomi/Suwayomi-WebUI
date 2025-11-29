/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Dialog from '@mui/material/Dialog';
import { AwaitableComponent, AwaitableComponentProps } from 'awaitable-component';
import DialogTitle from '@mui/material/DialogTitle';
import { useTranslation } from 'react-i18next';
import DialogContent from '@mui/material/DialogContent';
import TextField from '@mui/material/TextField';
import { useState } from 'react';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import { PasswordTextField } from '@/base/components/inputs/PasswordTextField.tsx';

export const LoginDialog = ({
    isVisible,
    onExitComplete,
    onSubmit,
    title,
    isLoggedIn,
    isLoading,
    loginLogout,
    username: initialUsername = '',
    password: initialPassword = '',
    serverUrl: initialServerUrl = '',
    withServerUrl = false,
}: AwaitableComponentProps<void> & {
    title: string;
    isLoggedIn: boolean;
    isLoading: boolean;
    loginLogout: (username: string, password: string, serverUrl?: string) => void;
    username?: string;
    password?: string;
    serverUrl?: string;
    withServerUrl?: boolean;
}) => {
    const { t } = useTranslation();

    const [serverUrl, setServerUrl] = useState(initialServerUrl);
    const [username, setUsername] = useState(initialUsername);
    const [password, setPassword] = useState(initialPassword);

    return (
        <Dialog open={isVisible} onTransitionExited={onExitComplete} onClose={() => onSubmit()} disableRestoreFocus>
            <DialogTitle>{title}</DialogTitle>
            {!isLoggedIn && (
                <DialogContent>
                    {withServerUrl && (
                        <TextField
                            margin="dense"
                            id="serverUrl"
                            name="serverUrl"
                            label={t('settings.about.server.label.address')}
                            type="text"
                            fullWidth
                            variant="standard"
                            value={serverUrl}
                            onChange={(e) => setServerUrl(e.target.value)}
                        />
                    )}
                    <TextField
                        autoFocus
                        margin="dense"
                        id="username"
                        name="username"
                        label={t('global.label.username')}
                        type="text"
                        fullWidth
                        variant="standard"
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <PasswordTextField
                        margin="dense"
                        fullWidth
                        variant="standard"
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </DialogContent>
            )}
            <DialogActions>
                <Button onClick={() => onSubmit()}>{t('global.button.cancel')}</Button>
                <Button
                    variant="contained"
                    disabled={
                        !isLoggedIn &&
                        (isLoading || !username.length || !password.length || (withServerUrl && !serverUrl?.length))
                    }
                    onClick={() => loginLogout(username, password, serverUrl)}
                >
                    {t(isLoggedIn ? 'global.button.log_out' : 'global.button.log_in')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export const CredentialsLogin = AwaitableComponent.create(LoginDialog);
