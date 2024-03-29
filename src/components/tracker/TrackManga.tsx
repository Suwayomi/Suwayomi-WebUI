/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useNavigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { useMemo, useState } from 'react';
import DialogContent from '@mui/material/DialogContent';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { EmptyView } from '@/components/util/EmptyView.tsx';
import { LoadingPlaceholder } from '@/components/util/LoadingPlaceholder.tsx';
import { Trackers } from '@/lib/data/Trackers.ts';
import { TrackerCard, TrackerMode } from '@/components/tracker/TrackerCard.tsx';
import { TManga } from '@/typings.ts';

const getTrackerMode = (id: number, trackersInUse: number[], searchModeForTracker?: number): TrackerMode => {
    if (id === searchModeForTracker) {
        return TrackerMode.SEARCH;
    }

    if (trackersInUse.includes(id)) {
        return TrackerMode.INFO;
    }

    return TrackerMode.UNTRACKED;
};

export const TrackManga = ({ manga }: { manga: Pick<TManga, 'id' | 'trackRecords'> }) => {
    const navigate = useNavigate();

    const [searchModeForTracker, setSearchModeForTracker] = useState<number>();

    const trackerList = requestManager.useGetTrackerList();
    const mangaTrackers = manga.trackRecords.nodes;

    const loggedInTrackers = Trackers.getLoggedIn(trackerList.data?.trackers.nodes ?? []);
    const trackersInUse = Trackers.getLoggedIn(Trackers.getTrackers(mangaTrackers));
    const trackersInUseIds = Trackers.getIds(trackersInUse);

    const isSearchActive = searchModeForTracker !== undefined;
    const OptionalDialogContent = useMemo(() => (isSearchActive ? Box : DialogContent), [isSearchActive]);

    const trackerComponents = useMemo(
        () =>
            loggedInTrackers.map((tracker) => {
                const mode = getTrackerMode(tracker.id, trackersInUseIds, searchModeForTracker);
                const trackRecord = Trackers.getTrackRecordFor(tracker, manga.trackRecords.nodes);

                const isSearchForTracker = mode === TrackerMode.SEARCH;
                if (isSearchActive && !isSearchForTracker) {
                    return null;
                }

                return (
                    <TrackerCard
                        key={tracker.id}
                        tracker={tracker}
                        mangaId={manga.id}
                        trackRecord={trackRecord}
                        mode={mode}
                        setSearchMode={(id) => setSearchModeForTracker(id)}
                    />
                );
            }),
        [trackersInUseIds, searchModeForTracker, manga.id],
    );

    if (trackerList.error) {
        return <EmptyView message={trackerList.error.message ?? trackerList.error} />;
    }

    if (trackerList.loading) {
        return <LoadingPlaceholder />;
    }

    if (!loggedInTrackers) {
        navigate('/settings/trackingSettings');
    }

    if (!isSearchActive) {
        return (
            <OptionalDialogContent
                sx={{
                    padding: 0,
                    // MUI adds a bottom padding to the last child of type CardContent which can only be removed via actual css styling
                    // do it here, so it is done in one place for all track related CardContent components
                    '.MuiPaper-root .MuiCardContent-root': { paddingBottom: '0' },
                }}
            >
                {trackerComponents}
            </OptionalDialogContent>
        );
    }

    return trackerComponents;
};
