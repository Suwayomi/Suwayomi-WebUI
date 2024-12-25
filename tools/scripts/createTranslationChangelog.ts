/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { ControlledPromise } from '@/lib/ControlledPromise.ts';
import tokens from './tokens.json';

enum WeblateChangeActions {
    RESOURCE_UPDATED = 0,
    TRANSLATION_COMPLETED = 1,
    TRANSLATION_CHANGED = 2,
    COMMENT_ADDED = 3,
    SUGGESTION_ADDED = 4,
    TRANSLATION_ADDED = 5,
    SUGGESTION_ACCEPTED = 7,
    TRANSLATION_REVERTED = 8,
    TRANSLATION_UPLOADED = 9,
    COMPONENT_LOCKED = 14,
    COMPONENT_UNLOCKED = 15,
    CHANGES_COMMITTED = 17,
    CHANGES_PUSHED = 18,
    REPOSITORY_RESET = 19,
    REPOSITORY_MERGED = 20,
    REPOSITORY_REBASED = 21,
    REPOSITORY_MERGE_FAILED = 22,
    REPOSITORY_REBASE_FAILED = 23,
    PARSING_FAILED = 24,
    TRANSLATION_REMOVED = 25,
    SUGGESTION_REMOVED = 26,
    MARKED_FOR_EDIT = 37,
    COMPONENT_RENAMED = 42,
    CONTRIBUTOR_JOINED = 45,
    LANGUAGE_ADDED = 48,
    COMPONENT_CREATED = 51,
    ADD_ON_CONFIGURATION_CHANGED = 61,
}

const creditRelevantActions: WeblateChangeActions[] = [
    WeblateChangeActions.TRANSLATION_CHANGED,
    WeblateChangeActions.TRANSLATION_ADDED,
    WeblateChangeActions.TRANSLATION_REVERTED,
    WeblateChangeActions.TRANSLATION_UPLOADED,
    WeblateChangeActions.TRANSLATION_REMOVED,
    WeblateChangeActions.MARKED_FOR_EDIT,
];

interface WeblateChangeResult {
    translation: string;
    action: WeblateChangeActions;
    action_name: keyof WeblateChangeActions;
    user: string;
}

interface WeblateChangePayload {
    next: string;
    results: WeblateChangeResult[];
}

interface WeblateUserPayload {
    full_name: string;
}

interface WeblateLanguagePayload {
    language: {
        name: string;
    };
}

type Username = string;
type UserUrl = string;

type LanguageName = string;
type TranslationUrl = string;

type UsernameByUserUrl = Record<UserUrl, Username>;
type LanguageNameByTranslationUrl = Record<TranslationUrl, LanguageName>;
type UserUrlsByTranslationUrl = Record<TranslationUrl, UserUrl[]>;
type ActionByTranslationUrlByUserUrl = Record<
    UserUrl,
    Record<TranslationUrl, { count: number; actions: Record<WeblateChangeActions, number> }>
>;

interface Contributor {
    username: Username;
    contributionCount: number;
}
type ContributionsByLanguage = Record<LanguageName, Contributor[]>;

const { afterDate, beforeDate, requiredContributionCount, keepKnownContributors } = yargs(hideBin(process.argv))
    .options({
        afterDate: {
            alias: 'ad',
            description: 'IS0-8601 formatted date (included) (e.g. 2024-05-01)',
            type: 'string',
            demandOption: true,
        },
        beforeDate: {
            alias: 'bd',
            description: 'IS0-8601 formatted date (excluded) (e.g. 2024-05-11)',
            type: 'string',
            demandOption: true,
        },
        requiredContributionCount: {
            alias: 'rcc',
            description: 'The minimum number of contributions for a language to be considered a contributor',
            type: 'number',
            default: 10,
        },
        keepKnownContributors: {
            alias: 'kc',
            description: 'Ignore "requiredContributionCount" for known contributors of a language',
            type: 'boolean',
            default: true,
        },
    })
    .parseSync();

if (!afterDate || !beforeDate) {
    throw new Error('The timespan (afterDate and beforeDate) has to be passed!');
}

const dateRegex = /[0-9]{4}-[0-9]{2}-[0-9]{2}/g;

if (!afterDate.match(dateRegex) || !beforeDate.match(dateRegex)) {
    throw new Error(
        `The passed timestamps are not properly formatted. They have to match "${dateRegex}" (e.g. 2024-05-11)`,
    );
}

const timestampAfter = `${afterDate}T00:00:00.000Z`;
const timestampBefore = `${beforeDate}T00:00:00.000Z`;

