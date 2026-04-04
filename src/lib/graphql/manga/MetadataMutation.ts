/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import gql from 'graphql-tag';
import { MANGA_SCREEN_FIELDS } from '@/lib/graphql/manga/MangaFragments.ts';

export const SEARCH_METADATA_PROVIDER = gql`
    mutation SEARCH_METADATA_PROVIDER($provider: String!, $query: String!, $author: String) {
        searchMetadataProvider(input: { provider: $provider, query: $query, author: $author }) {
            results {
                externalId
                title
                author
                coverUrl
                year
                description
            }
        }
    }
`;

export const APPLY_METADATA_MATCH = gql`
    ${MANGA_SCREEN_FIELDS}

    mutation APPLY_METADATA_MATCH($mangaId: Int!, $provider: String!, $externalId: String!, $includeCover: Boolean!) {
        applyMetadataMatch(
            input: { mangaId: $mangaId, provider: $provider, externalId: $externalId, includeCover: $includeCover }
        ) {
            manga {
                ...MANGA_SCREEN_FIELDS
            }
        }
    }
`;
