/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import List from '@mui/material/List';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import SortByAlphaIcon from '@mui/icons-material/SortByAlpha';
import TagIcon from '@mui/icons-material/Tag';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { useLingui } from '@lingui/react/macro';
import { CustomTooltip } from '@/base/components/CustomTooltip.tsx';
import { LoadingPlaceholder } from '@/base/components/feedback/LoadingPlaceholder.tsx';
import { EmptyViewAbsoluteCentered } from '@/base/components/feedback/EmptyViewAbsoluteCentered.tsx';
import { MigrationCard } from '@/features/migration/components/MigrationCard.tsx';
import { StyledGroupItemWrapper } from '@/base/components/virtuoso/StyledGroupItemWrapper.tsx';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import { sortByToTranslation, sortOrderToTranslation } from '@/features/migration/Migration.constants.ts';
import {
    createUpdateMetadataServerSettings,
    useMetadataServerSettings,
} from '@/features/settings/services/ServerSettingsMetadata.ts';
import { makeToast } from '@/base/utils/Toast.ts';
import { useNavBarContext } from '@/features/navigation-bar/NavbarContext.tsx';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';
import { Sources } from '@/features/source/services/Sources';

export const MigrationSelectSource = ({ tabsMenuHeight }: { tabsMenuHeight: number }) => {
    const { t } = useLingui();
    const { appBarHeight } = useNavBarContext();

    const {
        settings: { migrateSortSettings },
    } = useMetadataServerSettings();
    const updateMetadataServerSettings = createUpdateMetadataServerSettings<'migrateSortSettings'>((e) =>
        makeToast(t`Failed to save changes`, 'error', getErrorMessage(e)),
    );

    const { sortBy, sortOrder } = migrateSortSettings;

    const {
        sources: migratableSources,
        request: { loading, error, refetch },
    } = Sources.useGetMigratableSources(migrateSortSettings);

    if (loading) {
        return <LoadingPlaceholder />;
    }

    if (error) {
        return (
            <EmptyViewAbsoluteCentered
                message={t`Unable to load data`}
                messageExtra={getErrorMessage(error)}
                retry={() => refetch().catch(defaultPromiseErrorHandler('Migration::refetch'))}
            />
        );
    }

    return (
        <>
            <Stack
                sx={{
                    position: 'sticky',
                    top: `${appBarHeight + tabsMenuHeight}px`,
                    flexDirection: 'row',
                    justifyContent: 'end',
                    alignItems: 'center',
                    gap: 1,
                    p: 1,
                    backgroundColor: 'background.default',
                    zIndex: 1,
                }}
            >
                <CustomTooltip title={t(sortByToTranslation[sortBy])}>
                    <IconButton
                        color="inherit"
                        onClick={() =>
                            updateMetadataServerSettings('migrateSortSettings', { sortBy: (sortBy + 1) % 2, sortOrder })
                        }
                    >
                        {sortBy ? <TagIcon /> : <SortByAlphaIcon />}
                    </IconButton>
                </CustomTooltip>
                <CustomTooltip title={t(sortOrderToTranslation[sortOrder])}>
                    <IconButton
                        color="inherit"
                        onClick={() =>
                            updateMetadataServerSettings('migrateSortSettings', {
                                sortBy,
                                sortOrder: (sortOrder + 1) % 2,
                            })
                        }
                    >
                        {sortOrder ? <ArrowDownwardIcon /> : <ArrowUpwardIcon />}
                    </IconButton>
                </CustomTooltip>
            </Stack>
            <List sx={{ p: 0 }}>
                {migratableSources.map((migratableSource) => (
                    <StyledGroupItemWrapper key={migratableSource.id}>
                        <MigrationCard {...migratableSource} />
                    </StyledGroupItemWrapper>
                ))}
            </List>
        </>
    );
};
