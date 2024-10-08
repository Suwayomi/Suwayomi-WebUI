/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { IReaderSettings } from '@/modules/reader/Reader.types.ts';

export const DEFAULT_READER_SETTINGS: IReaderSettings = {
    staticNav: false,
    showPageNumber: true,
    loadNextOnEnding: false,
    skipDupChapters: true,
    fitPageToWindow: true,
    scalePage: false,
    readerType: 'ContinuesVertical',
    offsetFirstPage: false,
    readerWidth: 50,
};
