/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useState } from 'react';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import { useLingui } from '@lingui/react/macro';
import { useAppTitleAndAction } from '@/features/navigation-bar/hooks/useAppTitleAndAction.ts';
import {
    MigrationManager,
    useMigrationEntries,
    useMigrationSearchProgress,
} from '@/features/migration/MigrationManager.ts';
import { MigrationEntryRow } from '@/features/migration/components/MigrationEntryRow.tsx';
import { MigrationProgressBar } from '@/features/migration/components/MigrationProgressBar.tsx';
import { MigrationOptionsDialog } from '@/features/migration/components/MigrationOptionsDialog.tsx';

export const MigrationSearch = () => {
    const { t } = useLingui();
    const entries = useMigrationEntries();
    const searchProgress = useMigrationSearchProgress();
    const [showOptionsDialog, setShowOptionsDialog] = useState(false);

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
            <Box sx={{ p: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                {entryList.map((entry) => (
                    <MigrationEntryRow key={entry.mangaId} entry={entry} />
                ))}
            </Box>
            <Stack
                direction="row"
                sx={{
                    position: 'sticky',
                    bottom: 0,
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: 2,
                    backgroundColor: 'background.paper',
                    borderTop: 1,
                    borderColor: 'divider',
                    zIndex: 1,
                }}
            >
                <Button variant="outlined" color="error" onClick={() => MigrationManager.abort()}>
                    {t`Abort`}
                </Button>
                <Button variant="contained" disabled={!isSearchComplete} onClick={() => setShowOptionsDialog(true)}>
                    {t`Start Migration`}
                </Button>
            </Stack>

            {showOptionsDialog && <MigrationOptionsDialog onClose={() => setShowOptionsDialog(false)} />}
        </>
    );
};
