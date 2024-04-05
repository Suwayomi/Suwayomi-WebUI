/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useNavigate } from 'react-router-dom';
import SyncIcon from '@mui/icons-material/Sync';
import { useTranslation } from 'react-i18next';
import PopupState, { bindDialog, bindTrigger } from 'material-ui-popup-state';
import Dialog from '@mui/material/Dialog';
import CheckIcon from '@mui/icons-material/Check';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { makeToast } from '@/components/util/Toast.tsx';
import { TrackManga } from '@/components/tracker/TrackManga.tsx';
import { Trackers } from '@/lib/data/Trackers.ts';
import { TChapter, TManga } from '@/typings.ts';
import { CustomIconButton } from '@/components/atoms/CustomIconButton.tsx';
import { setChapterAsLastRead } from '@/components/chapter/util.tsx';

export const TrackMangaButton = ({ manga }: { manga: TManga }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const trackerList = requestManager.useGetTrackerList();
    const mangaTrackers = manga.trackRecords.nodes;

    const loggedInTrackers = Trackers.getLoggedIn(trackerList.data?.trackers.nodes ?? []);
    const trackersInUse = Trackers.getLoggedIn(Trackers.getTrackers(mangaTrackers));
    const mangaChaptersQuery = requestManager.useGetMangaChapters(manga.id);
    const mangaChapters = mangaChaptersQuery.data?.chapters.nodes;

    const refreshTracker = () => {
        mangaTrackers.map((trackRecord) =>
            requestManager
                .fetchTrackBind(trackRecord.id)
                .response.catch(() => makeToast(t('tracking.error.label.could_not_fetch_track_info'), 'error')),
        );
    };

    const updateChapterFromTracker = () => {
        const lastestTrackersRead = Math.max(...mangaTrackers.map((trackRecord) => trackRecord.lastChapterRead));
        const latestLocalRead = manga.latestReadChapter?.chapterNumber ?? 0;
        const localBehindTracker = !mangaChapters?.some((chapter) => chapter.chapterNumber === lastestTrackersRead);
        if (localBehindTracker) {
            requestManager.getMangaChaptersFetch(manga.id);
        }
        if (!localBehindTracker) {
            const chapterToBeUpdated = mangaChapters?.find((chapter) => chapter.chapterNumber === lastestTrackersRead);
            if (chapterToBeUpdated && latestLocalRead < lastestTrackersRead) {
                setChapterAsLastRead(chapterToBeUpdated?.id, mangaChapters as TChapter[]);
            }
        }
    };

    const handleClick = (openPopup: () => void) => {
        refreshTracker();
        updateChapterFromTracker();

        if (trackerList.error) {
            makeToast(t('tracking.error.label.could_not_load_track_info'), 'error');
            return;
        }

        if (!loggedInTrackers.length) {
            navigate('/settings/trackingSettings');
            return;
        }

        openPopup();
    };

    return (
        <PopupState variant="dialog" popupId="manga-track-modal">
            {(popupState) => (
                <>
                    <CustomIconButton
                        {...bindTrigger(popupState)}
                        disabled={trackerList.loading || !!trackerList.error}
                        onClick={() => handleClick(popupState.open)}
                        onTouchStart={() => handleClick(popupState.open)}
                        size="large"
                        sx={{ color: trackersInUse.length ? '#2196f3' : 'inherit' }}
                    >
                        {trackersInUse.length ? <CheckIcon /> : <SyncIcon />}
                        {trackersInUse.length
                            ? t('manga.button.track.active', { count: trackersInUse.length })
                            : t('manga.button.track.start')}
                    </CustomIconButton>
                    <Dialog {...bindDialog(popupState)} maxWidth="md" fullWidth scroll="paper">
                        <TrackManga manga={manga} />
                    </Dialog>
                </>
            )}
        </PopupState>
    );
};
