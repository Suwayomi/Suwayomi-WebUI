/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable react/destructuring-assignment */
/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import React, { useContext, useEffect } from 'react';
import NavbarContext from 'components/context/NavbarContext';
import { Box } from '@mui/system';
import CircularProgress from '@mui/material/CircularProgress';
import { requestUpdateServerMetadata } from 'util/metadata';
import makeToast from 'components/util/Toast';
import {
    checkAndHandleMissingStoredReaderSettings,
    getDefaultSettings,
    useDefaultReaderSettings,
} from 'util/readerSettings';
import ReaderSettingsOptions from 'components/reader/ReaderSettingsOptions';

export default function DefaultReaderSettings() {
    const { setTitle, setAction } = useContext(NavbarContext);
    useEffect(() => {
        setTitle('Default Reader Settings');
        setAction(<></>);
    }, []);

    const { metadata, settings, loading } = useDefaultReaderSettings();

    const setSettingValue = (key: keyof IReaderSettings, value: string | boolean) => {
        requestUpdateServerMetadata(metadata ?? {}, [[key, value]]).catch(() =>
            makeToast('Failed to save the default reader settings to the server', 'warning'),
        );
    };

    if (loading) {
        return (
            <Box
                sx={{
                    height: '100vh',
                    width: '100vw',
                    display: 'grid',
                    placeItems: 'center',
                }}
            >
                <CircularProgress thickness={5} />
            </Box>
        );
    }

    checkAndHandleMissingStoredReaderSettings({ meta: metadata }, 'server', getDefaultSettings()).catch(() => {});

    return (
        <ReaderSettingsOptions
            setSettingValue={setSettingValue}
            staticNav={settings.staticNav}
            showPageNumber={settings.showPageNumber}
            loadNextOnEnding={settings.loadNextOnEnding}
            readerType={settings.readerType}
        />
    );
}
