/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { epochToDate } from '@/util/DateHelper.ts';
import { GetAboutQuery } from '@/lib/graphql/generated/graphql.ts';

type AboutServer = GetAboutQuery['aboutServer'];

export const getVersion = (aboutServer: AboutServer) => {
    if (aboutServer.buildType === 'Stable') return `${aboutServer.version}`;
    return `${aboutServer.version}-${aboutServer.revision}`;
};

export const getBuildTime = (aboutServer: AboutServer) => epochToDate(Number(aboutServer.buildTime)).toString();
