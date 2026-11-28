/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { beforeEach, expect, test, spyOn } from 'bun:test';
import { i18n } from '@lingui/core';
import { MigrationManager } from '@/features/migration/MigrationManager.ts';
import { MigrationEntryStatus } from '@/features/migration/Migration.types.ts';

i18n.loadAndActivate({ locale: 'en', messages: {} });

const manager = MigrationManager as any;

const found = (id: number, chapterNumber: number) => ({
    manga: { id, title: 'Title', sourceId: `${id}`, highestNumberedChapter: { chapterNumber } },
    chapters: null,
});

beforeEach(() => {
    MigrationManager.reset();
    MigrationManager.selectSources(['0']);
    MigrationManager.selectMangas([{ id: 1, title: 'Title', sourceId: '0' } as any]);
});

test('keeps the match with the most chapters when a later source has fewer', () => {
    const options = { selectHighestChapterNumberSource: true };

    manager.updateEntrySearchState(1, 'a', [found(100, 20)], options);
    manager.updateEntrySearchState(1, 'b', [found(200, 10)], options);

    expect(MigrationManager.getState().entries[1].selectedMatchMangaId).toBe(100);
});

test('retrying a failed migration does not report an error', async () => {
    const migrate = spyOn(manager, 'migrateSingleEntry').mockResolvedValue(undefined);
    manager.updateState((draft: any) => {
        draft.entries[1].status = MigrationEntryStatus.MIGRATION_FAILED;
        draft.migrateOptions = {};
    });

    await expect(MigrationManager.retryEntry(1)).resolves.toBeUndefined();
    expect(migrate).toHaveBeenCalledOnce();
});
