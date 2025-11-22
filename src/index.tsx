/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import '@/polyfill.manual';
import '@/i18n';
import '@/lib/dayjs/Setup.ts';
import '@/lib/koration/Setup.ts';
import '@/index.css';
import '@/lib/PointerDeviceUtil.ts';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from '@/App';

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
    <StrictMode>
        <App />
    </StrictMode>,
);
