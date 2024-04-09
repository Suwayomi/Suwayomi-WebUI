/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import FilterList from '@mui/icons-material/FilterList';
import { IconButton, Tooltip } from '@mui/material';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLibraryOptionsContext } from '@/components/context/LibraryOptionsContext';
import { LibraryOptionsPanel } from '@/components/library/LibraryOptionsPanel';

export const LibraryToolbarMenu: React.FC = () => {
    const { t } = useTranslation();

    const [open, setOpen] = useState(false);
    const { options } = useLibraryOptionsContext();
    const active =
        options.downloaded != null ||
        options.unread != null ||
        Object.values(options.tracker).some((trackerFilterStatus) => trackerFilterStatus != null);

    return (
        <>
            <Tooltip title={t('settings.title')}>
                <IconButton onClick={() => setOpen(!open)} color={active ? 'warning' : 'default'}>
                    <FilterList />
                </IconButton>
            </Tooltip>
            <LibraryOptionsPanel open={open} onClose={() => setOpen(false)} />
        </>
    );
};
