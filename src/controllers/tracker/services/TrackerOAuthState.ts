/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { jsonSaveParse } from '@/lib/HelperFunctions.ts';

type TrackerOAuthState = { trackerId: number; trackerName: string };

// the state comes from the url and thus can be anything
export const parseTrackerOAuthState = (url: string): TrackerOAuthState | null => {
    const state = jsonSaveParse<Partial<TrackerOAuthState>>(new URL(url).searchParams.get('state') ?? '');

    return typeof state?.trackerId === 'number' ? (state as TrackerOAuthState) : null;
};
