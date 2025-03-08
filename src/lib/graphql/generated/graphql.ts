export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  Cursor: { input: string; output: string; }
  LongString: { input: string; output: string; }
  Upload: { input: any; output: any; }
};

export type AboutServerPayload = {
  __typename?: 'AboutServerPayload';
  buildTime: Scalars['LongString']['output'];
  buildType: Scalars['String']['output'];
  discord: Scalars['String']['output'];
  github: Scalars['String']['output'];
  name: Scalars['String']['output'];
  revision: Scalars['String']['output'];
  version: Scalars['String']['output'];
};

export type AboutWebUi = {
  __typename?: 'AboutWebUI';
  channel: Scalars['String']['output'];
  tag: Scalars['String']['output'];
};

export enum BackupRestoreState {
  Failure = 'FAILURE',
  Idle = 'IDLE',
  RestoringCategories = 'RESTORING_CATEGORIES',
  RestoringManga = 'RESTORING_MANGA',
  Success = 'SUCCESS'
}

export type BackupRestoreStatus = {
  __typename?: 'BackupRestoreStatus';
  mangaProgress: Scalars['Int']['output'];
  state: BackupRestoreState;
  totalManga: Scalars['Int']['output'];
};

export type BindTrackInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  mangaId: Scalars['Int']['input'];
  remoteId: Scalars['LongString']['input'];
  trackerId: Scalars['Int']['input'];
};

export type BindTrackPayload = {
  __typename?: 'BindTrackPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  trackRecord: TrackRecordType;
};

export type BooleanFilterInput = {
  distinctFrom?: InputMaybe<Scalars['Boolean']['input']>;
  distinctFromAll?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  distinctFromAny?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  equalTo?: InputMaybe<Scalars['Boolean']['input']>;
  greaterThan?: InputMaybe<Scalars['Boolean']['input']>;
  greaterThanOrEqualTo?: InputMaybe<Scalars['Boolean']['input']>;
  in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  lessThan?: InputMaybe<Scalars['Boolean']['input']>;
  lessThanOrEqualTo?: InputMaybe<Scalars['Boolean']['input']>;
  notDistinctFrom?: InputMaybe<Scalars['Boolean']['input']>;
  notEqualTo?: InputMaybe<Scalars['Boolean']['input']>;
  notEqualToAll?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  notEqualToAny?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  notIn?: InputMaybe<Array<Scalars['Boolean']['input']>>;
};

export type CategoryConditionInput = {
  default?: InputMaybe<Scalars['Boolean']['input']>;
  id?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  order?: InputMaybe<Scalars['Int']['input']>;
};

export type CategoryEdge = Edge & {
  __typename?: 'CategoryEdge';
  cursor: Scalars['Cursor']['output'];
  node: CategoryType;
};

export type CategoryFilterInput = {
  and?: InputMaybe<Array<CategoryFilterInput>>;
  default?: InputMaybe<BooleanFilterInput>;
  id?: InputMaybe<IntFilterInput>;
  name?: InputMaybe<StringFilterInput>;
  not?: InputMaybe<CategoryFilterInput>;
  or?: InputMaybe<Array<CategoryFilterInput>>;
  order?: InputMaybe<IntFilterInput>;
};

export type CategoryMetaType = MetaType & {
  __typename?: 'CategoryMetaType';
  category: CategoryType;
  categoryId: Scalars['Int']['output'];
  key: Scalars['String']['output'];
  value: Scalars['String']['output'];
};

export type CategoryMetaTypeInput = {
  categoryId: Scalars['Int']['input'];
  key: Scalars['String']['input'];
  value: Scalars['String']['input'];
};

export type CategoryNodeList = NodeList & {
  __typename?: 'CategoryNodeList';
  edges: Array<CategoryEdge>;
  nodes: Array<CategoryType>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export enum CategoryOrderBy {
  Id = 'ID',
  Name = 'NAME',
  Order = 'ORDER'
}

export type CategoryOrderInput = {
  by: CategoryOrderBy;
  byType?: InputMaybe<SortOrder>;
};

export type CategoryType = {
  __typename?: 'CategoryType';
  default: Scalars['Boolean']['output'];
  id: Scalars['Int']['output'];
  includeInDownload: IncludeOrExclude;
  includeInUpdate: IncludeOrExclude;
  mangas: MangaNodeList;
  meta: Array<CategoryMetaType>;
  name: Scalars['String']['output'];
  order: Scalars['Int']['output'];
};

export type ChapterConditionInput = {
  chapterNumber?: InputMaybe<Scalars['Float']['input']>;
  fetchedAt?: InputMaybe<Scalars['LongString']['input']>;
  id?: InputMaybe<Scalars['Int']['input']>;
  isBookmarked?: InputMaybe<Scalars['Boolean']['input']>;
  isDownloaded?: InputMaybe<Scalars['Boolean']['input']>;
  isRead?: InputMaybe<Scalars['Boolean']['input']>;
  lastPageRead?: InputMaybe<Scalars['Int']['input']>;
  lastReadAt?: InputMaybe<Scalars['LongString']['input']>;
  mangaId?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  pageCount?: InputMaybe<Scalars['Int']['input']>;
  realUrl?: InputMaybe<Scalars['String']['input']>;
  scanlator?: InputMaybe<Scalars['String']['input']>;
  sourceOrder?: InputMaybe<Scalars['Int']['input']>;
  uploadDate?: InputMaybe<Scalars['LongString']['input']>;
  url?: InputMaybe<Scalars['String']['input']>;
};

export type ChapterEdge = Edge & {
  __typename?: 'ChapterEdge';
  cursor: Scalars['Cursor']['output'];
  node: ChapterType;
};

export type ChapterFilterInput = {
  and?: InputMaybe<Array<ChapterFilterInput>>;
  chapterNumber?: InputMaybe<FloatFilterInput>;
  fetchedAt?: InputMaybe<LongFilterInput>;
  id?: InputMaybe<IntFilterInput>;
  inLibrary?: InputMaybe<BooleanFilterInput>;
  isBookmarked?: InputMaybe<BooleanFilterInput>;
  isDownloaded?: InputMaybe<BooleanFilterInput>;
  isRead?: InputMaybe<BooleanFilterInput>;
  lastPageRead?: InputMaybe<IntFilterInput>;
  lastReadAt?: InputMaybe<LongFilterInput>;
  mangaId?: InputMaybe<IntFilterInput>;
  name?: InputMaybe<StringFilterInput>;
  not?: InputMaybe<ChapterFilterInput>;
  or?: InputMaybe<Array<ChapterFilterInput>>;
  pageCount?: InputMaybe<IntFilterInput>;
  realUrl?: InputMaybe<StringFilterInput>;
  scanlator?: InputMaybe<StringFilterInput>;
  sourceOrder?: InputMaybe<IntFilterInput>;
  uploadDate?: InputMaybe<LongFilterInput>;
  url?: InputMaybe<StringFilterInput>;
};

export type ChapterMetaType = MetaType & {
  __typename?: 'ChapterMetaType';
  chapter: ChapterType;
  chapterId: Scalars['Int']['output'];
  key: Scalars['String']['output'];
  value: Scalars['String']['output'];
};

export type ChapterMetaTypeInput = {
  chapterId: Scalars['Int']['input'];
  key: Scalars['String']['input'];
  value: Scalars['String']['input'];
};

export type ChapterNodeList = NodeList & {
  __typename?: 'ChapterNodeList';
  edges: Array<ChapterEdge>;
  nodes: Array<ChapterType>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export enum ChapterOrderBy {
  ChapterNumber = 'CHAPTER_NUMBER',
  FetchedAt = 'FETCHED_AT',
  Id = 'ID',
  LastReadAt = 'LAST_READ_AT',
  Name = 'NAME',
  SourceOrder = 'SOURCE_ORDER',
  UploadDate = 'UPLOAD_DATE'
}

export type ChapterOrderInput = {
  by: ChapterOrderBy;
  byType?: InputMaybe<SortOrder>;
};

export type ChapterType = {
  __typename?: 'ChapterType';
  chapterNumber: Scalars['Float']['output'];
  fetchedAt: Scalars['LongString']['output'];
  id: Scalars['Int']['output'];
  isBookmarked: Scalars['Boolean']['output'];
  isDownloaded: Scalars['Boolean']['output'];
  isRead: Scalars['Boolean']['output'];
  lastPageRead: Scalars['Int']['output'];
  lastReadAt: Scalars['LongString']['output'];
  manga: MangaType;
  mangaId: Scalars['Int']['output'];
  meta: Array<ChapterMetaType>;
  name: Scalars['String']['output'];
  pageCount: Scalars['Int']['output'];
  realUrl?: Maybe<Scalars['String']['output']>;
  scanlator?: Maybe<Scalars['String']['output']>;
  sourceOrder: Scalars['Int']['output'];
  uploadDate: Scalars['LongString']['output'];
  url: Scalars['String']['output'];
};

export type CheckBoxFilter = {
  __typename?: 'CheckBoxFilter';
  default: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
};

export type CheckBoxPreference = {
  __typename?: 'CheckBoxPreference';
  currentValue?: Maybe<Scalars['Boolean']['output']>;
  default: Scalars['Boolean']['output'];
  key: Scalars['String']['output'];
  summary?: Maybe<Scalars['String']['output']>;
  title: Scalars['String']['output'];
  visible: Scalars['Boolean']['output'];
};

export type CheckForServerUpdatesPayload = {
  __typename?: 'CheckForServerUpdatesPayload';
  channel: Scalars['String']['output'];
  tag: Scalars['String']['output'];
  url: Scalars['String']['output'];
};

export type ClearCachedImagesInput = {
  cachedPages?: InputMaybe<Scalars['Boolean']['input']>;
  cachedThumbnails?: InputMaybe<Scalars['Boolean']['input']>;
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  downloadedThumbnails?: InputMaybe<Scalars['Boolean']['input']>;
};

export type ClearCachedImagesPayload = {
  __typename?: 'ClearCachedImagesPayload';
  cachedPages?: Maybe<Scalars['Boolean']['output']>;
  cachedThumbnails?: Maybe<Scalars['Boolean']['output']>;
  clientMutationId?: Maybe<Scalars['String']['output']>;
  downloadedThumbnails?: Maybe<Scalars['Boolean']['output']>;
};

export type ClearDownloaderInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
};

export type ClearDownloaderPayload = {
  __typename?: 'ClearDownloaderPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  downloadStatus: DownloadStatus;
};

export type CreateBackupInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  includeCategories?: InputMaybe<Scalars['Boolean']['input']>;
  includeChapters?: InputMaybe<Scalars['Boolean']['input']>;
};

export type CreateBackupPayload = {
  __typename?: 'CreateBackupPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  url: Scalars['String']['output'];
};

export type CreateCategoryInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  default?: InputMaybe<Scalars['Boolean']['input']>;
  includeInDownload?: InputMaybe<IncludeOrExclude>;
  includeInUpdate?: InputMaybe<IncludeOrExclude>;
  name: Scalars['String']['input'];
  order?: InputMaybe<Scalars['Int']['input']>;
};

export type CreateCategoryPayload = {
  __typename?: 'CreateCategoryPayload';
  category: CategoryType;
  clientMutationId?: Maybe<Scalars['String']['output']>;
};

export type DeleteCategoryInput = {
  categoryId: Scalars['Int']['input'];
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
};

export type DeleteCategoryMetaInput = {
  categoryId: Scalars['Int']['input'];
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  key: Scalars['String']['input'];
};

export type DeleteCategoryMetaPayload = {
  __typename?: 'DeleteCategoryMetaPayload';
  category: CategoryType;
  clientMutationId?: Maybe<Scalars['String']['output']>;
  meta?: Maybe<CategoryMetaType>;
};

export type DeleteCategoryPayload = {
  __typename?: 'DeleteCategoryPayload';
  category?: Maybe<CategoryType>;
  clientMutationId?: Maybe<Scalars['String']['output']>;
  mangas: Array<MangaType>;
};

export type DeleteChapterMetaInput = {
  chapterId: Scalars['Int']['input'];
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  key: Scalars['String']['input'];
};

export type DeleteChapterMetaPayload = {
  __typename?: 'DeleteChapterMetaPayload';
  chapter: ChapterType;
  clientMutationId?: Maybe<Scalars['String']['output']>;
  meta?: Maybe<ChapterMetaType>;
};

export type DeleteDownloadedChapterInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['Int']['input'];
};

export type DeleteDownloadedChapterPayload = {
  __typename?: 'DeleteDownloadedChapterPayload';
  chapters: ChapterType;
  clientMutationId?: Maybe<Scalars['String']['output']>;
};

export type DeleteDownloadedChaptersInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  ids: Array<Scalars['Int']['input']>;
};

export type DeleteDownloadedChaptersPayload = {
  __typename?: 'DeleteDownloadedChaptersPayload';
  chapters: Array<ChapterType>;
  clientMutationId?: Maybe<Scalars['String']['output']>;
};

export type DeleteGlobalMetaInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  key: Scalars['String']['input'];
};

export type DeleteGlobalMetaPayload = {
  __typename?: 'DeleteGlobalMetaPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  meta?: Maybe<GlobalMetaType>;
};

export type DeleteMangaMetaInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  key: Scalars['String']['input'];
  mangaId: Scalars['Int']['input'];
};

export type DeleteMangaMetaPayload = {
  __typename?: 'DeleteMangaMetaPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  manga: MangaType;
  meta?: Maybe<MangaMetaType>;
};

export type DeleteSourceMetaInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  key: Scalars['String']['input'];
  sourceId: Scalars['LongString']['input'];
};

export type DeleteSourceMetaPayload = {
  __typename?: 'DeleteSourceMetaPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  meta?: Maybe<SourceMetaType>;
  source?: Maybe<SourceType>;
};

export type DequeueChapterDownloadInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['Int']['input'];
};

export type DequeueChapterDownloadPayload = {
  __typename?: 'DequeueChapterDownloadPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  downloadStatus: DownloadStatus;
};

export type DequeueChapterDownloadsInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  ids: Array<Scalars['Int']['input']>;
};

export type DequeueChapterDownloadsPayload = {
  __typename?: 'DequeueChapterDownloadsPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  downloadStatus: DownloadStatus;
};

export type DoubleFilterInput = {
  distinctFrom?: InputMaybe<Scalars['Float']['input']>;
  distinctFromAll?: InputMaybe<Array<Scalars['Float']['input']>>;
  distinctFromAny?: InputMaybe<Array<Scalars['Float']['input']>>;
  equalTo?: InputMaybe<Scalars['Float']['input']>;
  greaterThan?: InputMaybe<Scalars['Float']['input']>;
  greaterThanOrEqualTo?: InputMaybe<Scalars['Float']['input']>;
  in?: InputMaybe<Array<Scalars['Float']['input']>>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  lessThan?: InputMaybe<Scalars['Float']['input']>;
  lessThanOrEqualTo?: InputMaybe<Scalars['Float']['input']>;
  notDistinctFrom?: InputMaybe<Scalars['Float']['input']>;
  notEqualTo?: InputMaybe<Scalars['Float']['input']>;
  notEqualToAll?: InputMaybe<Array<Scalars['Float']['input']>>;
  notEqualToAny?: InputMaybe<Array<Scalars['Float']['input']>>;
  notIn?: InputMaybe<Array<Scalars['Float']['input']>>;
};

export type DownloadChangedInput = {
  /** Sets a max number of updates that can be contained in a download update message.Everything above this limit will be omitted and the "downloadStatus" should be re-fetched via the corresponding query. Due to the graphql subscription execution strategy not supporting batching for data loaders, the data loaders run into the n+1 problem, which can cause the server to get unresponsive until the status update has been handled. This is an issue e.g. when mass en- or dequeuing downloads. */
  maxUpdates?: InputMaybe<Scalars['Int']['input']>;
};

export type DownloadEdge = Edge & {
  __typename?: 'DownloadEdge';
  cursor: Scalars['Cursor']['output'];
  node: DownloadType;
};

export type DownloadNodeList = NodeList & {
  __typename?: 'DownloadNodeList';
  edges: Array<DownloadEdge>;
  nodes: Array<DownloadType>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export enum DownloadState {
  Downloading = 'DOWNLOADING',
  Error = 'ERROR',
  Finished = 'FINISHED',
  Queued = 'QUEUED'
}

export type DownloadStatus = {
  __typename?: 'DownloadStatus';
  queue: Array<DownloadType>;
  state: DownloaderState;
};

export type DownloadType = {
  __typename?: 'DownloadType';
  chapter: ChapterType;
  manga: MangaType;
  position: Scalars['Int']['output'];
  progress: Scalars['Float']['output'];
  state: DownloadState;
  tries: Scalars['Int']['output'];
};

export type DownloadUpdate = {
  __typename?: 'DownloadUpdate';
  download: DownloadType;
  type: DownloadUpdateType;
};

export enum DownloadUpdateType {
  Dequeued = 'DEQUEUED',
  Error = 'ERROR',
  Finished = 'FINISHED',
  Paused = 'PAUSED',
  Position = 'POSITION',
  Progress = 'PROGRESS',
  Queued = 'QUEUED',
  Stopped = 'STOPPED'
}

export type DownloadUpdates = {
  __typename?: 'DownloadUpdates';
  /** The current download queue at the time of sending initial message. Is null for all following messages */
  initial?: Maybe<Array<DownloadType>>;
  /** Indicates whether updates have been omitted based on the "maxUpdates" subscription variable. In case updates have been omitted, the "downloadStatus" query should be re-fetched. */
  omittedUpdates: Scalars['Boolean']['output'];
  state: DownloaderState;
  updates: Array<DownloadUpdate>;
};

export enum DownloaderState {
  Started = 'STARTED',
  Stopped = 'STOPPED'
}

export type Edge = {
  /** A cursor for use in pagination. */
  cursor: Scalars['Cursor']['output'];
  /** The [T] at the end of the edge. */
  node: Node;
};

export type EditTextPreference = {
  __typename?: 'EditTextPreference';
  currentValue?: Maybe<Scalars['String']['output']>;
  default?: Maybe<Scalars['String']['output']>;
  dialogMessage?: Maybe<Scalars['String']['output']>;
  dialogTitle?: Maybe<Scalars['String']['output']>;
  key: Scalars['String']['output'];
  summary?: Maybe<Scalars['String']['output']>;
  text?: Maybe<Scalars['String']['output']>;
  title?: Maybe<Scalars['String']['output']>;
  visible: Scalars['Boolean']['output'];
};

export type EnqueueChapterDownloadInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['Int']['input'];
};

export type EnqueueChapterDownloadPayload = {
  __typename?: 'EnqueueChapterDownloadPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  downloadStatus: DownloadStatus;
};

export type EnqueueChapterDownloadsInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  ids: Array<Scalars['Int']['input']>;
};

export type EnqueueChapterDownloadsPayload = {
  __typename?: 'EnqueueChapterDownloadsPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  downloadStatus: DownloadStatus;
};

export type ExtensionConditionInput = {
  apkName?: InputMaybe<Scalars['String']['input']>;
  hasUpdate?: InputMaybe<Scalars['Boolean']['input']>;
  iconUrl?: InputMaybe<Scalars['String']['input']>;
  isInstalled?: InputMaybe<Scalars['Boolean']['input']>;
  isNsfw?: InputMaybe<Scalars['Boolean']['input']>;
  isObsolete?: InputMaybe<Scalars['Boolean']['input']>;
  lang?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  pkgName?: InputMaybe<Scalars['String']['input']>;
  repo?: InputMaybe<Scalars['String']['input']>;
  versionCode?: InputMaybe<Scalars['Int']['input']>;
  versionName?: InputMaybe<Scalars['String']['input']>;
};

export type ExtensionEdge = Edge & {
  __typename?: 'ExtensionEdge';
  cursor: Scalars['Cursor']['output'];
  node: ExtensionType;
};

export type ExtensionFilterInput = {
  and?: InputMaybe<Array<ExtensionFilterInput>>;
  apkName?: InputMaybe<StringFilterInput>;
  hasUpdate?: InputMaybe<BooleanFilterInput>;
  iconUrl?: InputMaybe<StringFilterInput>;
  isInstalled?: InputMaybe<BooleanFilterInput>;
  isNsfw?: InputMaybe<BooleanFilterInput>;
  isObsolete?: InputMaybe<BooleanFilterInput>;
  lang?: InputMaybe<StringFilterInput>;
  name?: InputMaybe<StringFilterInput>;
  not?: InputMaybe<ExtensionFilterInput>;
  or?: InputMaybe<Array<ExtensionFilterInput>>;
  pkgName?: InputMaybe<StringFilterInput>;
  repo?: InputMaybe<StringFilterInput>;
  versionCode?: InputMaybe<IntFilterInput>;
  versionName?: InputMaybe<StringFilterInput>;
};

export type ExtensionNodeList = NodeList & {
  __typename?: 'ExtensionNodeList';
  edges: Array<ExtensionEdge>;
  nodes: Array<ExtensionType>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export enum ExtensionOrderBy {
  ApkName = 'APK_NAME',
  Name = 'NAME',
  PkgName = 'PKG_NAME'
}

export type ExtensionOrderInput = {
  by: ExtensionOrderBy;
  byType?: InputMaybe<SortOrder>;
};

export type ExtensionType = {
  __typename?: 'ExtensionType';
  apkName: Scalars['String']['output'];
  hasUpdate: Scalars['Boolean']['output'];
  iconUrl: Scalars['String']['output'];
  isInstalled: Scalars['Boolean']['output'];
  isNsfw: Scalars['Boolean']['output'];
  isObsolete: Scalars['Boolean']['output'];
  lang: Scalars['String']['output'];
  name: Scalars['String']['output'];
  pkgName: Scalars['String']['output'];
  repo?: Maybe<Scalars['String']['output']>;
  source: SourceNodeList;
  versionCode: Scalars['Int']['output'];
  versionName: Scalars['String']['output'];
};

export type FetchChapterPagesInput = {
  chapterId: Scalars['Int']['input'];
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
};

export type FetchChapterPagesPayload = {
  __typename?: 'FetchChapterPagesPayload';
  chapter: ChapterType;
  clientMutationId?: Maybe<Scalars['String']['output']>;
  pages: Array<Scalars['String']['output']>;
};

export type FetchChaptersInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  mangaId: Scalars['Int']['input'];
};

export type FetchChaptersPayload = {
  __typename?: 'FetchChaptersPayload';
  chapters: Array<ChapterType>;
  clientMutationId?: Maybe<Scalars['String']['output']>;
};

export type FetchExtensionsInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
};

export type FetchExtensionsPayload = {
  __typename?: 'FetchExtensionsPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  extensions: Array<ExtensionType>;
};

export type FetchMangaInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['Int']['input'];
};

export type FetchMangaPayload = {
  __typename?: 'FetchMangaPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  manga: MangaType;
};

export type FetchSourceMangaInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  filters?: InputMaybe<Array<FilterChangeInput>>;
  page: Scalars['Int']['input'];
  query?: InputMaybe<Scalars['String']['input']>;
  source: Scalars['LongString']['input'];
  type: FetchSourceMangaType;
};

