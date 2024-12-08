/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Stack from '@mui/material/Stack';
import ListSubheader from '@mui/material/ListSubheader';
import { ComponentProps } from 'react';
import { useTranslation } from 'react-i18next';
import { ReaderLayoutSettings } from '@/modules/reader/components/settings/layout/ReaderLayoutSettings.tsx';
import { useDefaultReaderSettingsWithDefaultFlag } from '@/modules/reader/services/ReaderSettingsMetadata.ts';
import { DEFAULT_READER_PROFILE } from '@/modules/reader/constants/ReaderSettings.constants.tsx';

export const ReaderSettingProfileSettings = ({
    profile,
    updateSetting,
    ...props
}: Pick<ComponentProps<typeof ReaderLayoutSettings>, 'updateSetting'> & { profile: string }) => {
    const { t } = useTranslation();
    const { settings } = useDefaultReaderSettingsWithDefaultFlag(profile);

    return (
        <Stack sx={{ gap: 2 }}>
            <ListSubheader component="div" id={`${profile}-settings`}>
                {profile === DEFAULT_READER_PROFILE ? t('global.label.standard') : profile}
            </ListSubheader>
            <Stack sx={{ px: 2 }}>
                <ReaderLayoutSettings
                    {...props}
                    setShowPreview={() => {}}
                    settings={settings}
                    updateSetting={(setting, value, commit) => updateSetting(setting, value, commit, true, profile)}
                />
            </Stack>
        </Stack>
    );
};
