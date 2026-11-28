/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { Navigate } from 'react-router-dom';
import { MigrationPhase } from '@/models/migration/Migration.types.ts';
import { MigrationManager } from '@/controllers/migration/services/MigrationManager.ts';
import { MigrationSelectSource } from '@/views/migration/screens/MigrationSelectSource.tsx';
import { MigrationSelectMangas } from '@/views/migration/screens/MigrationSelectMangas.tsx';
import { MigrationSelectDestinationSources } from '@/views/migration/screens/MigrationSelectDestinationSources.tsx';
import { MigrationSearch } from '@/views/migration/screens/MigrationSearch.tsx';
import { MigrationExecute } from '@/views/migration/screens/MigrationExecute.tsx';
import { AppRoutes } from '@/models/base/AppRoute.constants.ts';
import { BrowseTab } from '@/models/browse/Browse.types.ts';
import { useAppPageHistoryContext } from '@/contexts/base/AppPageHistoryContext.tsx';
import { useEffect } from 'react';
import { ReactRouter } from '@/lib/react-router/ReactRouter.ts';
import { SubpathUtil } from '@/lib/utils/SubpathUtil.ts';

export const Migration = () => {
    const phase = MigrationManager.usePhase();
    const { setOnBack } = useAppPageHistoryContext();

    const isMigrationPage = SubpathUtil.getPathname() === AppRoutes.migrate.path;

    useEffect(() => {
        if (!isMigrationPage) {
            if (!MigrationManager.isResumablePhase()) {
                MigrationManager.reset();
            } else {
                ReactRouter.navigate(AppRoutes.migrate.path, { replace: true });
            }

            return;
        }

        setOnBack(() => MigrationManager.goToPreviousPhase());

        return () => {
            setOnBack(null);
        };
    }, []);

    useEffect(() => {
        if (!isMigrationPage && phase !== MigrationPhase.IDLE && phase !== MigrationPhase.SELECTING_SOURCES) {
            ReactRouter.navigate(AppRoutes.migrate.path, { replace: true });
            return;
        }

        if (isMigrationPage && phase === MigrationPhase.IDLE) {
            ReactRouter.navigate(AppRoutes.browse.path(BrowseTab.MIGRATE), { replace: true });
        }
    }, [phase]);

    switch (phase) {
        case MigrationPhase.IDLE:
        case MigrationPhase.SELECT_SOURCE:
            return <MigrationSelectSource />;
        case MigrationPhase.SELECT_MANGAS:
            return <MigrationSelectMangas />;
        case MigrationPhase.SELECTING_SOURCES:
            return <MigrationSelectDestinationSources />;
        case MigrationPhase.SEARCHING:
            return <MigrationSearch />;
        case MigrationPhase.MIGRATING:
            return <MigrationExecute />;
        // @ts-ignore - fall through
        case MigrationPhase.ABORTED:
            MigrationManager.reset();
        // fall through
        default:
            return <Navigate to={AppRoutes.browse.path(BrowseTab.MIGRATE)} replace />;
    }
};
