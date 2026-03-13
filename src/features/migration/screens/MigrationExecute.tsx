/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Stack from '@mui/material/Stack';
import { MigrationProgressBar } from '@/features/migration/components/MigrationProgressBar.tsx';
import { useLingui } from '@lingui/react/macro';
import { useAppTitleAndAction } from '@/features/navigation-bar/hooks/useAppTitleAndAction.ts';
import { MigrationManager } from '@/features/migration/MigrationManager.ts';
import { MigrationEntryStatus } from '@/features/migration/Migration.types.ts';
import { useMemo } from 'react';
import { DEFAULT_FULL_FAB_HEIGHT } from '@/base/components/buttons/StyledFab.tsx';
import { MigrationContinueButton } from '@/features/migration/components/MigrationContinueButton.tsx';
import { plural } from '@lingui/core/macro';
import { MigrationEntryGroup } from '@/features/migration/components/MIgrationEntryGroup.tsx';

export const MigrationExecute = () => {
    const { t } = useLingui();
    const entries = MigrationManager.useEntries();
    const progress = MigrationManager.useMigrationProgress();

    useAppTitleAndAction(MigrationManager.isPhaseComplete() ? t`Migration complete` : t`Migrating`, undefined, [
        MigrationManager.isPhaseComplete(),
    ]);

    const entryList = useMemo(() => Object.values(entries), [entries]);
    const migratingEntries = useMemo(
        () =>
            entryList.filter((entry) =>
                [MigrationEntryStatus.PENDING, MigrationEntryStatus.MIGRATING].includes(entry.status),
            ),
        [entryList],
    );
    const migratedEntries = useMemo(
        () => entryList.filter((entry) => entry.status === MigrationEntryStatus.MIGRATION_COMPLETE),
        [entryList],
    );
    const failedEntries = useMemo(
        () => entryList.filter((entry) => entry.status === MigrationEntryStatus.MIGRATION_FAILED),
        [entryList],
    );
    const excludedEntries = useMemo(() => entryList.filter((entry) => entry.isExcluded), [entryList]);
    const noMatchEntries = useMemo(
        () => entryList.filter((entry) => entry.status === MigrationEntryStatus.NO_MATCH),
        [entryList],
    );

    return (
        <>
            <MigrationProgressBar
                {...progress}
                label={t`${progress.completed} / ${progress.total}${progress.failed > 0 ? ` (${progress.failed} failed)` : ''}`}
            />

            <Stack
                direction="row"
                sx={{ p: 2, pb: DEFAULT_FULL_FAB_HEIGHT, gap: 4, flexWrap: 'wrap', justifyContent: 'center' }}
            >
                <MigrationEntryGroup
                    status={MigrationEntryStatus.MIGRATING}
                    title={plural(migratingEntries.length, {
                        one: '1 migrating entry',
                        other: '# migrating entries',
                    })}
                    entries={migratingEntries}
                    isMigrating
                    color="error"
                />
                <MigrationEntryGroup
                    status={MigrationEntryStatus.MIGRATION_FAILED}
                    title={plural(failedEntries.length, {
                        one: '1 failed entry',
                        other: '# failed entries',
                    })}
                    entries={failedEntries}
                    isMigrating
                    color="error"
                />
                <MigrationEntryGroup
                    status={MigrationEntryStatus.NO_MATCH}
                    title={plural(noMatchEntries.length, {
                        one: '1 entry with no match',
                        other: '# entries with no match',
                    })}
                    entries={noMatchEntries}
                    color="warning"
                    isMigrating
                />
                <MigrationEntryGroup
                    status={MigrationEntryStatus.EXCLUDED}
                    title={plural(excludedEntries.length, {
                        one: '1 excluded entry',
                        other: '# excluded entries',
                    })}
                    entries={excludedEntries}
                    color="info"
                    isMigrating
                />
                <MigrationEntryGroup
                    status={MigrationEntryStatus.MIGRATION_COMPLETE}
                    title={plural(migratedEntries.length, {
                        one: '1 migrated entry',
                        other: '# migrated entries',
                    })}
                    entries={migratedEntries}
                    color="success"
                    isMigrating
                />
            </Stack>

            <MigrationContinueButton
                title={MigrationManager.isPhaseComplete() ? t`Done` : t`Abort`}
                onClick={() =>
                    MigrationManager.isPhaseComplete() ? MigrationManager.reset() : MigrationManager.abort()
                }
            />
        </>
    );
};
