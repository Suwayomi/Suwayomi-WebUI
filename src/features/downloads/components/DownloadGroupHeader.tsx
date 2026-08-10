/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { StyledGroupHeader } from '@/base/components/virtuoso/StyledGroupHeader.tsx';
import { MUIUtil } from '@/lib/mui/MUI.util.ts';
import DragHandle from '@mui/icons-material/DragHandle';
import Stack from '@mui/material/Stack';

export const DownloadGroupHeader = ({
    sourceIndex,
    title,
    language,
    itemCount,
}: {
    sourceIndex: number;
    title: string;
    language: string | undefined;
    itemCount: number;
}) => (
    <StyledGroupHeader
        isFirstItem={!sourceIndex}
        sx={{
            flexDirection: 'row',
            gap: 1,
            alignItems: 'center',
            justifyContent: 'space-between',
            pr: 2,
        }}
    >
        <Stack>
            <Typography variant="h5" component="h2">
                {title} ({itemCount})
            </Typography>
            {!!language && <Typography variant="body1">{language}</Typography>}
        </Stack>
        <IconButton {...MUIUtil.preventRippleProp()} sx={{ pointerEvents: 'none' }}>
            <DragHandle />
        </IconButton>
    </StyledGroupHeader>
);