const fetchData = async <T = any>(url: string, authToken: string): Promise<T> => {
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            Authorization: `Token ${authToken}`,
            Accept: 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error(`Weblate request failed with status ${response.status} - ${response.statusText}`);
    }

    return response.json();
};

const fetchWeblateChanges = async (
    url: string,
    authToken: string,
    weblateChangeResults: WeblateChangeResult[] = [],
): Promise<WeblateChangeResult[]> => {
    const weblateChangePage = await fetchData<WeblateChangePayload>(url, authToken);

    if (!weblateChangePage.next) {
        return [...weblateChangePage.results, ...weblateChangeResults];
    }

    return fetchWeblateChanges(weblateChangePage.next, authToken, [
        ...weblateChangePage.results,
        ...weblateChangeResults,
    ]);
};

const getUsername = async (url: string, authToken: string): Promise<string> => {
    const userPayload = await fetchData<WeblateUserPayload>(url, authToken);
    return userPayload.full_name;
};

const getLanguageName = async (url: string, authToken: string): Promise<string> => {
    const languagePayload = await fetchData<WeblateLanguagePayload>(url, authToken);
    return languagePayload.language.name.replace(/\(([a-zA-Z]+) Han script\)/g, '($1)');
};

const extractContributionInfoFromChanges = (
    changes: WeblateChangeResult[],
): {
    userUrlsByTranslationUrl: UserUrlsByTranslationUrl;
    actionsByTranslationUrlByUserUrl: ActionByTranslationUrlByUserUrl;
    actions: Record<number, string>;
} => {
    const userUrlsByTranslationUrl: UserUrlsByTranslationUrl = {};
    const actionsByTranslationUrlByUserUrl: ActionByTranslationUrlByUserUrl = {};
    const actions: Record<number, string> = {};

    changes.forEach((change) => {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        const { translation: translationUrl, action, action_name, user: userUrl } = change;
        if (userUrl === null) {
            return;
        }

        userUrlsByTranslationUrl[translationUrl] = [
            ...new Set([...(userUrlsByTranslationUrl[translationUrl] ?? []), userUrl]),
        ];
        actions[action] = action_name;
        actionsByTranslationUrlByUserUrl[userUrl] = {
            ...actionsByTranslationUrlByUserUrl[userUrl],
            [translationUrl]: {
                count: (actionsByTranslationUrlByUserUrl[userUrl]?.[translationUrl]?.count ?? 0) + 1,
                actions: {
                    ...actionsByTranslationUrlByUserUrl[userUrl]?.[translationUrl]?.actions,
                    [action]: (actionsByTranslationUrlByUserUrl[userUrl]?.[translationUrl]?.actions[action] ?? 0) + 1,
                },
            },
        };
    });

    return { userUrlsByTranslationUrl, actionsByTranslationUrlByUserUrl, actions };
};

const getUsernameByUserUrlMap = async (
    userUrlsByTranslationUrl: UserUrlsByTranslationUrl,
    authToken: string,
): Promise<Record<string, string>> =>
    Object.fromEntries(
        (await Promise.all(
            Object.values(userUrlsByTranslationUrl)
                .flat()
                .map(async (userUrl) => [userUrl, await getUsername(userUrl, authToken)]),
        )) satisfies [string, string][],
    );

const getLanguageNameByTranslationUrl = async (
    userUrlsByTranslationUrl: UserUrlsByTranslationUrl,
    authToken: string,
): Promise<LanguageNameByTranslationUrl> =>
    Object.fromEntries(
        (await Promise.all(
            Object.keys(userUrlsByTranslationUrl)
                .flat()
                .map(async (translationUrl) => [translationUrl, await getLanguageName(translationUrl, authToken)]),
        )) satisfies [string, string][],
    );

const getUserContributionByLanguage = (
    userUrlsByTranslationUrl: UserUrlsByTranslationUrl,
    languageNameByTranslationUrl: LanguageNameByTranslationUrl,
    usernameByUserUrl: UsernameByUserUrl,
    actionsByTranslationUrlByUserUrl: ActionByTranslationUrlByUserUrl,
) =>
    Object.fromEntries(
        Object.entries(userUrlsByTranslationUrl).map(([translationUrl, userUrls]) => {
            const languageName = languageNameByTranslationUrl[translationUrl];
            const contributors = userUrls
                .map((userUrl) => {
                    const username = usernameByUserUrl[userUrl];
                    const contributionCount = actionsByTranslationUrlByUserUrl[userUrl][translationUrl].count;

                    return { username, contributionCount };
                })
                .sort((userA, userB) => userB.contributionCount - userA.contributionCount);

            return [languageName, contributors];
        }),
    );

