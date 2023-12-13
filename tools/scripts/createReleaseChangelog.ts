/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import yargs from 'yargs';
import githubToken from './github_token.json';

type GithubCommit = {
    sha: string;
    html_url: string;
    commit: {
        message: string;
        author: {
            name: string;
        };
    };
    author: { login: string } | null;
};

type Commit = {
    repoUrl: string;
    revision: number;
    url: string;
    githubUser: string | undefined;
    author: string;
    title: string;
};

const { sha } = yargs
    .options({
        sha: {
            description: 'The hash of the last commit of the previous release',
            type: 'string',
            demandOption: true,
        },
    })
    .parseSync();

const getHeaderWithAuth = () => ({
    headers: {
        // token is optional, might be needed in case of getting rate-limited - to provide a token create a "github_token.json" (see "github_token.template.json") and add your token in there
        Authorization: githubToken.token ? `token ${githubToken.token}` : '',
    },
});

const fetchTotalCommitCount = async (owner: string, repo: string, branch: string = 'master') => {
    const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/commits?sha=${branch}&per_page=1&page=1`,
        getHeaderWithAuth(),
    );

    const linkHeader = response.headers.get('Link');
    const pageCountMatch = linkHeader?.match(/page=(\d+)>; rel="last"/);

    if (!pageCountMatch) {
        throw new Error('Page count not found in Link header');
    }

    return parseInt(pageCountMatch[1], 10);
};

/**
 * Fetches and returns all commits after the provided commit hash
 */
const fetchCommits = async (
    owner: string,
    repo: string,
    loadUntilSha: string,
    page: number = 1,
): Promise<GithubCommit[]> => {
    const commitList = (await (
        await fetch(`https://api.github.com/repos/${owner}/${repo}/commits?page=${page}`, getHeaderWithAuth())
    ).json()) as GithubCommit[];
    const indexOfOldestCommitToLoad = commitList.findIndex((commit) => commit.sha === loadUntilSha);

    const loadedAllCommits = indexOfOldestCommitToLoad !== -1;
    if (loadedAllCommits) {
        return commitList.slice(0, indexOfOldestCommitToLoad);
    }

    return [...commitList, ...(await fetchCommits(owner, repo, loadUntilSha, page + 1))];
};

const createChangelogCommitLine = (commit: Commit): string => {
    const author = commit.githubUser ?? commit.author;
    const credit = `by @${author}`;
    const revision = `([r${commit.revision}](${commit.url}))`;

    const includesPrId = commit.title.match(/.*\(#[0-9]+\)$/g);
    if (!includesPrId) {
        return `${revision} ${commit.title} (${credit})`;
    }

    const splitTitle = commit.title.split('#');

    const rawPrId = splitTitle[splitTitle.length - 1]; // = <prId>) e.g. 420)
    const prId = rawPrId.substring(0, rawPrId.length - 1);
    const prUrl = `${commit.repoUrl}/pull/${prId}`;
    const authorCredit = `[#${prId}](${prUrl}) ${credit}`;

    return `${revision} ${splitTitle.slice(0, splitTitle.length - 1).join('#')}${authorCredit})`;
};

const createChangelog = async (prevReleaseLastCommitSha: string) => {
    const owner = 'Suwayomi';
    const repo = 'Tachidesk-WebUI';

    const numberOfCommits = await fetchTotalCommitCount(owner, repo);
    const githubCommits = await fetchCommits(owner, repo, prevReleaseLastCommitSha);

    const commits: Commit[] = githubCommits.map((githubCommit, index) => ({
        repoUrl: `https://github.com/${owner}/${repo}`,
        revision: numberOfCommits - index,
        url: githubCommit.html_url,
        githubUser: githubCommit.author?.login,
        author: githubCommit.commit.author.name,
        title: githubCommit.commit.message.split('\n')[0],
    }));

    const commitChangelogLines = commits.map(createChangelogCommitLine);
    commitChangelogLines.forEach((commit) => console.log('-', commit));
};

createChangelog(sha).catch((error) => {
    console.error('Failed due to', error);
    process.exit(1);
});
