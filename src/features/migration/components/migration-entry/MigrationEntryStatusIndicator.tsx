/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { MediaQuery } from '@/base/utils/MediaQuery.tsx';
import { MigrationEntryStatus } from '@/features/migration/Migration.types.ts';
import { LoadingPlaceholder } from '@/base/components/feedback/LoadingPlaceholder.tsx';
import Box from '@mui/material/Box';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import type { ReactNode } from 'react';
import type { Theme } from '@mui/material/styles';
import type { SystemCssProperties } from '@mui/system/styleFunctionSx';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import CheckIcon from '@mui/icons-material/Check';

const StatusIndicatorWrapper = ({
    backgroundColor,
    statusIcon,
}: {
    backgroundColor: SystemCssProperties<Theme>['backgroundColor'];
    statusIcon: ReactNode;
}) => {
    const isTabletWidth = MediaQuery.useIsTabletWidth();

    return (
        <Box
            sx={{
                display: 'inline-flex',
                backgroundColor,
                p: isTabletWidth ? 0 : 0.5,
                m: 0,
                borderRadius: isTabletWidth ? 100 : 2,
            }}
        >
            {statusIcon}
        </Box>
    );
};
export const MigrationEntryStatusIndicator = ({
    status,
    hasResults,
}: {
    status: MigrationEntryStatus;
    hasResults: boolean;
}) => {
    const isTabletWidth = MediaQuery.useIsTabletWidth();

    if ([MigrationEntryStatus.SEARCHING, MigrationEntryStatus.MIGRATING].includes(status)) {
        return <LoadingPlaceholder size={isTabletWidth ? 22 : 32} />;
    }

    if ([MigrationEntryStatus.SEARCH_FAILED, MigrationEntryStatus.MIGRATION_FAILED].includes(status)) {
        return (
            <StatusIndicatorWrapper
                backgroundColor={(theme) => theme.palette.error.main}
                statusIcon={
                    <PriorityHighIcon
                        fontSize={isTabletWidth ? undefined : 'large'}
                        sx={{ color: 'error.contrastText' }}
                    />
                }
            />
        );
    }

    if (status === MigrationEntryStatus.NO_MATCH) {
        return (
            <StatusIndicatorWrapper
                backgroundColor={(theme) => theme.palette.warning.main}
                statusIcon={
                    <PriorityHighIcon
                        fontSize={isTabletWidth ? undefined : 'large'}
                        sx={{ color: 'warning.contrastText' }}
                    />
                }
            />
        );
    }

    if (status === MigrationEntryStatus.MIGRATION_COMPLETE) {
        return (
            <StatusIndicatorWrapper
                backgroundColor="primary.dark"
                statusIcon={
                    <CheckIcon fontSize={isTabletWidth ? undefined : 'large'} sx={{ color: 'primary.contrastText' }} />
                }
            />
        );
    }

    if (hasResults) {
        return (
            <StatusIndicatorWrapper
                backgroundColor="primary.dark"
                statusIcon={
                    <ArrowForwardIcon
                        fontSize={isTabletWidth ? undefined : 'large'}
                        sx={{ color: 'primary.contrastText' }}
                    />
                }
            />
        );
    }

    return null;
};
