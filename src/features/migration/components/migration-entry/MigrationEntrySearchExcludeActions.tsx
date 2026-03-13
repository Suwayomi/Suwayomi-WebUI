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
import { CustomButtonIcon } from '@/base/components/buttons/CustomButtonIcon.tsx';
import { ReactRouter } from '@/lib/react-router/ReactRouter.ts';
import { AppRoutes } from '@/base/AppRoute.constants.ts';
import { MigrationManager } from '@/features/migration/MigrationManager.ts';
import IconButton from '@mui/material/IconButton';
import { useLingui } from '@lingui/react/macro';
import Stack from '@mui/material/Stack';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import Button from '@mui/material/Button';
import { plural } from '@lingui/core/macro';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ButtonGroup from '@mui/material/ButtonGroup';

export const MigrationEntrySearchExcludeActions = ({
    hasResults,
    otherResultsCount,
    isExpanded,
    setIsExpanded,
    isExcluded,
    mangaId,
    mangaTitle,
}: {
    hasResults: boolean;
    otherResultsCount: number;
    isExpanded: boolean;
    setIsExpanded: (expanded: boolean) => void;
    isExcluded: boolean;
    mangaId: MangaIdInfo['id'];
    mangaTitle: string;
}) => {
    const { t } = useLingui();
    const isTabletWidth = MediaQuery.useIsTabletWidth();

    if (isTabletWidth) {
        if (!hasResults) {
            return;
        }

        return (
            <ButtonGroup variant="contained">
                {!!otherResultsCount && (
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
                {!isExpanded && (
                    <CustomTooltip title={t`Manual search`}>
                        <CustomButtonIcon
                            sx={{
                                flexGrow: Number(!otherResultsCount),
                            }}
                            onClick={() => {
                                ReactRouter.navigate(
                                    AppRoutes.migrate.childRoutes.manualSearch.path(mangaId, mangaTitle),
                                    {
                                        state: { mangaTitle: mangaTitle },
                                    },
                                );
                            }}
                        >
                            <SearchIcon />
                        </CustomButtonIcon>
                    </CustomTooltip>
                )}
                <CustomTooltip title={isExcluded ? t`Include` : t`Exclude`}>
                    <CustomButtonIcon
                        sx={{
                            flexGrow: Number(!otherResultsCount),
                        }}
                        onClick={() =>
                            isExcluded ? MigrationManager.includeManga(mangaId) : MigrationManager.excludeManga(mangaId)
                        }
                    >
                        {isExcluded ? <AddIcon /> : <CloseIcon />}
                    </CustomButtonIcon>
                </CustomTooltip>
            </ButtonGroup>
        );
    }

    return (
        <Stack sx={{ gap: 1, justifyContent: 'center' }}>
            <CustomTooltip title={isExcluded ? t`Include` : t`Exclude`} placement="auto">
                <IconButton
                    onClick={() =>
                        isExcluded ? MigrationManager.includeManga(mangaId) : MigrationManager.excludeManga(mangaId)
                    }
                >
                    {isExcluded ? <AddIcon /> : <CloseIcon />}
                </IconButton>
            </CustomTooltip>
            <CustomTooltip title={t`Manual search`} placement="auto">
                <IconButton
                    onClick={() => {
                        ReactRouter.navigate(AppRoutes.migrate.childRoutes.manualSearch.path(mangaId, mangaTitle));
                    }}
                >
                    <SearchIcon />
                </IconButton>
            </CustomTooltip>
        </Stack>
    );
};
