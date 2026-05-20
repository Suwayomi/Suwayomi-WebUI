/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import type * as Types from './graphql-base.types';

export type CreateBackupMutationVariables = Exact<{
    input: Types.CreateBackupInput;
}>;

export type CreateBackupMutation = {
    __typename: 'Mutation';
    createBackup: { __typename: 'CreateBackupPayload'; url: string };
};

export type RestoreBackupMutationVariables = Exact<{
    backup: unknown;
    flags?: Types.PartialBackupFlagsInput | null | undefined;
}>;

export type RestoreBackupMutation = {
    __typename: 'Mutation';
    restoreBackup: {
        __typename: 'RestoreBackupPayload';
        id: string;
        status: {
            __typename: 'BackupRestoreStatus';
            mangaProgress: number;
            state: Types.BackupRestoreState;
            totalManga: number;
        } | null;
    };
};

export type ValidateBackupQueryVariables = Exact<{
    backup: unknown;
}>;

export type ValidateBackupQuery = {
    __typename: 'Query';
    validateBackup: {
        __typename: 'ValidateBackupResult';
        missingSources: Array<{ __typename: 'ValidateBackupSource'; id: string; name: string }>;
        missingTrackers: Array<{ __typename: 'ValidateBackupTracker'; name: string }>;
    };
};

export type GetRestoreStatusQueryVariables = Exact<{
    id: string;
}>;

export type GetRestoreStatusQuery = {
    __typename: 'Query';
    restoreStatus: {
        __typename: 'BackupRestoreStatus';
        mangaProgress: number;
        state: Types.BackupRestoreState;
        totalManga: number;
    } | null;
};

export type CategoryMetaFieldsFragment = {
    __typename: 'CategoryMetaType';
    categoryId: number;
    key: string;
    value: string;
};

export type CategoryBaseFieldsFragment = {
    __typename: 'CategoryType';
    id: number;
    name: string;
    default: boolean;
    order: number;
};

export type CategoryLibraryFieldsFragment = {
    __typename: 'CategoryType';
    id: number;
    name: string;
    default: boolean;
    order: number;
    meta: Array<{ __typename: 'CategoryMetaType'; categoryId: number; key: string; value: string }>;
    mangas: { __typename: 'MangaNodeList'; totalCount: number };
};

export type CategorySettingFieldsFragment = {
    __typename: 'CategoryType';
    includeInUpdate: Types.IncludeOrExclude;
    includeInDownload: Types.IncludeOrExclude;
    id: number;
    name: string;
    default: boolean;
    order: number;
};

export type CreateCategoryMutationVariables = Exact<{
    input: Types.CreateCategoryInput;
}>;

export type CreateCategoryMutation = {
    __typename: 'Mutation';
    createCategory: {
        __typename: 'CreateCategoryPayload';
        category: {
            __typename: 'CategoryType';
            includeInUpdate: Types.IncludeOrExclude;
            includeInDownload: Types.IncludeOrExclude;
            id: number;
            name: string;
            default: boolean;
            order: number;
        };
    } | null;
};

export type DeleteCategoryMutationVariables = Exact<{
    input: Types.DeleteCategoryInput;
}>;

export type DeleteCategoryMutation = {
    __typename: 'Mutation';
    deleteCategory: {
        __typename: 'DeleteCategoryPayload';
        category: { __typename: 'CategoryType'; id: number } | null;
    } | null;
};

export type UpdateCategoryMutationVariables = Exact<{
    input: Types.UpdateCategoryInput;
    getDefault: boolean;
    getIncludeInUpdate: boolean;
    getIncludeInDownload: boolean;
    getName: boolean;
}>;

export type UpdateCategoryMutation = {
    __typename: 'Mutation';
    updateCategory: {
        __typename: 'UpdateCategoryPayload';
        category: {
            __typename: 'CategoryType';
            id: number;
            default?: boolean;
            includeInUpdate?: Types.IncludeOrExclude;
            includeInDownload?: Types.IncludeOrExclude;
            name?: string;
        };
    } | null;
};

export type UpdateCategoriesMutationVariables = Exact<{
    input: Types.UpdateCategoriesInput;
    getDefault: boolean;
    getIncludeInUpdate: boolean;
    getIncludeInDownload: boolean;
    getName: boolean;
}>;

export type UpdateCategoriesMutation = {
    __typename: 'Mutation';
    updateCategories: {
        __typename: 'UpdateCategoriesPayload';
        categories: Array<{
            __typename: 'CategoryType';
            id: number;
            default?: boolean;
            includeInUpdate?: Types.IncludeOrExclude;
            includeInDownload?: Types.IncludeOrExclude;
            name?: string;
        }>;
    } | null;
};

export type UpdateCategoryOrderMutationVariables = Exact<{
    input: Types.UpdateCategoryOrderInput;
}>;

export type UpdateCategoryOrderMutation = {
    __typename: 'Mutation';
    updateCategoryOrder: {
        __typename: 'UpdateCategoryOrderPayload';
        categories: Array<{ __typename: 'CategoryType'; id: number; order: number }>;
    } | null;
};

export type UpdateCategoryMetadataMutationVariables = Exact<{
    preUpdateDeleteInput: Types.DeleteCategoryMetasInput;
    hasPreUpdateDeletions: boolean;
    updateInput: Types.SetCategoryMetasInput;
    hasUpdates: boolean;
    postUpdateDeleteInput: Types.DeleteCategoryMetasInput;
    hasPostUpdateDeletions: boolean;
    migrateInput: Types.SetCategoryMetasInput;
    isMigration: boolean;
}>;

export type UpdateCategoryMetadataMutation = {
    __typename: 'Mutation';
    preUpdateDeletedMeta?: {
        __typename: 'DeleteCategoryMetasPayload';
        metas: Array<{ __typename: 'CategoryMetaType'; categoryId: number; key: string; value: string }>;
    } | null;
    updatedMeta?: {
        __typename: 'SetCategoryMetasPayload';
        metas: Array<{ __typename: 'CategoryMetaType'; categoryId: number; key: string; value: string }>;
    } | null;
    postUpdateDeletedMeta?: {
        __typename: 'DeleteCategoryMetasPayload';
        metas: Array<{ __typename: 'CategoryMetaType'; categoryId: number; key: string; value: string }>;
    } | null;
    migrationMeta?: {
        __typename: 'SetCategoryMetasPayload';
        metas: Array<{ __typename: 'CategoryMetaType'; categoryId: number; key: string; value: string }>;
    } | null;
};

export type GetCategoriesBaseQueryVariables = Exact<{
    after?: string | null | undefined;
    before?: string | null | undefined;
    condition?: Types.CategoryConditionInput | null | undefined;
    filter?: Types.CategoryFilterInput | null | undefined;
    first?: number | null | undefined;
    last?: number | null | undefined;
    offset?: number | null | undefined;
    order?: Array<Types.CategoryOrderInput> | Types.CategoryOrderInput | null | undefined;
}>;

export type GetCategoriesBaseQuery = {
    __typename: 'Query';
    categories: {
        __typename: 'CategoryNodeList';
        totalCount: number;
        nodes: Array<{ __typename: 'CategoryType'; id: number; name: string; default: boolean; order: number }>;
        pageInfo: {
            __typename: 'PageInfo';
            endCursor: string | null;
            hasNextPage: boolean;
            hasPreviousPage: boolean;
            startCursor: string | null;
        };
    };
};

export type GetCategoriesLibraryQueryVariables = Exact<{
    after?: string | null | undefined;
    before?: string | null | undefined;
    condition?: Types.CategoryConditionInput | null | undefined;
    filter?: Types.CategoryFilterInput | null | undefined;
    first?: number | null | undefined;
    last?: number | null | undefined;
    offset?: number | null | undefined;
    order?: Array<Types.CategoryOrderInput> | Types.CategoryOrderInput | null | undefined;
}>;

export type GetCategoriesLibraryQuery = {
    __typename: 'Query';
    categories: {
        __typename: 'CategoryNodeList';
        totalCount: number;
        nodes: Array<{
            __typename: 'CategoryType';
            id: number;
            name: string;
            default: boolean;
            order: number;
            meta: Array<{ __typename: 'CategoryMetaType'; categoryId: number; key: string; value: string }>;
            mangas: { __typename: 'MangaNodeList'; totalCount: number };
        }>;
        pageInfo: {
            __typename: 'PageInfo';
            endCursor: string | null;
            hasNextPage: boolean;
            hasPreviousPage: boolean;
            startCursor: string | null;
        };
    };
};

export type GetCategoriesSettingsQueryVariables = Exact<{
    after?: string | null | undefined;
    before?: string | null | undefined;
    condition?: Types.CategoryConditionInput | null | undefined;
    filter?: Types.CategoryFilterInput | null | undefined;
    first?: number | null | undefined;
    last?: number | null | undefined;
    offset?: number | null | undefined;
    order?: Array<Types.CategoryOrderInput> | Types.CategoryOrderInput | null | undefined;
}>;

export type GetCategoriesSettingsQuery = {
    __typename: 'Query';
    categories: {
        __typename: 'CategoryNodeList';
        totalCount: number;
        nodes: Array<{
            __typename: 'CategoryType';
            includeInUpdate: Types.IncludeOrExclude;
            includeInDownload: Types.IncludeOrExclude;
            id: number;
            name: string;
            default: boolean;
            order: number;
        }>;
        pageInfo: {
            __typename: 'PageInfo';
            endCursor: string | null;
            hasNextPage: boolean;
            hasPreviousPage: boolean;
            startCursor: string | null;
        };
    };
};

export type GetCategoryMangasQueryVariables = Exact<{
    id: number;
}>;

export type GetCategoryMangasQuery = {
    __typename: 'Query';
    category: {
        __typename: 'CategoryType';
        id: number;
        mangas: {
            __typename: 'MangaNodeList';
            totalCount: number;
            nodes: Array<{
                __typename: 'MangaType';
                genre: Array<string>;
                lastFetchedAt: string | null;
                inLibraryAt: string;
                status: Types.MangaStatus;
                artist: string | null;
                author: string | null;
                description: string | null;
                id: number;
                title: string;
                thumbnailUrl: string | null;
                thumbnailUrlLastFetched: string | null;
                inLibrary: boolean;
                initialized: boolean;
                sourceId: string;
                unreadCount: number;
                downloadCount: number;
                bookmarkCount: number;
                hasDuplicateChapters: boolean;
                meta: Array<{ __typename: 'MangaMetaType'; mangaId: number; key: string; value: string }>;
                source: {
                    __typename: 'SourceType';
                    id: string;
                    name: string;
                    displayName: string;
                    lang: string;
                    iconUrl: string;
                } | null;
                trackRecords: {
                    __typename: 'TrackRecordNodeList';
                    totalCount: number;
                    nodes: Array<{ __typename: 'TrackRecordType'; id: number; trackerId: number }>;
                };
                chapters: { __typename: 'ChapterNodeList'; totalCount: number };
                firstUnreadChapter: {
                    __typename: 'ChapterType';
                    id: number;
                    sourceOrder: number;
                    isRead: boolean;
                    mangaId: number;
                    chapterNumber: number;
                    name: string;
                    scanlator: string | null;
                } | null;
                lastReadChapter: {
                    __typename: 'ChapterType';
                    id: number;
                    sourceOrder: number;
                    lastReadAt: string;
                } | null;
                latestReadChapter: {
                    __typename: 'ChapterType';
                    id: number;
                    sourceOrder: number;
                    lastReadAt: string;
                } | null;
                latestFetchedChapter: { __typename: 'ChapterType'; id: number; fetchedAt: string } | null;
                latestUploadedChapter: { __typename: 'ChapterType'; id: number; uploadDate: string } | null;
                highestNumberedChapter: { __typename: 'ChapterType'; id: number; chapterNumber: number } | null;
            }>;
            pageInfo: {
                __typename: 'PageInfo';
                endCursor: string | null;
                hasNextPage: boolean;
                hasPreviousPage: boolean;
                startCursor: string | null;
            };
        };
    };
};

export type ChapterMetaFieldsFragment = {
    __typename: 'ChapterMetaType';
    chapterId: number;
    key: string;
    value: string;
};

export type ChapterBaseFieldsFragment = {
    __typename: 'ChapterType';
    id: number;
    name: string;
    mangaId: number;
    scanlator: string | null;
    realUrl: string | null;
    sourceOrder: number;
    chapterNumber: number;
};

export type ChapterStateFieldsFragment = {
    __typename: 'ChapterType';
    id: number;
    isRead: boolean;
    isDownloaded: boolean;
    isBookmarked: boolean;
};

export type ChapterReaderFieldsFragment = {
    __typename: 'ChapterType';
    uploadDate: string;
    lastPageRead: number;
    pageCount: number;
    id: number;
    name: string;
    mangaId: number;
    scanlator: string | null;
    realUrl: string | null;
    sourceOrder: number;
    chapterNumber: number;
    isRead: boolean;
    isDownloaded: boolean;
    isBookmarked: boolean;
};

export type ChapterListFieldsFragment = {
    __typename: 'ChapterType';
    fetchedAt: string;
    uploadDate: string;
    lastReadAt: string;
    id: number;
    name: string;
    mangaId: number;
    scanlator: string | null;
    realUrl: string | null;
    sourceOrder: number;
    chapterNumber: number;
    isRead: boolean;
    isDownloaded: boolean;
    isBookmarked: boolean;
};

export type ChapterUpdateListFieldsFragment = {
    __typename: 'ChapterType';
    fetchedAt: string;
    uploadDate: string;
    lastReadAt: string;
    id: number;
    name: string;
    mangaId: number;
    scanlator: string | null;
    realUrl: string | null;
    sourceOrder: number;
    chapterNumber: number;
    isRead: boolean;
    isDownloaded: boolean;
    isBookmarked: boolean;
    manga: {
        __typename: 'MangaType';
        id: number;
        title: string;
        thumbnailUrl: string | null;
        thumbnailUrlLastFetched: string | null;
        inLibrary: boolean;
        initialized: boolean;
        sourceId: string;
    };
};

export type ChapterHistoryListFieldsFragment = {
    __typename: 'ChapterType';
    fetchedAt: string;
    uploadDate: string;
    lastReadAt: string;
    id: number;
    name: string;
    mangaId: number;
    scanlator: string | null;
    realUrl: string | null;
    sourceOrder: number;
    chapterNumber: number;
    isRead: boolean;
    isDownloaded: boolean;
    isBookmarked: boolean;
    manga: {
        __typename: 'MangaType';
        id: number;
        title: string;
        thumbnailUrl: string | null;
        thumbnailUrlLastFetched: string | null;
        inLibrary: boolean;
        initialized: boolean;
        sourceId: string;
    };
};

export type GetChapterPagesFetchMutationVariables = Exact<{
    input: Types.FetchChapterPagesInput;
}>;

export type GetChapterPagesFetchMutation = {
    __typename: 'Mutation';
    fetchChapterPages: {
        __typename: 'FetchChapterPagesPayload';
        pages: Array<string>;
        chapter: { __typename: 'ChapterType'; id: number; pageCount: number };
    } | null;
};

export type GetMangaChaptersFetchMutationVariables = Exact<{
    input: Types.FetchChaptersInput;
}>;

export type GetMangaChaptersFetchMutation = {
    __typename: 'Mutation';
    fetchChapters: {
        __typename: 'FetchChaptersPayload';
        chapters: Array<{
            __typename: 'ChapterType';
            fetchedAt: string;
            uploadDate: string;
            lastReadAt: string;
            id: number;
            name: string;
            mangaId: number;
            scanlator: string | null;
            realUrl: string | null;
            sourceOrder: number;
            chapterNumber: number;
            isRead: boolean;
            isDownloaded: boolean;
            isBookmarked: boolean;
            manga: {
                __typename: 'MangaType';
                id: number;
                unreadCount: number;
                downloadCount: number;
                bookmarkCount: number;
                hasDuplicateChapters: boolean;
                chapters: { __typename: 'ChapterNodeList'; totalCount: number };
                firstUnreadChapter: {
                    __typename: 'ChapterType';
                    id: number;
                    sourceOrder: number;
                    isRead: boolean;
                    mangaId: number;
                    chapterNumber: number;
                    name: string;
                    scanlator: string | null;
                } | null;
                lastReadChapter: {
                    __typename: 'ChapterType';
                    id: number;
                    sourceOrder: number;
                    lastReadAt: string;
                } | null;
                latestReadChapter: {
                    __typename: 'ChapterType';
                    id: number;
                    sourceOrder: number;
                    lastReadAt: string;
                } | null;
                latestFetchedChapter: { __typename: 'ChapterType'; id: number; fetchedAt: string } | null;
                latestUploadedChapter: { __typename: 'ChapterType'; id: number; uploadDate: string } | null;
                highestNumberedChapter: { __typename: 'ChapterType'; id: number; chapterNumber: number } | null;
            };
        }>;
    } | null;
};

