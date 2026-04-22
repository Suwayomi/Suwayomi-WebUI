/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

declare module 'apollo-upload-client/UploadHttpLink.mjs' {
    import { ApolloLink } from '@apollo/client';
    import type { BaseHttpLink } from '@apollo/client/link/http';

    export default class UploadHttpLink extends ApolloLink {
        constructor(options?: BaseHttpLink.ConstructorOptions);
    }
}