export type FetchSourceMangaPayload = {
  __typename?: 'FetchSourceMangaPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  mangas: Array<MangaType>;
};

export enum FetchSourceMangaType {
  Latest = 'LATEST',
  Popular = 'POPULAR',
  Search = 'SEARCH'
}

export type FetchTrackInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  recordId: Scalars['Int']['input'];
};

export type FetchTrackPayload = {
  __typename?: 'FetchTrackPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  trackRecord: TrackRecordType;
};

export type Filter = CheckBoxFilter | GroupFilter | HeaderFilter | SelectFilter | SeparatorFilter | SortFilter | TextFilter | TriStateFilter;

export type FilterChangeInput = {
  checkBoxState?: InputMaybe<Scalars['Boolean']['input']>;
  groupChange?: InputMaybe<FilterChangeInput>;
  position: Scalars['Int']['input'];
  selectState?: InputMaybe<Scalars['Int']['input']>;
  sortState?: InputMaybe<SortSelectionInput>;
  textState?: InputMaybe<Scalars['String']['input']>;
  triState?: InputMaybe<TriState>;
};

export type FloatFilterInput = {
  distinctFrom?: InputMaybe<Scalars['Float']['input']>;
  distinctFromAll?: InputMaybe<Array<Scalars['Float']['input']>>;
  distinctFromAny?: InputMaybe<Array<Scalars['Float']['input']>>;
  equalTo?: InputMaybe<Scalars['Float']['input']>;
  greaterThan?: InputMaybe<Scalars['Float']['input']>;
  greaterThanOrEqualTo?: InputMaybe<Scalars['Float']['input']>;
  in?: InputMaybe<Array<Scalars['Float']['input']>>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  lessThan?: InputMaybe<Scalars['Float']['input']>;
  lessThanOrEqualTo?: InputMaybe<Scalars['Float']['input']>;
  notDistinctFrom?: InputMaybe<Scalars['Float']['input']>;
  notEqualTo?: InputMaybe<Scalars['Float']['input']>;
  notEqualToAll?: InputMaybe<Array<Scalars['Float']['input']>>;
  notEqualToAny?: InputMaybe<Array<Scalars['Float']['input']>>;
  notIn?: InputMaybe<Array<Scalars['Float']['input']>>;
};

export type GlobalMetaNodeList = NodeList & {
  __typename?: 'GlobalMetaNodeList';
  edges: Array<MetaEdge>;
  nodes: Array<GlobalMetaType>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type GlobalMetaType = MetaType & {
  __typename?: 'GlobalMetaType';
  key: Scalars['String']['output'];
  value: Scalars['String']['output'];
};

export type GlobalMetaTypeInput = {
  key: Scalars['String']['input'];
  value: Scalars['String']['input'];
};

export type GroupFilter = {
  __typename?: 'GroupFilter';
  filters: Array<Filter>;
  name: Scalars['String']['output'];
};

export type HeaderFilter = {
  __typename?: 'HeaderFilter';
  name: Scalars['String']['output'];
};

export enum IncludeOrExclude {
  Exclude = 'EXCLUDE',
  Include = 'INCLUDE',
  Unset = 'UNSET'
}

export type InstallExternalExtensionInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  extensionFile: Scalars['Upload']['input'];
};

export type InstallExternalExtensionPayload = {
  __typename?: 'InstallExternalExtensionPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  extension: ExtensionType;
};

export type IntFilterInput = {
  distinctFrom?: InputMaybe<Scalars['Int']['input']>;
  distinctFromAll?: InputMaybe<Array<Scalars['Int']['input']>>;
  distinctFromAny?: InputMaybe<Array<Scalars['Int']['input']>>;
  equalTo?: InputMaybe<Scalars['Int']['input']>;
  greaterThan?: InputMaybe<Scalars['Int']['input']>;
  greaterThanOrEqualTo?: InputMaybe<Scalars['Int']['input']>;
  in?: InputMaybe<Array<Scalars['Int']['input']>>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  lessThan?: InputMaybe<Scalars['Int']['input']>;
  lessThanOrEqualTo?: InputMaybe<Scalars['Int']['input']>;
  notDistinctFrom?: InputMaybe<Scalars['Int']['input']>;
  notEqualTo?: InputMaybe<Scalars['Int']['input']>;
  notEqualToAll?: InputMaybe<Array<Scalars['Int']['input']>>;
  notEqualToAny?: InputMaybe<Array<Scalars['Int']['input']>>;
  notIn?: InputMaybe<Array<Scalars['Int']['input']>>;
};

export type LastUpdateTimestampPayload = {
  __typename?: 'LastUpdateTimestampPayload';
  timestamp: Scalars['LongString']['output'];
};

export type ListPreference = {
  __typename?: 'ListPreference';
  currentValue?: Maybe<Scalars['String']['output']>;
  default?: Maybe<Scalars['String']['output']>;
  entries: Array<Scalars['String']['output']>;
  entryValues: Array<Scalars['String']['output']>;
  key: Scalars['String']['output'];
  summary?: Maybe<Scalars['String']['output']>;
  title?: Maybe<Scalars['String']['output']>;
  visible: Scalars['Boolean']['output'];
};

export type LoginTrackerCredentialsInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  password: Scalars['String']['input'];
  trackerId: Scalars['Int']['input'];
  username: Scalars['String']['input'];
};

export type LoginTrackerCredentialsPayload = {
  __typename?: 'LoginTrackerCredentialsPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  isLoggedIn: Scalars['Boolean']['output'];
  tracker: TrackerType;
};

export type LoginTrackerOAuthInput = {
  callbackUrl: Scalars['String']['input'];
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  trackerId: Scalars['Int']['input'];
};

export type LoginTrackerOAuthPayload = {
  __typename?: 'LoginTrackerOAuthPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  isLoggedIn: Scalars['Boolean']['output'];
  tracker: TrackerType;
};

export type LogoutTrackerInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  trackerId: Scalars['Int']['input'];
};

export type LogoutTrackerPayload = {
  __typename?: 'LogoutTrackerPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  isLoggedIn: Scalars['Boolean']['output'];
  tracker: TrackerType;
};

export type LongFilterInput = {
  distinctFrom?: InputMaybe<Scalars['LongString']['input']>;
  distinctFromAll?: InputMaybe<Array<Scalars['LongString']['input']>>;
  distinctFromAny?: InputMaybe<Array<Scalars['LongString']['input']>>;
  equalTo?: InputMaybe<Scalars['LongString']['input']>;
  greaterThan?: InputMaybe<Scalars['LongString']['input']>;
  greaterThanOrEqualTo?: InputMaybe<Scalars['LongString']['input']>;
  in?: InputMaybe<Array<Scalars['LongString']['input']>>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  lessThan?: InputMaybe<Scalars['LongString']['input']>;
  lessThanOrEqualTo?: InputMaybe<Scalars['LongString']['input']>;
  notDistinctFrom?: InputMaybe<Scalars['LongString']['input']>;
  notEqualTo?: InputMaybe<Scalars['LongString']['input']>;
  notEqualToAll?: InputMaybe<Array<Scalars['LongString']['input']>>;
  notEqualToAny?: InputMaybe<Array<Scalars['LongString']['input']>>;
  notIn?: InputMaybe<Array<Scalars['LongString']['input']>>;
};

export type MangaConditionInput = {
  artist?: InputMaybe<Scalars['String']['input']>;
  author?: InputMaybe<Scalars['String']['input']>;
  categoryIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  chaptersLastFetchedAt?: InputMaybe<Scalars['LongString']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  genre?: InputMaybe<Array<Scalars['String']['input']>>;
  id?: InputMaybe<Scalars['Int']['input']>;
  inLibrary?: InputMaybe<Scalars['Boolean']['input']>;
  inLibraryAt?: InputMaybe<Scalars['LongString']['input']>;
  initialized?: InputMaybe<Scalars['Boolean']['input']>;
  lastFetchedAt?: InputMaybe<Scalars['LongString']['input']>;
  realUrl?: InputMaybe<Scalars['String']['input']>;
  sourceId?: InputMaybe<Scalars['LongString']['input']>;
  status?: InputMaybe<MangaStatus>;
  thumbnailUrl?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  url?: InputMaybe<Scalars['String']['input']>;
};

export type MangaEdge = Edge & {
  __typename?: 'MangaEdge';
  cursor: Scalars['Cursor']['output'];
  node: MangaType;
};

export type MangaFilterInput = {
  and?: InputMaybe<Array<MangaFilterInput>>;
  artist?: InputMaybe<StringFilterInput>;
  author?: InputMaybe<StringFilterInput>;
  categoryId?: InputMaybe<IntFilterInput>;
  chaptersLastFetchedAt?: InputMaybe<LongFilterInput>;
  description?: InputMaybe<StringFilterInput>;
  genre?: InputMaybe<StringFilterInput>;
  id?: InputMaybe<IntFilterInput>;
  inLibrary?: InputMaybe<BooleanFilterInput>;
  inLibraryAt?: InputMaybe<LongFilterInput>;
  initialized?: InputMaybe<BooleanFilterInput>;
  lastFetchedAt?: InputMaybe<LongFilterInput>;
  not?: InputMaybe<MangaFilterInput>;
  or?: InputMaybe<Array<MangaFilterInput>>;
  realUrl?: InputMaybe<StringFilterInput>;
  sourceId?: InputMaybe<LongFilterInput>;
  status?: InputMaybe<MangaStatusFilterInput>;
  thumbnailUrl?: InputMaybe<StringFilterInput>;
  title?: InputMaybe<StringFilterInput>;
  url?: InputMaybe<StringFilterInput>;
};

export type MangaMetaType = MetaType & {
  __typename?: 'MangaMetaType';
  key: Scalars['String']['output'];
  manga: MangaType;
  mangaId: Scalars['Int']['output'];
  value: Scalars['String']['output'];
};

export type MangaMetaTypeInput = {
  key: Scalars['String']['input'];
  mangaId: Scalars['Int']['input'];
  value: Scalars['String']['input'];
};

export type MangaNodeList = NodeList & {
  __typename?: 'MangaNodeList';
  edges: Array<MangaEdge>;
  nodes: Array<MangaType>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export enum MangaOrderBy {
  Id = 'ID',
  InLibraryAt = 'IN_LIBRARY_AT',
  LastFetchedAt = 'LAST_FETCHED_AT',
  Title = 'TITLE'
}

export type MangaOrderInput = {
  by: MangaOrderBy;
  byType?: InputMaybe<SortOrder>;
};

export enum MangaStatus {
  Cancelled = 'CANCELLED',
  Completed = 'COMPLETED',
  Licensed = 'LICENSED',
  Ongoing = 'ONGOING',
  OnHiatus = 'ON_HIATUS',
  PublishingFinished = 'PUBLISHING_FINISHED',
  Unknown = 'UNKNOWN'
}

export type MangaStatusFilterInput = {
  distinctFrom?: InputMaybe<MangaStatus>;
  distinctFromAll?: InputMaybe<Array<MangaStatus>>;
  distinctFromAny?: InputMaybe<Array<MangaStatus>>;
  equalTo?: InputMaybe<MangaStatus>;
  greaterThan?: InputMaybe<MangaStatus>;
  greaterThanOrEqualTo?: InputMaybe<MangaStatus>;
  in?: InputMaybe<Array<MangaStatus>>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  lessThan?: InputMaybe<MangaStatus>;
  lessThanOrEqualTo?: InputMaybe<MangaStatus>;
  notDistinctFrom?: InputMaybe<MangaStatus>;
  notEqualTo?: InputMaybe<MangaStatus>;
  notEqualToAll?: InputMaybe<Array<MangaStatus>>;
  notEqualToAny?: InputMaybe<Array<MangaStatus>>;
  notIn?: InputMaybe<Array<MangaStatus>>;
};

export type MangaType = {
  __typename?: 'MangaType';
  age?: Maybe<Scalars['LongString']['output']>;
  artist?: Maybe<Scalars['String']['output']>;
  author?: Maybe<Scalars['String']['output']>;
  bookmarkCount: Scalars['Int']['output'];
  categories: CategoryNodeList;
  chapters: ChapterNodeList;
  chaptersAge?: Maybe<Scalars['LongString']['output']>;
  chaptersLastFetchedAt?: Maybe<Scalars['LongString']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  downloadCount: Scalars['Int']['output'];
  firstUnreadChapter?: Maybe<ChapterType>;
  genre: Array<Scalars['String']['output']>;
  hasDuplicateChapters: Scalars['Boolean']['output'];
  id: Scalars['Int']['output'];
  inLibrary: Scalars['Boolean']['output'];
  inLibraryAt: Scalars['LongString']['output'];
  initialized: Scalars['Boolean']['output'];
  lastFetchedAt?: Maybe<Scalars['LongString']['output']>;
  lastReadChapter?: Maybe<ChapterType>;
  latestFetchedChapter?: Maybe<ChapterType>;
  latestReadChapter?: Maybe<ChapterType>;
  latestUploadedChapter?: Maybe<ChapterType>;
  meta: Array<MangaMetaType>;
  realUrl?: Maybe<Scalars['String']['output']>;
  source?: Maybe<SourceType>;
  sourceId: Scalars['LongString']['output'];
  status: MangaStatus;
  thumbnailUrl?: Maybe<Scalars['String']['output']>;
  thumbnailUrlLastFetched?: Maybe<Scalars['LongString']['output']>;
  title: Scalars['String']['output'];
  trackRecords: TrackRecordNodeList;
  unreadCount: Scalars['Int']['output'];
  updateStrategy: UpdateStrategy;
  url: Scalars['String']['output'];
};

export type MetaConditionInput = {
  key?: InputMaybe<Scalars['String']['input']>;
  value?: InputMaybe<Scalars['String']['input']>;
};

export type MetaEdge = Edge & {
  __typename?: 'MetaEdge';
  cursor: Scalars['Cursor']['output'];
  node: GlobalMetaType;
};

export type MetaFilterInput = {
  and?: InputMaybe<Array<MetaFilterInput>>;
  key?: InputMaybe<StringFilterInput>;
  not?: InputMaybe<MetaFilterInput>;
  or?: InputMaybe<Array<MetaFilterInput>>;
  value?: InputMaybe<StringFilterInput>;
};

export enum MetaOrderBy {
  Key = 'KEY',
  Value = 'VALUE'
}

export type MetaOrderInput = {
  by: MetaOrderBy;
  byType?: InputMaybe<SortOrder>;
};

export type MetaType = {
  key: Scalars['String']['output'];
  value: Scalars['String']['output'];
};

export type MultiSelectListPreference = {
  __typename?: 'MultiSelectListPreference';
  currentValue?: Maybe<Array<Scalars['String']['output']>>;
  default?: Maybe<Array<Scalars['String']['output']>>;
  dialogMessage?: Maybe<Scalars['String']['output']>;
  dialogTitle?: Maybe<Scalars['String']['output']>;
  entries: Array<Scalars['String']['output']>;
  entryValues: Array<Scalars['String']['output']>;
  key: Scalars['String']['output'];
  summary?: Maybe<Scalars['String']['output']>;
  title?: Maybe<Scalars['String']['output']>;
  visible: Scalars['Boolean']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  bindTrack: BindTrackPayload;
  clearCachedImages: ClearCachedImagesPayload;
  clearDownloader?: Maybe<ClearDownloaderPayload>;
  createBackup: CreateBackupPayload;
  createCategory?: Maybe<CreateCategoryPayload>;
  deleteCategory?: Maybe<DeleteCategoryPayload>;
  deleteCategoryMeta?: Maybe<DeleteCategoryMetaPayload>;
  deleteChapterMeta?: Maybe<DeleteChapterMetaPayload>;
  deleteDownloadedChapter?: Maybe<DeleteDownloadedChapterPayload>;
  deleteDownloadedChapters?: Maybe<DeleteDownloadedChaptersPayload>;
  deleteGlobalMeta?: Maybe<DeleteGlobalMetaPayload>;
  deleteMangaMeta?: Maybe<DeleteMangaMetaPayload>;
  deleteSourceMeta?: Maybe<DeleteSourceMetaPayload>;
  dequeueChapterDownload?: Maybe<DequeueChapterDownloadPayload>;
  dequeueChapterDownloads?: Maybe<DequeueChapterDownloadsPayload>;
  enqueueChapterDownload?: Maybe<EnqueueChapterDownloadPayload>;
  enqueueChapterDownloads?: Maybe<EnqueueChapterDownloadsPayload>;
  fetchChapterPages?: Maybe<FetchChapterPagesPayload>;
  fetchChapters?: Maybe<FetchChaptersPayload>;
  fetchExtensions?: Maybe<FetchExtensionsPayload>;
  fetchManga?: Maybe<FetchMangaPayload>;
  fetchSourceManga?: Maybe<FetchSourceMangaPayload>;
  fetchTrack: FetchTrackPayload;
  installExternalExtension?: Maybe<InstallExternalExtensionPayload>;
  loginTrackerCredentials: LoginTrackerCredentialsPayload;
  loginTrackerOAuth: LoginTrackerOAuthPayload;
  logoutTracker: LogoutTrackerPayload;
  reorderChapterDownload?: Maybe<ReorderChapterDownloadPayload>;
  resetSettings: ResetSettingsPayload;
  resetWebUIUpdateStatus?: Maybe<WebUiUpdateStatus>;
  restoreBackup: RestoreBackupPayload;
  setCategoryMeta?: Maybe<SetCategoryMetaPayload>;
  setChapterMeta?: Maybe<SetChapterMetaPayload>;
  setGlobalMeta?: Maybe<SetGlobalMetaPayload>;
  setMangaMeta?: Maybe<SetMangaMetaPayload>;
  setSettings: SetSettingsPayload;
  setSourceMeta?: Maybe<SetSourceMetaPayload>;
  startDownloader?: Maybe<StartDownloaderPayload>;
  stopDownloader?: Maybe<StopDownloaderPayload>;
  trackProgress?: Maybe<TrackProgressPayload>;
  unbindTrack: UnbindTrackPayload;
  updateCategories?: Maybe<UpdateCategoriesPayload>;
  updateCategory?: Maybe<UpdateCategoryPayload>;
  updateCategoryManga?: Maybe<UpdateCategoryMangaPayload>;
  updateCategoryOrder?: Maybe<UpdateCategoryOrderPayload>;
  updateChapter?: Maybe<UpdateChapterPayload>;
  updateChapters?: Maybe<UpdateChaptersPayload>;
  updateExtension?: Maybe<UpdateExtensionPayload>;
  updateExtensions?: Maybe<UpdateExtensionsPayload>;
  updateLibraryManga?: Maybe<UpdateLibraryMangaPayload>;
  updateManga?: Maybe<UpdateMangaPayload>;
  updateMangaCategories?: Maybe<UpdateMangaCategoriesPayload>;
  updateMangas?: Maybe<UpdateMangasPayload>;
  updateMangasCategories?: Maybe<UpdateMangasCategoriesPayload>;
  updateSourcePreference?: Maybe<UpdateSourcePreferencePayload>;
  updateStop: UpdateStopPayload;
  updateTrack: UpdateTrackPayload;
  updateWebUI?: Maybe<WebUiUpdatePayload>;
};


export type MutationBindTrackArgs = {
  input: BindTrackInput;
};


export type MutationClearCachedImagesArgs = {
  input: ClearCachedImagesInput;
};


export type MutationClearDownloaderArgs = {
  input: ClearDownloaderInput;
};


export type MutationCreateBackupArgs = {
  input?: InputMaybe<CreateBackupInput>;
};


export type MutationCreateCategoryArgs = {
  input: CreateCategoryInput;
};


export type MutationDeleteCategoryArgs = {
  input: DeleteCategoryInput;
};


export type MutationDeleteCategoryMetaArgs = {
  input: DeleteCategoryMetaInput;
};


export type MutationDeleteChapterMetaArgs = {
  input: DeleteChapterMetaInput;
};


export type MutationDeleteDownloadedChapterArgs = {
  input: DeleteDownloadedChapterInput;
};


export type MutationDeleteDownloadedChaptersArgs = {
  input: DeleteDownloadedChaptersInput;
};


export type MutationDeleteGlobalMetaArgs = {
  input: DeleteGlobalMetaInput;
};


export type MutationDeleteMangaMetaArgs = {
  input: DeleteMangaMetaInput;
};


export type MutationDeleteSourceMetaArgs = {
  input: DeleteSourceMetaInput;
};


export type MutationDequeueChapterDownloadArgs = {
  input: DequeueChapterDownloadInput;
};


export type MutationDequeueChapterDownloadsArgs = {
  input: DequeueChapterDownloadsInput;
};


export type MutationEnqueueChapterDownloadArgs = {
  input: EnqueueChapterDownloadInput;
};


export type MutationEnqueueChapterDownloadsArgs = {
  input: EnqueueChapterDownloadsInput;
};


export type MutationFetchChapterPagesArgs = {
  input: FetchChapterPagesInput;
};


export type MutationFetchChaptersArgs = {
  input: FetchChaptersInput;
};


export type MutationFetchExtensionsArgs = {
  input: FetchExtensionsInput;
};


export type MutationFetchMangaArgs = {
  input: FetchMangaInput;
};


export type MutationFetchSourceMangaArgs = {
  input: FetchSourceMangaInput;
};


export type MutationFetchTrackArgs = {
  input: FetchTrackInput;
};


export type MutationInstallExternalExtensionArgs = {
  input: InstallExternalExtensionInput;
};


export type MutationLoginTrackerCredentialsArgs = {
  input: LoginTrackerCredentialsInput;
};


export type MutationLoginTrackerOAuthArgs = {
  input: LoginTrackerOAuthInput;
};


export type MutationLogoutTrackerArgs = {
  input: LogoutTrackerInput;
};


export type MutationReorderChapterDownloadArgs = {
  input: ReorderChapterDownloadInput;
};


export type MutationResetSettingsArgs = {
  input: ResetSettingsInput;
};


export type MutationRestoreBackupArgs = {
  input: RestoreBackupInput;
};


export type MutationSetCategoryMetaArgs = {
  input: SetCategoryMetaInput;
};


export type MutationSetChapterMetaArgs = {
  input: SetChapterMetaInput;
};


export type MutationSetGlobalMetaArgs = {
  input: SetGlobalMetaInput;
};


export type MutationSetMangaMetaArgs = {
  input: SetMangaMetaInput;
};


export type MutationSetSettingsArgs = {
  input: SetSettingsInput;
};


export type MutationSetSourceMetaArgs = {
  input: SetSourceMetaInput;
};


export type MutationStartDownloaderArgs = {
  input: StartDownloaderInput;
};


export type MutationStopDownloaderArgs = {
  input: StopDownloaderInput;
};


export type MutationTrackProgressArgs = {
  input: TrackProgressInput;
};


export type MutationUnbindTrackArgs = {
  input: UnbindTrackInput;
};


export type MutationUpdateCategoriesArgs = {
  input: UpdateCategoriesInput;
};


export type MutationUpdateCategoryArgs = {
  input: UpdateCategoryInput;
};


export type MutationUpdateCategoryMangaArgs = {
  input: UpdateCategoryMangaInput;
};


export type MutationUpdateCategoryOrderArgs = {
  input: UpdateCategoryOrderInput;
};


export type MutationUpdateChapterArgs = {
  input: UpdateChapterInput;
};


export type MutationUpdateChaptersArgs = {
  input: UpdateChaptersInput;
};


export type MutationUpdateExtensionArgs = {
  input: UpdateExtensionInput;
};


export type MutationUpdateExtensionsArgs = {
  input: UpdateExtensionsInput;
};


export type MutationUpdateLibraryMangaArgs = {
  input: UpdateLibraryMangaInput;
};


export type MutationUpdateMangaArgs = {
  input: UpdateMangaInput;
};


export type MutationUpdateMangaCategoriesArgs = {
  input: UpdateMangaCategoriesInput;
};


export type MutationUpdateMangasArgs = {
  input: UpdateMangasInput;
};


export type MutationUpdateMangasCategoriesArgs = {
  input: UpdateMangasCategoriesInput;
};


export type MutationUpdateSourcePreferenceArgs = {
  input: UpdateSourcePreferenceInput;
};


export type MutationUpdateStopArgs = {
  input: UpdateStopInput;
};


export type MutationUpdateTrackArgs = {
  input: UpdateTrackInput;
};


export type MutationUpdateWebUiArgs = {
  input: WebUiUpdateInput;
};

export type Node = CategoryMetaType | CategoryType | ChapterMetaType | ChapterType | DownloadType | DownloadUpdate | ExtensionType | GlobalMetaType | MangaMetaType | MangaType | PartialSettingsType | SettingsType | SourceMetaType | SourceType | TrackRecordType | TrackerType;

export type NodeList = {
  /** A list of edges which contains the [T] and cursor to aid in pagination. */
  edges: Array<Edge>;
  /** A list of [T] objects. */
  nodes: Array<Node>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of all nodes you could get from the connection. */
  totalCount: Scalars['Int']['output'];
};

export type PageInfo = {
  __typename?: 'PageInfo';
  /** When paginating forwards, the cursor to continue. */
  endCursor?: Maybe<Scalars['Cursor']['output']>;
  /** When paginating forwards, are there more items? */
  hasNextPage: Scalars['Boolean']['output'];
  /** When paginating backwards, are there more items? */
  hasPreviousPage: Scalars['Boolean']['output'];
  /** When paginating backwards, the cursor to continue. */
  startCursor?: Maybe<Scalars['Cursor']['output']>;
};

export type PartialSettingsType = Settings & {
  __typename?: 'PartialSettingsType';
  /** @deprecated Replaced with autoDownloadNewChaptersLimit, replace with autoDownloadNewChaptersLimit */
  autoDownloadAheadLimit?: Maybe<Scalars['Int']['output']>;
  autoDownloadIgnoreReUploads?: Maybe<Scalars['Boolean']['output']>;
  autoDownloadNewChapters?: Maybe<Scalars['Boolean']['output']>;
  autoDownloadNewChaptersLimit?: Maybe<Scalars['Int']['output']>;
  backupInterval?: Maybe<Scalars['Int']['output']>;
  backupPath?: Maybe<Scalars['String']['output']>;
  backupTTL?: Maybe<Scalars['Int']['output']>;
  backupTime?: Maybe<Scalars['String']['output']>;
  basicAuthEnabled?: Maybe<Scalars['Boolean']['output']>;
  basicAuthPassword?: Maybe<Scalars['String']['output']>;
  basicAuthUsername?: Maybe<Scalars['String']['output']>;
  debugLogsEnabled?: Maybe<Scalars['Boolean']['output']>;
  downloadAsCbz?: Maybe<Scalars['Boolean']['output']>;
  downloadsPath?: Maybe<Scalars['String']['output']>;
  electronPath?: Maybe<Scalars['String']['output']>;
  excludeCompleted?: Maybe<Scalars['Boolean']['output']>;
  excludeEntryWithUnreadChapters?: Maybe<Scalars['Boolean']['output']>;
  excludeNotStarted?: Maybe<Scalars['Boolean']['output']>;
  excludeUnreadChapters?: Maybe<Scalars['Boolean']['output']>;
  extensionRepos?: Maybe<Array<Scalars['String']['output']>>;
  flareSolverrAsResponseFallback?: Maybe<Scalars['Boolean']['output']>;
  flareSolverrEnabled?: Maybe<Scalars['Boolean']['output']>;
  flareSolverrSessionName?: Maybe<Scalars['String']['output']>;
  flareSolverrSessionTtl?: Maybe<Scalars['Int']['output']>;
  flareSolverrTimeout?: Maybe<Scalars['Int']['output']>;
  flareSolverrUrl?: Maybe<Scalars['String']['output']>;
  globalUpdateInterval?: Maybe<Scalars['Float']['output']>;
  /** @deprecated Removed - does not do anything */
  gqlDebugLogsEnabled?: Maybe<Scalars['Boolean']['output']>;
  initialOpenInBrowserEnabled?: Maybe<Scalars['Boolean']['output']>;
  ip?: Maybe<Scalars['String']['output']>;
  localSourcePath?: Maybe<Scalars['String']['output']>;
  maxLogFileSize?: Maybe<Scalars['String']['output']>;
  maxLogFiles?: Maybe<Scalars['Int']['output']>;
  maxLogFolderSize?: Maybe<Scalars['String']['output']>;
  maxSourcesInParallel?: Maybe<Scalars['Int']['output']>;
  port?: Maybe<Scalars['Int']['output']>;
  socksProxyEnabled?: Maybe<Scalars['Boolean']['output']>;
  socksProxyHost?: Maybe<Scalars['String']['output']>;
  socksProxyPassword?: Maybe<Scalars['String']['output']>;
  socksProxyPort?: Maybe<Scalars['String']['output']>;
  socksProxyUsername?: Maybe<Scalars['String']['output']>;
  socksProxyVersion?: Maybe<Scalars['Int']['output']>;
  systemTrayEnabled?: Maybe<Scalars['Boolean']['output']>;
  updateMangas?: Maybe<Scalars['Boolean']['output']>;
  webUIChannel?: Maybe<WebUiChannel>;
  webUIFlavor?: Maybe<WebUiFlavor>;
  webUIInterface?: Maybe<WebUiInterface>;
  webUIUpdateCheckInterval?: Maybe<Scalars['Float']['output']>;
};

export type PartialSettingsTypeInput = {
  autoDownloadIgnoreReUploads?: InputMaybe<Scalars['Boolean']['input']>;
  autoDownloadNewChapters?: InputMaybe<Scalars['Boolean']['input']>;
  autoDownloadNewChaptersLimit?: InputMaybe<Scalars['Int']['input']>;
  backupInterval?: InputMaybe<Scalars['Int']['input']>;
  backupPath?: InputMaybe<Scalars['String']['input']>;
  backupTTL?: InputMaybe<Scalars['Int']['input']>;
  backupTime?: InputMaybe<Scalars['String']['input']>;
  basicAuthEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  basicAuthPassword?: InputMaybe<Scalars['String']['input']>;
  basicAuthUsername?: InputMaybe<Scalars['String']['input']>;
  debugLogsEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  downloadAsCbz?: InputMaybe<Scalars['Boolean']['input']>;
  downloadsPath?: InputMaybe<Scalars['String']['input']>;
  electronPath?: InputMaybe<Scalars['String']['input']>;
  excludeCompleted?: InputMaybe<Scalars['Boolean']['input']>;
  excludeEntryWithUnreadChapters?: InputMaybe<Scalars['Boolean']['input']>;
  excludeNotStarted?: InputMaybe<Scalars['Boolean']['input']>;
  excludeUnreadChapters?: InputMaybe<Scalars['Boolean']['input']>;
  extensionRepos?: InputMaybe<Array<Scalars['String']['input']>>;
  flareSolverrAsResponseFallback?: InputMaybe<Scalars['Boolean']['input']>;
  flareSolverrEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  flareSolverrSessionName?: InputMaybe<Scalars['String']['input']>;
  flareSolverrSessionTtl?: InputMaybe<Scalars['Int']['input']>;
  flareSolverrTimeout?: InputMaybe<Scalars['Int']['input']>;
  flareSolverrUrl?: InputMaybe<Scalars['String']['input']>;
  globalUpdateInterval?: InputMaybe<Scalars['Float']['input']>;
  initialOpenInBrowserEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  ip?: InputMaybe<Scalars['String']['input']>;
  localSourcePath?: InputMaybe<Scalars['String']['input']>;
  maxLogFileSize?: InputMaybe<Scalars['String']['input']>;
  maxLogFiles?: InputMaybe<Scalars['Int']['input']>;
  maxLogFolderSize?: InputMaybe<Scalars['String']['input']>;
  maxSourcesInParallel?: InputMaybe<Scalars['Int']['input']>;
  port?: InputMaybe<Scalars['Int']['input']>;
  socksProxyEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  socksProxyHost?: InputMaybe<Scalars['String']['input']>;
  socksProxyPassword?: InputMaybe<Scalars['String']['input']>;
  socksProxyPort?: InputMaybe<Scalars['String']['input']>;
  socksProxyUsername?: InputMaybe<Scalars['String']['input']>;
  socksProxyVersion?: InputMaybe<Scalars['Int']['input']>;
  systemTrayEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  updateMangas?: InputMaybe<Scalars['Boolean']['input']>;
  webUIChannel?: InputMaybe<WebUiChannel>;
  webUIFlavor?: InputMaybe<WebUiFlavor>;
  webUIInterface?: InputMaybe<WebUiInterface>;
  webUIUpdateCheckInterval?: InputMaybe<Scalars['Float']['input']>;
};

export type Preference = CheckBoxPreference | EditTextPreference | ListPreference | MultiSelectListPreference | SwitchPreference;

export type Query = {
  __typename?: 'Query';
  aboutServer: AboutServerPayload;
  aboutWebUI: AboutWebUi;
  categories: CategoryNodeList;
  category: CategoryType;
  chapter: ChapterType;
  chapters: ChapterNodeList;
  checkForServerUpdates: Array<CheckForServerUpdatesPayload>;
  checkForWebUIUpdate: WebUiUpdateCheck;
  downloadStatus: DownloadStatus;
  extension: ExtensionType;
  extensions: ExtensionNodeList;
  getWebUIUpdateStatus: WebUiUpdateStatus;
  lastUpdateTimestamp: LastUpdateTimestampPayload;
  manga: MangaType;
  mangas: MangaNodeList;
  meta: GlobalMetaType;
  metas: GlobalMetaNodeList;
  restoreStatus?: Maybe<BackupRestoreStatus>;
  searchTracker: SearchTrackerPayload;
  settings: SettingsType;
  source: SourceType;
  sources: SourceNodeList;
  trackRecord: TrackRecordType;
  trackRecords: TrackRecordNodeList;
  tracker: TrackerType;
  trackers: TrackerNodeList;
  updateStatus: UpdateStatus;
  validateBackup: ValidateBackupResult;
};


export type QueryCategoriesArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  condition?: InputMaybe<CategoryConditionInput>;
  filter?: InputMaybe<CategoryFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<Array<CategoryOrderInput>>;
  orderBy?: InputMaybe<CategoryOrderBy>;
  orderByType?: InputMaybe<SortOrder>;
};