export type UpdateChapterMutationVariables = Exact<{
    input: Types.UpdateChapterInput;
    getBookmarked: boolean;
    getRead: boolean;
    getLastPageRead: boolean;
    chapterIdToDelete: number;
    deleteChapter: boolean;
    mangaId: number;
    trackProgress: boolean;
}>;

export type UpdateChapterMutation = {
    __typename: 'Mutation';
    updateChapter: {
        __typename: 'UpdateChapterPayload';
        chapter: {
            __typename: 'ChapterType';
            id: number;
            isBookmarked?: boolean;
            isRead?: boolean;
            lastReadAt?: string;
            lastPageRead?: number;
            manga?: {
                __typename: 'MangaType';
                id: number;
                unreadCount: number;
                bookmarkCount: number;
                lastReadChapter: { __typename: 'ChapterType'; id: number } | null;
                latestReadChapter: { __typename: 'ChapterType'; id: number } | null;
                firstUnreadChapter: { __typename: 'ChapterType'; id: number } | null;
            };
        };
    } | null;
    deleteDownloadedChapter?: {
        __typename: 'DeleteDownloadedChapterPayload';
        chapters: {
            __typename: 'ChapterType';
            id: number;
            isDownloaded: boolean;
            manga: { __typename: 'MangaType'; id: number; downloadCount: number };
        };
    } | null;
    trackProgress?: {
        __typename: 'TrackProgressPayload';
        trackRecords: Array<{
            __typename: 'TrackRecordType';
            id: number;
            remoteId: string;
            trackerId: number;
            remoteUrl: string;
            title: string;
            status: number;
            lastChapterRead: number;
            totalChapters: number;
            score: number;
            displayScore: string;
            startDate: string;
            finishDate: string;
            private: boolean;
        }>;
    } | null;
};

export type UpdateChaptersMutationVariables = Exact<{
    input: Types.UpdateChaptersInput;
    getBookmarked: boolean;
    getRead: boolean;
    getLastPageRead: boolean;
    chapterIdsToDelete: Array<number> | number;
    deleteChapters: boolean;
    mangaId: number;
    trackProgress: boolean;
}>;

export type UpdateChaptersMutation = {
    __typename: 'Mutation';
    updateChapters: {
        __typename: 'UpdateChaptersPayload';
        chapters: Array<{
            __typename: 'ChapterType';
            id: number;
            isBookmarked?: boolean;
            isRead?: boolean;
            lastReadAt?: string;
            lastPageRead?: number;
            manga?: {
                __typename: 'MangaType';
                id: number;
                unreadCount: number;
                bookmarkCount: number;
                lastReadChapter: { __typename: 'ChapterType'; id: number } | null;
                latestReadChapter: { __typename: 'ChapterType'; id: number } | null;
                firstUnreadChapter: { __typename: 'ChapterType'; id: number } | null;
            };
        }>;
    } | null;
    deleteDownloadedChapters?: {
        __typename: 'DeleteDownloadedChaptersPayload';
        chapters: Array<{
            __typename: 'ChapterType';
            id: number;
            isDownloaded: boolean;
            manga: { __typename: 'MangaType'; id: number; downloadCount: number };
        }>;
    } | null;
    trackProgress?: {
        __typename: 'TrackProgressPayload';
        trackRecords: Array<{
            __typename: 'TrackRecordType';
            id: number;
            remoteId: string;
            trackerId: number;
            remoteUrl: string;
            title: string;
            status: number;
            lastChapterRead: number;
            totalChapters: number;
            score: number;
            displayScore: string;
            startDate: string;
            finishDate: string;
            private: boolean;
        }>;
    } | null;
};

export type UpdateChapterMetadataMutationVariables = Exact<{
    preUpdateDeleteInput: Types.DeleteChapterMetasInput;
    hasPreUpdateDeletions: boolean;
    updateInput: Types.SetChapterMetasInput;
    hasUpdates: boolean;
    postUpdateDeleteInput: Types.DeleteChapterMetasInput;
    hasPostUpdateDeletions: boolean;
    migrateInput: Types.SetChapterMetasInput;
    isMigration: boolean;
}>;

export type UpdateChapterMetadataMutation = {
    __typename: 'Mutation';
    preUpdateDeletedMeta?: {
        __typename: 'DeleteChapterMetasPayload';
        metas: Array<{ __typename: 'ChapterMetaType'; chapterId: number; key: string; value: string }>;
    } | null;
    updatedMeta?: {
        __typename: 'SetChapterMetasPayload';
        metas: Array<{ __typename: 'ChapterMetaType'; chapterId: number; key: string; value: string }>;
    } | null;
    postUpdateDeletedMeta?: {
        __typename: 'DeleteChapterMetasPayload';
        metas: Array<{ __typename: 'ChapterMetaType'; chapterId: number; key: string; value: string }>;
    } | null;
    migrationMeta?: {
        __typename: 'SetChapterMetasPayload';
        metas: Array<{ __typename: 'ChapterMetaType'; chapterId: number; key: string; value: string }>;
    } | null;
};

export type GetChaptersReaderQueryVariables = Exact<{
    after?: string | null | undefined;
    before?: string | null | undefined;
    condition?: Types.ChapterConditionInput | null | undefined;
    filter?: Types.ChapterFilterInput | null | undefined;
    first?: number | null | undefined;
    last?: number | null | undefined;
    offset?: number | null | undefined;
    order?: Array<Types.ChapterOrderInput> | Types.ChapterOrderInput | null | undefined;
}>;

export type GetChaptersReaderQuery = {
    __typename: 'Query';
    chapters: {
        __typename: 'ChapterNodeList';
        totalCount: number;
        nodes: Array<{
            __typename: 'ChapterType';
            uploadDate: string;
            lastPageRead: number;
            pageCount: number;
            id: number;
            name: string;
            mangaId: number;
            scanlator: string | null;
            realUrl: string | null;
            sourceOrder: number;
            chapterNumber: number;
            isRead: boolean;
            isDownloaded: boolean;
            isBookmarked: boolean;
        }>;
        pageInfo: {
            __typename: 'PageInfo';
            endCursor: string | null;
            hasNextPage: boolean;
            hasPreviousPage: boolean;
            startCursor: string | null;
        };
    };
};

export type GetChaptersMangaQueryVariables = Exact<{
    after?: string | null | undefined;
    before?: string | null | undefined;
    condition?: Types.ChapterConditionInput | null | undefined;
    filter?: Types.ChapterFilterInput | null | undefined;
    first?: number | null | undefined;
    last?: number | null | undefined;
    offset?: number | null | undefined;
    order?: Array<Types.ChapterOrderInput> | Types.ChapterOrderInput | null | undefined;
}>;

export type GetChaptersMangaQuery = {
    __typename: 'Query';
    chapters: {
        __typename: 'ChapterNodeList';
        totalCount: number;
        nodes: Array<{
            __typename: 'ChapterType';
            fetchedAt: string;
            uploadDate: string;
            lastReadAt: string;
            id: number;
            name: string;
            mangaId: number;
            scanlator: string | null;
            realUrl: string | null;
            sourceOrder: number;
            chapterNumber: number;
            isRead: boolean;
            isDownloaded: boolean;
            isBookmarked: boolean;
        }>;
        pageInfo: {
            __typename: 'PageInfo';
            endCursor: string | null;
            hasNextPage: boolean;
            hasPreviousPage: boolean;
            startCursor: string | null;
        };
    };
};

export type GetChaptersUpdatesQueryVariables = Exact<{
    after?: string | null | undefined;
    before?: string | null | undefined;
    condition?: Types.ChapterConditionInput | null | undefined;
    filter?: Types.ChapterFilterInput | null | undefined;
    first?: number | null | undefined;
    last?: number | null | undefined;
    offset?: number | null | undefined;
    order?: Array<Types.ChapterOrderInput> | Types.ChapterOrderInput | null | undefined;
}>;

export type GetChaptersUpdatesQuery = {
    __typename: 'Query';
    lastUpdateTimestamp: { __typename: 'LastUpdateTimestampPayload'; timestamp: string };
    chapters: {
        __typename: 'ChapterNodeList';
        totalCount: number;
        nodes: Array<{
            __typename: 'ChapterType';
            fetchedAt: string;
            uploadDate: string;
            lastReadAt: string;
            id: number;
            name: string;
            mangaId: number;
            scanlator: string | null;
            realUrl: string | null;
            sourceOrder: number;
            chapterNumber: number;
            isRead: boolean;
            isDownloaded: boolean;
            isBookmarked: boolean;
            manga: {
                __typename: 'MangaType';
                id: number;
                title: string;
                thumbnailUrl: string | null;
                thumbnailUrlLastFetched: string | null;
                inLibrary: boolean;
                initialized: boolean;
                sourceId: string;
            };
        }>;
        pageInfo: {
            __typename: 'PageInfo';
            endCursor: string | null;
            hasNextPage: boolean;
            hasPreviousPage: boolean;
            startCursor: string | null;
        };
    };
};

export type GetChaptersHistoryQueryVariables = Exact<{
    after?: string | null | undefined;
    before?: string | null | undefined;
    condition?: Types.ChapterConditionInput | null | undefined;
    filter?: Types.ChapterFilterInput | null | undefined;
    first?: number | null | undefined;
    last?: number | null | undefined;
    offset?: number | null | undefined;
    order?: Array<Types.ChapterOrderInput> | Types.ChapterOrderInput | null | undefined;
}>;

export type GetChaptersHistoryQuery = {
    __typename: 'Query';
    chapters: {
        __typename: 'ChapterNodeList';
        totalCount: number;
        nodes: Array<{
            __typename: 'ChapterType';
            fetchedAt: string;
            uploadDate: string;
            lastReadAt: string;
            id: number;
            name: string;
            mangaId: number;
            scanlator: string | null;
            realUrl: string | null;
            sourceOrder: number;
            chapterNumber: number;
            isRead: boolean;
            isDownloaded: boolean;
            isBookmarked: boolean;
            manga: {
                __typename: 'MangaType';
                id: number;
                title: string;
                thumbnailUrl: string | null;
                thumbnailUrlLastFetched: string | null;
                inLibrary: boolean;
                initialized: boolean;
                sourceId: string;
            };
        }>;
        pageInfo: {
            __typename: 'PageInfo';
            endCursor: string | null;
            hasNextPage: boolean;
            hasPreviousPage: boolean;
            startCursor: string | null;
        };
    };
};

export type GetMangasChapterIdsWithStateQueryVariables = Exact<{
    after?: string | null | undefined;
    before?: string | null | undefined;
    condition?: Types.ChapterConditionInput | null | undefined;
    filter?: Types.ChapterFilterInput | null | undefined;
    first?: number | null | undefined;
    last?: number | null | undefined;
    offset?: number | null | undefined;
    order?: Array<Types.ChapterOrderInput> | Types.ChapterOrderInput | null | undefined;
}>;

export type GetMangasChapterIdsWithStateQuery = {
    __typename: 'Query';
    chapters: {
        __typename: 'ChapterNodeList';
        totalCount: number;
        nodes: Array<{
            __typename: 'ChapterType';
            mangaId: number;
            scanlator: string | null;
            chapterNumber: number;
            id: number;
            isRead: boolean;
            isDownloaded: boolean;
            isBookmarked: boolean;
        }>;
        pageInfo: {
            __typename: 'PageInfo';
            endCursor: string | null;
            hasNextPage: boolean;
            hasPreviousPage: boolean;
            startCursor: string | null;
        };
    };
};

export type PageInfoFragment = {
    __typename: 'PageInfo';
    endCursor: string | null;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor: string | null;
};

export type GlobalMetadataFragment = { __typename: 'GlobalMetaType'; key: string; value: string };

export type DownloadTypeFieldsFragment = {
    __typename: 'DownloadType';
    progress: number;
    state: Types.DownloadState;
    tries: number;
    chapter: { __typename: 'ChapterType'; id: number; name: string; sourceOrder: number; isDownloaded: boolean };
    manga: { __typename: 'MangaType'; id: number; title: string; downloadCount: number };
};

export type DownloadStatusFieldsFragment = {
    __typename: 'DownloadStatus';
    state: Types.DownloaderState;
    queue: Array<{
        __typename: 'DownloadType';
        progress: number;
        state: Types.DownloadState;
        tries: number;
        chapter: { __typename: 'ChapterType'; id: number; name: string; sourceOrder: number; isDownloaded: boolean };
        manga: { __typename: 'MangaType'; id: number; title: string; downloadCount: number };
    }>;
};

export type DownloadUpdatesFieldsFragment = {
    __typename: 'DownloadUpdates';
    state: Types.DownloaderState;
    omittedUpdates: boolean;
    updates: Array<{
        __typename: 'DownloadUpdate';
        type: Types.DownloadUpdateType;
        download: {
            __typename: 'DownloadType';
            position: number;
            progress: number;
            state: Types.DownloadState;
            tries: number;
            chapter: {
                __typename: 'ChapterType';
                id: number;
                name: string;
                sourceOrder: number;
                isDownloaded: boolean;
            };
            manga: { __typename: 'MangaType'; id: number; title: string; downloadCount: number };
        };
    }>;
};

export type ClearDownloaderMutationVariables = Exact<{
    input?: Types.ClearDownloaderInput | null | undefined;
}>;

export type ClearDownloaderMutation = {
    __typename: 'Mutation';
    clearDownloader: {
        __typename: 'ClearDownloaderPayload';
        downloadStatus: {
            __typename: 'DownloadStatus';
            state: Types.DownloaderState;
            queue: Array<{
                __typename: 'DownloadType';
                progress: number;
                state: Types.DownloadState;
                tries: number;
                chapter: {
                    __typename: 'ChapterType';
                    id: number;
                    name: string;
                    sourceOrder: number;
                    isDownloaded: boolean;
                };
                manga: { __typename: 'MangaType'; id: number; title: string; downloadCount: number };
            }>;
        };
    } | null;
};

export type DeleteDownloadedChapterMutationVariables = Exact<{
    input: Types.DeleteDownloadedChapterInput;
}>;

export type DeleteDownloadedChapterMutation = {
    __typename: 'Mutation';
    deleteDownloadedChapter: {
        __typename: 'DeleteDownloadedChapterPayload';
        chapters: {
            __typename: 'ChapterType';
            id: number;
            isDownloaded: boolean;
            manga: { __typename: 'MangaType'; id: number; downloadCount: number };
        };
    } | null;
};

export type DeleteDownloadedChaptersMutationVariables = Exact<{
    input: Types.DeleteDownloadedChaptersInput;
}>;

export type DeleteDownloadedChaptersMutation = {
    __typename: 'Mutation';
    deleteDownloadedChapters: {
        __typename: 'DeleteDownloadedChaptersPayload';
        chapters: Array<{
            __typename: 'ChapterType';
            id: number;
            isDownloaded: boolean;
            manga: { __typename: 'MangaType'; id: number; downloadCount: number };
        }>;
    } | null;
};

export type DequeueChapterDownloadMutationVariables = Exact<{
    input: Types.DequeueChapterDownloadInput;
}>;

export type DequeueChapterDownloadMutation = {
    __typename: 'Mutation';
    dequeueChapterDownload: {
        __typename: 'DequeueChapterDownloadPayload';
        downloadStatus: {
            __typename: 'DownloadStatus';
            state: Types.DownloaderState;
            queue: Array<{
                __typename: 'DownloadType';
                progress: number;
                state: Types.DownloadState;
                tries: number;
                chapter: {
                    __typename: 'ChapterType';
                    id: number;
                    name: string;
                    sourceOrder: number;
                    isDownloaded: boolean;
                };
                manga: { __typename: 'MangaType'; id: number; title: string; downloadCount: number };
            }>;
        };
    } | null;
};

export type DequeueChapterDownloadsMutationVariables = Exact<{
    input: Types.DequeueChapterDownloadsInput;
}>;

export type DequeueChapterDownloadsMutation = {
    __typename: 'Mutation';
    dequeueChapterDownloads: {
        __typename: 'DequeueChapterDownloadsPayload';
        downloadStatus: {
            __typename: 'DownloadStatus';
            state: Types.DownloaderState;
            queue: Array<{
                __typename: 'DownloadType';
                progress: number;
                state: Types.DownloadState;
                tries: number;
                chapter: {
                    __typename: 'ChapterType';
                    id: number;
                    name: string;
                    sourceOrder: number;
                    isDownloaded: boolean;
                };
                manga: { __typename: 'MangaType'; id: number; title: string; downloadCount: number };
            }>;
        };
    } | null;
};

export type EnqueueChapterDownloadMutationVariables = Exact<{
    input: Types.EnqueueChapterDownloadInput;
}>;

export type EnqueueChapterDownloadMutation = {
    __typename: 'Mutation';
    enqueueChapterDownload: {
        __typename: 'EnqueueChapterDownloadPayload';
        downloadStatus: {
            __typename: 'DownloadStatus';
            state: Types.DownloaderState;
            queue: Array<{
                __typename: 'DownloadType';
                progress: number;
                state: Types.DownloadState;
                tries: number;
                chapter: {
                    __typename: 'ChapterType';
                    id: number;
                    name: string;
                    sourceOrder: number;
                    isDownloaded: boolean;
                };
                manga: { __typename: 'MangaType'; id: number; title: string; downloadCount: number };
            }>;
        };
    } | null;
};

