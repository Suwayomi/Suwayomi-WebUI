/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import path from 'path';
import fs from 'fs';

const outputFilePath = path.join(import.meta.dirname, '../../src/i18n/index.ts');
const resourcesDirPath = path.join(import.meta.dirname, '../../public/locales');

const resourceFileNames = fs.readdirSync(resourcesDirPath);

const resourceNames = resourceFileNames.map((resourceFileName) =>
    path.basename(resourceFileName, path.extname(resourceFileName)),
);

const outputFileContent = fs.readFileSync(outputFilePath, 'utf-8');

const updatedFileContent = outputFileContent.replace(
    /(export const i18nResources = \[)[\s\S]*?(])/g,
    `$1'${resourceNames.join("', '")}'$2`,
);

fs.writeFileSync(outputFilePath, updatedFileContent);
