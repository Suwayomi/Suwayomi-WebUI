/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import Box from '@mui/material/Box';
import { useLingui } from '@lingui/react/macro';
import { useAppTitle } from '@/features/navigation-bar/hooks/useAppTitle.ts';
import { NovelReaderSettingsForm } from '@/features/novel-reader/components/NovelReaderSettingsForm.tsx';

export const NovelReaderSettings: React.FC = () => {
    const { t } = useLingui();

    useAppTitle(t`Light Novel Reader`);

    return (
        <Box sx={{ py: 2, overflowX: 'hidden' }}>
            <NovelReaderSettingsForm />
        </Box>
    );
};
