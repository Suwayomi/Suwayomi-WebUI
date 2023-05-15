import { useQuery } from 'util/client';
import { getMetadataFrom } from 'util/metadata';
import { Metadata, ISearchSettings } from 'typings';

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
    const { data: meta, isLoading } = useQuery<Metadata>('/api/v1/meta');
    const settings = getSearchSettingsWithDefaultValueFallback(meta);

    return { metadata: meta, settings, loading: isLoading };
};
