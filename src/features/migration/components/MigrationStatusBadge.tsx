/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import { useLingui } from '@lingui/react/macro';
import { MigrationEntryStatus } from '@/features/migration/Migration.types.ts';

const STATUS_COLOR: Record<MigrationEntryStatus, 'default' | 'success' | 'error' | 'warning' | 'info' | 'primary'> = {
    [MigrationEntryStatus.PENDING]: 'default',
    [MigrationEntryStatus.SEARCHING]: 'info',
    [MigrationEntryStatus.SEARCH_COMPLETE]: 'success',
    [MigrationEntryStatus.SEARCH_FAILED]: 'error',
    [MigrationEntryStatus.NO_MATCH]: 'warning',
    [MigrationEntryStatus.EXCLUDED]: 'default',
    [MigrationEntryStatus.MIGRATING]: 'info',
    [MigrationEntryStatus.MIGRATED]: 'success',
    [MigrationEntryStatus.MIGRATION_FAILED]: 'error',
};

export const MigrationStatusBadge = ({ status }: { status: MigrationEntryStatus }) => {
    const { t } = useLingui();

    const labels: Record<MigrationEntryStatus, string> = {
        [MigrationEntryStatus.PENDING]: t`Pending`,
        [MigrationEntryStatus.SEARCHING]: t`Searching`,
        [MigrationEntryStatus.SEARCH_COMPLETE]: t`Found`,
        [MigrationEntryStatus.SEARCH_FAILED]: t`Search failed`,
        [MigrationEntryStatus.NO_MATCH]: t`No match`,
        [MigrationEntryStatus.EXCLUDED]: t`Excluded`,
        [MigrationEntryStatus.MIGRATING]: t`Migrating`,
        [MigrationEntryStatus.MIGRATED]: t`Migrated`,
        [MigrationEntryStatus.MIGRATION_FAILED]: t`Failed`,
    };

    const isLoading = status === MigrationEntryStatus.SEARCHING || status === MigrationEntryStatus.MIGRATING;

    return (
        <Chip
            size="small"
            label={labels[status]}
            color={STATUS_COLOR[status]}
            icon={isLoading ? <CircularProgress size={14} color="inherit" /> : undefined}
        />
    );
};
