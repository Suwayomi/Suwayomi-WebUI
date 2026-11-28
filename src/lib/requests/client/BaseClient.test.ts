/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { beforeEach, expect, test } from 'bun:test';
import { CombinedGraphQLErrors } from '@apollo/client';
import { BaseClient } from '@/lib/requests/client/BaseClient.ts';
import { AuthManager } from '@/features/authentication/AuthManager.ts';

const failRefreshWith = (error: unknown) =>
    (BaseClient as any).refreshAccessToken(() => ({ response: Promise.reject(error) }));

beforeEach(() => {
    AuthManager.setRefreshToken('refresh-token');
});

test('keeps the login when the server cannot be reached', async () => {
    await expect(failRefreshWith(new TypeError('Failed to fetch'))).rejects.toThrow('Failed to fetch');

    expect(AuthManager.getRefreshToken()).toBe('refresh-token');
});

test('logs out when the server rejects the refresh token', async () => {
    await expect(failRefreshWith(new CombinedGraphQLErrors({ errors: [{ message: 'rejected' }] }))).rejects.toThrow();

    expect(AuthManager.getRefreshToken()).toBeNull();
});