export type QueryCategoryArgs = {
  id: Scalars['Int']['input'];
};


export type QueryChapterArgs = {
  id: Scalars['Int']['input'];
};


export type QueryChaptersArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  condition?: InputMaybe<ChapterConditionInput>;
  filter?: InputMaybe<ChapterFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<Array<ChapterOrderInput>>;
  orderBy?: InputMaybe<ChapterOrderBy>;
  orderByType?: InputMaybe<SortOrder>;
};


export type QueryExtensionArgs = {
  pkgName: Scalars['String']['input'];
};


export type QueryExtensionsArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  condition?: InputMaybe<ExtensionConditionInput>;
  filter?: InputMaybe<ExtensionFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<Array<ExtensionOrderInput>>;
  orderBy?: InputMaybe<ExtensionOrderBy>;
  orderByType?: InputMaybe<SortOrder>;
};


export type QueryMangaArgs = {
  id: Scalars['Int']['input'];
};


export type QueryMangasArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  condition?: InputMaybe<MangaConditionInput>;
  filter?: InputMaybe<MangaFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<Array<MangaOrderInput>>;
  orderBy?: InputMaybe<MangaOrderBy>;
  orderByType?: InputMaybe<SortOrder>;
};


export type QueryMetaArgs = {
  key: Scalars['String']['input'];
};


export type QueryMetasArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  condition?: InputMaybe<MetaConditionInput>;
  filter?: InputMaybe<MetaFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<Array<MetaOrderInput>>;
  orderBy?: InputMaybe<MetaOrderBy>;
  orderByType?: InputMaybe<SortOrder>;
};


export type QueryRestoreStatusArgs = {
  id: Scalars['String']['input'];
};


export type QuerySearchTrackerArgs = {
  input: SearchTrackerInput;
};


export type QuerySourceArgs = {
  id: Scalars['LongString']['input'];
};


export type QuerySourcesArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  condition?: InputMaybe<SourceConditionInput>;
  filter?: InputMaybe<SourceFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<Array<SourceOrderInput>>;
  orderBy?: InputMaybe<SourceOrderBy>;
  orderByType?: InputMaybe<SortOrder>;
};


export type QueryTrackRecordArgs = {
  id: Scalars['Int']['input'];
};


export type QueryTrackRecordsArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  condition?: InputMaybe<TrackRecordConditionInput>;
  filter?: InputMaybe<TrackRecordFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<Array<TrackRecordOrderInput>>;
  orderBy?: InputMaybe<TrackRecordOrderBy>;
  orderByType?: InputMaybe<SortOrder>;
};


export type QueryTrackerArgs = {
  id: Scalars['Int']['input'];
};


export type QueryTrackersArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  condition?: InputMaybe<TrackerConditionInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<Array<TrackerOrderInput>>;
  orderBy?: InputMaybe<TrackerOrderBy>;
  orderByType?: InputMaybe<SortOrder>;
};


export type QueryValidateBackupArgs = {
  input: ValidateBackupInput;
};

export type ReorderChapterDownloadInput = {
  chapterId: Scalars['Int']['input'];
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  to: Scalars['Int']['input'];
};

export type ReorderChapterDownloadPayload = {
  __typename?: 'ReorderChapterDownloadPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  downloadStatus: DownloadStatus;
};

export type ResetSettingsInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
};

export type ResetSettingsPayload = {
  __typename?: 'ResetSettingsPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  settings: SettingsType;
};

export type RestoreBackupInput = {
  backup: Scalars['Upload']['input'];
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
};

export type RestoreBackupPayload = {
  __typename?: 'RestoreBackupPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  status?: Maybe<BackupRestoreStatus>;
};

export type SearchTrackerInput = {
  query: Scalars['String']['input'];
  trackerId: Scalars['Int']['input'];
};

export type SearchTrackerPayload = {
  __typename?: 'SearchTrackerPayload';
  trackSearches: Array<TrackSearchType>;
};

export type SelectFilter = {
  __typename?: 'SelectFilter';
  default: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  values: Array<Scalars['String']['output']>;
};

export type SeparatorFilter = {
  __typename?: 'SeparatorFilter';
  name: Scalars['String']['output'];
};

export type SetCategoryMetaInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  meta: CategoryMetaTypeInput;
};

export type SetCategoryMetaPayload = {
  __typename?: 'SetCategoryMetaPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  meta: CategoryMetaType;
};

export type SetChapterMetaInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  meta: ChapterMetaTypeInput;
};

export type SetChapterMetaPayload = {
  __typename?: 'SetChapterMetaPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  meta: ChapterMetaType;
};

export type SetGlobalMetaInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  meta: GlobalMetaTypeInput;
};

export type SetGlobalMetaPayload = {
  __typename?: 'SetGlobalMetaPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  meta: GlobalMetaType;
};

export type SetMangaMetaInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  meta: MangaMetaTypeInput;
};

export type SetMangaMetaPayload = {
  __typename?: 'SetMangaMetaPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  meta: MangaMetaType;
};

export type SetSettingsInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  settings: PartialSettingsTypeInput;
};

export type SetSettingsPayload = {
  __typename?: 'SetSettingsPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  settings: SettingsType;
};

export type SetSourceMetaInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  meta: SourceMetaTypeInput;
};

export type SetSourceMetaPayload = {
  __typename?: 'SetSourceMetaPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  meta: SourceMetaType;
};

export type Settings = {
  /** @deprecated Replaced with autoDownloadNewChaptersLimit, replace with autoDownloadNewChaptersLimit */
  autoDownloadAheadLimit?: Maybe<Scalars['Int']['output']>;
  autoDownloadIgnoreReUploads?: Maybe<Scalars['Boolean']['output']>;
  autoDownloadNewChapters?: Maybe<Scalars['Boolean']['output']>;
  autoDownloadNewChaptersLimit?: Maybe<Scalars['Int']['output']>;
  backupInterval?: Maybe<Scalars['Int']['output']>;
  backupPath?: Maybe<Scalars['String']['output']>;
  backupTTL?: Maybe<Scalars['Int']['output']>;
  backupTime?: Maybe<Scalars['String']['output']>;
  basicAuthEnabled?: Maybe<Scalars['Boolean']['output']>;
  basicAuthPassword?: Maybe<Scalars['String']['output']>;
  basicAuthUsername?: Maybe<Scalars['String']['output']>;
  debugLogsEnabled?: Maybe<Scalars['Boolean']['output']>;
  downloadAsCbz?: Maybe<Scalars['Boolean']['output']>;
  downloadsPath?: Maybe<Scalars['String']['output']>;
  electronPath?: Maybe<Scalars['String']['output']>;
  excludeCompleted?: Maybe<Scalars['Boolean']['output']>;
  excludeEntryWithUnreadChapters?: Maybe<Scalars['Boolean']['output']>;
  excludeNotStarted?: Maybe<Scalars['Boolean']['output']>;
  excludeUnreadChapters?: Maybe<Scalars['Boolean']['output']>;
  extensionRepos?: Maybe<Array<Scalars['String']['output']>>;
  flareSolverrAsResponseFallback?: Maybe<Scalars['Boolean']['output']>;
  flareSolverrEnabled?: Maybe<Scalars['Boolean']['output']>;
  flareSolverrSessionName?: Maybe<Scalars['String']['output']>;
  flareSolverrSessionTtl?: Maybe<Scalars['Int']['output']>;
  flareSolverrTimeout?: Maybe<Scalars['Int']['output']>;
  flareSolverrUrl?: Maybe<Scalars['String']['output']>;
  globalUpdateInterval?: Maybe<Scalars['Float']['output']>;
  /** @deprecated Removed - does not do anything */
  gqlDebugLogsEnabled?: Maybe<Scalars['Boolean']['output']>;
  initialOpenInBrowserEnabled?: Maybe<Scalars['Boolean']['output']>;
  ip?: Maybe<Scalars['String']['output']>;
  localSourcePath?: Maybe<Scalars['String']['output']>;
  maxLogFileSize?: Maybe<Scalars['String']['output']>;
  maxLogFiles?: Maybe<Scalars['Int']['output']>;
  maxLogFolderSize?: Maybe<Scalars['String']['output']>;
  maxSourcesInParallel?: Maybe<Scalars['Int']['output']>;
  port?: Maybe<Scalars['Int']['output']>;
  socksProxyEnabled?: Maybe<Scalars['Boolean']['output']>;
  socksProxyHost?: Maybe<Scalars['String']['output']>;
  socksProxyPassword?: Maybe<Scalars['String']['output']>;
  socksProxyPort?: Maybe<Scalars['String']['output']>;
  socksProxyUsername?: Maybe<Scalars['String']['output']>;
  socksProxyVersion?: Maybe<Scalars['Int']['output']>;
  systemTrayEnabled?: Maybe<Scalars['Boolean']['output']>;
  updateMangas?: Maybe<Scalars['Boolean']['output']>;
  webUIChannel?: Maybe<WebUiChannel>;
  webUIFlavor?: Maybe<WebUiFlavor>;
  webUIInterface?: Maybe<WebUiInterface>;
  webUIUpdateCheckInterval?: Maybe<Scalars['Float']['output']>;
};

export type SettingsType = Settings & {
  __typename?: 'SettingsType';
  /** @deprecated Replaced with autoDownloadNewChaptersLimit, replace with autoDownloadNewChaptersLimit */
  autoDownloadAheadLimit: Scalars['Int']['output'];
  autoDownloadIgnoreReUploads?: Maybe<Scalars['Boolean']['output']>;
  autoDownloadNewChapters: Scalars['Boolean']['output'];
  autoDownloadNewChaptersLimit: Scalars['Int']['output'];
  backupInterval: Scalars['Int']['output'];
  backupPath: Scalars['String']['output'];
  backupTTL: Scalars['Int']['output'];
  backupTime: Scalars['String']['output'];
  basicAuthEnabled: Scalars['Boolean']['output'];
  basicAuthPassword: Scalars['String']['output'];
  basicAuthUsername: Scalars['String']['output'];
  debugLogsEnabled: Scalars['Boolean']['output'];
  downloadAsCbz: Scalars['Boolean']['output'];
  downloadsPath: Scalars['String']['output'];
  electronPath: Scalars['String']['output'];
  excludeCompleted: Scalars['Boolean']['output'];
  excludeEntryWithUnreadChapters: Scalars['Boolean']['output'];
  excludeNotStarted: Scalars['Boolean']['output'];
  excludeUnreadChapters: Scalars['Boolean']['output'];
  extensionRepos: Array<Scalars['String']['output']>;
  flareSolverrAsResponseFallback: Scalars['Boolean']['output'];
  flareSolverrEnabled: Scalars['Boolean']['output'];
  flareSolverrSessionName: Scalars['String']['output'];
  flareSolverrSessionTtl: Scalars['Int']['output'];
  flareSolverrTimeout: Scalars['Int']['output'];
  flareSolverrUrl: Scalars['String']['output'];
  globalUpdateInterval: Scalars['Float']['output'];
  /** @deprecated Removed - does not do anything */
  gqlDebugLogsEnabled: Scalars['Boolean']['output'];
  initialOpenInBrowserEnabled: Scalars['Boolean']['output'];
  ip: Scalars['String']['output'];
  localSourcePath: Scalars['String']['output'];
  maxLogFileSize: Scalars['String']['output'];
  maxLogFiles: Scalars['Int']['output'];
  maxLogFolderSize: Scalars['String']['output'];
  maxSourcesInParallel: Scalars['Int']['output'];
  port: Scalars['Int']['output'];
  socksProxyEnabled: Scalars['Boolean']['output'];
  socksProxyHost: Scalars['String']['output'];
  socksProxyPassword: Scalars['String']['output'];
  socksProxyPort: Scalars['String']['output'];
  socksProxyUsername: Scalars['String']['output'];
  socksProxyVersion: Scalars['Int']['output'];
  systemTrayEnabled: Scalars['Boolean']['output'];
  updateMangas: Scalars['Boolean']['output'];
  webUIChannel: WebUiChannel;
  webUIFlavor: WebUiFlavor;
  webUIInterface: WebUiInterface;
  webUIUpdateCheckInterval: Scalars['Float']['output'];
};