export type EnqueueChapterDownloadsMutationVariables = Exact<{
    input: Types.EnqueueChapterDownloadsInput;
}>;

export type EnqueueChapterDownloadsMutation = {
    __typename: 'Mutation';
    enqueueChapterDownloads: {
        __typename: 'EnqueueChapterDownloadsPayload';
        downloadStatus: {
            __typename: 'DownloadStatus';
            state: Types.DownloaderState;
            queue: Array<{
                __typename: 'DownloadType';
                progress: number;
                state: Types.DownloadState;
                tries: number;
                chapter: {
                    __typename: 'ChapterType';
                    id: number;
                    name: string;
                    sourceOrder: number;
                    isDownloaded: boolean;
                };
                manga: { __typename: 'MangaType'; id: number; title: string; downloadCount: number };
            }>;
        };
    } | null;
};

export type ReorderChapterDownloadMutationVariables = Exact<{
    input: Types.ReorderChapterDownloadInput;
}>;

export type ReorderChapterDownloadMutation = {
    __typename: 'Mutation';
    reorderChapterDownload: {
        __typename: 'ReorderChapterDownloadPayload';
        downloadStatus: {
            __typename: 'DownloadStatus';
            state: Types.DownloaderState;
            queue: Array<{
                __typename: 'DownloadType';
                progress: number;
                state: Types.DownloadState;
                tries: number;
                chapter: {
                    __typename: 'ChapterType';
                    id: number;
                    name: string;
                    sourceOrder: number;
                    isDownloaded: boolean;
                };
                manga: { __typename: 'MangaType'; id: number; title: string; downloadCount: number };
            }>;
        };
    } | null;
};

export type StartDownloaderMutationVariables = Exact<{
    input?: Types.StartDownloaderInput | null | undefined;
}>;

export type StartDownloaderMutation = {
    __typename: 'Mutation';
    startDownloader: {
        __typename: 'StartDownloaderPayload';
        downloadStatus: { __typename: 'DownloadStatus'; state: Types.DownloaderState };
    } | null;
};

export type StopDownloaderMutationVariables = Exact<{
    input?: Types.StopDownloaderInput | null | undefined;
}>;

export type StopDownloaderMutation = {
    __typename: 'Mutation';
    stopDownloader: {
        __typename: 'StopDownloaderPayload';
        downloadStatus: { __typename: 'DownloadStatus'; state: Types.DownloaderState };
    } | null;
};

export type GetDownloadStatusQueryVariables = Exact<{ [key: string]: never }>;

export type GetDownloadStatusQuery = {
    __typename: 'Query';
    downloadStatus: {
        __typename: 'DownloadStatus';
        state: Types.DownloaderState;
        queue: Array<{
            __typename: 'DownloadType';
            progress: number;
            state: Types.DownloadState;
            tries: number;
            chapter: {
                __typename: 'ChapterType';
                id: number;
                name: string;
                sourceOrder: number;
                isDownloaded: boolean;
            };
            manga: { __typename: 'MangaType'; id: number; title: string; downloadCount: number };
        }>;
    };
};

export type DownloadStatusSubscriptionVariables = Exact<{
    input: Types.DownloadChangedInput;
}>;

export type DownloadStatusSubscription = {
    __typename: 'Subscription';
    downloadStatusChanged: {
        __typename: 'DownloadUpdates';
        state: Types.DownloaderState;
        omittedUpdates: boolean;
        updates: Array<{
            __typename: 'DownloadUpdate';
            type: Types.DownloadUpdateType;
            download: {
                __typename: 'DownloadType';
                position: number;
                progress: number;
                state: Types.DownloadState;
                tries: number;
                chapter: {
                    __typename: 'ChapterType';
                    id: number;
                    name: string;
                    sourceOrder: number;
                    isDownloaded: boolean;
                };
                manga: { __typename: 'MangaType'; id: number; title: string; downloadCount: number };
            };
        }>;
    };
};

export type ExtensionListFieldsFragment = {
    __typename: 'ExtensionType';
    pkgName: string;
    name: string;
    lang: string;
    versionCode: number;
    versionName: string;
    iconUrl: string;
    repo: string | null;
    isNsfw: boolean;
    isInstalled: boolean;
    isObsolete: boolean;
    hasUpdate: boolean;
};

export type GetExtensionsFetchMutationVariables = Exact<{
    input?: Types.FetchExtensionsInput | null | undefined;
}>;

export type GetExtensionsFetchMutation = {
    __typename: 'Mutation';
    fetchExtensions: {
        __typename: 'FetchExtensionsPayload';
        extensions: Array<{
            __typename: 'ExtensionType';
            pkgName: string;
            name: string;
            lang: string;
            versionCode: number;
            versionName: string;
            iconUrl: string;
            repo: string | null;
            isNsfw: boolean;
            isInstalled: boolean;
            isObsolete: boolean;
            hasUpdate: boolean;
        }>;
    } | null;
};

export type UpdateExtensionMutationVariables = Exact<{
    input: Types.UpdateExtensionInput;
}>;

export type UpdateExtensionMutation = {
    __typename: 'Mutation';
    updateExtension: {
        __typename: 'UpdateExtensionPayload';
        extension: {
            __typename: 'ExtensionType';
            pkgName: string;
            name: string;
            lang: string;
            versionCode: number;
            versionName: string;
            iconUrl: string;
            repo: string | null;
            isNsfw: boolean;
            isInstalled: boolean;
            isObsolete: boolean;
            hasUpdate: boolean;
        } | null;
    } | null;
};

export type UpdateExtensionsMutationVariables = Exact<{
    input: Types.UpdateExtensionsInput;
}>;

export type UpdateExtensionsMutation = {
    __typename: 'Mutation';
    updateExtensions: {
        __typename: 'UpdateExtensionsPayload';
        extensions: Array<{
            __typename: 'ExtensionType';
            pkgName: string;
            name: string;
            lang: string;
            versionCode: number;
            versionName: string;
            iconUrl: string;
            repo: string | null;
            isNsfw: boolean;
            isInstalled: boolean;
            isObsolete: boolean;
            hasUpdate: boolean;
        }>;
    } | null;
};

export type InstallExternalExtensionMutationVariables = Exact<{
    file: unknown;
}>;

export type InstallExternalExtensionMutation = {
    __typename: 'Mutation';
    installExternalExtension: {
        __typename: 'InstallExternalExtensionPayload';
        extension: {
            __typename: 'ExtensionType';
            pkgName: string;
            name: string;
            lang: string;
            versionCode: number;
            versionName: string;
            iconUrl: string;
            repo: string | null;
            isNsfw: boolean;
            isInstalled: boolean;
            isObsolete: boolean;
            hasUpdate: boolean;
        };
    } | null;
};

export type GetExtensionQueryVariables = Exact<{
    pkgName: string;
}>;

export type GetExtensionQuery = {
    __typename: 'Query';
    extension: {
        __typename: 'ExtensionType';
        pkgName: string;
        name: string;
        lang: string;
        versionCode: number;
        versionName: string;
        iconUrl: string;
        repo: string | null;
        isNsfw: boolean;
        isInstalled: boolean;
        isObsolete: boolean;
        hasUpdate: boolean;
    };
};

export type GetExtensionsQueryVariables = Exact<{
    after?: string | null | undefined;
    before?: string | null | undefined;
    condition?: Types.ExtensionConditionInput | null | undefined;
    filter?: Types.ExtensionFilterInput | null | undefined;
    first?: number | null | undefined;
    last?: number | null | undefined;
    offset?: number | null | undefined;
    order?: Array<Types.ExtensionOrderInput> | Types.ExtensionOrderInput | null | undefined;
}>;

export type GetExtensionsQuery = {
    __typename: 'Query';
    extensions: {
        __typename: 'ExtensionNodeList';
        totalCount: number;
        nodes: Array<{
            __typename: 'ExtensionType';
            pkgName: string;
            name: string;
            lang: string;
            versionCode: number;
            versionName: string;
            iconUrl: string;
            repo: string | null;
            isNsfw: boolean;
            isInstalled: boolean;
            isObsolete: boolean;
            hasUpdate: boolean;
        }>;
        pageInfo: {
            __typename: 'PageInfo';
            endCursor: string | null;
            hasNextPage: boolean;
            hasPreviousPage: boolean;
            startCursor: string | null;
        };
    };
};

export type ClearServerCacheMutationVariables = Exact<{
    input: Types.ClearCachedImagesInput;
}>;

export type ClearServerCacheMutation = {
    __typename: 'Mutation';
    clearCachedImages: {
        __typename: 'ClearCachedImagesPayload';
        cachedPages: boolean | null;
        cachedThumbnails: boolean | null;
        downloadedThumbnails: boolean | null;
    };
};

export type KoSyncStatusFragment = {
    __typename: 'KoSyncStatusPayload';
    isLoggedIn: boolean;
    serverAddress: string | null;
    username: string | null;
};

export type KoSyncLoginMutationVariables = Exact<{
    serverAddress: string;
    username: string;
    password: string;
}>;

export type KoSyncLoginMutation = {
    __typename: 'Mutation';
    connectKoSyncAccount: {
        __typename: 'KoSyncConnectPayload';
        message: string | null;
        status: {
            __typename: 'KoSyncStatusPayload';
            isLoggedIn: boolean;
            serverAddress: string | null;
            username: string | null;
        };
    };
};

export type KoSyncLogoutMutationVariables = Exact<{ [key: string]: never }>;

export type KoSyncLogoutMutation = {
    __typename: 'Mutation';
    logoutKoSyncAccount: {
        __typename: 'LogoutKoSyncAccountPayload';
        status: {
            __typename: 'KoSyncStatusPayload';
            isLoggedIn: boolean;
            serverAddress: string | null;
            username: string | null;
        };
    };
};

export type GetKoSyncStatusQueryVariables = Exact<{ [key: string]: never }>;

export type GetKoSyncStatusQuery = {
    __typename: 'Query';
    koSyncStatus: {
        __typename: 'KoSyncStatusPayload';
        isLoggedIn: boolean;
        serverAddress: string | null;
        username: string | null;
    };
};

export type MangaMetaFieldsFragment = { __typename: 'MangaMetaType'; mangaId: number; key: string; value: string };

export type MangaBaseFieldsFragment = {
    __typename: 'MangaType';
    id: number;
    title: string;
    thumbnailUrl: string | null;
    thumbnailUrlLastFetched: string | null;
    inLibrary: boolean;
    initialized: boolean;
    sourceId: string;
};

export type MangaChapterStatFieldsFragment = {
    __typename: 'MangaType';
    id: number;
    unreadCount: number;
    downloadCount: number;
    bookmarkCount: number;
    hasDuplicateChapters: boolean;
    chapters: { __typename: 'ChapterNodeList'; totalCount: number };
};

export type MangaChapterNodeFieldsFragment = {
    __typename: 'MangaType';
    firstUnreadChapter: {
        __typename: 'ChapterType';
        id: number;
        sourceOrder: number;
        isRead: boolean;
        mangaId: number;
        chapterNumber: number;
        name: string;
        scanlator: string | null;
    } | null;
    lastReadChapter: { __typename: 'ChapterType'; id: number; sourceOrder: number; lastReadAt: string } | null;
    latestReadChapter: { __typename: 'ChapterType'; id: number; sourceOrder: number; lastReadAt: string } | null;
    latestFetchedChapter: { __typename: 'ChapterType'; id: number; fetchedAt: string } | null;
    latestUploadedChapter: { __typename: 'ChapterType'; id: number; uploadDate: string } | null;
    highestNumberedChapter: { __typename: 'ChapterType'; id: number; chapterNumber: number } | null;
};

export type MangaReaderFieldsFragment = {
    __typename: 'MangaType';
    genre: Array<string>;
    id: number;
    title: string;
    thumbnailUrl: string | null;
    thumbnailUrlLastFetched: string | null;
    inLibrary: boolean;
    initialized: boolean;
    sourceId: string;
    source: {
        __typename: 'SourceType';
        id: string;
        name: string;
        displayName: string;
        lang: string;
        iconUrl: string;
    } | null;
    meta: Array<{ __typename: 'MangaMetaType'; mangaId: number; key: string; value: string }>;
    chapters: { __typename: 'ChapterNodeList'; totalCount: number };
    trackRecords: { __typename: 'TrackRecordNodeList'; totalCount: number };
};

export type MangaLibraryFieldsFragment = {
    __typename: 'MangaType';
    genre: Array<string>;
    lastFetchedAt: string | null;
    inLibraryAt: string;
    status: Types.MangaStatus;
    artist: string | null;
    author: string | null;
    description: string | null;
    id: number;
    title: string;
    thumbnailUrl: string | null;
    thumbnailUrlLastFetched: string | null;
    inLibrary: boolean;
    initialized: boolean;
    sourceId: string;
    unreadCount: number;
    downloadCount: number;
    bookmarkCount: number;
    hasDuplicateChapters: boolean;
    meta: Array<{ __typename: 'MangaMetaType'; mangaId: number; key: string; value: string }>;
    source: {
        __typename: 'SourceType';
        id: string;
        name: string;
        displayName: string;
        lang: string;
        iconUrl: string;
    } | null;
    trackRecords: {
        __typename: 'TrackRecordNodeList';
        totalCount: number;
        nodes: Array<{ __typename: 'TrackRecordType'; id: number; trackerId: number }>;
    };
    chapters: { __typename: 'ChapterNodeList'; totalCount: number };
    firstUnreadChapter: {
        __typename: 'ChapterType';
        id: number;
        sourceOrder: number;
        isRead: boolean;
        mangaId: number;
        chapterNumber: number;
        name: string;
        scanlator: string | null;
    } | null;
    lastReadChapter: { __typename: 'ChapterType'; id: number; sourceOrder: number; lastReadAt: string } | null;
    latestReadChapter: { __typename: 'ChapterType'; id: number; sourceOrder: number; lastReadAt: string } | null;
    latestFetchedChapter: { __typename: 'ChapterType'; id: number; fetchedAt: string } | null;
    latestUploadedChapter: { __typename: 'ChapterType'; id: number; uploadDate: string } | null;
    highestNumberedChapter: { __typename: 'ChapterType'; id: number; chapterNumber: number } | null;
};

export type MangaMigrationFieldsFragment = {
    __typename: 'MangaType';
    artist: string | null;
    author: string | null;
    id: number;
    title: string;
    thumbnailUrl: string | null;
    thumbnailUrlLastFetched: string | null;
    inLibrary: boolean;
    initialized: boolean;
    sourceId: string;
    source: { __typename: 'SourceType'; id: string; name: string; displayName: string } | null;
    firstUnreadChapter: {
        __typename: 'ChapterType';
        id: number;
        sourceOrder: number;
        isRead: boolean;
        mangaId: number;
        chapterNumber: number;
        name: string;
        scanlator: string | null;
    } | null;
    lastReadChapter: { __typename: 'ChapterType'; id: number; sourceOrder: number; lastReadAt: string } | null;
    latestReadChapter: { __typename: 'ChapterType'; id: number; sourceOrder: number; lastReadAt: string } | null;
    latestFetchedChapter: { __typename: 'ChapterType'; id: number; fetchedAt: string } | null;
    latestUploadedChapter: { __typename: 'ChapterType'; id: number; uploadDate: string } | null;
    highestNumberedChapter: { __typename: 'ChapterType'; id: number; chapterNumber: number } | null;
};

export type MangaScreenFieldsFragment = {
    __typename: 'MangaType';
    artist: string | null;
    author: string | null;
    description: string | null;
    status: Types.MangaStatus;
    realUrl: string | null;
    sourceId: string;
    genre: Array<string>;
    lastFetchedAt: string | null;
    inLibraryAt: string;
    id: number;
    title: string;
    thumbnailUrl: string | null;
    thumbnailUrlLastFetched: string | null;
    inLibrary: boolean;
    initialized: boolean;
    unreadCount: number;
    downloadCount: number;
    bookmarkCount: number;
    hasDuplicateChapters: boolean;
    meta: Array<{ __typename: 'MangaMetaType'; mangaId: number; key: string; value: string }>;
    source: {
        __typename: 'SourceType';
        id: string;
        name: string;
        displayName: string;
        lang: string;
        iconUrl: string;
    } | null;
    trackRecords: {
        __typename: 'TrackRecordNodeList';
        totalCount: number;
        nodes: Array<{ __typename: 'TrackRecordType'; id: number; trackerId: number }>;
    };
    firstUnreadChapter: {
        __typename: 'ChapterType';
        id: number;
        sourceOrder: number;
        isRead: boolean;
        mangaId: number;
        chapterNumber: number;
        name: string;
        scanlator: string | null;
    } | null;
    lastReadChapter: { __typename: 'ChapterType'; id: number; sourceOrder: number; lastReadAt: string } | null;
    latestReadChapter: { __typename: 'ChapterType'; id: number; sourceOrder: number; lastReadAt: string } | null;
    latestFetchedChapter: { __typename: 'ChapterType'; id: number; fetchedAt: string } | null;
    latestUploadedChapter: { __typename: 'ChapterType'; id: number; uploadDate: string } | null;
    highestNumberedChapter: { __typename: 'ChapterType'; id: number; chapterNumber: number } | null;
    chapters: { __typename: 'ChapterNodeList'; totalCount: number };
};

