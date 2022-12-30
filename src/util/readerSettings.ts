/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { getMetadataFrom } from 'util/metadata';

export const defaultReaderSettings = () => ({
    staticNav: false,
    showPageNumber: true,
    continuesPageGap: false,
    loadNextonEnding: false,
    readerType: 'ContinuesVertical',
} as IReaderSettings);

export const getReaderSettingsFromMetadata = (
    meta?: IMetadata,
): IReaderSettings => ({
    ...getMetadataFrom(
        { meta },
        Object.entries(defaultReaderSettings()) as MetadataKeyValuePair[],
    ) as unknown as IReaderSettings,
});

export const getReaderSettingsFor = (
    { meta }: IMetadataHolder,
): IReaderSettings => getReaderSettingsFromMetadata(meta);
