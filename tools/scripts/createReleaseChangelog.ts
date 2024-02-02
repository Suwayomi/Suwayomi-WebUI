/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import yargs from 'yargs';
import githubToken from './github_token.json';

type GithubAuthor = {
    name: string;
    user: { login: string } | null;
};

type GithubCommit = {
    oid: string;
    url: string;
    message: string;
    authors: {
        totalCount: number;
        nodes: GithubAuthor[];
    };
};

type CommitQueryResponse = {
    data: {
        repository: {
            ref: {
                target: {
                    history: {
                        totalCount: number;
                        pageInfo: {
                            hasNextPage: boolean;
                            endCursor: string;
                        };
                        nodes: GithubCommit[];
                    };
                };
            };
        };
    };
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

const fetchCommits = async (
    owner: string,
    repo: string,
    loadUntilSha: string,
    endCursor?: string,
): Promise<{ totalRepoCommitCount: number; commits: GithubCommit[] }> => {
    const query = `query ($owner: String!, $name: String!, $afterSha: String) {
  repository(owner: $owner, name: $name) {
    ref(qualifiedName: "master") {
      target {
        ... on Commit {
          history(first: 100, after: $afterSha) {
            totalCount
            pageInfo {
              hasNextPage
              endCursor
            }
            nodes {
              oid
              # use "message" instead of "messageHeadline" because GitHub truncates titles if they are too long
              message
              url
              authors(first: 100) {
                totalCount
                nodes {
                  name
                  user {
                    login
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}`;

    const variables = {
        owner,
        name: repo,
        afterSha: endCursor,
    };

    const response = (await (
        await fetch('https://api.github.com/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${githubToken.token}`,
            },
            body: JSON.stringify({ query, variables }),
        })
    ).json()) as CommitQueryResponse;

    const repoHistory = response.data.repository.ref.target.history;
    const { hasNextPage, endCursor: repoHistoryEndCursor } = repoHistory.pageInfo;
    const commits = repoHistory.nodes;
    const indexOfOldestCommitToLoad = commits.findIndex((commit) => commit.oid === loadUntilSha);

    const loadedAllCommits = indexOfOldestCommitToLoad !== -1;
    if (loadedAllCommits) {
        return { totalRepoCommitCount: repoHistory.totalCount, commits: commits.slice(0, indexOfOldestCommitToLoad) };
    }

    if (!hasNextPage) {
        throw new Error(`No commit with sha "${loadUntilSha}" found!`);
    }

    const loadedCommits = [
        ...commits,
        ...(await fetchCommits(owner, repo, loadUntilSha, repoHistoryEndCursor)).commits,
    ];
    return { totalRepoCommitCount: repoHistory.totalCount, commits: loadedCommits };
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
    const repo = 'Suwayomi-WebUI';

    const { totalRepoCommitCount: numberOfCommits, commits: githubCommits } = await fetchCommits(
        owner,
        repo,
        prevReleaseLastCommitSha,
    );

    const commits: Commit[] = githubCommits.map((githubCommit, index) => ({
        repoUrl: `https://github.com/${owner}/${repo}`,
        revision: numberOfCommits - index,
        url: githubCommit.url,
        githubUser: githubCommit.authors.nodes[0]?.user?.login,
        author: githubCommit.authors.nodes[0]?.name,
        title: githubCommit.message.split('\n')[0],
    }));

    const commitChangelogLines = commits.map(createChangelogCommitLine);
    commitChangelogLines.forEach((commit) => console.log('-', commit));
};

createChangelog(sha).catch((error) => {
    console.error('Failed due to', error);
    process.exit(1);
});