export type SortFilter = {
  __typename?: 'SortFilter';
  default?: Maybe<SortSelection>;
  name: Scalars['String']['output'];
  values: Array<Scalars['String']['output']>;
};

export enum SortOrder {
  Asc = 'ASC',
  AscNullsFirst = 'ASC_NULLS_FIRST',
  AscNullsLast = 'ASC_NULLS_LAST',
  Desc = 'DESC',
  DescNullsFirst = 'DESC_NULLS_FIRST',
  DescNullsLast = 'DESC_NULLS_LAST'
}

export type SortSelection = {
  __typename?: 'SortSelection';
  ascending: Scalars['Boolean']['output'];
  index: Scalars['Int']['output'];
};

export type SortSelectionInput = {
  ascending: Scalars['Boolean']['input'];
  index: Scalars['Int']['input'];
};

export type SourceConditionInput = {
  id?: InputMaybe<Scalars['LongString']['input']>;
  isNsfw?: InputMaybe<Scalars['Boolean']['input']>;
  lang?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

export type SourceEdge = Edge & {
  __typename?: 'SourceEdge';
  cursor: Scalars['Cursor']['output'];
  node: SourceType;
};

export type SourceFilterInput = {
  and?: InputMaybe<Array<SourceFilterInput>>;
  id?: InputMaybe<LongFilterInput>;
  isNsfw?: InputMaybe<BooleanFilterInput>;
  lang?: InputMaybe<StringFilterInput>;
  name?: InputMaybe<StringFilterInput>;
  not?: InputMaybe<SourceFilterInput>;
  or?: InputMaybe<Array<SourceFilterInput>>;
};

export type SourceMetaType = MetaType & {
  __typename?: 'SourceMetaType';
  key: Scalars['String']['output'];
  source: SourceType;
  sourceId: Scalars['LongString']['output'];
  value: Scalars['String']['output'];
};

export type SourceMetaTypeInput = {
  key: Scalars['String']['input'];
  sourceId: Scalars['LongString']['input'];
  value: Scalars['String']['input'];
};

export type SourceNodeList = NodeList & {
  __typename?: 'SourceNodeList';
  edges: Array<SourceEdge>;
  nodes: Array<SourceType>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export enum SourceOrderBy {
  Id = 'ID',
  Lang = 'LANG',
  Name = 'NAME'
}

export type SourceOrderInput = {
  by: SourceOrderBy;
  byType?: InputMaybe<SortOrder>;
};

export type SourcePreferenceChangeInput = {
  checkBoxState?: InputMaybe<Scalars['Boolean']['input']>;
  editTextState?: InputMaybe<Scalars['String']['input']>;
  listState?: InputMaybe<Scalars['String']['input']>;
  multiSelectState?: InputMaybe<Array<Scalars['String']['input']>>;
  position: Scalars['Int']['input'];
  switchState?: InputMaybe<Scalars['Boolean']['input']>;
};

export type SourceType = {
  __typename?: 'SourceType';
  displayName: Scalars['String']['output'];
  extension: ExtensionType;
  filters: Array<Filter>;
  iconUrl: Scalars['String']['output'];
  id: Scalars['LongString']['output'];
  isConfigurable: Scalars['Boolean']['output'];
  isNsfw: Scalars['Boolean']['output'];
  lang: Scalars['String']['output'];
  manga: MangaNodeList;
  meta: Array<SourceMetaType>;
  name: Scalars['String']['output'];
  preferences: Array<Preference>;
  supportsLatest: Scalars['Boolean']['output'];
};

export type StartDownloaderInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
};

export type StartDownloaderPayload = {
  __typename?: 'StartDownloaderPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  downloadStatus: DownloadStatus;
};

export type StopDownloaderInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
};

export type StopDownloaderPayload = {
  __typename?: 'StopDownloaderPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  downloadStatus: DownloadStatus;
};

export type StringFilterInput = {
  distinctFrom?: InputMaybe<Scalars['String']['input']>;
  distinctFromAll?: InputMaybe<Array<Scalars['String']['input']>>;
  distinctFromAny?: InputMaybe<Array<Scalars['String']['input']>>;
  distinctFromInsensitive?: InputMaybe<Scalars['String']['input']>;
  distinctFromInsensitiveAll?: InputMaybe<Array<Scalars['String']['input']>>;
  distinctFromInsensitiveAny?: InputMaybe<Array<Scalars['String']['input']>>;
  endsWith?: InputMaybe<Scalars['String']['input']>;
  endsWithAll?: InputMaybe<Array<Scalars['String']['input']>>;
  endsWithAny?: InputMaybe<Array<Scalars['String']['input']>>;
  endsWithInsensitive?: InputMaybe<Scalars['String']['input']>;
  endsWithInsensitiveAll?: InputMaybe<Array<Scalars['String']['input']>>;
  endsWithInsensitiveAny?: InputMaybe<Array<Scalars['String']['input']>>;
  equalTo?: InputMaybe<Scalars['String']['input']>;
  greaterThan?: InputMaybe<Scalars['String']['input']>;
  greaterThanInsensitive?: InputMaybe<Scalars['String']['input']>;
  greaterThanOrEqualTo?: InputMaybe<Scalars['String']['input']>;
  greaterThanOrEqualToInsensitive?: InputMaybe<Scalars['String']['input']>;
  in?: InputMaybe<Array<Scalars['String']['input']>>;
  inInsensitive?: InputMaybe<Array<Scalars['String']['input']>>;
  includes?: InputMaybe<Scalars['String']['input']>;
  includesAll?: InputMaybe<Array<Scalars['String']['input']>>;
  includesAny?: InputMaybe<Array<Scalars['String']['input']>>;
  includesInsensitive?: InputMaybe<Scalars['String']['input']>;
  includesInsensitiveAll?: InputMaybe<Array<Scalars['String']['input']>>;
  includesInsensitiveAny?: InputMaybe<Array<Scalars['String']['input']>>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  lessThan?: InputMaybe<Scalars['String']['input']>;
  lessThanInsensitive?: InputMaybe<Scalars['String']['input']>;
  lessThanOrEqualTo?: InputMaybe<Scalars['String']['input']>;
  lessThanOrEqualToInsensitive?: InputMaybe<Scalars['String']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  likeAll?: InputMaybe<Array<Scalars['String']['input']>>;
  likeAny?: InputMaybe<Array<Scalars['String']['input']>>;
  likeInsensitive?: InputMaybe<Scalars['String']['input']>;
  likeInsensitiveAll?: InputMaybe<Array<Scalars['String']['input']>>;
  likeInsensitiveAny?: InputMaybe<Array<Scalars['String']['input']>>;
  notDistinctFrom?: InputMaybe<Scalars['String']['input']>;
  notDistinctFromInsensitive?: InputMaybe<Scalars['String']['input']>;
  notEndsWith?: InputMaybe<Scalars['String']['input']>;
  notEndsWithAll?: InputMaybe<Array<Scalars['String']['input']>>;
  notEndsWithAny?: InputMaybe<Array<Scalars['String']['input']>>;
  notEndsWithInsensitive?: InputMaybe<Scalars['String']['input']>;
  notEndsWithInsensitiveAll?: InputMaybe<Array<Scalars['String']['input']>>;
  notEndsWithInsensitiveAny?: InputMaybe<Array<Scalars['String']['input']>>;
  notEqualTo?: InputMaybe<Scalars['String']['input']>;
  notEqualToAll?: InputMaybe<Array<Scalars['String']['input']>>;
  notEqualToAny?: InputMaybe<Array<Scalars['String']['input']>>;
  notIn?: InputMaybe<Array<Scalars['String']['input']>>;
  notInInsensitive?: InputMaybe<Array<Scalars['String']['input']>>;
  notIncludes?: InputMaybe<Scalars['String']['input']>;
  notIncludesAll?: InputMaybe<Array<Scalars['String']['input']>>;
  notIncludesAny?: InputMaybe<Array<Scalars['String']['input']>>;
  notIncludesInsensitive?: InputMaybe<Scalars['String']['input']>;
  notIncludesInsensitiveAll?: InputMaybe<Array<Scalars['String']['input']>>;
  notIncludesInsensitiveAny?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
  notLikeAll?: InputMaybe<Array<Scalars['String']['input']>>;
  notLikeAny?: InputMaybe<Array<Scalars['String']['input']>>;
  notLikeInsensitive?: InputMaybe<Scalars['String']['input']>;
  notLikeInsensitiveAll?: InputMaybe<Array<Scalars['String']['input']>>;
  notLikeInsensitiveAny?: InputMaybe<Array<Scalars['String']['input']>>;
  notStartsWith?: InputMaybe<Scalars['String']['input']>;
  notStartsWithAll?: InputMaybe<Array<Scalars['String']['input']>>;
  notStartsWithAny?: InputMaybe<Array<Scalars['String']['input']>>;
  notStartsWithInsensitive?: InputMaybe<Scalars['String']['input']>;
  notStartsWithInsensitiveAll?: InputMaybe<Array<Scalars['String']['input']>>;
  notStartsWithInsensitiveAny?: InputMaybe<Array<Scalars['String']['input']>>;
  startsWith?: InputMaybe<Scalars['String']['input']>;
  startsWithAll?: InputMaybe<Array<Scalars['String']['input']>>;
  startsWithAny?: InputMaybe<Array<Scalars['String']['input']>>;
  startsWithInsensitive?: InputMaybe<Scalars['String']['input']>;
  startsWithInsensitiveAll?: InputMaybe<Array<Scalars['String']['input']>>;
  startsWithInsensitiveAny?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type Subscription = {
  __typename?: 'Subscription';
  /** @deprecated Replaced width downloadStatusChanged, replace with downloadStatusChanged(input) */
  downloadChanged: DownloadStatus;
  downloadStatusChanged: DownloadUpdates;
  updateStatusChanged: UpdateStatus;
  webUIUpdateStatusChange: WebUiUpdateStatus;
};


export type SubscriptionDownloadStatusChangedArgs = {
  input: DownloadChangedInput;
};

export type SwitchPreference = {
  __typename?: 'SwitchPreference';
  currentValue?: Maybe<Scalars['Boolean']['output']>;
  default: Scalars['Boolean']['output'];
  key: Scalars['String']['output'];
  summary?: Maybe<Scalars['String']['output']>;
  title: Scalars['String']['output'];
  visible: Scalars['Boolean']['output'];
};

export type TextFilter = {
  __typename?: 'TextFilter';
  default: Scalars['String']['output'];
  name: Scalars['String']['output'];
};

export type TrackProgressInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  mangaId: Scalars['Int']['input'];
};

export type TrackProgressPayload = {
  __typename?: 'TrackProgressPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  trackRecords: Array<TrackRecordType>;
};

export type TrackRecordConditionInput = {
  finishDate?: InputMaybe<Scalars['LongString']['input']>;
  id?: InputMaybe<Scalars['Int']['input']>;
  lastChapterRead?: InputMaybe<Scalars['Float']['input']>;
  libraryId?: InputMaybe<Scalars['LongString']['input']>;
  mangaId?: InputMaybe<Scalars['Int']['input']>;
  remoteId?: InputMaybe<Scalars['LongString']['input']>;
  remoteUrl?: InputMaybe<Scalars['String']['input']>;
  score?: InputMaybe<Scalars['Float']['input']>;
  startDate?: InputMaybe<Scalars['LongString']['input']>;
  status?: InputMaybe<Scalars['Int']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  totalChapters?: InputMaybe<Scalars['Int']['input']>;
  trackerId?: InputMaybe<Scalars['Int']['input']>;
};

export type TrackRecordEdge = Edge & {
  __typename?: 'TrackRecordEdge';
  cursor: Scalars['Cursor']['output'];
  node: TrackRecordType;
};

export type TrackRecordFilterInput = {
  and?: InputMaybe<Array<TrackRecordFilterInput>>;
  finishDate?: InputMaybe<LongFilterInput>;
  id?: InputMaybe<IntFilterInput>;
  lastChapterRead?: InputMaybe<DoubleFilterInput>;
  libraryId?: InputMaybe<LongFilterInput>;
  mangaId?: InputMaybe<IntFilterInput>;
  not?: InputMaybe<TrackRecordFilterInput>;
  or?: InputMaybe<Array<TrackRecordFilterInput>>;
  remoteId?: InputMaybe<LongFilterInput>;
  remoteUrl?: InputMaybe<StringFilterInput>;
  score?: InputMaybe<DoubleFilterInput>;
  startDate?: InputMaybe<LongFilterInput>;
  status?: InputMaybe<IntFilterInput>;
  title?: InputMaybe<StringFilterInput>;
  totalChapters?: InputMaybe<IntFilterInput>;
  trackerId?: InputMaybe<IntFilterInput>;
};

export type TrackRecordNodeList = NodeList & {
  __typename?: 'TrackRecordNodeList';
  edges: Array<TrackRecordEdge>;
  nodes: Array<TrackRecordType>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export enum TrackRecordOrderBy {
  FinishDate = 'FINISH_DATE',
  Id = 'ID',
  LastChapterRead = 'LAST_CHAPTER_READ',
  MangaId = 'MANGA_ID',
  RemoteId = 'REMOTE_ID',
  Score = 'SCORE',
  StartDate = 'START_DATE',
  Title = 'TITLE',
  TotalChapters = 'TOTAL_CHAPTERS',
  TrackerId = 'TRACKER_ID'
}

export type TrackRecordOrderInput = {
  by: TrackRecordOrderBy;
  byType?: InputMaybe<SortOrder>;
};

export type TrackRecordType = {
  __typename?: 'TrackRecordType';
  displayScore: Scalars['String']['output'];
  finishDate: Scalars['LongString']['output'];
  id: Scalars['Int']['output'];
  lastChapterRead: Scalars['Float']['output'];
  libraryId?: Maybe<Scalars['LongString']['output']>;
  manga: MangaType;
  mangaId: Scalars['Int']['output'];
  remoteId: Scalars['LongString']['output'];
  remoteUrl: Scalars['String']['output'];
  score: Scalars['Float']['output'];
  startDate: Scalars['LongString']['output'];
  status: Scalars['Int']['output'];
  title: Scalars['String']['output'];
  totalChapters: Scalars['Int']['output'];
  tracker: TrackerType;
  trackerId: Scalars['Int']['output'];
};

export type TrackSearchType = {
  __typename?: 'TrackSearchType';
  coverUrl: Scalars['String']['output'];
  id: Scalars['Int']['output'];
  publishingStatus: Scalars['String']['output'];
  publishingType: Scalars['String']['output'];
  remoteId: Scalars['LongString']['output'];
  startDate: Scalars['String']['output'];
  summary: Scalars['String']['output'];
  title: Scalars['String']['output'];
  totalChapters: Scalars['Int']['output'];
  tracker: TrackerType;
  trackerId: Scalars['Int']['output'];
  trackingUrl: Scalars['String']['output'];
};

export type TrackStatusType = {
  __typename?: 'TrackStatusType';
  name: Scalars['String']['output'];
  value: Scalars['Int']['output'];
};

export type TrackerConditionInput = {
  icon?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['Int']['input']>;
  isLoggedIn?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

export type TrackerEdge = Edge & {
  __typename?: 'TrackerEdge';
  cursor: Scalars['Cursor']['output'];
  node: TrackerType;
};

export type TrackerNodeList = NodeList & {
  __typename?: 'TrackerNodeList';
  edges: Array<TrackerEdge>;
  nodes: Array<TrackerType>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export enum TrackerOrderBy {
  Id = 'ID',
  IsLoggedIn = 'IS_LOGGED_IN',
  Name = 'NAME'
}

export type TrackerOrderInput = {
  by: TrackerOrderBy;
  byType?: InputMaybe<SortOrder>;
};

export type TrackerType = {
  __typename?: 'TrackerType';
  authUrl?: Maybe<Scalars['String']['output']>;
  icon: Scalars['String']['output'];
  id: Scalars['Int']['output'];
  isLoggedIn: Scalars['Boolean']['output'];
  isTokenExpired: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  scores: Array<Scalars['String']['output']>;
  statuses: Array<TrackStatusType>;
  supportsTrackDeletion?: Maybe<Scalars['Boolean']['output']>;
  trackRecords: TrackRecordNodeList;
};

export enum TriState {
  Exclude = 'EXCLUDE',
  Ignore = 'IGNORE',
  Include = 'INCLUDE'
}

export type TriStateFilter = {
  __typename?: 'TriStateFilter';
  default: TriState;
  name: Scalars['String']['output'];
};

export type UnbindTrackInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  /** This will only work if the tracker of the track record supports deleting tracks */
  deleteRemoteTrack?: InputMaybe<Scalars['Boolean']['input']>;
  recordId: Scalars['Int']['input'];
};

export type UnbindTrackPayload = {
  __typename?: 'UnbindTrackPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  trackRecord?: Maybe<TrackRecordType>;
};

export type UpdateCategoriesInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  ids: Array<Scalars['Int']['input']>;
  patch: UpdateCategoryPatchInput;
};

export type UpdateCategoriesPayload = {
  __typename?: 'UpdateCategoriesPayload';
  categories: Array<CategoryType>;
  clientMutationId?: Maybe<Scalars['String']['output']>;
};

export type UpdateCategoryInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['Int']['input'];
  patch: UpdateCategoryPatchInput;
};

export type UpdateCategoryMangaInput = {
  categories: Array<Scalars['Int']['input']>;
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateCategoryMangaPayload = {
  __typename?: 'UpdateCategoryMangaPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  updateStatus: UpdateStatus;
};

export type UpdateCategoryOrderInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['Int']['input'];
  position: Scalars['Int']['input'];
};

export type UpdateCategoryOrderPayload = {
  __typename?: 'UpdateCategoryOrderPayload';
  categories: Array<CategoryType>;
  clientMutationId?: Maybe<Scalars['String']['output']>;
};

export type UpdateCategoryPatchInput = {
  default?: InputMaybe<Scalars['Boolean']['input']>;
  includeInDownload?: InputMaybe<IncludeOrExclude>;
  includeInUpdate?: InputMaybe<IncludeOrExclude>;
  name?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateCategoryPayload = {
  __typename?: 'UpdateCategoryPayload';
  category: CategoryType;
  clientMutationId?: Maybe<Scalars['String']['output']>;
};

export type UpdateChapterInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['Int']['input'];
  patch: UpdateChapterPatchInput;
};

export type UpdateChapterPatchInput = {
  isBookmarked?: InputMaybe<Scalars['Boolean']['input']>;
  isRead?: InputMaybe<Scalars['Boolean']['input']>;
  lastPageRead?: InputMaybe<Scalars['Int']['input']>;
};

export type UpdateChapterPayload = {
  __typename?: 'UpdateChapterPayload';
  chapter: ChapterType;
  clientMutationId?: Maybe<Scalars['String']['output']>;
};

export type UpdateChaptersInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  ids: Array<Scalars['Int']['input']>;
  patch: UpdateChapterPatchInput;
};

export type UpdateChaptersPayload = {
  __typename?: 'UpdateChaptersPayload';
  chapters: Array<ChapterType>;
  clientMutationId?: Maybe<Scalars['String']['output']>;
};

export type UpdateExtensionInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['String']['input'];
  patch: UpdateExtensionPatchInput;
};

export type UpdateExtensionPatchInput = {
  install?: InputMaybe<Scalars['Boolean']['input']>;
  uninstall?: InputMaybe<Scalars['Boolean']['input']>;
  update?: InputMaybe<Scalars['Boolean']['input']>;
};

export type UpdateExtensionPayload = {
  __typename?: 'UpdateExtensionPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  extension?: Maybe<ExtensionType>;
};

export type UpdateExtensionsInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  ids: Array<Scalars['String']['input']>;
  patch: UpdateExtensionPatchInput;
};

export type UpdateExtensionsPayload = {
  __typename?: 'UpdateExtensionsPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  extensions: Array<ExtensionType>;
};

export type UpdateLibraryMangaInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateLibraryMangaPayload = {
  __typename?: 'UpdateLibraryMangaPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  updateStatus: UpdateStatus;
};

export type UpdateMangaCategoriesInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['Int']['input'];
  patch: UpdateMangaCategoriesPatchInput;
};

export type UpdateMangaCategoriesPatchInput = {
  addToCategories?: InputMaybe<Array<Scalars['Int']['input']>>;
  clearCategories?: InputMaybe<Scalars['Boolean']['input']>;
  removeFromCategories?: InputMaybe<Array<Scalars['Int']['input']>>;
};

export type UpdateMangaCategoriesPayload = {
  __typename?: 'UpdateMangaCategoriesPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  manga: MangaType;
};

export type UpdateMangaInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['Int']['input'];
  patch: UpdateMangaPatchInput;
};

export type UpdateMangaPatchInput = {
  inLibrary?: InputMaybe<Scalars['Boolean']['input']>;
};

export type UpdateMangaPayload = {
  __typename?: 'UpdateMangaPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  manga: MangaType;
};

export type UpdateMangasCategoriesInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  ids: Array<Scalars['Int']['input']>;
  patch: UpdateMangaCategoriesPatchInput;
};

export type UpdateMangasCategoriesPayload = {
  __typename?: 'UpdateMangasCategoriesPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  mangas: Array<MangaType>;
};

export type UpdateMangasInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  ids: Array<Scalars['Int']['input']>;
  patch: UpdateMangaPatchInput;
};

export type UpdateMangasPayload = {
  __typename?: 'UpdateMangasPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  mangas: Array<MangaType>;
};

export type UpdateSourcePreferenceInput = {
  change: SourcePreferenceChangeInput;
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  source: Scalars['LongString']['input'];
};

export type UpdateSourcePreferencePayload = {
  __typename?: 'UpdateSourcePreferencePayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  preferences: Array<Preference>;
  source: SourceType;
};

export enum UpdateState {
  Downloading = 'DOWNLOADING',
  Error = 'ERROR',
  Finished = 'FINISHED',
  Idle = 'IDLE'
}

export type UpdateStatus = {
  __typename?: 'UpdateStatus';
  completeJobs: UpdateStatusType;
  failedJobs: UpdateStatusType;
  isRunning: Scalars['Boolean']['output'];
  pendingJobs: UpdateStatusType;
  runningJobs: UpdateStatusType;
  skippedCategories: UpdateStatusCategoryType;
  skippedJobs: UpdateStatusType;
  updatingCategories: UpdateStatusCategoryType;
};

export type UpdateStatusCategoryType = {
  __typename?: 'UpdateStatusCategoryType';
  categories: CategoryNodeList;
};

export type UpdateStatusType = {
  __typename?: 'UpdateStatusType';
  mangas: MangaNodeList;
};

export type UpdateStopInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateStopPayload = {
  __typename?: 'UpdateStopPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
};

