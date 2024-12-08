/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useTranslation } from 'react-i18next';
import { useLayoutEffect, useState } from 'react';
import { useDefaultReaderSettingsWithDefaultFlag } from '@/modules/reader/services/ReaderSettingsMetadata.ts';
import { LoadingPlaceholder } from '@/modules/core/components/placeholder/LoadingPlaceholder.tsx';
import { EmptyViewAbsoluteCentered } from '@/modules/core/components/placeholder/EmptyViewAbsoluteCentered.tsx';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import { useNavBarContext } from '@/modules/navigation-bar/contexts/NavbarContext.tsx';
import { IReaderSettings } from '@/modules/reader/types/Reader.types.ts';
import { ReaderService } from '@/modules/reader/services/ReaderService.ts';
import { ReaderSettingsTabs } from '@/modules/reader/components/settings/ReaderSettingsTabs.tsx';

export const DefaultReaderSettings = () => {
    const { t } = useTranslation();
    const { setTitle, setAction } = useNavBarContext();

    useLayoutEffect(() => {
        setTitle(t('reader.settings.title.default_reader_settings'));
        setAction(null);

        return () => {
            setTitle('');
            setAction(null);
        };
    }, [t]);

    const [activeTab, setActiveTab] = useState(0);

    const {
        settings,
        request: { loading, error, refetch },
    } = useDefaultReaderSettingsWithDefaultFlag();

    const updateSetting = <Setting extends keyof IReaderSettings>(
        key: Setting,
        value: IReaderSettings[Setting],
        commit?: boolean,
    ) => {
        ReaderService.updateSetting({ id: -1 }, key, value, commit, true);
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

    return (
        <ReaderSettingsTabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            areDefaultSettings
            settings={settings}
            updateSetting={(setting, value, commit) => updateSetting(setting, value, commit)}
        />
    );
};
