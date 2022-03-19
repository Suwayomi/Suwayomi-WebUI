/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import React from 'react';

/**
 * The ContextType type is a type that has a darkTheme boolean property and a setDarkTheme function.
 * @property {boolean} darkTheme - A boolean that determines whether the app is in dark mode or not.
 * @property setDarkTheme - This is a function that will set the dark theme to true or false.
 */
type ContextType = {
    darkTheme: boolean
    setDarkTheme: React.Dispatch<React.SetStateAction<boolean>>
};

const DarkTheme = React.createContext<ContextType>({
    darkTheme: true,
    setDarkTheme: ():void => {},
});

export default DarkTheme;
