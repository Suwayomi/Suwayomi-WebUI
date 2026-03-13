/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { MangaIdInfo } from '@/features/manga/Manga.types.ts';
import type { MigrationMatch, TMigrationEntry } from '@/features/migration/Migration.types.ts';
import { MigrationEntryStatus, MigrationPhase } from '@/features/migration/Migration.types.ts';
import { MediaQuery } from '@/base/utils/MediaQuery.tsx';
import { MigrationEntryCard } from '@/features/migration/components/migration-entry/MigrationEntryCard.tsx';
import { applyStyles } from '@/base/utils/ApplyStyles.ts';
import { MigrationEntryCardContent } from '@/features/migration/components/migration-entry/MigrationEntryCardContent.tsx';
import { ENTRY_STATUS_TRANSLATION } from '@/features/migration/Migration.constants.ts';
import { ReactRouter } from '@/lib/react-router/ReactRouter.ts';
import { AppRoutes } from '@/base/AppRoute.constants.ts';
import { MigrationManager } from '@/features/migration/MigrationManager.ts';
import { extractGraphqlExceptionInfo } from '@/lib/HelperFunctions.ts';
import { Confirmation } from '@/base/AppAwaitableComponent.ts';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import { ListCardAvatar } from '@/base/components/lists/cards/ListCardAvatar.tsx';
import { Mangas } from '@/features/manga/services/Mangas.ts';
import { TypographyMaxLines } from '@/base/components/texts/TypographyMaxLines.tsx';
import { MigrationEntryMetadataText } from '@/features/migration/components/migration-entry/MigrationEntryMetadataText.tsx';
import Typography from '@mui/material/Typography';
import { useLingui } from '@lingui/react/macro';
import Stack from '@mui/material/Stack';
import SearchIcon from '@mui/icons-material/Search';
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';
import { plural } from '@lingui/core/macro';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { alpha } from '@mui/material/styles';
import ReplayIcon from '@mui/icons-material/Replay';
import Link from '@mui/material/Link';
import { Link as RouterLink } from 'react-router-dom';

const EntryStatus = ({
    sourceMangaId,
    sourceMangaTitle,
    status,
    isMigrating,
}: {
    sourceMangaId: MangaIdInfo['id'];
    sourceMangaTitle: string;
    status: MigrationEntryStatus;
    isMigrating: boolean;
}) => {
    const { t } = useLingui();

    return (
        <Stack sx={{ alignItems: 'center', justifyContent: 'center', gap: 2 }}>
            <Typography color={status === MigrationEntryStatus.NO_MATCH ? 'warning' : undefined}>
                {t(ENTRY_STATUS_TRANSLATION[status])}
            </Typography>
            {!isMigrating && status === MigrationEntryStatus.NO_MATCH && (
                <Button
                    startIcon={<SearchIcon />}
                    variant="contained"
                    onClick={() => {
                        ReactRouter.navigate(
                            AppRoutes.migrate.childRoutes.manualSearch.path(sourceMangaId, sourceMangaTitle),
                            {
                                state: { mangaTitle: sourceMangaTitle },
                            },
                        );
                    }}
                >{t`Manual search`}</Button>
            )}
        </Stack>
    );
};

