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
    const mangaChaptersQuery = requestManager.useGetMangaChapters(manga.id, {});

    /**
     * @description This function fetch the last read for the loged in trackers.
     */
    const refreshTracker = () =>
        mangaTrackers.map(
            async (trackRecord) =>
                (await requestManager.fetchTrackBind(trackRecord.id).response).data?.fetchTrack.trackRecord
                    .lastChapterRead,
        );

    /**
     * @description This function update the tracker reads, and set the local read to the higher chapter read if the local source is lower.
     * It will set all chapters part to read based on the tracker read, so if you have read chapter 100; parts 100.1 100.5 and 100.8 will be marked as read.
     */
    const updateChapterFromTracker = async () => {
        const updatedTrackerRecords = (await Promise.all(refreshTracker())) as number[];

        const latestTrackersRead =
            Math.max(...updatedTrackerRecords.map((trackData) => trackData)) ??
            manga.trackRecords.nodes.map((trackRecord) => trackRecord.lastChapterRead);
        const latestLocalRead = manga.latestReadChapter?.chapterNumber ?? 0;

        // Return a list of all the chapter and chapters parts that match the last chapter in the tracker
        const latestLocalChapterOrParts: number[] =
            mangaChaptersQuery.data?.chapters.nodes?.reduce((acc: number[], chapter) => {
                if (
                    chapter.chapterNumber === latestTrackersRead ||
                    Math.floor(chapter.chapterNumber) === latestTrackersRead
                ) {
                    acc.push(chapter.chapterNumber);
                }
                return acc;
            }, []) ?? [];

        // The last part of a chapter
        const lastLocalChapter = Math.max(...latestLocalChapterOrParts);

        // If the last chapter fetched is lower that the tracker's last read
        const localBehindTracker = lastLocalChapter < latestTrackersRead;

        // Fetch new chapters if behind tracker
        if (localBehindTracker) {
            await requestManager.getMangaChaptersFetch(manga.id, { awaitRefetchQueries: true }).response;
        }
        if (!localBehindTracker) {
            const chapterToBeUpdated =
                mangaChaptersQuery.data?.chapters.nodes?.find(
                    (chapter) => chapter.chapterNumber === lastLocalChapter,
                ) ?? mangaChaptersQuery.data?.chapters.nodes[0];
            if (
                chapterToBeUpdated &&
                (latestLocalRead < latestTrackersRead ||
                    (Math.floor(chapterToBeUpdated.chapterNumber) === latestTrackersRead && !chapterToBeUpdated.isRead))
            ) {
                setChapterAsLastRead(chapterToBeUpdated?.id, mangaChaptersQuery.data?.chapters.nodes as TChapter[]);
            }
        }
    };
    const handleClick = async (openPopup: () => void) => {
        if (trackerList.error) {
            makeToast(t('tracking.error.label.could_not_load_track_info'), 'error');
            return;
        }

        if (!loggedInTrackers.length) {
            navigate('/settings/trackingSettings');
            return;
        }

        openPopup();

        try {
            await updateChapterFromTracker();
        } catch (error) {
            makeToast(t('tracking.error.label.could_not_load_track_info'), 'error');
        }
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
