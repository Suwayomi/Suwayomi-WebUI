/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { MigrationMatch, TMigrationEntry } from '@/features/migration/Migration.types.ts';
import { MigrationManager } from '@/features/migration/MigrationManager.ts';
import Paper from '@mui/material/Paper';
import { useMemo } from 'react';
import { MediaQuery } from '@/base/utils/MediaQuery.tsx';
import { applyStyles } from '@/base/utils/ApplyStyles.ts';
import { MigrationSourceEntry } from '@/features/migration/components/migration-entry/MigrationSourceEntry.tsx';
import { MigrationDestinationEntry } from '@/features/migration/components/migration-entry/MigrationDestinationEntry.tsx';
import { ReactRouter } from '@/lib/react-router/ReactRouter.ts';
import { AppRoutes } from '@/base/AppRoute.constants.ts';
import { MigrationMatchedEntry } from '@/features/migration/components/migration-entry/MigrationMatchedEntry.tsx';
import { MigrationEntrySearchExcludeActions } from '@/features/migration/components/migration-entry/MigrationEntrySearchExcludeActions.tsx';
import Typography from '@mui/material/Typography';
import { useLingui } from '@lingui/react/macro';
import Stack from '@mui/material/Stack';
import SearchIcon from '@mui/icons-material/Search';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';
import { MigrationEntryStatusIndicator } from '@/features/migration/components/migration-entry/MigrationEntryStatusIndicator.tsx';
import Box from '@mui/material/Box';

