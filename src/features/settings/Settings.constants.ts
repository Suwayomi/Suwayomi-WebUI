/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { DEFAULT_DEVICE } from '@/features/device/services/Device.ts';
import { DEFAULT_SORT_SETTINGS } from '@/features/migration/Migration.constants.ts';
import { GlobalUpdateSkipEntriesSettings, MetadataServerSettings } from '@/features/settings/Settings.types.ts';
import { GridLayout, TranslationKey } from '@/base/Base.types.ts';
import { getDefaultLanguages } from '@/base/utils/Languages.ts';
import { ThemeMode } from '@/features/theme/AppThemeContext.tsx';
import { SelectSettingValue, SelectSettingValueDisplayInfo } from '@/base/components/settings/SelectSetting.tsx';
import { AuthMode, WebUiChannel, WebUiFlavor, WebUiInterface } from '@/lib/graphql/generated/graphql.ts';

export const MANGA_GRID_WIDTH = {
    min: 100,
    max: 1000,
    step: 10,
    default: 300,
};

export const SERVER_SETTINGS_METADATA_DEFAULT: MetadataServerSettings = {
    // downloads
    deleteChaptersManuallyMarkedRead: false,
    deleteChaptersWhileReading: 0,
    deleteChaptersWithBookmark: false,
    downloadAheadLimit: 0,

    // library
    showAddToLibraryCategorySelectDialog: true,
    ignoreFilters: false,
    removeMangaFromCategories: false,
    showTabSize: false,
    showContinueReadingButton: false,
    showDownloadBadge: false,
    showUnreadBadge: false,
    gridLayout: GridLayout.Compact,

    // client
    devices: [DEFAULT_DEVICE],

    // migration
    migrateChapters: true,
    migrateCategories: true,
    migrateTracking: true,
    deleteChapters: true,
    migrateSortSettings: DEFAULT_SORT_SETTINGS,

    // browse
    hideLibraryEntries: false,
    extensionLanguages: getDefaultLanguages(),
    sourceLanguages: getDefaultLanguages(),
    showNsfw: true,
    lastUsedSourceId: null,
    shouldShowOnlySourcesWithResults: true,

    // history
    hideHistory: false,

    // tracking
    updateProgressAfterReading: true,
    updateProgressManualMarkRead: false,

    // updates
    webUIInformAvailableUpdate: true,
    serverInformAvailableUpdate: true,

    // themes
    appTheme: 'default',
    themeMode: ThemeMode.SYSTEM,
    shouldUsePureBlackMode: false,
    customThemes: {},
    mangaThumbnailBackdrop: true,
    mangaDynamicColorSchemes: true,
    mangaGridItemWidth: MANGA_GRID_WIDTH.default,
};

const AUTH_MODES = [AuthMode.None].concat(Object.values(AuthMode).filter((mode) => mode !== AuthMode.None));
const AUTH_MODES_TO_TRANSLATION_KEY: { [mode in AuthMode]: SelectSettingValueDisplayInfo } = {
    [AuthMode.None]: {
        text: 'settings.server.auth.mode.option.none.label.title',
        description: 'settings.server.auth.mode.option.none.label.description',
        disclaimer: 'settings.server.auth.mode.option.none.label.info',
    },
    [AuthMode.BasicAuth]: {
        text: 'settings.server.auth.mode.option.basicAuth.label.title',
        description: 'settings.server.auth.mode.option.basicAuth.label.description',
    },
    [AuthMode.SimpleLogin]: {
        text: 'settings.server.auth.mode.option.simpleLogin.label.title',
        description: 'settings.server.auth.mode.option.simpleLogin.label.description',
        disclaimer: 'settings.server.auth.mode.option.simpleLogin.label.info',
    },
};
export const AUTH_MODES_SELECT_VALUES: SelectSettingValue<AuthMode>[] = AUTH_MODES.map((mode) => [
    mode,
    AUTH_MODES_TO_TRANSLATION_KEY[mode],
]);

