/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import fs from 'fs';
import * as path from 'path';

const format = (source: string, regex: RegExp | string, replaceValue: string): string =>
    source.replace(regex, replaceValue);

const generatedGraphQLFilePath = path.resolve(import.meta.dirname, '../../src/lib/graphql/generated/graphql.ts');
const generatedGraphQLFile = fs.readFileSync(generatedGraphQLFilePath, 'utf8');

// add logic to format the codegen generated graphql file

/* ******************************************* */
/*                                             */
/*      typescript, typescript-operations      */
/*                                             */
/* ******************************************* */

const fixSubscriptionHookNameSuffix = format(generatedGraphQLFile, /SubscriptionSubscription/g, 'Subscription');

fs.writeFileSync(generatedGraphQLFilePath, fixSubscriptionHookNameSuffix);

/* ****************************************** */
/*                                            */
/*      typescript-apollo-client-helpers      */
/*                                            */
/* ****************************************** */

// generatedGraphQLFilePath = path.resolve(import.meta.dirname, '../../src/lib/graphql/generated/apollo-helpers.ts');
// generatedGraphQLFile = fs.readFileSync(generatedGraphQLFilePath, 'utf8');
