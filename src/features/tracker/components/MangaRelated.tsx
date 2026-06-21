/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { useLingui } from '@lingui/react/macro';
import type { MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { i18n } from '@/i18n';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { LoadingPlaceholder } from '@/base/components/feedback/LoadingPlaceholder.tsx';
import { EmptyView } from '@/base/components/feedback/EmptyView.tsx';
import { AvatarSpinner } from '@/base/components/AvatarSpinner.tsx';
import { SpinnerImage } from '@/base/components/SpinnerImage.tsx';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';
import type {
    GetMangaRelatedQuery,
    GetTrackersSettingsQuery,
    RelatedMangaFieldsFragment,
} from '@/lib/graphql/generated/graphql.ts';
import { GET_TRACKERS_SETTINGS } from '@/lib/graphql/tracker/TrackerQuery.ts';
import type { MangaIdInfo } from '@/features/manga/Manga.types.ts';
import { STABLE_EMPTY_ARRAY } from '@/base/Base.constants.ts';

type RelatedManga = GetMangaRelatedQuery['mangaRelated'];

type SectionDefinition = {
    title: MessageDescriptor;
    trackerName: string;
    items: (related: RelatedManga) => RelatedMangaFieldsFragment[];
};

// The tracker names must match the names provided by the server (see TrackerManager on the server).
const ANILIST_NAME = 'AniList';
const MYANIMELIST_NAME = 'MyAnimeList';

const SECTIONS: SectionDefinition[] = [
    {
        title: msg`AniList - Relations`,
        trackerName: ANILIST_NAME,
        items: (related) => related.anilistRelations,
    },
    {
        title: msg`AniList - Recommendations`,
        trackerName: ANILIST_NAME,
        items: (related) => related.anilistRecommendations,
    },
    {
        title: msg`MyAnimeList - Related Entries`,
        trackerName: MYANIMELIST_NAME,
        items: (related) => related.myanimelistRelations,
    },
    {
        title: msg`MyAnimeList - Recommendations`,
        trackerName: MYANIMELIST_NAME,
        items: (related) => related.myanimelistRecommendations,
    },
];

const RelatedMangaCard = ({ item }: { item: RelatedMangaFieldsFragment }) => (
    <Link
        href={item.trackingUrl}
        target="_blank"
        rel="noreferrer"
        underline="none"
        color="inherit"
        sx={{ flexShrink: 0, width: '120px' }}
    >
        <Box sx={{ width: '120px', aspectRatio: '225 / 350', borderRadius: 1, overflow: 'hidden' }}>
            <SpinnerImage
                src={item.coverUrl}
                alt={item.title}
                useFetchApi={false}
                imgStyle={{ objectFit: 'cover', width: '100%', height: '100%' }}
            />
        </Box>
        {item.relationType && (
            <Typography variant="caption" color="primary" sx={{ display: 'block', mt: 0.5 }}>
                {item.relationType}
            </Typography>
        )}
        <Typography
            variant="body2"
            sx={{
                mt: item.relationType ? 0 : 0.5,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
            }}
        >
            {item.title}
        </Typography>
    </Link>
);

const RelatedSection = ({
    title,
    iconUrl,
    items,
}: {
    title: string;
    iconUrl?: string;
    items: RelatedMangaFieldsFragment[];
}) => {
    const { t } = useLingui();

    return (
        <Stack sx={{ gap: 1 }}>
            <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
                {iconUrl && (
                    <AvatarSpinner
                        alt={title}
                        iconUrl={iconUrl}
                        slots={{
                            avatarProps: { variant: 'rounded', sx: { width: 24, height: 24 } },
                            spinnerImageProps: { ignoreQueue: true },
                        }}
                    />
                )}
                <Typography variant="h6">{title}</Typography>
            </Stack>
            {items.length ? (
                <Stack
                    direction="row"
                    sx={{
                        gap: 1.5,
                        overflowX: 'auto',
                        pb: 1,
                        alignItems: 'flex-start',
                    }}
                >
                    {items.map((item) => (
                        <RelatedMangaCard key={item.remoteId} item={item} />
                    ))}
                </Stack>
            ) : (
                <Typography color="textSecondary" variant="body2">
                    {t`Nothing found`}
                </Typography>
            )}
        </Stack>
    );
};

export const MangaRelated = ({ manga }: { manga: MangaIdInfo }) => {
    const { t } = useLingui();

    const relatedList = requestManager.useGetMangaRelated(manga.id);
    const trackerList = requestManager.useGetTrackerList<GetTrackersSettingsQuery>(GET_TRACKERS_SETTINGS);

    const trackers = trackerList.data?.trackers.nodes ?? STABLE_EMPTY_ARRAY;
    const getIconUrl = (trackerName: string): string | undefined => {
        const tracker = trackers.find(({ name }) => name === trackerName);
        return tracker ? requestManager.getValidImgUrlFor(tracker.icon) : undefined;
    };

    const loading = relatedList.loading || trackerList.loading;
    const error = relatedList.error ?? trackerList.error;

    if (error) {
        return (
            <>
                <DialogTitle>{t`Related`}</DialogTitle>
                <DialogContent>
                    <EmptyView
                        message={t`Unable to load data`}
                        messageExtra={getErrorMessage(error)}
                        retry={() => {
                            relatedList.refetch().catch(defaultPromiseErrorHandler('MangaRelated::refetch: related'));
                            trackerList.refetch().catch(defaultPromiseErrorHandler('MangaRelated::refetch: trackers'));
                        }}
                    />
                </DialogContent>
            </>
        );
    }

    if (loading || !relatedList.data) {
        return (
            <>
                <DialogTitle>{t`Related`}</DialogTitle>
                <DialogContent>
                    <LoadingPlaceholder />
                </DialogContent>
            </>
        );
    }

    const related = relatedList.data.mangaRelated;

    return (
        <>
            <DialogTitle>{t`Related`}</DialogTitle>
            <DialogContent dividers>
                <Stack sx={{ gap: 3 }}>
                    {SECTIONS.map((section) => (
                        <RelatedSection
                            key={i18n._(section.title)}
                            title={i18n._(section.title)}
                            iconUrl={getIconUrl(section.trackerName)}
                            items={section.items(related)}
                        />
                    ))}
                </Stack>
            </DialogContent>
        </>
    );
};
