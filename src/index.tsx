/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import '@/polyfill.manual';
import '@fontsource/roboto';
import '@/lib/dayjs/Setup.ts';
import '@/index.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from '@/App';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
        registration.unregister().catch(defaultPromiseErrorHandler('unregister service workers'));
        if (caches) {
            caches.keys().then(async (names) => {
                await Promise.all(names.map((name) => caches.delete(name)));
            });
        }
    });
}

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
    <StrictMode>
        <App />
    </StrictMode>,
);
