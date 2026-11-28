/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

export type AbortableRequest = { abortRequest: AbortController['abort'] };

export const createAbortController = (): { signal: AbortSignal } & AbortableRequest => {
    const abortController = new AbortController();
    const abortRequest = (reason?: any): void => {
        if (!abortController.signal.aborted) {
            abortController.abort(reason);
        }
    };

    return { signal: abortController.signal, abortRequest };
};
