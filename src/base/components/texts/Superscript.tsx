/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';

interface SuperscriptProps {
    superscript: string;
    text: ReactNode;
}

/**
 * Displays a text with a superscript portion.
 */
export const Superscript = ({ superscript, text }: SuperscriptProps) => (
    <Stack sx={{ flexDirection: 'row', gap: 0.25 }}>
        {text}
        <Typography variant="caption" sx={{ fontSize: 'x-small', opacity: 0.75 }}>
            {superscript}
        </Typography>
    </Stack>
);
