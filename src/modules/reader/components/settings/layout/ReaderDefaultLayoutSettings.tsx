/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Stack from '@mui/material/Stack';
import { ComponentProps } from 'react';
import { ReaderLayoutSettings } from '@/modules/reader/components/settings/layout/ReaderLayoutSettings.tsx';
import { ReaderSettingProfiles } from '@/modules/reader/components/settings/layout/profiles/ReaderSettingProfiles.tsx';
import { ReaderSettingReadingModesDefaultProfile } from '@/modules/reader/components/settings/layout/profiles/ReaderSettingReadingModesDefaultProfile.tsx';
import { ReaderSettingProfileSettings } from '@/modules/reader/components/settings/layout/profiles/ReaderSettingProfileSettings.tsx';
import { DEFAULT_READER_PROFILE } from '@/modules/reader/constants/ReaderSettings.constants.tsx';
import { IReaderSettings } from '@/modules/reader/types/Reader.types.ts';

export const ReaderDefaultLayoutSettings = (
    props: Omit<ComponentProps<typeof ReaderLayoutSettings>, 'setShowPreview'>,
) => {
    const { settings, updateSetting } = props;

    return (
        <Stack sx={{ gap: 2, pb: 2 }}>
            <Stack sx={{ gap: 2 }}>
                <ReaderSettingProfiles
                    profiles={settings.profiles}
                    updateSetting={(profiles, removedProfiles) => {
                        if (removedProfiles.length) {
                            updateSetting(
                                'readingModesDefaultProfile',
                                Object.fromEntries(
                                    Object.entries(settings.readingModesDefaultProfile).map(
                                        ([readingMode, profile]) => [
                                            readingMode,
                                            removedProfiles.includes(profile) ? DEFAULT_READER_PROFILE : profile,
                                        ],
                                    ),
                                ) as IReaderSettings['readingModesDefaultProfile'],
                            );
                        }

                        updateSetting('profiles', profiles);
                    }}
                />
                <Stack sx={{ px: 2 }}>
                    <ReaderSettingReadingModesDefaultProfile
                        profiles={settings.profiles}
                        readingModesDefaultProfile={settings.readingModesDefaultProfile}
                        updateSetting={(readingModesDefaultProfile) =>
                            updateSetting('readingModesDefaultProfile', readingModesDefaultProfile)
                        }
                    />
                </Stack>
            </Stack>
            {settings.profiles.map((profile) => (
                <ReaderSettingProfileSettings key={profile} profile={profile} {...props} />
            ))}
        </Stack>
    );
};
