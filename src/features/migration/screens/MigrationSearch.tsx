/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useLingui } from '@lingui/react/macro';
import { useAppTitleAndAction } from '@/features/navigation-bar/hooks/useAppTitleAndAction.ts';
import { MigrationManager } from '@/features/migration/MigrationManager.ts';
import { MigrationProgressBar } from '@/features/migration/components/MigrationProgressBar.tsx';
import { MigrationOptionsDialog } from '@/features/migration/components/MigrationOptionsDialog.tsx';
import { MigrationContinueButton } from '@/features/migration/components/MigrationContinueButton.tsx';
import { AwaitableComponent } from 'awaitable-component';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import { DEFAULT_FULL_FAB_HEIGHT } from '@/base/components/buttons/StyledFab.tsx';
import { useMemo } from 'react';
import Stack from '@mui/material/Stack';
import { MigrationEntryStatus } from '@/features/migration/Migration.types.ts';
import { MigrationEntryGroup } from '@/features/migration/components/MIgrationEntryGroup.tsx';
import { plural } from '@lingui/core/macro';

export const MigrationSearch = () => {
    const { t } = useLingui();
    const entries = MigrationManager.useEntries();
    const searchProgress = MigrationManager.useSearchProgress();

    const isSearchComplete = searchProgress.completed === searchProgress.total && searchProgress.total > 0;

    useAppTitleAndAction(t`Search results`, undefined, []);

    const entryList = useMemo(() => Object.values(entries), [entries]);
    const searchingEntries = useMemo(
        () => entryList.filter((entry) => entry.status === MigrationEntryStatus.SEARCHING),
        [entryList],
    );
    const failedEntries = useMemo(
        () => entryList.filter((entry) => entry.status === MigrationEntryStatus.SEARCH_FAILED),
        [entryList],
    );
    const noMatchEntries = useMemo(
        () => entryList.filter((entry) => entry.status === MigrationEntryStatus.NO_MATCH),
        [entryList],
    );
    const matchedEntries = useMemo(
        () => entryList.filter((entry) => entry.status === MigrationEntryStatus.SEARCH_COMPLETE),
        [entryList],
    );

    const hasMigratableEntries = useMemo(() => !!MigrationManager.getMigratableEntries().length, [entryList]);

    return (
        <>
            <MigrationProgressBar
                {...searchProgress}
                label={t`${searchProgress.completed} / ${searchProgress.total}`}
            />

            <Stack
                direction="row"
                sx={{ p: 2, pb: DEFAULT_FULL_FAB_HEIGHT, gap: 4, flexWrap: 'wrap', justifyContent: 'center' }}
            >
                <MigrationEntryGroup
                    status={MigrationEntryStatus.SEARCHING}
                    title={plural(searchingEntries.length, {
                        one: '1 searching',
                        other: '# searching',
                    })}
                    entries={searchingEntries}
                    color="error"
                />
                <MigrationEntryGroup
                    status={MigrationEntryStatus.SEARCH_FAILED}
                    title={plural(failedEntries.length, {
                        one: '1 failed entry',
                        other: '# failed entries',
                    })}
                    entries={failedEntries}
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
                />
                <MigrationEntryGroup
                    status={MigrationEntryStatus.SEARCH_COMPLETE}
                    title={plural(matchedEntries.length, {
                        one: '1 matched entry',
                        other: '# matched entries',
                    })}
                    entries={matchedEntries}
                    color="success"
                />
            </Stack>
            <MigrationContinueButton
                title={t`Start migration`}
                isDisabled={!isSearchComplete || !hasMigratableEntries}
                onClick={async () => {
                    try {
                        const options = await AwaitableComponent.show(MigrationOptionsDialog);
                        await MigrationManager.startMigration(options);
                    } catch (e) {
                        defaultPromiseErrorHandler('MigrationSearch')(e);
                    }
                }}
            />
        </>
    );
};
