/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import {
    IReaderSettings,
    ProgressBarPosition,
    ProgressBarType,
    ReaderPageScaleMode,
    ReadingDirection,
    ReadingMode,
} from '@/modules/reader/types/Reader.types.ts';
import { TapZoneLayouts } from '@/modules/reader/types/TapZoneLayout.types.ts';

export const DEFAULT_READER_SETTINGS: IReaderSettings = {
    staticNav: false,
    showPageNumber: true,
    loadNextOnEnding: false,
    skipDupChapters: true,
    readerWidth: 50,
    tapZoneLayout: TapZoneLayouts.RIGHT_LEFT,
    tapZoneInvertMode: { vertical: false, horizontal: false },
    progressBarType: ProgressBarType.STANDARD,
    progressBarSize: 4,
    progressBarPosition: ProgressBarPosition.BOTTOM,
    pageScaleMode: ReaderPageScaleMode.ORIGINAL,
    shouldScalePage: false,
    shouldOffsetDoubleSpreads: false,
    readingDirection: ReadingDirection.LTR,
    readingMode: ReadingMode.SINGLE_PAGE,
};
