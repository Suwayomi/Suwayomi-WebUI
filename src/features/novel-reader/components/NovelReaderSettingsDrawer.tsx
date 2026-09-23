/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import React from 'react';
import { useLingui } from '@lingui/react/macro';
import { NovelReaderSettingsForm } from '@/features/novel-reader/components/NovelReaderSettingsForm.tsx';

export interface NovelReaderSettingsDrawerProps {
    open: boolean;
    onClose: () => void;
}

export const NovelReaderSettingsDrawer: React.FC<NovelReaderSettingsDrawerProps> = ({ open, onClose }) => {
    const { t } = useLingui();

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            slotProps={{
                paper: {
                    sx: {
                        width: { xs: '100%', sm: 360 },
                        py: 2,
                        px: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                        overflowY: 'auto',
                    },
                },
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2 }}>
                <Typography variant="h6">{t`Reader Settings`}</Typography>
                <IconButton onClick={onClose} edge="end">
                    <CloseIcon />
                </IconButton>
            </Box>

            <Divider />

            <NovelReaderSettingsForm />
        </Drawer>
    );
};
