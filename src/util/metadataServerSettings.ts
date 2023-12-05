/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { Metadata, MetadataServerSettings } from '@/typings';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { convertFromGqlMeta, getMetadataFrom } from '@/util/metadata';

export const getDefaultSettings = (): MetadataServerSettings => ({
    deleteChaptersManuallyMarkedRead: false,
    deleteChaptersWhileReading: false,
    deleteChaptersWithBookmark: false,
});

const getMetadataServerSettingsWithDefaultFallback = (
    meta?: Metadata,
    defaultSettings: MetadataServerSettings = getDefaultSettings(),
    applyMetadataMigration: boolean = true,
): MetadataServerSettings => getMetadataFrom({ meta }, defaultSettings, applyMetadataMigration);
export const useMetadataServerSettings = (): {
    metadata?: Metadata;
    settings: MetadataServerSettings;
    loading: boolean;
} => {
    const { data, loading } = requestManager.useGetGlobalMeta();
    const metadata = convertFromGqlMeta(data?.metas.nodes);
    const settings = getMetadataServerSettingsWithDefaultFallback(metadata);

    return { metadata, settings, loading };
};
