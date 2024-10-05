/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useContext, useLayoutEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { requestUpdateServerMetadata } from '@/modules/metadata/services/MetadataUpdater.ts';
import {
    checkAndHandleMissingStoredReaderSettings,
    useDefaultReaderSettings,
} from '@/modules/reader/services/ReaderSettingsMetadata.ts';
import { ReaderSettingsOptions } from '@/modules/reader/components/ReaderSettingsOptions.tsx';
import { makeToast } from '@/lib/ui/Toast.ts';
import { NavBarContext } from '@/modules/navigation-bar/contexts/NavbarContext.tsx';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import { EmptyViewAbsoluteCentered } from '@/modules/core/components/placeholder/EmptyViewAbsoluteCentered.tsx';
import { LoadingPlaceholder } from '@/modules/core/components/placeholder/LoadingPlaceholder.tsx';
import { DEFAULT_READER_SETTINGS } from '@/modules/reader/Reader.constants.ts';
import { IReaderSettings } from '@/modules/reader/Reader.types.ts';
import { convertToGqlMeta } from '@/modules/metadata/services/MetadataConverter.ts';
import { AllowedMetadataValueTypes } from '@/modules/metadata/Metadata.types.ts';

export function DefaultReaderSettings() {
    const { t } = useTranslation();
    const { setTitle, setAction } = useContext(NavBarContext);
    useLayoutEffect(() => {
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
        DEFAULT_READER_SETTINGS,
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
