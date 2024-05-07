/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import {
    GetMangaQuery,
    GetTrackersQuery,
    TrackerSearchQuery,
    TrackerType,
    TrackRecordType,
} from '@/lib/graphql/generated/graphql.ts';

export enum Tracker {
    MYANIMELIST = 1,
}

export const UNSET_DATE = '0';

export type TTrackRecord = GetMangaQuery['manga']['trackRecords']['nodes'][number];

export type TrackerManga = TrackerSearchQuery['searchTracker']['trackSearches'][number];

export type TBaseTracker = GetTrackersQuery['trackers']['nodes'][number];

type LoggedInInfo = Pick<TrackerType, 'isLoggedIn'>;

type TrackRecordTrackerInfo = { tracker: Partial<TrackRecordType['tracker']> };

export class Trackers {
    static getIds(trackers: { id: number }[]): number[] {
        return trackers.map((tracker) => tracker.id);
    }

    static isUnsetDate(date: string): boolean {
        return date === UNSET_DATE;
    }

    static getDateString(date: string): string | undefined {
        return this.isUnsetDate(date) ? undefined : date;
    }

    static getLoggedIn<Tracker extends LoggedInInfo>(trackers: Tracker[]): Tracker[] {
        return trackers.filter((tracker) => tracker.isLoggedIn);
    }

    static getTrackers<TrackRecord extends TrackRecordTrackerInfo>(
        trackRecords: TrackRecord[],
    ): TrackRecord['tracker'][] {
        return trackRecords.map((trackRecord) => trackRecord.tracker);
    }

    static getTrackRecordFor<TrackRecord extends TrackRecordTrackerInfo>(
        tracker: { id: number },
        trackRecords: TrackRecord[],
    ): TrackRecord | undefined {
        return trackRecords.find((trackRecord) => trackRecord.tracker.id === tracker.id);
    }
}