export type MangaLibraryDuplicateScreenFieldsFragment = {
    __typename: 'MangaType';
    description: string | null;
    id: number;
    title: string;
    thumbnailUrl: string | null;
    thumbnailUrlLastFetched: string | null;
    inLibrary: boolean;
    initialized: boolean;
    sourceId: string;
    unreadCount: number;
    downloadCount: number;
    bookmarkCount: number;
    hasDuplicateChapters: boolean;
    chapters: { __typename: 'ChapterNodeList'; totalCount: number };
};

export type GetMangaFetchMutationVariables = Exact<{
    input: Types.FetchMangaInput;
}>;

export type GetMangaFetchMutation = {
    __typename: 'Mutation';
    fetchManga: {
        __typename: 'FetchMangaPayload';
        manga: {
            __typename: 'MangaType';
            artist: string | null;
            author: string | null;
            description: string | null;
            status: Types.MangaStatus;
            realUrl: string | null;
            sourceId: string;
            genre: Array<string>;
            lastFetchedAt: string | null;
            inLibraryAt: string;
            id: number;
            title: string;
            thumbnailUrl: string | null;
            thumbnailUrlLastFetched: string | null;
            inLibrary: boolean;
            initialized: boolean;
            unreadCount: number;
            downloadCount: number;
            bookmarkCount: number;
            hasDuplicateChapters: boolean;
            meta: Array<{ __typename: 'MangaMetaType'; mangaId: number; key: string; value: string }>;
            source: {
                __typename: 'SourceType';
                id: string;
                name: string;
                displayName: string;
                lang: string;
                iconUrl: string;
            } | null;
            trackRecords: {
                __typename: 'TrackRecordNodeList';
                totalCount: number;
                nodes: Array<{ __typename: 'TrackRecordType'; id: number; trackerId: number }>;
            };
            firstUnreadChapter: {
                __typename: 'ChapterType';
                id: number;
                sourceOrder: number;
                isRead: boolean;
                mangaId: number;
                chapterNumber: number;
                name: string;
                scanlator: string | null;
            } | null;
            lastReadChapter: { __typename: 'ChapterType'; id: number; sourceOrder: number; lastReadAt: string } | null;
            latestReadChapter: {
                __typename: 'ChapterType';
                id: number;
                sourceOrder: number;
                lastReadAt: string;
            } | null;
            latestFetchedChapter: { __typename: 'ChapterType'; id: number; fetchedAt: string } | null;
            latestUploadedChapter: { __typename: 'ChapterType'; id: number; uploadDate: string } | null;
            highestNumberedChapter: { __typename: 'ChapterType'; id: number; chapterNumber: number } | null;
            chapters: { __typename: 'ChapterNodeList'; totalCount: number };
        };
    } | null;
};

export type RefreshMangaMutationVariables = Exact<{
    id: number;
}>;

export type RefreshMangaMutation = {
    __typename: 'Mutation';
    fetchChapters: {
        __typename: 'FetchChaptersPayload';
        chapters: Array<{
            __typename: 'ChapterType';
            fetchedAt: string;
            uploadDate: string;
            lastReadAt: string;
            id: number;
            name: string;
            mangaId: number;
            scanlator: string | null;
            realUrl: string | null;
            sourceOrder: number;
            chapterNumber: number;
            isRead: boolean;
            isDownloaded: boolean;
            isBookmarked: boolean;
        }>;
    } | null;
    fetchManga: {
        __typename: 'FetchMangaPayload';
        manga: {
            __typename: 'MangaType';
            artist: string | null;
            author: string | null;
            description: string | null;
            status: Types.MangaStatus;
            realUrl: string | null;
            sourceId: string;
            genre: Array<string>;
            lastFetchedAt: string | null;
            inLibraryAt: string;
            id: number;
            title: string;
            thumbnailUrl: string | null;
            thumbnailUrlLastFetched: string | null;
            inLibrary: boolean;
            initialized: boolean;
            unreadCount: number;
            downloadCount: number;
            bookmarkCount: number;
            hasDuplicateChapters: boolean;
            meta: Array<{ __typename: 'MangaMetaType'; mangaId: number; key: string; value: string }>;
            source: {
                __typename: 'SourceType';
                id: string;
                name: string;
                displayName: string;
                lang: string;
                iconUrl: string;
            } | null;
            trackRecords: {
                __typename: 'TrackRecordNodeList';
                totalCount: number;
                nodes: Array<{ __typename: 'TrackRecordType'; id: number; trackerId: number }>;
            };
            firstUnreadChapter: {
                __typename: 'ChapterType';
                id: number;
                sourceOrder: number;
                isRead: boolean;
                mangaId: number;
                chapterNumber: number;
                name: string;
                scanlator: string | null;
            } | null;
            lastReadChapter: { __typename: 'ChapterType'; id: number; sourceOrder: number; lastReadAt: string } | null;
            latestReadChapter: {
                __typename: 'ChapterType';
                id: number;
                sourceOrder: number;
                lastReadAt: string;
            } | null;
            latestFetchedChapter: { __typename: 'ChapterType'; id: number; fetchedAt: string } | null;
            latestUploadedChapter: { __typename: 'ChapterType'; id: number; uploadDate: string } | null;
            highestNumberedChapter: { __typename: 'ChapterType'; id: number; chapterNumber: number } | null;
            chapters: { __typename: 'ChapterNodeList'; totalCount: number };
        };
    } | null;
};

export type GetMangaToMigrateToFetchMutationVariables = Exact<{
    id: number;
    migrateChapters: boolean;
    migrateCategories: boolean;
    migrateTracking: boolean;
}>;

export type GetMangaToMigrateToFetchMutation = {
    __typename: 'Mutation';
    fetchManga: {
        __typename: 'FetchMangaPayload';
        manga: {
            __typename: 'MangaType';
            id: number;
            title: string;
            inLibrary: boolean;
            categories?: { __typename: 'CategoryNodeList'; nodes: Array<{ __typename: 'CategoryType'; id: number }> };
            trackRecords?: {
                __typename: 'TrackRecordNodeList';
                nodes: Array<{ __typename: 'TrackRecordType'; id: number; remoteId: string; trackerId: number }>;
            };
        };
    } | null;
    fetchChapters?: {
        __typename: 'FetchChaptersPayload';
        chapters: Array<{
            __typename: 'ChapterType';
            id: number;
            chapterNumber: number;
            isRead: boolean;
            isDownloaded: boolean;
            isBookmarked: boolean;
            manga: { __typename: 'MangaType'; id: number };
        }>;
    } | null;
};

export type UpdateMangaMutationVariables = Exact<{
    input: Types.UpdateMangaInput;
    updateCategoryInput: Types.UpdateMangaCategoriesInput;
    updateCategories: boolean;
}>;

export type UpdateMangaMutation = {
    __typename: 'Mutation';
    updateMangaCategories?: {
        __typename: 'UpdateMangaCategoriesPayload';
        manga: {
            __typename: 'MangaType';
            id: number;
            categories: {
                __typename: 'CategoryNodeList';
                totalCount: number;
                nodes: Array<{
                    __typename: 'CategoryType';
                    id: number;
                    mangas: { __typename: 'MangaNodeList'; totalCount: number };
                }>;
            };
        };
    } | null;
    updateManga: {
        __typename: 'UpdateMangaPayload';
        manga: { __typename: 'MangaType'; id: number; inLibrary: boolean; inLibraryAt: string };
    } | null;
};

export type UpdateMangasMutationVariables = Exact<{
    input: Types.UpdateMangasInput;
    updateCategoryInput: Types.UpdateMangasCategoriesInput;
    updateCategories: boolean;
}>;

export type UpdateMangasMutation = {
    __typename: 'Mutation';
    updateMangasCategories?: {
        __typename: 'UpdateMangasCategoriesPayload';
        mangas: Array<{
            __typename: 'MangaType';
            id: number;
            categories: {
                __typename: 'CategoryNodeList';
                totalCount: number;
                nodes: Array<{
                    __typename: 'CategoryType';
                    id: number;
                    mangas: { __typename: 'MangaNodeList'; totalCount: number };
                }>;
            };
        }>;
    } | null;
    updateMangas: {
        __typename: 'UpdateMangasPayload';
        mangas: Array<{
            __typename: 'MangaType';
            id: number;
            inLibrary: boolean;
            inLibraryAt: string;
            categories: {
                __typename: 'CategoryNodeList';
                totalCount: number;
                nodes: Array<{
                    __typename: 'CategoryType';
                    id: number;
                    mangas: { __typename: 'MangaNodeList'; totalCount: number };
                }>;
            };
        }>;
    } | null;
};

export type UpdateMangaCategoriesMutationVariables = Exact<{
    input: Types.UpdateMangaCategoriesInput;
}>;

export type UpdateMangaCategoriesMutation = {
    __typename: 'Mutation';
    updateMangaCategories: {
        __typename: 'UpdateMangaCategoriesPayload';
        manga: {
            __typename: 'MangaType';
            id: number;
            categories: {
                __typename: 'CategoryNodeList';
                totalCount: number;
                nodes: Array<{
                    __typename: 'CategoryType';
                    id: number;
                    mangas: { __typename: 'MangaNodeList'; totalCount: number };
                }>;
            };
        };
    } | null;
};

export type UpdateMangasCategoriesMutationVariables = Exact<{
    input: Types.UpdateMangasCategoriesInput;
}>;

export type UpdateMangasCategoriesMutation = {
    __typename: 'Mutation';
    updateMangasCategories: {
        __typename: 'UpdateMangasCategoriesPayload';
        mangas: Array<{
            __typename: 'MangaType';
            id: number;
            categories: {
                __typename: 'CategoryNodeList';
                totalCount: number;
                nodes: Array<{
                    __typename: 'CategoryType';
                    id: number;
                    mangas: { __typename: 'MangaNodeList'; totalCount: number };
                }>;
            };
        }>;
    } | null;
};

export type UpdateMangaMetadataMutationVariables = Exact<{
    preUpdateDeleteInput: Types.DeleteMangaMetasInput;
    hasPreUpdateDeletions: boolean;
    updateInput: Types.SetMangaMetasInput;
    hasUpdates: boolean;
    postUpdateDeleteInput: Types.DeleteMangaMetasInput;
    hasPostUpdateDeletions: boolean;
    migrateInput: Types.SetMangaMetasInput;
    isMigration: boolean;
}>;

export type UpdateMangaMetadataMutation = {
    __typename: 'Mutation';
    preUpdateDeletedMeta?: {
        __typename: 'DeleteMangaMetasPayload';
        metas: Array<{ __typename: 'MangaMetaType'; mangaId: number; key: string; value: string }>;
    } | null;
    updatedMeta?: {
        __typename: 'SetMangaMetasPayload';
        metas: Array<{ __typename: 'MangaMetaType'; mangaId: number; key: string; value: string }>;
    } | null;
    postUpdateDeletedMeta?: {
        __typename: 'DeleteMangaMetasPayload';
        metas: Array<{ __typename: 'MangaMetaType'; mangaId: number; key: string; value: string }>;
    } | null;
    migrationMeta?: {
        __typename: 'SetMangaMetasPayload';
        metas: Array<{ __typename: 'MangaMetaType'; mangaId: number; key: string; value: string }>;
    } | null;
};

export type GetMangaScreenQueryVariables = Exact<{
    id: number;
}>;

export type GetMangaScreenQuery = {
    __typename: 'Query';
    manga: {
        __typename: 'MangaType';
        artist: string | null;
        author: string | null;
        description: string | null;
        status: Types.MangaStatus;
        realUrl: string | null;
        sourceId: string;
        genre: Array<string>;
        lastFetchedAt: string | null;
        inLibraryAt: string;
        id: number;
        title: string;
        thumbnailUrl: string | null;
        thumbnailUrlLastFetched: string | null;
        inLibrary: boolean;
        initialized: boolean;
        unreadCount: number;
        downloadCount: number;
        bookmarkCount: number;
        hasDuplicateChapters: boolean;
        meta: Array<{ __typename: 'MangaMetaType'; mangaId: number; key: string; value: string }>;
        source: {
            __typename: 'SourceType';
            id: string;
            name: string;
            displayName: string;
            lang: string;
            iconUrl: string;
        } | null;
        trackRecords: {
            __typename: 'TrackRecordNodeList';
            totalCount: number;
            nodes: Array<{ __typename: 'TrackRecordType'; id: number; trackerId: number }>;
        };
        firstUnreadChapter: {
            __typename: 'ChapterType';
            id: number;
            sourceOrder: number;
            isRead: boolean;
            mangaId: number;
            chapterNumber: number;
            name: string;
            scanlator: string | null;
        } | null;
        lastReadChapter: { __typename: 'ChapterType'; id: number; sourceOrder: number; lastReadAt: string } | null;
        latestReadChapter: { __typename: 'ChapterType'; id: number; sourceOrder: number; lastReadAt: string } | null;
        latestFetchedChapter: { __typename: 'ChapterType'; id: number; fetchedAt: string } | null;
        latestUploadedChapter: { __typename: 'ChapterType'; id: number; uploadDate: string } | null;
        highestNumberedChapter: { __typename: 'ChapterType'; id: number; chapterNumber: number } | null;
        chapters: { __typename: 'ChapterNodeList'; totalCount: number };
    };
};

export type GetMangaReaderQueryVariables = Exact<{
    id: number;
}>;

export type GetMangaReaderQuery = {
    __typename: 'Query';
    manga: {
        __typename: 'MangaType';
        genre: Array<string>;
        id: number;
        title: string;
        thumbnailUrl: string | null;
        thumbnailUrlLastFetched: string | null;
        inLibrary: boolean;
        initialized: boolean;
        sourceId: string;
        source: {
            __typename: 'SourceType';
            id: string;
            name: string;
            displayName: string;
            lang: string;
            iconUrl: string;
        } | null;
        meta: Array<{ __typename: 'MangaMetaType'; mangaId: number; key: string; value: string }>;
        chapters: { __typename: 'ChapterNodeList'; totalCount: number };
        trackRecords: { __typename: 'TrackRecordNodeList'; totalCount: number };
    };
};

export type GetMangaTrackRecordsQueryVariables = Exact<{
    id: number;
}>;

export type GetMangaTrackRecordsQuery = {
    __typename: 'Query';
    manga: {
        __typename: 'MangaType';
        id: number;
        trackRecords: {
            __typename: 'TrackRecordNodeList';
            totalCount: number;
            nodes: Array<{
                __typename: 'TrackRecordType';
                id: number;
                remoteId: string;
                trackerId: number;
                remoteUrl: string;
                title: string;
                status: number;
                lastChapterRead: number;
                totalChapters: number;
                score: number;
                displayScore: string;
                startDate: string;
                finishDate: string;
                private: boolean;
            }>;
        };
    };
};

export type GetMangaCategoriesQueryVariables = Exact<{
    id: number;
}>;

export type GetMangaCategoriesQuery = {
    __typename: 'Query';
    manga: {
        __typename: 'MangaType';
        id: number;
        categories: {
            __typename: 'CategoryNodeList';
            totalCount: number;
            nodes: Array<{ __typename: 'CategoryType'; id: number }>;
        };
    };
};

export type GetMangaToMigrateQueryVariables = Exact<{
    id: number;
    getChapterData: boolean;
    migrateCategories: boolean;
    migrateTracking: boolean;
    migrateMetadata: boolean;
}>;

export type GetMangaToMigrateQuery = {
    __typename: 'Query';
    manga: {
        __typename: 'MangaType';
        id: number;
        inLibrary: boolean;
        title: string;
        chapters?: {
            __typename: 'ChapterNodeList';
            totalCount: number;
            nodes: Array<{
                __typename: 'ChapterType';
                id: number;
                chapterNumber: number;
                isRead: boolean;
                isDownloaded: boolean;
                isBookmarked: boolean;
                manga: { __typename: 'MangaType'; id: number };
                meta?: Array<{ __typename: 'ChapterMetaType'; chapterId: number; key: string; value: string }>;
            }>;
        };
        categories?: { __typename: 'CategoryNodeList'; nodes: Array<{ __typename: 'CategoryType'; id: number }> };
        trackRecords?: {
            __typename: 'TrackRecordNodeList';
            nodes: Array<{
                __typename: 'TrackRecordType';
                id: number;
                remoteId: string;
                trackerId: number;
                private: boolean;
            }>;
        };
        meta?: Array<{ __typename: 'MangaMetaType'; mangaId: number; key: string; value: string }>;
    };
};

