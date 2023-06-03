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
import { IReaderSettings } from 'typings';
import { useTranslation } from 'react-i18next';

export default function DefaultReaderSettings() {
    const { t } = useTranslation();
    const { setTitle, setAction } = useContext(NavbarContext);
    useEffect(() => {
        setTitle(t('reader.settings.title.default_reader_settings'));
        setAction(null);
    }, [t]);

    const { metadata, settings, loading } = useDefaultReaderSettings();

    const setSettingValue = (key: keyof IReaderSettings, value: string | boolean) => {
        requestUpdateServerMetadata(metadata ?? {}, [[key, value]]).catch(() =>
            makeToast(t('reader.settings.error.label.failed_to_save_settings'), 'warning'),
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
            skipDupChapters={settings.skipDupChapters}
            fitPageToWindow={settings.fitPageToWindow}
            readerType={settings.readerType}
        />
    );
}
