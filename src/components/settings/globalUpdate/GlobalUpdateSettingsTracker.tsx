/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Link, TextField, Typography } from '@mui/material';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@apollo/client';
import axios from 'axios';
import { CheckboxContainer } from '@/components/settings/globalUpdate/CheckboxContainer.ts';
import { CHECK_LOGIN } from '@/lib/graphql/queries/TrackerQuery';
import { useLocalStorage } from '@/util/useLocalStorage';

type Props = {
    aniliClientId?: string;
    AniliRedirectUri?: string;
};

export const GlobalUpdateSettingsTracker = ({ aniliClientId, AniliRedirectUri }: Props) => {
    const { t } = useTranslation();

    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const [serverAddress] = useLocalStorage<string>('serverBaseURL', '');

    const trackerLogin = useQuery(CHECK_LOGIN, { variables: { id: 2 } });

    const closeDialog = () => {
        setIsDialogOpen(false);
    };

    const handleLogout = () => {
        axios
            .post(`${serverAddress}/api/v1/track/logout`, { trackerId: 2 })
            .then(() => {
                setIsDialogOpen(false);
            })
            .catch(() => {
                throw new Error('Failed to logout');
            });
    };

    if (trackerLogin.loading) return <div>Loading...</div>;

    return (
        <div>
            {trackerLogin.data.trackers.nodes[0].isLoggedIn ? (
                <>
                    <ListItemButton onClick={() => setIsDialogOpen(true)}>
                        <ListItemText
                            primary={<Typography>Logout of Anilist</Typography>}
                            secondary={<p>Track your manga reading progress</p>}
                            // primary={t('library.settings.global_update.entries.title')}
                            // secondary={skipEntriesText}
                            onClick={() => setIsDialogOpen(true)}
                        />
                    </ListItemButton>

                    <Dialog open={isDialogOpen} onClose={closeDialog}>
                        <DialogContent>
                            <DialogTitle sx={{ paddingLeft: 0 }}>
                                You are about to Logout of Anilist
                                {/* {t('library.settings.global_update.entries.title')} */}
                            </DialogTitle>
                            <CheckboxContainer>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={handleLogout}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        alignSelf: 'center',
                                        justifyContent: 'center',
                                        width: '26%',
                                    }}
                                >
                                    Logout
                                </Button>
                            </CheckboxContainer>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={closeDialog} color="primary">
                                {t('global.button.cancel')}
                            </Button>
                        </DialogActions>
                    </Dialog>
                </>
            ) : (
                <>
                    <ListItemButton onClick={() => setIsDialogOpen(true)}>
                        <ListItemText
                            primary={<Typography>Login in to Anilist</Typography>}
                            secondary={<p>Track your manga reading progress</p>}
                            // primary={t('library.settings.global_update.entries.title')}
                            // secondary={skipEntriesText}
                            onClick={() => setIsDialogOpen(true)}
                        />
                    </ListItemButton>

                    <Dialog open={isDialogOpen} onClose={closeDialog}>
                        <DialogContent>
                            <DialogTitle sx={{ paddingLeft: 0 }}>
                                You are about to be redirected to Anilist to complete the login process
                                {/* {t('library.settings.global_update.entries.title')} */}
                            </DialogTitle>
                            <CheckboxContainer>
                                {trackerLogin.data.trackers.nodes[0].isLoggedIn ? (
                                    <form noValidate autoComplete="off">
                                        <TextField
                                            sx={{ Padding: 3 }}
                                            id="anilist-code"
                                            label="Code:"
                                            variant="outlined"
                                        />
                                        <Button variant="contained" color="primary">
                                            Logout
                                        </Button>
                                    </form>
                                ) : (
                                    <Link
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                        href={`https://anilist.co/api/v2/oauth/authorize?client_id=${aniliClientId ?? import.meta.env.VITE_ANILI_CLIENT_ID}&redirect_uri=${AniliRedirectUri ?? import.meta.env.VITE_ANILI_REDIRECT_URI}&response_type=code`}
                                        // target="_blank"
                                        underline="none"
                                        rel="noopener noreferrer"
                                    >
                                        Go to Anilist to authenticate
                                    </Link>
                                )}
                            </CheckboxContainer>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={closeDialog} color="primary">
                                {t('global.button.cancel')}
                            </Button>
                        </DialogActions>
                    </Dialog>
                </>
            )}
        </div>
    );
};
