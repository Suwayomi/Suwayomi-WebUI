/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { Trans, useTranslation } from 'react-i18next';
import { useState } from 'react';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { bindDialog } from 'material-ui-popup-state/hooks';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import { jsonrepair } from 'jsonrepair';
import { jsonSaveParse } from '@/util/HelperFunctions.ts';
import { AppTheme, isThemeNameUnique } from '@/lib/ui/AppThemes.ts';
import {
    createUpdateMetadataServerSettings,
    useMetadataServerSettings,
} from '@/lib/metadata/metadataServerSettings.ts';
import { MetadataThemeSettings, TranslationKey } from '@/typings.ts';
import { makeToast } from '@/components/util/Toast.tsx';
import { EmptyView } from '@/components/util/EmptyView.tsx';
import { LoadingPlaceholder } from '@/components/util/LoadingPlaceholder.tsx';
import { defaultPromiseErrorHandler } from '@/util/defaultPromiseErrorHandler.ts';

const baseCustomTheme: AppTheme = {
    id: '',
    isCustom: true,
    getName: () => '',
    muiTheme: {
        palette: {
            primary: {
                main: '#1976d2',
            },
            secondary: {
                main: '#9c27b0',
            },
        },
    },
};

type DialogMode = 'create' | 'edit';

const dialogModeToTranslationKey: Record<
    DialogMode,
    {
        title: TranslationKey;
        button: TranslationKey;
        action: TranslationKey;
        success: TranslationKey;
        failure: TranslationKey;
    }
> = {
    create: {
        title: 'settings.appearance.theme.create.title',
        button: 'global.button.ok',
        action: 'settings.appearance.theme.create.action',
        success: 'settings.appearance.theme.create.success',
        failure: 'settings.appearance.theme.create.failure',
    },
    edit: {
        title: 'settings.appearance.theme.edit.title',
        button: 'global.button.save',
        action: 'settings.appearance.theme.edit.action',
        success: 'settings.appearance.theme.edit.success',
        failure: 'settings.appearance.theme.edit.failure',
    },
};

export const ThemeCreationDialog = ({
    bindDialogProps,
    mode,
    appTheme = baseCustomTheme,
}: {
    bindDialogProps: ReturnType<typeof bindDialog>;
    mode: DialogMode;
    appTheme?: AppTheme;
}) => {
    const { t } = useTranslation();

    const {
        settings: { customThemes },
        request: { loading, error, refetch },
    } = useMetadataServerSettings();

    const updateCustomThemes = createUpdateMetadataServerSettings<keyof MetadataThemeSettings>((e) => {
        throw e;
    });

    const [theme, setTheme] = useState<AppTheme>(appTheme);
    const [invalidName, setInvalidName] = useState(false);
    const [invalidTheme, setInvalidTheme] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [didThemeChange, setDidThemeChange] = useState(mode === 'create');

    return (
        <Dialog {...bindDialogProps} fullWidth maxWidth="md">
            <DialogTitle>{t(dialogModeToTranslationKey[mode].title)}</DialogTitle>
            <DialogContent>
                {loading && <LoadingPlaceholder />}
                {error && (
                    <EmptyView
                        message={t('global.error.label.failed_to_load_data')}
                        messageExtra={error.message}
                        retry={() => refetch().catch(defaultPromiseErrorHandler('ThemeCreationDialog::refetch'))}
                    />
                )}
                {!error && (
                    <Stack sx={{ gap: 2 }}>
                        <Typography>
                            <Trans i18nKey="settings.appearance.theme.create.dialog.info.creating_theme">
                                Create a custom theme with the{' '}
                                <Link
                                    href="https://zenoo.github.io/mui-theme-creator/"
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    MUI Theme Creator
                                </Link>{' '}
                                , copy everything after &quot;themeOptions&quot; from &quot;{'{'}&quot; to &quot;{'}'}
                                &quot; and paste it into the &quot;theme&quot; text field.
                            </Trans>
                        </Typography>
                        <Typography>{t('settings.appearance.theme.create.dialog.info.theme_mode_lock')}</Typography>
                        <TextField
                            disabled={mode === 'edit'}
                            label={t('settings.appearance.theme.create.dialog.theme_name')}
                            value={theme.getName()}
                            error={invalidName}
                            helperText={invalidName && t('settings.appearance.theme.create.dialog.error.invalid_name')}
                            onChange={(e) => {
                                const name = e.target.value.trim();

                                const isValidLength = name.length <= 16;
                                const isUnique = isThemeNameUnique(name, customThemes);
                                setInvalidName(!isValidLength || !isUnique);

                                setTheme({
                                    ...theme,
                                    id: e.target.value,
                                    getName: () => e.target.value,
                                });
                            }}
                        />
                        <TextField
                            label={t('settings.appearance.theme.title')}
                            multiline
                            error={invalidTheme}
                            helperText={invalidTheme && t('settings.appearance.theme.create.dialog.error.invalid_json')}
                            defaultValue={JSON.stringify(theme.muiTheme, null, 2)}
                            onChange={(e) => {
                                const invalidThemeStr = 'invalid';
                                const newMuiTheme = (() => {
                                    try {
                                        return jsonrepair(e.target.value);
                                    } catch (_) {
                                        return invalidThemeStr;
                                    }
                                })();

                                const newMuiThemeParsed = jsonSaveParse(newMuiTheme);
                                const isInvalid = newMuiTheme === invalidThemeStr || !newMuiThemeParsed;
                                const isThemeDifferentFromOriginal =
                                    JSON.stringify(newMuiThemeParsed) !== JSON.stringify(appTheme.muiTheme);

                                setDidThemeChange(mode === 'create' ? true : isThemeDifferentFromOriginal);
                                setInvalidTheme(isInvalid);

                                const didPaletteChange =
                                    !isInvalid && JSON.stringify(newMuiThemeParsed) !== JSON.stringify(theme.muiTheme);
                                if (didPaletteChange) {
                                    setTheme({ ...theme, muiTheme: newMuiThemeParsed });
                                }
                            }}
                        />
                    </Stack>
                )}
            </DialogContent>
            <DialogActions>
                <Button autoFocus onClick={bindDialogProps.onClose} color="primary">
                    {t('global.button.cancel')}
                </Button>
                <Button
                    disabled={invalidTheme || invalidName || isCreating || !didThemeChange}
                    onClick={(e) => {
                        makeToast(t(dialogModeToTranslationKey[mode].action, { theme: theme.getName() }), 'info');

                        setIsCreating(true);
                        updateCustomThemes('customThemes', { ...customThemes, [theme.id]: theme })
                            .then(() => {
                                makeToast(
                                    t(dialogModeToTranslationKey[mode].success, { theme: theme.getName() }),
                                    'success',
                                );
                                bindDialogProps.onClose(e);
                            })
                            .catch(() =>
                                makeToast(
                                    t(dialogModeToTranslationKey[mode].failure, { theme: theme.getName() }),
                                    'error',
                                ),
                            )
                            .finally(() => setIsCreating(false));
                    }}
                    color="primary"
                >
                    {t(dialogModeToTranslationKey[mode].button)}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