const MigrationEntryMobile = ({
    entry,
    entry: { mangaId, mangaTitle, status, error, isExcluded },
    destinationEntry,
    otherSearchMatches,
    isExpanded,
    setIsExpanded,
    isMigrating,
}: {
    entry: TMigrationEntry;
    destinationEntry: MigrationMatch | undefined;
    otherSearchMatches: MigrationMatch[];
    isExpanded: boolean;
    setIsExpanded: (expanded: boolean) => void;
    isMigrating: boolean;
}) => {
    const { t } = useLingui();

    return (
        <>
            <MigrationSourceEntry {...entry} />
            <MigrationDestinationEntry
                sourceMangaId={mangaId}
                sourceMangaTitle={mangaTitle}
                entry={destinationEntry}
                status={status}
                otherResultsCount={otherSearchMatches.length}
                isExpanded={isExpanded}
                setIsExpanded={setIsExpanded}
                isMigrating={isMigrating}
                error={error}
            />

            <Collapse in={isExpanded} unmountOnExit>
                <Divider sx={{ mb: 1 }} />
                <Stack sx={{ flexDirection: 'row', gap: 1, alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="h6" component="h2">{t`Matches`}</Typography>
                    <Button
                        startIcon={<SearchIcon />}
                        variant="text"
                        onClick={() => {
                            ReactRouter.navigate(AppRoutes.migrate.childRoutes.manualSearch.path(mangaId, mangaTitle), {
                                state: { mangaTitle: mangaTitle },
                            });
                        }}
                    >{t`Manual search`}</Button>
                </Stack>
                <Stack sx={{ pt: 2 }}>
                    {otherSearchMatches.map((searchMatch) => {
                        if (destinationEntry?.id === searchMatch.id) {
                            return null;
                        }

                        return (
                            <MigrationMatchedEntry key={searchMatch.id} sourceMangaId={mangaId} entry={searchMatch} />
                        );
                    })}
                </Stack>
            </Collapse>

            {!isMigrating && (
                <MigrationEntrySearchExcludeActions
                    hasResults={!!destinationEntry}
                    otherResultsCount={otherSearchMatches.length}
                    isExpanded={isExpanded}
                    setIsExpanded={setIsExpanded}
                    isExcluded={isExcluded}
                    mangaId={mangaId}
                    mangaTitle={mangaTitle}
                />
            )}
        </>
    );
};

export const MigrationEntryDesktop = ({
    entry,
    entry: { mangaId, mangaTitle, status, error },
    destinationEntry,
    otherSearchMatches,
    isExpanded,
    setIsExpanded,
    isMigrating,
}: {
    entry: TMigrationEntry;
    destinationEntry: MigrationMatch | undefined;
    otherSearchMatches: MigrationMatch[];
    isExpanded: boolean;
    setIsExpanded: (expanded: boolean) => void;
    isMigrating: boolean;
}) => {
    const { t } = useLingui();

    return (
        <>
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                <MigrationSourceEntry {...entry} />

                <Box sx={{ display: 'flex', alignItems: 'stretch', gap: 2 }}>
                    <Box sx={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                        <MigrationEntryStatusIndicator status={status} hasResults={!!destinationEntry} />
                        <MigrationDestinationEntry
                            sourceMangaId={mangaId}
                            sourceMangaTitle={mangaTitle}
                            entry={destinationEntry}
                            status={status}
                            otherResultsCount={otherSearchMatches.length}
                            isExpanded={isExpanded}
                            setIsExpanded={setIsExpanded}
                            isMigrating={isMigrating}
                            error={error}
                        />
                    </Box>

                    {!isMigrating && (
                        <MigrationEntrySearchExcludeActions
                            hasResults={!!destinationEntry}
                            otherResultsCount={otherSearchMatches.length}
                            isExpanded={isExpanded}
                            setIsExpanded={setIsExpanded}
                            isExcluded={entry.isExcluded}
                            mangaId={entry.mangaId}
                            mangaTitle={entry.mangaTitle}
                        />
                    )}
                </Box>
            </Box>

            <Collapse in={isExpanded && !isMigrating} unmountOnExit>
                <Divider sx={{ my: 4 }} />
                <Typography variant="h6" component="h2">{t`Matches`}</Typography>
                <Stack sx={{ pt: 2 }}>
                    {otherSearchMatches.map((searchMatch) => {
                        if (destinationEntry?.id === searchMatch.id) {
                            return null;
                        }

                        return (
                            <MigrationMatchedEntry
                                key={searchMatch.id}
                                sourceMangaId={entry.mangaId}
                                entry={searchMatch}
                            />
                        );
                    })}
                </Stack>
            </Collapse>
        </>
    );
};

export const MigrationEntry = ({ entry: propEntry, isMigrating }: { entry: TMigrationEntry; isMigrating: boolean }) => {
    const isTabletWidth = MediaQuery.useIsTabletWidth();

    const entry = useMemo(() => MigrationManager.getUpToDateMigrationEntry(propEntry), [propEntry]);

    const destinationEntry = useMemo(() => {
        const match = entry.searchMatches.find((matchEntry) => matchEntry.id === entry.selectedMatchMangaId);
        const manualMatch = entry.manualMatches.find((matchEntry) => matchEntry.id === entry.selectedMatchMangaId);

        return match ?? manualMatch;
    }, [entry.searchMatches, entry.selectedMatchMangaId]);
    const otherMatches = useMemo(
        () =>
            entry.searchMatches
                .filter((searchMatch) => searchMatch.id !== entry.selectedMatchMangaId)
                .sort((a, b) => (b.latestChapterNumber ?? 0) - (a.latestChapterNumber ?? 0)),
        [entry.searchMatches, entry.selectedMatchMangaId],
    );

    const MigrationComponent = useMemo(
        () => (isTabletWidth ? MigrationEntryMobile : MigrationEntryDesktop),
        [isTabletWidth],
    );

    return (
        <Paper
            sx={{
                opacity: !isMigrating && entry.isExcluded ? 0.5 : 1,
                ...applyStyles(isTabletWidth, {
                    flexDirection: 'column',
                    display: 'flex',
                    p: 2,
                    gap: 2,
                }),
                ...applyStyles(!isTabletWidth, {
                    px: 2,
                    py: 2,
                    pr: 6,
                }),
            }}
        >
            <MigrationComponent
                entry={entry}
                destinationEntry={destinationEntry}
                isExpanded={entry.areMatchesExpanded}
                setIsExpanded={() =>
                    MigrationManager.setEntryMatchesExpandState(entry.mangaId, !entry.areMatchesExpanded)
                }
                otherSearchMatches={otherMatches}
                isMigrating={isMigrating}
            />
        </Paper>
    );
};
