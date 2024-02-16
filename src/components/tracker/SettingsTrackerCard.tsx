/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import PopupState, { bindDialog, bindTrigger } from 'material-ui-popup-state';
import ListItemButton from '@mui/material/ListItemButton';
import { Chip, ListItemAvatar, ListItemSecondaryAction } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import ListItemText from '@mui/material/ListItemText';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import TextField from '@mui/material/TextField';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import { PasswordTextField } from '@/components/atoms/PasswordTextField.tsx';
import { makeToast } from '@/components/util/Toast.tsx';
import { GetTrackersQuery } from '@/lib/graphql/generated/graphql.ts';
import { requestManager } from '@/lib/requests/RequestManager.ts';

export const SettingsTrackerCard = ({ tracker }: { tracker: GetTrackersQuery['trackers']['nodes'][number] }) => {
    const { t } = useTranslation();

    const [loginTrackerCredentials, { loading: isCredentialLoginInProgress }] =
        requestManager.useLoginToTrackerCredentials();
    const [logoutFromTracker] = requestManager.useLogoutFromTracker();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const isOAuthLogin = !tracker.isLoggedIn && !!tracker.authUrl;

    const handleLogout = async () => {
        try {
            await logoutFromTracker({ variables: { trackerId: tracker.id } });
        } catch (e) {
            makeToast(t('tracking.action.logout.label.failure', { name: tracker.name }), 'error');
        }
    };

    const handleLogin = async () => {
        if (isOAuthLogin) {
            const state = {
                redirectUrl: `${window.location.origin}/tracker/login/oauth`,
                clientName: 'Suwayomi-WebUI',
                trackerId: tracker.id,
                trackerName: tracker.name,
            };

            window.open(`${tracker.authUrl}&state=${JSON.stringify(state)}`, '_self');
            return;
        }

        try {
            await loginTrackerCredentials({ variables: { input: { trackerId: tracker.id, username, password } } });
        } catch (e) {
            makeToast(t('tracking.action.login.label.failure', { name: tracker.name }), 'error');
        }
    };

    return (
        <PopupState variant="popover" popupId="tracker-dialog">
            {(popupState) => (
                <>
                    <ListItemButton
                        {...bindTrigger(popupState)}
                        onClick={() => {
                            if (!isOAuthLogin) {
                                popupState.open();
                                return;
                            }

                            handleLogin();
                        }}
                    >
                        <ListItemAvatar sx={{ paddingRight: '20px' }}>
                            <Avatar
                                alt={`${tracker.name}`}
                                src={requestManager.getValidImgUrlFor(tracker.icon)}
                                variant="rounded"
                                sx={{ width: 64, height: 64 }}
                            />
                        </ListItemAvatar>
                        <ListItemText primary={tracker.name} />
                        {tracker.isLoggedIn && (
                            <ListItemSecondaryAction>
                                <Chip label={t('global.label.logged_in')} color="success" />
                            </ListItemSecondaryAction>
                        )}
                    </ListItemButton>
                    <Dialog
                        {...bindDialog(popupState)}
                        open={(tracker.isLoggedIn || !tracker.authUrl) && popupState.isOpen}
                        disableRestoreFocus
                    >
                        <DialogTitle>
                            {t(
                                tracker.isLoggedIn
                                    ? 'tracking.settings.dialog.title.log_out'
                                    : 'tracking.settings.dialog.title.log_in',
                                { name: tracker.name },
                            )}
                        </DialogTitle>
                        {!isOAuthLogin && !tracker.isLoggedIn && (
                            <DialogContent>
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
                            <Button onClick={popupState.close}>{t('global.button.cancel')}</Button>
                            <Button
                                variant="contained"
                                disabled={
                                    !isOAuthLogin &&
                                    !tracker.isLoggedIn &&
                                    (isCredentialLoginInProgress || !username.length || !password.length)
                                }
                                onClick={() => (tracker.isLoggedIn ? handleLogout() : handleLogin())}
                            >
                                {t(tracker.isLoggedIn ? 'global.button.log_out' : 'global.button.log_in')}
                            </Button>
                        </DialogActions>
                    </Dialog>
                </>
            )}
        </PopupState>
    );
};
