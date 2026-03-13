/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import { MigrationPhase } from '@/features/migration/Migration.types.ts';
import { MigrationManager, useMigrationPhase } from '@/features/migration/MigrationManager.ts';
import { MigrationSelectSource } from '@/features/migration/components/MigrationSelectSource.tsx';
import { MigrationSelectMangas } from '@/features/migration/components/MigrationSelectMangas.tsx';
import { MigrationSelectingSources } from '@/features/migration/components/MigrationSelectingSources.tsx';
import { MigrationSearch } from '@/features/migration/components/MigrationSearch.tsx';
import { MigrationExecute } from '@/features/migration/components/MigrationExecute.tsx';
import { MigrationComplete } from '@/features/migration/components/MigrationComplete.tsx';
import { AppRoutes } from '@/base/AppRoute.constants.ts';
import { loadable } from 'react-lazily/loadable';
import { lazyLoadFallback } from '@/base/utils/LazyLoad.tsx';

const { SearchAll } = loadable(() => import('@/features/global-search/screens/SearchAll.tsx'), lazyLoadFallback);

const MigrationPhaseSwitch = () => {
    const phase = useMigrationPhase();

    useEffect(() => {
        MigrationManager.init();
    }, []);

    switch (phase) {
        case MigrationPhase.IDLE:
        case MigrationPhase.SELECT_SOURCE:
            return <MigrationSelectSource />;
        case MigrationPhase.SELECT_MANGAS:
            return <MigrationSelectMangas />;
        case MigrationPhase.SELECTING_SOURCES:
            return <MigrationSelectingSources />;
        case MigrationPhase.SEARCHING:
            return <MigrationSearch />;
        case MigrationPhase.MIGRATING:
            return <MigrationExecute />;
        case MigrationPhase.MIGRATION_COMPLETE:
            return <MigrationComplete />;
        case MigrationPhase.ABORTED:
            MigrationManager.reset();
            return <MigrationSelectSource />;
        default:
            return <MigrationSelectSource />;
    }
};

export const MigrationProcess = () => (
    <Routes>
        <Route path={AppRoutes.migrate.childRoutes.legacySearch.match} element={<SearchAll />} />
        <Route path="*" element={<MigrationPhaseSwitch />} />
    </Routes>
);
