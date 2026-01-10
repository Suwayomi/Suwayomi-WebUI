/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { BackupFlag, BackupFlagGroup } from '@/features/backup/Backup.types.ts';

export const BACKUP_FLAGS_TO_TRANSLATION: Record<BackupFlag, MessageDescriptor> = {
    includeManga: msg`Library entries`,
    includeCategories: msg`Categories`,
    includeChapters: msg`Chapters`,
    includeClientData: msg`Client data`,
    includeHistory: msg`History`,
    includeServerSettings: msg`Server settings`,
    includeTracking: msg`Tracking`,
};

export const BACKUP_FLAG_GROUP_TO_TRANSLATION: Record<BackupFlagGroup, MessageDescriptor> = {
    [BackupFlagGroup.LIBRARY]: msg`Library`,
    [BackupFlagGroup.SETTINGS]: msg`Settings`,
};

export const BACKUP_FLAGS = Object.keys(BACKUP_FLAGS_TO_TRANSLATION) as readonly BackupFlag[];

export const BACKUP_FLAGS_BY_GROUP: Record<BackupFlagGroup, BackupFlag[]> = {
    [BackupFlagGroup.LIBRARY]: [
        'includeManga',
        'includeChapters',
        'includeTracking',
        'includeHistory',
        'includeCategories',
    ],
    [BackupFlagGroup.SETTINGS]: ['includeClientData', 'includeServerSettings'],
};
