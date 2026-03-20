/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { useLingui } from '@lingui/react/macro';
import type { MigrationEntry, MigrationSearchResult } from '@/features/migration/Migration.types.ts';
import { MigrationEntryStatus, MigrationPhase } from '@/features/migration/Migration.types.ts';
import { MigrationManager } from '@/features/migration/MigrationManager.ts';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { ListCardAvatar } from '@/base/components/lists/cards/ListCardAvatar.tsx';
import Paper from '@mui/material/Paper';
import { CustomTooltip } from '@/base/components/CustomTooltip.tsx';
import Stack from '@mui/material/Stack';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import { TypographyMaxLines } from '@/base/components/texts/TypographyMaxLines.tsx';
import { Mangas } from '@/features/manga/services/Mangas.ts';
import { ENTRY_STATUS_TRANSLATION } from '@/features/migration/Migration.constants.ts';
import CardActions from '@mui/material/CardActions';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Button from '@mui/material/Button';
import { plural } from '@lingui/core/macro';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Collapse from '@mui/material/Collapse';
import { useMemo, useState } from 'react';
import Divider from '@mui/material/Divider';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { alpha, styled } from '@mui/material/styles';
import type { MangaIdInfo } from '@/features/manga/Manga.types.ts';
import CardActionArea from '@mui/material/CardActionArea';
import { MUIUtil } from '@/lib/mui/MUI.util.ts';
import { LoadingPlaceholder } from '@/base/components/feedback/LoadingPlaceholder.tsx';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ReplayIcon from '@mui/icons-material/Replay';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import { AppRoutes } from '@/base/AppRoute.constants.ts';
import { Link } from 'react-router-dom';
import { ReactRouter } from '@/lib/react-router/ReactRouter.ts';

const EntryCard = styled(Card)(({ theme }) => ({
    backgroundColor: theme.palette.background.default,
    borderStyle: 'solid',
    borderWidth: 2,
    borderColor: theme.palette.divider,
}));

const EntryCardContent = styled(CardContent)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
    padding: theme.spacing(2),
    '&:last-child': {
        paddingBottom: theme.spacing(2),
    },
}));

const EntryMetadataText = (entry: Pick<MigrationSearchResult, 'artist' | 'author' | 'latestChapterNumber'>) => {
    const { t } = useLingui();

    const latestChapterNumber = (entry.latestChapterNumber ?? 0) > 1 ? entry.latestChapterNumber : t`Unknown`;
    const latestChapter = t`Latest: ${latestChapterNumber}`;

    const artist = entry.artist && `${entry.artist} - `;
    const author = entry.author && `${entry.author} - `;
    const isSameArtistAuthor = artist === author;
    const artistAuthor = isSameArtistAuthor ? artist : `${artist}${author}`;

    return (
        <Typography variant="body2" color="textSecondary">
            {artistAuthor}
            {latestChapter}
        </Typography>
    );
};

const MatchedEntry = ({ sourceMangaId, entry }: { sourceMangaId: MangaIdInfo['id']; entry: MigrationSearchResult }) => {
    const { t } = useLingui();

    return (
        <EntryCard sx={{ mb: 1 }}>
            <CardActionArea onClick={() => MigrationManager.selectMatch(sourceMangaId, entry.id, entry.sourceId)}>
                <EntryCardContent>
                    {(() => (
                        <>
                            <Link to={AppRoutes.manga.path(sourceMangaId)} style={{ textDecoration: 'none' }}>
                                <ListCardAvatar
                                    iconUrl={Mangas.getThumbnailUrl(entry)}
                                    alt={entry.title}
                                    slots={{
                                        avatarProps: {
                                            sx: {
                                                width: 'unset',
                                                height: 80,
                                                aspectRatio: '3 / 4',
                                            },
                                        },
                                    }}
                                />
                            </Link>
                            <Stack sx={{ minWidth: 0, flex: 1 }}>
                                <Typography variant="overline" color="textSecondary">
                                    {entry.sourceTitle}
                                </Typography>
                                <TypographyMaxLines variant="h6" component="h3" title={entry.title}>
                                    {entry.title}
                                </TypographyMaxLines>
                                <EntryMetadataText {...entry} />
                            </Stack>
                        </>
                    ))()}
                    {(() => (
                        <Button
                            variant="outlined"
                            {...MUIUtil.preventRippleProp({
                                onClick: () => MigrationManager.selectMatch(sourceMangaId, entry.id, entry.sourceId),
                            })}
                        >{t`Select`}</Button>
                    ))()}
                </EntryCardContent>
            </CardActionArea>
        </EntryCard>
    );
};

