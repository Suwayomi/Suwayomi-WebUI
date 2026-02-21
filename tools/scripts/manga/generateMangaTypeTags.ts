/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import path from 'path';
import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';

const OUTPUT_FILE_PATH = 'src/features/manga/Manga.constants.ts';
const outputFilePath = path.join(import.meta.dirname, `../../../${OUTPUT_FILE_PATH}`);
const localesDirPath = path.join(import.meta.dirname, '../../../src/i18n/locales');

const MANGA_TYPE_TO_MSG_IDS = {
    MANGA: ['Manga'],
    COMIC: ['Comic'],
    WEBTOON: ['Webtoon', 'Long strip'],
    MANHWA: ['Manhwa', 'Long strip'],
    MANHUA: ['Manhua', 'Long strip'],
} as const satisfies Record<string, string[]>;

type MangaTypeMsgId = (typeof MANGA_TYPE_TO_MSG_IDS)[keyof typeof MANGA_TYPE_TO_MSG_IDS][number];

const TARGET_MSG_IDS = new Set(Object.values(MANGA_TYPE_TO_MSG_IDS).flat());

const extractTranslations = (poContent: string): Map<string, string> =>
    poContent.split('\n').reduce((translations, line, i, lines) => {
        const msgIdMatch = line.trim().match(/^msgid "(.+)"$/);
        if (!msgIdMatch) {
            return translations;
        }

        const msgId = msgIdMatch[1];
        if (!TARGET_MSG_IDS.has(msgId as MangaTypeMsgId)) {
            return translations;
        }

        const msgStrMatch = lines[i + 1]?.trim().match(/^msgstr "(.+)"$/);
        if (!msgStrMatch) {
            return translations;
        }

        return new Map([...translations, [msgId, msgStrMatch[1]]]);
    }, new Map<string, string>());

const poFiles = readdirSync(localesDirPath).filter((file) => file.endsWith('.po'));

const allTranslationsByMsgId = poFiles
    .map((poFile) => extractTranslations(readFileSync(path.join(localesDirPath, poFile), 'utf-8')))
    .reduce(
        (acc, translations) =>
            new Map(
                [...acc].map(([msgId, existing]) => [
                    msgId,
                    new Set([...existing, ...(translations.has(msgId) ? [translations.get(msgId)!] : [])]),
                ]),
            ),
        new Map([...TARGET_MSG_IDS].map((msgId) => [msgId, new Set<string>()])),
    );

const translationsByMangaType = Object.fromEntries(
    Object.entries(MANGA_TYPE_TO_MSG_IDS).map(([mangaType, msgIds]) => [
        mangaType,
        [...new Set([...msgIds, ...msgIds.flatMap((msgId) => [...(allTranslationsByMsgId.get(msgId) ?? [])])])],
    ]),
);

const outputContent = readFileSync(outputFilePath, 'utf-8');

const mangaTypes = Object.keys(MANGA_TYPE_TO_MSG_IDS);
const entries = mangaTypes.map((type) => {
    const tagList = translationsByMangaType[type].map((tag) => `'${tag.replace(/'/g, "\\'")}'`).join(',');
    return `    [MangaType.${type}]: [\n${tagList},\n    ]`;
});

const newBlock = `export const MANGA_TAGS_BY_MANGA_TYPE: Record<MangaType, string[]> = {\n${entries.join(',\n')},\n};`;

const updatedContent = outputContent.replace(
    /export const MANGA_TAGS_BY_MANGA_TYPE: Record<MangaType, string\[]> = \{[\s\S]*?\n};/,
    newBlock,
);

writeFileSync(outputFilePath, updatedContent);

console.log('Generated MANGA_TAGS_BY_MANGA_TYPE:');
Object.entries(translationsByMangaType).forEach(([mangaType, tags]) => {
    console.log(`  ${mangaType}: ${tags.length} tags — ${tags.join(', ')}`);
});

const hasChanges = execSync('git status --porcelain').toString().includes(OUTPUT_FILE_PATH);

if (hasChanges) {
    execSync('git reset');
    execSync(`git add ${OUTPUT_FILE_PATH}`);
    execSync('git commit -m "Update manga type tags"');
}
