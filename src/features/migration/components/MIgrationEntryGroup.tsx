/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { MigrationEntryStatus, TMigrationEntry } from '@/features/migration/Migration.types.ts';
import type { ButtonProps } from '@mui/material/Button';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import Stack from '@mui/material/Stack';
import {} from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { MigrationEntry } from '@/features/migration/components/migration-entry/MigrationEntry.tsx';
import { MigrationManager } from '@/features/migration/MigrationManager.ts';

export const MigrationEntryGroup = ({
    status,
    title,
    entries,
    color,
    isMigrating = false,
}: {
    status: MigrationEntryStatus;
    title: string;
    entries: TMigrationEntry[];
    color: ButtonProps['color'];
    isMigrating?: boolean;
}) => {
    const isExpanded = MigrationManager.useGroupExpandState(status);

    if (!entries.length) {
        return null;
    }

    return (
        <Stack sx={{ width: '100%', gap: 2 }}>
            <Button
                onClick={() => MigrationManager.setGroupExpandState(status, !isExpanded)}
                color={color}
                variant="outlined"
                startIcon={isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                size="large"
                sx={{
                    py: 2,
                    justifyContent: 'center',
                    '& .MuiButton-startIcon': {
                        position: 'absolute',
                        left: (theme) => theme.spacing(4),
                        margin: 0,
                    },
                }}
            >
                {title}
            </Button>
            <Collapse in={isExpanded} unmountOnExit>
                <Stack sx={{ gap: 1 }}>
                    {entries.map((entry) => (
                        <MigrationEntry key={entry.mangaId} entry={entry} isMigrating={isMigrating} />
                    ))}
                </Stack>
            </Collapse>
        </Stack>
    );
};
