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
import { msg } from '@lingui/core/macro';
import type { MessageDescriptor } from '@lingui/core';

const STATUS_COLOR: Record<MigrationEntryStatus, 'default' | 'success' | 'error' | 'warning' | 'info' | 'primary'> = {
    [MigrationEntryStatus.PENDING]: 'default',
    [MigrationEntryStatus.SEARCHING]: 'info',
    [MigrationEntryStatus.SEARCH_COMPLETE]: 'success',
    [MigrationEntryStatus.SEARCH_FAILED]: 'error',
    [MigrationEntryStatus.NO_MATCH]: 'warning',
    [MigrationEntryStatus.MIGRATING]: 'info',
    [MigrationEntryStatus.MIGRATED]: 'success',
    [MigrationEntryStatus.MIGRATION_FAILED]: 'error',
};

const ENTRY_STATUS_TRANSLATION: Record<MigrationEntryStatus, MessageDescriptor> = {
    [MigrationEntryStatus.PENDING]: msg`Pending`,
    [MigrationEntryStatus.SEARCHING]: msg`Searching`,
    [MigrationEntryStatus.SEARCH_COMPLETE]: msg`Found`,
    [MigrationEntryStatus.SEARCH_FAILED]: msg`Search failed`,
    [MigrationEntryStatus.NO_MATCH]: msg`No match`,
    [MigrationEntryStatus.MIGRATING]: msg`Migrating`,
    [MigrationEntryStatus.MIGRATED]: msg`Migrated`,
    [MigrationEntryStatus.MIGRATION_FAILED]: msg`Failed`,
};

export const MigrationStatusBadge = ({ status }: { status: MigrationEntryStatus }) => {
    const { t } = useLingui();

    const isLoading = status === MigrationEntryStatus.SEARCHING || status === MigrationEntryStatus.MIGRATING;

    return (
        <Chip
            size="small"
            label={t(ENTRY_STATUS_TRANSLATION[status])}
            color={STATUS_COLOR[status]}
            icon={isLoading ? <CircularProgress size={14} color="inherit" /> : undefined}
        />
    );
};
