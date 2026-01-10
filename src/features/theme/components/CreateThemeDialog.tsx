/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { MessageDescriptor } from '@lingui/core';
import { useState } from 'react';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import { jsonrepair } from 'jsonrepair';
import { AwaitableComponentProps } from 'awaitable-component';
import { Trans, useLingui } from '@lingui/react/macro';
import { msg } from '@lingui/core/macro';
import { getErrorMessage, jsonSaveParse } from '@/lib/HelperFunctions.ts';
import { AppTheme, isThemeNameUnique } from '@/features/theme/services/AppThemes.ts';
import {
    createUpdateMetadataServerSettings,
    useMetadataServerSettings,
} from '@/features/settings/services/ServerSettingsMetadata.ts';
import { makeToast } from '@/base/utils/Toast.ts';
import { EmptyView } from '@/base/components/feedback/EmptyView.tsx';
import { LoadingPlaceholder } from '@/base/components/feedback/LoadingPlaceholder.tsx';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import { MetadataThemeSettings } from '@/features/theme/AppTheme.types.ts';
import { CheckboxInput } from '@/base/components/inputs/CheckboxInput.tsx';
import { useAppThemeContext } from '@/features/theme/AppThemeContext.tsx';

const baseCustomTheme: AppTheme = {
    id: '',
    isCustom: true,
    getName: () => '',
    muiTheme: {
        colorSchemes: {
            light: {
                palette: {
                    primary: {
                        main: '#1976d2',
                    },
                    secondary: {
                        main: '#9c27b0',
                    },
                },
            },
            dark: {
                palette: {
                    primary: {
                        main: '#1976d2',
                    },
                    secondary: {
                        main: '#9c27b0',
                    },
                },
            },
        },
    },
};

type DialogMode = 'create' | 'edit' | 'save_dynamic';

const dialogModeToTranslation: Record<
    DialogMode,
    {
        title: MessageDescriptor;
        button: MessageDescriptor;
        action: MessageDescriptor;
        success: MessageDescriptor;
        failure: MessageDescriptor;
    }
> = {
    create: {
        title: msg`Create theme`,
        button: msg`Ok`,
        action: msg`Creating theme…`,
        success: msg`Created theme`,
        failure: msg`Could not create theme`,
    },
    edit: {
        title: msg`Edit theme`,
        button: msg`Save`,
        action: msg`Saving theme changes…`,
        success: msg`Saved theme changes`,
        failure: msg`Could not save theme changes`,
    },
    save_dynamic: {
        title: msg`Save dynamic color theme`,
        button: msg`Save`,
        action: msg`Creating theme…`,
        success: msg`Created theme`,
        failure: msg`Could not create theme`,
    },
};

export const ThemeCreationDialog = ({
    mode,
    appTheme = baseCustomTheme,
    isVisible,
    onExitComplete,
    onSubmit,
    onDismiss,
}: AwaitableComponentProps<void> & {
    mode: DialogMode;
    appTheme?: AppTheme;
}) => {
    const { t } = useLingui();

    const {
        settings: { customThemes },
        request: { loading, error, refetch },
    } = useMetadataServerSettings();
    const { setAppTheme } = useAppThemeContext();

    const updateCustomThemes = createUpdateMetadataServerSettings<keyof MetadataThemeSettings>((e) => {
        throw e;
    });

    const [theme, setTheme] = useState<AppTheme>(appTheme);
    const [invalidName, setInvalidName] = useState(false);
    const [invalidTheme, setInvalidTheme] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [didThemeChange, setDidThemeChange] = useState(['create', 'save_dynamic'].includes(mode));
    const [setAsActiveTheme, setSetAsActiveTheme] = useState(false);

    return (
        <Dialog open={isVisible} onTransitionExited={onExitComplete} fullWidth maxWidth="md">
            <DialogTitle>{t(dialogModeToTranslation[mode].title)}</DialogTitle>
            <DialogContent>
                {loading && <LoadingPlaceholder />}
                {error && (
                    <EmptyView
                        message={t`Unable to load data`}
                        messageExtra={getErrorMessage(error)}
                        retry={() => refetch().catch(defaultPromiseErrorHandler('ThemeCreationDialog::refetch'))}
                    />
                )}
                {!error && (
                    <Stack sx={{ gap: 2, whiteSpace: 'pre-line' }}>
                        <Typography>
                            <Trans>
                                See the official{' '}
                                <Link
                                    href="https://mui.com/material-ui/customization/how-to-customize/"
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    MUI documentation
                                </Link>{' '}
                                for how to customize the theme.
                                <br />
                                The palette API is not supported, you have to use the new
                                <Link
                                    href="https://mui.com/material-ui/customization/palette/#color-schemes"
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    color schemes API
                                </Link>
                                .
                                <br />
                                <br />
                                You can use theme creators like{' '}
                                <Link
                                    href="https://zenoo.github.io/mui-theme-creator/"
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    MUI Theme Creator
                                </Link>{' '}
                                , however, you have to adjust the created object according to the new color schemes API.
                                <br />
                                <br />
                                In case no background is defined, a background will be calculated based on the primary
                                color.
                            </Trans>
                        </Typography>
                        <TextField
                            disabled={mode === 'edit'}
                            label={t`Name`}
                            value={theme.getName()}
                            error={invalidName}
                            helperText={
                                invalidName && t`The theme name must be unique and has a limit of 16 characters`
                            }
                            onChange={(e) => {
                                const name = e.target.value.trim();

                                const isValidLength = name.length <= 32;
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
                            label={t`Theme`}
                            multiline
                            error={invalidTheme}
                            helperText={invalidTheme && t`Invalid json`}
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
                <Stack sx={{ width: '100%' }}>
                    <CheckboxInput
                        sx={{ margin: 0 }}
                        size="small"
                        label={t`Set as active theme`}
                        checked={setAsActiveTheme}
                        onChange={(_, checked) => setSetAsActiveTheme(checked)}
                    />
                    <Stack sx={{ flexDirection: 'row', justifyContent: 'end' }}>
                        <Button autoFocus onClick={() => onDismiss()} color="primary">
                            {t`Cancel`}
                        </Button>
                        <Button
                            disabled={invalidTheme || invalidName || isCreating || !didThemeChange || !theme.id.length}
                            onClick={() => {
                                makeToast(t(dialogModeToTranslation[mode].action), 'info');

                                setIsCreating(true);
                                updateCustomThemes('customThemes', { ...customThemes, [theme.id]: theme })
                                    .then(() => {
                                        makeToast(t(dialogModeToTranslation[mode].success), 'success');

                                        if (setAsActiveTheme) {
                                            setAppTheme(theme.getName());
                                        }

                                        onSubmit();
                                    })
                                    .catch((updateError) =>
                                        makeToast(
                                            t(dialogModeToTranslation[mode].failure),
                                            'error',
                                            getErrorMessage(updateError),
                                        ),
                                    )
                                    .finally(() => setIsCreating(false));
                            }}
                            color="primary"
                        >
                            {t(dialogModeToTranslation[mode].button)}
                        </Button>
                    </Stack>
                </Stack>
            </DialogActions>
        </Dialog>
    );
};
