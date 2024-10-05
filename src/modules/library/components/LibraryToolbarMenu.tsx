/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import FilterList from '@mui/icons-material/FilterList';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { ComponentProps, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LibraryOptionsPanel } from '@/modules/library/components/LibraryOptionsPanel.tsx';
import { useLibraryOptionsContext } from '@/modules/library/contexts/LibraryOptionsContext.tsx';

export const LibraryToolbarMenu = ({
    category,
}: {
    category: ComponentProps<typeof LibraryOptionsPanel>['category'];
}) => {
    const { t } = useTranslation();

    const [open, setOpen] = useState(false);
    const { options } = useLibraryOptionsContext();
    const active =
        options.hasDownloadedChapters != null ||
        options.hasUnreadChapters != null ||
        options.hasBookmarkedChapters != null ||
        options.hasDuplicateChapters != null ||
        Object.values(options.hasStatus).some((hasStatus) => hasStatus != null) ||
        Object.values(options.hasTrackerBinding).some((trackerFilterStatus) => trackerFilterStatus != null);

    return (
        <>
            <Tooltip title={t('settings.title')}>
                <IconButton onClick={() => setOpen(!open)} color={active ? 'warning' : 'inherit'}>
                    <FilterList />
                </IconButton>
            </Tooltip>
            <LibraryOptionsPanel category={category} open={open} onClose={() => setOpen(false)} />
        </>
    );
};
