/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLingui } from '@lingui/react/macro';
import { MigrationPhase } from '@/features/migration/Migration.types.ts';
import {
    useMigrationIsActive,
    useMigrationPhase,
    useMigrationSearchProgress,
    useMigrationMigrationProgress,
} from '@/features/migration/MigrationManager.ts';
import { AppRoutes } from '@/base/AppRoute.constants.ts';

export const MigrationFloatingIndicator = () => {
    const { t } = useLingui();
    const navigate = useNavigate();
    const location = useLocation();
    const isActive = useMigrationIsActive();
    const phase = useMigrationPhase();
    const searchProgress = useMigrationSearchProgress();
    const migrationProgress = useMigrationMigrationProgress();

    // Don't show if not active or already on migrate page
    if (!isActive || location.pathname.startsWith('/migrate')) {
        return null;
    }

    const label =
        phase === MigrationPhase.SEARCHING
            ? t`Searching ${searchProgress.completed}/${searchProgress.total}`
            : t`Migrating ${migrationProgress.completed}/${migrationProgress.total}`;

    return (
        <Chip
            icon={<CircularProgress size={16} color="inherit" />}
            label={label}
            color="primary"
            onClick={() => navigate(AppRoutes.migrate.path)}
            sx={{
                position: 'fixed',
                bottom: (theme) => theme.spacing(2),
                right: (theme) => theme.spacing(2),
                zIndex: (theme) => theme.zIndex.fab,
                cursor: 'pointer',
            }}
        />
    );
};