const EntryError = ({
    id,
    title,
    isMigrating,
    sourceMangaId,
    error,
}: {
    sourceMangaId: MangaIdInfo['id'];
    isMigrating: boolean;
} & Pick<TMigrationEntry, 'error'> &
    Pick<MigrationMatch, 'id' | 'title'>) => {
    const { t } = useLingui();

    const { phase } = MigrationManager.getState();

    const MAX_ERROR_LENGTH = 100;

    const { isGraphqlException, graphqlError, graphqlStackTrace } = extractGraphqlExceptionInfo(error);
    const tmpError = isGraphqlException ? graphqlError : error;
    const isErrorTooLong = (tmpError?.length ?? 0) > MAX_ERROR_LENGTH;
    const finalError = isErrorTooLong ? tmpError?.slice(0, MAX_ERROR_LENGTH).concat('…') : tmpError;

    const isSearchRetryable = status === MigrationEntryStatus.SEARCH_FAILED && phase === MigrationPhase.SEARCHING;
    const isMigrationRetryable = status === MigrationEntryStatus.MIGRATION_FAILED && phase === MigrationPhase.MIGRATING;

    const isRetryable = isSearchRetryable || isMigrationRetryable;

    return (
        <Stack sx={{ width: '100%', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
            <Stack sx={{ flexDirection: 'row', alignItems: 'center', gap: 1 }}>
                <Typography color="error" title={finalError}>
                    {finalError}
                </Typography>
                {(isErrorTooLong || (isGraphqlException && graphqlStackTrace)) && (
                    <Button
                        onClick={() => {
                            Confirmation.show({
                                title: isMigrating ? t`Migration failed` : t`Search failed`,
                                message: (
                                    <Stack sx={{ gap: 2 }}>
                                        {isMigrating ? (
                                            <Typography>{t`Migration for "${title}" failed with error:`}</Typography>
                                        ) : (
                                            <Typography>{t`Search for "${title}" failed with error:`}</Typography>
                                        )}
                                        <Typography>{error}</Typography>
                                    </Stack>
                                ),
                                actions: {
                                    cancel: { show: false },
                                    confirm: {
                                        title: t`Close`,
                                    },
                                },
                            }).catch(defaultPromiseErrorHandler(`MigrationEntryRow: ${id} - ${error}`));
                        }}
                        size="small"
                    >
                        {t`Show more`}
                    </Button>
                )}
            </Stack>
            {isRetryable && (
                <Button
                    sx={{ width: 'fit-content' }}
                    variant="contained"
                    color="error"
                    startIcon={<ReplayIcon />}
                    onClick={() =>
                        MigrationManager.retryEntry(sourceMangaId).catch(
                            defaultPromiseErrorHandler('MigrationEntryRow::retry'),
                        )
                    }
                >
                    {t`Retry`}
                </Button>
            )}
        </Stack>
    );
};

const EntryData = (entry: MigrationMatch) => {
    const { id, title } = entry;

    const { t } = useLingui();

    return (
        <>
            <Link component={RouterLink} to={AppRoutes.manga.path(id)}>
                <ListCardAvatar
                    iconUrl={Mangas.getThumbnailUrl(entry)}
                    alt={title}
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
                <Link
                    component={RouterLink}
                    to={AppRoutes.manga.path(id)}
                    sx={{ textDecoration: 'none', color: 'inherit' }}
                >
                    <TypographyMaxLines variant="h6" component="h3" title={title}>
                        {title}
                    </TypographyMaxLines>
                </Link>
                <MigrationEntryMetadataText {...entry} />
            </Stack>
        </>
    );
};

export const MigrationDestinationEntry = ({
    sourceMangaId,
    sourceMangaTitle,
    entry,
    error,
    status,
    otherResultsCount,
    isExpanded,
    setIsExpanded,
    isMigrating,
}: {
    sourceMangaId: MangaIdInfo['id'];
    sourceMangaTitle: string;
    entry: MigrationMatch | undefined;
    error?: string;
    status: MigrationEntryStatus;
    otherResultsCount: number;
    isExpanded: boolean;
    setIsExpanded: (expanded: boolean) => void;
    isMigrating: boolean;
}) => {
    const isTabletWidth = MediaQuery.useIsTabletWidth();

    return (
        <MigrationEntryCard
            sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                ...applyStyles(!isTabletWidth, {
                    width: '400px',
                    height: '100%',
                }),
            }}
        >
            <MigrationEntryCardContent>
                {(() => {
                    if (!entry) {
                        return (
                            <EntryStatus
                                sourceMangaId={sourceMangaId}
                                sourceMangaTitle={sourceMangaTitle}
                                status={status}
                                isMigrating={isMigrating}
                            />
                        );
                    }

                    if (error) {
                        return (
                            <EntryError
                                id={entry.id}
                                title={entry.title}
                                error={error}
                                sourceMangaId={sourceMangaId}
                                isMigrating={isMigrating}
                            />
                        );
                    }

                    return <EntryData {...entry} />;
                })()}
            </MigrationEntryCardContent>
            {!isTabletWidth && !isMigrating && !!otherResultsCount && (
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
                            one: '# more match',
                            other: '# more matches',
                        })}
                    </Button>
                </CardActions>
            )}
        </MigrationEntryCard>
    );
};
