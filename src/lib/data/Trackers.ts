/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { TrackerType, TrackRecordType, TrackSearchType } from '@/lib/graphql/generated/graphql.ts';

export enum Tracker {
    MYANIMELIST = 1,
}

export const UNSET_DATE = '0';

export type TTrackRecordBase = Pick<TrackRecordType, 'id' | 'remoteId' | 'title'>;

export type TTrackRecordBind = TTrackRecordBase &
    Pick<
        TrackRecordType,
        | 'trackerId'
        | 'remoteUrl'
        | 'status'
        | 'lastChapterRead'
        | 'totalChapters'
        | 'score'
        | 'displayScore'
        | 'startDate'
        | 'finishDate'
    >;

export type TTrackerManga = Pick<
    TrackSearchType,
    | 'id'
    | 'remoteId'
    | 'trackingUrl'
    | 'title'
    | 'coverUrl'
    | 'publishingType'
    | 'startDate'
    | 'publishingStatus'
    | 'summary'
>;

export type TTrackerBase = Pick<TrackerType, 'id' | 'name' | 'icon' | 'isLoggedIn' | 'isTokenExpired'>;

export type TTrackerSearch = TTrackerBase & Pick<TrackerType, 'authUrl'>;

export type TTrackerBind = TTrackerBase & Pick<TrackerType, 'icon' | 'supportsTrackDeletion' | 'scores' | 'statuses'>;

type LoggedInInfo = Pick<TrackerType, 'isLoggedIn' | 'isTokenExpired'>;

type TrackRecordTrackerInfo = { tracker: TTrackerBind };

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

    static isLoggedIn<Tracker extends LoggedInInfo>(tracker: Tracker): boolean {
        return tracker.isLoggedIn && !tracker.isTokenExpired;
    }

    static getLoggedIn<Tracker extends LoggedInInfo>(trackers: Tracker[]): Tracker[] {
        return trackers.filter(this.isLoggedIn);
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
