/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useTranslation } from 'react-i18next';
import { MutableListSetting } from '@/modules/core/components/settings/MutableListSetting.tsx';
import { IReaderSettings } from '@/modules/reader/types/Reader.types.ts';
import { DEFAULT_READER_PROFILE } from '@/modules/reader/constants/ReaderSettings.constants.tsx';

export const ReaderSettingProfiles = ({
    profiles,
    updateSetting,
}: Pick<IReaderSettings, 'profiles'> & {
    updateSetting: (profiles: IReaderSettings['profiles'], removedProfiles: string[]) => void;
}) => {
    const { t } = useTranslation();

    return (
        <MutableListSetting
            settingName={t('global.label.profile_other')}
            description={t('reader.settings.profiles.description')}
            handleChange={(profileList, removedProfiles) =>
                updateSetting(
                    [
                        ...new Set(
                            [DEFAULT_READER_PROFILE, ...profileList].filter(
                                (device) => device !== t('global.label.standard'),
                            ),
                        ),
                    ],
                    removedProfiles,
                )
            }
            valueInfos={profiles.map((profile) => [
                profile === DEFAULT_READER_PROFILE ? t('global.label.standard') : profile,
                { mutable: false, deletable: profile !== DEFAULT_READER_PROFILE },
            ])}
            addItemButtonTitle={t('global.button.create')}
            validateItem={(profileToValidate, tmpProfiles) =>
                profileToValidate.length <= 16 &&
                !!profileToValidate.match(/^[a-zA-Z0-9\-_]+$/g) &&
                ![...profiles, ...(tmpProfiles ?? [])]
                    .map((profile) => profile.toLowerCase())
                    .includes(profileToValidate.toLowerCase())
            }
            placeholder={t('reader.settings.profiles.placeholder')}
        />
    );
};
