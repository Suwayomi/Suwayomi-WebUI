/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { ApolloError } from '@apollo/client/errors';

export const jsonSaveParse = <T = any>(...args: Parameters<typeof JSON.parse>): T | null => {
    try {
        return JSON.parse(...args);
    } catch (e) {
        return null;
    }
};

export const getErrorMessage = (error: unknown): string => {
    if (error instanceof ApolloError) {
        return `${error.name}: ${error.message}`;
    }

    if (error instanceof Error) {
        return `${error.name}: ${error.message}`;
    }

    if (error == null) {
        return '';
    }

    return `${error}`;
};
