/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import gql from 'graphql-tag';

export const EXTENSION_STORE_FIELDS = gql`
    fragment EXTENSION_STORE_FIELDS on ExtensionStoreType {
        badgeLabel
        contactDiscord
        contactWebsite
        extensionListUrl
        indexUrl
        isLegacy
        name
        signingKey
        extensions {
            totalCount
        }
    }
`;
