/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

interface IExtension {
    name: string
    pkgName: string
    versionName: string
    versionCode: number
    lang: string
    isNsfw: boolean
    apkName: string
    iconUrl: string
    installed: boolean
    hasUpdate: boolean
    obsolete: boolean
}

interface ISource {
    id: string
    name: string
    lang: string
    iconUrl: string
    supportsLatest: boolean
    isConfigurable: boolean
    isNsfw: boolean
    displayName: string
}

interface IMangaCard {
    id: number
    title: string
    thumbnailUrl: string
    unreadCount?: number
}

interface IManga {
    id: number
    sourceId: string

    url: string
    title: string
    thumbnailUrl: string

    artist: string
    author: string
    description: string
    genre: string[]
    status: string

    inLibrary: boolean
    source: ISource

    realUrl: string

    freshData: boolean
    unreadCount?: number
}

interface IChapter {
    url: string
    name: string
    uploadDate: number
    chapterNumber: number
    scanlator: string
    mangaId: number
    read: boolean
    bookmarked: boolean
    lastPageRead: number
    index: number
    fetchedAt: number
    chapterCount: number
    pageCount: number
    downloaded: boolean
}

interface IMangaChapter {
    manga: IManga
    chapter: IChapter
}

interface IPartialChpter {
    pageCount: number
    index: number
    chapterCount: number
}

interface ICategory {
    id: number
    order: number
    name: string
    default: boolean
}

interface INavbarOverride {
    status: boolean
    value: any
}

type ReaderType =
'ContinuesVertical' |
'Webtoon' |
'SingleVertical' |
'SingleRTL' |
'SingleLTR' |
'DoubleVertical' |
'DoubleRTL' |
'DoubleLTR' |
'ContinuesHorizontalLTR' |
'ContinuesHorizontalRTL';

interface IReaderSettings{
    staticNav: boolean
    showPageNumber: boolean
    loadNextonEnding: boolean
    readerType: ReaderType
}

interface IReaderPage {
    index: number
    src: string
}

interface IReaderProps {
    pages: Array<IReaderPage>
    pageCount: number
    setCurPage: React.Dispatch<React.SetStateAction<number>>
    curPage: number
    settings: IReaderSettings
    manga: IMangaCard | IManga
    chapter: IChapter | IPartialChpter
    nextChapter: () => void
    prevChapter: () => void
}

interface IAbout {
    name: string
    version: string
    revision: string
    buildType: 'Stable' | 'Preview'
    buildTime: number
    github: string
    discord: string
}

interface IDownloadChapter{
    chapterIndex: number
    mangaId: number
    state: 'Queued' | 'Downloading' | 'Finished' | 'Error'
    progress: number
    chapter: IChapter
}

interface IQueue {
    status: 'Stopped' | 'Started'
    queue: IDownloadChapter[]
}

interface PreferenceProps {
    key: string
    title: string
    summary: string
    defaultValue: any
    currentValue: any
    defaultValueType: string

    // intetnal props
    updateValue: any
}

interface TwoStatePreferenceProps extends PreferenceProps {

    // intetnal props
    type: 'Switch' | 'Checkbox'
}
interface CheckBoxPreferenceProps extends PreferenceProps {}
interface SwitchPreferenceCompatProps extends PreferenceProps {}
interface ListPreferenceProps extends PreferenceProps {
    entries: string[]
    entryValues: string[]
}
interface EditTextPreferenceProps extends PreferenceProps {
    dialogTitle: string
    dialogMessage: string
    text: string
}

interface SourcePreferences {
    type: string
    props: any
}

interface NavbarItem{
    path: string,
    title:string,
    IconComponent: OverridableComponent<SvgIconTypeMap<{}, 'svg'>>,
}
