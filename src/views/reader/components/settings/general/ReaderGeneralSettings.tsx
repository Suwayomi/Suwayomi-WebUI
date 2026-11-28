/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Stack from '@mui/material/Stack';
import { useLingui } from '@lingui/react/macro';
import { ReaderSettingProgressBarType } from '@/views/reader/components/overlay/progress-bar/settings/ReaderSettingProgressBarType.tsx';
import { ReaderSettingProgressBarSize } from '@/views/reader/components/overlay/progress-bar/settings/ReaderSettingProgressBarSize.tsx';
import { ReaderSettingProgressBarPosition } from '@/views/reader/components/overlay/progress-bar/settings/ReaderSettingProgressBarPosition.tsx';
import type { IReaderSettings, ReaderSettingsTypeProps } from '@/models/reader/Reader.types.ts';
import { ReaderSettingOverlayMode } from '@/views/reader/components/overlay/settings/ReaderSettingOverlayMode.tsx';
import { CheckboxInput } from '@/views/base/components/inputs/CheckboxInput.tsx';
import { ReaderSettingBackgroundColor } from '@/views/reader/components/settings/general/ReaderSettingBackgroundColor.tsx';
import { ReaderSettingSafeAreaInset } from '@/views/reader/components/settings/general/ReaderSettingSafeAreaInset.tsx';
import { ReaderService } from '@/controllers/reader/services/ReaderService.ts';

export const ReaderGeneralSettings = ({
    overlayMode,
    settings,
    updateSetting,
    onDefault,
}: Pick<IReaderSettings, 'overlayMode'> & ReaderSettingsTypeProps) => {
    const { t } = useLingui();

    return (
        <Stack sx={{ gap: 2 }}>
            <ReaderSettingOverlayMode
                overlayMode={settings.overlayMode}
                setOverlayMode={(value) => updateSetting('overlayMode', value)}
            />
            <ReaderSettingBackgroundColor
                backgroundColor={settings.backgroundColor}
                useAutoBackgroundColorContinuousMode={settings.useAutoBackgroundColorContinuousMode}
                updateSetting={(...args) => updateSetting(...args)}
            />
            <ReaderSettingProgressBarType
                overlayMode={overlayMode}
                progressBarType={settings.progressBarType}
                setProgressBarType={(value) => updateSetting('progressBarType', value)}
            />
            <ReaderSettingProgressBarSize
                overlayMode={overlayMode}
                progressBarType={settings.progressBarType}
                progressBarSize={settings.progressBarSize}
                setProgressBarSize={(...args) => updateSetting('progressBarSize', ...args)}
                onDefault={() => onDefault?.('progressBarSize')}
            />
            <ReaderSettingProgressBarPosition
                progressBarPosition={settings.progressBarPosition}
                progressBarPositionAutoVertical={settings.progressBarPositionAutoVertical}
                updateSetting={updateSetting}
            />
            <CheckboxInput
                label={t`Show page number`}
                checked={settings.shouldShowPageNumber}
                onChange={(_, checked) => updateSetting('shouldShowPageNumber', checked)}
            />
            <CheckboxInput
                label={t`Fullscreen`}
                checked={settings.shouldEnterFullscreen}
                onChange={(_, checked) => {
                    updateSetting('shouldEnterFullscreen', checked);

                    if (!onDefault) {
                        return;
                    }

                    if (checked) {
                        ReaderService.enterFullscreen();
                    } else {
                        ReaderService.exitFullscreen(undefined, true);
                    }
                }}
            />
            <ReaderSettingSafeAreaInset
                safeAreaInset={settings.safeAreaInset}
                updateSetting={(value) => updateSetting('safeAreaInset', value)}
            />
        </Stack>
    );
};
