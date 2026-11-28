/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

// Biome has no license header rule
import { execSync } from 'child_process';
import { readFileSync } from 'fs';

const HEADER = `/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
`;

const filesWithoutHeader = execSync(
    "git ls-files --cached --others --exclude-standard -- src tools ':!src/lib/graphql/generated'",
    { encoding: 'utf8' },
)
    .split('\n')
    .filter((file) => /\.[cm]?[jt]sx?$/.test(file))
    .filter((file) => !readFileSync(file, 'utf8').includes(HEADER));

if (filesWithoutHeader.length) {
    console.error(`Missing license header:\n${filesWithoutHeader.join('\n')}`);
    process.exit(1);
}