export enum UpdateStrategy {
  AlwaysUpdate = 'ALWAYS_UPDATE',
  OnlyFetchOnce = 'ONLY_FETCH_ONCE'
}

export type UpdateTrackInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  finishDate?: InputMaybe<Scalars['LongString']['input']>;
  lastChapterRead?: InputMaybe<Scalars['Float']['input']>;
  recordId: Scalars['Int']['input'];
  scoreString?: InputMaybe<Scalars['String']['input']>;
  startDate?: InputMaybe<Scalars['LongString']['input']>;
  status?: InputMaybe<Scalars['Int']['input']>;
};

export type UpdateTrackPayload = {
  __typename?: 'UpdateTrackPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  trackRecord?: Maybe<TrackRecordType>;
};

export type ValidateBackupInput = {
  backup: Scalars['Upload']['input'];
};

export type ValidateBackupResult = {
  __typename?: 'ValidateBackupResult';
  missingSources: Array<ValidateBackupSource>;
  missingTrackers: Array<ValidateBackupTracker>;
};

export type ValidateBackupSource = {
  __typename?: 'ValidateBackupSource';
  id: Scalars['LongString']['output'];
  name: Scalars['String']['output'];
};

export type ValidateBackupTracker = {
  __typename?: 'ValidateBackupTracker';
  name: Scalars['String']['output'];
};

export enum WebUiChannel {
  Bundled = 'BUNDLED',
  Preview = 'PREVIEW',
  Stable = 'STABLE'
}

export enum WebUiFlavor {
  Custom = 'CUSTOM',
  Vui = 'VUI',
  Webui = 'WEBUI'
}

export enum WebUiInterface {
  Browser = 'BROWSER',
  Electron = 'ELECTRON'
}

export type WebUiUpdateCheck = {
  __typename?: 'WebUIUpdateCheck';
  channel: Scalars['String']['output'];
  tag: Scalars['String']['output'];
  updateAvailable: Scalars['Boolean']['output'];
};

export type WebUiUpdateInfo = {
  __typename?: 'WebUIUpdateInfo';
  channel: Scalars['String']['output'];
  tag: Scalars['String']['output'];
};

export type WebUiUpdateInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
};

export type WebUiUpdatePayload = {
  __typename?: 'WebUIUpdatePayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  updateStatus: WebUiUpdateStatus;
};

export type WebUiUpdateStatus = {
  __typename?: 'WebUIUpdateStatus';
  info: WebUiUpdateInfo;
  progress: Scalars['Int']['output'];
  state: UpdateState;
};

export type CategoryMetaFieldsFragment = { __typename?: 'CategoryMetaType', categoryId: number, key: string, value: string };

export type CategoryBaseFieldsFragment = { __typename?: 'CategoryType', id: number, name: string, default: boolean, order: number };

export type CategoryLibraryFieldsFragment = { __typename?: 'CategoryType', id: number, name: string, default: boolean, order: number, meta: Array<{ __typename?: 'CategoryMetaType', categoryId: number, key: string, value: string }>, mangas: { __typename?: 'MangaNodeList', totalCount: number } };

export type CategorySettingFieldsFragment = { __typename?: 'CategoryType', includeInUpdate: IncludeOrExclude, includeInDownload: IncludeOrExclude, id: number, name: string, default: boolean, order: number };

export type ChapterMetaFieldsFragment = { __typename?: 'ChapterMetaType', chapterId: number, key: string, value: string };

export type ChapterBaseFieldsFragment = { __typename?: 'ChapterType', id: number, name: string, mangaId: number, scanlator?: string | null, realUrl?: string | null, sourceOrder: number, chapterNumber: number };

export type ChapterStateFieldsFragment = { __typename?: 'ChapterType', id: number, isRead: boolean, isDownloaded: boolean, isBookmarked: boolean };

export type ChapterReaderFieldsFragment = { __typename?: 'ChapterType', uploadDate: string, lastPageRead: number, pageCount: number, id: number, name: string, mangaId: number, scanlator?: string | null, realUrl?: string | null, sourceOrder: number, chapterNumber: number, isRead: boolean, isDownloaded: boolean, isBookmarked: boolean };

export type ChapterListFieldsFragment = { __typename?: 'ChapterType', fetchedAt: string, uploadDate: string, id: number, name: string, mangaId: number, scanlator?: string | null, realUrl?: string | null, sourceOrder: number, chapterNumber: number, isRead: boolean, isDownloaded: boolean, isBookmarked: boolean };

export type ChapterUpdateListFieldsFragment = { __typename?: 'ChapterType', fetchedAt: string, uploadDate: string, id: number, name: string, mangaId: number, scanlator?: string | null, realUrl?: string | null, sourceOrder: number, chapterNumber: number, isRead: boolean, isDownloaded: boolean, isBookmarked: boolean, manga: { __typename?: 'MangaType', id: number, title: string, thumbnailUrl?: string | null, thumbnailUrlLastFetched?: string | null, inLibrary: boolean, initialized: boolean, sourceId: string } };

export type ChapterHistoryListFieldsFragment = { __typename?: 'ChapterType', lastReadAt: string, lastPageRead: number, pageCount: number, uploadDate: string, id: number, name: string, mangaId: number, scanlator?: string | null, realUrl?: string | null, sourceOrder: number, chapterNumber: number, isRead: boolean, isDownloaded: boolean, isBookmarked: boolean, manga: { __typename?: 'MangaType', id: number, title: string, thumbnailUrl?: string | null, thumbnailUrlLastFetched?: string | null, inLibrary: boolean, initialized: boolean, sourceId: string } };

export type DownloadTypeFieldsFragment = { __typename?: 'DownloadType', progress: number, state: DownloadState, tries: number, chapter: { __typename?: 'ChapterType', id: number, name: string, sourceOrder: number, isDownloaded: boolean }, manga: { __typename?: 'MangaType', id: number, title: string, downloadCount: number } };

export type DownloadStatusFieldsFragment = { __typename?: 'DownloadStatus', state: DownloaderState, queue: Array<{ __typename?: 'DownloadType', progress: number, state: DownloadState, tries: number, chapter: { __typename?: 'ChapterType', id: number, name: string, sourceOrder: number, isDownloaded: boolean }, manga: { __typename?: 'MangaType', id: number, title: string, downloadCount: number } }> };

export type DownloadUpdatesFieldsFragment = { __typename?: 'DownloadUpdates', state: DownloaderState, omittedUpdates: boolean, updates: Array<{ __typename?: 'DownloadUpdate', type: DownloadUpdateType, download: { __typename?: 'DownloadType', position: number, progress: number, state: DownloadState, tries: number, chapter: { __typename?: 'ChapterType', id: number, name: string, sourceOrder: number, isDownloaded: boolean }, manga: { __typename?: 'MangaType', id: number, title: string, downloadCount: number } } }> };

export type ExtensionListFieldsFragment = { __typename?: 'ExtensionType', pkgName: string, name: string, lang: string, versionCode: number, versionName: string, iconUrl: string, repo?: string | null, isNsfw: boolean, isInstalled: boolean, isObsolete: boolean, hasUpdate: boolean };

export type PageInfoFragment = { __typename?: 'PageInfo', endCursor?: string | null, hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null };

export type GlobalMetadataFragment = { __typename?: 'GlobalMetaType', key: string, value: string };

export type AboutWebuiFragment = { __typename?: 'AboutWebUI', channel: string, tag: string };

export type WebuiUpdateCheckFragment = { __typename?: 'WebUIUpdateCheck', channel: string, tag: string, updateAvailable: boolean };

export type WebuiUpdateInfoFragment = { __typename?: 'WebUIUpdateInfo', channel: string, tag: string };

export type WebuiUpdateStatusFragment = { __typename?: 'WebUIUpdateStatus', progress: number, state: UpdateState, info: { __typename?: 'WebUIUpdateInfo', channel: string, tag: string } };

export type MangaMetaFieldsFragment = { __typename?: 'MangaMetaType', mangaId: number, key: string, value: string };

export type MangaBaseFieldsFragment = { __typename?: 'MangaType', id: number, title: string, thumbnailUrl?: string | null, thumbnailUrlLastFetched?: string | null, inLibrary: boolean, initialized: boolean, sourceId: string };

export type MangaChapterStatFieldsFragment = { __typename?: 'MangaType', id: number, unreadCount: number, downloadCount: number, bookmarkCount: number, hasDuplicateChapters: boolean, chapters: { __typename?: 'ChapterNodeList', totalCount: number } };

export type MangaChapterNodeFieldsFragment = { __typename?: 'MangaType', firstUnreadChapter?: { __typename?: 'ChapterType', id: number, sourceOrder: number, isRead: boolean, mangaId: number } | null, lastReadChapter?: { __typename?: 'ChapterType', id: number, sourceOrder: number, lastReadAt: string } | null, latestReadChapter?: { __typename?: 'ChapterType', id: number, sourceOrder: number, lastReadAt: string } | null, latestFetchedChapter?: { __typename?: 'ChapterType', id: number, fetchedAt: string } | null, latestUploadedChapter?: { __typename?: 'ChapterType', id: number, uploadDate: string } | null };

export type MangaReaderFieldsFragment = { __typename?: 'MangaType', genre: Array<string>, id: number, title: string, thumbnailUrl?: string | null, thumbnailUrlLastFetched?: string | null, inLibrary: boolean, initialized: boolean, sourceId: string, source?: { __typename?: 'SourceType', id: string, name: string, displayName: string } | null, meta: Array<{ __typename?: 'MangaMetaType', mangaId: number, key: string, value: string }>, chapters: { __typename?: 'ChapterNodeList', totalCount: number }, trackRecords: { __typename?: 'TrackRecordNodeList', totalCount: number } };

export type MangaLibraryFieldsFragment = { __typename?: 'MangaType', genre: Array<string>, lastFetchedAt?: string | null, inLibraryAt: string, status: MangaStatus, artist?: string | null, author?: string | null, description?: string | null, id: number, title: string, thumbnailUrl?: string | null, thumbnailUrlLastFetched?: string | null, inLibrary: boolean, initialized: boolean, sourceId: string, unreadCount: number, downloadCount: number, bookmarkCount: number, hasDuplicateChapters: boolean, source?: { __typename?: 'SourceType', id: string, displayName: string } | null, trackRecords: { __typename?: 'TrackRecordNodeList', totalCount: number, nodes: Array<{ __typename?: 'TrackRecordType', id: number, trackerId: number }> }, chapters: { __typename?: 'ChapterNodeList', totalCount: number }, firstUnreadChapter?: { __typename?: 'ChapterType', id: number, sourceOrder: number, isRead: boolean, mangaId: number } | null, lastReadChapter?: { __typename?: 'ChapterType', id: number, sourceOrder: number, lastReadAt: string } | null, latestReadChapter?: { __typename?: 'ChapterType', id: number, sourceOrder: number, lastReadAt: string } | null, latestFetchedChapter?: { __typename?: 'ChapterType', id: number, fetchedAt: string } | null, latestUploadedChapter?: { __typename?: 'ChapterType', id: number, uploadDate: string } | null };

export type MangaScreenFieldsFragment = { __typename?: 'MangaType', artist?: string | null, author?: string | null, description?: string | null, status: MangaStatus, realUrl?: string | null, sourceId: string, genre: Array<string>, lastFetchedAt?: string | null, inLibraryAt: string, id: number, title: string, thumbnailUrl?: string | null, thumbnailUrlLastFetched?: string | null, inLibrary: boolean, initialized: boolean, unreadCount: number, downloadCount: number, bookmarkCount: number, hasDuplicateChapters: boolean, source?: { __typename?: 'SourceType', id: string, displayName: string } | null, trackRecords: { __typename?: 'TrackRecordNodeList', totalCount: number, nodes: Array<{ __typename?: 'TrackRecordType', id: number, trackerId: number }> }, chapters: { __typename?: 'ChapterNodeList', totalCount: number }, firstUnreadChapter?: { __typename?: 'ChapterType', id: number, sourceOrder: number, isRead: boolean, mangaId: number } | null, lastReadChapter?: { __typename?: 'ChapterType', id: number, sourceOrder: number, lastReadAt: string } | null, latestReadChapter?: { __typename?: 'ChapterType', id: number, sourceOrder: number, lastReadAt: string } | null, latestFetchedChapter?: { __typename?: 'ChapterType', id: number, fetchedAt: string } | null, latestUploadedChapter?: { __typename?: 'ChapterType', id: number, uploadDate: string } | null };

export type MangaLibraryDuplicateScreenFieldsFragment = { __typename?: 'MangaType', description?: string | null, id: number, title: string, thumbnailUrl?: string | null, thumbnailUrlLastFetched?: string | null, inLibrary: boolean, initialized: boolean, sourceId: string, unreadCount: number, downloadCount: number, bookmarkCount: number, hasDuplicateChapters: boolean, chapters: { __typename?: 'ChapterNodeList', totalCount: number } };

export type ServerSettingsFragment = { __typename?: 'SettingsType', ip: string, port: number, socksProxyEnabled: boolean, socksProxyVersion: number, socksProxyHost: string, socksProxyPort: string, socksProxyUsername: string, socksProxyPassword: string, webUIFlavor: WebUiFlavor, initialOpenInBrowserEnabled: boolean, webUIInterface: WebUiInterface, electronPath: string, webUIChannel: WebUiChannel, webUIUpdateCheckInterval: number, downloadAsCbz: boolean, downloadsPath: string, autoDownloadNewChapters: boolean, excludeEntryWithUnreadChapters: boolean, autoDownloadNewChaptersLimit: number, autoDownloadIgnoreReUploads?: boolean | null, extensionRepos: Array<string>, maxSourcesInParallel: number, excludeUnreadChapters: boolean, excludeNotStarted: boolean, excludeCompleted: boolean, globalUpdateInterval: number, updateMangas: boolean, basicAuthEnabled: boolean, basicAuthUsername: string, basicAuthPassword: string, debugLogsEnabled: boolean, systemTrayEnabled: boolean, maxLogFileSize: string, maxLogFiles: number, maxLogFolderSize: string, backupPath: string, backupTime: string, backupInterval: number, backupTTL: number, localSourcePath: string, flareSolverrEnabled: boolean, flareSolverrUrl: string, flareSolverrTimeout: number, flareSolverrSessionName: string, flareSolverrSessionTtl: number, flareSolverrAsResponseFallback: boolean };

export type SourceMetaFieldsFragment = { __typename?: 'SourceMetaType', sourceId: string, key: string, value: string };

export type SourceBaseFieldsFragment = { __typename?: 'SourceType', id: string, name: string, displayName: string };

export type SourceMigratableFieldsFragment = { __typename?: 'SourceType', lang: string, iconUrl: string, id: string, name: string, displayName: string };

export type SourceListFieldsFragment = { __typename?: 'SourceType', lang: string, iconUrl: string, isNsfw: boolean, supportsLatest: boolean, id: string, name: string, displayName: string, extension: { __typename?: 'ExtensionType', pkgName: string, repo?: string | null } };

export type SourceBrowseFieldsFragment = { __typename?: 'SourceType', isConfigurable: boolean, supportsLatest: boolean, id: string, name: string, displayName: string, meta: Array<{ __typename?: 'SourceMetaType', sourceId: string, key: string, value: string }>, filters: Array<{ __typename?: 'CheckBoxFilter', name: string, type: 'CheckBoxFilter', CheckBoxFilterDefault: boolean } | { __typename?: 'GroupFilter', name: string, type: 'GroupFilter', filters: Array<{ __typename?: 'CheckBoxFilter', name: string, type: 'CheckBoxFilter', CheckBoxFilterDefault: boolean } | { __typename?: 'GroupFilter' } | { __typename?: 'HeaderFilter', name: string, type: 'HeaderFilter' } | { __typename?: 'SelectFilter', name: string, values: Array<string>, type: 'SelectFilter', SelectFilterDefault: number } | { __typename?: 'SeparatorFilter', name: string, type: 'SeparatorFilter' } | { __typename?: 'SortFilter', name: string, values: Array<string>, type: 'SortFilter', SortFilterDefault?: { __typename?: 'SortSelection', ascending: boolean, index: number } | null } | { __typename?: 'TextFilter', name: string, type: 'TextFilter', TextFilterDefault: string } | { __typename?: 'TriStateFilter', name: string, type: 'TriStateFilter', TriStateFilterDefault: TriState }> } | { __typename?: 'HeaderFilter', name: string, type: 'HeaderFilter' } | { __typename?: 'SelectFilter', name: string, values: Array<string>, type: 'SelectFilter', SelectFilterDefault: number } | { __typename?: 'SeparatorFilter', name: string, type: 'SeparatorFilter' } | { __typename?: 'SortFilter', name: string, values: Array<string>, type: 'SortFilter', SortFilterDefault?: { __typename?: 'SortSelection', ascending: boolean, index: number } | null } | { __typename?: 'TextFilter', name: string, type: 'TextFilter', TextFilterDefault: string } | { __typename?: 'TriStateFilter', name: string, type: 'TriStateFilter', TriStateFilterDefault: TriState }> };

export type SourceSettingFieldsFragment = { __typename?: 'SourceType', id: string, name: string, displayName: string, preferences: Array<{ __typename?: 'CheckBoxPreference', summary?: string | null, key: string, type: 'CheckBoxPreference', CheckBoxCheckBoxCurrentValue?: boolean | null, CheckBoxDefault: boolean, CheckBoxTitle: string } | { __typename?: 'EditTextPreference', text?: string | null, summary?: string | null, key: string, dialogTitle?: string | null, dialogMessage?: string | null, type: 'EditTextPreference', EditTextPreferenceCurrentValue?: string | null, EditTextPreferenceDefault?: string | null, EditTextPreferenceTitle?: string | null } | { __typename?: 'ListPreference', summary?: string | null, key: string, entryValues: Array<string>, entries: Array<string>, type: 'ListPreference', ListPreferenceCurrentValue?: string | null, ListPreferenceDefault?: string | null, ListPreferenceTitle?: string | null } | { __typename?: 'MultiSelectListPreference', dialogMessage?: string | null, dialogTitle?: string | null, summary?: string | null, key: string, entryValues: Array<string>, entries: Array<string>, type: 'MultiSelectListPreference', MultiSelectListPreferenceTitle?: string | null, MultiSelectListPreferenceDefault?: Array<string> | null, MultiSelectListPreferenceCurrentValue?: Array<string> | null } | { __typename?: 'SwitchPreference', summary?: string | null, key: string, type: 'SwitchPreference', SwitchPreferenceCurrentValue?: boolean | null, SwitchPreferenceDefault: boolean, SwitchPreferenceTitle: string }> };

export type TrackerBaseFieldsFragment = { __typename?: 'TrackerType', id: number, name: string, icon: string, isLoggedIn: boolean, isTokenExpired: boolean };

export type TrackerSettingFieldsFragment = { __typename?: 'TrackerType', authUrl?: string | null, id: number, name: string, icon: string, isLoggedIn: boolean, isTokenExpired: boolean };

export type TrackerBindFieldsFragment = { __typename?: 'TrackerType', icon: string, supportsTrackDeletion?: boolean | null, scores: Array<string>, id: number, name: string, isLoggedIn: boolean, isTokenExpired: boolean, statuses: Array<{ __typename?: 'TrackStatusType', name: string, value: number }>, trackRecords: { __typename?: 'TrackRecordNodeList', nodes: Array<{ __typename?: 'TrackRecordType', id: number, remoteId: string, trackerId: number, remoteUrl: string, title: string, status: number, lastChapterRead: number, totalChapters: number, score: number, displayScore: string, startDate: string, finishDate: string }> } };

export type TrackRecordSearchFieldsFragment = { __typename?: 'TrackSearchType', id: number, remoteId: string, title: string, trackingUrl: string, coverUrl: string, publishingType: string, startDate: string, publishingStatus: string, summary: string };

export type TrackRecordBindFieldsFragment = { __typename?: 'TrackRecordType', id: number, remoteId: string, trackerId: number, remoteUrl: string, title: string, status: number, lastChapterRead: number, totalChapters: number, score: number, displayScore: string, startDate: string, finishDate: string };

export type UpdaterMangaFieldsFragment = { __typename?: 'MangaType', id: number, title: string, thumbnailUrl?: string | null };

export type UpdaterSubscriptionFieldsFragment = { __typename?: 'UpdateStatus', isRunning: boolean, completeJobs: { __typename?: 'UpdateStatusType', mangas: { __typename?: 'MangaNodeList', totalCount: number, nodes: Array<{ __typename?: 'MangaType', id: number, unreadCount: number, downloadCount: number, bookmarkCount: number, hasDuplicateChapters: boolean, firstUnreadChapter?: { __typename?: 'ChapterType', id: number, sourceOrder: number } | null, lastReadChapter?: { __typename?: 'ChapterType', id: number, sourceOrder: number, lastReadAt: string } | null, latestReadChapter?: { __typename?: 'ChapterType', id: number, sourceOrder: number, lastReadAt: string } | null, latestFetchedChapter?: { __typename?: 'ChapterType', id: number, fetchedAt: string } | null, latestUploadedChapter?: { __typename?: 'ChapterType', id: number, uploadDate: string } | null, chapters: { __typename?: 'ChapterNodeList', totalCount: number } }> } }, failedJobs: { __typename?: 'UpdateStatusType', mangas: { __typename?: 'MangaNodeList', totalCount: number, nodes: Array<{ __typename?: 'MangaType', id: number, title: string, thumbnailUrl?: string | null }> } }, pendingJobs: { __typename?: 'UpdateStatusType', mangas: { __typename?: 'MangaNodeList', totalCount: number, nodes: Array<{ __typename?: 'MangaType', id: number, title: string, thumbnailUrl?: string | null }> } }, runningJobs: { __typename?: 'UpdateStatusType', mangas: { __typename?: 'MangaNodeList', totalCount: number, nodes: Array<{ __typename?: 'MangaType', id: number, title: string, thumbnailUrl?: string | null }> } } };

export type UpdaterStartStopFieldsFragment = { __typename?: 'UpdateStatus', isRunning: boolean };

export type CreateBackupMutationVariables = Exact<{
  input: CreateBackupInput;
}>;


export type CreateBackupMutation = { __typename?: 'Mutation', createBackup: { __typename?: 'CreateBackupPayload', url: string } };

export type RestoreBackupMutationVariables = Exact<{
  backup: Scalars['Upload']['input'];
}>;


export type RestoreBackupMutation = { __typename?: 'Mutation', restoreBackup: { __typename?: 'RestoreBackupPayload', id: string, status?: { __typename?: 'BackupRestoreStatus', mangaProgress: number, state: BackupRestoreState, totalManga: number } | null } };

export type CreateCategoryMutationVariables = Exact<{
  input: CreateCategoryInput;
}>;


export type CreateCategoryMutation = { __typename?: 'Mutation', createCategory?: { __typename?: 'CreateCategoryPayload', category: { __typename?: 'CategoryType', includeInUpdate: IncludeOrExclude, includeInDownload: IncludeOrExclude, id: number, name: string, default: boolean, order: number } } | null };

