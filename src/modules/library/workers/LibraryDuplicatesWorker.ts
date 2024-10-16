/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import {
    findDuplicatesByTitle,
    findDuplicatesByTitleAndAlternativeTitles,
} from '@/modules/library/util/LibraryDuplicates.util.ts';
import { LibraryDuplicatesWorkerInput } from '@/modules/library/Library.types.ts';

// eslint-disable-next-line no-restricted-globals
self.onmessage = async (event: MessageEvent<LibraryDuplicatesWorkerInput>) => {
    const { mangas } = event.data;
    const { checkAlternativeTitles } = event.data;

    if (checkAlternativeTitles) {
        postMessage(findDuplicatesByTitleAndAlternativeTitles(mangas));
        return;
    }

    postMessage(findDuplicatesByTitle(mangas));
};
