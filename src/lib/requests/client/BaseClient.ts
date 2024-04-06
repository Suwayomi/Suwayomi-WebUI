/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { localStorage } from '@/util/Storage.ts';

export abstract class BaseClient<Client, ClientConfig, Fetcher> {
    protected client!: Client;

    public abstract readonly fetcher: Fetcher;

    constructor() {
        this.createClient();
    }

    public getBaseUrl(): string {
        const { hostname, port, protocol } = window.location;

        // if port is 3000 it's probably running from webpack development server
        const inferredPort = port === '3000' ? '4567' : port;
        return localStorage.getItem('serverBaseURL', `${protocol}//${hostname}:${inferredPort}`);
    }

    protected abstract createClient(): void;

    public abstract updateConfig(config: Partial<ClientConfig>): void;
}
