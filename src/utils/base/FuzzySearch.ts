/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Fuse from 'fuse.js';
import type { FuseOptionKey, IFuseOptions } from 'fuse.js';

/**
 * The shared configuration for every typo tolerant search of the app, so that searching behaves the same everywhere.
 *
 * - "threshold" is what decides how wrong a query may be. At 0.35 "archmage retruns" still finds "The Archmage Returns
 *   After 4000 Years", while an unrelated query keeps finding nothing.
 * - "ignoreLocation" is required because Fuse otherwise only looks at the beginning of a text, which would mean a title
 *   could not be found by a word in the middle of it.
 * - "useTokenSearch" with "tokenMatch: all" requires every word of the query to match, but in any order, so that
 *   "viewpoint omniscient" finds "Omniscient Reader's Viewpoint".
 * - "minMatchCharLength" has to stay at 1: together with "tokenMatch: all" anything higher makes a query containing a
 *   shorter word match nothing at all, so typing "one p" on the way to "One Piece" would find nothing.
 */
const FUZZY_SEARCH_OPTIONS = {
    threshold: 0.35,
    ignoreLocation: true,
    ignoreDiacritics: true,
    minMatchCharLength: 1,
    useTokenSearch: true,
    tokenMatch: 'all',
} as const satisfies IFuseOptions<unknown>;

export const createFuzzySearch = <Item>(items: readonly Item[], keys: FuseOptionKey<Item>[]): Fuse<Item> =>
    new Fuse([...items], { ...FUZZY_SEARCH_OPTIONS, keys });

export const fuzzySearch = <Item>(index: Fuse<Item>, ...args: Parameters<Fuse<Item>['search']>): Item[] =>
    index.search(...args).map(({ item }) => item);
