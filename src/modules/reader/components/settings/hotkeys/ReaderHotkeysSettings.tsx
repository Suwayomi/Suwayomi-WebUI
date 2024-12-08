/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Stack from '@mui/material/Stack';
import { useTranslation } from 'react-i18next';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { ReaderSettingsTypeProps } from '@/modules/reader/types/Reader.types.ts';
import { ReaderSettingHotkey } from '@/modules/reader/components/settings/hotkeys/ReaderSettingHotkey.tsx';
import { DEFAULT_READER_SETTINGS, READER_HOTKEYS } from '@/modules/reader/constants/ReaderSettings.constants.tsx';

export const ReaderHotkeysSettings = ({ settings, updateSetting }: ReaderSettingsTypeProps) => {
    const { t } = useTranslation();

    return (
        <Stack sx={{ gap: 2 }}>
            <Stack sx={{ alignItems: 'end' }}>
                <Typography variant="caption">{t('hotkeys.info.delete')}</Typography>
            </Stack>
            {READER_HOTKEYS.map((hotkey) => (
                <ReaderSettingHotkey
                    key={hotkey}
                    hotkey={hotkey}
                    keys={settings.hotkeys[hotkey]}
                    existingKeys={Object.values(settings.hotkeys).flat()}
                    updateSetting={(keys) => updateSetting('hotkeys', { ...settings.hotkeys, [hotkey]: keys })}
                />
            ))}
            <Stack sx={{ alignItems: 'end' }}>
                <Button
                    variant="contained"
                    startIcon={<RestartAltIcon />}
                    onClick={() => updateSetting('hotkeys', DEFAULT_READER_SETTINGS.hotkeys)}
                >
                    {t('global.button.reset')}
                </Button>
            </Stack>
        </Stack>
    );
};
