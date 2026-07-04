/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import { useNavBarContext } from '@/features/navigation-bar/NavbarContext.tsx';
import type { MigrationProgress } from '@/features/migration/Migration.types.ts';

export const MigrationProgressBar = ({
    completed,
    total,
    label,
}: {
    label: string;
} & MigrationProgress) => {
    const { appBarHeight } = useNavBarContext();

    const progress = total > 0 ? (completed / total) * 100 : 0;

    if (completed === total) {
        return null;
    }

    return (
        <Box
            sx={{
                position: 'sticky',
                top: appBarHeight,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                px: 2,
                py: 1,
                backgroundColor: 'background.default',
                zIndex: 1,
            }}
        >
            <Box sx={{ flexGrow: 1 }}>
                <LinearProgress variant="determinate" value={progress} />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ minWidth: 'fit-content' }}>
                {label}
            </Typography>
        </Box>
    );
};
