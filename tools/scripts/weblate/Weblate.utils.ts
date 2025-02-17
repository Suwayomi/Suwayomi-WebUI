/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import {
    WeblateChangePayload,
    WeblateChangeResult,
    WeblateLanguagePayload,
    WeblateUserPayload,
} from '@/../tools/scripts/weblate/Weblate.types.ts';

export const fetchData = async <T = any>(url: string, authToken: string): Promise<T> => {
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            Authorization: `Token ${authToken}`,
            Accept: 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error(`Weblate request failed with status ${response.status} - ${response.statusText}`);
    }

    return response.json();
};

export const fetchWeblateChanges = async (
    url: string,
    authToken: string,
    weblateChangeResults: WeblateChangeResult[] = [],
): Promise<WeblateChangeResult[]> => {
    const weblateChangePage = await fetchData<WeblateChangePayload>(url, authToken);

    if (!weblateChangePage.next) {
        return [...weblateChangePage.results, ...weblateChangeResults];
    }

    return fetchWeblateChanges(weblateChangePage.next, authToken, [
        ...weblateChangePage.results,
        ...weblateChangeResults,
    ]);
};

export const getUsername = async (url: string, authToken: string): Promise<string> => {
    const userPayload = await fetchData<WeblateUserPayload>(url, authToken);
    return userPayload.full_name;
};

export const getLanguageName = async (url: string, authToken: string): Promise<string> => {
    const languagePayload = await fetchData<WeblateLanguagePayload>(url, authToken);
    return languagePayload.language.name.replace(/\(([a-zA-Z]+) Han script\)/g, '($1)');
};

const dateRegex = /[0-9]{4}-[0-9]{2}-[0-9]{2}/g;
const isValidIS08601Date = (date: string): boolean => !!date.match(dateRegex);
export const validateWeblateDates = (afterDate: string, beforeDate: string) => {
    if (!isValidIS08601Date(afterDate) || !isValidIS08601Date(beforeDate)) {
        throw new Error(
            `The passed timestamps are not properly formatted. They have to match "${dateRegex}" (e.g. 2024-05-11)`,
        );
    }
};
