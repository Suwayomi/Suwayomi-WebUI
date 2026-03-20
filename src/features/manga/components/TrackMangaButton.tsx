/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useNavigate } from 'react-router-dom';
import SyncIcon from '@mui/icons-material/Sync';
import PopupState, { bindDialog, bindTrigger } from 'material-ui-popup-state';
import Dialog from '@mui/material/Dialog';
import CheckIcon from '@mui/icons-material/Check';
import { useLingui } from '@lingui/react/macro';
import { plural } from '@lingui/core/macro';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { makeToast } from '@/base/utils/Toast.ts';
import { TrackManga } from '@/features/tracker/components/TrackManga.tsx';
import { Trackers } from '@/features/tracker/services/Trackers.ts';
import { CustomButton } from '@/base/components/buttons/CustomButton.tsx';
import type { GetTrackersSettingsQuery, MangaType } from '@/lib/graphql/generated/graphql.ts';
import { GET_TRACKERS_SETTINGS } from '@/lib/graphql/tracker/TrackerQuery.ts';
import type { MangaTrackRecordInfo } from '@/features/manga/Manga.types.ts';
import { AppRoutes } from '@/base/AppRoute.constants.ts';
import { MediaQuery } from '@/base/utils/MediaQuery.tsx';
import { STABLE_EMPTY_ARRAY } from '@/base/Base.constants.ts';

export const TrackMangaButton = ({ manga }: { manga: MangaTrackRecordInfo & Pick<MangaType, 'title'> }) => {
    const { t } = useLingui();
    const navigate = useNavigate();
    const isMobileWidth = MediaQuery.useIsMobileWidth();

    const trackerList = requestManager.useGetTrackerList<GetTrackersSettingsQuery>(GET_TRACKERS_SETTINGS);
    const trackers = trackerList.data?.trackers.nodes ?? STABLE_EMPTY_ARRAY;
    const mangaTrackers = manga.trackRecords.nodes;

    const loggedInTrackers = Trackers.getLoggedIn(trackers);
    const trackersInUse = Trackers.getLoggedIn(Trackers.getTrackers(mangaTrackers, trackers));

    const handleClick = (openPopup: () => void) => {
        if (trackerList.error) {
            makeToast(t`Could not load track info`, 'error', trackerList.error?.toString());
            return;
        }

        if (!loggedInTrackers.length) {
            navigate(AppRoutes.settings.childRoutes.tracking.path);
            return;
        }

        openPopup();
    };

    return (
        <PopupState variant="dialog" popupId="manga-track-modal">
            {(popupState) => (
                <>
                    <CustomButton
                        {...bindTrigger(popupState)}
                        size={isMobileWidth ? 'small' : 'medium'}
                        disabled={trackerList.loading || !!trackerList.error}
                        onClick={() => handleClick(popupState.open)}
                        variant={trackersInUse.length ? 'contained' : 'outlined'}
                    >
                        {trackersInUse.length ? <CheckIcon /> : <SyncIcon />}
                        {trackersInUse.length
                            ? plural(trackersInUse.length, {
                                  one: '# Tracker',
                                  other: '# Tracker',
                              })
                            : t`Tracking`}
                    </CustomButton>
                    {popupState.isOpen && (
                        <Dialog {...bindDialog(popupState)} maxWidth="md" fullWidth scroll="paper">
                            <TrackManga manga={manga} />
                        </Dialog>
                    )}
                </>
            )}
        </PopupState>
    );
};
