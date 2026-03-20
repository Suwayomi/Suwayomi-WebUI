/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Box from '@mui/material/Box';
import { useLingui } from '@lingui/react/macro';
import { useAppTitleAndAction } from '@/features/navigation-bar/hooks/useAppTitleAndAction.ts';
import { MigrationManager } from '@/features/migration/MigrationManager.ts';
import { MigrationEntryRow } from '@/features/migration/components/MigrationEntryRow.tsx';
import { MigrationProgressBar } from '@/features/migration/components/MigrationProgressBar.tsx';
import { MigrationOptionsDialog } from '@/features/migration/components/MigrationOptionsDialog.tsx';
import { MigrationContinueButton } from '@/features/migration/components/MigrationContinueButton.tsx';
import { AwaitableComponent } from 'awaitable-component';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import { DEFAULT_FULL_FAB_HEIGHT } from '@/base/components/buttons/StyledFab.tsx';

export const MigrationSearch = () => {
    const { t } = useLingui();
    const entries = MigrationManager.useEntries();
    const searchProgress = MigrationManager.useSearchProgress();

    const isSearchComplete = searchProgress.completed === searchProgress.total && searchProgress.total > 0;

    useAppTitleAndAction(t`Search results`, undefined, []);

    const entryList = Object.values(entries);

    return (
        <>
            <MigrationProgressBar
                completed={searchProgress.completed}
                total={searchProgress.total}
                label={t`${searchProgress.completed} / ${searchProgress.total}`}
            />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, p: 1, pb: DEFAULT_FULL_FAB_HEIGHT }}>
                {entryList.map((entry) => (
                    <MigrationEntryRow key={entry.mangaId} entry={entry} />
                ))}
            </Box>
            <MigrationContinueButton
                title={t`Start migration`}
                isDisabled={!isSearchComplete}
                onClick={() => {
                    AwaitableComponent.show(MigrationOptionsDialog).catch(
                        defaultPromiseErrorHandler('MigrationSearch'),
                    );
                }}
            />
        </>
    );
};