export type GetMangasBaseQueryVariables = Exact<{
    after?: string | null | undefined;
    before?: string | null | undefined;
    condition?: Types.MangaConditionInput | null | undefined;
    filter?: Types.MangaFilterInput | null | undefined;
    first?: number | null | undefined;
    last?: number | null | undefined;
    offset?: number | null | undefined;
    order?: Array<Types.MangaOrderInput> | Types.MangaOrderInput | null | undefined;
}>;

export type GetMangasBaseQuery = {
    __typename: 'Query';
    mangas: {
        __typename: 'MangaNodeList';
        totalCount: number;
        nodes: Array<{
            __typename: 'MangaType';
            id: number;
            title: string;
            thumbnailUrl: string | null;
            thumbnailUrlLastFetched: string | null;
            inLibrary: boolean;
            initialized: boolean;
            sourceId: string;
        }>;
        pageInfo: {
            __typename: 'PageInfo';
            endCursor: string | null;
            hasNextPage: boolean;
            hasPreviousPage: boolean;
            startCursor: string | null;
        };
    };
};

export type GetMangasLibraryQueryVariables = Exact<{
    after?: string | null | undefined;
    before?: string | null | undefined;
    condition?: Types.MangaConditionInput | null | undefined;
    filter?: Types.MangaFilterInput | null | undefined;
    first?: number | null | undefined;
    last?: number | null | undefined;
    offset?: number | null | undefined;
    order?: Array<Types.MangaOrderInput> | Types.MangaOrderInput | null | undefined;
}>;

export type GetMangasLibraryQuery = {
    __typename: 'Query';
    mangas: {
        __typename: 'MangaNodeList';
        totalCount: number;
        nodes: Array<{
            __typename: 'MangaType';
            genre: Array<string>;
            lastFetchedAt: string | null;
            inLibraryAt: string;
            status: Types.MangaStatus;
            artist: string | null;
            author: string | null;
            description: string | null;
            id: number;
            title: string;
            thumbnailUrl: string | null;
            thumbnailUrlLastFetched: string | null;
            inLibrary: boolean;
            initialized: boolean;
            sourceId: string;
            unreadCount: number;
            downloadCount: number;
            bookmarkCount: number;
            hasDuplicateChapters: boolean;
            meta: Array<{ __typename: 'MangaMetaType'; mangaId: number; key: string; value: string }>;
            source: {
                __typename: 'SourceType';
                id: string;
                name: string;
                displayName: string;
                lang: string;
                iconUrl: string;
            } | null;
            trackRecords: {
                __typename: 'TrackRecordNodeList';
                totalCount: number;
                nodes: Array<{ __typename: 'TrackRecordType'; id: number; trackerId: number }>;
            };
            chapters: { __typename: 'ChapterNodeList'; totalCount: number };
            firstUnreadChapter: {
                __typename: 'ChapterType';
                id: number;
                sourceOrder: number;
                isRead: boolean;
                mangaId: number;
                chapterNumber: number;
                name: string;
                scanlator: string | null;
            } | null;
            lastReadChapter: { __typename: 'ChapterType'; id: number; sourceOrder: number; lastReadAt: string } | null;
            latestReadChapter: {
                __typename: 'ChapterType';
                id: number;
                sourceOrder: number;
                lastReadAt: string;
            } | null;
            latestFetchedChapter: { __typename: 'ChapterType'; id: number; fetchedAt: string } | null;
            latestUploadedChapter: { __typename: 'ChapterType'; id: number; uploadDate: string } | null;
            highestNumberedChapter: { __typename: 'ChapterType'; id: number; chapterNumber: number } | null;
        }>;
        pageInfo: {
            __typename: 'PageInfo';
            endCursor: string | null;
            hasNextPage: boolean;
            hasPreviousPage: boolean;
            startCursor: string | null;
        };
    };
};

export type GetMangasDuplicatesQueryVariables = Exact<{
    after?: string | null | undefined;
    before?: string | null | undefined;
    condition?: Types.MangaConditionInput | null | undefined;
    filter?: Types.MangaFilterInput | null | undefined;
    first?: number | null | undefined;
    last?: number | null | undefined;
    offset?: number | null | undefined;
    order?: Array<Types.MangaOrderInput> | Types.MangaOrderInput | null | undefined;
}>;

export type GetMangasDuplicatesQuery = {
    __typename: 'Query';
    mangas: {
        __typename: 'MangaNodeList';
        totalCount: number;
        nodes: Array<{
            __typename: 'MangaType';
            description: string | null;
            id: number;
            title: string;
            thumbnailUrl: string | null;
            thumbnailUrlLastFetched: string | null;
            inLibrary: boolean;
            initialized: boolean;
            sourceId: string;
            unreadCount: number;
            downloadCount: number;
            bookmarkCount: number;
            hasDuplicateChapters: boolean;
            chapters: { __typename: 'ChapterNodeList'; totalCount: number };
        }>;
        pageInfo: {
            __typename: 'PageInfo';
            endCursor: string | null;
            hasNextPage: boolean;
            hasPreviousPage: boolean;
            startCursor: string | null;
        };
    };
};

export type GetMigratableSourceMangasQueryVariables = Exact<{
    after?: string | null | undefined;
    before?: string | null | undefined;
    condition?: Types.MangaConditionInput | null | undefined;
    filter?: Types.MangaFilterInput | null | undefined;
    first?: number | null | undefined;
    last?: number | null | undefined;
    offset?: number | null | undefined;
    order?: Array<Types.MangaOrderInput> | Types.MangaOrderInput | null | undefined;
}>;

export type GetMigratableSourceMangasQuery = {
    __typename: 'Query';
    mangas: {
        __typename: 'MangaNodeList';
        nodes: Array<{
            __typename: 'MangaType';
            artist: string | null;
            author: string | null;
            id: number;
            title: string;
            thumbnailUrl: string | null;
            thumbnailUrlLastFetched: string | null;
            inLibrary: boolean;
            initialized: boolean;
            sourceId: string;
            source: { __typename: 'SourceType'; id: string; name: string; displayName: string } | null;
            firstUnreadChapter: {
                __typename: 'ChapterType';
                id: number;
                sourceOrder: number;
                isRead: boolean;
                mangaId: number;
                chapterNumber: number;
                name: string;
                scanlator: string | null;
            } | null;
            lastReadChapter: { __typename: 'ChapterType'; id: number; sourceOrder: number; lastReadAt: string } | null;
            latestReadChapter: {
                __typename: 'ChapterType';
                id: number;
                sourceOrder: number;
                lastReadAt: string;
            } | null;
            latestFetchedChapter: { __typename: 'ChapterType'; id: number; fetchedAt: string } | null;
            latestUploadedChapter: { __typename: 'ChapterType'; id: number; uploadDate: string } | null;
            highestNumberedChapter: { __typename: 'ChapterType'; id: number; chapterNumber: number } | null;
        }>;
    };
};

export type GetLibraryMangaCountQueryVariables = Exact<{ [key: string]: never }>;

export type GetLibraryMangaCountQuery = {
    __typename: 'Query';
    mangas: { __typename: 'MangaNodeList'; totalCount: number };
};

export type UpdateGlobalMetadataMutationVariables = Exact<{
    preUpdateDeleteInput: Types.DeleteGlobalMetasInput;
    hasPreUpdateDeletions: boolean;
    updateInput: Types.SetGlobalMetasInput;
    hasUpdates: boolean;
    postUpdateDeleteInput: Types.DeleteGlobalMetasInput;
    hasPostUpdateDeletions: boolean;
    migrateInput: Types.SetGlobalMetasInput;
    isMigration: boolean;
}>;

export type UpdateGlobalMetadataMutation = {
    __typename: 'Mutation';
    preUpdateDeletedMeta?: {
        __typename: 'DeleteGlobalMetasPayload';
        metas: Array<{ __typename: 'GlobalMetaType'; key: string; value: string }>;
    } | null;
    updatedMeta?: {
        __typename: 'SetGlobalMetasPayload';
        metas: Array<{ __typename: 'GlobalMetaType'; key: string; value: string }>;
    } | null;
    postUpdateDeletedMeta?: {
        __typename: 'DeleteGlobalMetasPayload';
        metas: Array<{ __typename: 'GlobalMetaType'; key: string; value: string }>;
    } | null;
    migrationMeta?: {
        __typename: 'SetGlobalMetasPayload';
        metas: Array<{ __typename: 'GlobalMetaType'; key: string; value: string }>;
    } | null;
};

export type GetGlobalMetadataQueryVariables = Exact<{
    key: string;
}>;

export type GetGlobalMetadataQuery = {
    __typename: 'Query';
    meta: { __typename: 'GlobalMetaType'; key: string; value: string };
};

export type GetGlobalMetadatasQueryVariables = Exact<{
    after?: string | null | undefined;
    before?: string | null | undefined;
    condition?: Types.MetaConditionInput | null | undefined;
    filter?: Types.MetaFilterInput | null | undefined;
    first?: number | null | undefined;
    last?: number | null | undefined;
    offset?: number | null | undefined;
    order?: Array<Types.MetaOrderInput> | Types.MetaOrderInput | null | undefined;
}>;

export type GetGlobalMetadatasQuery = {
    __typename: 'Query';
    metas: {
        __typename: 'GlobalMetaNodeList';
        totalCount: number;
        nodes: Array<{ __typename: 'GlobalMetaType'; key: string; value: string }>;
        pageInfo: {
            __typename: 'PageInfo';
            endCursor: string | null;
            hasNextPage: boolean;
            hasPreviousPage: boolean;
            startCursor: string | null;
        };
    };
};

export type AboutWebuiFragment = {
    __typename: 'AboutWebUI';
    channel: Types.WebUiChannel;
    tag: string;
    updateTimestamp: string;
};

export type WebuiUpdateCheckFragment = {
    __typename: 'WebUIUpdateCheck';
    channel: Types.WebUiChannel;
    tag: string;
    updateAvailable: boolean;
};

export type WebuiUpdateInfoFragment = { __typename: 'WebUIUpdateInfo'; channel: Types.WebUiChannel; tag: string };

export type WebuiUpdateStatusFragment = {
    __typename: 'WebUIUpdateStatus';
    progress: number;
    state: Types.UpdateState;
    info: { __typename: 'WebUIUpdateInfo'; channel: Types.WebUiChannel; tag: string };
};

export type UpdateWebuiMutationVariables = Exact<{
    input?: Types.WebUiUpdateInput | null | undefined;
}>;

export type UpdateWebuiMutation = {
    __typename: 'Mutation';
    updateWebUI: {
        __typename: 'WebUIUpdatePayload';
        updateStatus: {
            __typename: 'WebUIUpdateStatus';
            progress: number;
            state: Types.UpdateState;
            info: { __typename: 'WebUIUpdateInfo'; channel: Types.WebUiChannel; tag: string };
        };
    } | null;
};

export type ResetWebuiUpdateStatusMutationVariables = Exact<{ [key: string]: never }>;

export type ResetWebuiUpdateStatusMutation = {
    __typename: 'Mutation';
    resetWebUIUpdateStatus: {
        __typename: 'WebUIUpdateStatus';
        state: Types.UpdateState;
        info: { __typename: 'WebUIUpdateInfo'; channel: Types.WebUiChannel; tag: string };
    } | null;
};

export type GetAboutQueryVariables = Exact<{ [key: string]: never }>;

export type GetAboutQuery = {
    __typename: 'Query';
    aboutServer: {
        __typename: 'AboutServerPayload';
        buildTime: string;
        buildType: string;
        discord: string;
        github: string;
        name: string;
        version: string;
    };
    aboutWebUI: { __typename: 'AboutWebUI'; channel: Types.WebUiChannel; tag: string; updateTimestamp: string };
};

export type CheckForServerUpdatesQueryVariables = Exact<{ [key: string]: never }>;

export type CheckForServerUpdatesQuery = {
    __typename: 'Query';
    checkForServerUpdates: Array<{
        __typename: 'CheckForServerUpdatesPayload';
        channel: string;
        tag: string;
        url: string;
    }>;
};

export type CheckForWebuiUpdateQueryVariables = Exact<{ [key: string]: never }>;

export type CheckForWebuiUpdateQuery = {
    __typename: 'Query';
    checkForWebUIUpdate: {
        __typename: 'WebUIUpdateCheck';
        channel: Types.WebUiChannel;
        tag: string;
        updateAvailable: boolean;
    };
};

export type GetWebuiUpdateStatusQueryVariables = Exact<{ [key: string]: never }>;

export type GetWebuiUpdateStatusQuery = {
    __typename: 'Query';
    getWebUIUpdateStatus: {
        __typename: 'WebUIUpdateStatus';
        progress: number;
        state: Types.UpdateState;
        info: { __typename: 'WebUIUpdateInfo'; channel: Types.WebUiChannel; tag: string };
    };
};

export type WebuiUpdateSubscriptionVariables = Exact<{ [key: string]: never }>;

export type WebuiUpdateSubscription = {
    __typename: 'Subscription';
    webUIUpdateStatusChange: {
        __typename: 'WebUIUpdateStatus';
        progress: number;
        state: Types.UpdateState;
        info: { __typename: 'WebUIUpdateInfo'; channel: Types.WebUiChannel; tag: string };
    };
};

export type ServerSettingsFragment = {
    __typename: 'SettingsType';
    ip: string;
    port: number;
    socksProxyEnabled: boolean;
    socksProxyVersion: number;
    socksProxyHost: string;
    socksProxyPort: string;
    socksProxyUsername: string;
    socksProxyPassword: string;
    webUIFlavor: Types.WebUiFlavor;
    initialOpenInBrowserEnabled: boolean;
    webUIInterface: Types.WebUiInterface;
    electronPath: string;
    webUIChannel: Types.WebUiChannel;
    webUIUpdateCheckInterval: number;
    downloadAsCbz: boolean;
    downloadsPath: string;
    autoDownloadNewChapters: boolean;
    excludeEntryWithUnreadChapters: boolean;
    autoDownloadNewChaptersLimit: number;
    autoDownloadIgnoreReUploads: boolean;
    extensionRepos: Array<string>;
    maxSourcesInParallel: number;
    excludeUnreadChapters: boolean;
    excludeNotStarted: boolean;
    excludeCompleted: boolean;
    globalUpdateInterval: number;
    updateMangas: boolean;
    authMode: Types.AuthMode;
    authPassword: string;
    authUsername: string;
    jwtAudience: string;
    jwtTokenExpiry: string;
    jwtRefreshExpiry: string;
    debugLogsEnabled: boolean;
    systemTrayEnabled: boolean;
    maxLogFileSize: string;
    maxLogFiles: number;
    maxLogFolderSize: string;
    backupPath: string;
    backupTime: string;
    backupInterval: number;
    backupTTL: number;
    autoBackupIncludeCategories: boolean;
    autoBackupIncludeChapters: boolean;
    autoBackupIncludeClientData: boolean;
    autoBackupIncludeHistory: boolean;
    autoBackupIncludeManga: boolean;
    autoBackupIncludeServerSettings: boolean;
    autoBackupIncludeTracking: boolean;
    localSourcePath: string;
    flareSolverrEnabled: boolean;
    flareSolverrUrl: string;
    flareSolverrTimeout: number;
    flareSolverrSessionName: string;
    flareSolverrSessionTtl: number;
    flareSolverrAsResponseFallback: boolean;
    opdsUseBinaryFileSizes: boolean;
    opdsItemsPerPage: number;
    opdsEnablePageReadProgress: boolean;
    opdsMarkAsReadOnDownload: boolean;
    opdsShowOnlyUnreadChapters: boolean;
    opdsShowOnlyDownloadedChapters: boolean;
    opdsChapterSortOrder: Types.SortOrder;
    opdsCbzMimetype: Types.CbzMediaType;
    koreaderSyncChecksumMethod: Types.KoreaderSyncChecksumMethod;
    koreaderSyncStrategyBackward: Types.KoreaderSyncConflictStrategy;
    koreaderSyncStrategyForward: Types.KoreaderSyncConflictStrategy;
    koreaderSyncPercentageTolerance: number;
    databaseType: Types.DatabaseType;
    databaseUrl: string;
    databaseUsername: string;
    databasePassword: string;
    useHikariConnectionPool: boolean;
    downloadConversions: Array<{
        __typename: 'SettingsDownloadConversionType';
        mimeType: string;
        target: string;
        compressionLevel: number | null;
        callTimeout: string | null;
        connectTimeout: string | null;
        headers: Array<{ __typename: 'SettingsDownloadConversionHeaderType'; name: string; value: string }> | null;
    }>;
    serveConversions: Array<{
        __typename: 'SettingsDownloadConversionType';
        mimeType: string;
        target: string;
        compressionLevel: number | null;
        callTimeout: string | null;
        connectTimeout: string | null;
        headers: Array<{ __typename: 'SettingsDownloadConversionHeaderType'; name: string; value: string }> | null;
    }>;
};

