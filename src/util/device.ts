/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import React from 'react';

export const DEFAULT_DEVICE = 'default';

let activeDevice = DEFAULT_DEVICE;
export const getActiveDevice = (): string => activeDevice;
export const setActiveDevice = (device: string) => {
    activeDevice = device;
};

export const ActiveDevice = React.createContext<{ activeDevice: string; setActiveDevice: (device: string) => void }>({
    activeDevice: DEFAULT_DEVICE,
    setActiveDevice: () => {},
});
