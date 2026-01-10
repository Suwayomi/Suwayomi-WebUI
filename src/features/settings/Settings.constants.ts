/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { d } from 'koration';
import { DEFAULT_DEVICE } from '@/features/device/services/Device.ts';
import { DEFAULT_SORT_SETTINGS } from '@/features/migration/Migration.constants.ts';
import {
    GlobalUpdateSkipEntriesSettings,
    ImageProcessingTargetMode,
    ImageProcessingType,
    MetadataServerSettings,
    ServerSettings,
} from '@/features/settings/Settings.types.ts';
import { GridLayout } from '@/base/Base.types';
import { getDefaultLanguages } from '@/base/utils/Languages.ts';
import { SelectSettingValue, SelectSettingValueDisplayInfo } from '@/base/components/settings/SelectSetting.tsx';
import {
    AuthMode,
    KoreaderSyncChecksumMethod,
    KoreaderSyncConflictStrategy,
    WebUiChannel,
    WebUiFlavor,
    WebUiInterface,
} from '@/lib/graphql/generated/graphql.ts';
import { ThemeMode } from '@/features/theme/AppTheme.types.ts';

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
const AUTH_MODES_TO_TRANSLATION: { [mode in AuthMode]: SelectSettingValueDisplayInfo } = {
    [AuthMode.None]: {
        text: msg`None`,
        description: msg`Disable authentication`,
        disclaimer: msg`Your library will be accessible. Use this only on private networks or when otherwise securing access.`,
    },
    [AuthMode.BasicAuth]: {
        text: msg`Basic Authentication`,
        description: msg`Your browser will prompt you to enter credentials with a dialog.`,
    },
    [AuthMode.SimpleLogin]: {
        text: msg`Simple Login`,
        description: msg`The login will be handled by the server.`,
        disclaimer: msg`When you enable this, you may need to refresh this tab for the login page to appear.`,
    },
    [AuthMode.UiLogin]: {
        text: msg`UI Login`,
        description: msg`The login will be handled by the client.`,
    },
};
export const AUTH_MODES_SELECT_VALUES: SelectSettingValue<AuthMode>[] = AUTH_MODES.map((mode) => [
    mode,
    AUTH_MODES_TO_TRANSLATION[mode],
]);

const WEB_UI_FLAVORS = Object.values(WebUiFlavor);
const WEB_UI_FLAVOR_TO_TRANSLATION: { [flavor in WebUiFlavor]: SelectSettingValueDisplayInfo } = {
    [WebUiFlavor.Webui]: {
        text: msg`WebUI`,
        description: msg`Use the default WebUI`,
        disclaimer: msg`After changing this setting go to the "About" page and check for a webUI update and install it`,
    },
    [WebUiFlavor.Vui]: {
        text: msg`VUI`,
        description: msg`A preview focused web frontend built with svelte`,
        disclaimer: msg`After changing this setting go to the "About" page and check for a webUI update and install it`,
    },
    [WebUiFlavor.Custom]: {
        text: msg`Custom`,
        description: msg`Use a custom WebUI.\nTo use a custom WebUI replace the content of the "webUI" directory in the root directory on the server with the files of the custom WebUI`,
    },
};
export const WEB_UI_FLAVOR_SELECT_VALUES: SelectSettingValue<WebUiFlavor>[] = WEB_UI_FLAVORS.map((flavor) => [
    flavor,
    WEB_UI_FLAVOR_TO_TRANSLATION[flavor],
]);

