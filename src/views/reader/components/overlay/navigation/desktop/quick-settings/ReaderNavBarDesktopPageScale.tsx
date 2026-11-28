/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Stack from '@mui/material/Stack';
import FitScreenIcon from '@mui/icons-material/FitScreen';
import { useLingui } from '@lingui/react/macro';
import { CustomTooltip } from '@/views/base/components/CustomTooltip.tsx';
import type {
    IReaderSettings,
    IReaderSettingsWithDefaultFlag,
    ReaderPageScaleMode,
} from '@/models/reader/Reader.types.ts';
import {
    PAGE_SCALE_VALUE_TO_DISPLAY_DATA,
    READER_PAGE_SCALE_MODE_TO_SCALING_ALLOWED,
    READER_PAGE_SCALE_MODE_VALUES,
} from '@/models/reader/settings/ReaderSettings.constants.tsx';
import { CustomIconButton } from '@/views/base/components/buttons/CustomIconButton.tsx';
import type { SelectButtonDefaultableProps } from '@/views/base/components/buttons/SelectButton.tsx';
import { SelectButton } from '@/views/base/components/buttons/SelectButton.tsx';

export const ReaderNavBarDesktopPageScale = ({
    pageScaleMode,
    shouldStretchPage,
    updateSetting,
    ...buttonSelectInputProps
}: Pick<IReaderSettingsWithDefaultFlag, 'pageScaleMode' | 'shouldStretchPage'> &
    Pick<SelectButtonDefaultableProps<ReaderPageScaleMode>, 'isDefaultable' | 'onDefault'> & {
        updateSetting: <Setting extends keyof Pick<IReaderSettings, 'pageScaleMode' | 'shouldStretchPage'>>(
            setting: Setting,
            value: IReaderSettings[Setting],
        ) => void;
    }) => {
    const { t } = useLingui();

    return (
        <Stack sx={{ flexDirection: 'row', gap: 1 }}>
            <SelectButton<ReaderPageScaleMode>
                {...buttonSelectInputProps}
                tooltip={t`Scale type`}
                value={pageScaleMode.isDefault ? undefined : pageScaleMode.value}
                defaultValue={pageScaleMode.isDefault ? pageScaleMode.value : undefined}
                values={READER_PAGE_SCALE_MODE_VALUES}
                setValue={(value) => updateSetting('pageScaleMode', value)}
                valueToDisplayData={PAGE_SCALE_VALUE_TO_DISPLAY_DATA}
                defaultIcon={PAGE_SCALE_VALUE_TO_DISPLAY_DATA[pageScaleMode.value].icon}
                isCollapsible
            />
            {READER_PAGE_SCALE_MODE_TO_SCALING_ALLOWED[pageScaleMode.value] && (
                <CustomTooltip title={t`Stretch small pages`}>
                    <CustomIconButton
                        onClick={() => updateSetting('shouldStretchPage', !shouldStretchPage.value)}
                        sx={{ px: undefined }}
                        variant="contained"
                        color={shouldStretchPage.value ? 'secondary' : 'primary'}
                    >
                        <FitScreenIcon />
                    </CustomIconButton>
                </CustomTooltip>
            )}
        </Stack>
    );
};