export type ResetServerSettingsMutationVariables = Exact<{
    input: Types.ResetSettingsInput;
}>;

export type ResetServerSettingsMutation = {
    __typename: 'Mutation';
    resetSettings: {
        __typename: 'ResetSettingsPayload';
        settings: {
            __typename: 'SettingsType';
            ip: string;
            port: number;
            socksProxyEnabled: boolean;
            socksProxyVersion: number;
            socksProxyHost: string;
            socksProxyPort: string;
            socksProxyUsername: string;
            socksProxyPassword: string;
            webUIFlavor: Types.WebUiFlavor;
            initialOpenInBrowserEnabled: boolean;
            webUIInterface: Types.WebUiInterface;
            electronPath: string;
            webUIChannel: Types.WebUiChannel;
            webUIUpdateCheckInterval: number;
            downloadAsCbz: boolean;
            downloadsPath: string;
            autoDownloadNewChapters: boolean;
            excludeEntryWithUnreadChapters: boolean;
            autoDownloadNewChaptersLimit: number;
            autoDownloadIgnoreReUploads: boolean;
            extensionRepos: Array<string>;
            maxSourcesInParallel: number;
            excludeUnreadChapters: boolean;
            excludeNotStarted: boolean;
            excludeCompleted: boolean;
            globalUpdateInterval: number;
            updateMangas: boolean;
            authMode: Types.AuthMode;
            authPassword: string;
            authUsername: string;
            jwtAudience: string;
            jwtTokenExpiry: string;
            jwtRefreshExpiry: string;
            debugLogsEnabled: boolean;
            systemTrayEnabled: boolean;
            maxLogFileSize: string;
            maxLogFiles: number;
            maxLogFolderSize: string;
            backupPath: string;
            backupTime: string;
            backupInterval: number;
            backupTTL: number;
            autoBackupIncludeCategories: boolean;
            autoBackupIncludeChapters: boolean;
            autoBackupIncludeClientData: boolean;
            autoBackupIncludeHistory: boolean;
            autoBackupIncludeManga: boolean;
            autoBackupIncludeServerSettings: boolean;
            autoBackupIncludeTracking: boolean;
            localSourcePath: string;
            flareSolverrEnabled: boolean;
            flareSolverrUrl: string;
            flareSolverrTimeout: number;
            flareSolverrSessionName: string;
            flareSolverrSessionTtl: number;
            flareSolverrAsResponseFallback: boolean;
            opdsUseBinaryFileSizes: boolean;
            opdsItemsPerPage: number;
            opdsEnablePageReadProgress: boolean;
            opdsMarkAsReadOnDownload: boolean;
            opdsShowOnlyUnreadChapters: boolean;
            opdsShowOnlyDownloadedChapters: boolean;
            opdsChapterSortOrder: Types.SortOrder;
            opdsCbzMimetype: Types.CbzMediaType;
            koreaderSyncChecksumMethod: Types.KoreaderSyncChecksumMethod;
            koreaderSyncStrategyBackward: Types.KoreaderSyncConflictStrategy;
            koreaderSyncStrategyForward: Types.KoreaderSyncConflictStrategy;
            koreaderSyncPercentageTolerance: number;
            databaseType: Types.DatabaseType;
            databaseUrl: string;
            databaseUsername: string;
            databasePassword: string;
            useHikariConnectionPool: boolean;
            downloadConversions: Array<{
                __typename: 'SettingsDownloadConversionType';
                mimeType: string;
                target: string;
                compressionLevel: number | null;
                callTimeout: string | null;
                connectTimeout: string | null;
                headers: Array<{
                    __typename: 'SettingsDownloadConversionHeaderType';
                    name: string;
                    value: string;
                }> | null;
            }>;
            serveConversions: Array<{
                __typename: 'SettingsDownloadConversionType';
                mimeType: string;
                target: string;
                compressionLevel: number | null;
                callTimeout: string | null;
                connectTimeout: string | null;
                headers: Array<{
                    __typename: 'SettingsDownloadConversionHeaderType';
                    name: string;
                    value: string;
                }> | null;
            }>;
        };
    };
};

export type UpdateServerSettingsMutationVariables = Exact<{
    input: Types.SetSettingsInput;
}>;

export type UpdateServerSettingsMutation = {
    __typename: 'Mutation';
    setSettings: {
        __typename: 'SetSettingsPayload';
        settings: {
            __typename: 'SettingsType';
            ip: string;
            port: number;
            socksProxyEnabled: boolean;
            socksProxyVersion: number;
            socksProxyHost: string;
            socksProxyPort: string;
            socksProxyUsername: string;
            socksProxyPassword: string;
            webUIFlavor: Types.WebUiFlavor;
            initialOpenInBrowserEnabled: boolean;
            webUIInterface: Types.WebUiInterface;
            electronPath: string;
            webUIChannel: Types.WebUiChannel;
            webUIUpdateCheckInterval: number;
            downloadAsCbz: boolean;
            downloadsPath: string;
            autoDownloadNewChapters: boolean;
            excludeEntryWithUnreadChapters: boolean;
            autoDownloadNewChaptersLimit: number;
            autoDownloadIgnoreReUploads: boolean;
            extensionRepos: Array<string>;
            maxSourcesInParallel: number;
            excludeUnreadChapters: boolean;
            excludeNotStarted: boolean;
            excludeCompleted: boolean;
            globalUpdateInterval: number;
            updateMangas: boolean;
            authMode: Types.AuthMode;
            authPassword: string;
            authUsername: string;
            jwtAudience: string;
            jwtTokenExpiry: string;
            jwtRefreshExpiry: string;
            debugLogsEnabled: boolean;
            systemTrayEnabled: boolean;
            maxLogFileSize: string;
            maxLogFiles: number;
            maxLogFolderSize: string;
            backupPath: string;
            backupTime: string;
            backupInterval: number;
            backupTTL: number;
            autoBackupIncludeCategories: boolean;
            autoBackupIncludeChapters: boolean;
            autoBackupIncludeClientData: boolean;
            autoBackupIncludeHistory: boolean;
            autoBackupIncludeManga: boolean;
            autoBackupIncludeServerSettings: boolean;
            autoBackupIncludeTracking: boolean;
            localSourcePath: string;
            flareSolverrEnabled: boolean;
            flareSolverrUrl: string;
            flareSolverrTimeout: number;
            flareSolverrSessionName: string;
            flareSolverrSessionTtl: number;
            flareSolverrAsResponseFallback: boolean;
            opdsUseBinaryFileSizes: boolean;
            opdsItemsPerPage: number;
            opdsEnablePageReadProgress: boolean;
            opdsMarkAsReadOnDownload: boolean;
            opdsShowOnlyUnreadChapters: boolean;
            opdsShowOnlyDownloadedChapters: boolean;
            opdsChapterSortOrder: Types.SortOrder;
            opdsCbzMimetype: Types.CbzMediaType;
            koreaderSyncChecksumMethod: Types.KoreaderSyncChecksumMethod;
            koreaderSyncStrategyBackward: Types.KoreaderSyncConflictStrategy;
            koreaderSyncStrategyForward: Types.KoreaderSyncConflictStrategy;
            koreaderSyncPercentageTolerance: number;
            databaseType: Types.DatabaseType;
            databaseUrl: string;
            databaseUsername: string;
            databasePassword: string;
            useHikariConnectionPool: boolean;
            downloadConversions: Array<{
                __typename: 'SettingsDownloadConversionType';
                mimeType: string;
                target: string;
                compressionLevel: number | null;
                callTimeout: string | null;
                connectTimeout: string | null;
                headers: Array<{
                    __typename: 'SettingsDownloadConversionHeaderType';
                    name: string;
                    value: string;
                }> | null;
            }>;
            serveConversions: Array<{
                __typename: 'SettingsDownloadConversionType';
                mimeType: string;
                target: string;
                compressionLevel: number | null;
                callTimeout: string | null;
                connectTimeout: string | null;
                headers: Array<{
                    __typename: 'SettingsDownloadConversionHeaderType';
                    name: string;
                    value: string;
                }> | null;
            }>;
        };
    };
};

export type GetServerSettingsQueryVariables = Exact<{ [key: string]: never }>;

export type GetServerSettingsQuery = {
    __typename: 'Query';
    settings: {
        __typename: 'SettingsType';
        ip: string;
        port: number;
        socksProxyEnabled: boolean;
        socksProxyVersion: number;
        socksProxyHost: string;
        socksProxyPort: string;
        socksProxyUsername: string;
        socksProxyPassword: string;
        webUIFlavor: Types.WebUiFlavor;
        initialOpenInBrowserEnabled: boolean;
        webUIInterface: Types.WebUiInterface;
        electronPath: string;
        webUIChannel: Types.WebUiChannel;
        webUIUpdateCheckInterval: number;
        downloadAsCbz: boolean;
        downloadsPath: string;
        autoDownloadNewChapters: boolean;
        excludeEntryWithUnreadChapters: boolean;
        autoDownloadNewChaptersLimit: number;
        autoDownloadIgnoreReUploads: boolean;
        extensionRepos: Array<string>;
        maxSourcesInParallel: number;
        excludeUnreadChapters: boolean;
        excludeNotStarted: boolean;
        excludeCompleted: boolean;
        globalUpdateInterval: number;
        updateMangas: boolean;
        authMode: Types.AuthMode;
        authPassword: string;
        authUsername: string;
        jwtAudience: string;
        jwtTokenExpiry: string;
        jwtRefreshExpiry: string;
        debugLogsEnabled: boolean;
        systemTrayEnabled: boolean;
        maxLogFileSize: string;
        maxLogFiles: number;
        maxLogFolderSize: string;
        backupPath: string;
        backupTime: string;
        backupInterval: number;
        backupTTL: number;
        autoBackupIncludeCategories: boolean;
        autoBackupIncludeChapters: boolean;
        autoBackupIncludeClientData: boolean;
        autoBackupIncludeHistory: boolean;
        autoBackupIncludeManga: boolean;
        autoBackupIncludeServerSettings: boolean;
        autoBackupIncludeTracking: boolean;
        localSourcePath: string;
        flareSolverrEnabled: boolean;
        flareSolverrUrl: string;
        flareSolverrTimeout: number;
        flareSolverrSessionName: string;
        flareSolverrSessionTtl: number;
        flareSolverrAsResponseFallback: boolean;
        opdsUseBinaryFileSizes: boolean;
        opdsItemsPerPage: number;
        opdsEnablePageReadProgress: boolean;
        opdsMarkAsReadOnDownload: boolean;
        opdsShowOnlyUnreadChapters: boolean;
        opdsShowOnlyDownloadedChapters: boolean;
        opdsChapterSortOrder: Types.SortOrder;
        opdsCbzMimetype: Types.CbzMediaType;
        koreaderSyncChecksumMethod: Types.KoreaderSyncChecksumMethod;
        koreaderSyncStrategyBackward: Types.KoreaderSyncConflictStrategy;
        koreaderSyncStrategyForward: Types.KoreaderSyncConflictStrategy;
        koreaderSyncPercentageTolerance: number;
        databaseType: Types.DatabaseType;
        databaseUrl: string;
        databaseUsername: string;
        databasePassword: string;
        useHikariConnectionPool: boolean;
        downloadConversions: Array<{
            __typename: 'SettingsDownloadConversionType';
            mimeType: string;
            target: string;
            compressionLevel: number | null;
            callTimeout: string | null;
            connectTimeout: string | null;
            headers: Array<{ __typename: 'SettingsDownloadConversionHeaderType'; name: string; value: string }> | null;
        }>;
        serveConversions: Array<{
            __typename: 'SettingsDownloadConversionType';
            mimeType: string;
            target: string;
            compressionLevel: number | null;
            callTimeout: string | null;
            connectTimeout: string | null;
            headers: Array<{ __typename: 'SettingsDownloadConversionHeaderType'; name: string; value: string }> | null;
        }>;
    };
};

export type SourceMetaFieldsFragment = { __typename: 'SourceMetaType'; sourceId: string; key: string; value: string };

export type SourceBaseFieldsFragment = {
    __typename: 'SourceType';
    id: string;
    name: string;
    displayName: string;
    lang: string;
    iconUrl: string;
};

export type SourceListFieldsFragment = {
    __typename: 'SourceType';
    lang: string;
    iconUrl: string;
    isNsfw: boolean;
    isConfigurable: boolean;
    supportsLatest: boolean;
    id: string;
    name: string;
    displayName: string;
    meta: Array<{ __typename: 'SourceMetaType'; sourceId: string; key: string; value: string }>;
    extension: { __typename: 'ExtensionType'; pkgName: string; repo: string | null };
};

export type SourceBrowseFieldsFragment = {
    __typename: 'SourceType';
    baseUrl: string | null;
    isConfigurable: boolean;
    supportsLatest: boolean;
    id: string;
    name: string;
    displayName: string;
    lang: string;
    iconUrl: string;
    meta: Array<{ __typename: 'SourceMetaType'; sourceId: string; key: string; value: string }>;
    filters: Array<
        | { __typename: 'CheckBoxFilter'; name: string; type: 'CheckBoxFilter'; CheckBoxFilterDefault: boolean }
        | {
              __typename: 'GroupFilter';
              name: string;
              type: 'GroupFilter';
              filters: Array<
                  | {
                        __typename: 'CheckBoxFilter';
                        name: string;
                        type: 'CheckBoxFilter';
                        CheckBoxFilterDefault: boolean;
                    }
                  | { __typename: 'GroupFilter' }
                  | { __typename: 'HeaderFilter'; name: string; type: 'HeaderFilter' }
                  | {
                        __typename: 'SelectFilter';
                        name: string;
                        values: Array<string>;
                        type: 'SelectFilter';
                        SelectFilterDefault: number;
                    }
                  | { __typename: 'SeparatorFilter'; name: string; type: 'SeparatorFilter' }
                  | {
                        __typename: 'SortFilter';
                        name: string;
                        values: Array<string>;
                        type: 'SortFilter';
                        SortFilterDefault: { __typename: 'SortSelection'; ascending: boolean; index: number } | null;
                    }
                  | { __typename: 'TextFilter'; name: string; type: 'TextFilter'; TextFilterDefault: string }
                  | {
                        __typename: 'TriStateFilter';
                        name: string;
                        type: 'TriStateFilter';
                        TriStateFilterDefault: Types.TriState;
                    }
              >;
          }
        | { __typename: 'HeaderFilter'; name: string; type: 'HeaderFilter' }
        | {
              __typename: 'SelectFilter';
              name: string;
              values: Array<string>;
              type: 'SelectFilter';
              SelectFilterDefault: number;
          }
        | { __typename: 'SeparatorFilter'; name: string; type: 'SeparatorFilter' }
        | {
              __typename: 'SortFilter';
              name: string;
              values: Array<string>;
              type: 'SortFilter';
              SortFilterDefault: { __typename: 'SortSelection'; ascending: boolean; index: number } | null;
          }
        | { __typename: 'TextFilter'; name: string; type: 'TextFilter'; TextFilterDefault: string }
        | { __typename: 'TriStateFilter'; name: string; type: 'TriStateFilter'; TriStateFilterDefault: Types.TriState }
    >;
};

export type SourceSettingFieldsFragment = {
    __typename: 'SourceType';
    id: string;
    name: string;
    displayName: string;
    lang: string;
    iconUrl: string;
    preferences: Array<
        | {
              __typename: 'CheckBoxPreference';
              summary: string | null;
              key: string | null;
              type: 'CheckBoxPreference';
              CheckBoxCheckBoxCurrentValue: boolean | null;
              CheckBoxDefault: boolean;
              CheckBoxTitle: string | null;
          }
        | {
              __typename: 'EditTextPreference';
              text: string | null;
              summary: string | null;
              key: string | null;
              dialogTitle: string | null;
              dialogMessage: string | null;
              type: 'EditTextPreference';
              EditTextPreferenceCurrentValue: string | null;
              EditTextPreferenceDefault: string | null;
              EditTextPreferenceTitle: string | null;
          }
        | {
              __typename: 'ListPreference';
              summary: string | null;
              key: string | null;
              entryValues: Array<string>;
              entries: Array<string>;
              type: 'ListPreference';
              ListPreferenceCurrentValue: string | null;
              ListPreferenceDefault: string | null;
              ListPreferenceTitle: string | null;
          }
        | {
              __typename: 'MultiSelectListPreference';
              dialogMessage: string | null;
              dialogTitle: string | null;
              summary: string | null;
              key: string | null;
              entryValues: Array<string>;
              entries: Array<string>;
              type: 'MultiSelectListPreference';
              MultiSelectListPreferenceTitle: string | null;
              MultiSelectListPreferenceDefault: Array<string> | null;
              MultiSelectListPreferenceCurrentValue: Array<string> | null;
          }
        | {
              __typename: 'SwitchPreference';
              summary: string | null;
              key: string | null;
              type: 'SwitchPreference';
              SwitchPreferenceCurrentValue: boolean | null;
              SwitchPreferenceDefault: boolean;
              SwitchPreferenceTitle: string | null;
          }
    >;
};

