/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { t } from 'i18next';
import {
    ExtensionAction,
    ExtensionGroupState,
    ExtensionState,
    GroupedExtensions,
    GroupedExtensionsResult,
    InstalledState,
    TExtension,
} from '@/modules/extension/Extensions.types.ts';
import { DefaultLanguage, langCodeToName, langSortCmp } from '@/modules/core/utils/Languages.ts';
import { extensionLanguageToTranslationKey } from '@/modules/extension/Extensions.constants.ts';

export const getInstalledState = (
    isInstalled: boolean,
    isObsolete: boolean,
    hasUpdate: boolean,
): ExtensionAction | ExtensionState.OBSOLETE => {
    if (isObsolete) {
        return InstalledState.OBSOLETE;
    }

    if (hasUpdate) {
        return InstalledState.UPDATE;
    }

    return isInstalled ? InstalledState.UNINSTALL : InstalledState.INSTALL;
};

export const isExtensionState = (value: string): boolean =>
    [ExtensionGroupState.INSTALLED, ExtensionGroupState.UPDATE_PENDING, ExtensionGroupState.OBSOLETE].includes(
        value as ExtensionGroupState,
    );

export const isExtensionStateOrLanguage = (languageCode: string): boolean =>
    isExtensionState(languageCode) ||
    [DefaultLanguage.ALL, DefaultLanguage.OTHER, DefaultLanguage.LOCAL_SOURCE].includes(
        languageCode as DefaultLanguage,
    );

export const translateExtensionLanguage = (languageCode: string): string =>
    isExtensionStateOrLanguage(languageCode)
        ? t(extensionLanguageToTranslationKey[languageCode as ExtensionGroupState | DefaultLanguage])
        : langCodeToName(languageCode);

export function getExtensionsInfo(extensions: TExtension[]): {
    allLangs: string[];
    groupedExtensions: GroupedExtensionsResult;
} {
    const allLangs: string[] = [];
    const sortedExtensions: GroupedExtensions = {
        [ExtensionGroupState.OBSOLETE]: [],
        [ExtensionGroupState.INSTALLED]: [],
        [ExtensionGroupState.UPDATE_PENDING]: [],
    };
    extensions.forEach((extension) => {
        if (sortedExtensions[extension.lang] === undefined) {
            sortedExtensions[extension.lang] = [];
            allLangs.push(extension.lang);
        }
        if (extension.isInstalled) {
            if (extension.hasUpdate) {
                sortedExtensions[ExtensionGroupState.UPDATE_PENDING].push(extension);
                return;
            }
            if (extension.isObsolete) {
                sortedExtensions[ExtensionGroupState.OBSOLETE].push(extension);
                return;
            }

            sortedExtensions[ExtensionGroupState.INSTALLED].push(extension);
        } else {
            sortedExtensions[extension.lang].push(extension);
        }
    });

    allLangs.sort(langSortCmp);
    const result: GroupedExtensionsResult<ExtensionGroupState | DefaultLanguage | string> = [
        [ExtensionGroupState.OBSOLETE, sortedExtensions[ExtensionGroupState.OBSOLETE]],
        [ExtensionGroupState.UPDATE_PENDING, sortedExtensions[ExtensionGroupState.UPDATE_PENDING]],
        [ExtensionGroupState.INSTALLED, sortedExtensions[ExtensionGroupState.INSTALLED]],
    ];

    const langExt: GroupedExtensionsResult = allLangs.map((lang) => [lang, sortedExtensions[lang]]);
    const groupedExtensions = result.concat(langExt);

    groupedExtensions.forEach(([, groupedExtensionList]) =>
        groupedExtensionList.sort((a, b) => a.name.localeCompare(b.name)),
    );

    return {
        allLangs,
        groupedExtensions,
    };
}
