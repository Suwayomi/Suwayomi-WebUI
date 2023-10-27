import { FieldPolicy, FieldReadFunction, TypePolicies, TypePolicy } from '@apollo/client/cache';
import { GetChaptersQuery } from "@/lib/graphql/generated/graphql.ts";
export type AboutPayloadKeySpecifier = ('buildTime' | 'buildType' | 'discord' | 'github' | 'name' | 'revision' | 'version' | AboutPayloadKeySpecifier)[];
export type AboutPayloadFieldPolicy = {
	buildTime?: FieldPolicy<any> | FieldReadFunction<any>,
	buildType?: FieldPolicy<any> | FieldReadFunction<any>,
	discord?: FieldPolicy<any> | FieldReadFunction<any>,
	github?: FieldPolicy<any> | FieldReadFunction<any>,
	name?: FieldPolicy<any> | FieldReadFunction<any>,
	revision?: FieldPolicy<any> | FieldReadFunction<any>,
	version?: FieldPolicy<any> | FieldReadFunction<any>
};
export type BackupRestoreStatusKeySpecifier = ('mangaProgress' | 'state' | 'totalManga' | BackupRestoreStatusKeySpecifier)[];
export type BackupRestoreStatusFieldPolicy = {
	mangaProgress?: FieldPolicy<any> | FieldReadFunction<any>,
	state?: FieldPolicy<any> | FieldReadFunction<any>,
	totalManga?: FieldPolicy<any> | FieldReadFunction<any>
};
export type CategoryEdgeKeySpecifier = ('cursor' | 'node' | CategoryEdgeKeySpecifier)[];
export type CategoryEdgeFieldPolicy = {
	cursor?: FieldPolicy<any> | FieldReadFunction<any>,
	node?: FieldPolicy<any> | FieldReadFunction<any>
};
export type CategoryMetaTypeKeySpecifier = ('category' | 'categoryId' | 'key' | 'value' | CategoryMetaTypeKeySpecifier)[];
export type CategoryMetaTypeFieldPolicy = {
	category?: FieldPolicy<any> | FieldReadFunction<any>,
	categoryId?: FieldPolicy<any> | FieldReadFunction<any>,
	key?: FieldPolicy<any> | FieldReadFunction<any>,
	value?: FieldPolicy<any> | FieldReadFunction<any>
};
export type CategoryNodeListKeySpecifier = ('edges' | 'nodes' | 'pageInfo' | 'totalCount' | CategoryNodeListKeySpecifier)[];
export type CategoryNodeListFieldPolicy = {
	edges?: FieldPolicy<any> | FieldReadFunction<any>,
	nodes?: FieldPolicy<any> | FieldReadFunction<any>,
	pageInfo?: FieldPolicy<any> | FieldReadFunction<any>,
	totalCount?: FieldPolicy<any> | FieldReadFunction<any>
};
export type CategoryTypeKeySpecifier = ('default' | 'id' | 'includeInUpdate' | 'mangas' | 'meta' | 'name' | 'order' | CategoryTypeKeySpecifier)[];
export type CategoryTypeFieldPolicy = {
	default?: FieldPolicy<any> | FieldReadFunction<any>,
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	includeInUpdate?: FieldPolicy<any> | FieldReadFunction<any>,
	mangas?: FieldPolicy<any> | FieldReadFunction<any>,
	meta?: FieldPolicy<any> | FieldReadFunction<any>,
	name?: FieldPolicy<any> | FieldReadFunction<any>,
	order?: FieldPolicy<any> | FieldReadFunction<any>
};
export type ChapterEdgeKeySpecifier = ('cursor' | 'node' | ChapterEdgeKeySpecifier)[];
export type ChapterEdgeFieldPolicy = {
	cursor?: FieldPolicy<any> | FieldReadFunction<any>,
	node?: FieldPolicy<any> | FieldReadFunction<any>
};
export type ChapterMetaTypeKeySpecifier = ('chapter' | 'chapterId' | 'key' | 'value' | ChapterMetaTypeKeySpecifier)[];
export type ChapterMetaTypeFieldPolicy = {
	chapter?: FieldPolicy<any> | FieldReadFunction<any>,
	chapterId?: FieldPolicy<any> | FieldReadFunction<any>,
	key?: FieldPolicy<any> | FieldReadFunction<any>,
	value?: FieldPolicy<any> | FieldReadFunction<any>
};
export type ChapterNodeListKeySpecifier = ('edges' | 'nodes' | 'pageInfo' | 'totalCount' | ChapterNodeListKeySpecifier)[];
export type ChapterNodeListFieldPolicy = {
	edges?: FieldPolicy<any> | FieldReadFunction<any>,
	nodes?: FieldPolicy<any> | FieldReadFunction<any>,
	pageInfo?: FieldPolicy<any> | FieldReadFunction<any>,
	totalCount?: FieldPolicy<any> | FieldReadFunction<any>
};
export type ChapterTypeKeySpecifier = ('chapterNumber' | 'fetchedAt' | 'id' | 'isBookmarked' | 'isDownloaded' | 'isRead' | 'lastPageRead' | 'lastReadAt' | 'manga' | 'mangaId' | 'meta' | 'name' | 'pageCount' | 'realUrl' | 'scanlator' | 'sourceOrder' | 'uploadDate' | 'url' | ChapterTypeKeySpecifier)[];
export type ChapterTypeFieldPolicy = {
	chapterNumber?: FieldPolicy<any> | FieldReadFunction<any>,
	fetchedAt?: FieldPolicy<any> | FieldReadFunction<any>,
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	isBookmarked?: FieldPolicy<any> | FieldReadFunction<any>,
	isDownloaded?: FieldPolicy<any> | FieldReadFunction<any>,
	isRead?: FieldPolicy<any> | FieldReadFunction<any>,
	lastPageRead?: FieldPolicy<any> | FieldReadFunction<any>,
	lastReadAt?: FieldPolicy<any> | FieldReadFunction<any>,
	manga?: FieldPolicy<any> | FieldReadFunction<any>,
	mangaId?: FieldPolicy<any> | FieldReadFunction<any>,
	meta?: FieldPolicy<any> | FieldReadFunction<any>,
	name?: FieldPolicy<any> | FieldReadFunction<any>,
	pageCount?: FieldPolicy<any> | FieldReadFunction<any>,
	realUrl?: FieldPolicy<any> | FieldReadFunction<any>,
	scanlator?: FieldPolicy<any> | FieldReadFunction<any>,
	sourceOrder?: FieldPolicy<any> | FieldReadFunction<any>,
	uploadDate?: FieldPolicy<any> | FieldReadFunction<any>,
	url?: FieldPolicy<any> | FieldReadFunction<any>
};
export type CheckBoxFilterKeySpecifier = ('default' | 'name' | CheckBoxFilterKeySpecifier)[];
export type CheckBoxFilterFieldPolicy = {
	default?: FieldPolicy<any> | FieldReadFunction<any>,
	name?: FieldPolicy<any> | FieldReadFunction<any>
};
export type CheckBoxPreferenceKeySpecifier = ('currentValue' | 'default' | 'key' | 'summary' | 'title' | 'visible' | CheckBoxPreferenceKeySpecifier)[];
export type CheckBoxPreferenceFieldPolicy = {
	currentValue?: FieldPolicy<any> | FieldReadFunction<any>,
	default?: FieldPolicy<any> | FieldReadFunction<any>,
	key?: FieldPolicy<any> | FieldReadFunction<any>,
	summary?: FieldPolicy<any> | FieldReadFunction<any>,
	title?: FieldPolicy<any> | FieldReadFunction<any>,
	visible?: FieldPolicy<any> | FieldReadFunction<any>
};
export type CheckForServerUpdatesPayloadKeySpecifier = ('channel' | 'tag' | 'url' | CheckForServerUpdatesPayloadKeySpecifier)[];
export type CheckForServerUpdatesPayloadFieldPolicy = {
	channel?: FieldPolicy<any> | FieldReadFunction<any>,
	tag?: FieldPolicy<any> | FieldReadFunction<any>,
	url?: FieldPolicy<any> | FieldReadFunction<any>
};
export type ClearDownloaderPayloadKeySpecifier = ('clientMutationId' | 'downloadStatus' | ClearDownloaderPayloadKeySpecifier)[];
export type ClearDownloaderPayloadFieldPolicy = {
	clientMutationId?: FieldPolicy<any> | FieldReadFunction<any>,
	downloadStatus?: FieldPolicy<any> | FieldReadFunction<any>
};
export type CreateBackupPayloadKeySpecifier = ('clientMutationId' | 'url' | CreateBackupPayloadKeySpecifier)[];
export type CreateBackupPayloadFieldPolicy = {
	clientMutationId?: FieldPolicy<any> | FieldReadFunction<any>,
	url?: FieldPolicy<any> | FieldReadFunction<any>
};
export type CreateCategoryPayloadKeySpecifier = ('category' | 'clientMutationId' | CreateCategoryPayloadKeySpecifier)[];
export type CreateCategoryPayloadFieldPolicy = {
	category?: FieldPolicy<any> | FieldReadFunction<any>,
	clientMutationId?: FieldPolicy<any> | FieldReadFunction<any>
};
export type DeleteCategoryMetaPayloadKeySpecifier = ('category' | 'clientMutationId' | 'meta' | DeleteCategoryMetaPayloadKeySpecifier)[];
export type DeleteCategoryMetaPayloadFieldPolicy = {
	category?: FieldPolicy<any> | FieldReadFunction<any>,
	clientMutationId?: FieldPolicy<any> | FieldReadFunction<any>,
	meta?: FieldPolicy<any> | FieldReadFunction<any>
};
export type DeleteCategoryPayloadKeySpecifier = ('category' | 'clientMutationId' | 'mangas' | DeleteCategoryPayloadKeySpecifier)[];
export type DeleteCategoryPayloadFieldPolicy = {
	category?: FieldPolicy<any> | FieldReadFunction<any>,
	clientMutationId?: FieldPolicy<any> | FieldReadFunction<any>,
	mangas?: FieldPolicy<any> | FieldReadFunction<any>
};
export type DeleteChapterMetaPayloadKeySpecifier = ('chapter' | 'clientMutationId' | 'meta' | DeleteChapterMetaPayloadKeySpecifier)[];
export type DeleteChapterMetaPayloadFieldPolicy = {
	chapter?: FieldPolicy<any> | FieldReadFunction<any>,
	clientMutationId?: FieldPolicy<any> | FieldReadFunction<any>,
	meta?: FieldPolicy<any> | FieldReadFunction<any>
};
export type DeleteDownloadedChapterPayloadKeySpecifier = ('chapters' | 'clientMutationId' | DeleteDownloadedChapterPayloadKeySpecifier)[];
export type DeleteDownloadedChapterPayloadFieldPolicy = {
	chapters?: FieldPolicy<any> | FieldReadFunction<any>,
	clientMutationId?: FieldPolicy<any> | FieldReadFunction<any>
};
export type DeleteDownloadedChaptersPayloadKeySpecifier = ('chapters' | 'clientMutationId' | DeleteDownloadedChaptersPayloadKeySpecifier)[];
export type DeleteDownloadedChaptersPayloadFieldPolicy = {
	chapters?: FieldPolicy<any> | FieldReadFunction<any>,
	clientMutationId?: FieldPolicy<any> | FieldReadFunction<any>
};
export type DeleteGlobalMetaPayloadKeySpecifier = ('clientMutationId' | 'meta' | DeleteGlobalMetaPayloadKeySpecifier)[];
export type DeleteGlobalMetaPayloadFieldPolicy = {
	clientMutationId?: FieldPolicy<any> | FieldReadFunction<any>,
	meta?: FieldPolicy<any> | FieldReadFunction<any>
};
export type DeleteMangaMetaPayloadKeySpecifier = ('clientMutationId' | 'manga' | 'meta' | DeleteMangaMetaPayloadKeySpecifier)[];
export type DeleteMangaMetaPayloadFieldPolicy = {
	clientMutationId?: FieldPolicy<any> | FieldReadFunction<any>,
	manga?: FieldPolicy<any> | FieldReadFunction<any>,
	meta?: FieldPolicy<any> | FieldReadFunction<any>
};
export type DequeueChapterDownloadPayloadKeySpecifier = ('clientMutationId' | 'downloadStatus' | DequeueChapterDownloadPayloadKeySpecifier)[];
export type DequeueChapterDownloadPayloadFieldPolicy = {
	clientMutationId?: FieldPolicy<any> | FieldReadFunction<any>,
	downloadStatus?: FieldPolicy<any> | FieldReadFunction<any>
};
export type DequeueChapterDownloadsPayloadKeySpecifier = ('clientMutationId' | 'downloadStatus' | DequeueChapterDownloadsPayloadKeySpecifier)[];
export type DequeueChapterDownloadsPayloadFieldPolicy = {
	clientMutationId?: FieldPolicy<any> | FieldReadFunction<any>,
	downloadStatus?: FieldPolicy<any> | FieldReadFunction<any>
};
export type DownloadAheadPayloadKeySpecifier = ('clientMutationId' | DownloadAheadPayloadKeySpecifier)[];
export type DownloadAheadPayloadFieldPolicy = {
	clientMutationId?: FieldPolicy<any> | FieldReadFunction<any>
};
export type DownloadEdgeKeySpecifier = ('cursor' | 'node' | DownloadEdgeKeySpecifier)[];
export type DownloadEdgeFieldPolicy = {
	cursor?: FieldPolicy<any> | FieldReadFunction<any>,
	node?: FieldPolicy<any> | FieldReadFunction<any>
};
export type DownloadNodeListKeySpecifier = ('edges' | 'nodes' | 'pageInfo' | 'totalCount' | DownloadNodeListKeySpecifier)[];
export type DownloadNodeListFieldPolicy = {
	edges?: FieldPolicy<any> | FieldReadFunction<any>,
	nodes?: FieldPolicy<any> | FieldReadFunction<any>,
	pageInfo?: FieldPolicy<any> | FieldReadFunction<any>,
	totalCount?: FieldPolicy<any> | FieldReadFunction<any>
};
export type DownloadStatusKeySpecifier = ('queue' | 'state' | DownloadStatusKeySpecifier)[];
export type DownloadStatusFieldPolicy = {
	queue?: FieldPolicy<any> | FieldReadFunction<any>,
	state?: FieldPolicy<any> | FieldReadFunction<any>
};
export type DownloadTypeKeySpecifier = ('chapter' | 'manga' | 'progress' | 'state' | 'tries' | DownloadTypeKeySpecifier)[];
export type DownloadTypeFieldPolicy = {
	chapter?: FieldPolicy<any> | FieldReadFunction<any>,
	manga?: FieldPolicy<any> | FieldReadFunction<any>,
	progress?: FieldPolicy<any> | FieldReadFunction<any>,
	state?: FieldPolicy<any> | FieldReadFunction<any>,
	tries?: FieldPolicy<any> | FieldReadFunction<any>
};
export type EdgeKeySpecifier = ('cursor' | 'node' | EdgeKeySpecifier)[];
export type EdgeFieldPolicy = {
	cursor?: FieldPolicy<any> | FieldReadFunction<any>,
	node?: FieldPolicy<any> | FieldReadFunction<any>
};
export type EditTextPreferenceKeySpecifier = ('currentValue' | 'default' | 'dialogMessage' | 'dialogTitle' | 'key' | 'summary' | 'text' | 'title' | 'visible' | EditTextPreferenceKeySpecifier)[];
export type EditTextPreferenceFieldPolicy = {
	currentValue?: FieldPolicy<any> | FieldReadFunction<any>,
	default?: FieldPolicy<any> | FieldReadFunction<any>,
	dialogMessage?: FieldPolicy<any> | FieldReadFunction<any>,
	dialogTitle?: FieldPolicy<any> | FieldReadFunction<any>,
	key?: FieldPolicy<any> | FieldReadFunction<any>,
	summary?: FieldPolicy<any> | FieldReadFunction<any>,
	text?: FieldPolicy<any> | FieldReadFunction<any>,
	title?: FieldPolicy<any> | FieldReadFunction<any>,
	visible?: FieldPolicy<any> | FieldReadFunction<any>
};
export type EnqueueChapterDownloadPayloadKeySpecifier = ('clientMutationId' | 'downloadStatus' | EnqueueChapterDownloadPayloadKeySpecifier)[];
export type EnqueueChapterDownloadPayloadFieldPolicy = {
	clientMutationId?: FieldPolicy<any> | FieldReadFunction<any>,
	downloadStatus?: FieldPolicy<any> | FieldReadFunction<any>
};
export type EnqueueChapterDownloadsPayloadKeySpecifier = ('clientMutationId' | 'downloadStatus' | EnqueueChapterDownloadsPayloadKeySpecifier)[];
export type EnqueueChapterDownloadsPayloadFieldPolicy = {
	clientMutationId?: FieldPolicy<any> | FieldReadFunction<any>,
	downloadStatus?: FieldPolicy<any> | FieldReadFunction<any>
};
export type ExtensionEdgeKeySpecifier = ('cursor' | 'node' | ExtensionEdgeKeySpecifier)[];
export type ExtensionEdgeFieldPolicy = {
	cursor?: FieldPolicy<any> | FieldReadFunction<any>,
	node?: FieldPolicy<any> | FieldReadFunction<any>
};
export type ExtensionNodeListKeySpecifier = ('edges' | 'nodes' | 'pageInfo' | 'totalCount' | ExtensionNodeListKeySpecifier)[];
export type ExtensionNodeListFieldPolicy = {
	edges?: FieldPolicy<any> | FieldReadFunction<any>,
	nodes?: FieldPolicy<any> | FieldReadFunction<any>,
	pageInfo?: FieldPolicy<any> | FieldReadFunction<any>,
	totalCount?: FieldPolicy<any> | FieldReadFunction<any>
};
export type ExtensionTypeKeySpecifier = ('apkName' | 'hasUpdate' | 'iconUrl' | 'isInstalled' | 'isNsfw' | 'isObsolete' | 'lang' | 'name' | 'pkgName' | 'source' | 'versionCode' | 'versionName' | ExtensionTypeKeySpecifier)[];
export type ExtensionTypeFieldPolicy = {
	apkName?: FieldPolicy<any> | FieldReadFunction<any>,
	hasUpdate?: FieldPolicy<any> | FieldReadFunction<any>,
	iconUrl?: FieldPolicy<any> | FieldReadFunction<any>,
	isInstalled?: FieldPolicy<any> | FieldReadFunction<any>,
	isNsfw?: FieldPolicy<any> | FieldReadFunction<any>,
	isObsolete?: FieldPolicy<any> | FieldReadFunction<any>,
	lang?: FieldPolicy<any> | FieldReadFunction<any>,
	name?: FieldPolicy<any> | FieldReadFunction<any>,
	pkgName?: FieldPolicy<any> | FieldReadFunction<any>,
	source?: FieldPolicy<any> | FieldReadFunction<any>,
	versionCode?: FieldPolicy<any> | FieldReadFunction<any>,
	versionName?: FieldPolicy<any> | FieldReadFunction<any>
};
export type FetchChapterPagesPayloadKeySpecifier = ('chapter' | 'clientMutationId' | 'pages' | FetchChapterPagesPayloadKeySpecifier)[];
export type FetchChapterPagesPayloadFieldPolicy = {
	chapter?: FieldPolicy<any> | FieldReadFunction<any>,
	clientMutationId?: FieldPolicy<any> | FieldReadFunction<any>,
	pages?: FieldPolicy<any> | FieldReadFunction<any>
};
export type FetchChaptersPayloadKeySpecifier = ('chapters' | 'clientMutationId' | FetchChaptersPayloadKeySpecifier)[];
export type FetchChaptersPayloadFieldPolicy = {
	chapters?: FieldPolicy<any> | FieldReadFunction<any>,
	clientMutationId?: FieldPolicy<any> | FieldReadFunction<any>
};
export type FetchExtensionsPayloadKeySpecifier = ('clientMutationId' | 'extensions' | FetchExtensionsPayloadKeySpecifier)[];
export type FetchExtensionsPayloadFieldPolicy = {
	clientMutationId?: FieldPolicy<any> | FieldReadFunction<any>,
	extensions?: FieldPolicy<any> | FieldReadFunction<any>
};
export type FetchMangaPayloadKeySpecifier = ('clientMutationId' | 'manga' | FetchMangaPayloadKeySpecifier)[];
export type FetchMangaPayloadFieldPolicy = {
	clientMutationId?: FieldPolicy<any> | FieldReadFunction<any>,
	manga?: FieldPolicy<any> | FieldReadFunction<any>
};
export type FetchSourceMangaPayloadKeySpecifier = ('clientMutationId' | 'hasNextPage' | 'mangas' | FetchSourceMangaPayloadKeySpecifier)[];
export type FetchSourceMangaPayloadFieldPolicy = {
	clientMutationId?: FieldPolicy<any> | FieldReadFunction<any>,
	hasNextPage?: FieldPolicy<any> | FieldReadFunction<any>,
	mangas?: FieldPolicy<any> | FieldReadFunction<any>
};
export type GlobalMetaNodeListKeySpecifier = ('edges' | 'nodes' | 'pageInfo' | 'totalCount' | GlobalMetaNodeListKeySpecifier)[];
export type GlobalMetaNodeListFieldPolicy = {
	edges?: FieldPolicy<any> | FieldReadFunction<any>,
	nodes?: FieldPolicy<any> | FieldReadFunction<any>,
	pageInfo?: FieldPolicy<any> | FieldReadFunction<any>,
	totalCount?: FieldPolicy<any> | FieldReadFunction<any>
};
export type GlobalMetaTypeKeySpecifier = ('key' | 'value' | GlobalMetaTypeKeySpecifier)[];
export type GlobalMetaTypeFieldPolicy = {
	key?: FieldPolicy<any> | FieldReadFunction<any>,
	value?: FieldPolicy<any> | FieldReadFunction<any>
};
export type GroupFilterKeySpecifier = ('filters' | 'name' | GroupFilterKeySpecifier)[];
export type GroupFilterFieldPolicy = {
	filters?: FieldPolicy<any> | FieldReadFunction<any>,
	name?: FieldPolicy<any> | FieldReadFunction<any>
};
export type HeaderFilterKeySpecifier = ('name' | HeaderFilterKeySpecifier)[];
export type HeaderFilterFieldPolicy = {
	name?: FieldPolicy<any> | FieldReadFunction<any>
};
export type InstallExternalExtensionPayloadKeySpecifier = ('clientMutationId' | 'extension' | InstallExternalExtensionPayloadKeySpecifier)[];
export type InstallExternalExtensionPayloadFieldPolicy = {
	clientMutationId?: FieldPolicy<any> | FieldReadFunction<any>,
	extension?: FieldPolicy<any> | FieldReadFunction<any>
};
export type LastUpdateTimestampPayloadKeySpecifier = ('timestamp' | LastUpdateTimestampPayloadKeySpecifier)[];
export type LastUpdateTimestampPayloadFieldPolicy = {
	timestamp?: FieldPolicy<any> | FieldReadFunction<any>
};
export type ListPreferenceKeySpecifier = ('currentValue' | 'default' | 'entries' | 'entryValues' | 'key' | 'summary' | 'title' | 'visible' | ListPreferenceKeySpecifier)[];
export type ListPreferenceFieldPolicy = {
	currentValue?: FieldPolicy<any> | FieldReadFunction<any>,
	default?: FieldPolicy<any> | FieldReadFunction<any>,
	entries?: FieldPolicy<any> | FieldReadFunction<any>,
	entryValues?: FieldPolicy<any> | FieldReadFunction<any>,
	key?: FieldPolicy<any> | FieldReadFunction<any>,
	summary?: FieldPolicy<any> | FieldReadFunction<any>,
	title?: FieldPolicy<any> | FieldReadFunction<any>,
	visible?: FieldPolicy<any> | FieldReadFunction<any>
};
export type MangaEdgeKeySpecifier = ('cursor' | 'node' | MangaEdgeKeySpecifier)[];
export type MangaEdgeFieldPolicy = {
	cursor?: FieldPolicy<any> | FieldReadFunction<any>,
	node?: FieldPolicy<any> | FieldReadFunction<any>
};
export type MangaMetaTypeKeySpecifier = ('key' | 'manga' | 'mangaId' | 'value' | MangaMetaTypeKeySpecifier)[];
export type MangaMetaTypeFieldPolicy = {
	key?: FieldPolicy<any> | FieldReadFunction<any>,
	manga?: FieldPolicy<any> | FieldReadFunction<any>,
	mangaId?: FieldPolicy<any> | FieldReadFunction<any>,
	value?: FieldPolicy<any> | FieldReadFunction<any>
};
export type MangaNodeListKeySpecifier = ('edges' | 'nodes' | 'pageInfo' | 'totalCount' | MangaNodeListKeySpecifier)[];
export type MangaNodeListFieldPolicy = {
	edges?: FieldPolicy<any> | FieldReadFunction<any>,
	nodes?: FieldPolicy<any> | FieldReadFunction<any>,
	pageInfo?: FieldPolicy<any> | FieldReadFunction<any>,
	totalCount?: FieldPolicy<any> | FieldReadFunction<any>
};
export type MangaTypeKeySpecifier = ('age' | 'artist' | 'author' | 'categories' | 'chapters' | 'chaptersAge' | 'chaptersLastFetchedAt' | 'description' | 'downloadCount' | 'genre' | 'id' | 'inLibrary' | 'inLibraryAt' | 'initialized' | 'lastFetchedAt' | 'lastReadChapter' | 'meta' | 'realUrl' | 'source' | 'sourceId' | 'status' | 'thumbnailUrl' | 'title' | 'unreadCount' | 'url' | MangaTypeKeySpecifier)[];
export type MangaTypeFieldPolicy = {
	age?: FieldPolicy<any> | FieldReadFunction<any>,
	artist?: FieldPolicy<any> | FieldReadFunction<any>,
	author?: FieldPolicy<any> | FieldReadFunction<any>,
	categories?: FieldPolicy<any> | FieldReadFunction<any>,
	chapters?: FieldPolicy<any> | FieldReadFunction<any>,
	chaptersAge?: FieldPolicy<any> | FieldReadFunction<any>,
	chaptersLastFetchedAt?: FieldPolicy<any> | FieldReadFunction<any>,
	description?: FieldPolicy<any> | FieldReadFunction<any>,
	downloadCount?: FieldPolicy<any> | FieldReadFunction<any>,
	genre?: FieldPolicy<any> | FieldReadFunction<any>,
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	inLibrary?: FieldPolicy<any> | FieldReadFunction<any>,
	inLibraryAt?: FieldPolicy<any> | FieldReadFunction<any>,
	initialized?: FieldPolicy<any> | FieldReadFunction<any>,
	lastFetchedAt?: FieldPolicy<any> | FieldReadFunction<any>,
	lastReadChapter?: FieldPolicy<any> | FieldReadFunction<any>,
	meta?: FieldPolicy<any> | FieldReadFunction<any>,
	realUrl?: FieldPolicy<any> | FieldReadFunction<any>,
	source?: FieldPolicy<any> | FieldReadFunction<any>,
	sourceId?: FieldPolicy<any> | FieldReadFunction<any>,
	status?: FieldPolicy<any> | FieldReadFunction<any>,
	thumbnailUrl?: FieldPolicy<any> | FieldReadFunction<any>,
	title?: FieldPolicy<any> | FieldReadFunction<any>,
	unreadCount?: FieldPolicy<any> | FieldReadFunction<any>,
	url?: FieldPolicy<any> | FieldReadFunction<any>
};
export type MetaEdgeKeySpecifier = ('cursor' | 'node' | MetaEdgeKeySpecifier)[];
export type MetaEdgeFieldPolicy = {
	cursor?: FieldPolicy<any> | FieldReadFunction<any>,
	node?: FieldPolicy<any> | FieldReadFunction<any>
};
export type MetaTypeKeySpecifier = ('key' | 'value' | MetaTypeKeySpecifier)[];
export type MetaTypeFieldPolicy = {
	key?: FieldPolicy<any> | FieldReadFunction<any>,
	value?: FieldPolicy<any> | FieldReadFunction<any>
};
export type MultiSelectListPreferenceKeySpecifier = ('currentValue' | 'default' | 'dialogMessage' | 'dialogTitle' | 'entries' | 'entryValues' | 'key' | 'summary' | 'title' | 'visible' | MultiSelectListPreferenceKeySpecifier)[];
export type MultiSelectListPreferenceFieldPolicy = {
	currentValue?: FieldPolicy<any> | FieldReadFunction<any>,
	default?: FieldPolicy<any> | FieldReadFunction<any>,
	dialogMessage?: FieldPolicy<any> | FieldReadFunction<any>,
	dialogTitle?: FieldPolicy<any> | FieldReadFunction<any>,
	entries?: FieldPolicy<any> | FieldReadFunction<any>,
	entryValues?: FieldPolicy<any> | FieldReadFunction<any>,
	key?: FieldPolicy<any> | FieldReadFunction<any>,
	summary?: FieldPolicy<any> | FieldReadFunction<any>,
	title?: FieldPolicy<any> | FieldReadFunction<any>,
	visible?: FieldPolicy<any> | FieldReadFunction<any>
};
export type MutationKeySpecifier = ('clearDownloader' | 'createBackup' | 'createCategory' | 'deleteCategory' | 'deleteCategoryMeta' | 'deleteChapterMeta' | 'deleteDownloadedChapter' | 'deleteDownloadedChapters' | 'deleteGlobalMeta' | 'deleteMangaMeta' | 'dequeueChapterDownload' | 'dequeueChapterDownloads' | 'downloadAhead' | 'enqueueChapterDownload' | 'enqueueChapterDownloads' | 'fetchChapterPages' | 'fetchChapters' | 'fetchExtensions' | 'fetchManga' | 'fetchSourceManga' | 'installExternalExtension' | 'reorderChapterDownload' | 'resetSettings' | 'restoreBackup' | 'setCategoryMeta' | 'setChapterMeta' | 'setGlobalMeta' | 'setMangaMeta' | 'setSettings' | 'startDownloader' | 'stopDownloader' | 'updateCategories' | 'updateCategory' | 'updateCategoryManga' | 'updateCategoryOrder' | 'updateChapter' | 'updateChapters' | 'updateExtension' | 'updateExtensions' | 'updateLibraryManga' | 'updateManga' | 'updateMangaCategories' | 'updateMangas' | 'updateMangasCategories' | 'updateSourcePreference' | 'updateStop' | 'updateWebUI' | MutationKeySpecifier)[];
export type MutationFieldPolicy = {
	clearDownloader?: FieldPolicy<any> | FieldReadFunction<any>,
	createBackup?: FieldPolicy<any> | FieldReadFunction<any>,
	createCategory?: FieldPolicy<any> | FieldReadFunction<any>,
	deleteCategory?: FieldPolicy<any> | FieldReadFunction<any>,
	deleteCategoryMeta?: FieldPolicy<any> | FieldReadFunction<any>,
	deleteChapterMeta?: FieldPolicy<any> | FieldReadFunction<any>,
	deleteDownloadedChapter?: FieldPolicy<any> | FieldReadFunction<any>,
	deleteDownloadedChapters?: FieldPolicy<any> | FieldReadFunction<any>,
	deleteGlobalMeta?: FieldPolicy<any> | FieldReadFunction<any>,
	deleteMangaMeta?: FieldPolicy<any> | FieldReadFunction<any>,
	dequeueChapterDownload?: FieldPolicy<any> | FieldReadFunction<any>,
	dequeueChapterDownloads?: FieldPolicy<any> | FieldReadFunction<any>,
	downloadAhead?: FieldPolicy<any> | FieldReadFunction<any>,
	enqueueChapterDownload?: FieldPolicy<any> | FieldReadFunction<any>,
	enqueueChapterDownloads?: FieldPolicy<any> | FieldReadFunction<any>,
	fetchChapterPages?: FieldPolicy<any> | FieldReadFunction<any>,
	fetchChapters?: FieldPolicy<any> | FieldReadFunction<any>,
	fetchExtensions?: FieldPolicy<any> | FieldReadFunction<any>,
	fetchManga?: FieldPolicy<any> | FieldReadFunction<any>,
	fetchSourceManga?: FieldPolicy<any> | FieldReadFunction<any>,
	installExternalExtension?: FieldPolicy<any> | FieldReadFunction<any>,
	reorderChapterDownload?: FieldPolicy<any> | FieldReadFunction<any>,
	resetSettings?: FieldPolicy<any> | FieldReadFunction<any>,
	restoreBackup?: FieldPolicy<any> | FieldReadFunction<any>,
	setCategoryMeta?: FieldPolicy<any> | FieldReadFunction<any>,
	setChapterMeta?: FieldPolicy<any> | FieldReadFunction<any>,
	setGlobalMeta?: FieldPolicy<any> | FieldReadFunction<any>,
	setMangaMeta?: FieldPolicy<any> | FieldReadFunction<any>,
	setSettings?: FieldPolicy<any> | FieldReadFunction<any>,
	startDownloader?: FieldPolicy<any> | FieldReadFunction<any>,
	stopDownloader?: FieldPolicy<any> | FieldReadFunction<any>,
	updateCategories?: FieldPolicy<any> | FieldReadFunction<any>,
	updateCategory?: FieldPolicy<any> | FieldReadFunction<any>,
	updateCategoryManga?: FieldPolicy<any> | FieldReadFunction<any>,
	updateCategoryOrder?: FieldPolicy<any> | FieldReadFunction<any>,
	updateChapter?: FieldPolicy<any> | FieldReadFunction<any>,
	updateChapters?: FieldPolicy<any> | FieldReadFunction<any>,
	updateExtension?: FieldPolicy<any> | FieldReadFunction<any>,
	updateExtensions?: FieldPolicy<any> | FieldReadFunction<any>,
	updateLibraryManga?: FieldPolicy<any> | FieldReadFunction<any>,
	updateManga?: FieldPolicy<any> | FieldReadFunction<any>,
	updateMangaCategories?: FieldPolicy<any> | FieldReadFunction<any>,
	updateMangas?: FieldPolicy<any> | FieldReadFunction<any>,
	updateMangasCategories?: FieldPolicy<any> | FieldReadFunction<any>,
	updateSourcePreference?: FieldPolicy<any> | FieldReadFunction<any>,
	updateStop?: FieldPolicy<any> | FieldReadFunction<any>,
	updateWebUI?: FieldPolicy<any> | FieldReadFunction<any>
};
export type NodeListKeySpecifier = ('edges' | 'nodes' | 'pageInfo' | 'totalCount' | NodeListKeySpecifier)[];
export type NodeListFieldPolicy = {
	edges?: FieldPolicy<any> | FieldReadFunction<any>,
	nodes?: FieldPolicy<any> | FieldReadFunction<any>,
	pageInfo?: FieldPolicy<any> | FieldReadFunction<any>,
	totalCount?: FieldPolicy<any> | FieldReadFunction<any>
};
export type PageInfoKeySpecifier = ('endCursor' | 'hasNextPage' | 'hasPreviousPage' | 'startCursor' | PageInfoKeySpecifier)[];
export type PageInfoFieldPolicy = {
	endCursor?: FieldPolicy<any> | FieldReadFunction<any>,
	hasNextPage?: FieldPolicy<any> | FieldReadFunction<any>,
	hasPreviousPage?: FieldPolicy<any> | FieldReadFunction<any>,
	startCursor?: FieldPolicy<any> | FieldReadFunction<any>
};
export type PartialSettingsTypeKeySpecifier = ('autoDownloadNewChapters' | 'backupInterval' | 'backupPath' | 'backupTTL' | 'backupTime' | 'basicAuthEnabled' | 'basicAuthPassword' | 'basicAuthUsername' | 'debugLogsEnabled' | 'downloadAsCbz' | 'downloadsPath' | 'electronPath' | 'excludeCompleted' | 'excludeNotStarted' | 'excludeUnreadChapters' | 'globalUpdateInterval' | 'initialOpenInBrowserEnabled' | 'ip' | 'localSourcePath' | 'maxSourcesInParallel' | 'port' | 'socksProxyEnabled' | 'socksProxyHost' | 'socksProxyPort' | 'systemTrayEnabled' | 'webUIChannel' | 'webUIFlavor' | 'webUIInterface' | 'webUIUpdateCheckInterval' | PartialSettingsTypeKeySpecifier)[];
export type PartialSettingsTypeFieldPolicy = {
	autoDownloadNewChapters?: FieldPolicy<any> | FieldReadFunction<any>,
	backupInterval?: FieldPolicy<any> | FieldReadFunction<any>,
	backupPath?: FieldPolicy<any> | FieldReadFunction<any>,
	backupTTL?: FieldPolicy<any> | FieldReadFunction<any>,
	backupTime?: FieldPolicy<any> | FieldReadFunction<any>,
	basicAuthEnabled?: FieldPolicy<any> | FieldReadFunction<any>,
	basicAuthPassword?: FieldPolicy<any> | FieldReadFunction<any>,
	basicAuthUsername?: FieldPolicy<any> | FieldReadFunction<any>,
	debugLogsEnabled?: FieldPolicy<any> | FieldReadFunction<any>,
	downloadAsCbz?: FieldPolicy<any> | FieldReadFunction<any>,
	downloadsPath?: FieldPolicy<any> | FieldReadFunction<any>,
	electronPath?: FieldPolicy<any> | FieldReadFunction<any>,
	excludeCompleted?: FieldPolicy<any> | FieldReadFunction<any>,
	excludeNotStarted?: FieldPolicy<any> | FieldReadFunction<any>,
	excludeUnreadChapters?: FieldPolicy<any> | FieldReadFunction<any>,
	globalUpdateInterval?: FieldPolicy<any> | FieldReadFunction<any>,
	initialOpenInBrowserEnabled?: FieldPolicy<any> | FieldReadFunction<any>,
	ip?: FieldPolicy<any> | FieldReadFunction<any>,
	localSourcePath?: FieldPolicy<any> | FieldReadFunction<any>,
	maxSourcesInParallel?: FieldPolicy<any> | FieldReadFunction<any>,
	port?: FieldPolicy<any> | FieldReadFunction<any>,
	socksProxyEnabled?: FieldPolicy<any> | FieldReadFunction<any>,
	socksProxyHost?: FieldPolicy<any> | FieldReadFunction<any>,
	socksProxyPort?: FieldPolicy<any> | FieldReadFunction<any>,
	systemTrayEnabled?: FieldPolicy<any> | FieldReadFunction<any>,
	webUIChannel?: FieldPolicy<any> | FieldReadFunction<any>,
	webUIFlavor?: FieldPolicy<any> | FieldReadFunction<any>,
	webUIInterface?: FieldPolicy<any> | FieldReadFunction<any>,
	webUIUpdateCheckInterval?: FieldPolicy<any> | FieldReadFunction<any>
};
export type QueryKeySpecifier = ('about' | 'categories' | 'category' | 'chapter' | 'chapters' | 'checkForServerUpdates' | 'checkForWebUIUpdate' | 'downloadStatus' | 'extension' | 'extensions' | 'getWebUIUpdateStatus' | 'lastUpdateTimestamp' | 'manga' | 'mangas' | 'meta' | 'metas' | 'restoreStatus' | 'settings' | 'source' | 'sources' | 'updateStatus' | 'validateBackup' | QueryKeySpecifier)[];
export type QueryFieldPolicy = {
	about?: FieldPolicy<any> | FieldReadFunction<any>,
	categories?: FieldPolicy<any> | FieldReadFunction<any>,
	category?: FieldPolicy<any> | FieldReadFunction<any>,
	chapter?: FieldPolicy<any> | FieldReadFunction<any>,
	chapters?: FieldPolicy<GetChaptersQuery['chapters']> | FieldReadFunction<GetChaptersQuery['chapters']>,
	checkForServerUpdates?: FieldPolicy<any> | FieldReadFunction<any>,
	checkForWebUIUpdate?: FieldPolicy<any> | FieldReadFunction<any>,
	downloadStatus?: FieldPolicy<any> | FieldReadFunction<any>,
	extension?: FieldPolicy<any> | FieldReadFunction<any>,
	extensions?: FieldPolicy<any> | FieldReadFunction<any>,
	getWebUIUpdateStatus?: FieldPolicy<any> | FieldReadFunction<any>,
	lastUpdateTimestamp?: FieldPolicy<any> | FieldReadFunction<any>,
	manga?: FieldPolicy<any> | FieldReadFunction<any>,
	mangas?: FieldPolicy<any> | FieldReadFunction<any>,
	meta?: FieldPolicy<any> | FieldReadFunction<any>,
	metas?: FieldPolicy<any> | FieldReadFunction<any>,
	restoreStatus?: FieldPolicy<any> | FieldReadFunction<any>,
	settings?: FieldPolicy<any> | FieldReadFunction<any>,
	source?: FieldPolicy<any> | FieldReadFunction<any>,
	sources?: FieldPolicy<any> | FieldReadFunction<any>,
	updateStatus?: FieldPolicy<any> | FieldReadFunction<any>,
	validateBackup?: FieldPolicy<any> | FieldReadFunction<any>
};
export type ReorderChapterDownloadPayloadKeySpecifier = ('clientMutationId' | 'downloadStatus' | ReorderChapterDownloadPayloadKeySpecifier)[];
export type ReorderChapterDownloadPayloadFieldPolicy = {
	clientMutationId?: FieldPolicy<any> | FieldReadFunction<any>,
	downloadStatus?: FieldPolicy<any> | FieldReadFunction<any>
};
export type ResetSettingsPayloadKeySpecifier = ('clientMutationId' | 'settings' | ResetSettingsPayloadKeySpecifier)[];
export type ResetSettingsPayloadFieldPolicy = {
	clientMutationId?: FieldPolicy<any> | FieldReadFunction<any>,
	settings?: FieldPolicy<any> | FieldReadFunction<any>
};
export type RestoreBackupPayloadKeySpecifier = ('clientMutationId' | 'status' | RestoreBackupPayloadKeySpecifier)[];
export type RestoreBackupPayloadFieldPolicy = {
	clientMutationId?: FieldPolicy<any> | FieldReadFunction<any>,
	status?: FieldPolicy<any> | FieldReadFunction<any>
};
export type SelectFilterKeySpecifier = ('default' | 'name' | 'values' | SelectFilterKeySpecifier)[];
export type SelectFilterFieldPolicy = {
	default?: FieldPolicy<any> | FieldReadFunction<any>,
	name?: FieldPolicy<any> | FieldReadFunction<any>,
	values?: FieldPolicy<any> | FieldReadFunction<any>
};
export type SeparatorFilterKeySpecifier = ('name' | SeparatorFilterKeySpecifier)[];
export type SeparatorFilterFieldPolicy = {
	name?: FieldPolicy<any> | FieldReadFunction<any>
};
export type SetCategoryMetaPayloadKeySpecifier = ('clientMutationId' | 'meta' | SetCategoryMetaPayloadKeySpecifier)[];
export type SetCategoryMetaPayloadFieldPolicy = {
	clientMutationId?: FieldPolicy<any> | FieldReadFunction<any>,
	meta?: FieldPolicy<any> | FieldReadFunction<any>
};
export type SetChapterMetaPayloadKeySpecifier = ('clientMutationId' | 'meta' | SetChapterMetaPayloadKeySpecifier)[];
export type SetChapterMetaPayloadFieldPolicy = {
	clientMutationId?: FieldPolicy<any> | FieldReadFunction<any>,
	meta?: FieldPolicy<any> | FieldReadFunction<any>
};
export type SetGlobalMetaPayloadKeySpecifier = ('clientMutationId' | 'meta' | SetGlobalMetaPayloadKeySpecifier)[];
export type SetGlobalMetaPayloadFieldPolicy = {
	clientMutationId?: FieldPolicy<any> | FieldReadFunction<any>,
	meta?: FieldPolicy<any> | FieldReadFunction<any>
};
export type SetMangaMetaPayloadKeySpecifier = ('clientMutationId' | 'meta' | SetMangaMetaPayloadKeySpecifier)[];
export type SetMangaMetaPayloadFieldPolicy = {
	clientMutationId?: FieldPolicy<any> | FieldReadFunction<any>,
	meta?: FieldPolicy<any> | FieldReadFunction<any>
};
export type SetSettingsPayloadKeySpecifier = ('clientMutationId' | 'settings' | SetSettingsPayloadKeySpecifier)[];
export type SetSettingsPayloadFieldPolicy = {
	clientMutationId?: FieldPolicy<any> | FieldReadFunction<any>,
	settings?: FieldPolicy<any> | FieldReadFunction<any>
};
export type SettingsKeySpecifier = ('autoDownloadNewChapters' | 'backupInterval' | 'backupPath' | 'backupTTL' | 'backupTime' | 'basicAuthEnabled' | 'basicAuthPassword' | 'basicAuthUsername' | 'debugLogsEnabled' | 'downloadAsCbz' | 'downloadsPath' | 'electronPath' | 'excludeCompleted' | 'excludeNotStarted' | 'excludeUnreadChapters' | 'globalUpdateInterval' | 'initialOpenInBrowserEnabled' | 'ip' | 'localSourcePath' | 'maxSourcesInParallel' | 'port' | 'socksProxyEnabled' | 'socksProxyHost' | 'socksProxyPort' | 'systemTrayEnabled' | 'webUIChannel' | 'webUIFlavor' | 'webUIInterface' | 'webUIUpdateCheckInterval' | SettingsKeySpecifier)[];
export type SettingsFieldPolicy = {
	autoDownloadNewChapters?: FieldPolicy<any> | FieldReadFunction<any>,
	backupInterval?: FieldPolicy<any> | FieldReadFunction<any>,
	backupPath?: FieldPolicy<any> | FieldReadFunction<any>,
	backupTTL?: FieldPolicy<any> | FieldReadFunction<any>,
	backupTime?: FieldPolicy<any> | FieldReadFunction<any>,
	basicAuthEnabled?: FieldPolicy<any> | FieldReadFunction<any>,
	basicAuthPassword?: FieldPolicy<any> | FieldReadFunction<any>,
	basicAuthUsername?: FieldPolicy<any> | FieldReadFunction<any>,
	debugLogsEnabled?: FieldPolicy<any> | FieldReadFunction<any>,
	downloadAsCbz?: FieldPolicy<any> | FieldReadFunction<any>,
	downloadsPath?: FieldPolicy<any> | FieldReadFunction<any>,
	electronPath?: FieldPolicy<any> | FieldReadFunction<any>,
	excludeCompleted?: FieldPolicy<any> | FieldReadFunction<any>,
	excludeNotStarted?: FieldPolicy<any> | FieldReadFunction<any>,
	excludeUnreadChapters?: FieldPolicy<any> | FieldReadFunction<any>,
	globalUpdateInterval?: FieldPolicy<any> | FieldReadFunction<any>,
	initialOpenInBrowserEnabled?: FieldPolicy<any> | FieldReadFunction<any>,
	ip?: FieldPolicy<any> | FieldReadFunction<any>,
	localSourcePath?: FieldPolicy<any> | FieldReadFunction<any>,
	maxSourcesInParallel?: FieldPolicy<any> | FieldReadFunction<any>,
	port?: FieldPolicy<any> | FieldReadFunction<any>,
	socksProxyEnabled?: FieldPolicy<any> | FieldReadFunction<any>,
	socksProxyHost?: FieldPolicy<any> | FieldReadFunction<any>,
	socksProxyPort?: FieldPolicy<any> | FieldReadFunction<any>,
	systemTrayEnabled?: FieldPolicy<any> | FieldReadFunction<any>,
	webUIChannel?: FieldPolicy<any> | FieldReadFunction<any>,
	webUIFlavor?: FieldPolicy<any> | FieldReadFunction<any>,
	webUIInterface?: FieldPolicy<any> | FieldReadFunction<any>,
	webUIUpdateCheckInterval?: FieldPolicy<any> | FieldReadFunction<any>
};
export type SettingsTypeKeySpecifier = ('autoDownloadNewChapters' | 'backupInterval' | 'backupPath' | 'backupTTL' | 'backupTime' | 'basicAuthEnabled' | 'basicAuthPassword' | 'basicAuthUsername' | 'debugLogsEnabled' | 'downloadAsCbz' | 'downloadsPath' | 'electronPath' | 'excludeCompleted' | 'excludeNotStarted' | 'excludeUnreadChapters' | 'globalUpdateInterval' | 'initialOpenInBrowserEnabled' | 'ip' | 'localSourcePath' | 'maxSourcesInParallel' | 'port' | 'socksProxyEnabled' | 'socksProxyHost' | 'socksProxyPort' | 'systemTrayEnabled' | 'webUIChannel' | 'webUIFlavor' | 'webUIInterface' | 'webUIUpdateCheckInterval' | SettingsTypeKeySpecifier)[];
export type SettingsTypeFieldPolicy = {
	autoDownloadNewChapters?: FieldPolicy<any> | FieldReadFunction<any>,
	backupInterval?: FieldPolicy<any> | FieldReadFunction<any>,
	backupPath?: FieldPolicy<any> | FieldReadFunction<any>,
	backupTTL?: FieldPolicy<any> | FieldReadFunction<any>,
	backupTime?: FieldPolicy<any> | FieldReadFunction<any>,
	basicAuthEnabled?: FieldPolicy<any> | FieldReadFunction<any>,
	basicAuthPassword?: FieldPolicy<any> | FieldReadFunction<any>,
	basicAuthUsername?: FieldPolicy<any> | FieldReadFunction<any>,
	debugLogsEnabled?: FieldPolicy<any> | FieldReadFunction<any>,
	downloadAsCbz?: FieldPolicy<any> | FieldReadFunction<any>,
	downloadsPath?: FieldPolicy<any> | FieldReadFunction<any>,
	electronPath?: FieldPolicy<any> | FieldReadFunction<any>,
	excludeCompleted?: FieldPolicy<any> | FieldReadFunction<any>,
	excludeNotStarted?: FieldPolicy<any> | FieldReadFunction<any>,
	excludeUnreadChapters?: FieldPolicy<any> | FieldReadFunction<any>,
	globalUpdateInterval?: FieldPolicy<any> | FieldReadFunction<any>,
	initialOpenInBrowserEnabled?: FieldPolicy<any> | FieldReadFunction<any>,
	ip?: FieldPolicy<any> | FieldReadFunction<any>,
	localSourcePath?: FieldPolicy<any> | FieldReadFunction<any>,
	maxSourcesInParallel?: FieldPolicy<any> | FieldReadFunction<any>,
	port?: FieldPolicy<any> | FieldReadFunction<any>,
	socksProxyEnabled?: FieldPolicy<any> | FieldReadFunction<any>,
	socksProxyHost?: FieldPolicy<any> | FieldReadFunction<any>,
	socksProxyPort?: FieldPolicy<any> | FieldReadFunction<any>,
	systemTrayEnabled?: FieldPolicy<any> | FieldReadFunction<any>,
	webUIChannel?: FieldPolicy<any> | FieldReadFunction<any>,
	webUIFlavor?: FieldPolicy<any> | FieldReadFunction<any>,
	webUIInterface?: FieldPolicy<any> | FieldReadFunction<any>,
	webUIUpdateCheckInterval?: FieldPolicy<any> | FieldReadFunction<any>
};
export type SortFilterKeySpecifier = ('default' | 'name' | 'values' | SortFilterKeySpecifier)[];
export type SortFilterFieldPolicy = {
	default?: FieldPolicy<any> | FieldReadFunction<any>,
	name?: FieldPolicy<any> | FieldReadFunction<any>,
	values?: FieldPolicy<any> | FieldReadFunction<any>
};
export type SortSelectionKeySpecifier = ('ascending' | 'index' | SortSelectionKeySpecifier)[];
export type SortSelectionFieldPolicy = {
	ascending?: FieldPolicy<any> | FieldReadFunction<any>,
	index?: FieldPolicy<any> | FieldReadFunction<any>
};
export type SourceEdgeKeySpecifier = ('cursor' | 'node' | SourceEdgeKeySpecifier)[];
export type SourceEdgeFieldPolicy = {
	cursor?: FieldPolicy<any> | FieldReadFunction<any>,
	node?: FieldPolicy<any> | FieldReadFunction<any>
};
export type SourceNodeListKeySpecifier = ('edges' | 'nodes' | 'pageInfo' | 'totalCount' | SourceNodeListKeySpecifier)[];
export type SourceNodeListFieldPolicy = {
	edges?: FieldPolicy<any> | FieldReadFunction<any>,
	nodes?: FieldPolicy<any> | FieldReadFunction<any>,
	pageInfo?: FieldPolicy<any> | FieldReadFunction<any>,
	totalCount?: FieldPolicy<any> | FieldReadFunction<any>
};
export type SourceTypeKeySpecifier = ('displayName' | 'extension' | 'filters' | 'iconUrl' | 'id' | 'isConfigurable' | 'isNsfw' | 'lang' | 'manga' | 'name' | 'preferences' | 'supportsLatest' | SourceTypeKeySpecifier)[];
export type SourceTypeFieldPolicy = {
	displayName?: FieldPolicy<any> | FieldReadFunction<any>,
	extension?: FieldPolicy<any> | FieldReadFunction<any>,
	filters?: FieldPolicy<any> | FieldReadFunction<any>,
	iconUrl?: FieldPolicy<any> | FieldReadFunction<any>,
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	isConfigurable?: FieldPolicy<any> | FieldReadFunction<any>,
	isNsfw?: FieldPolicy<any> | FieldReadFunction<any>,
	lang?: FieldPolicy<any> | FieldReadFunction<any>,
	manga?: FieldPolicy<any> | FieldReadFunction<any>,
	name?: FieldPolicy<any> | FieldReadFunction<any>,
	preferences?: FieldPolicy<any> | FieldReadFunction<any>,
	supportsLatest?: FieldPolicy<any> | FieldReadFunction<any>
};
export type StartDownloaderPayloadKeySpecifier = ('clientMutationId' | 'downloadStatus' | StartDownloaderPayloadKeySpecifier)[];
export type StartDownloaderPayloadFieldPolicy = {
	clientMutationId?: FieldPolicy<any> | FieldReadFunction<any>,
	downloadStatus?: FieldPolicy<any> | FieldReadFunction<any>
};
export type StopDownloaderPayloadKeySpecifier = ('clientMutationId' | 'downloadStatus' | StopDownloaderPayloadKeySpecifier)[];
export type StopDownloaderPayloadFieldPolicy = {
	clientMutationId?: FieldPolicy<any> | FieldReadFunction<any>,
	downloadStatus?: FieldPolicy<any> | FieldReadFunction<any>
};
export type SubscriptionKeySpecifier = ('downloadChanged' | 'updateStatusChanged' | 'webUIUpdateStatusChange' | SubscriptionKeySpecifier)[];
export type SubscriptionFieldPolicy = {
	downloadChanged?: FieldPolicy<any> | FieldReadFunction<any>,
	updateStatusChanged?: FieldPolicy<any> | FieldReadFunction<any>,
	webUIUpdateStatusChange?: FieldPolicy<any> | FieldReadFunction<any>
};
export type SwitchPreferenceKeySpecifier = ('currentValue' | 'default' | 'key' | 'summary' | 'title' | 'visible' | SwitchPreferenceKeySpecifier)[];
export type SwitchPreferenceFieldPolicy = {
	currentValue?: FieldPolicy<any> | FieldReadFunction<any>,
	default?: FieldPolicy<any> | FieldReadFunction<any>,
	key?: FieldPolicy<any> | FieldReadFunction<any>,
	summary?: FieldPolicy<any> | FieldReadFunction<any>,
	title?: FieldPolicy<any> | FieldReadFunction<any>,
	visible?: FieldPolicy<any> | FieldReadFunction<any>
};
export type TextFilterKeySpecifier = ('default' | 'name' | TextFilterKeySpecifier)[];
export type TextFilterFieldPolicy = {
	default?: FieldPolicy<any> | FieldReadFunction<any>,
	name?: FieldPolicy<any> | FieldReadFunction<any>
};
export type TriStateFilterKeySpecifier = ('default' | 'name' | TriStateFilterKeySpecifier)[];
export type TriStateFilterFieldPolicy = {
	default?: FieldPolicy<any> | FieldReadFunction<any>,
	name?: FieldPolicy<any> | FieldReadFunction<any>
};
export type UpdateCategoriesPayloadKeySpecifier = ('categories' | 'clientMutationId' | UpdateCategoriesPayloadKeySpecifier)[];
export type UpdateCategoriesPayloadFieldPolicy = {
	categories?: FieldPolicy<any> | FieldReadFunction<any>,
	clientMutationId?: FieldPolicy<any> | FieldReadFunction<any>
};
export type UpdateCategoryMangaPayloadKeySpecifier = ('clientMutationId' | 'updateStatus' | UpdateCategoryMangaPayloadKeySpecifier)[];
export type UpdateCategoryMangaPayloadFieldPolicy = {
	clientMutationId?: FieldPolicy<any> | FieldReadFunction<any>,
	updateStatus?: FieldPolicy<any> | FieldReadFunction<any>
};
export type UpdateCategoryOrderPayloadKeySpecifier = ('categories' | 'clientMutationId' | UpdateCategoryOrderPayloadKeySpecifier)[];
export type UpdateCategoryOrderPayloadFieldPolicy = {
	categories?: FieldPolicy<any> | FieldReadFunction<any>,
	clientMutationId?: FieldPolicy<any> | FieldReadFunction<any>
};
export type UpdateCategoryPayloadKeySpecifier = ('category' | 'clientMutationId' | UpdateCategoryPayloadKeySpecifier)[];
export type UpdateCategoryPayloadFieldPolicy = {
	category?: FieldPolicy<any> | FieldReadFunction<any>,
	clientMutationId?: FieldPolicy<any> | FieldReadFunction<any>
};
export type UpdateChapterPayloadKeySpecifier = ('chapter' | 'clientMutationId' | UpdateChapterPayloadKeySpecifier)[];
export type UpdateChapterPayloadFieldPolicy = {
	chapter?: FieldPolicy<any> | FieldReadFunction<any>,
	clientMutationId?: FieldPolicy<any> | FieldReadFunction<any>
};
export type UpdateChaptersPayloadKeySpecifier = ('chapters' | 'clientMutationId' | UpdateChaptersPayloadKeySpecifier)[];
export type UpdateChaptersPayloadFieldPolicy = {
	chapters?: FieldPolicy<any> | FieldReadFunction<any>,
	clientMutationId?: FieldPolicy<any> | FieldReadFunction<any>
};
export type UpdateExtensionPayloadKeySpecifier = ('clientMutationId' | 'extension' | UpdateExtensionPayloadKeySpecifier)[];
export type UpdateExtensionPayloadFieldPolicy = {
	clientMutationId?: FieldPolicy<any> | FieldReadFunction<any>,
	extension?: FieldPolicy<any> | FieldReadFunction<any>
};
export type UpdateExtensionsPayloadKeySpecifier = ('clientMutationId' | 'extensions' | UpdateExtensionsPayloadKeySpecifier)[];
export type UpdateExtensionsPayloadFieldPolicy = {
	clientMutationId?: FieldPolicy<any> | FieldReadFunction<any>,
	extensions?: FieldPolicy<any> | FieldReadFunction<any>
};
export type UpdateLibraryMangaPayloadKeySpecifier = ('clientMutationId' | 'updateStatus' | UpdateLibraryMangaPayloadKeySpecifier)[];
export type UpdateLibraryMangaPayloadFieldPolicy = {
	clientMutationId?: FieldPolicy<any> | FieldReadFunction<any>,
	updateStatus?: FieldPolicy<any> | FieldReadFunction<any>
};
export type UpdateMangaCategoriesPayloadKeySpecifier = ('clientMutationId' | 'manga' | UpdateMangaCategoriesPayloadKeySpecifier)[];
export type UpdateMangaCategoriesPayloadFieldPolicy = {
	clientMutationId?: FieldPolicy<any> | FieldReadFunction<any>,
	manga?: FieldPolicy<any> | FieldReadFunction<any>
};
export type UpdateMangaPayloadKeySpecifier = ('clientMutationId' | 'manga' | UpdateMangaPayloadKeySpecifier)[];
export type UpdateMangaPayloadFieldPolicy = {
	clientMutationId?: FieldPolicy<any> | FieldReadFunction<any>,
	manga?: FieldPolicy<any> | FieldReadFunction<any>
};
export type UpdateMangasCategoriesPayloadKeySpecifier = ('clientMutationId' | 'mangas' | UpdateMangasCategoriesPayloadKeySpecifier)[];
export type UpdateMangasCategoriesPayloadFieldPolicy = {
	clientMutationId?: FieldPolicy<any> | FieldReadFunction<any>,
	mangas?: FieldPolicy<any> | FieldReadFunction<any>
};
export type UpdateMangasPayloadKeySpecifier = ('clientMutationId' | 'mangas' | UpdateMangasPayloadKeySpecifier)[];
export type UpdateMangasPayloadFieldPolicy = {
	clientMutationId?: FieldPolicy<any> | FieldReadFunction<any>,
	mangas?: FieldPolicy<any> | FieldReadFunction<any>
};
export type UpdateSourcePreferencePayloadKeySpecifier = ('clientMutationId' | 'preferences' | 'source' | UpdateSourcePreferencePayloadKeySpecifier)[];
export type UpdateSourcePreferencePayloadFieldPolicy = {
	clientMutationId?: FieldPolicy<any> | FieldReadFunction<any>,
	preferences?: FieldPolicy<any> | FieldReadFunction<any>,
	source?: FieldPolicy<any> | FieldReadFunction<any>
};
export type UpdateStatusKeySpecifier = ('completeJobs' | 'failedJobs' | 'isRunning' | 'pendingJobs' | 'runningJobs' | 'skippedCategories' | 'skippedJobs' | 'updatingCategories' | UpdateStatusKeySpecifier)[];
export type UpdateStatusFieldPolicy = {
	completeJobs?: FieldPolicy<any> | FieldReadFunction<any>,
	failedJobs?: FieldPolicy<any> | FieldReadFunction<any>,
	isRunning?: FieldPolicy<any> | FieldReadFunction<any>,
	pendingJobs?: FieldPolicy<any> | FieldReadFunction<any>,
	runningJobs?: FieldPolicy<any> | FieldReadFunction<any>,
	skippedCategories?: FieldPolicy<any> | FieldReadFunction<any>,
	skippedJobs?: FieldPolicy<any> | FieldReadFunction<any>,
	updatingCategories?: FieldPolicy<any> | FieldReadFunction<any>
};
export type UpdateStatusCategoryTypeKeySpecifier = ('categories' | UpdateStatusCategoryTypeKeySpecifier)[];
export type UpdateStatusCategoryTypeFieldPolicy = {
	categories?: FieldPolicy<any> | FieldReadFunction<any>
};
export type UpdateStatusTypeKeySpecifier = ('mangas' | UpdateStatusTypeKeySpecifier)[];
export type UpdateStatusTypeFieldPolicy = {
	mangas?: FieldPolicy<any> | FieldReadFunction<any>
};
export type UpdateStopPayloadKeySpecifier = ('clientMutationId' | UpdateStopPayloadKeySpecifier)[];
export type UpdateStopPayloadFieldPolicy = {
	clientMutationId?: FieldPolicy<any> | FieldReadFunction<any>
};
export type ValidateBackupResultKeySpecifier = ('missingSources' | ValidateBackupResultKeySpecifier)[];
export type ValidateBackupResultFieldPolicy = {
	missingSources?: FieldPolicy<any> | FieldReadFunction<any>
};
export type ValidateBackupSourceKeySpecifier = ('id' | 'name' | ValidateBackupSourceKeySpecifier)[];
export type ValidateBackupSourceFieldPolicy = {
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	name?: FieldPolicy<any> | FieldReadFunction<any>
};
export type WebUIUpdateInfoKeySpecifier = ('channel' | 'tag' | 'updateAvailable' | WebUIUpdateInfoKeySpecifier)[];
export type WebUIUpdateInfoFieldPolicy = {
	channel?: FieldPolicy<any> | FieldReadFunction<any>,
	tag?: FieldPolicy<any> | FieldReadFunction<any>,
	updateAvailable?: FieldPolicy<any> | FieldReadFunction<any>
};
export type WebUIUpdatePayloadKeySpecifier = ('clientMutationId' | 'updateStatus' | WebUIUpdatePayloadKeySpecifier)[];
export type WebUIUpdatePayloadFieldPolicy = {
	clientMutationId?: FieldPolicy<any> | FieldReadFunction<any>,
	updateStatus?: FieldPolicy<any> | FieldReadFunction<any>
};
export type WebUIUpdateStatusKeySpecifier = ('info' | 'progress' | 'state' | WebUIUpdateStatusKeySpecifier)[];
export type WebUIUpdateStatusFieldPolicy = {
	info?: FieldPolicy<any> | FieldReadFunction<any>,
	progress?: FieldPolicy<any> | FieldReadFunction<any>,
	state?: FieldPolicy<any> | FieldReadFunction<any>
};
export type StrictTypedTypePolicies = {
	AboutPayload?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | AboutPayloadKeySpecifier | (() => undefined | AboutPayloadKeySpecifier),
		fields?: AboutPayloadFieldPolicy,
	},
	BackupRestoreStatus?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | BackupRestoreStatusKeySpecifier | (() => undefined | BackupRestoreStatusKeySpecifier),
		fields?: BackupRestoreStatusFieldPolicy,
	},
	CategoryEdge?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | CategoryEdgeKeySpecifier | (() => undefined | CategoryEdgeKeySpecifier),
		fields?: CategoryEdgeFieldPolicy,
	},
	CategoryMetaType?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | CategoryMetaTypeKeySpecifier | (() => undefined | CategoryMetaTypeKeySpecifier),
		fields?: CategoryMetaTypeFieldPolicy,
	},
	CategoryNodeList?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | CategoryNodeListKeySpecifier | (() => undefined | CategoryNodeListKeySpecifier),
		fields?: CategoryNodeListFieldPolicy,
	},
	CategoryType?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | CategoryTypeKeySpecifier | (() => undefined | CategoryTypeKeySpecifier),
		fields?: CategoryTypeFieldPolicy,
	},
	ChapterEdge?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | ChapterEdgeKeySpecifier | (() => undefined | ChapterEdgeKeySpecifier),
		fields?: ChapterEdgeFieldPolicy,
	},
	ChapterMetaType?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | ChapterMetaTypeKeySpecifier | (() => undefined | ChapterMetaTypeKeySpecifier),
		fields?: ChapterMetaTypeFieldPolicy,
	},
	ChapterNodeList?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | ChapterNodeListKeySpecifier | (() => undefined | ChapterNodeListKeySpecifier),
		fields?: ChapterNodeListFieldPolicy,
	},
	ChapterType?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | ChapterTypeKeySpecifier | (() => undefined | ChapterTypeKeySpecifier),
		fields?: ChapterTypeFieldPolicy,
	},
	CheckBoxFilter?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | CheckBoxFilterKeySpecifier | (() => undefined | CheckBoxFilterKeySpecifier),
		fields?: CheckBoxFilterFieldPolicy,
	},
	CheckBoxPreference?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | CheckBoxPreferenceKeySpecifier | (() => undefined | CheckBoxPreferenceKeySpecifier),
		fields?: CheckBoxPreferenceFieldPolicy,
	},
	CheckForServerUpdatesPayload?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | CheckForServerUpdatesPayloadKeySpecifier | (() => undefined | CheckForServerUpdatesPayloadKeySpecifier),
		fields?: CheckForServerUpdatesPayloadFieldPolicy,
	},
	ClearDownloaderPayload?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | ClearDownloaderPayloadKeySpecifier | (() => undefined | ClearDownloaderPayloadKeySpecifier),
		fields?: ClearDownloaderPayloadFieldPolicy,
	},
	CreateBackupPayload?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | CreateBackupPayloadKeySpecifier | (() => undefined | CreateBackupPayloadKeySpecifier),
		fields?: CreateBackupPayloadFieldPolicy,
	},
	CreateCategoryPayload?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | CreateCategoryPayloadKeySpecifier | (() => undefined | CreateCategoryPayloadKeySpecifier),
		fields?: CreateCategoryPayloadFieldPolicy,
	},
	DeleteCategoryMetaPayload?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | DeleteCategoryMetaPayloadKeySpecifier | (() => undefined | DeleteCategoryMetaPayloadKeySpecifier),
		fields?: DeleteCategoryMetaPayloadFieldPolicy,
	},
	DeleteCategoryPayload?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | DeleteCategoryPayloadKeySpecifier | (() => undefined | DeleteCategoryPayloadKeySpecifier),
		fields?: DeleteCategoryPayloadFieldPolicy,
	},
	DeleteChapterMetaPayload?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | DeleteChapterMetaPayloadKeySpecifier | (() => undefined | DeleteChapterMetaPayloadKeySpecifier),
		fields?: DeleteChapterMetaPayloadFieldPolicy,
	},
	DeleteDownloadedChapterPayload?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | DeleteDownloadedChapterPayloadKeySpecifier | (() => undefined | DeleteDownloadedChapterPayloadKeySpecifier),
		fields?: DeleteDownloadedChapterPayloadFieldPolicy,
	},
	DeleteDownloadedChaptersPayload?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | DeleteDownloadedChaptersPayloadKeySpecifier | (() => undefined | DeleteDownloadedChaptersPayloadKeySpecifier),
		fields?: DeleteDownloadedChaptersPayloadFieldPolicy,
	},
	DeleteGlobalMetaPayload?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | DeleteGlobalMetaPayloadKeySpecifier | (() => undefined | DeleteGlobalMetaPayloadKeySpecifier),
		fields?: DeleteGlobalMetaPayloadFieldPolicy,
	},
	DeleteMangaMetaPayload?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | DeleteMangaMetaPayloadKeySpecifier | (() => undefined | DeleteMangaMetaPayloadKeySpecifier),
		fields?: DeleteMangaMetaPayloadFieldPolicy,
	},
	DequeueChapterDownloadPayload?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | DequeueChapterDownloadPayloadKeySpecifier | (() => undefined | DequeueChapterDownloadPayloadKeySpecifier),
		fields?: DequeueChapterDownloadPayloadFieldPolicy,
	},
	DequeueChapterDownloadsPayload?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | DequeueChapterDownloadsPayloadKeySpecifier | (() => undefined | DequeueChapterDownloadsPayloadKeySpecifier),
		fields?: DequeueChapterDownloadsPayloadFieldPolicy,
	},
	DownloadAheadPayload?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | DownloadAheadPayloadKeySpecifier | (() => undefined | DownloadAheadPayloadKeySpecifier),
		fields?: DownloadAheadPayloadFieldPolicy,
	},
	DownloadEdge?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | DownloadEdgeKeySpecifier | (() => undefined | DownloadEdgeKeySpecifier),
		fields?: DownloadEdgeFieldPolicy,
	},
	DownloadNodeList?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | DownloadNodeListKeySpecifier | (() => undefined | DownloadNodeListKeySpecifier),
		fields?: DownloadNodeListFieldPolicy,
	},
	DownloadStatus?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | DownloadStatusKeySpecifier | (() => undefined | DownloadStatusKeySpecifier),
		fields?: DownloadStatusFieldPolicy,
	},
	DownloadType?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | DownloadTypeKeySpecifier | (() => undefined | DownloadTypeKeySpecifier),
		fields?: DownloadTypeFieldPolicy,
	},
	Edge?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | EdgeKeySpecifier | (() => undefined | EdgeKeySpecifier),
		fields?: EdgeFieldPolicy,
	},
	EditTextPreference?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | EditTextPreferenceKeySpecifier | (() => undefined | EditTextPreferenceKeySpecifier),
		fields?: EditTextPreferenceFieldPolicy,
	},
	EnqueueChapterDownloadPayload?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | EnqueueChapterDownloadPayloadKeySpecifier | (() => undefined | EnqueueChapterDownloadPayloadKeySpecifier),
		fields?: EnqueueChapterDownloadPayloadFieldPolicy,
	},
	EnqueueChapterDownloadsPayload?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | EnqueueChapterDownloadsPayloadKeySpecifier | (() => undefined | EnqueueChapterDownloadsPayloadKeySpecifier),
		fields?: EnqueueChapterDownloadsPayloadFieldPolicy,
	},
	ExtensionEdge?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | ExtensionEdgeKeySpecifier | (() => undefined | ExtensionEdgeKeySpecifier),
		fields?: ExtensionEdgeFieldPolicy,
	},
	ExtensionNodeList?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | ExtensionNodeListKeySpecifier | (() => undefined | ExtensionNodeListKeySpecifier),
		fields?: ExtensionNodeListFieldPolicy,
	},
	ExtensionType?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | ExtensionTypeKeySpecifier | (() => undefined | ExtensionTypeKeySpecifier),
		fields?: ExtensionTypeFieldPolicy,
	},
	FetchChapterPagesPayload?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | FetchChapterPagesPayloadKeySpecifier | (() => undefined | FetchChapterPagesPayloadKeySpecifier),
		fields?: FetchChapterPagesPayloadFieldPolicy,
	},
	FetchChaptersPayload?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | FetchChaptersPayloadKeySpecifier | (() => undefined | FetchChaptersPayloadKeySpecifier),
		fields?: FetchChaptersPayloadFieldPolicy,
	},
	FetchExtensionsPayload?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | FetchExtensionsPayloadKeySpecifier | (() => undefined | FetchExtensionsPayloadKeySpecifier),
		fields?: FetchExtensionsPayloadFieldPolicy,
	},
	FetchMangaPayload?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | FetchMangaPayloadKeySpecifier | (() => undefined | FetchMangaPayloadKeySpecifier),
		fields?: FetchMangaPayloadFieldPolicy,
	},
	FetchSourceMangaPayload?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | FetchSourceMangaPayloadKeySpecifier | (() => undefined | FetchSourceMangaPayloadKeySpecifier),
		fields?: FetchSourceMangaPayloadFieldPolicy,
	},
	GlobalMetaNodeList?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | GlobalMetaNodeListKeySpecifier | (() => undefined | GlobalMetaNodeListKeySpecifier),
		fields?: GlobalMetaNodeListFieldPolicy,
	},
	GlobalMetaType?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | GlobalMetaTypeKeySpecifier | (() => undefined | GlobalMetaTypeKeySpecifier),
		fields?: GlobalMetaTypeFieldPolicy,
	},
	GroupFilter?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | GroupFilterKeySpecifier | (() => undefined | GroupFilterKeySpecifier),
		fields?: GroupFilterFieldPolicy,
	},
	HeaderFilter?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | HeaderFilterKeySpecifier | (() => undefined | HeaderFilterKeySpecifier),
		fields?: HeaderFilterFieldPolicy,
	},
	InstallExternalExtensionPayload?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | InstallExternalExtensionPayloadKeySpecifier | (() => undefined | InstallExternalExtensionPayloadKeySpecifier),
		fields?: InstallExternalExtensionPayloadFieldPolicy,
	},
	LastUpdateTimestampPayload?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | LastUpdateTimestampPayloadKeySpecifier | (() => undefined | LastUpdateTimestampPayloadKeySpecifier),
		fields?: LastUpdateTimestampPayloadFieldPolicy,
	},
	ListPreference?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | ListPreferenceKeySpecifier | (() => undefined | ListPreferenceKeySpecifier),
		fields?: ListPreferenceFieldPolicy,
	},
	MangaEdge?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | MangaEdgeKeySpecifier | (() => undefined | MangaEdgeKeySpecifier),
		fields?: MangaEdgeFieldPolicy,
	},
	MangaMetaType?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | MangaMetaTypeKeySpecifier | (() => undefined | MangaMetaTypeKeySpecifier),
		fields?: MangaMetaTypeFieldPolicy,
	},
	MangaNodeList?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | MangaNodeListKeySpecifier | (() => undefined | MangaNodeListKeySpecifier),
		fields?: MangaNodeListFieldPolicy,
	},
	MangaType?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | MangaTypeKeySpecifier | (() => undefined | MangaTypeKeySpecifier),
		fields?: MangaTypeFieldPolicy,
	},
	MetaEdge?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | MetaEdgeKeySpecifier | (() => undefined | MetaEdgeKeySpecifier),
		fields?: MetaEdgeFieldPolicy,
	},
	MetaType?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | MetaTypeKeySpecifier | (() => undefined | MetaTypeKeySpecifier),
		fields?: MetaTypeFieldPolicy,
	},
	MultiSelectListPreference?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | MultiSelectListPreferenceKeySpecifier | (() => undefined | MultiSelectListPreferenceKeySpecifier),
		fields?: MultiSelectListPreferenceFieldPolicy,
	},
	Mutation?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | MutationKeySpecifier | (() => undefined | MutationKeySpecifier),
		fields?: MutationFieldPolicy,
	},
	NodeList?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | NodeListKeySpecifier | (() => undefined | NodeListKeySpecifier),
		fields?: NodeListFieldPolicy,
	},
	PageInfo?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | PageInfoKeySpecifier | (() => undefined | PageInfoKeySpecifier),
		fields?: PageInfoFieldPolicy,
	},
	PartialSettingsType?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | PartialSettingsTypeKeySpecifier | (() => undefined | PartialSettingsTypeKeySpecifier),
		fields?: PartialSettingsTypeFieldPolicy,
	},
	Query?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | QueryKeySpecifier | (() => undefined | QueryKeySpecifier),
		fields?: QueryFieldPolicy,
	},
	ReorderChapterDownloadPayload?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | ReorderChapterDownloadPayloadKeySpecifier | (() => undefined | ReorderChapterDownloadPayloadKeySpecifier),
		fields?: ReorderChapterDownloadPayloadFieldPolicy,
	},
	ResetSettingsPayload?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | ResetSettingsPayloadKeySpecifier | (() => undefined | ResetSettingsPayloadKeySpecifier),
		fields?: ResetSettingsPayloadFieldPolicy,
	},
	RestoreBackupPayload?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | RestoreBackupPayloadKeySpecifier | (() => undefined | RestoreBackupPayloadKeySpecifier),
		fields?: RestoreBackupPayloadFieldPolicy,
	},
	SelectFilter?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | SelectFilterKeySpecifier | (() => undefined | SelectFilterKeySpecifier),
		fields?: SelectFilterFieldPolicy,
	},
	SeparatorFilter?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | SeparatorFilterKeySpecifier | (() => undefined | SeparatorFilterKeySpecifier),
		fields?: SeparatorFilterFieldPolicy,
	},
	SetCategoryMetaPayload?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | SetCategoryMetaPayloadKeySpecifier | (() => undefined | SetCategoryMetaPayloadKeySpecifier),
		fields?: SetCategoryMetaPayloadFieldPolicy,
	},
	SetChapterMetaPayload?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | SetChapterMetaPayloadKeySpecifier | (() => undefined | SetChapterMetaPayloadKeySpecifier),
		fields?: SetChapterMetaPayloadFieldPolicy,
	},
	SetGlobalMetaPayload?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | SetGlobalMetaPayloadKeySpecifier | (() => undefined | SetGlobalMetaPayloadKeySpecifier),
		fields?: SetGlobalMetaPayloadFieldPolicy,
	},
	SetMangaMetaPayload?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | SetMangaMetaPayloadKeySpecifier | (() => undefined | SetMangaMetaPayloadKeySpecifier),
		fields?: SetMangaMetaPayloadFieldPolicy,
	},
	SetSettingsPayload?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | SetSettingsPayloadKeySpecifier | (() => undefined | SetSettingsPayloadKeySpecifier),
		fields?: SetSettingsPayloadFieldPolicy,
	},
	Settings?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | SettingsKeySpecifier | (() => undefined | SettingsKeySpecifier),
		fields?: SettingsFieldPolicy,
	},
	SettingsType?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | SettingsTypeKeySpecifier | (() => undefined | SettingsTypeKeySpecifier),
		fields?: SettingsTypeFieldPolicy,
	},
	SortFilter?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | SortFilterKeySpecifier | (() => undefined | SortFilterKeySpecifier),
		fields?: SortFilterFieldPolicy,
	},
	SortSelection?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | SortSelectionKeySpecifier | (() => undefined | SortSelectionKeySpecifier),
		fields?: SortSelectionFieldPolicy,
	},
	SourceEdge?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | SourceEdgeKeySpecifier | (() => undefined | SourceEdgeKeySpecifier),
		fields?: SourceEdgeFieldPolicy,
	},
	SourceNodeList?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | SourceNodeListKeySpecifier | (() => undefined | SourceNodeListKeySpecifier),
		fields?: SourceNodeListFieldPolicy,
	},
	SourceType?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | SourceTypeKeySpecifier | (() => undefined | SourceTypeKeySpecifier),
		fields?: SourceTypeFieldPolicy,
	},
	StartDownloaderPayload?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | StartDownloaderPayloadKeySpecifier | (() => undefined | StartDownloaderPayloadKeySpecifier),
		fields?: StartDownloaderPayloadFieldPolicy,
	},
	StopDownloaderPayload?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | StopDownloaderPayloadKeySpecifier | (() => undefined | StopDownloaderPayloadKeySpecifier),
		fields?: StopDownloaderPayloadFieldPolicy,
	},
	Subscription?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | SubscriptionKeySpecifier | (() => undefined | SubscriptionKeySpecifier),
		fields?: SubscriptionFieldPolicy,
	},
	SwitchPreference?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | SwitchPreferenceKeySpecifier | (() => undefined | SwitchPreferenceKeySpecifier),
		fields?: SwitchPreferenceFieldPolicy,
	},
	TextFilter?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | TextFilterKeySpecifier | (() => undefined | TextFilterKeySpecifier),
		fields?: TextFilterFieldPolicy,
	},
	TriStateFilter?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | TriStateFilterKeySpecifier | (() => undefined | TriStateFilterKeySpecifier),
		fields?: TriStateFilterFieldPolicy,
	},
	UpdateCategoriesPayload?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | UpdateCategoriesPayloadKeySpecifier | (() => undefined | UpdateCategoriesPayloadKeySpecifier),
		fields?: UpdateCategoriesPayloadFieldPolicy,
	},
	UpdateCategoryMangaPayload?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | UpdateCategoryMangaPayloadKeySpecifier | (() => undefined | UpdateCategoryMangaPayloadKeySpecifier),
		fields?: UpdateCategoryMangaPayloadFieldPolicy,
	},
	UpdateCategoryOrderPayload?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | UpdateCategoryOrderPayloadKeySpecifier | (() => undefined | UpdateCategoryOrderPayloadKeySpecifier),
		fields?: UpdateCategoryOrderPayloadFieldPolicy,
	},
	UpdateCategoryPayload?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | UpdateCategoryPayloadKeySpecifier | (() => undefined | UpdateCategoryPayloadKeySpecifier),
		fields?: UpdateCategoryPayloadFieldPolicy,
	},
	UpdateChapterPayload?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | UpdateChapterPayloadKeySpecifier | (() => undefined | UpdateChapterPayloadKeySpecifier),
		fields?: UpdateChapterPayloadFieldPolicy,
	},
	UpdateChaptersPayload?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | UpdateChaptersPayloadKeySpecifier | (() => undefined | UpdateChaptersPayloadKeySpecifier),
		fields?: UpdateChaptersPayloadFieldPolicy,
	},
	UpdateExtensionPayload?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | UpdateExtensionPayloadKeySpecifier | (() => undefined | UpdateExtensionPayloadKeySpecifier),
		fields?: UpdateExtensionPayloadFieldPolicy,
	},
	UpdateExtensionsPayload?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | UpdateExtensionsPayloadKeySpecifier | (() => undefined | UpdateExtensionsPayloadKeySpecifier),
		fields?: UpdateExtensionsPayloadFieldPolicy,
	},
	UpdateLibraryMangaPayload?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | UpdateLibraryMangaPayloadKeySpecifier | (() => undefined | UpdateLibraryMangaPayloadKeySpecifier),
		fields?: UpdateLibraryMangaPayloadFieldPolicy,
	},
	UpdateMangaCategoriesPayload?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | UpdateMangaCategoriesPayloadKeySpecifier | (() => undefined | UpdateMangaCategoriesPayloadKeySpecifier),
		fields?: UpdateMangaCategoriesPayloadFieldPolicy,
	},
	UpdateMangaPayload?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | UpdateMangaPayloadKeySpecifier | (() => undefined | UpdateMangaPayloadKeySpecifier),
		fields?: UpdateMangaPayloadFieldPolicy,
	},
	UpdateMangasCategoriesPayload?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | UpdateMangasCategoriesPayloadKeySpecifier | (() => undefined | UpdateMangasCategoriesPayloadKeySpecifier),
		fields?: UpdateMangasCategoriesPayloadFieldPolicy,
	},
	UpdateMangasPayload?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | UpdateMangasPayloadKeySpecifier | (() => undefined | UpdateMangasPayloadKeySpecifier),
		fields?: UpdateMangasPayloadFieldPolicy,
	},
	UpdateSourcePreferencePayload?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | UpdateSourcePreferencePayloadKeySpecifier | (() => undefined | UpdateSourcePreferencePayloadKeySpecifier),
		fields?: UpdateSourcePreferencePayloadFieldPolicy,
	},
	UpdateStatus?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | UpdateStatusKeySpecifier | (() => undefined | UpdateStatusKeySpecifier),
		fields?: UpdateStatusFieldPolicy,
	},
	UpdateStatusCategoryType?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | UpdateStatusCategoryTypeKeySpecifier | (() => undefined | UpdateStatusCategoryTypeKeySpecifier),
		fields?: UpdateStatusCategoryTypeFieldPolicy,
	},
	UpdateStatusType?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | UpdateStatusTypeKeySpecifier | (() => undefined | UpdateStatusTypeKeySpecifier),
		fields?: UpdateStatusTypeFieldPolicy,
	},
	UpdateStopPayload?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | UpdateStopPayloadKeySpecifier | (() => undefined | UpdateStopPayloadKeySpecifier),
		fields?: UpdateStopPayloadFieldPolicy,
	},
	ValidateBackupResult?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | ValidateBackupResultKeySpecifier | (() => undefined | ValidateBackupResultKeySpecifier),
		fields?: ValidateBackupResultFieldPolicy,
	},
	ValidateBackupSource?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | ValidateBackupSourceKeySpecifier | (() => undefined | ValidateBackupSourceKeySpecifier),
		fields?: ValidateBackupSourceFieldPolicy,
	},
	WebUIUpdateInfo?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | WebUIUpdateInfoKeySpecifier | (() => undefined | WebUIUpdateInfoKeySpecifier),
		fields?: WebUIUpdateInfoFieldPolicy,
	},
	WebUIUpdatePayload?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | WebUIUpdatePayloadKeySpecifier | (() => undefined | WebUIUpdatePayloadKeySpecifier),
		fields?: WebUIUpdatePayloadFieldPolicy,
	},
	WebUIUpdateStatus?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | WebUIUpdateStatusKeySpecifier | (() => undefined | WebUIUpdateStatusKeySpecifier),
		fields?: WebUIUpdateStatusFieldPolicy,
	}
};
export type TypedTypePolicies = StrictTypedTypePolicies & TypePolicies;