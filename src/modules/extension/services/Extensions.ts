/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { t } from 'i18next';
import { DefaultLanguage, langCodeToName } from '@/modules/core/utils/Languages.ts';
import { ExtensionType } from '@/lib/graphql/generated/graphql.ts';
import { TranslationKey } from '@/Base.types.ts';

export enum ExtensionGroupState {
    INSTALLED = 'INSTALLED',
    UPDATE_PENDING = 'UPDATE_PENDING',
    OBSOLETE = 'OBSOLETE',
}

export type TExtension = Pick<
    ExtensionType,
    | 'pkgName'
    | 'name'
    | 'lang'
    | 'versionCode'
    | 'versionName'
    | 'iconUrl'
    | 'repo'
    | 'isNsfw'
    | 'isInstalled'
    | 'isObsolete'
    | 'hasUpdate'
>;

export type GroupedExtensionsResult<KEY extends string = string> = [KEY, TExtension[]][];

export type GroupedByExtensionState = {
    [state in ExtensionGroupState]: TExtension[];
};

export type GroupedByLanguage = {
    [language in DefaultLanguage]: TExtension[];
} & {
    [language: string]: TExtension[];
};

export type GroupedExtensions = GroupedByExtensionState & GroupedByLanguage;

export const extensionLanguageToTranslationKey: { [state in ExtensionGroupState | DefaultLanguage]: TranslationKey } = {
    [ExtensionGroupState.INSTALLED]: 'extension.state.label.installed',
    [ExtensionGroupState.UPDATE_PENDING]: 'extension.state.label.update_pending',
    [ExtensionGroupState.OBSOLETE]: 'extension.state.label.obsolete',
    [DefaultLanguage.ALL]: 'extension.language.all',
    [DefaultLanguage.OTHER]: 'extension.language.other',
    [DefaultLanguage.LOCAL_SOURCE]: 'extension.language.other',
};

export const isExtensionStateOrLanguage = (languageCode: string): boolean =>
    [
        ExtensionGroupState.INSTALLED,
        ExtensionGroupState.UPDATE_PENDING,
        ExtensionGroupState.OBSOLETE,
        DefaultLanguage.ALL,
        DefaultLanguage.OTHER,
        DefaultLanguage.LOCAL_SOURCE,
    ].includes(languageCode as ExtensionGroupState | DefaultLanguage);

export const translateExtensionLanguage = (languageCode: string): string =>
    isExtensionStateOrLanguage(languageCode)
        ? t(extensionLanguageToTranslationKey[languageCode as ExtensionGroupState | DefaultLanguage])
        : langCodeToName(languageCode);