export type DeleteCategoryMutationVariables = Exact<{
  input: DeleteCategoryInput;
}>;


export type DeleteCategoryMutation = { __typename?: 'Mutation', deleteCategory?: { __typename?: 'DeleteCategoryPayload', category?: { __typename?: 'CategoryType', id: number } | null } | null };

export type DeleteCategoryMetadataMutationVariables = Exact<{
  input: DeleteCategoryMetaInput;
}>;


export type DeleteCategoryMetadataMutation = { __typename?: 'Mutation', deleteCategoryMeta?: { __typename?: 'DeleteCategoryMetaPayload', meta?: { __typename?: 'CategoryMetaType', categoryId: number, key: string, value: string } | null } | null };

export type SetCategoryMetadataMutationVariables = Exact<{
  input: SetCategoryMetaInput;
}>;


export type SetCategoryMetadataMutation = { __typename?: 'Mutation', setCategoryMeta?: { __typename?: 'SetCategoryMetaPayload', meta: { __typename?: 'CategoryMetaType', categoryId: number, key: string, value: string } } | null };

export type UpdateCategoryMutationVariables = Exact<{
  input: UpdateCategoryInput;
  getDefault: Scalars['Boolean']['input'];
  getIncludeInUpdate: Scalars['Boolean']['input'];
  getIncludeInDownload: Scalars['Boolean']['input'];
  getName: Scalars['Boolean']['input'];
}>;


export type UpdateCategoryMutation = { __typename?: 'Mutation', updateCategory?: { __typename?: 'UpdateCategoryPayload', category: { __typename?: 'CategoryType', id: number, default?: boolean, includeInUpdate?: IncludeOrExclude, includeInDownload?: IncludeOrExclude, name?: string } } | null };

export type UpdateCategoriesMutationVariables = Exact<{
  input: UpdateCategoriesInput;
  getDefault: Scalars['Boolean']['input'];
  getIncludeInUpdate: Scalars['Boolean']['input'];
  getIncludeInDownload: Scalars['Boolean']['input'];
  getName: Scalars['Boolean']['input'];
}>;


export type UpdateCategoriesMutation = { __typename?: 'Mutation', updateCategories?: { __typename?: 'UpdateCategoriesPayload', categories: Array<{ __typename?: 'CategoryType', id: number, default?: boolean, includeInUpdate?: IncludeOrExclude, includeInDownload?: IncludeOrExclude, name?: string }> } | null };

export type UpdateCategoryOrderMutationVariables = Exact<{
  input: UpdateCategoryOrderInput;
}>;


export type UpdateCategoryOrderMutation = { __typename?: 'Mutation', updateCategoryOrder?: { __typename?: 'UpdateCategoryOrderPayload', categories: Array<{ __typename?: 'CategoryType', id: number, order: number }> } | null };

export type DeleteChapterMetadataMutationVariables = Exact<{
  input: DeleteChapterMetaInput;
}>;


export type DeleteChapterMetadataMutation = { __typename?: 'Mutation', deleteChapterMeta?: { __typename?: 'DeleteChapterMetaPayload', meta?: { __typename?: 'ChapterMetaType', chapterId: number, key: string, value: string } | null } | null };

export type GetChapterPagesFetchMutationVariables = Exact<{
  input: FetchChapterPagesInput;
}>;


export type GetChapterPagesFetchMutation = { __typename?: 'Mutation', fetchChapterPages?: { __typename?: 'FetchChapterPagesPayload', pages: Array<string>, chapter: { __typename?: 'ChapterType', id: number, pageCount: number } } | null };

export type GetMangaChaptersFetchMutationVariables = Exact<{
  input: FetchChaptersInput;
}>;


export type GetMangaChaptersFetchMutation = { __typename?: 'Mutation', fetchChapters?: { __typename?: 'FetchChaptersPayload', chapters: Array<{ __typename?: 'ChapterType', fetchedAt: string, uploadDate: string, id: number, name: string, mangaId: number, scanlator?: string | null, realUrl?: string | null, sourceOrder: number, chapterNumber: number, isRead: boolean, isDownloaded: boolean, isBookmarked: boolean, manga: { __typename?: 'MangaType', id: number, unreadCount: number, downloadCount: number, bookmarkCount: number, hasDuplicateChapters: boolean, chapters: { __typename?: 'ChapterNodeList', totalCount: number }, firstUnreadChapter?: { __typename?: 'ChapterType', id: number, sourceOrder: number, isRead: boolean, mangaId: number } | null, lastReadChapter?: { __typename?: 'ChapterType', id: number, sourceOrder: number, lastReadAt: string } | null, latestReadChapter?: { __typename?: 'ChapterType', id: number, sourceOrder: number, lastReadAt: string } | null, latestFetchedChapter?: { __typename?: 'ChapterType', id: number, fetchedAt: string } | null, latestUploadedChapter?: { __typename?: 'ChapterType', id: number, uploadDate: string } | null } }> } | null };

export type SetChapterMetadataMutationVariables = Exact<{
  input: SetChapterMetaInput;
}>;


export type SetChapterMetadataMutation = { __typename?: 'Mutation', setChapterMeta?: { __typename?: 'SetChapterMetaPayload', meta: { __typename?: 'ChapterMetaType', chapterId: number, key: string, value: string } } | null };

export type UpdateChapterMutationVariables = Exact<{
  input: UpdateChapterInput;
  getBookmarked: Scalars['Boolean']['input'];
  getRead: Scalars['Boolean']['input'];
  getLastPageRead: Scalars['Boolean']['input'];
  chapterIdToDelete: Scalars['Int']['input'];
  deleteChapter: Scalars['Boolean']['input'];
  mangaId: Scalars['Int']['input'];
  trackProgress: Scalars['Boolean']['input'];
}>;


export type UpdateChapterMutation = { __typename?: 'Mutation', updateChapter?: { __typename?: 'UpdateChapterPayload', chapter: { __typename?: 'ChapterType', id: number, isBookmarked?: boolean, isRead?: boolean, lastReadAt?: string, lastPageRead?: number, manga?: { __typename?: 'MangaType', id: number, unreadCount: number, bookmarkCount: number, lastReadChapter?: { __typename?: 'ChapterType', id: number } | null, latestReadChapter?: { __typename?: 'ChapterType', id: number } | null, firstUnreadChapter?: { __typename?: 'ChapterType', id: number } | null } } } | null, deleteDownloadedChapter?: { __typename?: 'DeleteDownloadedChapterPayload', chapters: { __typename?: 'ChapterType', id: number, isDownloaded: boolean, manga: { __typename?: 'MangaType', id: number, downloadCount: number } } } | null, trackProgress?: { __typename?: 'TrackProgressPayload', trackRecords: Array<{ __typename?: 'TrackRecordType', id: number, remoteId: string, trackerId: number, remoteUrl: string, title: string, status: number, lastChapterRead: number, totalChapters: number, score: number, displayScore: string, startDate: string, finishDate: string }> } | null };

export type UpdateChaptersMutationVariables = Exact<{
  input: UpdateChaptersInput;
  getBookmarked: Scalars['Boolean']['input'];
  getRead: Scalars['Boolean']['input'];
  getLastPageRead: Scalars['Boolean']['input'];
  chapterIdsToDelete: Array<Scalars['Int']['input']> | Scalars['Int']['input'];
  deleteChapters: Scalars['Boolean']['input'];
  mangaId: Scalars['Int']['input'];
  trackProgress: Scalars['Boolean']['input'];
}>;


export type UpdateChaptersMutation = { __typename?: 'Mutation', updateChapters?: { __typename?: 'UpdateChaptersPayload', chapters: Array<{ __typename?: 'ChapterType', id: number, isBookmarked?: boolean, isRead?: boolean, lastReadAt?: string, lastPageRead?: number, manga?: { __typename?: 'MangaType', id: number, unreadCount: number, bookmarkCount: number, lastReadChapter?: { __typename?: 'ChapterType', id: number } | null, latestReadChapter?: { __typename?: 'ChapterType', id: number } | null, firstUnreadChapter?: { __typename?: 'ChapterType', id: number } | null } }> } | null, deleteDownloadedChapters?: { __typename?: 'DeleteDownloadedChaptersPayload', chapters: Array<{ __typename?: 'ChapterType', id: number, isDownloaded: boolean, manga: { __typename?: 'MangaType', id: number, downloadCount: number } }> } | null, trackProgress?: { __typename?: 'TrackProgressPayload', trackRecords: Array<{ __typename?: 'TrackRecordType', id: number, remoteId: string, trackerId: number, remoteUrl: string, title: string, status: number, lastChapterRead: number, totalChapters: number, score: number, displayScore: string, startDate: string, finishDate: string }> } | null };

export type ClearDownloaderMutationVariables = Exact<{
  input?: InputMaybe<ClearDownloaderInput>;
}>;


export type ClearDownloaderMutation = { __typename?: 'Mutation', clearDownloader?: { __typename?: 'ClearDownloaderPayload', downloadStatus: { __typename?: 'DownloadStatus', state: DownloaderState, queue: Array<{ __typename?: 'DownloadType', progress: number, state: DownloadState, tries: number, chapter: { __typename?: 'ChapterType', id: number, name: string, sourceOrder: number, isDownloaded: boolean }, manga: { __typename?: 'MangaType', id: number, title: string, downloadCount: number } }> } } | null };

export type DeleteDownloadedChapterMutationVariables = Exact<{
  input: DeleteDownloadedChapterInput;
}>;


export type DeleteDownloadedChapterMutation = { __typename?: 'Mutation', deleteDownloadedChapter?: { __typename?: 'DeleteDownloadedChapterPayload', chapters: { __typename?: 'ChapterType', id: number, isDownloaded: boolean, manga: { __typename?: 'MangaType', id: number, downloadCount: number } } } | null };

export type DeleteDownloadedChaptersMutationVariables = Exact<{
  input: DeleteDownloadedChaptersInput;
}>;


export type DeleteDownloadedChaptersMutation = { __typename?: 'Mutation', deleteDownloadedChapters?: { __typename?: 'DeleteDownloadedChaptersPayload', chapters: Array<{ __typename?: 'ChapterType', id: number, isDownloaded: boolean, manga: { __typename?: 'MangaType', id: number, downloadCount: number } }> } | null };

export type DequeueChapterDownloadMutationVariables = Exact<{
  input: DequeueChapterDownloadInput;
}>;


export type DequeueChapterDownloadMutation = { __typename?: 'Mutation', dequeueChapterDownload?: { __typename?: 'DequeueChapterDownloadPayload', downloadStatus: { __typename?: 'DownloadStatus', state: DownloaderState, queue: Array<{ __typename?: 'DownloadType', progress: number, state: DownloadState, tries: number, chapter: { __typename?: 'ChapterType', id: number, name: string, sourceOrder: number, isDownloaded: boolean }, manga: { __typename?: 'MangaType', id: number, title: string, downloadCount: number } }> } } | null };

export type DequeueChapterDownloadsMutationVariables = Exact<{
  input: DequeueChapterDownloadsInput;
}>;


export type DequeueChapterDownloadsMutation = { __typename?: 'Mutation', dequeueChapterDownloads?: { __typename?: 'DequeueChapterDownloadsPayload', downloadStatus: { __typename?: 'DownloadStatus', state: DownloaderState, queue: Array<{ __typename?: 'DownloadType', progress: number, state: DownloadState, tries: number, chapter: { __typename?: 'ChapterType', id: number, name: string, sourceOrder: number, isDownloaded: boolean }, manga: { __typename?: 'MangaType', id: number, title: string, downloadCount: number } }> } } | null };

export type EnqueueChapterDownloadMutationVariables = Exact<{
  input: EnqueueChapterDownloadInput;
}>;


export type EnqueueChapterDownloadMutation = { __typename?: 'Mutation', enqueueChapterDownload?: { __typename?: 'EnqueueChapterDownloadPayload', downloadStatus: { __typename?: 'DownloadStatus', state: DownloaderState, queue: Array<{ __typename?: 'DownloadType', progress: number, state: DownloadState, tries: number, chapter: { __typename?: 'ChapterType', id: number, name: string, sourceOrder: number, isDownloaded: boolean }, manga: { __typename?: 'MangaType', id: number, title: string, downloadCount: number } }> } } | null };

export type EnqueueChapterDownloadsMutationVariables = Exact<{
  input: EnqueueChapterDownloadsInput;
}>;


export type EnqueueChapterDownloadsMutation = { __typename?: 'Mutation', enqueueChapterDownloads?: { __typename?: 'EnqueueChapterDownloadsPayload', downloadStatus: { __typename?: 'DownloadStatus', state: DownloaderState, queue: Array<{ __typename?: 'DownloadType', progress: number, state: DownloadState, tries: number, chapter: { __typename?: 'ChapterType', id: number, name: string, sourceOrder: number, isDownloaded: boolean }, manga: { __typename?: 'MangaType', id: number, title: string, downloadCount: number } }> } } | null };

export type ReorderChapterDownloadMutationVariables = Exact<{
  input: ReorderChapterDownloadInput;
}>;


export type ReorderChapterDownloadMutation = { __typename?: 'Mutation', reorderChapterDownload?: { __typename?: 'ReorderChapterDownloadPayload', downloadStatus: { __typename?: 'DownloadStatus', state: DownloaderState, queue: Array<{ __typename?: 'DownloadType', progress: number, state: DownloadState, tries: number, chapter: { __typename?: 'ChapterType', id: number, name: string, sourceOrder: number, isDownloaded: boolean }, manga: { __typename?: 'MangaType', id: number, title: string, downloadCount: number } }> } } | null };

export type StartDownloaderMutationVariables = Exact<{
  input?: InputMaybe<StartDownloaderInput>;
}>;


export type StartDownloaderMutation = { __typename?: 'Mutation', startDownloader?: { __typename?: 'StartDownloaderPayload', downloadStatus: { __typename?: 'DownloadStatus', state: DownloaderState } } | null };

export type StopDownloaderMutationVariables = Exact<{
  input?: InputMaybe<StopDownloaderInput>;
}>;


export type StopDownloaderMutation = { __typename?: 'Mutation', stopDownloader?: { __typename?: 'StopDownloaderPayload', downloadStatus: { __typename?: 'DownloadStatus', state: DownloaderState } } | null };

export type GetExtensionsFetchMutationVariables = Exact<{
  input?: InputMaybe<FetchExtensionsInput>;
}>;


export type GetExtensionsFetchMutation = { __typename?: 'Mutation', fetchExtensions?: { __typename?: 'FetchExtensionsPayload', extensions: Array<{ __typename?: 'ExtensionType', pkgName: string, name: string, lang: string, versionCode: number, versionName: string, iconUrl: string, repo?: string | null, isNsfw: boolean, isInstalled: boolean, isObsolete: boolean, hasUpdate: boolean }> } | null };

export type UpdateExtensionMutationVariables = Exact<{
  input: UpdateExtensionInput;
}>;


export type UpdateExtensionMutation = { __typename?: 'Mutation', updateExtension?: { __typename?: 'UpdateExtensionPayload', extension?: { __typename?: 'ExtensionType', pkgName: string, name: string, lang: string, versionCode: number, versionName: string, iconUrl: string, repo?: string | null, isNsfw: boolean, isInstalled: boolean, isObsolete: boolean, hasUpdate: boolean } | null } | null };

export type UpdateExtensionsMutationVariables = Exact<{
  input: UpdateExtensionsInput;
}>;


export type UpdateExtensionsMutation = { __typename?: 'Mutation', updateExtensions?: { __typename?: 'UpdateExtensionsPayload', extensions: Array<{ __typename?: 'ExtensionType', pkgName: string, name: string, lang: string, versionCode: number, versionName: string, iconUrl: string, repo?: string | null, isNsfw: boolean, isInstalled: boolean, isObsolete: boolean, hasUpdate: boolean }> } | null };

export type InstallExternalExtensionMutationVariables = Exact<{
  file: Scalars['Upload']['input'];
}>;


export type InstallExternalExtensionMutation = { __typename?: 'Mutation', installExternalExtension?: { __typename?: 'InstallExternalExtensionPayload', extension: { __typename?: 'ExtensionType', pkgName: string, name: string, lang: string, versionCode: number, versionName: string, iconUrl: string, repo?: string | null, isNsfw: boolean, isInstalled: boolean, isObsolete: boolean, hasUpdate: boolean } } | null };

export type DeleteGlobalMetadataMutationVariables = Exact<{
  input: DeleteGlobalMetaInput;
}>;


export type DeleteGlobalMetadataMutation = { __typename?: 'Mutation', deleteGlobalMeta?: { __typename?: 'DeleteGlobalMetaPayload', meta?: { __typename?: 'GlobalMetaType', key: string, value: string } | null } | null };

export type SetGlobalMetadataMutationVariables = Exact<{
  input: SetGlobalMetaInput;
}>;


export type SetGlobalMetadataMutation = { __typename?: 'Mutation', setGlobalMeta?: { __typename?: 'SetGlobalMetaPayload', meta: { __typename?: 'GlobalMetaType', key: string, value: string } } | null };

export type ClearServerCacheMutationVariables = Exact<{
  input: ClearCachedImagesInput;
}>;


export type ClearServerCacheMutation = { __typename?: 'Mutation', clearCachedImages: { __typename?: 'ClearCachedImagesPayload', cachedPages?: boolean | null, cachedThumbnails?: boolean | null, downloadedThumbnails?: boolean | null } };

export type DeleteMangaMetadataMutationVariables = Exact<{
  input: DeleteMangaMetaInput;
}>;


export type DeleteMangaMetadataMutation = { __typename?: 'Mutation', deleteMangaMeta?: { __typename?: 'DeleteMangaMetaPayload', meta?: { __typename?: 'MangaMetaType', mangaId: number, key: string, value: string } | null } | null };

export type GetMangaFetchMutationVariables = Exact<{
  input: FetchMangaInput;
}>;


export type GetMangaFetchMutation = { __typename?: 'Mutation', fetchManga?: { __typename?: 'FetchMangaPayload', manga: { __typename?: 'MangaType', artist?: string | null, author?: string | null, description?: string | null, status: MangaStatus, realUrl?: string | null, sourceId: string, genre: Array<string>, lastFetchedAt?: string | null, inLibraryAt: string, id: number, title: string, thumbnailUrl?: string | null, thumbnailUrlLastFetched?: string | null, inLibrary: boolean, initialized: boolean, unreadCount: number, downloadCount: number, bookmarkCount: number, hasDuplicateChapters: boolean, source?: { __typename?: 'SourceType', id: string, displayName: string } | null, trackRecords: { __typename?: 'TrackRecordNodeList', totalCount: number, nodes: Array<{ __typename?: 'TrackRecordType', id: number, trackerId: number }> }, chapters: { __typename?: 'ChapterNodeList', totalCount: number }, firstUnreadChapter?: { __typename?: 'ChapterType', id: number, sourceOrder: number, isRead: boolean, mangaId: number } | null, lastReadChapter?: { __typename?: 'ChapterType', id: number, sourceOrder: number, lastReadAt: string } | null, latestReadChapter?: { __typename?: 'ChapterType', id: number, sourceOrder: number, lastReadAt: string } | null, latestFetchedChapter?: { __typename?: 'ChapterType', id: number, fetchedAt: string } | null, latestUploadedChapter?: { __typename?: 'ChapterType', id: number, uploadDate: string } | null } } | null };

export type GetMangaToMigrateToFetchMutationVariables = Exact<{
  id: Scalars['Int']['input'];
  migrateChapters: Scalars['Boolean']['input'];
  migrateCategories: Scalars['Boolean']['input'];
  migrateTracking: Scalars['Boolean']['input'];
}>;


export type GetMangaToMigrateToFetchMutation = { __typename?: 'Mutation', fetchManga?: { __typename?: 'FetchMangaPayload', manga: { __typename?: 'MangaType', id: number, title: string, inLibrary: boolean, categories?: { __typename?: 'CategoryNodeList', nodes: Array<{ __typename?: 'CategoryType', id: number }> }, trackRecords?: { __typename?: 'TrackRecordNodeList', nodes: Array<{ __typename?: 'TrackRecordType', id: number, remoteId: string, trackerId: number }> } } } | null, fetchChapters?: { __typename?: 'FetchChaptersPayload', chapters: Array<{ __typename?: 'ChapterType', id: number, chapterNumber: number, isRead: boolean, isDownloaded: boolean, isBookmarked: boolean, manga: { __typename?: 'MangaType', id: number } }> } | null };

export type SetMangaMetadataMutationVariables = Exact<{
  input: SetMangaMetaInput;
}>;


export type SetMangaMetadataMutation = { __typename?: 'Mutation', setMangaMeta?: { __typename?: 'SetMangaMetaPayload', meta: { __typename?: 'MangaMetaType', mangaId: number, key: string, value: string } } | null };

export type UpdateMangaMutationVariables = Exact<{
  input: UpdateMangaInput;
  updateCategoryInput: UpdateMangaCategoriesInput;
  updateCategories: Scalars['Boolean']['input'];
}>;


export type UpdateMangaMutation = { __typename?: 'Mutation', updateMangaCategories?: { __typename?: 'UpdateMangaCategoriesPayload', manga: { __typename?: 'MangaType', id: number, categories: { __typename?: 'CategoryNodeList', totalCount: number, nodes: Array<{ __typename?: 'CategoryType', id: number, mangas: { __typename?: 'MangaNodeList', totalCount: number } }> } } } | null, updateManga?: { __typename?: 'UpdateMangaPayload', manga: { __typename?: 'MangaType', id: number, inLibrary: boolean, inLibraryAt: string } } | null };

export type UpdateMangasMutationVariables = Exact<{
  input: UpdateMangasInput;
  updateCategoryInput: UpdateMangasCategoriesInput;
  updateCategories: Scalars['Boolean']['input'];
}>;


export type UpdateMangasMutation = { __typename?: 'Mutation', updateMangasCategories?: { __typename?: 'UpdateMangasCategoriesPayload', mangas: Array<{ __typename?: 'MangaType', id: number, categories: { __typename?: 'CategoryNodeList', totalCount: number, nodes: Array<{ __typename?: 'CategoryType', id: number, mangas: { __typename?: 'MangaNodeList', totalCount: number } }> } }> } | null, updateMangas?: { __typename?: 'UpdateMangasPayload', mangas: Array<{ __typename?: 'MangaType', id: number, inLibrary: boolean, inLibraryAt: string, categories: { __typename?: 'CategoryNodeList', totalCount: number, nodes: Array<{ __typename?: 'CategoryType', id: number, mangas: { __typename?: 'MangaNodeList', totalCount: number } }> } }> } | null };

export type UpdateMangaCategoriesMutationVariables = Exact<{
  input: UpdateMangaCategoriesInput;
}>;


export type UpdateMangaCategoriesMutation = { __typename?: 'Mutation', updateMangaCategories?: { __typename?: 'UpdateMangaCategoriesPayload', manga: { __typename?: 'MangaType', id: number, categories: { __typename?: 'CategoryNodeList', totalCount: number, nodes: Array<{ __typename?: 'CategoryType', id: number, mangas: { __typename?: 'MangaNodeList', totalCount: number } }> } } } | null };

