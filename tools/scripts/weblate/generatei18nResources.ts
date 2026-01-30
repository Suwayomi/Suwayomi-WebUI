/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';
import {
    fetchWeblateLanguageStats,
    getWeblateLanguageStatsFor,
    meetsTranslatedPercentThreshold as meetsTranslatedPercentThresholdBase,
} from './Weblate.utils.ts';
import { WeblateLanguageStatistic } from './Weblate.types.ts';
import { TRANSLATED_PERCENT_THRESHOLD } from './Weblate.constants.ts';

const I18N_INDEX_PATH = 'src/i18n/index.ts';
const LINGUI_CONFIG_PATH = 'lingui.config.ts';

const i18nIndexFilePath = path.join(import.meta.dirname, `../../../${I18N_INDEX_PATH}`);
const linguiConfigFilePath = path.join(import.meta.dirname, `../../../${LINGUI_CONFIG_PATH}`);
const resourcesDirPath = path.join(import.meta.dirname, '../../../src/i18n/locales');

const extractLanguageCode = (resourceFileNames: string): string =>
    path.basename(resourceFileNames, path.extname(resourceFileNames));

const meetsTranslatedPercentThreshold = (
    resourceFileName: string,
    weblateLanguageStats: WeblateLanguageStatistic[],
): boolean => {
    const code = extractLanguageCode(resourceFileName);
    const { name, translated_percent: translatedPercent } = getWeblateLanguageStatsFor(code, weblateLanguageStats);

    const meetsThreshold = meetsTranslatedPercentThresholdBase(translatedPercent);

    if (!meetsThreshold) {
        console.log(
            `Language "${name} (${code})" does not meet the required translation percentage threshold (${translatedPercent} < ${TRANSLATED_PERCENT_THRESHOLD})`,
        );
    }

    return meetsThreshold;
};

const formatLocalesArray = (locales: string[]): string => locales.map((locale) => `'${locale}'`).join(', ');

const updateI18nIndex = (locales: string[]): void => {
    const content = fs.readFileSync(i18nIndexFilePath, 'utf-8');
    const localesArrayStr = formatLocalesArray(locales);
    const updatedContent = content.replace(
        /(export const i18nResources = \[)[\s\S]*?(] as const)/g,
        `$1${localesArrayStr}$2`,
    );
    fs.writeFileSync(i18nIndexFilePath, updatedContent);
};

const updateLinguiConfig = (locales: string[]): void => {
    const content = fs.readFileSync(linguiConfigFilePath, 'utf-8');
    const localesArrayStr = formatLocalesArray(locales);
    const updatedContent = content.replace(/(locales: \[)[\s\S]*?(],)/g, `$1${localesArrayStr}$2`);
    fs.writeFileSync(linguiConfigFilePath, updatedContent);
};

const generateResources = async () => {
    const weblateLanguageStats = await fetchWeblateLanguageStats();

    const resourceFileNames = fs.readdirSync(resourcesDirPath);

    const resourceNames = resourceFileNames
        .filter((resourceFileName) => meetsTranslatedPercentThreshold(resourceFileName, weblateLanguageStats))
        .map(extractLanguageCode);

    updateI18nIndex(resourceNames);
    updateLinguiConfig(resourceNames);

    execSync('yarn tsc', { stdio: 'inherit' });
    execSync(`yarn eslint --fix ${I18N_INDEX_PATH} ${LINGUI_CONFIG_PATH}`, { stdio: 'inherit' });

    const hasI18nIndexChanged = execSync('git status --porcelain').toString().includes(I18N_INDEX_PATH);
    const hasLinguiConfigChanged = execSync('git status --porcelain').toString().includes(LINGUI_CONFIG_PATH);

    if (!hasI18nIndexChanged && !hasLinguiConfigChanged) {
        return;
    }

    execSync('git reset');
    if (hasI18nIndexChanged) {
        execSync(`git add ${I18N_INDEX_PATH}`);
    }
    if (hasLinguiConfigChanged) {
        execSync(`git add ${LINGUI_CONFIG_PATH}`);
    }
    execSync('git commit -m "Update available languages"');
};

generateResources();
