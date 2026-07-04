/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { BrowserUtil } from '@/lib/BrowserUtil.ts';
import { AppStorage } from '@/lib/storage/AppStorage.ts';

const STARTUP_TIMESTAMP_KEY = 'webUIStartupTimestamp';

class AppSessionClass {
    constructor() {
        if (BrowserUtil.isActualPageLoad()) {
            AppStorage.session.setItem(STARTUP_TIMESTAMP_KEY, Date.now());
        }
    }

    get STARTUP_TIMESTAMP(): number {
        return AppStorage.session.getItemParsed(STARTUP_TIMESTAMP_KEY, Date.now());
    }

    isSecureContext(): boolean {
        return window.isSecureContext;
    }
}

export const AppSession = new AppSessionClass();
