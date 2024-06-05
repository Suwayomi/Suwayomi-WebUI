/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AllowedMetadataValueTypes, IReaderSettings } from '@/typings';
import { convertToGqlMeta, requestUpdateServerMetadata } from '@/lib/metadata/metadata.ts';
import {
    checkAndHandleMissingStoredReaderSettings,
    getDefaultSettings,
    useDefaultReaderSettings,
} from '@/lib/metadata/readerSettings.ts';
import { ReaderSettingsOptions } from '@/components/reader/ReaderSettingsOptions';
import { makeToast } from '@/components/util/Toast';
import { NavBarContext } from '@/components/context/NavbarContext';
import { defaultPromiseErrorHandler } from '@/util/defaultPromiseErrorHandler.ts';
import { EmptyViewAbsoluteCentered } from '@/components/util/EmptyViewAbsoluteCentered.tsx';
import { LoadingPlaceholder } from '@/components/util/LoadingPlaceholder.tsx';

export function DefaultReaderSettings() {
    const { t } = useTranslation();
    const { setTitle, setAction } = useContext(NavBarContext);
    useEffect(() => {
        setTitle(t('reader.settings.title.default_reader_settings'));
        setAction(null);

        return () => {
            setTitle('');
            setAction(null);
        };
    }, [t]);

    const {
        metadata,
        settings,
        loading,
        request: { error, refetch },
    } = useDefaultReaderSettings();

    const setSettingValue = (key: keyof IReaderSettings, value: AllowedMetadataValueTypes, persist: boolean = true) => {
        if (persist) {
            requestUpdateServerMetadata([[key, value]]).catch(() =>
                makeToast(t('reader.settings.error.label.failed_to_save_settings'), 'warning'),
            );
        }
    };

    if (loading) {
        return <LoadingPlaceholder />;
    }

    if (error) {
        return (
            <EmptyViewAbsoluteCentered
                message={t('global.error.label.failed_to_load_data')}
                messageExtra={error.message}
                retry={() => refetch().catch(defaultPromiseErrorHandler('DefaultReaderSettings::refetch'))}
            />
        );
    }

    checkAndHandleMissingStoredReaderSettings(
        { meta: convertToGqlMeta(metadata)! },
        'server',
        getDefaultSettings(),
    ).catch(defaultPromiseErrorHandler('DefaultReaderSettings::checkAndHandleMissingStoredReaderSettings'));

    return (
        <ReaderSettingsOptions
            setSettingValue={setSettingValue}
            staticNav={settings.staticNav}
            showPageNumber={settings.showPageNumber}
            loadNextOnEnding={settings.loadNextOnEnding}
            skipDupChapters={settings.skipDupChapters}
            fitPageToWindow={settings.fitPageToWindow}
            scalePage={settings.scalePage}
            readerType={settings.readerType}
            offsetFirstPage={settings.offsetFirstPage}
            readerWidth={settings.readerWidth}
        />
    );
}
