import { useQuery } from 'util/client';
import { getMetadataFrom } from 'util/metadata';

export const getDefaultSettings = () =>
    ({
        overrideFilters: false,
    } as ISearchSettings);

const getReaderSettingsWithDefaultValueFallback = (
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
    const settings = getReaderSettingsWithDefaultValueFallback(meta);

    return { metadata: meta, settings, loading };
};
