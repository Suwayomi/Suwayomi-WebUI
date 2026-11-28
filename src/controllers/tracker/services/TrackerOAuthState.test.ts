/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { expect, test } from 'bun:test';
import { parseTrackerOAuthState } from '@/controllers/tracker/services/TrackerOAuthState.ts';

test('reads the tracker of a login redirect', () => {
    const url = `http://localhost/tracker/login/oauth?state=${encodeURIComponent('{"trackerId":2,"trackerName":"AniList"}')}`;

    expect(parseTrackerOAuthState(url)).toEqual({ trackerId: 2, trackerName: 'AniList' });
});

test('rejects a login redirect without a usable state', () => {
    ['', '?state=%7Bbroken', '?state=null', '?state=%7B%7D'].forEach((query) =>
        expect(parseTrackerOAuthState(`http://localhost/tracker/login/oauth${query}`)).toBeNull(),
    );
});
