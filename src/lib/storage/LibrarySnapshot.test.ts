/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { afterEach, beforeEach, expect, spyOn, test } from 'bun:test';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { LibrarySnapshot } from '@/lib/storage/LibrarySnapshot.ts';
import { AuthManager } from '@/controllers/authentication/services/AuthManager.ts';
import { AppStorage } from '@/lib/storage/AppStorage.ts';
import { GET_MANGAS_COUNT } from '@/lib/graphql/manga/MangaQuery.ts';

const variables = { condition: { inLibrary: true } };
const data = { mangas: { __typename: 'MangaNodeList', totalCount: 7 } };

const { client } = requestManager.graphQLClient;
const cached = () => client.cache.readQuery<any>({ query: GET_MANGAS_COUNT, variables });

beforeEach(async () => {
    AuthManager.setAuthRequired(false);
    window.localStorage.clear();
    await client.clearStore();
});

afterEach(() => AuthManager.setAuthRequired(null));

test('puts the saved library back into an empty cache', () => {
    LibrarySnapshot.save('GET_MANGAS_COUNT', variables, data);

    LibrarySnapshot.restore();

    expect(cached().mangas.totalCount).toBe(7);
});

test('does not overwrite data which is already cached', () => {
    LibrarySnapshot.save('GET_MANGAS_COUNT', variables, data);
    client.cache.writeQuery({
        query: GET_MANGAS_COUNT,
        variables,
        data: { mangas: { __typename: 'MangaNodeList', totalCount: 8 } },
    });

    LibrarySnapshot.restore();

    expect(cached().mangas.totalCount).toBe(8);
});

test('neither saves nor restores anything while a login is required', () => {
    LibrarySnapshot.save('GET_MANGAS_COUNT', variables, data);
    AuthManager.setAuthRequired(true);

    LibrarySnapshot.restore();
    expect(cached()).toBeNull();

    window.localStorage.clear();
    LibrarySnapshot.save('GET_MANGAS_COUNT', variables, data);
    expect(window.localStorage.length).toBe(0);
});

test('ignores a snapshot of another server', () => {
    LibrarySnapshot.save('GET_MANGAS_COUNT', variables, data);
    spyOn(requestManager, 'getBaseUrl').mockReturnValue('http://other.server');

    LibrarySnapshot.restore();

    expect(cached()).toBeNull();
});

test('ignores a broken snapshot and a full storage', () => {
    spyOn(AppStorage.local, 'setItem').mockImplementation(() => {
        throw new DOMException('full', 'QuotaExceededError');
    });
    expect(() => LibrarySnapshot.save('GET_MANGAS_COUNT', variables, data)).not.toThrow();

    spyOn(AppStorage.local, 'getItemParsed').mockReturnValue('{broken' as any);
    expect(() => LibrarySnapshot.restore()).not.toThrow();
    expect(cached()).toBeNull();
});
