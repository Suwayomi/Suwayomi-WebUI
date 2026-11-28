/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { expect, test, vi } from 'vitest';
import { ApolloLink, gql, ServerError } from '@apollo/client';
import { firstValueFrom, of, throwError } from 'rxjs';
// imported through the request manager to keep the app's import order (the modules are circular)
import { requestManager } from '@/lib/requests/RequestManager.ts';

test('waits as long as the server asks to after a rate limit', async () => {
    const client = requestManager.graphQLClient as any;
    const addRateLimit = vi.spyOn(client, 'addRateLimit').mockImplementation(() => {});
    vi.spyOn(client, 'awaitRateLimit').mockResolvedValue(undefined);

    let calls = 0;
    const server = new ApolloLink((operation) => {
        calls += 1;
        if (calls > 1) {
            return of({ data: { ok: true } });
        }

        const response = new Response('', { status: 429, headers: { 'Retry-After': '5' } });
        operation.setContext({ response });

        return throwError(() => new ServerError('Too many requests', { response, bodyText: '' }));
    });

    await firstValueFrom(
        ApolloLink.execute(
            ApolloLink.from([client.createErrorLink(), server]),
            {
                query: gql`
                    query TEST {
                        ok
                    }
                `,
            },
            { client: client.client },
        ),
    );

    expect(addRateLimit).toHaveBeenCalledWith(expect.any(String), '5');
});
