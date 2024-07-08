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

type TrackerIdInfo = Pick<TrackerType, 'id'>;
type LoggedInInfo = Pick<TrackerType, 'isLoggedIn' | 'isTokenExpired'>;

type TrackRecordTrackerInfo = Pick<TrackRecordType, 'trackerId'>;

export class Trackers {
    static getIds(trackers: TrackerIdInfo[]): number[] {
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

    static getTrackers<TrackRecord extends TrackRecordTrackerInfo, Tracker extends TrackerIdInfo>(
        trackRecords: TrackRecord[],
        trackers: Tracker[],
    ): Tracker[] {
        return trackRecords
            .map((trackRecord) => trackers.find((tracker) => tracker.id === trackRecord.trackerId))
            .filter((tracker) => !!tracker);
    }

    static getTrackRecordFor<TrackRecord extends TrackRecordTrackerInfo>(
        tracker: TrackerIdInfo,
        trackRecords: TrackRecord[],
    ): TrackRecord | undefined {
        return trackRecords.find((trackRecord) => trackRecord.trackerId === tracker.id);
    }
}
