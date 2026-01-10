/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { MessageDescriptor } from '@lingui/core';
import Stack from '@mui/material/Stack';
import AddIcon from '@mui/icons-material/Add';
import Typography from '@mui/material/Typography';
import { bindTrigger, usePopupState } from 'material-ui-popup-state/hooks';
import IconButton from '@mui/material/IconButton';
import { useLingui } from '@lingui/react/macro';
import { msg } from '@lingui/core/macro';
import { CustomTooltip } from '@/base/components/CustomTooltip.tsx';
import { ReaderHotkey } from '@/features/reader/Reader.types.ts';
import { DEFAULT_READER_SETTINGS } from '@/features/reader/settings/ReaderSettings.constants.tsx';
import { RecordHotkey } from '@/features/reader/hotkeys/settings/components/RecordHotkey.tsx';
import { Hotkey } from '@/features/reader/hotkeys/settings/components/Hotkey.tsx';
import { ResetButton } from '@/base/components/buttons/ResetButton.tsx';

const READER_HOTKEY_TO_TITLE: Record<ReaderHotkey, MessageDescriptor> = {
    [ReaderHotkey.PREVIOUS_PAGE]: msg`Previous page`,
    [ReaderHotkey.NEXT_PAGE]: msg`Next page`,
    [ReaderHotkey.SCROLL_BACKWARD]: msg`Scroll backward`,
    [ReaderHotkey.SCROLL_FORWARD]: msg`Scroll forward`,
    [ReaderHotkey.PREVIOUS_CHAPTER]: msg`Previous chapter`,
    [ReaderHotkey.NEXT_CHAPTER]: msg`Next chapter`,
    [ReaderHotkey.TOGGLE_MENU]: msg`Toggle menu`,
    [ReaderHotkey.CYCLE_SCALE_TYPE]: msg`Cycle image scale type`,
    [ReaderHotkey.STRETCH_IMAGE]: msg`Toggle stretch image`,
    [ReaderHotkey.OFFSET_SPREAD_PAGES]: msg`Toggle offset spread pages`,
    [ReaderHotkey.CYCLE_READING_MODE]: msg`Cycle reading mode`,
    [ReaderHotkey.CYCLE_READING_DIRECTION]: msg`Cycle reading direction`,
    [ReaderHotkey.TOGGLE_AUTO_SCROLL]: msg`Toggle auto scroll`,
    [ReaderHotkey.AUTO_SCROLL_SPEED_INCREASE]: msg`Increase auto scroll speed`,
    [ReaderHotkey.AUTO_SCROLL_SPEED_DECREASE]: msg`Decrease auto scroll speed`,
    [ReaderHotkey.EXIT_READER]: msg`Exit reader`,
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
    const { t } = useLingui();
    const popupState = usePopupState({ popupId: 'reader-setting-record-hotkey', variant: 'dialog' });

    return (
        <>
            <Stack sx={{ flexDirection: 'row', alignItems: 'center', gap: 1 }}>
                <Typography sx={{ flexGrow: 1 }}>{t(READER_HOTKEY_TO_TITLE[hotkey])}</Typography>
                <Hotkey
                    keys={keys}
                    removeKey={(keyToRemove) => updateSetting(keys.filter((key) => key !== keyToRemove))}
                />
                <CustomTooltip title={t`Add`}>
                    <IconButton {...bindTrigger(popupState)} color="inherit">
                        <AddIcon />
                    </IconButton>
                </CustomTooltip>
                <ResetButton asIconButton onClick={() => updateSetting(DEFAULT_READER_SETTINGS.hotkeys[hotkey])} />
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
