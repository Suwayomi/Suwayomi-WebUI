/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Button from '@mui/material/Button';
import { useTranslation } from 'react-i18next';
import List from '@mui/material/List';
import Stack from '@mui/material/Stack';
import { useEffect, useMemo, useState } from 'react';
import IconButton from '@mui/material/IconButton';
import ArrowBack from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import InputAdornment from '@mui/material/InputAdornment';
import InfoIcon from '@mui/icons-material/Info';
import PopupState, { bindPopover, bindTrigger } from 'material-ui-popup-state';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import { requestManager } from '@/lib/requests/requests/RequestManager.ts';
import { EmptyViewAbsoluteCentered } from '@/modules/core/components/placeholder/EmptyViewAbsoluteCentered.tsx';
import { LoadingPlaceholder } from '@/modules/core/components/placeholder/LoadingPlaceholder.tsx';
import { Tracker, TTrackerBase } from '@/modules/tracker/services/Trackers.ts';
import { SearchTextField } from '@/modules/core/components/inputs/SearchTextField.tsx';
import { makeToast } from '@/lib/ui/Toast.ts';
import { TrackerMangaCard } from '@/modules/tracker/components/cards/TrackerMangaCard.tsx';
import { DIALOG_PADDING } from '@/modules/tracker/Tracker.constants.ts';
import { useGetOptionForDirection } from '@/theme.tsx';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import { MangaType } from '@/lib/graphql/generated/graphql.ts';
import { MangaIdInfo } from '@/modules/manga/services/Mangas.ts';

export const TrackerSearch = ({
    manga,
    tracker,
    closeSearchMode,
    trackedId,
}: {
    manga: MangaIdInfo & Pick<MangaType, 'title'>;
    tracker: Pick<TTrackerBase, 'id'>;
    closeSearchMode: () => void;
    trackedId?: string;
}) => {
    const { t } = useTranslation();
    const getOptionForDirection = useGetOptionForDirection();

    const [searchString, setSearchString] = useState<string>(manga.title);
    const [tmpSearchString, setTmpSearchString] = useState(searchString);

    const [selectedTrackerRemoteId, setSelectedTrackerRemoteId] = useState<string | undefined>(trackedId);

    const trackerSearch = requestManager.useTrackerSearch(tracker.id, searchString, { addAbortSignal: true });
    const searchResults = trackerSearch.data?.searchTracker.trackSearches ?? [];

    const hasResults = !!searchResults.length;

    useEffect(() => {
        setSelectedTrackerRemoteId(trackedId);

        return () =>
            trackerSearch.abortRequest(new Error(`MangaTrackerSearchCard(${tracker.id}, ${manga.id}): search changed`));
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

        bindTracker({ variables: { mangaId: manga.id, remoteId: selectedTrackerRemoteId, trackerId: tracker.id } })
            .then(() => {
                makeToast(t('manga.action.track.add.label.success'), 'success');
                closeSearchMode();
            })
            .catch(() => makeToast(t('manga.action.track.add.label.error'), 'error'));
    };

    return (
        <>
            <DialogTitle sx={{ padding: DIALOG_PADDING }}>
                <Stack
                    direction="row"
                    sx={{
                        gap: '10px',
                        alignItems: 'center',
                    }}
                >
                    <IconButton onClick={closeSearchMode}>
                        {getOptionForDirection(<ArrowBack />, <ArrowForwardIcon />)}
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
                        InputProps={{
                            startAdornment: tracker.id === Tracker.MYANIMELIST && (
                                <InputAdornment position="start">
                                    <PopupState variant="popover" popupId="tracker-search-info">
                                        {(popupState) => (
                                            <>
                                                <IconButton {...bindTrigger(popupState)} color="inherit">
                                                    <InfoIcon />
                                                </IconButton>
                                                <Popover
                                                    {...bindPopover(popupState)}
                                                    anchorOrigin={{
                                                        vertical: 'bottom',
                                                        horizontal: 'left',
                                                    }}
                                                >
                                                    <Typography sx={{ padding: 1, whiteSpace: 'pre-line' }}>
                                                        {t('tracking.my_anime_list.search.label.hint')}
                                                    </Typography>
                                                </Popover>
                                            </>
                                        )}
                                    </PopupState>
                                </InputAdornment>
                            ),
                        }}
                    />
                </Stack>
            </DialogTitle>
            <DialogContent dividers sx={{ padding: DIALOG_PADDING, height: '100vh' }}>
                {!trackerSearch.loading && !trackerSearch.error && !hasResults && (
                    <EmptyViewAbsoluteCentered message={t('manga.error.label.no_mangas_found')} />
                )}
                {trackerSearch.loading && <LoadingPlaceholder />}
                {trackerSearch.error && !trackerSearch.loading && (
                    <EmptyViewAbsoluteCentered
                        message={t('global.error.label.failed_to_load_data')}
                        messageExtra={trackerSearch.error.message}
                        retry={() =>
                            trackerSearch.refetch().catch(defaultPromiseErrorHandler('TrackerSearch::refetch'))
                        }
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
                        sx={{
                            justifyContent: 'center',
                            position: 'absolute',
                            left: 0,
                            right: 0,
                            bottom: 0,
                            paddingBottom: DIALOG_PADDING,
                        }}
                    >
                        <Button
                            disabled={bindTrackerMutation.loading}
                            size="large"
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
