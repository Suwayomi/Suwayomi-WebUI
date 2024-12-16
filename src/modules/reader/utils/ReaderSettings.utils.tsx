/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { IReaderSettings, ReaderPageScaleMode, ReadingMode } from '@/modules/reader/types/Reader.types.ts';

export const isOffsetDoubleSpreadPagesEditable = (readingMode: IReaderSettings['readingMode']): boolean =>
    readingMode === ReadingMode.DOUBLE_PAGE;

export const isReaderWidthEditable = (pageScaleMode: IReaderSettings['pageScaleMode']): boolean =>
    [ReaderPageScaleMode.WIDTH, ReaderPageScaleMode.SCREEN].includes(pageScaleMode);

export const isContinuousReadingMode = (readingMode: IReaderSettings['readingMode']): boolean =>
    [ReadingMode.CONTINUOUS_VERTICAL, ReadingMode.CONTINUOUS_HORIZONTAL].includes(readingMode);
