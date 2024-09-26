/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { TapZoneInvertMode, TapZoneLayouts } from '@/modules/reader/types/TapZoneLayout.types.ts';

export enum ReadingDirection {
    LTR,
    RTL,
}

export interface IReaderSettings {
    staticNav: boolean;
    showPageNumber: boolean;
    loadNextOnEnding: boolean;
    skipDupChapters: boolean;
    fitPageToWindow: boolean;
    scalePage: boolean;
    offsetFirstPage: boolean;
    readerWidth: number;
    tapZoneLayout: TapZoneLayouts;
    tapZoneInvertMode: TapZoneInvertMode;
    readingDirection: ReadingDirection;
}