const WEB_UI_CHANNELS = Object.values(WebUiChannel);
const WEB_UI_CHANNEL_TO_TRANSLATIONS: {
    [channel in WebUiChannel]: SelectSettingValueDisplayInfo;
} = {
    [WebUiChannel.Bundled]: {
        text: msg`Bundled`,
        description: msg`Use the version that was delivered with the server release`,
        disclaimer: msg`After changing this setting go to the "About" page and check for a webUI update and install it`,
    },
    [WebUiChannel.Stable]: {
        text: msg`Stable`,
        description: msg`Use the latest released version.`,
        disclaimer: msg`After changing this setting go to the "About" page and check for a webUI update and install it`,
    },
    [WebUiChannel.Preview]: {
        text: msg`Preview`,
        description: msg`Use the latest features and help us get them ready for a stable release.`,
        disclaimer: msg`Features and changes in this version might not be completely ready yet and can cause bugs.\nMake sure that you have automatic backups enabled to prevent loss of your library!\n\nAfter changing this setting go to the "About" page and check for a webUI update and install it`,
    },
};
export const WEB_UI_CHANNEL_SELECT_VALUES: SelectSettingValue<WebUiChannel>[] = WEB_UI_CHANNELS.map((channel) => [
    channel,
    WEB_UI_CHANNEL_TO_TRANSLATIONS[channel],
]);

const WEB_UI_INTERFACES = Object.values(WebUiInterface);
const WEB_UI_INTERFACE_TO_TRANSLATIONS: {
    [webUIInterface in WebUiInterface]: SelectSettingValueDisplayInfo;
} = {
    [WebUiInterface.Browser]: {
        text: msg`Browser`,
        description: msg`Where to start the WebUI when starting the server`,
    },
    [WebUiInterface.Electron]: {
        text: msg`Electron`,
        description: msg`Where to start the WebUI when starting the server`,
    },
};
export const WEB_UI_INTERFACE_SELECT_VALUES: SelectSettingValue<WebUiInterface>[] = WEB_UI_INTERFACES.map(
    (webUIInterface) => [webUIInterface, WEB_UI_INTERFACE_TO_TRANSLATIONS[webUIInterface]],
);

export const GLOBAL_UPDATE_INTERVAL = {
    default: d(12).hours.inWholeHours,
    min: d(6).hours.inWholeHours,
    max: d(1).months.inWholeHours,
};

export const GLOBAL_UPDATE_SKIP_ENTRIES_TO_TRANSLATION: {
    [setting in keyof GlobalUpdateSkipEntriesSettings]: MessageDescriptor;
} = {
    excludeUnreadChapters: msg`With unread chapter(s)`,
    excludeNotStarted: msg`That haven't been started`,
    excludeCompleted: msg`With "Completed" status`,
};

export const WEB_UI_UPDATE_INTERVAL = {
    default: d(23).hours.inWholeHours,
    min: d(1).hours.inWholeHours,
    max: d(23).hours.inWholeHours,
};

export const JWT_ACCESS_TOKEN_EXPIRY = {
    default: d(5).minutes.inWholeMinutes,
    min: d(1).minutes.inWholeMinutes,
    max: d(4).hours.inWholeMinutes,
};

export const JWT_REFRESH_TOKEN_EXPIRY = {
    default: d(60).days.inWholeDays,
    min: d(1).days.inWholeDays,
    max: d(1).years.inWholeDays,
};

export const KOREADER_SYNC_PERCENTAGE_TOLERANCE = {
    default: 1.0e-15,
    min: 1.0e-15,
    max: 1,
    step: 0.05,
};

export const KOREADER_SYNC_CONFLICT_STRATEGIES = Object.values(KoreaderSyncConflictStrategy);
export const KOREADER_SYNC_CONFLICT_STRATEGY_TO_TRANSLATIONS: Record<
    KoreaderSyncConflictStrategy,
    SelectSettingValueDisplayInfo
