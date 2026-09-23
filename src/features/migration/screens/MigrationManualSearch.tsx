/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { SearchAll } from '@/features/global-search/screens/SearchAll.tsx';
import { MigrationManager } from '@/features/migration/MigrationManager.ts';
import { useParams } from 'react-router-dom';

export const MigrationManualSearch = () => {
    const { mangaId } = useParams<{ mangaId: string }>();
    const migrationState = MigrationManager.getState();
    const migrationSourceId = mangaId ? migrationState.entries[Number(mangaId)]?.sourceId : undefined;

    return (
        <SearchAll
            migrationDestinationSourceIds={migrationState.destinationSourceIds}
            migrationSourceId={migrationSourceId}
        />
    );
};
