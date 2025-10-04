/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { CreateBackupInput } from '@/lib/graphql/generated/graphql.ts';

export enum BackupFlagGroup {
    LIBRARY = 'library',
    SETTINGS = 'settings',
}

export type BackupFlag = keyof Omit<CreateBackupInput, 'clientMutationId'>;

export type BackupFlagInclusionState = Record<BackupFlag, boolean>;