const DestinationEntry = ({
    entry,
    error,
    status,
    otherResultsCount,
    isExpanded,
    setIsExpanded,
}: {
    entry: MigrationSearchResult | undefined;
    error?: string;
    status: MigrationEntryStatus;
    otherResultsCount: number;
    isExpanded: boolean;
    setIsExpanded: (expanded: boolean) => void;
}) => {
    const { t } = useLingui();

    return (
        <EntryCard
            sx={{
                width: '400px',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
            }}
        >
            <EntryCardContent>
                {(() => {
                    if (!entry) {
                        return (
                            <Typography color={status === MigrationEntryStatus.NO_MATCH ? 'warning' : undefined}>
                                {t(ENTRY_STATUS_TRANSLATION[status])}
                            </Typography>
                        );
                    }

                    if (error) {
                        const { phase } = MigrationManager.getState();

                        const isSearchRetryable =
                            status === MigrationEntryStatus.SEARCH_FAILED && phase === MigrationPhase.SEARCHING;
                        const isMigrationRetryable =
                            status === MigrationEntryStatus.MIGRATION_FAILED && phase === MigrationPhase.MIGRATING;

                        const isRetryable = isSearchRetryable || isMigrationRetryable;

                        return (
                            <Stack sx={{ alignItems: 'center', gap: 2 }}>
                                <Typography color="error" title={error}>
                                    {error}
                                </Typography>
                                {isRetryable && (
                                    <Button
                                        sx={{ width: 'fit-content' }}
                                        variant="contained"
                                        color="error"
                                        startIcon={<ReplayIcon />}
                                        onClick={() =>
                                            MigrationManager.retryEntry(entry?.id).catch(
                                                defaultPromiseErrorHandler('MigrationEntryRow::retry'),
                                            )
                                        }
                                    >
                                        {t`Retry`}
                                    </Button>
                                )}
                            </Stack>
                        );
                    }

                    return (
                        <>
                            <Link to={AppRoutes.manga.path(entry.id)} style={{ textDecoration: 'none' }}>
                                <ListCardAvatar
                                    iconUrl={Mangas.getThumbnailUrl(entry)}
                                    alt={entry.title}
                                    slots={{
                                        avatarProps: {
                                            sx: {
                                                width: 'unset',
                                                height: 112,
                                                aspectRatio: '3 / 4',
                                            },
                                        },
                                    }}
                                />
                            </Link>
                            <Stack sx={{ minWidth: 0, flex: 1 }}>
                                <Typography
                                    variant="overline"
                                    color="textSecondary"
                                >{t`Destination - ${entry.sourceTitle}`}</Typography>
                                <TypographyMaxLines variant="h6" component="h3" title={entry.title}>
                                    {entry.title}
                                </TypographyMaxLines>
                                <EntryMetadataText {...entry} />
                            </Stack>
                        </>
                    );
                })()}
            </EntryCardContent>
            {!!otherResultsCount && (
                <CardActions
                    sx={{
                        p: 0,
                        backgroundColor: 'primary.dark',
                        '&:hover': {
                            backgroundColor: (theme) => alpha(theme.palette.primary.dark, 0.8),
                        },
                    }}
                >
                    <Button
                        sx={{
                            width: '100%',
                            borderRadius: 0,
                            color: 'primary.contrastText',
                        }}
                        variant="text"
                        startIcon={isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        {plural(otherResultsCount, {
                            one: '# more match found',
                            other: '# more matches found',
                        })}
                    </Button>
                </CardActions>
            )}
        </EntryCard>
    );
};

export const MigrationEntryRow = ({ entry }: { entry: MigrationEntry }) => {
    const { t } = useLingui();

    const [isExpanded, setIsExpanded] = useState(false);

    const destinationEntry = useMemo(() => {
        const searchResult = entry.searchResults.find((searchEntry) => searchEntry.id === entry.selectedMatchMangaId);
        const manualMatch = entry.manualMatches.find((matchEntry) => matchEntry.id === entry.selectedMatchMangaId);

        return searchResult ?? manualMatch;
    }, [entry.searchResults, entry.selectedMatchMangaId]);
    const otherSearchResults = useMemo(
        () =>
            entry.searchResults
                .filter((searchResult) => searchResult.id !== entry.selectedMatchMangaId)
                .sort((a, b) => (b.latestChapterNumber ?? 0) - (a.latestChapterNumber ?? 0)),
        [entry.searchResults, entry.selectedMatchMangaId],
    );

    const hasResults = !!destinationEntry;

    return (
        <Paper
            sx={{
                opacity: entry.isExcluded ? 0.5 : 1,
                px: 2,
                py: 2,
                pr: 6,
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '400px' }}>
                    <Link to={AppRoutes.manga.path(entry.mangaId)} style={{ textDecoration: 'none' }}>
                        <ListCardAvatar
                            iconUrl={requestManager.getValidImgUrlFor(entry.mangaThumbnailUrl ?? '')}
                            alt={entry.mangaTitle}
                            slots={{
                                avatarProps: {
                                    sx: {
                                        width: 'unset',
                                        height: 112,
                                        aspectRatio: '3 / 4',
                                    },
                                },
                            }}
                        />
                    </Link>
                    <Stack sx={{ minWidth: 0, flex: 1 }}>
                        <Typography
                            variant="overline"
                            color="textSecondary"
                        >{t`Source entry - ${entry.sourceTitle}`}</Typography>
                        <TypographyMaxLines variant="h6" component="h3" title={entry.mangaTitle}>
                            {entry.mangaTitle}
                        </TypographyMaxLines>
                        <EntryMetadataText
                            artist={entry.mangaArtist}
                            author={entry.mangaAuthor}
                            latestChapterNumber={entry.latestChapterNumber}
                        />
                    </Stack>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'stretch', gap: 2 }}>
                    <Box sx={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                        {(() => {
                            if (
                                [MigrationEntryStatus.SEARCHING, MigrationEntryStatus.MIGRATING].includes(entry.status)
                            ) {
                                return <LoadingPlaceholder size={32} />;
                            }

                            if (
                                [MigrationEntryStatus.SEARCH_FAILED, MigrationEntryStatus.MIGRATION_FAILED].includes(
                                    entry.status,
                                )
                            ) {
                                return (
                                    <Box
                                        sx={{
                                            display: 'inline-flex',
                                            backgroundColor: (theme) => theme.palette.error.main,
                                            p: 0.5,
                                            m: 0,
                                            borderRadius: 2,
                                        }}
                                    >
                                        <ErrorOutlineIcon fontSize="large" sx={{ color: 'error.contrastText' }} />
                                    </Box>
                                );
                            }

                            if (entry.status === MigrationEntryStatus.NO_MATCH) {
                                return (
                                    <Box
                                        sx={{
                                            display: 'inline-flex',
                                            backgroundColor: (theme) => theme.palette.warning.main,
                                            p: 0.5,
                                            m: 0,
                                            borderRadius: 2,
                                        }}
                                    >
                                        <WarningAmberIcon fontSize="large" sx={{ color: 'warning.contrastText' }} />
                                    </Box>
                                );
                            }

                            if (hasResults) {
                                return (
                                    <Box
                                        sx={{
                                            display: 'inline-flex',
                                            backgroundColor: 'primary.dark',
                                            p: 0.5,
                                            m: 0,
                                            borderRadius: 2,
                                        }}
                                    >
                                        <ArrowForwardIcon sx={{ color: 'primary.contrastText' }} fontSize="large" />
                                    </Box>
                                );
                            }

                            return null;
                        })()}
                        <DestinationEntry
                            entry={destinationEntry}
                            status={entry.status}
                            otherResultsCount={otherSearchResults.length}
                            isExpanded={isExpanded}
                            setIsExpanded={setIsExpanded}
                        />
                    </Box>

                    <Stack sx={{ gap: 1, justifyContent: 'center' }}>
                        <CustomTooltip title={entry.isExcluded ? t`Include` : t`Exclude`} placement="auto">
                            <IconButton
                                onClick={() =>
                                    entry.isExcluded
                                        ? MigrationManager.includeManga(entry.mangaId)
                                        : MigrationManager.excludeManga(entry.mangaId)
                                }
                            >
                                {entry.isExcluded ? <AddIcon /> : <CloseIcon />}
                            </IconButton>
                        </CustomTooltip>
                        <CustomTooltip title={t`Manual search`} placement="auto">
                            <IconButton
                                onClick={() => {
                                    ReactRouter.navigate(
                                        AppRoutes.migrate.childRoutes.manualSearch.path(
                                            entry.mangaId,
                                            entry.mangaTitle,
                                        ),
                                    );
                                }}
                            >
                                <SearchIcon />
                            </IconButton>
                        </CustomTooltip>
                    </Stack>
                </Box>
            </Box>

            <Collapse in={isExpanded} unmountOnExit>
                <Divider sx={{ my: 4 }} />
                <Typography variant="h6" component="h2">{t`Matches`}</Typography>
                <Stack sx={{ pt: 2 }}>
                    {otherSearchResults.map((searchResult) => {
                        if (destinationEntry?.id === searchResult.id) {
                            return null;
                        }

                        return (
                            <MatchedEntry key={searchResult.id} sourceMangaId={entry.mangaId} entry={searchResult} />
                        );
                    })}
                </Stack>
            </Collapse>
        </Paper>
    );
};
