/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Button from '@mui/material/Button';
import { useTranslation } from 'react-i18next';
import { List, Stack } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import IconButton from '@mui/material/IconButton';
import ArrowBack from '@mui/icons-material/ArrowBack';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { EmptyView } from '@/components/util/EmptyView.tsx';
import { LoadingPlaceholder } from '@/components/util/LoadingPlaceholder.tsx';
import { TBaseTracker } from '@/lib/data/Trackers.ts';
import { SearchTextField } from '@/components/atoms/SearchTextField.tsx';
import { makeToast } from '@/components/util/Toast.tsx';
import { TrackerMangaCard } from '@/components/tracker/TrackerMangaCard.tsx';

export const TrackerSearch = ({
    mangaId,
    tracker,
    closeSearchMode,
    trackedId,
}: {
    mangaId: number;
    tracker: TBaseTracker;
    closeSearchMode: () => void;
    trackedId?: string;
}) => {
    const { t } = useTranslation();

    // can't be undefined, since this can only be opened from the manga screen
    const manga = requestManager.useGetManga(mangaId);

    const [searchString, setSearchString] = useState<string>(manga.data!.manga.title);
    const [tmpSearchString, setTmpSearchString] = useState(searchString);

    const [selectedTrackerRemoteId, setSelectedTrackerRemoteId] = useState<string | undefined>(trackedId);

    const trackerSearch = requestManager.useTrackerSearch(tracker.id, searchString, { addAbortSignal: true });
    const searchResults = trackerSearch.data?.searchTracker.trackSearches ?? [];

    const hasResults = !!searchResults.length;

    useEffect(() => {
        setSelectedTrackerRemoteId(trackedId);

        return () =>
            trackerSearch.abortRequest(new Error(`MangaTrackerSearchCard(${tracker.id}, ${mangaId}): search changed`));
    }, [searchString]);

    const [bindTracker, bindTrackerMutation] = requestManager.useBindTracker();

    const showTrackButton =
        useMemo(
            () =>
                !!selectedTrackerRemoteId &&
                !!searchResults.find((searchResult) => searchResult.remoteId === selectedTrackerRemoteId),
            [selectedTrackerRemoteId, searchResults],
        ) &&
        !trackerSearch.loading &&
        !trackerSearch.error;

    const trackManga = () => {
        if (selectedTrackerRemoteId === undefined) {
            return;
        }

        bindTracker({ variables: { mangaId, remoteId: selectedTrackerRemoteId, trackerId: tracker.id } })
            .then(() => {
                makeToast(t('manga.action.track.add.label.success'), 'success');
                closeSearchMode();
            })
            .catch(() => makeToast(t('manga.action.track.add.label.error'), 'error'));
    };

    return (
        <>
            <DialogTitle sx={{ padding: '15px' }}>
                <Stack direction="row" gap="10px" alignItems="center">
                    <IconButton onClick={closeSearchMode}>
                        <ArrowBack />
                    </IconButton>
                    <SearchTextField
                        sx={{ width: '100%' }}
                        variant="standard"
                        value={tmpSearchString}
                        onChange={(e) => setTmpSearchString(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                setSearchString(tmpSearchString);
                            }
                        }}
                        onCancel={() => setTmpSearchString('')}
                    />
                </Stack>
            </DialogTitle>
            <DialogContent dividers sx={{ padding: '15px', height: '100vh' }}>
                {!trackerSearch.loading && !trackerSearch.error && !hasResults && (
                    <EmptyView message={t('manga.error.label.no_mangas_found')} />
                )}
                {trackerSearch.loading && <LoadingPlaceholder />}
                {trackerSearch.error && !trackerSearch.loading && (
                    <EmptyView
                        message={t('global.error.label.failed_to_load_data')}
                        messageExtra={trackerSearch.error.message ?? trackerSearch.error}
                    />
                )}
                <List sx={{ padding: 0 }}>
                    {hasResults &&
                        searchResults.map((trackerManga) => (
                            <TrackerMangaCard
                                key={trackerManga.id}
                                manga={trackerManga}
                                selected={trackerManga.remoteId === selectedTrackerRemoteId}
                                onSelect={() => setSelectedTrackerRemoteId(trackerManga.remoteId)}
                            />
                        ))}
                </List>
                {showTrackButton && (
                    <Stack
                        direction="row"
                        justifyContent="center"
                        sx={{
                            position: 'absolute',
                            left: 0,
                            right: 0,
                            bottom: 0,
                            paddingBottom: '15px',
                        }}
                    >
                        <Button
                            disabled={bindTrackerMutation.loading}
                            size="large"
                            color="primary"
                            variant="contained"
                            onClick={trackManga}
                            sx={{ width: '75%' }}
                        >
                            {t('manga.action.track.add.label.action')}
                        </Button>
                    </Stack>
                )}
            </DialogContent>
        </>
    );
};
