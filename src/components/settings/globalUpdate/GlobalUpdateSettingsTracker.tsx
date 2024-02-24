/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Link, TextField } from '@mui/material';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckboxContainer } from '@/components/settings/globalUpdate/CheckboxContainer.ts';

type Props = {
    aniliClientId?: string;
    AniliRedirectUri?: string;
};

export const GlobalUpdateSettingsTracker = ({ aniliClientId, AniliRedirectUri }: Props) => {
    const { t } = useTranslation();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [needCode, setNeedCode] = useState(true);

    const closeDialog = () => {
        setIsDialogOpen(false);
        setNeedCode(true);
    };

    return (
        <>
            <ListItemButton onClick={() => setIsDialogOpen(true)}>
                <ListItemText
                    primary={<p>Login in to Anilist</p>}
                    secondary={<p>Track your manga reading progress</p>}
                    // primary={t('library.settings.global_update.entries.title')}
                    // secondary={skipEntriesText}
                    onClick={() => setIsDialogOpen(true)}
                />
            </ListItemButton>

            <Dialog open={isDialogOpen} onClose={closeDialog}>
                <DialogContent>
                    <DialogTitle sx={{ paddingLeft: 0 }}>
                        You are about to be redirected to Anilist, make sure to copy the code paramater from the
                        redirect uri after authentcating
                        {/* {t('library.settings.global_update.entries.title')} */}
                    </DialogTitle>
                    <CheckboxContainer>
                        {needCode ? (
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
                                // onClick={() => setNeedCode(false)}
                            >
                                Go to Anilist to authenticate
                            </Link>
                        ) : (
                            <form noValidate autoComplete="off">
                                <TextField sx={{ Padding: 3 }} id="anilist-code" label="Code:" variant="outlined" />
                                <Button variant="contained" color="primary">
                                    Submit
                                </Button>
                            </form>
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
    );
};
