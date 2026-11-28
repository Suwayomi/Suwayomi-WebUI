/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useState } from 'react';
import Button from '@mui/material/Button';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Dialog from '@mui/material/Dialog';
import Switch from '@mui/material/Switch';
import IconButton from '@mui/material/IconButton';
import FilterListIcon from '@mui/icons-material/FilterList';
import List from '@mui/material/List';
import ListItemText from '@mui/material/ListItemText';
import ListItem from '@mui/material/ListItem';
import Divider from '@mui/material/Divider';
import { useLingui } from '@lingui/react/macro';
import { CustomTooltip } from '@/base/components/CustomTooltip.tsx';
import { translateExtensionLanguage } from '@/features/extension/Extensions.utils.ts';
import { languageSortComparator, toUniqueLanguageCodes } from '@/base/utils/Languages.ts';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';
import { AwaitableComponent, type AwaitableComponentProps } from 'awaitable-component';
import { getISOLanguage } from '@/lib/ISOLanguageUtil.ts';
import { Notifications } from '@/base/notification/Notifications.ts';
import {
    createUpdateMetadataServerSettings,
    useMetadataServerSettings,
} from '@/features/settings/services/ServerSettingsMetadata.ts';
import type { MetadataBrowseSettings } from '@/features/browse/Browse.types.ts';

const SourceLanguageSelectDialog = ({
    isVisible,
    onDismiss,
    onSubmit,
    onExitComplete,
    selectedLanguages,
    languages,
    showNsfw,
}: AwaitableComponentProps<{ selectedLanguages: string[]; showNsfw: boolean }> & {
    selectedLanguages: string[];
    languages: string[];
    showNsfw: boolean;
}) => {
    const { t } = useLingui();

    const [tmpSelectedLanguages, setTmpSelectedLanguages] = useState(toUniqueLanguageCodes(selectedLanguages));
    const [tmpShowNsfw, setTmpShowNsfw] = useState(showNsfw);

    // selected languages first, in the order they had when the dialog opened
    const sortedLanguages = toUniqueLanguageCodes([
        ...selectedLanguages.filter((language) => languages.includes(language)).toSorted(languageSortComparator),
        ...languages.toSorted(languageSortComparator),
    ]);

    const handleChange = (language: string, selected: boolean) =>
        setTmpSelectedLanguages(
            selected
                ? [...tmpSelectedLanguages, language]
                : tmpSelectedLanguages.filter((selectedLanguage) => selectedLanguage !== language),
        );

    return (
        <Dialog fullWidth maxWidth="xs" open={isVisible} onClose={onDismiss} onTransitionExited={onExitComplete}>
            <DialogTitle>{t`Filter`}</DialogTitle>
            <DialogContent dividers sx={{ padding: 0 }}>
                <List>
                    <ListItem>
                        <ListItemText primary={t`NSFW (18+) sources`} />
                        <Switch checked={tmpShowNsfw} onChange={(e) => setTmpShowNsfw(e.target.checked)} />
                    </ListItem>
                    <Divider />
                    {sortedLanguages.map((language) => (
                        <ListItem key={language}>
                            <ListItemText
                                primary={translateExtensionLanguage(language)}
                                secondary={getISOLanguage(language)?.name}
                            />
                            <Switch
                                checked={tmpSelectedLanguages.includes(language)}
                                onChange={(e) => handleChange(language, e.target.checked)}
                            />
                        </ListItem>
                    ))}
                </List>
            </DialogContent>
            <DialogActions>
                <Button autoFocus onClick={onDismiss} color="primary">
                    {t`Cancel`}
                </Button>
                <Button
                    onClick={() =>
                        onSubmit({
                            selectedLanguages: toUniqueLanguageCodes(tmpSelectedLanguages),
                            showNsfw: tmpShowNsfw,
                        })
                    }
                    color="primary"
                >
                    {t`Ok`}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export const SourceLanguageSelect = ({
    setSelectedLanguages,
    ...props
}: {
    selectedLanguages: string[];
    setSelectedLanguages: (languages: string[]) => Promise<void>;
    languages: string[];
}) => {
    const { t } = useLingui();
    const {
        settings: { showNsfw },
    } = useMetadataServerSettings();
    const updateMetadataServerSettings = createUpdateMetadataServerSettings<keyof MetadataBrowseSettings>((e) =>
        Notifications.error(t`Failed to save changes`, getErrorMessage(e)),
    );

    return (
        <CustomTooltip title={t`Settings`}>
            <IconButton
                onClick={async () => {
                    try {
                        const result = await AwaitableComponent.show(SourceLanguageSelectDialog, {
                            ...props,
                            showNsfw,
                        });

                        if (result.showNsfw !== showNsfw) {
                            updateMetadataServerSettings('showNsfw', result.showNsfw);
                        }

                        await setSelectedLanguages(result.selectedLanguages).catch((e) =>
                            Notifications.error(t`Failed to save changes`, getErrorMessage(e)),
                        );
                    } catch {
                        // Ignore
                    }
                }}
                aria-label="display more actions"
                edge="end"
                color="inherit"
            >
                <FilterListIcon />
            </IconButton>
        </CustomTooltip>
    );
};