export type UpdateMangasCategoriesMutationVariables = Exact<{
  input: UpdateMangasCategoriesInput;
}>;


export type UpdateMangasCategoriesMutation = { __typename?: 'Mutation', updateMangasCategories?: { __typename?: 'UpdateMangasCategoriesPayload', mangas: Array<{ __typename?: 'MangaType', id: number, categories: { __typename?: 'CategoryNodeList', totalCount: number, nodes: Array<{ __typename?: 'CategoryType', id: number, mangas: { __typename?: 'MangaNodeList', totalCount: number } }> } }> } | null };

export type UpdateWebuiMutationVariables = Exact<{
  input?: InputMaybe<WebUiUpdateInput>;
}>;


export type UpdateWebuiMutation = { __typename?: 'Mutation', updateWebUI?: { __typename?: 'WebUIUpdatePayload', updateStatus: { __typename?: 'WebUIUpdateStatus', progress: number, state: UpdateState, info: { __typename?: 'WebUIUpdateInfo', channel: string, tag: string } } } | null };

export type ResetWebuiUpdateStatusMutationVariables = Exact<{ [key: string]: never; }>;


export type ResetWebuiUpdateStatusMutation = { __typename?: 'Mutation', resetWebUIUpdateStatus?: { __typename?: 'WebUIUpdateStatus', state: UpdateState, info: { __typename?: 'WebUIUpdateInfo', channel: string, tag: string } } | null };

export type ResetServerSettingsMutationVariables = Exact<{
  input: ResetSettingsInput;
}>;


export type ResetServerSettingsMutation = { __typename?: 'Mutation', resetSettings: { __typename?: 'ResetSettingsPayload', settings: { __typename?: 'SettingsType', ip: string, port: number, socksProxyEnabled: boolean, socksProxyVersion: number, socksProxyHost: string, socksProxyPort: string, socksProxyUsername: string, socksProxyPassword: string, webUIFlavor: WebUiFlavor, initialOpenInBrowserEnabled: boolean, webUIInterface: WebUiInterface, electronPath: string, webUIChannel: WebUiChannel, webUIUpdateCheckInterval: number, downloadAsCbz: boolean, downloadsPath: string, autoDownloadNewChapters: boolean, excludeEntryWithUnreadChapters: boolean, autoDownloadNewChaptersLimit: number, autoDownloadIgnoreReUploads?: boolean | null, extensionRepos: Array<string>, maxSourcesInParallel: number, excludeUnreadChapters: boolean, excludeNotStarted: boolean, excludeCompleted: boolean, globalUpdateInterval: number, updateMangas: boolean, basicAuthEnabled: boolean, basicAuthUsername: string, basicAuthPassword: string, debugLogsEnabled: boolean, systemTrayEnabled: boolean, maxLogFileSize: string, maxLogFiles: number, maxLogFolderSize: string, backupPath: string, backupTime: string, backupInterval: number, backupTTL: number, localSourcePath: string, flareSolverrEnabled: boolean, flareSolverrUrl: string, flareSolverrTimeout: number, flareSolverrSessionName: string, flareSolverrSessionTtl: number, flareSolverrAsResponseFallback: boolean } } };

export type UpdateServerSettingsMutationVariables = Exact<{
  input: SetSettingsInput;
}>;


export type UpdateServerSettingsMutation = { __typename?: 'Mutation', setSettings: { __typename?: 'SetSettingsPayload', settings: { __typename?: 'SettingsType', ip: string, port: number, socksProxyEnabled: boolean, socksProxyVersion: number, socksProxyHost: string, socksProxyPort: string, socksProxyUsername: string, socksProxyPassword: string, webUIFlavor: WebUiFlavor, initialOpenInBrowserEnabled: boolean, webUIInterface: WebUiInterface, electronPath: string, webUIChannel: WebUiChannel, webUIUpdateCheckInterval: number, downloadAsCbz: boolean, downloadsPath: string, autoDownloadNewChapters: boolean, excludeEntryWithUnreadChapters: boolean, autoDownloadNewChaptersLimit: number, autoDownloadIgnoreReUploads?: boolean | null, extensionRepos: Array<string>, maxSourcesInParallel: number, excludeUnreadChapters: boolean, excludeNotStarted: boolean, excludeCompleted: boolean, globalUpdateInterval: number, updateMangas: boolean, basicAuthEnabled: boolean, basicAuthUsername: string, basicAuthPassword: string, debugLogsEnabled: boolean, systemTrayEnabled: boolean, maxLogFileSize: string, maxLogFiles: number, maxLogFolderSize: string, backupPath: string, backupTime: string, backupInterval: number, backupTTL: number, localSourcePath: string, flareSolverrEnabled: boolean, flareSolverrUrl: string, flareSolverrTimeout: number, flareSolverrSessionName: string, flareSolverrSessionTtl: number, flareSolverrAsResponseFallback: boolean } } };

export type GetSourceMangasFetchMutationVariables = Exact<{
  input: FetchSourceMangaInput;
}>;


export type GetSourceMangasFetchMutation = { __typename?: 'Mutation', fetchSourceManga?: { __typename?: 'FetchSourceMangaPayload', hasNextPage: boolean, mangas: Array<{ __typename?: 'MangaType', id: number, title: string, thumbnailUrl?: string | null, thumbnailUrlLastFetched?: string | null, inLibrary: boolean, initialized: boolean, sourceId: string }> } | null };

export type UpdateSourcePreferencesMutationVariables = Exact<{
  input: UpdateSourcePreferenceInput;
}>;


export type UpdateSourcePreferencesMutation = { __typename?: 'Mutation', updateSourcePreference?: { __typename?: 'UpdateSourcePreferencePayload', source: { __typename?: 'SourceType', id: string, name: string, displayName: string, preferences: Array<{ __typename?: 'CheckBoxPreference', summary?: string | null, key: string, type: 'CheckBoxPreference', CheckBoxCheckBoxCurrentValue?: boolean | null, CheckBoxDefault: boolean, CheckBoxTitle: string } | { __typename?: 'EditTextPreference', text?: string | null, summary?: string | null, key: string, dialogTitle?: string | null, dialogMessage?: string | null, type: 'EditTextPreference', EditTextPreferenceCurrentValue?: string | null, EditTextPreferenceDefault?: string | null, EditTextPreferenceTitle?: string | null } | { __typename?: 'ListPreference', summary?: string | null, key: string, entryValues: Array<string>, entries: Array<string>, type: 'ListPreference', ListPreferenceCurrentValue?: string | null, ListPreferenceDefault?: string | null, ListPreferenceTitle?: string | null } | { __typename?: 'MultiSelectListPreference', dialogMessage?: string | null, dialogTitle?: string | null, summary?: string | null, key: string, entryValues: Array<string>, entries: Array<string>, type: 'MultiSelectListPreference', MultiSelectListPreferenceTitle?: string | null, MultiSelectListPreferenceDefault?: Array<string> | null, MultiSelectListPreferenceCurrentValue?: Array<string> | null } | { __typename?: 'SwitchPreference', summary?: string | null, key: string, type: 'SwitchPreference', SwitchPreferenceCurrentValue?: boolean | null, SwitchPreferenceDefault: boolean, SwitchPreferenceTitle: string }> } } | null };

export type SetSourceMetadataMutationVariables = Exact<{
  input: SetSourceMetaInput;
}>;


export type SetSourceMetadataMutation = { __typename?: 'Mutation', setSourceMeta?: { __typename?: 'SetSourceMetaPayload', meta: { __typename?: 'SourceMetaType', sourceId: string, key: string, value: string } } | null };

export type DeleteSourceMetadataMutationVariables = Exact<{
  input: DeleteSourceMetaInput;
}>;


export type DeleteSourceMetadataMutation = { __typename?: 'Mutation', deleteSourceMeta?: { __typename?: 'DeleteSourceMetaPayload', meta?: { __typename?: 'SourceMetaType', sourceId: string, key: string, value: string } | null } | null };

export type TrackerLoginOauthMutationVariables = Exact<{
  input: LoginTrackerOAuthInput;
}>;


export type TrackerLoginOauthMutation = { __typename?: 'Mutation', loginTrackerOAuth: { __typename?: 'LoginTrackerOAuthPayload', tracker: { __typename?: 'TrackerType', authUrl?: string | null, id: number, name: string, icon: string, isLoggedIn: boolean, isTokenExpired: boolean } } };

export type TrackerLoginCredentialsMutationVariables = Exact<{
  input: LoginTrackerCredentialsInput;
}>;


export type TrackerLoginCredentialsMutation = { __typename?: 'Mutation', loginTrackerCredentials: { __typename?: 'LoginTrackerCredentialsPayload', isLoggedIn: boolean, tracker: { __typename?: 'TrackerType', authUrl?: string | null, id: number, name: string, icon: string, isLoggedIn: boolean, isTokenExpired: boolean } } };

export type TrackerLogoutMutationVariables = Exact<{
  trackerId: Scalars['Int']['input'];
}>;


export type TrackerLogoutMutation = { __typename?: 'Mutation', logoutTracker: { __typename?: 'LogoutTrackerPayload', tracker: { __typename?: 'TrackerType', authUrl?: string | null, id: number, name: string, icon: string, isLoggedIn: boolean, isTokenExpired: boolean } } };

export type TrackerBindMutationVariables = Exact<{
  mangaId: Scalars['Int']['input'];
  remoteId: Scalars['LongString']['input'];
  trackerId: Scalars['Int']['input'];
}>;


export type TrackerBindMutation = { __typename?: 'Mutation', bindTrack: { __typename?: 'BindTrackPayload', trackRecord: { __typename?: 'TrackRecordType', id: number, remoteId: string, trackerId: number, remoteUrl: string, title: string, status: number, lastChapterRead: number, totalChapters: number, score: number, displayScore: string, startDate: string, finishDate: string, manga: { __typename?: 'MangaType', id: number, trackRecords: { __typename?: 'TrackRecordNodeList', totalCount: number, nodes: Array<{ __typename?: 'TrackRecordType', id: number, trackerId: number }> } } } } };

export type TrackerUnbindMutationVariables = Exact<{
  input: UnbindTrackInput;
}>;


export type TrackerUnbindMutation = { __typename?: 'Mutation', unbindTrack: { __typename?: 'UnbindTrackPayload', trackRecord?: { __typename?: 'TrackRecordType', id: number, manga: { __typename?: 'MangaType', id: number, trackRecords: { __typename?: 'TrackRecordNodeList', totalCount: number, nodes: Array<{ __typename?: 'TrackRecordType', id: number, trackerId: number }> } } } | null } };

export type TrackerUpdateBindMutationVariables = Exact<{
  input: UpdateTrackInput;
}>;


export type TrackerUpdateBindMutation = { __typename?: 'Mutation', updateTrack: { __typename?: 'UpdateTrackPayload', trackRecord?: { __typename?: 'TrackRecordType', id: number, remoteId: string, trackerId: number, remoteUrl: string, title: string, status: number, lastChapterRead: number, totalChapters: number, score: number, displayScore: string, startDate: string, finishDate: string, manga: { __typename?: 'MangaType', id: number, trackRecords: { __typename?: 'TrackRecordNodeList', totalCount: number, nodes: Array<{ __typename?: 'TrackRecordType', id: number, trackerId: number }> } } } | null } };

export type TrackerFetchBindMutationVariables = Exact<{
  recordId: Scalars['Int']['input'];
}>;


export type TrackerFetchBindMutation = { __typename?: 'Mutation', fetchTrack: { __typename?: 'FetchTrackPayload', trackRecord: { __typename?: 'TrackRecordType', id: number, remoteId: string, trackerId: number, remoteUrl: string, title: string, status: number, lastChapterRead: number, totalChapters: number, score: number, displayScore: string, startDate: string, finishDate: string } } };

export type UpdateCategoryMangasMutationVariables = Exact<{
  input: UpdateCategoryMangaInput;
}>;


export type UpdateCategoryMangasMutation = { __typename?: 'Mutation', updateCategoryManga?: { __typename?: 'UpdateCategoryMangaPayload', updateStatus: { __typename?: 'UpdateStatus', isRunning: boolean } } | null };

export type UpdateLibraryMangasMutationVariables = Exact<{
  input?: InputMaybe<UpdateLibraryMangaInput>;
}>;


export type UpdateLibraryMangasMutation = { __typename?: 'Mutation', updateLibraryManga?: { __typename?: 'UpdateLibraryMangaPayload', updateStatus: { __typename?: 'UpdateStatus', isRunning: boolean } } | null };

export type StopUpdaterMutationVariables = Exact<{
  input?: InputMaybe<UpdateStopInput>;
}>;


export type StopUpdaterMutation = { __typename?: 'Mutation', updateStop: { __typename?: 'UpdateStopPayload', clientMutationId?: string | null } };

export type ValidateBackupQueryVariables = Exact<{
  backup: Scalars['Upload']['input'];
}>;


export type ValidateBackupQuery = { __typename?: 'Query', validateBackup: { __typename?: 'ValidateBackupResult', missingSources: Array<{ __typename?: 'ValidateBackupSource', id: string, name: string }>, missingTrackers: Array<{ __typename?: 'ValidateBackupTracker', name: string }> } };

export type GetRestoreStatusQueryVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type GetRestoreStatusQuery = { __typename?: 'Query', restoreStatus?: { __typename?: 'BackupRestoreStatus', mangaProgress: number, state: BackupRestoreState, totalManga: number } | null };

export type GetCategoriesBaseQueryVariables = Exact<{
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  condition?: InputMaybe<CategoryConditionInput>;
  filter?: InputMaybe<CategoryFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<Array<CategoryOrderInput> | CategoryOrderInput>;
}>;


export type GetCategoriesBaseQuery = { __typename?: 'Query', categories: { __typename?: 'CategoryNodeList', totalCount: number, nodes: Array<{ __typename?: 'CategoryType', id: number, name: string, default: boolean, order: number }>, pageInfo: { __typename?: 'PageInfo', endCursor?: string | null, hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null } } };

export type GetCategoriesLibraryQueryVariables = Exact<{
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  condition?: InputMaybe<CategoryConditionInput>;
  filter?: InputMaybe<CategoryFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<Array<CategoryOrderInput> | CategoryOrderInput>;
}>;


export type GetCategoriesLibraryQuery = { __typename?: 'Query', categories: { __typename?: 'CategoryNodeList', totalCount: number, nodes: Array<{ __typename?: 'CategoryType', id: number, name: string, default: boolean, order: number, meta: Array<{ __typename?: 'CategoryMetaType', categoryId: number, key: string, value: string }>, mangas: { __typename?: 'MangaNodeList', totalCount: number } }>, pageInfo: { __typename?: 'PageInfo', endCursor?: string | null, hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null } } };

export type GetCategoriesSettingsQueryVariables = Exact<{
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  condition?: InputMaybe<CategoryConditionInput>;
  filter?: InputMaybe<CategoryFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<Array<CategoryOrderInput> | CategoryOrderInput>;
}>;


export type GetCategoriesSettingsQuery = { __typename?: 'Query', categories: { __typename?: 'CategoryNodeList', totalCount: number, nodes: Array<{ __typename?: 'CategoryType', includeInUpdate: IncludeOrExclude, includeInDownload: IncludeOrExclude, id: number, name: string, default: boolean, order: number }>, pageInfo: { __typename?: 'PageInfo', endCursor?: string | null, hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null } } };

export type GetCategoryMangasQueryVariables = Exact<{
  id: Scalars['Int']['input'];
}>;


export type GetCategoryMangasQuery = { __typename?: 'Query', category: { __typename?: 'CategoryType', id: number, mangas: { __typename?: 'MangaNodeList', totalCount: number, nodes: Array<{ __typename?: 'MangaType', genre: Array<string>, lastFetchedAt?: string | null, inLibraryAt: string, status: MangaStatus, artist?: string | null, author?: string | null, description?: string | null, id: number, title: string, thumbnailUrl?: string | null, thumbnailUrlLastFetched?: string | null, inLibrary: boolean, initialized: boolean, sourceId: string, unreadCount: number, downloadCount: number, bookmarkCount: number, hasDuplicateChapters: boolean, source?: { __typename?: 'SourceType', id: string, displayName: string } | null, trackRecords: { __typename?: 'TrackRecordNodeList', totalCount: number, nodes: Array<{ __typename?: 'TrackRecordType', id: number, trackerId: number }> }, chapters: { __typename?: 'ChapterNodeList', totalCount: number }, firstUnreadChapter?: { __typename?: 'ChapterType', id: number, sourceOrder: number, isRead: boolean, mangaId: number } | null, lastReadChapter?: { __typename?: 'ChapterType', id: number, sourceOrder: number, lastReadAt: string } | null, latestReadChapter?: { __typename?: 'ChapterType', id: number, sourceOrder: number, lastReadAt: string } | null, latestFetchedChapter?: { __typename?: 'ChapterType', id: number, fetchedAt: string } | null, latestUploadedChapter?: { __typename?: 'ChapterType', id: number, uploadDate: string } | null }>, pageInfo: { __typename?: 'PageInfo', endCursor?: string | null, hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null } } } };

export type GetChaptersReaderQueryVariables = Exact<{
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  condition?: InputMaybe<ChapterConditionInput>;
  filter?: InputMaybe<ChapterFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<Array<ChapterOrderInput> | ChapterOrderInput>;
}>;


export type GetChaptersReaderQuery = { __typename?: 'Query', chapters: { __typename?: 'ChapterNodeList', totalCount: number, nodes: Array<{ __typename?: 'ChapterType', uploadDate: string, lastPageRead: number, pageCount: number, id: number, name: string, mangaId: number, scanlator?: string | null, realUrl?: string | null, sourceOrder: number, chapterNumber: number, isRead: boolean, isDownloaded: boolean, isBookmarked: boolean }>, pageInfo: { __typename?: 'PageInfo', endCursor?: string | null, hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null } } };

export type GetChaptersMangaQueryVariables = Exact<{
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  condition?: InputMaybe<ChapterConditionInput>;
  filter?: InputMaybe<ChapterFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<Array<ChapterOrderInput> | ChapterOrderInput>;
}>;


export type GetChaptersMangaQuery = { __typename?: 'Query', chapters: { __typename?: 'ChapterNodeList', totalCount: number, nodes: Array<{ __typename?: 'ChapterType', fetchedAt: string, uploadDate: string, id: number, name: string, mangaId: number, scanlator?: string | null, realUrl?: string | null, sourceOrder: number, chapterNumber: number, isRead: boolean, isDownloaded: boolean, isBookmarked: boolean }>, pageInfo: { __typename?: 'PageInfo', endCursor?: string | null, hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null } } };

export type GetChaptersUpdatesQueryVariables = Exact<{
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  condition?: InputMaybe<ChapterConditionInput>;
  filter?: InputMaybe<ChapterFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<Array<ChapterOrderInput> | ChapterOrderInput>;
}>;

export type GetChaptersUpdatesQuery = { __typename?: 'Query', chapters: { __typename?: 'ChapterNodeList', totalCount: number, nodes: Array<{ __typename?: 'ChapterType', fetchedAt: string, uploadDate: string, id: number, name: string, mangaId: number, scanlator?: string | null, realUrl?: string | null, sourceOrder: number, chapterNumber: number, isRead: boolean, isDownloaded: boolean, isBookmarked: boolean, manga: { __typename?: 'MangaType', id: number, title: string, thumbnailUrl?: string | null, thumbnailUrlLastFetched?: string | null, inLibrary: boolean, initialized: boolean, sourceId: string } }>, pageInfo: { __typename?: 'PageInfo', endCursor?: string | null, hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null } } };

export type GetChaptersHistoryQueryVariables = Exact<{
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  condition?: InputMaybe<ChapterConditionInput>;
  filter?: InputMaybe<ChapterFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<Array<ChapterOrderInput> | ChapterOrderInput>;
}>;

export type GetChaptersHistoryQuery = { __typename?: 'Query', chapters: { __typename?: 'ChapterNodeList', totalCount: number, nodes: Array<{ __typename?: 'ChapterType', lastReadAt: string, lastPageRead: number, pageCount: number, uploadDate: string, id: number, name: string, mangaId: number, scanlator?: string | null, realUrl?: string | null, sourceOrder: number, chapterNumber: number, isRead: boolean, isDownloaded: boolean, isBookmarked: boolean, manga: { __typename?: 'MangaType', id: number, title: string, thumbnailUrl?: string | null, thumbnailUrlLastFetched?: string | null, inLibrary: boolean, initialized: boolean, sourceId: string } }>, pageInfo: { __typename?: 'PageInfo', endCursor?: string | null, hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null } } };