const getContributorsForRange = async (url: string, authToken: string): Promise<ContributionsByLanguage> => {
    const weblateChanges = await fetchWeblateChanges(url, authToken);

    const { userUrlsByTranslationUrl, actionsByTranslationUrlByUserUrl } =
        extractContributionInfoFromChanges(weblateChanges);

    const usernameByUserUrl = await getUsernameByUserUrlMap(userUrlsByTranslationUrl, authToken);
    const languageNameByTranslationUrl = await getLanguageNameByTranslationUrl(userUrlsByTranslationUrl, authToken);

    return getUserContributionByLanguage(
        userUrlsByTranslationUrl,
        languageNameByTranslationUrl,
        usernameByUserUrl,
        actionsByTranslationUrlByUserUrl,
    );
};

const getLanguageLinesFromChangelog = (): Promise<string[]> => {
    const fileReadPromise = new ControlledPromise<string[]>();

    const changelogFile = path.resolve(import.meta.dirname, '../../CHANGELOG.md');
    const fileStream = fs.createReadStream(changelogFile);
    const fileLineReader = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity, // Recognize all line breaks (CR LF) as a single line break
    });

    const translationRelevantLines: string[] = [];
    let isTranslationSection = false;
    fileLineReader.on('line', (line) => {
        if (line.toLowerCase() === '## Translations'.toLowerCase()) {
            isTranslationSection = true;
            return;
        }

        if (isTranslationSection && line.toLowerCase() === '## Full Changelog'.toLowerCase()) {
            isTranslationSection = false;
            return;
        }

        if (!isTranslationSection) {
            return;
        }

        if (!line.startsWith('-')) {
            return;
        }

        translationRelevantLines.push(line);
    });

    fileLineReader.on('close', () => {
        fileReadPromise.resolve(translationRelevantLines);
    });

    fileLineReader.on('error', (error) => {
        fileReadPromise.reject(error);
    });

    return fileReadPromise.promise;
};

const getKnownContributorsByLanguage = async (): Promise<Record<string, string[]>> => {
    const changelogLanguageLines = await getLanguageLinesFromChangelog();

    const contributorByLanguage: Record<string, string[]> = {};
    changelogLanguageLines.forEach((languageLine) => {
        const languageChangeRegex = /^- (.*) \(by (.*)\)$/g;
        const languageChangeRegexMatch = [...languageLine.matchAll(languageChangeRegex)][0];

        const language = languageChangeRegexMatch[1];
        const contributors = languageChangeRegexMatch[2].split(', ');

        const knownContributors = contributorByLanguage[language] ?? [];
        contributorByLanguage[language] = [...new Set([...knownContributors, ...contributors])];
    });

    return contributorByLanguage;
};

const createTranslationChangelog = async (): Promise<void> => {
    const url = `https://hosted.weblate.org/api/components/suwayomi/suwayomi-webui/changes/?timestamp_after=${timestampAfter}&timestamp_before=${timestampBefore}&${creditRelevantActions.map((action) => `action=${action}`).join('&')}`;

    const contributorsForRange = await getContributorsForRange(url, tokens.weblateToken);
    const knownContributorsByLanguage = await getKnownContributorsByLanguage();

    const contributionInfo: { language: string; contributors: string[] }[] = Object.entries(contributorsForRange).map(
        ([language, languageContributors]) => {
            const validContributors = languageContributors.filter(
                ({ username, contributionCount }) =>
                    (keepKnownContributors && knownContributorsByLanguage[language]?.includes(username)) ||
                    contributionCount >= requiredContributionCount,
            );
            const contributors = validContributors.length ? validContributors : [languageContributors[0]];

            return {
                language,
                contributors: contributors.map(({ username }) => username),
            };
        },
    );

    const languageByNewState = Object.groupBy(
        contributionInfo,
        ({ language }) => `${knownContributorsByLanguage[language] == null}`,
    );

    const newLanguages = languageByNewState.true ?? [];
    const updatedLanguages = languageByNewState.false ?? [];

    console.log(
        '## Translations\n' +
            'Feel free to translate the project on [Weblate](https://hosted.weblate.org/projects/suwayomi/suwayomi-webui/)\n' +
            '\n' +
            'Thank you for your contribution to the translation of the project.\n',
    );

    if (newLanguages.length) {
        console.log('### Added');
        newLanguages.forEach(({ language, contributors }) => {
            console.log(`- ${language} (by ${contributors.join(', ')})`);
        });
        console.log('');
    }

    if (updatedLanguages.length) {
        console.log('### Updated');
        updatedLanguages.forEach(({ language, contributors }) => {
            console.log(`- ${language} (by ${contributors.join(', ')})`);
        });
    }
};

createTranslationChangelog();
