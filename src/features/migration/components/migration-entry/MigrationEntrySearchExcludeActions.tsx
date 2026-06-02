/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { MangaIdInfo } from '@/features/manga/Manga.types.ts';
import { MediaQuery } from '@/base/utils/MediaQuery.tsx';
import { CustomTooltip } from '@/base/components/CustomTooltip.tsx';
import { CustomIconButton } from '@/base/components/buttons/CustomIconButton.tsx';
import { MigrationManager } from '@/features/migration/MigrationManager.ts';
import IconButton from '@mui/material/IconButton';
import { useLingui } from '@lingui/react/macro';
import Stack from '@mui/material/Stack';
import SearchIcon from '@mui/icons-material/Search';
import Button from '@mui/material/Button';
import { plural } from '@lingui/core/macro';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ButtonGroup from '@mui/material/ButtonGroup';
import RemoveCircleOutlineOutlinedIcon from '@mui/icons-material/RemoveCircleOutlineOutlined';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';

export const MigrationEntrySearchExcludeActions = ({
    hasSelectedMatch,
    otherResultsCount,
    isExpanded,
    setIsExpanded,
    isExcluded,
    mangaId,
    mangaTitle,
    isAbortable,
    isMigrating,
}: {
    hasSelectedMatch: boolean;
    otherResultsCount: number;
    isExpanded: boolean;
    setIsExpanded: (expanded: boolean) => void;
    isExcluded: boolean;
    mangaId: MangaIdInfo['id'];
    mangaTitle: string;
    isAbortable: boolean;
    isMigrating: boolean;
}) => {
    const { t } = useLingui();
    const isTabletWidth = MediaQuery.useIsTabletWidth();

    if (isTabletWidth) {
        return (
            <ButtonGroup variant="contained">
                {!isMigrating && !!otherResultsCount && (
                    <Button
                        sx={{ flexGrow: 1 }}
                        startIcon={isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        {plural(otherResultsCount, {
                            one: '# more match',
                            other: '# more matches',
                        })}
                    </Button>
                )}
                {!isMigrating && !isExpanded && (
                    <CustomTooltip title={t`Manual search`}>
                        <CustomIconButton
                            sx={{
                                flexGrow: Number(!otherResultsCount),
                            }}
                            onClick={() => {
                                MigrationManager.openManualSearch(mangaId, mangaTitle);
                            }}
                        >
                            <SearchIcon />
                        </CustomIconButton>
                    </CustomTooltip>
                )}
                {!isMigrating && hasSelectedMatch && (
                    <CustomTooltip title={isExcluded ? t`Include` : t`Exclude`}>
                        <CustomIconButton
                            sx={{
                                flexGrow: Number(!otherResultsCount),
                            }}
                            onClick={() =>
                                isExcluded
                                    ? MigrationManager.includeManga(mangaId)
                                    : MigrationManager.excludeManga(mangaId)
                            }
                        >
                            {isExcluded ? <AddCircleOutlineOutlinedIcon /> : <RemoveCircleOutlineOutlinedIcon />}
                        </CustomIconButton>
                    </CustomTooltip>
                )}
                {isAbortable && (
                    <CustomTooltip title={t`Abort`}>
                        <CustomIconButton
                            sx={{
                                flexGrow: Number(!otherResultsCount),
                            }}
                            onClick={() => MigrationManager.abortEntry(mangaId)}
                        >
                            <CancelOutlinedIcon />
                        </CustomIconButton>
                    </CustomTooltip>
                )}
            </ButtonGroup>
        );
    }

    return (
        <Stack sx={{ gap: 1, justifyContent: 'center' }}>
            {isAbortable && (
                <CustomTooltip title={t`Abort`} placement="auto">
                    <IconButton onClick={() => MigrationManager.abortEntry(mangaId)}>
                        <CancelOutlinedIcon />
                    </IconButton>
                </CustomTooltip>
            )}
            {!isMigrating && hasSelectedMatch && (
                <CustomTooltip title={isExcluded ? t`Include` : t`Exclude`} placement="auto">
                    <IconButton
                        onClick={() =>
                            isExcluded ? MigrationManager.includeManga(mangaId) : MigrationManager.excludeManga(mangaId)
                        }
                    >
                        {isExcluded ? <AddCircleOutlineOutlinedIcon /> : <RemoveCircleOutlineOutlinedIcon />}
                    </IconButton>
                </CustomTooltip>
            )}
            {!isMigrating && (
                <CustomTooltip title={t`Manual search`} placement="auto">
                    <IconButton
                        onClick={() => {
                            MigrationManager.openManualSearch(mangaId, mangaTitle);
                        }}
                    >
                        <SearchIcon />
                    </IconButton>
                </CustomTooltip>
            )}
        </Stack>
    );
};
