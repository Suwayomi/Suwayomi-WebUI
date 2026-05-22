/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { MigratableEntry, TMigrationEntry } from '@/features/migration/Migration.types.ts';
import { MigrationEntryStatus } from '@/features/migration/Migration.types.ts';

export class MigrationEntries {
    public static isSearching(entry: TMigrationEntry): boolean {
        return [MigrationEntryStatus.PENDING, MigrationEntryStatus.SEARCHING].includes(entry.status);
    }

    public static getExcluded(entries: TMigrationEntry[]): TMigrationEntry[] {
        return entries.filter((entry) => entry.isExcluded);
    }

    public static getHaveStatus(entries: TMigrationEntry[], ...statuses: MigrationEntryStatus[]): TMigrationEntry[] {
        return entries.filter((entry) => statuses.includes(entry.status));
    }

    public static getHaveStatusSorted(
        entries: TMigrationEntry[],
        ...statuses: MigrationEntryStatus[]
    ): TMigrationEntry[] {
        return MigrationEntries.getHaveStatus(entries, ...statuses).toSorted((a, b) =>
            a.mangaTitle.localeCompare(b.mangaTitle),
        );
    }

    public static getActiveEntriesSorted(
        entries: TMigrationEntry[],
        activeStatus: MigrationEntryStatus,
        ...statuses: MigrationEntryStatus[]
    ): TMigrationEntry[] {
        return MigrationEntries.getHaveStatus(entries, ...statuses).toSorted((a, b) => {
            if (a.status === activeStatus && b.status !== activeStatus) {
                return -1;
            }

            if (a.status !== activeStatus && b.status === activeStatus) {
                return 1;
            }

            return a.mangaTitle.localeCompare(b.mangaTitle);
        });
    }

    public static getMigratable(entries: TMigrationEntry[]): MigratableEntry[] {
        return Object.values(entries).filter(
            (entry): entry is MigratableEntry =>
                MigrationEntries.hasStatus(
                    entry,
                    MigrationEntryStatus.SEARCH_COMPLETE,
                    MigrationEntryStatus.MIGRATING,
                ) &&
                !entry.isExcluded &&
                entry.selectedMatchMangaId != null &&
                entry.selectedMatchSourceId != null,
        );
    }
}
