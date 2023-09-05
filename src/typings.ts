/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { OverridableComponent } from '@mui/material/OverridableComponent';
import { SvgIconTypeMap } from '@mui/material/SvgIcon/SvgIcon';
import { ParseKeys } from 'i18next';
import { Location } from 'react-router-dom';

type GenericLocation<State = any> = Omit<Location, 'state'> & { state?: State };

declare module 'react-router-dom' {
    export function useParams<Params extends { [K in keyof Params]: string } = {}>(): Params;

    export function useLocation<State = any>(): GenericLocation<State>;
}

export type TranslationKey = ParseKeys;

export interface IExtension {
    name: string;
    pkgName: string;
    versionName: string;
    versionCode: number;
    lang: string;
    isNsfw: boolean;
    apkName: string;
    iconUrl: string;
    installed: boolean;
    hasUpdate: boolean;
    obsolete: boolean;
}

export interface ISource {
    id: string;
    name: string;
    lang: string;
    iconUrl: string;
    supportsLatest: boolean;
    isConfigurable: boolean;
    isNsfw: boolean;
    displayName: string;
}

export interface ISourceFilters {
    type: string;
    filter: ISourceFilter;
}

export interface ISourceFilter {
    name: string;
    state: number | string | boolean | ISourceFilters[] | IState;
    values?: string[];
    displayValues?: string[];
    selected?: ISelected;
}

export interface ISelected {
    displayname: string;
    value: string;
    _value: string;
}

export interface IState {
    ascending: boolean;
    index: number;
}

export interface IMetadataMigration {
    appKeyPrefix?: { oldPrefix: string; newPrefix: string };
    values?: {
        /**
         * In case the migration should only be applied to a specific metadata key.
         * Otherwise, all metadata keys will get migrated.
         */
        key?: string;
        oldValue: string;
        newValue: string;
    }[];
    keys?: { oldKey: string; newKey: string }[];
}

export type Metadata<Keys extends string = string, Values = string> = {
    [key in Keys]: Values;
};

export type MetadataHolder<Keys extends string = string, Values = string> = {
    meta?: Metadata<Keys, Values>;
};

export type AllowedMetadataValueTypes = string | boolean | number | undefined;

export type MangaMetadataKeys = keyof IReaderSettings;

export type SearchMetadataKeys = keyof ISearchSettings;

export type AppMetadataKeys = MangaMetadataKeys | SearchMetadataKeys;

export type MetadataKeyValuePair = [AppMetadataKeys, AllowedMetadataValueTypes];

export interface IMangaCard {
    id: number;
    title: string;
    genre: string[];
    thumbnailUrl: string;
    unreadCount?: number;
    downloadCount?: number;
    inLibrary?: boolean;
    meta?: Metadata;
    inLibraryAt: number;
    lastReadAt: number;
}

export interface IManga {
    id: number;
    sourceId: string;

    url: string;
    title: string;
    thumbnailUrl: string;

    artist: string;
    author: string;
    description: string;
    genre: string[];
    status: string;

    inLibrary: boolean;
    source: ISource;

    meta: Metadata;

    realUrl: string;
    freshData: boolean;
    unreadCount?: number;
    downloadCount?: number;

    age: number;
    chaptersAge: number;
    chaptersLastFetchedAt: number;
    inLibraryAt: number;
    initialized: boolean;
    lastChapterRead: NullAndUndefined<IChapter>;
    lastFetchedAt: number;
    lastReadAt: number;
    thumbnailUrlLastFetched: number;
    updateStrategy: string;
}

export interface IChapter {
    id: number;
    url: string;
    name: string;
    uploadDate: number;
    chapterNumber: number;
    scanlator: string;
    mangaId: number;
    read: boolean;
    bookmarked: boolean;
    lastPageRead: number;
    lastReadAt: number;
    index: number;
    fetchedAt: number;
    chapterCount: number;
    pageCount: number;
    downloaded: boolean;
    meta: Metadata;
}

export interface IMangaChapter {
    manga: IManga;
    chapter: IChapter;
}

export interface IPartialChapter {
    pageCount: number;
    index: number;
    chapterCount: number;
    lastPageRead: number;
}

export enum IncludeInGlobalUpdate {
    EXCLUDE = 0,
    INCLUDE = 1,
    UNSET = -1,
}

export interface ICategory {
    id: number;
    order: number;
    name: string;
    default: boolean;
    includeInUpdate: IncludeInGlobalUpdate;
    meta: Metadata;
    size: number;
}

export interface INavbarOverride {
    status: boolean;
    value: any;
}

export type ReaderType =
    | 'ContinuesVertical'
    | 'Webtoon'
    | 'SingleVertical'
    | 'SingleRTL'
    | 'SingleLTR'
    | 'DoubleVertical'
    | 'DoubleRTL'
    | 'DoubleLTR'
    | 'ContinuesHorizontalLTR'
    | 'ContinuesHorizontalRTL';