export type GetSourceMangasFetchMutationVariables = Exact<{
    input: Types.FetchSourceMangaInput;
}>;

export type GetSourceMangasFetchMutation = {
    __typename: 'Mutation';
    fetchSourceManga: {
        __typename: 'FetchSourceMangaPayload';
        hasNextPage: boolean;
        mangas: Array<{
            __typename: 'MangaType';
            id: number;
            title: string;
            thumbnailUrl: string | null;
            thumbnailUrlLastFetched: string | null;
            inLibrary: boolean;
            initialized: boolean;
            sourceId: string;
        }>;
    } | null;
};

export type GetMigrationSourceMangasFetchMutationVariables = Exact<{
    input: Types.FetchSourceMangaInput;
}>;

export type GetMigrationSourceMangasFetchMutation = {
    __typename: 'Mutation';
    fetchSourceManga: {
        __typename: 'FetchSourceMangaPayload';
        hasNextPage: boolean;
        mangas: Array<{
            __typename: 'MangaType';
            artist: string | null;
            author: string | null;
            id: number;
            title: string;
            thumbnailUrl: string | null;
            thumbnailUrlLastFetched: string | null;
            inLibrary: boolean;
            initialized: boolean;
            sourceId: string;
            source: { __typename: 'SourceType'; id: string; name: string; displayName: string } | null;
            firstUnreadChapter: {
                __typename: 'ChapterType';
                id: number;
                sourceOrder: number;
                isRead: boolean;
                mangaId: number;
                chapterNumber: number;
                name: string;
                scanlator: string | null;
            } | null;
            lastReadChapter: { __typename: 'ChapterType'; id: number; sourceOrder: number; lastReadAt: string } | null;
            latestReadChapter: {
                __typename: 'ChapterType';
                id: number;
                sourceOrder: number;
                lastReadAt: string;
            } | null;
            latestFetchedChapter: { __typename: 'ChapterType'; id: number; fetchedAt: string } | null;
            latestUploadedChapter: { __typename: 'ChapterType'; id: number; uploadDate: string } | null;
            highestNumberedChapter: { __typename: 'ChapterType'; id: number; chapterNumber: number } | null;
        }>;
    } | null;
};

export type UpdateSourcePreferencesMutationVariables = Exact<{
    input: Types.UpdateSourcePreferenceInput;
}>;

export type UpdateSourcePreferencesMutation = {
    __typename: 'Mutation';
    updateSourcePreference: {
        __typename: 'UpdateSourcePreferencePayload';
        source: {
            __typename: 'SourceType';
            id: string;
            name: string;
            displayName: string;
            lang: string;
            iconUrl: string;
            preferences: Array<
                | {
                      __typename: 'CheckBoxPreference';
                      summary: string | null;
                      key: string | null;
                      type: 'CheckBoxPreference';
                      CheckBoxCheckBoxCurrentValue: boolean | null;
                      CheckBoxDefault: boolean;
                      CheckBoxTitle: string | null;
                  }
                | {
                      __typename: 'EditTextPreference';
                      text: string | null;
                      summary: string | null;
                      key: string | null;
                      dialogTitle: string | null;
                      dialogMessage: string | null;
                      type: 'EditTextPreference';
                      EditTextPreferenceCurrentValue: string | null;
                      EditTextPreferenceDefault: string | null;
                      EditTextPreferenceTitle: string | null;
                  }
                | {
                      __typename: 'ListPreference';
                      summary: string | null;
                      key: string | null;
                      entryValues: Array<string>;
                      entries: Array<string>;
                      type: 'ListPreference';
                      ListPreferenceCurrentValue: string | null;
                      ListPreferenceDefault: string | null;
                      ListPreferenceTitle: string | null;
                  }
                | {
                      __typename: 'MultiSelectListPreference';
                      dialogMessage: string | null;
                      dialogTitle: string | null;
                      summary: string | null;
                      key: string | null;
                      entryValues: Array<string>;
                      entries: Array<string>;
                      type: 'MultiSelectListPreference';
                      MultiSelectListPreferenceTitle: string | null;
                      MultiSelectListPreferenceDefault: Array<string> | null;
                      MultiSelectListPreferenceCurrentValue: Array<string> | null;
                  }
                | {
                      __typename: 'SwitchPreference';
                      summary: string | null;
                      key: string | null;
                      type: 'SwitchPreference';
                      SwitchPreferenceCurrentValue: boolean | null;
                      SwitchPreferenceDefault: boolean;
                      SwitchPreferenceTitle: string | null;
                  }
            >;
        };
    } | null;
};

export type UpdateSourceMetadataMutationVariables = Exact<{
    preUpdateDeleteInput: Types.DeleteSourceMetasInput;
    hasPreUpdateDeletions: boolean;
    updateInput: Types.SetSourceMetasInput;
    hasUpdates: boolean;
    postUpdateDeleteInput: Types.DeleteSourceMetasInput;
    hasPostUpdateDeletions: boolean;
    migrateInput: Types.SetSourceMetasInput;
    isMigration: boolean;
}>;

export type UpdateSourceMetadataMutation = {
    __typename: 'Mutation';
    preUpdateDeletedMeta?: {
        __typename: 'DeleteSourceMetasPayload';
        metas: Array<{ __typename: 'SourceMetaType'; sourceId: string; key: string; value: string }>;
    } | null;
    updatedMeta?: {
        __typename: 'SetSourceMetasPayload';
        metas: Array<{ __typename: 'SourceMetaType'; sourceId: string; key: string; value: string }>;
    } | null;
    postUpdateDeletedMeta?: {
        __typename: 'DeleteSourceMetasPayload';
        metas: Array<{ __typename: 'SourceMetaType'; sourceId: string; key: string; value: string }>;
    } | null;
    migrationMeta?: {
        __typename: 'SetSourceMetasPayload';
        metas: Array<{ __typename: 'SourceMetaType'; sourceId: string; key: string; value: string }>;
    } | null;
};

export type GetSourceBrowseQueryVariables = Exact<{
    id: string;
}>;

export type GetSourceBrowseQuery = {
    __typename: 'Query';
    source: {
        __typename: 'SourceType';
        baseUrl: string | null;
        isConfigurable: boolean;
        supportsLatest: boolean;
        id: string;
        name: string;
        displayName: string;
        lang: string;
        iconUrl: string;
        meta: Array<{ __typename: 'SourceMetaType'; sourceId: string; key: string; value: string }>;
        filters: Array<
            | { __typename: 'CheckBoxFilter'; name: string; type: 'CheckBoxFilter'; CheckBoxFilterDefault: boolean }
            | {
                  __typename: 'GroupFilter';
                  name: string;
                  type: 'GroupFilter';
                  filters: Array<
                      | {
                            __typename: 'CheckBoxFilter';
                            name: string;
                            type: 'CheckBoxFilter';
                            CheckBoxFilterDefault: boolean;
                        }
                      | { __typename: 'GroupFilter' }
                      | { __typename: 'HeaderFilter'; name: string; type: 'HeaderFilter' }
                      | {
                            __typename: 'SelectFilter';
                            name: string;
                            values: Array<string>;
                            type: 'SelectFilter';
                            SelectFilterDefault: number;
                        }
                      | { __typename: 'SeparatorFilter'; name: string; type: 'SeparatorFilter' }
                      | {
                            __typename: 'SortFilter';
                            name: string;
                            values: Array<string>;
                            type: 'SortFilter';
                            SortFilterDefault: {
                                __typename: 'SortSelection';
                                ascending: boolean;
                                index: number;
                            } | null;
                        }
                      | { __typename: 'TextFilter'; name: string; type: 'TextFilter'; TextFilterDefault: string }
                      | {
                            __typename: 'TriStateFilter';
                            name: string;
                            type: 'TriStateFilter';
                            TriStateFilterDefault: Types.TriState;
                        }
                  >;
              }
            | { __typename: 'HeaderFilter'; name: string; type: 'HeaderFilter' }
            | {
                  __typename: 'SelectFilter';
                  name: string;
                  values: Array<string>;
                  type: 'SelectFilter';
                  SelectFilterDefault: number;
              }
            | { __typename: 'SeparatorFilter'; name: string; type: 'SeparatorFilter' }
            | {
                  __typename: 'SortFilter';
                  name: string;
                  values: Array<string>;
                  type: 'SortFilter';
                  SortFilterDefault: { __typename: 'SortSelection'; ascending: boolean; index: number } | null;
              }
            | { __typename: 'TextFilter'; name: string; type: 'TextFilter'; TextFilterDefault: string }
            | {
                  __typename: 'TriStateFilter';
                  name: string;
                  type: 'TriStateFilter';
                  TriStateFilterDefault: Types.TriState;
              }
        >;
    };
};

export type GetSourceSettingsQueryVariables = Exact<{
    id: string;
}>;

export type GetSourceSettingsQuery = {
    __typename: 'Query';
    source: {
        __typename: 'SourceType';
        id: string;
        name: string;
        displayName: string;
        lang: string;
        iconUrl: string;
        preferences: Array<
            | {
                  __typename: 'CheckBoxPreference';
                  summary: string | null;
                  key: string | null;
                  type: 'CheckBoxPreference';
                  CheckBoxCheckBoxCurrentValue: boolean | null;
                  CheckBoxDefault: boolean;
                  CheckBoxTitle: string | null;
              }
            | {
                  __typename: 'EditTextPreference';
                  text: string | null;
                  summary: string | null;
                  key: string | null;
                  dialogTitle: string | null;
                  dialogMessage: string | null;
                  type: 'EditTextPreference';
                  EditTextPreferenceCurrentValue: string | null;
                  EditTextPreferenceDefault: string | null;
                  EditTextPreferenceTitle: string | null;
              }
            | {
                  __typename: 'ListPreference';
                  summary: string | null;
                  key: string | null;
                  entryValues: Array<string>;
                  entries: Array<string>;
                  type: 'ListPreference';
                  ListPreferenceCurrentValue: string | null;
                  ListPreferenceDefault: string | null;
                  ListPreferenceTitle: string | null;
              }
            | {
                  __typename: 'MultiSelectListPreference';
                  dialogMessage: string | null;
                  dialogTitle: string | null;
                  summary: string | null;
                  key: string | null;
                  entryValues: Array<string>;
                  entries: Array<string>;
                  type: 'MultiSelectListPreference';
                  MultiSelectListPreferenceTitle: string | null;
                  MultiSelectListPreferenceDefault: Array<string> | null;
                  MultiSelectListPreferenceCurrentValue: Array<string> | null;
              }
            | {
                  __typename: 'SwitchPreference';
                  summary: string | null;
                  key: string | null;
                  type: 'SwitchPreference';
                  SwitchPreferenceCurrentValue: boolean | null;
                  SwitchPreferenceDefault: boolean;
                  SwitchPreferenceTitle: string | null;
              }
        >;
    };
};

export type GetSourceMigratableQueryVariables = Exact<{
    id: string;
}>;

export type GetSourceMigratableQuery = {
    __typename: 'Query';
    source: { __typename: 'SourceType'; id: string; name: string; displayName: string; lang: string; iconUrl: string };
};

export type GetSourcesListQueryVariables = Exact<{ [key: string]: never }>;

export type GetSourcesListQuery = {
    __typename: 'Query';
    sources: {
        __typename: 'SourceNodeList';
        nodes: Array<{
            __typename: 'SourceType';
            lang: string;
            iconUrl: string;
            isNsfw: boolean;
            isConfigurable: boolean;
            supportsLatest: boolean;
            id: string;
            name: string;
            displayName: string;
            meta: Array<{ __typename: 'SourceMetaType'; sourceId: string; key: string; value: string }>;
            extension: { __typename: 'ExtensionType'; pkgName: string; repo: string | null };
        }>;
    };
};

export type GetMigratableSourcesQueryVariables = Exact<{ [key: string]: never }>;

export type GetMigratableSourcesQuery = {
    __typename: 'Query';
    mangas: {
        __typename: 'MangaNodeList';
        nodes: Array<{
            __typename: 'MangaType';
            sourceId: string;
            source: {
                __typename: 'SourceType';
                id: string;
                name: string;
                displayName: string;
                lang: string;
                iconUrl: string;
            } | null;
        }>;
    };
};

export type TrackerBaseFieldsFragment = {
    __typename: 'TrackerType';
    id: number;
    name: string;
    icon: string;
    isLoggedIn: boolean;
    isTokenExpired: boolean;
};

export type TrackerSettingFieldsFragment = {
    __typename: 'TrackerType';
    authUrl: string | null;
    id: number;
    name: string;
    icon: string;
    isLoggedIn: boolean;
    isTokenExpired: boolean;
};

export type TrackerBindFieldsFragment = {
    __typename: 'TrackerType';
    icon: string;
    supportsPrivateTracking: boolean;
    supportsTrackDeletion: boolean;
    scores: Array<string>;
    id: number;
    name: string;
    isLoggedIn: boolean;
    isTokenExpired: boolean;
    statuses: Array<{ __typename: 'TrackStatusType'; name: string; value: number }>;
    trackRecords: {
        __typename: 'TrackRecordNodeList';
        nodes: Array<{
            __typename: 'TrackRecordType';
            id: number;
            remoteId: string;
            trackerId: number;
            remoteUrl: string;
            title: string;
            status: number;
            lastChapterRead: number;
            totalChapters: number;
            score: number;
            displayScore: string;
            startDate: string;
            finishDate: string;
            private: boolean;
        }>;
    };
};

export type TrackRecordSearchFieldsFragment = {
    __typename: 'TrackSearchType';
    id: number;
    remoteId: string;
    title: string;
    trackingUrl: string;
    coverUrl: string;
    publishingType: string;
    startDate: string;
    publishingStatus: string;
    summary: string;
    score: number;
    totalChapters: number;
};

export type TrackRecordBindFieldsFragment = {
    __typename: 'TrackRecordType';
    id: number;
    remoteId: string;
    trackerId: number;
    remoteUrl: string;
    title: string;
    status: number;
    lastChapterRead: number;
    totalChapters: number;
    score: number;
    displayScore: string;
    startDate: string;
    finishDate: string;
    private: boolean;
};

export type TrackerLoginOauthMutationVariables = Exact<{
    input: Types.LoginTrackerOAuthInput;
}>;

export type TrackerLoginOauthMutation = {
    __typename: 'Mutation';
    loginTrackerOAuth: {
        __typename: 'LoginTrackerOAuthPayload';
        tracker: {
            __typename: 'TrackerType';
            authUrl: string | null;
            id: number;
            name: string;
            icon: string;
            isLoggedIn: boolean;
            isTokenExpired: boolean;
        };
    };
};

export type TrackerLoginCredentialsMutationVariables = Exact<{
    input: Types.LoginTrackerCredentialsInput;
}>;

export type TrackerLoginCredentialsMutation = {
    __typename: 'Mutation';
    loginTrackerCredentials: {
        __typename: 'LoginTrackerCredentialsPayload';
        isLoggedIn: boolean;
        tracker: {
            __typename: 'TrackerType';
            authUrl: string | null;
            id: number;
            name: string;
            icon: string;
            isLoggedIn: boolean;
            isTokenExpired: boolean;
        };
    };
};

export type TrackerLogoutMutationVariables = Exact<{
    trackerId: number;
}>;

export type TrackerLogoutMutation = {
    __typename: 'Mutation';
    logoutTracker: {
        __typename: 'LogoutTrackerPayload';
        tracker: {
            __typename: 'TrackerType';
            authUrl: string | null;
            id: number;
            name: string;
            icon: string;
            isLoggedIn: boolean;
            isTokenExpired: boolean;
        };
    };
};

export type TrackerBindMutationVariables = Exact<{
    input: Types.BindTrackInput;
}>;

export type TrackerBindMutation = {
    __typename: 'Mutation';
    bindTrack: {
        __typename: 'BindTrackPayload';
        trackRecord: {
            __typename: 'TrackRecordType';
            id: number;
            remoteId: string;
            trackerId: number;
            remoteUrl: string;
            title: string;
            status: number;
            lastChapterRead: number;
            totalChapters: number;
            score: number;
            displayScore: string;
            startDate: string;
            finishDate: string;
            private: boolean;
            manga: {
                __typename: 'MangaType';
                id: number;
                trackRecords: {
                    __typename: 'TrackRecordNodeList';
                    totalCount: number;
                    nodes: Array<{ __typename: 'TrackRecordType'; id: number; trackerId: number }>;
                };
            };
        };
    };
};

export type TrackerUnbindMutationVariables = Exact<{
    input: Types.UnbindTrackInput;
}>;

