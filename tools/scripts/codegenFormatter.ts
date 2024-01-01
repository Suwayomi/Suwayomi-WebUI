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

let generatedGraphQLFilePath = path.resolve(__dirname, '../../src/lib/graphql/generated/graphql.ts');
let generatedGraphQLFile = fs.readFileSync(generatedGraphQLFilePath, 'utf8');

// add logic to format the codegen generated graphql file

/* ******************************************* */
/*                                             */
/*      typescript, typescript-operations      */
/*                                             */
/* ******************************************* */

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

/* ****************************************** */
/*                                            */
/*      typescript-apollo-client-helpers      */
/*                                            */
/* ****************************************** */

generatedGraphQLFilePath = path.resolve(__dirname, '../../src/lib/graphql/generated/apollo-helpers.ts');
generatedGraphQLFile = fs.readFileSync(generatedGraphQLFilePath, 'utf8');

const addImports = format(
    generatedGraphQLFile,
    `import { FieldPolicy, FieldReadFunction, TypePolicies, TypePolicy } from '@apollo/client/cache';`,
    `import {FieldPolicy, FieldReadFunction, Reference, TypePolicies, TypePolicy} from '@apollo/client/cache';
import {
\tGetCategoryQueryVariables, GetChapterQueryVariables,
\tGetChaptersQuery, GetDownloadStatusQueryVariables, GetExtensionQueryVariables, GetGlobalMetadataQueryVariables,
\tGetMangaQueryVariables, GetSourceQueryVariables, GetUpdateStatusQueryVariables, GetWebuiUpdateStatusQueryVariables,
} from "@/lib/graphql/generated/graphql.ts";
import {FieldFunctionOptions} from "@apollo/client/cache/inmemory/policies";`,
);

const fixTypingOfQueryTypePolicies = format(
    addImports,
    `export type QueryFieldPolicy = {
\taboutServer?: FieldPolicy<any> | FieldReadFunction<any>,
\taboutWebUI?: FieldPolicy<any> | FieldReadFunction<any>,
\tcategories?: FieldPolicy<any> | FieldReadFunction<any>,
\tcategory?: FieldPolicy<any> | FieldReadFunction<any>,
\tchapter?: FieldPolicy<any> | FieldReadFunction<any>,
\tchapters?: FieldPolicy<any> | FieldReadFunction<any>,
\tcheckForServerUpdates?: FieldPolicy<any> | FieldReadFunction<any>,
\tcheckForWebUIUpdate?: FieldPolicy<any> | FieldReadFunction<any>,
\tdownloadStatus?: FieldPolicy<any> | FieldReadFunction<any>,
\textension?: FieldPolicy<any> | FieldReadFunction<any>,
\textensions?: FieldPolicy<any> | FieldReadFunction<any>,
\tgetWebUIUpdateStatus?: FieldPolicy<any> | FieldReadFunction<any>,
\tlastUpdateTimestamp?: FieldPolicy<any> | FieldReadFunction<any>,
\tmanga?: FieldPolicy<any> | FieldReadFunction<any>,
\tmangas?: FieldPolicy<any> | FieldReadFunction<any>,
\tmeta?: FieldPolicy<any> | FieldReadFunction<any>,
\tmetas?: FieldPolicy<any> | FieldReadFunction<any>,
\trestoreStatus?: FieldPolicy<any> | FieldReadFunction<any>,
\tsettings?: FieldPolicy<any> | FieldReadFunction<any>,
\tsource?: FieldPolicy<any> | FieldReadFunction<any>,
\tsources?: FieldPolicy<any> | FieldReadFunction<any>,
\tupdateStatus?: FieldPolicy<any> | FieldReadFunction<any>,
\tvalidateBackup?: FieldPolicy<any> | FieldReadFunction<any>
};`,
    `export type QueryFieldPolicy = {
\tabout?: FieldPolicy<any> | FieldReadFunction<any>,
\tcategories?: FieldPolicy<any> | FieldReadFunction<any>,
\tcategory?: FieldPolicy<Reference, Reference, Reference, FieldFunctionOptions<GetCategoryQueryVariables>> | FieldReadFunction<Reference, Reference, FieldFunctionOptions<GetCategoryQueryVariables>>,
\tchapter?: FieldPolicy<Reference, Reference, Reference, FieldFunctionOptions<GetChapterQueryVariables>> | FieldReadFunction<Reference, Reference, FieldFunctionOptions<GetChapterQueryVariables>>,
\tchapters?: FieldPolicy<GetChaptersQuery['chapters']> | FieldReadFunction<GetChaptersQuery['chapters']>,
\tcheckForServerUpdates?: FieldPolicy<any> | FieldReadFunction<any>,
\tcheckForWebUIUpdate?: FieldPolicy<any> | FieldReadFunction<any>,
\tdownloadStatus?: FieldPolicy<Reference, Reference, Reference, FieldFunctionOptions<GetDownloadStatusQueryVariables>> | FieldReadFunction<Reference, Reference, FieldFunctionOptions<GetDownloadStatusQueryVariables>>,
\textension?: FieldPolicy<Reference, Reference, Reference, FieldFunctionOptions<GetExtensionQueryVariables>> | FieldReadFunction<Reference, Reference, FieldFunctionOptions<GetExtensionQueryVariables>>,
\textensions?: FieldPolicy<any> | FieldReadFunction<any>,
\tgetWebUIUpdateStatus?: FieldPolicy<Reference, Reference, Reference, FieldFunctionOptions<GetWebuiUpdateStatusQueryVariables>> | FieldReadFunction<Reference, Reference, FieldFunctionOptions<GetWebuiUpdateStatusQueryVariables>>,
\tlastUpdateTimestamp?: FieldPolicy<any> | FieldReadFunction<any>,
\tmanga?: FieldPolicy<Reference, Reference, Reference, FieldFunctionOptions<GetMangaQueryVariables>> | FieldReadFunction<Reference, Reference, FieldFunctionOptions<GetMangaQueryVariables>>,
\tmangas?: FieldPolicy<any> | FieldReadFunction<any>,
\tmeta?: FieldPolicy<Reference, Reference, Reference, FieldFunctionOptions<GetGlobalMetadataQueryVariables>> | FieldReadFunction<Reference, Reference, FieldFunctionOptions<GetGlobalMetadataQueryVariables>>,
\tmetas?: FieldPolicy<any> | FieldReadFunction<any>,
\trestoreStatus?: FieldPolicy<any> | FieldReadFunction<any>,
\tsettings?: FieldPolicy<any> | FieldReadFunction<any>,
\tsource?: FieldPolicy<Reference, Reference, Reference, FieldFunctionOptions<GetSourceQueryVariables>> | FieldReadFunction<Reference, Reference, FieldFunctionOptions<GetSourceQueryVariables>>,
\tsources?: FieldPolicy<any> | FieldReadFunction<any>,
\tupdateStatus?: FieldPolicy<Reference, Reference, Reference, FieldFunctionOptions<GetUpdateStatusQueryVariables>> | FieldReadFunction<Reference, Reference, FieldFunctionOptions<GetUpdateStatusQueryVariables>>,
\tvalidateBackup?: FieldPolicy<any> | FieldReadFunction<any>
};`,
);

fs.writeFileSync(generatedGraphQLFilePath, fixTypingOfQueryTypePolicies);
