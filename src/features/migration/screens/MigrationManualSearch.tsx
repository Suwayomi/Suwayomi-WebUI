/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { SearchAll } from '@/features/global-search/screens/SearchAll.tsx';
import { MigrationManager } from '@/features/migration/MigrationManager.ts';

export const MigrationManualSearch = () => (
    <SearchAll migrationDestinationSourceIds={MigrationManager.getState().destinationSourceIds} />
);
