/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

interface JwtHeader {
    alg: string;
    typ?: string;
    [key: string]: unknown;
}

type JwtPayload<T extends object> = T & {
    iss?: string;
    sub?: string;
    aud?: string | string[];
    exp?: number;
    nbf?: number;
    iat?: number;
    jti?: string;
};

export interface DecodedJwt<T extends object> {
    header: JwtHeader;
    payload: JwtPayload<T>;
}

export interface TokenPayload {
    token: string;
    expireTimestamp: number;
}
