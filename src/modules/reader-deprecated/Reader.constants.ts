/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { IReaderSettings, ProgressBarPosition, ProgressBarType } from '@/modules/reader-deprecated/Reader.types.ts';
import { TapZoneLayouts } from '@/modules/reader/types/TapZoneLayout.types.ts';

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
    tapZoneLayout: TapZoneLayouts.STANDARD,
    progressBarType: ProgressBarType.STANDARD,
    progressBarSize: 4,
    progressBarPosition: ProgressBarPosition.BOTTOM,
};
