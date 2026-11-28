/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { expect, spyOn, test } from 'bun:test';
import { ReaderAutoCropCache } from '@/features/reader/services/ReaderAutoCropCache.ts';

const fill = (cache: ReaderAutoCropCache, ...srcs: string[]) => srcs.forEach((src) => cache.set(src, `blob:${src}`));

test('evicts and revokes the oldest crop which is not in use', () => {
    const revoke = spyOn(URL, 'revokeObjectURL');
    const cache = new ReaderAutoCropCache(2);
    cache.retain('1');

    fill(cache, '1', '2', '3');

    expect(cache.get('1')).toBe('blob:1');
    expect(cache.get('2')).toBeUndefined();
    expect(revoke).toHaveBeenCalledWith('blob:2');
    expect(revoke).not.toHaveBeenCalledWith('blob:1');
});

test('keeps a crop until its last user released it', () => {
    const cache = new ReaderAutoCropCache(1);
    const releaseFirst = cache.retain('1');
    const releaseSecond = cache.retain('1');
    fill(cache, '1');

    releaseFirst();
    releaseFirst();
    fill(cache, '2');
    expect(cache.get('1')).toBe('blob:1');

    releaseSecond();
    fill(cache, '3');
    expect(cache.get('1')).toBeUndefined();
});
