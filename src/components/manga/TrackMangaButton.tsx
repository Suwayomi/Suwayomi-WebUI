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
import { requestManager } from '@/lib/requests/requests/RequestManager.ts';
import { makeToast } from '@/lib/ui/Toast.ts';
import { TrackManga } from '@/components/tracker/TrackManga.tsx';
import { Trackers } from '@/lib/data/Trackers.ts';
import { CustomIconButton } from '@/modules/core/components/buttons/CustomIconButton.tsx';
import { GetTrackersSettingsQuery, MangaType } from '@/lib/graphql/generated/graphql.ts';
import { GET_TRACKERS_SETTINGS } from '@/lib/graphql/queries/TrackerQuery.ts';
import { MangaTrackRecordInfo } from '@/lib/data/Mangas.ts';

export const TrackMangaButton = ({ manga }: { manga: MangaTrackRecordInfo & Pick<MangaType, 'title'> }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const trackerList = requestManager.useGetTrackerList<GetTrackersSettingsQuery>(GET_TRACKERS_SETTINGS);
    const trackers = trackerList.data?.trackers.nodes ?? [];
    const mangaTrackers = manga.trackRecords.nodes;

    const loggedInTrackers = Trackers.getLoggedIn(trackers);
    const trackersInUse = Trackers.getLoggedIn(Trackers.getTrackers(mangaTrackers, trackers));

    const handleClick = (openPopup: () => void) => {
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
                        size="medium"
                        disabled={trackerList.loading || !!trackerList.error}
                        onClick={() => handleClick(popupState.open)}
                        onTouchStart={() => handleClick(popupState.open)}
                        variant={trackersInUse.length ? 'contained' : 'outlined'}
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
