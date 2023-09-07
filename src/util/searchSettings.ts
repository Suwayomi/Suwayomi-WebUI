/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { Metadata, ISearchSettings } from '@/typings';
import requestManager from '@/lib/requests/RequestManager.ts';
import { convertFromGqlMeta, getMetadataFrom } from '@/util/metadata';

export const getDefaultSettings = (): ISearchSettings => ({
    ignoreFilters: false,
});

const getSearchSettingsWithDefaultValueFallback = (
    meta?: Metadata,
    defaultSettings: ISearchSettings = getDefaultSettings(),
    applyMetadataMigration: boolean = true,
): ISearchSettings => getMetadataFrom({ meta }, defaultSettings, applyMetadataMigration);
export const useSearchSettings = (): {
    metadata?: Metadata;
    settings: ISearchSettings;
    loading: boolean;
} => {
    const { data, loading } = requestManager.useGetGlobalMeta();
    const metadata = convertFromGqlMeta(data?.metas.nodes);
    const settings = getSearchSettingsWithDefaultValueFallback(metadata);

    return { metadata, settings, loading };
};
