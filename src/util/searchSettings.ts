import { useQuery } from 'util/client';
import { getMetadataFrom } from 'util/metadata';
import { IMetadata, ISearchSettings, MetadataKeyValuePair } from 'typings';

export const getDefaultSettings = () =>
    ({
        overrideFilters: false,
    } as ISearchSettings);

const getSearchSettingsWithDefaultValueFallback = (
    meta?: IMetadata,
    defaultSettings?: ISearchSettings,
    applyMetadataMigration: boolean = true,
): ISearchSettings => ({
    ...(getMetadataFrom(
        { meta },
        Object.entries(defaultSettings ?? getDefaultSettings()) as MetadataKeyValuePair[],
        applyMetadataMigration,
    ) as unknown as ISearchSettings),
});

export const useSearchSettings = (): {
    metadata?: IMetadata;
    settings: ISearchSettings;
    loading: boolean;
} => {
    const { data: meta, loading } = useQuery<IMetadata>('/api/v1/meta');
    const settings = getSearchSettingsWithDefaultValueFallback(meta);

    return { metadata: meta, settings, loading };
};
