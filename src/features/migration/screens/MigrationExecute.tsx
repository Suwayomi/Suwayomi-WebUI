/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import { useLingui } from '@lingui/react/macro';
import { useAppTitleAndAction } from '@/features/navigation-bar/hooks/useAppTitleAndAction.ts';
import { MigrationManager } from '@/features/migration/MigrationManager.ts';
import { MigrationEntryRow } from '@/features/migration/components/MigrationEntryRow.tsx';
import { MigrationProgressBar } from '@/features/migration/components/MigrationProgressBar.tsx';

export const MigrationExecute = () => {
    const { t } = useLingui();
    const entries = MigrationManager.useEntries();
    const progress = MigrationManager.useMigrationProgress();

    useAppTitleAndAction(t`Migrating`, undefined, []);

    const entryList = Object.values(entries);

    return (
        <>
            <MigrationProgressBar
                completed={progress.completed}
                total={progress.total}
                label={t`${progress.completed} / ${progress.total}${progress.failed > 0 ? ` (${progress.failed} failed)` : ''}`}
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
                    justifyContent: 'flex-end',
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
            </Stack>
        </>
    );
};
