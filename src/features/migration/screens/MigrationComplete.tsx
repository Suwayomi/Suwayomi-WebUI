/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useLingui } from '@lingui/react/macro';
import { useAppTitleAndAction } from '@/features/navigation-bar/hooks/useAppTitleAndAction.ts';
import { MigrationManager } from '@/features/migration/MigrationManager.ts';
import { MigrationEntryStatus } from '@/features/migration/Migration.types.ts';
import { MigrationEntryRow } from '@/features/migration/components/MigrationEntryRow.tsx';

export const MigrationComplete = () => {
    const { t } = useLingui();
    const entries = MigrationManager.useEntries();

    useAppTitleAndAction(t`Migration complete`, undefined, []);

    const entryList = Object.values(entries);
    const migrated = entryList.filter((e) => e.status === MigrationEntryStatus.MIGRATED).length;
    const failed = entryList.filter((e) => e.status === MigrationEntryStatus.MIGRATION_FAILED).length;
    const excluded = entryList.filter((e) => e.isExcluded).length;
    const noMatch = entryList.filter((e) => e.status === MigrationEntryStatus.NO_MATCH).length;

    const failedEntries = entryList.filter((e) => e.status === MigrationEntryStatus.MIGRATION_FAILED);

    return (
        <>
            <Stack sx={{ p: 3, gap: 2, alignItems: 'center' }}>
                <Typography variant="h5">{t`Migration complete`}</Typography>
                <Stack direction="row" sx={{ gap: 3, flexWrap: 'wrap', justifyContent: 'center' }}>
                    <Typography variant="body1" color="success.main">
                        {t`${migrated} migrated`}
                    </Typography>
                    {failed > 0 && (
                        <Typography variant="body1" color="error.main">
                            {t`${failed} failed`}
                        </Typography>
                    )}
                    {excluded > 0 && (
                        <Typography variant="body1" color="text.secondary">
                            {t`${excluded} excluded`}
                        </Typography>
                    )}
                    {noMatch > 0 && (
                        <Typography variant="body1" color="warning.main">
                            {t`${noMatch} no match`}
                        </Typography>
                    )}
                </Stack>
            </Stack>

            {failedEntries.length > 0 && (
                <Box sx={{ p: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography variant="subtitle2" sx={{ px: 1 }}>
                        {t`Failed entries`}
                    </Typography>
                    {failedEntries.map((entry) => (
                        <MigrationEntryRow key={entry.mangaId} entry={entry} />
                    ))}
                </Box>
            )}

            <Stack
                direction="row"
                sx={{
                    position: 'sticky',
                    bottom: 0,
                    justifyContent: 'center',
                    p: 2,
                    backgroundColor: 'background.paper',
                    borderTop: 1,
                    borderColor: 'divider',
                    zIndex: 1,
                }}
            >
                <Button variant="contained" onClick={() => MigrationManager.reset()}>
                    {t`Done`}
                </Button>
            </Stack>
        </>
    );
};
