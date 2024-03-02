/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Button from '@mui/material/Button';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Dialog from '@mui/material/Dialog';
import { useTranslation } from 'react-i18next';
import { Dispatch, SetStateAction } from 'react';
import { ListItem, ListItemAvatar, Avatar, Box } from '@mui/material';
import { blue } from '@mui/material/colors';
import { useLocalStorage } from '@/util/useLocalStorage';

type BaseProps = {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
    trackers: Tracker[] | undefined;
    mangaName: string;
};
export type Tracker = {
    authUrl: string;
    icon: string;
    id: number;
    name: string;
};

type Props = BaseProps;

export function TrackerList(props: Props) {
    const { t } = useTranslation();

    const [serverAddress] = useLocalStorage<string>('serverBaseURL', '');

    const { open, setOpen, trackers, mangaName } = props;
    console.log({ mangaName });

    const handleCancel = () => {
        setOpen(false);
    };

    const handleOk = () => {
        setOpen(false);
    };

    return (
        <Dialog
            sx={{
                '.MuiDialog-paper': {
                    maxHeight: 435,
                    width: '80%',
                },
            }}
            maxWidth="xs"
            open={open}
        >
            <DialogTitle>Trackers</DialogTitle>
            <DialogContent dividers>
                <div>
                    {trackers?.length === 0 ? (
                        <span>not trackets logged in</span>
                    ) : (
                        trackers?.map((tracker) => (
                            <ListItem sx={{ justifyContent: 'space-between' }} key={tracker.id}>
                                <ListItemAvatar>
                                    <Avatar
                                        src={`${serverAddress}${tracker.icon}`}
                                        sx={{
                                            bgcolor: blue[100],
                                            color: blue[600],
                                        }}
                                    >
                                        {/* <PersonIcon /> */}
                                    </Avatar>
                                </ListItemAvatar>
                                <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                                    <Button
                                        onClick={() => setOpen(true)}
                                        color="primary"
                                        sx={{ maxWidth: 'fit-content' }}
                                    >
                                        Add Tracking
                                    </Button>
                                </Box>
                            </ListItem>
                        ))
                    )}
                </div>
            </DialogContent>
            <DialogActions>
                <Button autoFocus onClick={handleCancel} color="primary">
                    {t('global.button.cancel')}
                </Button>
                <Button onClick={handleOk} color="primary">
                    {t('global.button.ok')}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
