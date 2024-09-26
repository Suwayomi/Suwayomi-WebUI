/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { IReaderSettings, ReadingDirection } from '@/modules/reader/types/Reader.types.ts';
import { TapZoneLayouts } from '@/modules/reader/types/TapZoneLayout.types.ts';

export const DEFAULT_READER_SETTINGS: IReaderSettings = {
    staticNav: false,
    showPageNumber: true,
    loadNextOnEnding: false,
    skipDupChapters: true,
    fitPageToWindow: true,
    scalePage: false,
    offsetFirstPage: false,
    readerWidth: 50,
    tapZoneLayout: TapZoneLayouts.RIGHT_LEFT,
    tapZoneInvertMode: { vertical: false, horizontal: false },
    readingDirection: ReadingDirection.LTR,
};