> = {
    [KoreaderSyncConflictStrategy.Disabled]: {
        text: msg`Disabled`,
    },
    [KoreaderSyncConflictStrategy.KeepLocal]: {
        text: msg`Keep local`,
    },
    [KoreaderSyncConflictStrategy.KeepRemote]: {
        text: msg`Keep remote`,
    },
    [KoreaderSyncConflictStrategy.Prompt]: {
        text: msg`Prompt`,
    },
};
export const KOREADER_SYNC_CONFLICT_STRATEGY_SELECT_VALUES: SelectSettingValue<KoreaderSyncConflictStrategy>[] =
    KOREADER_SYNC_CONFLICT_STRATEGIES.map((strategy) => [
        strategy,
        KOREADER_SYNC_CONFLICT_STRATEGY_TO_TRANSLATIONS[strategy],
    ]);

export const KOREADER_SYNC_CHECKSUM_METHODES = Object.values(KoreaderSyncChecksumMethod);
export const KOREADER_SYNC_CHECKSUM_METHOD_TO_TRANSLATIONS: Record<
    KoreaderSyncChecksumMethod,
    SelectSettingValueDisplayInfo
> = {
    [KoreaderSyncChecksumMethod.Binary]: {
        text: msg`Binary`,
    },
    [KoreaderSyncChecksumMethod.Filename]: {
        text: msg`Filename`,
    },
};
export const KOREADER_SYNC_CHECKSUM_METHOD_SELECT_VALUES: SelectSettingValue<KoreaderSyncChecksumMethod>[] =
    KOREADER_SYNC_CHECKSUM_METHODES.map((method) => [method, KOREADER_SYNC_CHECKSUM_METHOD_TO_TRANSLATIONS[method]]);

export const IMAGE_PROCESSING_COMPRESSION = {
    min: 0,
    max: 1,
    step: 0.01,
};
export const IMAGE_PROCESSING_CALL_TIMEOUT = {
    min: d(10).seconds.inWholeSeconds,
    max: d(10).minutes.inWholeSeconds,
    step: d(10).seconds.inWholeSeconds,
};
export const IMAGE_PROCESSING_CONNECT_TIMEOUT = {
    min: d(10).seconds.inWholeSeconds,
    max: d(10).minutes.inWholeSeconds,
    step: d(10).seconds.inWholeSeconds,
};

const IMAGE_PROCESSING_TARGET_MODES = Object.values(ImageProcessingTargetMode);
const IMAGE_PROCESSING_TARGET_MODES_TO_TRANSLATION: {
    [flavor in ImageProcessingTargetMode]: SelectSettingValueDisplayInfo;
} = {
    [ImageProcessingTargetMode.DISABLED]: {
        text: msg`Disabled`,
    },
    [ImageProcessingTargetMode.IMAGE]: {
        text: msg`Image`,
        description: msg`Convert images to different formats`,
    },
    [ImageProcessingTargetMode.URL]: {
        text: msg`URL`,
        description: msg`Convert images to different formats`,
    },
};
export const IMAGE_PROCESSING_TARGET_MODES_SELECT_VALUES: SelectSettingValue<ImageProcessingTargetMode>[] =
    IMAGE_PROCESSING_TARGET_MODES.map((mode) => [mode, IMAGE_PROCESSING_TARGET_MODES_TO_TRANSLATION[mode]]);

export const IMAGE_PROCESSING_INPUT_WIDTH = 250;
export const DEFAULT_MIME_TYPE = 'default';
export const MIME_TYPE_PREFIX = 'image/';
export const TARGET_DISABLED = 'none';

export const IMAGE_PROCESSING_TYPE_TO_TRANSLATION: Record<ImageProcessingType, MessageDescriptor> = {
    [ImageProcessingType.DOWNLOAD]: msg`Image download processing`,
    [ImageProcessingType.SERVE]: msg`Image serve processing`,
};

export const IMAGE_PROCESSING_TYPE_TO_SETTING: Record<
    ImageProcessingType,
    Extract<keyof ServerSettings, 'downloadConversions' | 'serveConversions'>
> = {
    [ImageProcessingType.DOWNLOAD]: 'downloadConversions',
    [ImageProcessingType.SERVE]: 'serveConversions',
};
