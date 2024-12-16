/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Stack from '@mui/material/Stack';
import ListSubheader from '@mui/material/ListSubheader';
import { ComponentProps, useMemo } from 'react';
import { ReaderLayoutSettings } from '@/modules/reader/components/settings/layout/ReaderLayoutSettings.tsx';
import { useDefaultReaderSettingsWithDefaultFlag } from '@/modules/reader/services/ReaderSettingsMetadata.ts';
import { ReadingMode } from '@/modules/reader/types/Reader.types.ts';

export const ReaderSettingProfileSettings = ({
    profile,
    title,
    updateSetting,
    ...props
}: Pick<ComponentProps<typeof ReaderLayoutSettings>, 'updateSetting'> & { profile: ReadingMode; title: string }) => {
    const { settings } = useDefaultReaderSettingsWithDefaultFlag(profile);

    const adjustedSettings = useMemo(
        () => ({
            ...settings,
            readingMode: {
                value: profile,
                isDefault: true,
            },
        }),
        [settings, profile],
    );

    return (
        <Stack sx={{ gap: 2 }}>
            <ListSubheader component="div" id={`${profile}-settings`}>
                {title}
            </ListSubheader>
            <Stack sx={{ px: 2 }}>
                <ReaderLayoutSettings
                    {...props}
                    setShowPreview={() => {}}
                    settings={adjustedSettings}
                    updateSetting={(setting, value, commit) => updateSetting(setting, value, commit, true, profile)}
                />
            </Stack>
        </Stack>
    );
};
