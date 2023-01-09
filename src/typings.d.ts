/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

interface IExtension {
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

interface ISource {
    id: string;
    name: string;
    lang: string;
    iconUrl: string;
    supportsLatest: boolean;
    isConfigurable: boolean;
    isNsfw: boolean;
    displayName: string;
}

interface ISourceFilters {
    type: string;
    filter: ISourceFilter;
}

interface ISourceFilter {
    name: string;
    state: number | string | boolean | ISourceFilters[] | IState;
    values?: string[];
    displayValues?: string[];
    selected?: ISelected;
}

interface ISelected {
    displayname: string;
    value: string;
    _value: string;
}

interface IState {
    ascending: boolean;
    index: number;
}

interface IMetadataMigration {
    appKeyPrefix?: { oldPrefix: string; newPrefix: string };
    keys?: { oldKey: string; newKey: string }[];
}

interface IMetadata<VALUES extends AllowedMetadataValueTypes = string> {
    [key: string]: VALUES;
}

interface IMetadataHolder<VALUES extends AllowedMetadataValueTypes = string> {
    meta?: IMetadata<VALUES>;
}

type AllowedMetadataValueTypes = string | boolean | number | undefined;

type MangaMetadataKeys = keyof IReaderSettings;

type AppMetadataKeys = MangaMetadataKeys;

type MetadataKeyValuePair = [AppMetadataKeys, AllowedMetadataValueTypes];

interface IMangaCard {
    id: number;
    title: string;
    thumbnailUrl: string;
    unreadCount?: number;
    downloadCount?: number;
    inLibrary?: boolean;
    meta?: IMetadata;
}

interface IManga {
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

    meta: IMetadata;

    realUrl: string;
    freshData: boolean;
    unreadCount?: number;
    downloadCount?: number;

    age: number;
    chaptersAge: number;
}

interface IChapter {
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
    meta: IAppMetadata;
}

interface IMangaChapter {
    manga: IManga;
    chapter: IChapter;
}

interface IPartialChapter {
    pageCount: number;
    index: number;
    chapterCount: number;
    lastPageRead: number;
}

interface ICategory {
    id: number;
    order: number;
    name: string;
    default: boolean;
    meta: IAppMetadata;
}

interface INavbarOverride {
    status: boolean;
    value: any;
}

type ReaderType =
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

interface IReaderSettings {
    staticNav: boolean;
    showPageNumber: boolean;
    loadNextOnEnding: boolean;
    readerType: ReaderType;
}

interface IReaderPage {
    index: number;
    src: string;
}

interface IReaderProps {
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

interface IAbout {
    name: string;
    version: string;
    revision: string;
    buildType: 'Stable' | 'Preview';
    buildTime: number;
    github: string;
    discord: string;
}

interface IDownloadChapter {
    chapterIndex: number;
    mangaId: number;
    state: 'Queued' | 'Downloading' | 'Finished' | 'Error';
    progress: number;
    chapter: IChapter;
    manga: IManga;
}

interface IQueue {
    status: 'Stopped' | 'Started';
    queue: IDownloadChapter[];
}

interface IUpdateStatus {
    running: boolean;
    statusMap: {
        COMPLETE?: IManga[];
        RUNNING?: IManga[];
        PENDING?: IManga[];
    };
}

interface PreferenceProps {
    key: string;
    title: string;
    summary: string;
    defaultValue: any;
    currentValue: any;
    defaultValueType: string;

    // intetnal props
    updateValue: any;
}

interface TwoStatePreferenceProps extends PreferenceProps {
    // intetnal props
    type: 'Switch' | 'Checkbox';
}

interface CheckBoxPreferenceProps extends PreferenceProps {}

interface SwitchPreferenceCompatProps extends PreferenceProps {}

interface ListPreferenceProps extends PreferenceProps {
    entries: string[];
    entryValues: string[];
}

interface MultiSelectListPreferenceProps extends PreferenceProps {
    entries: string[];
    entryValues: string[];
}

interface EditTextPreferenceProps extends PreferenceProps {
    dialogTitle: string;
    dialogMessage: string;
    text: string;
}

interface SourcePreferences {
    type: string;
    props: any;
}

interface NavbarItem {
    path: string;
    title: string;
    SelectedIconComponent: OverridableComponent<SvgIconTypeMap<{}, 'svg'>>;
    IconComponent: OverridableComponent<SvgIconTypeMap<{}, 'svg'>>;
    show: 'mobile' | 'desktop' | 'both';
}

interface PaginatedList<T> {
    page: T[];
    hasNextPage: boolean;
}

type NullAndUndefined<T> = T | null | undefined;

type ChapterSortMode = 'fetchedAt' | 'source';

interface ChapterListOptions {
    active: boolean;
    unread: NullAndUndefined<boolean>;
    downloaded: NullAndUndefined<boolean>;
    bookmarked: NullAndUndefined<boolean>;
    reverse: boolean;
    sortBy: ChapterSortMode;
    showChapterNumber: boolean;
}

type ChapterOptionsReducerAction =
    | { type: 'filter'; filterType: string; filterValue: NullAndUndefined<boolean> }
    | { type: 'sortBy'; sortBy: ChapterSortMode }
    | { type: 'sortReverse' }
    | { type: 'showChapterNumber' };

type LibrarySortMode = 'sortToRead' | 'sortAlph' | 'sortID';

enum GridLayout {
    Compact = 0,
    Comfortable = 1,
    List = 2,
}

interface LibraryOptions {
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
}

interface BatchChaptersChange {
    delete?: boolean;
    isRead?: boolean;
    isBookmarked?: boolean;
    lastPageRead?: number;
}
