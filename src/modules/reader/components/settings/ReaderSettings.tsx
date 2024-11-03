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
import { useReaderStateMangaContext } from '@/modules/reader/contexts/state/ReaderStateMangaContext.tsx';
import { ReaderService } from '@/modules/reader/services/ReaderService.ts';
import { ReaderSettingsTabs } from '@/modules/reader/components/settings/ReaderSettingsTabs.tsx';
import { ReaderSettingTab } from '@/modules/reader/constants/ReaderSettings.constants.tsx';
import { useDisableAllHotkeysWhileMounted } from '@/modules/hotkeys/Hotkeys.utils.ts';

export const ReaderSettings = ({ isOpen, close }: { isOpen: boolean; close: () => void }) => {
    const { manga } = useReaderStateMangaContext();
    const settings = ReaderService.useSettings();

    useDisableAllHotkeysWhileMounted();

    const [activeTab, setActiveTab] = useState(0);

    if (!manga) {
        return null;
    }

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
        >
            <DialogContent sx={{ p: 0 }}>
                <ReaderSettingsTabs
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    settings={settings}
                    updateSetting={(...args) => ReaderService.updateSetting(manga, ...args)}
                    deleteSetting={(...args) => ReaderService.deleteSetting(manga, ...args)}
                />
            </DialogContent>
        </Dialog>
    );
};
