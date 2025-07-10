/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { AppStorage } from '@/lib/storage/AppStorage.ts';

export abstract class BaseClient<Client, ClientConfig, Fetcher> {
    protected abstract client: Client;

    public abstract readonly fetcher: Fetcher;

    public getBaseUrl(): string {
        const { hostname, port, protocol } = window.location;

        // if port is 3000 it's probably running from webpack development server
        // return empty string to use relative URLs and go through Vite proxy
        if (import.meta.env.DEV && port === '3000') {
            return '';
        }

        const inferredPort = port;
        return AppStorage.local.getItemParsed('serverBaseURL', `${protocol}//${hostname}:${inferredPort}`);
    }

    public abstract updateConfig(config: Partial<ClientConfig>): void;
}