export type GetMangasChapterIdsWithStateQueryVariables = Exact<{
  mangaIds: Array<Scalars['Int']['input']> | Scalars['Int']['input'];
  isDownloaded?: InputMaybe<Scalars['Boolean']['input']>;
  isRead?: InputMaybe<Scalars['Boolean']['input']>;
  isBookmarked?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type GetMangasChapterIdsWithStateQuery = { __typename?: 'Query', chapters: { __typename?: 'ChapterNodeList', nodes: Array<{ __typename?: 'ChapterType', mangaId: number, scanlator?: string | null, chapterNumber: number, id: number, isRead: boolean, isDownloaded: boolean, isBookmarked: boolean }> } };

export type GetDownloadStatusQueryVariables = Exact<{ [key: string]: never; }>;


export type GetDownloadStatusQuery = { __typename?: 'Query', downloadStatus: { __typename?: 'DownloadStatus', state: DownloaderState, queue: Array<{ __typename?: 'DownloadType', progress: number, state: DownloadState, tries: number, chapter: { __typename?: 'ChapterType', id: number, name: string, sourceOrder: number, isDownloaded: boolean }, manga: { __typename?: 'MangaType', id: number, title: string, downloadCount: number } }> } };

export type GetExtensionsQueryVariables = Exact<{
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  condition?: InputMaybe<ExtensionConditionInput>;
  filter?: InputMaybe<ExtensionFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<Array<ExtensionOrderInput> | ExtensionOrderInput>;
}>;


export type GetExtensionsQuery = { __typename?: 'Query', extensions: { __typename?: 'ExtensionNodeList', totalCount: number, nodes: Array<{ __typename?: 'ExtensionType', pkgName: string, name: string, lang: string, versionCode: number, versionName: string, iconUrl: string, repo?: string | null, isNsfw: boolean, isInstalled: boolean, isObsolete: boolean, hasUpdate: boolean }>, pageInfo: { __typename?: 'PageInfo', endCursor?: string | null, hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null } } };

export type GetGlobalMetadataQueryVariables = Exact<{
  key: Scalars['String']['input'];
}>;


export type GetGlobalMetadataQuery = { __typename?: 'Query', meta: { __typename?: 'GlobalMetaType', key: string, value: string } };

export type GetGlobalMetadatasQueryVariables = Exact<{
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  condition?: InputMaybe<MetaConditionInput>;
  filter?: InputMaybe<MetaFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<Array<MetaOrderInput> | MetaOrderInput>;
}>;


export type GetGlobalMetadatasQuery = { __typename?: 'Query', metas: { __typename?: 'GlobalMetaNodeList', totalCount: number, nodes: Array<{ __typename?: 'GlobalMetaType', key: string, value: string }>, pageInfo: { __typename?: 'PageInfo', endCursor?: string | null, hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null } } };

export type GetMangaScreenQueryVariables = Exact<{
  id: Scalars['Int']['input'];
}>;


export type GetMangaScreenQuery = { __typename?: 'Query', manga: { __typename?: 'MangaType', artist?: string | null, author?: string | null, description?: string | null, status: MangaStatus, realUrl?: string | null, sourceId: string, genre: Array<string>, lastFetchedAt?: string | null, inLibraryAt: string, id: number, title: string, thumbnailUrl?: string | null, thumbnailUrlLastFetched?: string | null, inLibrary: boolean, initialized: boolean, unreadCount: number, downloadCount: number, bookmarkCount: number, hasDuplicateChapters: boolean, source?: { __typename?: 'SourceType', id: string, displayName: string } | null, trackRecords: { __typename?: 'TrackRecordNodeList', totalCount: number, nodes: Array<{ __typename?: 'TrackRecordType', id: number, trackerId: number }> }, chapters: { __typename?: 'ChapterNodeList', totalCount: number }, firstUnreadChapter?: { __typename?: 'ChapterType', id: number, sourceOrder: number, isRead: boolean, mangaId: number } | null, lastReadChapter?: { __typename?: 'ChapterType', id: number, sourceOrder: number, lastReadAt: string } | null, latestReadChapter?: { __typename?: 'ChapterType', id: number, sourceOrder: number, lastReadAt: string } | null, latestFetchedChapter?: { __typename?: 'ChapterType', id: number, fetchedAt: string } | null, latestUploadedChapter?: { __typename?: 'ChapterType', id: number, uploadDate: string } | null } };

export type GetMangaReaderQueryVariables = Exact<{
  id: Scalars['Int']['input'];
}>;


export type GetMangaReaderQuery = { __typename?: 'Query', manga: { __typename?: 'MangaType', genre: Array<string>, id: number, title: string, thumbnailUrl?: string | null, thumbnailUrlLastFetched?: string | null, inLibrary: boolean, initialized: boolean, sourceId: string, source?: { __typename?: 'SourceType', id: string, name: string, displayName: string } | null, meta: Array<{ __typename?: 'MangaMetaType', mangaId: number, key: string, value: string }>, chapters: { __typename?: 'ChapterNodeList', totalCount: number }, trackRecords: { __typename?: 'TrackRecordNodeList', totalCount: number } } };

export type GetMangaTrackRecordsQueryVariables = Exact<{
  id: Scalars['Int']['input'];
}>;


export type GetMangaTrackRecordsQuery = { __typename?: 'Query', manga: { __typename?: 'MangaType', id: number, trackRecords: { __typename?: 'TrackRecordNodeList', totalCount: number, nodes: Array<{ __typename?: 'TrackRecordType', id: number, remoteId: string, trackerId: number, remoteUrl: string, title: string, status: number, lastChapterRead: number, totalChapters: number, score: number, displayScore: string, startDate: string, finishDate: string }> } } };

export type GetMangaCategoriesQueryVariables = Exact<{
  id: Scalars['Int']['input'];
}>;


export type GetMangaCategoriesQuery = { __typename?: 'Query', manga: { __typename?: 'MangaType', id: number, categories: { __typename?: 'CategoryNodeList', totalCount: number, nodes: Array<{ __typename?: 'CategoryType', id: number }> } } };

export type GetMangaToMigrateQueryVariables = Exact<{
  id: Scalars['Int']['input'];
  getChapterData: Scalars['Boolean']['input'];
  migrateCategories: Scalars['Boolean']['input'];
  migrateTracking: Scalars['Boolean']['input'];
}>;


export type GetMangaToMigrateQuery = { __typename?: 'Query', manga: { __typename?: 'MangaType', id: number, inLibrary: boolean, title: string, chapters?: { __typename?: 'ChapterNodeList', totalCount: number, nodes: Array<{ __typename?: 'ChapterType', id: number, chapterNumber: number, isRead: boolean, isDownloaded: boolean, isBookmarked: boolean, manga: { __typename?: 'MangaType', id: number } }> }, categories?: { __typename?: 'CategoryNodeList', nodes: Array<{ __typename?: 'CategoryType', id: number }> }, trackRecords?: { __typename?: 'TrackRecordNodeList', nodes: Array<{ __typename?: 'TrackRecordType', id: number, remoteId: string, trackerId: number }> } } };

export type GetMangasBaseQueryVariables = Exact<{
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  condition?: InputMaybe<MangaConditionInput>;
  filter?: InputMaybe<MangaFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<Array<MangaOrderInput> | MangaOrderInput>;
}>;


export type GetMangasBaseQuery = { __typename?: 'Query', mangas: { __typename?: 'MangaNodeList', totalCount: number, nodes: Array<{ __typename?: 'MangaType', id: number, title: string, thumbnailUrl?: string | null, thumbnailUrlLastFetched?: string | null, inLibrary: boolean, initialized: boolean, sourceId: string }>, pageInfo: { __typename?: 'PageInfo', endCursor?: string | null, hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null } } };

export type GetMangasLibraryQueryVariables = Exact<{
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  condition?: InputMaybe<MangaConditionInput>;
  filter?: InputMaybe<MangaFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<Array<MangaOrderInput> | MangaOrderInput>;
}>;


export type GetMangasLibraryQuery = { __typename?: 'Query', mangas: { __typename?: 'MangaNodeList', totalCount: number, nodes: Array<{ __typename?: 'MangaType', genre: Array<string>, lastFetchedAt?: string | null, inLibraryAt: string, status: MangaStatus, artist?: string | null, author?: string | null, description?: string | null, id: number, title: string, thumbnailUrl?: string | null, thumbnailUrlLastFetched?: string | null, inLibrary: boolean, initialized: boolean, sourceId: string, unreadCount: number, downloadCount: number, bookmarkCount: number, hasDuplicateChapters: boolean, source?: { __typename?: 'SourceType', id: string, displayName: string } | null, trackRecords: { __typename?: 'TrackRecordNodeList', totalCount: number, nodes: Array<{ __typename?: 'TrackRecordType', id: number, trackerId: number }> }, chapters: { __typename?: 'ChapterNodeList', totalCount: number }, firstUnreadChapter?: { __typename?: 'ChapterType', id: number, sourceOrder: number, isRead: boolean, mangaId: number } | null, lastReadChapter?: { __typename?: 'ChapterType', id: number, sourceOrder: number, lastReadAt: string } | null, latestReadChapter?: { __typename?: 'ChapterType', id: number, sourceOrder: number, lastReadAt: string } | null, latestFetchedChapter?: { __typename?: 'ChapterType', id: number, fetchedAt: string } | null, latestUploadedChapter?: { __typename?: 'ChapterType', id: number, uploadDate: string } | null }>, pageInfo: { __typename?: 'PageInfo', endCursor?: string | null, hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null } } };

export type GetMangasDuplicatesQueryVariables = Exact<{
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  condition?: InputMaybe<MangaConditionInput>;
  filter?: InputMaybe<MangaFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<Array<MangaOrderInput> | MangaOrderInput>;
}>;


export type GetMangasDuplicatesQuery = { __typename?: 'Query', mangas: { __typename?: 'MangaNodeList', totalCount: number, nodes: Array<{ __typename?: 'MangaType', description?: string | null, id: number, title: string, thumbnailUrl?: string | null, thumbnailUrlLastFetched?: string | null, inLibrary: boolean, initialized: boolean, sourceId: string, unreadCount: number, downloadCount: number, bookmarkCount: number, hasDuplicateChapters: boolean, chapters: { __typename?: 'ChapterNodeList', totalCount: number } }>, pageInfo: { __typename?: 'PageInfo', endCursor?: string | null, hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null } } };

export type GetMigratableSourceMangasQueryVariables = Exact<{
  sourceId: Scalars['LongString']['input'];
}>;


export type GetMigratableSourceMangasQuery = { __typename?: 'Query', mangas: { __typename?: 'MangaNodeList', nodes: Array<{ __typename?: 'MangaType', id: number, title: string, thumbnailUrl?: string | null, sourceId: string, categories: { __typename?: 'CategoryNodeList', nodes: Array<{ __typename?: 'CategoryType', id: number }> } }> } };

export type GetLibraryMangaCountQueryVariables = Exact<{ [key: string]: never; }>;


export type GetLibraryMangaCountQuery = { __typename?: 'Query', mangas: { __typename?: 'MangaNodeList', totalCount: number } };

export type GetAboutQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAboutQuery = { __typename?: 'Query', aboutServer: { __typename?: 'AboutServerPayload', buildTime: string, buildType: string, discord: string, github: string, name: string, revision: string, version: string }, aboutWebUI: { __typename?: 'AboutWebUI', channel: string, tag: string } };

export type CheckForServerUpdatesQueryVariables = Exact<{ [key: string]: never; }>;


export type CheckForServerUpdatesQuery = { __typename?: 'Query', checkForServerUpdates: Array<{ __typename?: 'CheckForServerUpdatesPayload', channel: string, tag: string, url: string }> };

export type CheckForWebuiUpdateQueryVariables = Exact<{ [key: string]: never; }>;


export type CheckForWebuiUpdateQuery = { __typename?: 'Query', checkForWebUIUpdate: { __typename?: 'WebUIUpdateCheck', channel: string, tag: string, updateAvailable: boolean } };

export type GetWebuiUpdateStatusQueryVariables = Exact<{ [key: string]: never; }>;


export type GetWebuiUpdateStatusQuery = { __typename?: 'Query', getWebUIUpdateStatus: { __typename?: 'WebUIUpdateStatus', progress: number, state: UpdateState, info: { __typename?: 'WebUIUpdateInfo', channel: string, tag: string } } };

export type GetServerSettingsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetServerSettingsQuery = { __typename?: 'Query', settings: { __typename?: 'SettingsType', ip: string, port: number, socksProxyEnabled: boolean, socksProxyVersion: number, socksProxyHost: string, socksProxyPort: string, socksProxyUsername: string, socksProxyPassword: string, webUIFlavor: WebUiFlavor, initialOpenInBrowserEnabled: boolean, webUIInterface: WebUiInterface, electronPath: string, webUIChannel: WebUiChannel, webUIUpdateCheckInterval: number, downloadAsCbz: boolean, downloadsPath: string, autoDownloadNewChapters: boolean, excludeEntryWithUnreadChapters: boolean, autoDownloadNewChaptersLimit: number, autoDownloadIgnoreReUploads?: boolean | null, extensionRepos: Array<string>, maxSourcesInParallel: number, excludeUnreadChapters: boolean, excludeNotStarted: boolean, excludeCompleted: boolean, globalUpdateInterval: number, updateMangas: boolean, basicAuthEnabled: boolean, basicAuthUsername: string, basicAuthPassword: string, debugLogsEnabled: boolean, systemTrayEnabled: boolean, maxLogFileSize: string, maxLogFiles: number, maxLogFolderSize: string, backupPath: string, backupTime: string, backupInterval: number, backupTTL: number, localSourcePath: string, flareSolverrEnabled: boolean, flareSolverrUrl: string, flareSolverrTimeout: number, flareSolverrSessionName: string, flareSolverrSessionTtl: number, flareSolverrAsResponseFallback: boolean } };

export type GetSourceBrowseQueryVariables = Exact<{
  id: Scalars['LongString']['input'];
}>;


export type GetSourceBrowseQuery = { __typename?: 'Query', source: { __typename?: 'SourceType', isConfigurable: boolean, supportsLatest: boolean, id: string, name: string, displayName: string, meta: Array<{ __typename?: 'SourceMetaType', sourceId: string, key: string, value: string }>, filters: Array<{ __typename?: 'CheckBoxFilter', name: string, type: 'CheckBoxFilter', CheckBoxFilterDefault: boolean } | { __typename?: 'GroupFilter', name: string, type: 'GroupFilter', filters: Array<{ __typename?: 'CheckBoxFilter', name: string, type: 'CheckBoxFilter', CheckBoxFilterDefault: boolean } | { __typename?: 'GroupFilter' } | { __typename?: 'HeaderFilter', name: string, type: 'HeaderFilter' } | { __typename?: 'SelectFilter', name: string, values: Array<string>, type: 'SelectFilter', SelectFilterDefault: number } | { __typename?: 'SeparatorFilter', name: string, type: 'SeparatorFilter' } | { __typename?: 'SortFilter', name: string, values: Array<string>, type: 'SortFilter', SortFilterDefault?: { __typename?: 'SortSelection', ascending: boolean, index: number } | null } | { __typename?: 'TextFilter', name: string, type: 'TextFilter', TextFilterDefault: string } | { __typename?: 'TriStateFilter', name: string, type: 'TriStateFilter', TriStateFilterDefault: TriState }> } | { __typename?: 'HeaderFilter', name: string, type: 'HeaderFilter' } | { __typename?: 'SelectFilter', name: string, values: Array<string>, type: 'SelectFilter', SelectFilterDefault: number } | { __typename?: 'SeparatorFilter', name: string, type: 'SeparatorFilter' } | { __typename?: 'SortFilter', name: string, values: Array<string>, type: 'SortFilter', SortFilterDefault?: { __typename?: 'SortSelection', ascending: boolean, index: number } | null } | { __typename?: 'TextFilter', name: string, type: 'TextFilter', TextFilterDefault: string } | { __typename?: 'TriStateFilter', name: string, type: 'TriStateFilter', TriStateFilterDefault: TriState }> } };

export type GetSourceSettingsQueryVariables = Exact<{
  id: Scalars['LongString']['input'];
}>;


export type GetSourceSettingsQuery = { __typename?: 'Query', source: { __typename?: 'SourceType', id: string, name: string, displayName: string, preferences: Array<{ __typename?: 'CheckBoxPreference', summary?: string | null, key: string, type: 'CheckBoxPreference', CheckBoxCheckBoxCurrentValue?: boolean | null, CheckBoxDefault: boolean, CheckBoxTitle: string } | { __typename?: 'EditTextPreference', text?: string | null, summary?: string | null, key: string, dialogTitle?: string | null, dialogMessage?: string | null, type: 'EditTextPreference', EditTextPreferenceCurrentValue?: string | null, EditTextPreferenceDefault?: string | null, EditTextPreferenceTitle?: string | null } | { __typename?: 'ListPreference', summary?: string | null, key: string, entryValues: Array<string>, entries: Array<string>, type: 'ListPreference', ListPreferenceCurrentValue?: string | null, ListPreferenceDefault?: string | null, ListPreferenceTitle?: string | null } | { __typename?: 'MultiSelectListPreference', dialogMessage?: string | null, dialogTitle?: string | null, summary?: string | null, key: string, entryValues: Array<string>, entries: Array<string>, type: 'MultiSelectListPreference', MultiSelectListPreferenceTitle?: string | null, MultiSelectListPreferenceDefault?: Array<string> | null, MultiSelectListPreferenceCurrentValue?: Array<string> | null } | { __typename?: 'SwitchPreference', summary?: string | null, key: string, type: 'SwitchPreference', SwitchPreferenceCurrentValue?: boolean | null, SwitchPreferenceDefault: boolean, SwitchPreferenceTitle: string }> } };

export type GetSourceMigratableQueryVariables = Exact<{
  id: Scalars['LongString']['input'];
}>;


export type GetSourceMigratableQuery = { __typename?: 'Query', source: { __typename?: 'SourceType', lang: string, iconUrl: string, id: string, name: string, displayName: string } };

export type GetSourcesListQueryVariables = Exact<{ [key: string]: never; }>;


export type GetSourcesListQuery = { __typename?: 'Query', sources: { __typename?: 'SourceNodeList', nodes: Array<{ __typename?: 'SourceType', lang: string, iconUrl: string, isNsfw: boolean, supportsLatest: boolean, id: string, name: string, displayName: string, extension: { __typename?: 'ExtensionType', pkgName: string, repo?: string | null } }> } };

export type GetMigratableSourcesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetMigratableSourcesQuery = { __typename?: 'Query', mangas: { __typename?: 'MangaNodeList', nodes: Array<{ __typename?: 'MangaType', sourceId: string, source?: { __typename?: 'SourceType', lang: string, iconUrl: string, id: string, name: string, displayName: string } | null }> } };

export type GetTrackersSettingsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetTrackersSettingsQuery = { __typename?: 'Query', trackers: { __typename?: 'TrackerNodeList', totalCount: number, pageInfo: { __typename?: 'PageInfo', endCursor?: string | null, hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null }, nodes: Array<{ __typename?: 'TrackerType', authUrl?: string | null, id: number, name: string, icon: string, isLoggedIn: boolean, isTokenExpired: boolean }> } };

export type GetTrackersBindQueryVariables = Exact<{ [key: string]: never; }>;


export type GetTrackersBindQuery = { __typename?: 'Query', trackers: { __typename?: 'TrackerNodeList', totalCount: number, pageInfo: { __typename?: 'PageInfo', endCursor?: string | null, hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null }, nodes: Array<{ __typename?: 'TrackerType', icon: string, supportsTrackDeletion?: boolean | null, scores: Array<string>, id: number, name: string, isLoggedIn: boolean, isTokenExpired: boolean, statuses: Array<{ __typename?: 'TrackStatusType', name: string, value: number }>, trackRecords: { __typename?: 'TrackRecordNodeList', nodes: Array<{ __typename?: 'TrackRecordType', id: number, remoteId: string, trackerId: number, remoteUrl: string, title: string, status: number, lastChapterRead: number, totalChapters: number, score: number, displayScore: string, startDate: string, finishDate: string }> } }> } };

export type TrackerSearchQueryVariables = Exact<{
  query: Scalars['String']['input'];
  trackerId: Scalars['Int']['input'];
}>;


export type TrackerSearchQuery = { __typename?: 'Query', searchTracker: { __typename?: 'SearchTrackerPayload', trackSearches: Array<{ __typename?: 'TrackSearchType', id: number, remoteId: string, title: string, trackingUrl: string, coverUrl: string, publishingType: string, startDate: string, publishingStatus: string, summary: string }> } };

export type GetUpdateStatusQueryVariables = Exact<{ [key: string]: never; }>;


export type GetUpdateStatusQuery = { __typename?: 'Query', updateStatus: { __typename?: 'UpdateStatus', isRunning: boolean, completeJobs: { __typename?: 'UpdateStatusType', mangas: { __typename?: 'MangaNodeList', totalCount: number, nodes: Array<{ __typename?: 'MangaType', id: number, unreadCount: number, downloadCount: number, bookmarkCount: number, hasDuplicateChapters: boolean, firstUnreadChapter?: { __typename?: 'ChapterType', id: number, sourceOrder: number } | null, lastReadChapter?: { __typename?: 'ChapterType', id: number, sourceOrder: number, lastReadAt: string } | null, latestReadChapter?: { __typename?: 'ChapterType', id: number, sourceOrder: number, lastReadAt: string } | null, latestFetchedChapter?: { __typename?: 'ChapterType', id: number, fetchedAt: string } | null, latestUploadedChapter?: { __typename?: 'ChapterType', id: number, uploadDate: string } | null, chapters: { __typename?: 'ChapterNodeList', totalCount: number } }> } }, failedJobs: { __typename?: 'UpdateStatusType', mangas: { __typename?: 'MangaNodeList', totalCount: number, nodes: Array<{ __typename?: 'MangaType', id: number, title: string, thumbnailUrl?: string | null }> } }, pendingJobs: { __typename?: 'UpdateStatusType', mangas: { __typename?: 'MangaNodeList', totalCount: number, nodes: Array<{ __typename?: 'MangaType', id: number, title: string, thumbnailUrl?: string | null }> } }, runningJobs: { __typename?: 'UpdateStatusType', mangas: { __typename?: 'MangaNodeList', totalCount: number, nodes: Array<{ __typename?: 'MangaType', id: number, title: string, thumbnailUrl?: string | null }> } } } };

export type GetLastUpdateTimestampQueryVariables = Exact<{ [key: string]: never; }>;


export type GetLastUpdateTimestampQuery = { __typename?: 'Query', lastUpdateTimestamp: { __typename?: 'LastUpdateTimestampPayload', timestamp: string } };

export type DownloadStatusSubscriptionVariables = Exact<{
  input: DownloadChangedInput;
}>;


export type DownloadStatusSubscription = { __typename?: 'Subscription', downloadStatusChanged: { __typename?: 'DownloadUpdates', state: DownloaderState, omittedUpdates: boolean, updates: Array<{ __typename?: 'DownloadUpdate', type: DownloadUpdateType, download: { __typename?: 'DownloadType', position: number, progress: number, state: DownloadState, tries: number, chapter: { __typename?: 'ChapterType', id: number, name: string, sourceOrder: number, isDownloaded: boolean }, manga: { __typename?: 'MangaType', id: number, title: string, downloadCount: number } } }> } };

export type WebuiUpdateSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type WebuiUpdateSubscription = { __typename?: 'Subscription', webUIUpdateStatusChange: { __typename?: 'WebUIUpdateStatus', progress: number, state: UpdateState, info: { __typename?: 'WebUIUpdateInfo', channel: string, tag: string } } };

export type UpdaterSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type UpdaterSubscription = { __typename?: 'Subscription', updateStatusChanged: { __typename?: 'UpdateStatus', isRunning: boolean, completeJobs: { __typename?: 'UpdateStatusType', mangas: { __typename?: 'MangaNodeList', totalCount: number, nodes: Array<{ __typename?: 'MangaType', id: number, unreadCount: number, downloadCount: number, bookmarkCount: number, hasDuplicateChapters: boolean, firstUnreadChapter?: { __typename?: 'ChapterType', id: number, sourceOrder: number } | null, lastReadChapter?: { __typename?: 'ChapterType', id: number, sourceOrder: number, lastReadAt: string } | null, latestReadChapter?: { __typename?: 'ChapterType', id: number, sourceOrder: number, lastReadAt: string } | null, latestFetchedChapter?: { __typename?: 'ChapterType', id: number, fetchedAt: string } | null, latestUploadedChapter?: { __typename?: 'ChapterType', id: number, uploadDate: string } | null, chapters: { __typename?: 'ChapterNodeList', totalCount: number } }> } }, failedJobs: { __typename?: 'UpdateStatusType', mangas: { __typename?: 'MangaNodeList', totalCount: number, nodes: Array<{ __typename?: 'MangaType', id: number, title: string, thumbnailUrl?: string | null }> } }, pendingJobs: { __typename?: 'UpdateStatusType', mangas: { __typename?: 'MangaNodeList', totalCount: number, nodes: Array<{ __typename?: 'MangaType', id: number, title: string, thumbnailUrl?: string | null }> } }, runningJobs: { __typename?: 'UpdateStatusType', mangas: { __typename?: 'MangaNodeList', totalCount: number, nodes: Array<{ __typename?: 'MangaType', id: number, title: string, thumbnailUrl?: string | null }> } } } };
