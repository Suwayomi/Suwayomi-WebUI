/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useState } from 'react';
import { useLingui } from '@lingui/react/macro';
import { useDefaultReaderSettingsWithDefaultFlag } from '@/controllers/reader/services/settings/ReaderSettingsMetadata.ts';
import { LoadingPlaceholder } from '@/views/base/components/feedback/LoadingPlaceholder.tsx';
import { EmptyViewAbsoluteCentered } from '@/views/base/components/feedback/EmptyViewAbsoluteCentered.tsx';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import type { IReaderSettings, ReadingMode } from '@/models/reader/Reader.types.ts';
import { ReaderService } from '@/controllers/reader/services/ReaderService.ts';
import { ReaderSettingsTabs } from '@/views/reader/components/settings/ReaderSettingsTabs.tsx';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';
import { useAppTitle } from '@/controllers/navigation-bar/hooks/useAppTitle.ts';

export const GlobalReaderSettings = () => {
    const { t } = useLingui();

    useAppTitle(t`Reader`);

    const [activeTab, setActiveTab] = useState(0);

    const {
        settings,
        request: { loading, error, refetch },
    } = useDefaultReaderSettingsWithDefaultFlag();

    const updateSetting = <Setting extends keyof IReaderSettings>(
        key: Setting,
        value: IReaderSettings[Setting],
        commit?: boolean,
        profile?: ReadingMode,
    ) => {
        ReaderService.updateSetting(key, value, commit, true, profile);
    };

    if (loading) {
        return <LoadingPlaceholder />;
    }

    if (error) {
        return (
            <EmptyViewAbsoluteCentered
                message={t`Unable to load data`}
                messageExtra={getErrorMessage(error)}
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
            updateSetting={(setting, value, commit, _, profile) => updateSetting(setting, value, commit, profile)}
            deleteSetting={(setting) => ReaderService.deleteSetting(setting, true)}
        />
    );
};
