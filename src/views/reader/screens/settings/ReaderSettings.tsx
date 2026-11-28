/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';

import { useState } from 'react';
import { ReaderService } from '@/controllers/reader/services/ReaderService.ts';
import { ReaderSettingsTabs } from '@/views/reader/components/settings/ReaderSettingsTabs.tsx';
import { ReaderSettingTab } from '@/models/reader/settings/ReaderSettings.constants.tsx';
import { useDisableAllHotkeysWhileMounted } from '@/utils/hotkeys/Hotkeys.utils.ts';
import { applyStyles } from '@/utils/base/ApplyStyles.ts';
import { useReaderSettingsStore } from '@/controllers/reader/stores/ReaderStore.ts';

export const ReaderSettings = ({ isOpen, close }: { isOpen: boolean; close: () => void }) => {
    const settings = useReaderSettingsStore((state) => state);

    useDisableAllHotkeysWhileMounted(isOpen);

    const [activeTab, setActiveTab] = useState(0);
    const [isTransparent, setIsTransparent] = useState(false);

    if (!isOpen) {
        return null;
    }

    return (
        <Dialog
            open={isOpen}
            maxWidth="md"
            fullWidth
            onClose={close}
            hideBackdrop={activeTab === ReaderSettingTab.FILTER}
            sx={applyStyles(isTransparent, {
                opacity: 0.75,
            })}
        >
            <DialogContent sx={{ p: 0 }}>
                <ReaderSettingsTabs
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    settings={settings}
                    updateSetting={(...args) => ReaderService.updateSetting(...args)}
                    deleteSetting={(...args) => ReaderService.deleteSetting(...args)}
                    setTransparent={setIsTransparent}
                />
            </DialogContent>
        </Dialog>
    );
};
