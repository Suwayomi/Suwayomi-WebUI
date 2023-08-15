/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import fs from 'fs';
import * as path from 'path';

const format = (source: string, regex: RegExp, replaceValue: string): string => source.replace(regex, replaceValue);

const generatedGraphQLFilePath = path.resolve(__dirname, '../../src/lib/graphql/generated/graphql.ts');
const generatedGraphQLFile = fs.readFileSync(generatedGraphQLFilePath, 'utf8');

// add logic to format the codegen generated graphql file

const fixCursorTyping = format(
    generatedGraphQLFile,
    /Cursor: \{ input: any; output: any; }/g,
    'Cursor: { input: string; output: string; }',
);

const fixLongStringTyping = format(
    fixCursorTyping,
    /LongString: \{ input: any; output: any; }/g,
    'LongString: { input: string; output: string; }',
);

const fixSubscriptionHookNameSuffix = format(fixLongStringTyping, /SubscriptionSubscription/g, 'Subscription');

fs.writeFileSync(generatedGraphQLFilePath, fixSubscriptionHookNameSuffix);
