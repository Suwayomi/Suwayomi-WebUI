/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import gql from 'graphql-tag';
import { FULL_EXTENSION_FIELDS } from '@/lib/graphql/Fragments';

// makes the server fetch and return the latest extensions
export const GET_EXTENSIONS_FETCH = gql`
    ${FULL_EXTENSION_FIELDS}
    mutation GET_EXTENSIONS_FETCH($input: FetchExtensionsInput = {}) {
        fetchExtensions(input: $input) {
            clientMutationId
            extensions {
                ...FULL_EXTENSION_FIELDS
            }
        }
    }
`;

export const UPDATE_EXTENSION = gql`
    ${FULL_EXTENSION_FIELDS}
    mutation UPDATE_EXTENSION($input: UpdateExtensionInput!) {
        updateExtension(input: $input) {
            clientMutationId
            extension {
                ...FULL_EXTENSION_FIELDS
            }
        }
    }
`;

export const UPDATE_EXTENSIONS = gql`
    ${FULL_EXTENSION_FIELDS}
    mutation UPDATE_EXTENSIONS($input: UpdateExtensionsInput!) {
        updateExtensions(input: $input) {
            clientMutationId
            extensions {
                ...FULL_EXTENSION_FIELDS
            }
        }
    }
`;

export const INSTALL_EXTERNAL_EXTENSION = gql`
    ${FULL_EXTENSION_FIELDS}
    mutation INSTALL_EXTERNAL_EXTENSION($file: Upload!) {
        installExternalExtension(input: { extensionFile: $file }) {
            extension {
                ...FULL_EXTENSION_FIELDS
            }
            clientMutationId
        }
    }
`;
