/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import { useTranslation } from 'react-i18next';
import { IReaderSettingsWithDefaultFlag } from '@/modules/reader/types/Reader.types.ts';
import { MultiValueButtonDefaultableProps } from '@/modules/core/Core.types.ts';
import { ValueRotationButton } from '@/modules/core/components/buttons/ValueRotationButton.tsx';
import {
    createProfileValueToDisplayData,
    getValidReaderProfile,
} from '@/modules/reader/utils/ReaderSettings.utils.tsx';

export const ReaderNavBarDesktopProfile = ({
    defaultProfile,
    profiles,
    updateSetting,
    ...buttonSelectInputProps
}: Pick<IReaderSettingsWithDefaultFlag, 'defaultProfile' | 'profiles'> &
    Pick<MultiValueButtonDefaultableProps<string>, 'isDefaultable' | 'onDefault'> & {
        updateSetting: (profile: string) => void;
    }) => {
    const { t } = useTranslation();

    return (
        <ValueRotationButton
            {...buttonSelectInputProps}
            tooltip={t('global.label.profile_one')}
            value={defaultProfile.isDefault ? undefined : getValidReaderProfile(defaultProfile.value, profiles)}
            values={profiles}
            setValue={updateSetting}
            valueToDisplayData={createProfileValueToDisplayData(profiles, true)}
            defaultIcon={<ManageAccountsIcon />}
        />
    );
};
