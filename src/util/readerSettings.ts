/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { getMetadataFrom } from 'util/metadata';
import { useQuery } from './client';

export const defaultReaderSettings = () => ({
    staticNav: false,
    showPageNumber: true,
    continuesPageGap: false,
    loadNextonEnding: false,
    readerType: 'ContinuesVertical',
} as IReaderSettings);

const getReaderSettingsWithDefaultValueFallback = (
    meta?: IMetadata,
    defaultSettings?: IReaderSettings,
): IReaderSettings => ({
    ...getMetadataFrom(
        { meta },
        Object.entries(defaultSettings ?? getDefaultSettings()) as MetadataKeyValuePair[],
    ) as unknown as IReaderSettings,
});

export const getReaderSettingsFromMetadata = (
    meta?: IMetadata,
    defaultSettings?: IReaderSettings,
): IReaderSettings => ({
    ...getReaderSettingsWithDefaultValueFallback(meta, defaultSettings),
});

export const getReaderSettingsFor = (
    { meta }: IMetadataHolder,
    defaultSettings?: IReaderSettings,
): IReaderSettings => getReaderSettingsFromMetadata(meta, defaultSettings);

export const useDefaultReaderSettings = (): {
    metadata?: IMetadata,
    settings: IReaderSettings,
    loading: boolean
} => {
    const { data: meta, loading } = useQuery<IMetadata>('/api/v1/meta');
    const settings = getReaderSettingsWithDefaultValueFallback(meta);

    return { metadata: meta, settings, loading };
};