export interface IReaderSettings {
    staticNav: boolean;
    showPageNumber: boolean;
    loadNextOnEnding: boolean;
    skipDupChapters: boolean;
    fitPageToWindow: boolean;
    readerType: ReaderType;
    offsetDoubleSpreads: boolean;
}

export enum ChapterOffset {
    PREV = -1,
    NEXT = 1,
}

export interface ISearchSettings {
    ignoreFilters: boolean;
}

export interface IReaderPage {
    index: number;
    src: string;
}

export interface IReaderProps {
    pages: Array<IReaderPage>;
    pageCount: number;
    setCurPage: React.Dispatch<React.SetStateAction<number>>;
    curPage: number;
    initialPage: number;
    settings: IReaderSettings;
    manga: IMangaCard | IManga;
    chapter: IChapter | IPartialChapter;
    nextChapter: () => void;
    prevChapter: () => void;
}

export interface IAbout {
    name: string;
    version: string;
    revision: string;
    buildType: 'Stable' | 'Preview';
    buildTime: number;
    github: string;
    discord: string;
}

export interface IDownloadChapter {
    chapterIndex: number;
    mangaId: number;
    state: 'Queued' | 'Downloading' | 'Finished' | 'Error';
    progress: number;
    chapter: IChapter;
    manga: IManga;
}

export interface IQueue {
    status: 'Stopped' | 'Started';
    queue: IDownloadChapter[];
}

export interface IUpdateStatus {
    running: boolean;
    mangaStatusMap: {
        COMPLETE?: IManga[];
        RUNNING?: IManga[];
        PENDING?: IManga[];
    };
}

export interface PreferenceProps {
    key: string;
    title: string;
    summary: string;
    defaultValue: any;
    currentValue: any;
    defaultValueType: string;

    // intetnal props
    updateValue: any;
}

export interface TwoStatePreferenceProps extends PreferenceProps {
    // intetnal props
    type: 'Switch' | 'Checkbox';
}

export interface CheckBoxPreferenceProps extends PreferenceProps {}

export interface SwitchPreferenceCompatProps extends PreferenceProps {}

export interface ListPreferenceProps extends PreferenceProps {
    entries: string[];
    entryValues: string[];
}

export interface MultiSelectListPreferenceProps extends PreferenceProps {
    entries: string[];
    entryValues: string[];
}

export interface EditTextPreferenceProps extends PreferenceProps {
    dialogTitle: string;
    dialogMessage: string;
    text: string;
}

export interface SourcePreferences {
    type: string;
    props: any;
}

export interface NavbarItem {
    path: string;
    title: TranslationKey;
    SelectedIconComponent: OverridableComponent<SvgIconTypeMap<{}, 'svg'>>;
    IconComponent: OverridableComponent<SvgIconTypeMap<{}, 'svg'>>;
    show: 'mobile' | 'desktop' | 'both';
}

export interface PaginatedList<T> {
    page: T[];
    hasNextPage: boolean;
}

export type PaginatedMangaList = {
    mangaList: IManga[];
    hasNextPage: boolean;
};

export type NullAndUndefined<T> = T | null | undefined;

export type ChapterSortMode = 'fetchedAt' | 'source';

export interface ChapterListOptions {
    active: boolean;
    unread: NullAndUndefined<boolean>;
    downloaded: NullAndUndefined<boolean>;
    bookmarked: NullAndUndefined<boolean>;
    reverse: boolean;
    sortBy: ChapterSortMode;
    showChapterNumber: boolean;
}

export type ChapterOptionsReducerAction =
    | { type: 'filter'; filterType: string; filterValue: NullAndUndefined<boolean> }
    | { type: 'sortBy'; sortBy: ChapterSortMode }
    | { type: 'sortReverse' }
    | { type: 'showChapterNumber' };

export type LibrarySortMode = 'sortToRead' | 'sortAlph' | 'sortDateAdded' | 'sortLastRead';

enum GridLayout {
    Compact = 0,
    Comfortable = 1,
    List = 2,
}

export interface LibraryOptions {
    // display options
    showDownloadBadge: boolean;
    showUnreadBadge: boolean;
    gridLayout: GridLayout;
    SourcegridLayout: GridLayout;

    // filter options
    downloaded: NullAndUndefined<boolean>;
    unread: NullAndUndefined<boolean>;
    sorts: NullAndUndefined<LibrarySortMode>;
    sortDesc: NullAndUndefined<boolean>;
    showTabSize: boolean;
}

export interface BatchChaptersChange {
    delete?: boolean;
    isRead?: boolean;
    isBookmarked?: boolean;
    lastPageRead?: number;
}

export type UpdateCheck = {
    channel: 'Stable' | 'Preview';
    tag: string;
    url: string;
};

export type SourceSearchResult = {
    mangaList: IManga[];
    hasNextPage: boolean;
};

export type BackupValidationResult = {
    missingSources: string[];
    missingTrackers: string[];
    mangasMissingSources: string[];
};