export type TrackerUnbindMutation = {
    __typename: 'Mutation';
    unbindTrack: {
        __typename: 'UnbindTrackPayload';
        trackRecord: {
            __typename: 'TrackRecordType';
            id: number;
            manga: {
                __typename: 'MangaType';
                id: number;
                trackRecords: {
                    __typename: 'TrackRecordNodeList';
                    totalCount: number;
                    nodes: Array<{ __typename: 'TrackRecordType'; id: number; trackerId: number }>;
                };
            };
        } | null;
    };
};

export type TrackerUpdateBindMutationVariables = Exact<{
    input: Types.UpdateTrackInput;
}>;

export type TrackerUpdateBindMutation = {
    __typename: 'Mutation';
    updateTrack: {
        __typename: 'UpdateTrackPayload';
        trackRecord: {
            __typename: 'TrackRecordType';
            id: number;
            remoteId: string;
            trackerId: number;
            remoteUrl: string;
            title: string;
            status: number;
            lastChapterRead: number;
            totalChapters: number;
            score: number;
            displayScore: string;
            startDate: string;
            finishDate: string;
            private: boolean;
            manga: {
                __typename: 'MangaType';
                id: number;
                trackRecords: {
                    __typename: 'TrackRecordNodeList';
                    totalCount: number;
                    nodes: Array<{ __typename: 'TrackRecordType'; id: number; trackerId: number }>;
                };
            };
        } | null;
    };
};

export type TrackerFetchBindMutationVariables = Exact<{
    recordId: number;
}>;

export type TrackerFetchBindMutation = {
    __typename: 'Mutation';
    fetchTrack: {
        __typename: 'FetchTrackPayload';
        trackRecord: {
            __typename: 'TrackRecordType';
            id: number;
            remoteId: string;
            trackerId: number;
            remoteUrl: string;
            title: string;
            status: number;
            lastChapterRead: number;
            totalChapters: number;
            score: number;
            displayScore: string;
            startDate: string;
            finishDate: string;
            private: boolean;
        };
    };
};

export type GetTrackersSettingsQueryVariables = Exact<{ [key: string]: never }>;

export type GetTrackersSettingsQuery = {
    __typename: 'Query';
    trackers: {
        __typename: 'TrackerNodeList';
        totalCount: number;
        pageInfo: {
            __typename: 'PageInfo';
            endCursor: string | null;
            hasNextPage: boolean;
            hasPreviousPage: boolean;
            startCursor: string | null;
        };
        nodes: Array<{
            __typename: 'TrackerType';
            authUrl: string | null;
            id: number;
            name: string;
            icon: string;
            isLoggedIn: boolean;
            isTokenExpired: boolean;
        }>;
    };
};

export type GetTrackersBindQueryVariables = Exact<{ [key: string]: never }>;

export type GetTrackersBindQuery = {
    __typename: 'Query';
    trackers: {
        __typename: 'TrackerNodeList';
        totalCount: number;
        pageInfo: {
            __typename: 'PageInfo';
            endCursor: string | null;
            hasNextPage: boolean;
            hasPreviousPage: boolean;
            startCursor: string | null;
        };
        nodes: Array<{
            __typename: 'TrackerType';
            icon: string;
            supportsPrivateTracking: boolean;
            supportsTrackDeletion: boolean;
            scores: Array<string>;
            id: number;
            name: string;
            isLoggedIn: boolean;
            isTokenExpired: boolean;
            statuses: Array<{ __typename: 'TrackStatusType'; name: string; value: number }>;
            trackRecords: {
                __typename: 'TrackRecordNodeList';
                nodes: Array<{
                    __typename: 'TrackRecordType';
                    id: number;
                    remoteId: string;
                    trackerId: number;
                    remoteUrl: string;
                    title: string;
                    status: number;
                    lastChapterRead: number;
                    totalChapters: number;
                    score: number;
                    displayScore: string;
                    startDate: string;
                    finishDate: string;
                    private: boolean;
                }>;
            };
        }>;
    };
};

export type TrackerSearchQueryVariables = Exact<{
    query: string;
    trackerId: number;
}>;

export type TrackerSearchQuery = {
    __typename: 'Query';
    searchTracker: {
        __typename: 'SearchTrackerPayload';
        trackSearches: Array<{
            __typename: 'TrackSearchType';
            id: number;
            remoteId: string;
            title: string;
            trackingUrl: string;
            coverUrl: string;
            publishingType: string;
            startDate: string;
            publishingStatus: string;
            summary: string;
            score: number;
            totalChapters: number;
        }>;
    };
};

export type UpdaterMangaFieldsFragment = {
    __typename: 'MangaUpdateType';
    status: Types.MangaJobStatus;
    manga: {
        __typename: 'MangaType';
        id: number;
        title: string;
        thumbnailUrl: string | null;
        unreadCount: number;
        downloadCount: number;
        bookmarkCount: number;
        hasDuplicateChapters: boolean;
        chapters: { __typename: 'ChapterNodeList'; totalCount: number };
        firstUnreadChapter: {
            __typename: 'ChapterType';
            id: number;
            sourceOrder: number;
            isRead: boolean;
            mangaId: number;
            chapterNumber: number;
            name: string;
            scanlator: string | null;
        } | null;
        lastReadChapter: { __typename: 'ChapterType'; id: number; sourceOrder: number; lastReadAt: string } | null;
        latestReadChapter: { __typename: 'ChapterType'; id: number; sourceOrder: number; lastReadAt: string } | null;
        latestFetchedChapter: { __typename: 'ChapterType'; id: number; fetchedAt: string } | null;
        latestUploadedChapter: { __typename: 'ChapterType'; id: number; uploadDate: string } | null;
        highestNumberedChapter: { __typename: 'ChapterType'; id: number; chapterNumber: number } | null;
    };
};

export type UpdaterCategoryFieldsFragment = {
    __typename: 'CategoryUpdateType';
    status: Types.CategoryJobStatus;
    category: { __typename: 'CategoryType'; id: number; name: string };
};

export type UpdaterJobInfoFieldsFragment = {
    __typename: 'UpdaterJobsInfoType';
    isRunning: boolean;
    totalJobs: number;
    finishedJobs: number;
    skippedCategoriesCount: number;
    skippedMangasCount: number;
};

export type UpdaterStatusFieldsFragment = {
    __typename: 'LibraryUpdateStatus';
    jobsInfo: {
        __typename: 'UpdaterJobsInfoType';
        isRunning: boolean;
        totalJobs: number;
        finishedJobs: number;
        skippedCategoriesCount: number;
        skippedMangasCount: number;
    };
    categoryUpdates: Array<{
        __typename: 'CategoryUpdateType';
        status: Types.CategoryJobStatus;
        category: { __typename: 'CategoryType'; id: number; name: string };
    }>;
    mangaUpdates: Array<{
        __typename: 'MangaUpdateType';
        status: Types.MangaJobStatus;
        manga: {
            __typename: 'MangaType';
            id: number;
            title: string;
            thumbnailUrl: string | null;
            unreadCount: number;
            downloadCount: number;
            bookmarkCount: number;
            hasDuplicateChapters: boolean;
            chapters: { __typename: 'ChapterNodeList'; totalCount: number };
            firstUnreadChapter: {
                __typename: 'ChapterType';
                id: number;
                sourceOrder: number;
                isRead: boolean;
                mangaId: number;
                chapterNumber: number;
                name: string;
                scanlator: string | null;
            } | null;
            lastReadChapter: { __typename: 'ChapterType'; id: number; sourceOrder: number; lastReadAt: string } | null;
            latestReadChapter: {
                __typename: 'ChapterType';
                id: number;
                sourceOrder: number;
                lastReadAt: string;
            } | null;
            latestFetchedChapter: { __typename: 'ChapterType'; id: number; fetchedAt: string } | null;
            latestUploadedChapter: { __typename: 'ChapterType'; id: number; uploadDate: string } | null;
            highestNumberedChapter: { __typename: 'ChapterType'; id: number; chapterNumber: number } | null;
        };
    }>;
};

export type UpdaterSubscriptionFieldsFragment = {
    __typename: 'UpdaterUpdates';
    omittedUpdates: boolean;
    jobsInfo: {
        __typename: 'UpdaterJobsInfoType';
        isRunning: boolean;
        totalJobs: number;
        finishedJobs: number;
        skippedCategoriesCount: number;
        skippedMangasCount: number;
    };
    categoryUpdates: Array<{
        __typename: 'CategoryUpdateType';
        status: Types.CategoryJobStatus;
        category: { __typename: 'CategoryType'; id: number; name: string };
    }>;
    mangaUpdates: Array<{
        __typename: 'MangaUpdateType';
        status: Types.MangaJobStatus;
        manga: {
            __typename: 'MangaType';
            id: number;
            title: string;
            thumbnailUrl: string | null;
            unreadCount: number;
            downloadCount: number;
            bookmarkCount: number;
            hasDuplicateChapters: boolean;
            chapters: { __typename: 'ChapterNodeList'; totalCount: number };
            firstUnreadChapter: {
                __typename: 'ChapterType';
                id: number;
                sourceOrder: number;
                isRead: boolean;
                mangaId: number;
                chapterNumber: number;
                name: string;
                scanlator: string | null;
            } | null;
            lastReadChapter: { __typename: 'ChapterType'; id: number; sourceOrder: number; lastReadAt: string } | null;
            latestReadChapter: {
                __typename: 'ChapterType';
                id: number;
                sourceOrder: number;
                lastReadAt: string;
            } | null;
            latestFetchedChapter: { __typename: 'ChapterType'; id: number; fetchedAt: string } | null;
            latestUploadedChapter: { __typename: 'ChapterType'; id: number; uploadDate: string } | null;
            highestNumberedChapter: { __typename: 'ChapterType'; id: number; chapterNumber: number } | null;
        };
    }>;
};

export type UpdaterStartStopFieldsFragment = { __typename: 'UpdateStatus'; isRunning: boolean };

export type UpdateLibraryMutationVariables = Exact<{
    input?: Types.UpdateLibraryInput | null | undefined;
}>;

export type UpdateLibraryMutation = {
    __typename: 'Mutation';
    updateLibrary: {
        __typename: 'UpdateLibraryPayload';
        updateStatus: {
            __typename: 'LibraryUpdateStatus';
            jobsInfo: {
                __typename: 'UpdaterJobsInfoType';
                isRunning: boolean;
                totalJobs: number;
                finishedJobs: number;
                skippedCategoriesCount: number;
                skippedMangasCount: number;
            };
            categoryUpdates: Array<{
                __typename: 'CategoryUpdateType';
                status: Types.CategoryJobStatus;
                category: { __typename: 'CategoryType'; id: number; name: string };
            }>;
            mangaUpdates: Array<{
                __typename: 'MangaUpdateType';
                status: Types.MangaJobStatus;
                manga: {
                    __typename: 'MangaType';
                    id: number;
                    title: string;
                    thumbnailUrl: string | null;
                    unreadCount: number;
                    downloadCount: number;
                    bookmarkCount: number;
                    hasDuplicateChapters: boolean;
                    chapters: { __typename: 'ChapterNodeList'; totalCount: number };
                    firstUnreadChapter: {
                        __typename: 'ChapterType';
                        id: number;
                        sourceOrder: number;
                        isRead: boolean;
                        mangaId: number;
                        chapterNumber: number;
                        name: string;
                        scanlator: string | null;
                    } | null;
                    lastReadChapter: {
                        __typename: 'ChapterType';
                        id: number;
                        sourceOrder: number;
                        lastReadAt: string;
                    } | null;
                    latestReadChapter: {
                        __typename: 'ChapterType';
                        id: number;
                        sourceOrder: number;
                        lastReadAt: string;
                    } | null;
                    latestFetchedChapter: { __typename: 'ChapterType'; id: number; fetchedAt: string } | null;
                    latestUploadedChapter: { __typename: 'ChapterType'; id: number; uploadDate: string } | null;
                    highestNumberedChapter: { __typename: 'ChapterType'; id: number; chapterNumber: number } | null;
                };
            }>;
        };
    } | null;
};

export type StopUpdaterMutationVariables = Exact<{
    input?: Types.UpdateStopInput | null | undefined;
}>;

export type StopUpdaterMutation = {
    __typename: 'Mutation';
    updateStop: { __typename: 'UpdateStopPayload'; clientMutationId: string | null };
};

export type GetUpdateStatusQueryVariables = Exact<{ [key: string]: never }>;

export type GetUpdateStatusQuery = {
    __typename: 'Query';
    libraryUpdateStatus: {
        __typename: 'LibraryUpdateStatus';
        jobsInfo: {
            __typename: 'UpdaterJobsInfoType';
            isRunning: boolean;
            totalJobs: number;
            finishedJobs: number;
            skippedCategoriesCount: number;
            skippedMangasCount: number;
        };
        categoryUpdates: Array<{
            __typename: 'CategoryUpdateType';
            status: Types.CategoryJobStatus;
            category: { __typename: 'CategoryType'; id: number; name: string };
        }>;
        mangaUpdates: Array<{
            __typename: 'MangaUpdateType';
            status: Types.MangaJobStatus;
            manga: {
                __typename: 'MangaType';
                id: number;
                title: string;
                thumbnailUrl: string | null;
                unreadCount: number;
                downloadCount: number;
                bookmarkCount: number;
                hasDuplicateChapters: boolean;
                chapters: { __typename: 'ChapterNodeList'; totalCount: number };
                firstUnreadChapter: {
                    __typename: 'ChapterType';
                    id: number;
                    sourceOrder: number;
                    isRead: boolean;
                    mangaId: number;
                    chapterNumber: number;
                    name: string;
                    scanlator: string | null;
                } | null;
                lastReadChapter: {
                    __typename: 'ChapterType';
                    id: number;
                    sourceOrder: number;
                    lastReadAt: string;
                } | null;
                latestReadChapter: {
                    __typename: 'ChapterType';
                    id: number;
                    sourceOrder: number;
                    lastReadAt: string;
                } | null;
                latestFetchedChapter: { __typename: 'ChapterType'; id: number; fetchedAt: string } | null;
                latestUploadedChapter: { __typename: 'ChapterType'; id: number; uploadDate: string } | null;
                highestNumberedChapter: { __typename: 'ChapterType'; id: number; chapterNumber: number } | null;
            };
        }>;
    };
};

export type GetLastUpdateTimestampQueryVariables = Exact<{ [key: string]: never }>;

export type GetLastUpdateTimestampQuery = {
    __typename: 'Query';
    lastUpdateTimestamp: { __typename: 'LastUpdateTimestampPayload'; timestamp: string };
};

export type UpdaterSubscriptionVariables = Exact<{
    input: Types.LibraryUpdateStatusChangedInput;
}>;

export type UpdaterSubscription = {
    __typename: 'Subscription';
    libraryUpdateStatusChanged: {
        __typename: 'UpdaterUpdates';
        omittedUpdates: boolean;
        jobsInfo: {
            __typename: 'UpdaterJobsInfoType';
            isRunning: boolean;
            totalJobs: number;
            finishedJobs: number;
            skippedCategoriesCount: number;
            skippedMangasCount: number;
        };
        categoryUpdates: Array<{
            __typename: 'CategoryUpdateType';
            status: Types.CategoryJobStatus;
            category: { __typename: 'CategoryType'; id: number; name: string };
        }>;
        mangaUpdates: Array<{
            __typename: 'MangaUpdateType';
            status: Types.MangaJobStatus;
            manga: {
                __typename: 'MangaType';
                id: number;
                title: string;
                thumbnailUrl: string | null;
                unreadCount: number;
                downloadCount: number;
                bookmarkCount: number;
                hasDuplicateChapters: boolean;
                chapters: { __typename: 'ChapterNodeList'; totalCount: number };
                firstUnreadChapter: {
                    __typename: 'ChapterType';
                    id: number;
                    sourceOrder: number;
                    isRead: boolean;
                    mangaId: number;
                    chapterNumber: number;
                    name: string;
                    scanlator: string | null;
                } | null;
                lastReadChapter: {
                    __typename: 'ChapterType';
                    id: number;
                    sourceOrder: number;
                    lastReadAt: string;
                } | null;
                latestReadChapter: {
                    __typename: 'ChapterType';
                    id: number;
                    sourceOrder: number;
                    lastReadAt: string;
                } | null;
                latestFetchedChapter: { __typename: 'ChapterType'; id: number; fetchedAt: string } | null;
                latestUploadedChapter: { __typename: 'ChapterType'; id: number; uploadDate: string } | null;
                highestNumberedChapter: { __typename: 'ChapterType'; id: number; chapterNumber: number } | null;
            };
        }>;
    };
};

export type UserLoginMutationVariables = Exact<{
    password: string;
    username: string;
}>;

export type UserLoginMutation = {
    __typename: 'Mutation';
    login: { __typename: 'LoginPayload'; accessToken: string; refreshToken: string };
};

export type UserRefreshMutationVariables = Exact<{
    refreshToken: string;
}>;

export type UserRefreshMutation = {
    __typename: 'Mutation';
    refreshToken: { __typename: 'RefreshTokenPayload'; accessToken: string };
};
