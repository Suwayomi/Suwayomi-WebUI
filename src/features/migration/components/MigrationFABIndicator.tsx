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
import type { MigrationProgress } from '@/features/migration/Migration.types.ts';
import { MigrationPhase } from '@/features/migration/Migration.types.ts';
import { MigrationManager } from '@/features/migration/MigrationManager.ts';
import { AppRoutes } from '@/base/AppRoute.constants.ts';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { useLayoutEffect, useState } from 'react';

const getButtonText = (phase: MigrationPhase, progress: MigrationProgress) => {
    switch (phase) {
        case MigrationPhase.SEARCHING:
            if (progress.total === progress.completed) {
                return `Searching`;
            }

            return `Searching (${progress.completed}/${progress.total})`;

        case MigrationPhase.MIGRATING:
            if (progress.total === progress.completed) {
                return `Migrating`;
            }

            return `Migrating (${progress.completed}/${progress.total})`;
        default:
            return 'Migrating';
    }
};

export const MigrationFABIndicator = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = MigrationManager.useIsActive();
    const phase = MigrationManager.usePhase();
    const searchProgress = MigrationManager.useSearchProgress();
    const migrationProgress = MigrationManager.useMigrationProgress();

    const [isVisible, setIsVisible] = useState(true);

    useLayoutEffect(() => {
        setIsVisible(true);
    }, [phase]);

    if (!isVisible || !isActive || location.pathname.startsWith(AppRoutes.migrate.path)) {
        return null;
    }

    return (
        <Chip
            icon={MigrationManager.isPhaseComplete() ? <DoneAllIcon /> : <CircularProgress size={16} color="inherit" />}
            label={getButtonText(phase, phase === MigrationPhase.SEARCHING ? searchProgress : migrationProgress)}
            color="primary"
            onClick={() => navigate(AppRoutes.migrate.path)}
            sx={{
                position: 'fixed',
                bottom: (theme) => theme.spacing(2),
                right: (theme) => theme.spacing(2),
                zIndex: (theme) => theme.zIndex.fab,
                cursor: 'pointer',
            }}
            onDelete={() => setIsVisible(false)}
        />
    );
};
