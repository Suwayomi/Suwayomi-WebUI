/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { Navigate } from 'react-router-dom';
import { MigrationPhase } from '@/features/migration/Migration.types.ts';
import { MigrationManager } from '@/features/migration/MigrationManager.ts';
import { MigrationSelectSource } from '@/features/migration/screens/MigrationSelectSource.tsx';
import { MigrationSelectMangas } from '@/features/migration/screens/MigrationSelectMangas.tsx';
import { MigrationSelectDestinationSources } from '@/features/migration/screens/MigrationSelectDestinationSources.tsx';
import { MigrationSearch } from '@/features/migration/screens/MigrationSearch.tsx';
import { MigrationExecute } from '@/features/migration/screens/MigrationExecute.tsx';
import { AppRoutes } from '@/base/AppRoute.constants.ts';
import { BrowseTab } from '@/features/browse/Browse.types.ts';
import { useAppPageHistoryContext } from '@/base/contexts/AppPageHistoryContext.tsx';
import { useEffect } from 'react';
import { ReactRouter } from '@/lib/react-router/ReactRouter.ts';

export const Migration = ({ tabsMenuHeight = 0 }: { tabsMenuHeight?: number }) => {
    const phase = MigrationManager.usePhase();
    const { setOnBack } = useAppPageHistoryContext();

    useEffect(() => {
        if (window.location.pathname !== AppRoutes.migrate.path) {
            if (!MigrationManager.isActive()) {
                MigrationManager.reset();
            } else {
                ReactRouter.navigate(AppRoutes.migrate.path);
            }

            return;
        }

        setOnBack(() => MigrationManager.goToPreviousPhase());

        return () => {
            setOnBack(null);
        };
    }, []);

    switch (phase) {
        case MigrationPhase.IDLE:
        case MigrationPhase.SELECT_SOURCE:
            return <MigrationSelectSource tabsMenuHeight={tabsMenuHeight} />;
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
