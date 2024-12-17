/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Stack from '@mui/material/Stack';
import { useTranslation } from 'react-i18next';
import AddIcon from '@mui/icons-material/Add';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import { bindTrigger, usePopupState } from 'material-ui-popup-state/hooks';
import IconButton from '@mui/material/IconButton';
import { ReaderHotkey } from '@/modules/reader/types/Reader.types.ts';
import { DEFAULT_READER_SETTINGS } from '@/modules/reader/constants/ReaderSettings.constants.tsx';
import { TranslationKey } from '@/Base.types.ts';
import { RecordHotkey } from '@/modules/reader/components/settings/hotkeys/RecordHotkey.tsx';
import { Hotkey } from '@/modules/reader/components/settings/hotkeys/Hotkey.tsx';

const READER_HOTKEY_TO_TITLE: Record<ReaderHotkey, TranslationKey> = {
    [ReaderHotkey.PREVIOUS_PAGE]: 'reader.settings.hotkey.previous_page',
    [ReaderHotkey.NEXT_PAGE]: 'reader.settings.hotkey.next_page',
    [ReaderHotkey.SCROLL_BACKWARD]: 'reader.settings.hotkey.scroll_backward',
    [ReaderHotkey.SCROLL_FORWARD]: 'reader.settings.hotkey.scroll_forward',
    [ReaderHotkey.PREVIOUS_CHAPTER]: 'reader.settings.hotkey.previous_chapter',
    [ReaderHotkey.NEXT_CHAPTER]: 'reader.settings.hotkey.next_chapter',
    [ReaderHotkey.TOGGLE_MENU]: 'reader.settings.hotkey.menu',
    [ReaderHotkey.CYCLE_SCALE_TYPE]: 'reader.settings.hotkey.scale_type',
    [ReaderHotkey.STRETCH_IMAGE]: 'reader.settings.hotkey.stretch_image',
    [ReaderHotkey.OFFSET_SPREAD_PAGES]: 'reader.settings.hotkey.offset_spread_pages',
    [ReaderHotkey.CYCLE_READING_MODE]: 'reader.settings.hotkey.reading_mode',
    [ReaderHotkey.CYCLE_READING_DIRECTION]: 'reader.settings.hotkey.reading_direction',
};

export const ReaderSettingHotkey = ({
    hotkey,
    keys,
    existingKeys,
    updateSetting,
}: {
    hotkey: ReaderHotkey;
    keys: string[];
    existingKeys: string[];
    updateSetting: (keys: string[]) => void;
}) => {
    const { t } = useTranslation();
    const popupState = usePopupState({ popupId: 'reader-setting-record-hotkey', variant: 'dialog' });

    return (
        <>
            <Stack sx={{ flexDirection: 'row', alignItems: 'center', gap: 1 }}>
                <Typography sx={{ flexGrow: 1 }}>{t(READER_HOTKEY_TO_TITLE[hotkey])}</Typography>
                <Hotkey
                    keys={keys}
                    removeKey={(keyToRemove) => updateSetting(keys.filter((key) => key !== keyToRemove))}
                />
                <Tooltip title={t('global.button.add')}>
                    <IconButton {...bindTrigger(popupState)} color="inherit">
                        <AddIcon />
                    </IconButton>
                </Tooltip>
                <Tooltip title={t('global.button.reset')}>
                    <IconButton onClick={() => updateSetting(DEFAULT_READER_SETTINGS.hotkeys[hotkey])} color="inherit">
                        <RestartAltIcon />
                    </IconButton>
                </Tooltip>
            </Stack>
            {popupState.isOpen && (
                <RecordHotkey
                    onClose={popupState.close}
                    onCreate={(recordedKeys) => updateSetting([...keys, ...recordedKeys])}
                    existingKeys={existingKeys}
                />
            )}
        </>
    );
};
