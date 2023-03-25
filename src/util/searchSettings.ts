import { useQuery } from 'util/client';
import { getMetadataFrom } from 'util/metadata';
import { IMetadata, ISearchSettings } from 'typings';

export const getDefaultSettings = () =>
    ({
        ignoreFilters: false,
    } as ISearchSettings);

const getSearchSettingsWithDefaultValueFallback = (
    meta?: IMetadata,
    defaultSettings: ISearchSettings = getDefaultSettings(),
    applyMetadataMigration: boolean = true,
): ISearchSettings => ({
    ...getMetadataFrom({ meta }, defaultSettings, applyMetadataMigration),
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