const WEB_UI_FLAVORS = Object.values(WebUiFlavor);
const WEB_UI_FLAVOR_TO_TRANSLATION_KEY: { [flavor in WebUiFlavor]: SelectSettingValueDisplayInfo } = {
    [WebUiFlavor.Webui]: {
        text: 'settings.webui.title.webui',
        description: 'settings.webui.flavor.option.webui.label.description',
        disclaimer: 'settings.webui.flavor.label.info',
    },
    [WebUiFlavor.Vui]: {
        text: 'settings.webui.flavor.option.vui.label.title',
        description: 'settings.webui.flavor.option.vui.label.description',
        disclaimer: 'settings.webui.flavor.label.info',
    },
    [WebUiFlavor.Custom]: {
        text: 'settings.webui.flavor.option.custom.label.title',
        description: 'settings.webui.flavor.option.custom.label.description',
    },
};
export const WEB_UI_FLAVOR_SELECT_VALUES: SelectSettingValue<WebUiFlavor>[] = WEB_UI_FLAVORS.map((flavor) => [
    flavor,
    WEB_UI_FLAVOR_TO_TRANSLATION_KEY[flavor],
]);

const WEB_UI_CHANNELS = Object.values(WebUiChannel);
const WEB_UI_CHANNEL_TO_TRANSLATION_KEYS: {
    [channel in WebUiChannel]: SelectSettingValueDisplayInfo;
} = {
    [WebUiChannel.Bundled]: {
        text: 'settings.webui.channel.option.bundled.label.title',
        description: 'settings.webui.channel.option.bundled.label.description',
        disclaimer: 'settings.webui.flavor.label.info',
    },
    [WebUiChannel.Stable]: {
        text: 'settings.webui.channel.option.stable.label.title',
        description: 'settings.webui.channel.option.stable.label.description',
        disclaimer: 'settings.webui.flavor.label.info',
    },
    [WebUiChannel.Preview]: {
        text: 'settings.webui.channel.option.preview.label.title',
        description: 'settings.webui.channel.option.preview.label.description',
        disclaimer: 'settings.webui.channel.option.preview.label.disclaimer',
    },
};
export const WEB_UI_CHANNEL_SELECT_VALUES: SelectSettingValue<WebUiChannel>[] = WEB_UI_CHANNELS.map((channel) => [
    channel,
    WEB_UI_CHANNEL_TO_TRANSLATION_KEYS[channel],
]);

const WEB_UI_INTERFACES = Object.values(WebUiInterface);
const WEB_UI_INTERFACE_TO_TRANSLATION_KEYS: {
    [webUIInterface in WebUiInterface]: SelectSettingValueDisplayInfo;
} = {
    [WebUiInterface.Browser]: {
        text: 'settings.webui.interface.option.label.browser',
        description: 'settings.webui.interface.label.description',
    },
    [WebUiInterface.Electron]: {
        text: 'settings.webui.interface.option.label.electron',
        description: 'settings.webui.interface.label.description',
    },
};
export const WEB_UI_INTERFACE_SELECT_VALUES: SelectSettingValue<WebUiInterface>[] = WEB_UI_INTERFACES.map(
    (webUIInterface) => [webUIInterface, WEB_UI_INTERFACE_TO_TRANSLATION_KEYS[webUIInterface]],
);

export const GLOBAL_UPDATE_INTERVAL = {
    default: 12,
    min: 6,
    max: 24 * 7 * 4, // 1 month
};

export const GLOBAL_UPDATE_SKIP_ENTRIES_TO_TRANSLATION: {
    [setting in keyof GlobalUpdateSkipEntriesSettings]: TranslationKey;
} = {
    excludeUnreadChapters: 'library.settings.global_update.entries.label.unread_chapters',
    excludeNotStarted: 'library.settings.global_update.entries.label.not_started',
    excludeCompleted: 'library.settings.global_update.entries.label.completed',
};

export const WEB_UI_UPDATE_INTERVAL = {
    default: 23,
    min: 1,
    max: 23,
};
