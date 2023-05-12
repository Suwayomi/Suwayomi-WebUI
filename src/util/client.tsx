/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import axios from 'axios';
import useSWR, { SWRConfiguration, SWRResponse } from 'swr';
import storage from 'util/localStorage';

const { hostname, port, protocol } = window.location;

// if port is 3000 it's probably running from webpack devlopment server
let inferredPort;
if (port === '3000') {
    inferredPort = '4567';
} else {
    inferredPort = port;
}

const baseURL = storage.getItem('serverBaseURL', `${protocol}//${hostname}:${inferredPort}`);

const client = axios.create({
    // baseURL must not have traling slash
    baseURL,
});

client.interceptors.request.use((config) => {
    if (config.data instanceof FormData) {
        Object.assign(config.headers, { 'Content-Type': 'multipart/form-data' });
    }
    return config;
});

export default client;

export async function fetcher<T = any>(path: string) {
    const res = await client.get(path);
    if (res.status !== 200) {
        throw new Error(res.statusText);
    }
    if (res.headers['content-type'] !== 'application/json') {
        throw new Error('Response is not json');
    }
    return res.data as T;
}

export const useQuery = <Data extends any = any, Error extends any = any>(
    key: string,
    config?: SWRConfiguration<Data, Error>,
): SWRResponse<Data, Error> => useSWR(key, config);
