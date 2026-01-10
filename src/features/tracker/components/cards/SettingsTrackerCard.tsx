/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import ListItemButton from '@mui/material/ListItemButton';
import Chip from '@mui/material/Chip';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import ListItemText from '@mui/material/ListItemText';
import { useLingui } from '@lingui/react/macro';
import { makeToast } from '@/base/utils/Toast.ts';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { Trackers } from '@/features/tracker/services/Trackers.ts';
import { getErrorMessage, noOp } from '@/lib/HelperFunctions.ts';
import { TTrackerSearch } from '@/features/tracker/Tracker.types.ts';
import { AvatarSpinner } from '@/base/components/AvatarSpinner.tsx';
import { CredentialsLogin } from '@/base/components/modals/LoginDialog.tsx';

export const SettingsTrackerCard = ({ tracker }: { tracker: TTrackerSearch }) => {
    const { t } = useLingui();

    const isOAuthLogin = !tracker.isLoggedIn && !!tracker.authUrl;

    const handleLogout = async () => {
        try {
            await requestManager.logoutFromTracker(tracker.id).response;
        } catch (e) {
            makeToast(t`Could not log out from ${tracker.name}`, 'error', getErrorMessage(e));
        }
    };

    const handleLogin = async (username: string, password: string) => {
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
            await requestManager.loginTrackerCredentials(tracker.id, username, password).response;
        } catch (e) {
            makeToast(t`Could not log in to ${tracker.name}`, 'error', getErrorMessage(e));
        }
    };

    const login = async (initialUsername?: string, initialPassword?: string) => {
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

        const controlled = CredentialsLogin.showControlled(
            {
                title: Trackers.isLoggedIn(tracker) ? t`Log out from ${tracker.name}` : t`Log in to ${tracker.name}`,
                isLoading: false,
                isLoggedIn: Trackers.isLoggedIn(tracker),
                username: initialUsername,
                password: initialPassword,
                loginLogout: async (username, password) => {
                    controlled.update({
                        isLoading: true,
                        loginLogout: noOp,
                    });

                    if (Trackers.isLoggedIn(tracker)) {
                        try {
                            await handleLogout();

                            controlled.submit();
                        } catch (e) {
                            makeToast(t`Could not log out from ${tracker.name}`, 'error', getErrorMessage(e));
                        }

                        return;
                    }

                    try {
                        await handleLogin(username, password);

                        controlled.submit();
                    } catch (e) {
                        makeToast(t`Could not log in to ${tracker.name}`, 'error', getErrorMessage(e));

                        const RETRY_KEY = '__retry__';
                        const retry = await Promise.race([controlled.promise, Promise.resolve(RETRY_KEY)]);
                        if (retry === RETRY_KEY) {
                            login(username, password);
                        }
                    }
                },
            },
            { id: 'tracker-login-dialog' },
        );

        await controlled.promise;
    };

    return (
        <ListItemButton onClick={() => login()}>
            <ListItemAvatar sx={{ paddingRight: '20px' }}>
                <AvatarSpinner
                    alt={`${tracker.name}`}
                    iconUrl={requestManager.getValidImgUrlFor(tracker.icon)}
                    slots={{
                        avatarProps: {
                            variant: 'rounded',
                            sx: { width: 64, height: 64 },
                        },
                        spinnerImageProps: {
                            ignoreQueue: true,
                        },
                    }}
                />
            </ListItemAvatar>
            <ListItemText primary={tracker.name} />
            {Trackers.isLoggedIn(tracker) && (
                <ListItemSecondaryAction>
                    <Chip label={t`Logged in`} color="success" />
                </ListItemSecondaryAction>
            )}
        </ListItemButton>
    );
};
