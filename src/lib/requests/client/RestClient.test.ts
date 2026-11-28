/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { expect, test, vi } from 'vitest';
import { RestClient } from '@/lib/requests/client/RestClient.ts';
import { AuthManager } from '@/features/authentication/AuthManager.ts';

const token = `e30.${btoa(JSON.stringify({ exp: 4_000_000_000 }))}.e30`;

test('retries an unauthorized request only once', async () => {
    AuthManager.setAuthInitialized(true);
    AuthManager.setAuthRequired(false);
    AuthManager.setRefreshToken('refresh-token');

    const client = new RestClient(
        () => ({ response: Promise.resolve({ data: { refreshToken: { accessToken: token } } }) }) as any,
    );
    // answers 200 from the 6th call on, so that an unlimited retry ends instead of hanging the test
    let calls = 0;
    (client as any).client = vi.fn(async () => new Response(null, { status: ++calls > 5 ? 200 : 401 }));

    await expect(client.fetcher('/image', { checkResponseIsJson: false })).rejects.toThrow('status 401');
    expect(calls).toBe(2);
});
