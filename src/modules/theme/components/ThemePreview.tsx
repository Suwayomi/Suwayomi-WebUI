/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useTranslation } from 'react-i18next';
import { useContext, useMemo } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { styled, ThemeProvider } from '@mui/material/styles';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import EditIcon from '@mui/icons-material/Edit';
import { bindDialog, usePopupState } from 'material-ui-popup-state/hooks';
import { ThemeModeContext } from '@/modules/theme/contexts/ThemeModeContext.tsx';
import { AppTheme, hasMissingFonts, loadThemeFonts } from '@/modules/theme/services/AppThemes.ts';
import { createTheme } from '@/modules/theme/services/theme.tsx';
import { ThemeCreationDialog } from '@/modules/theme/components/CreateThemeDialog.tsx';
import { makeToast } from '@/modules/core/utils/Toast.ts';
import { TypographyMaxLines } from '@/modules/core/components/TypographyMaxLines.tsx';

const ThemePreviewBadge = styled(Box)(() => ({
    width: '15px',
    height: '20px',
}));

export const ThemePreview = ({ theme, onDelete }: { theme: AppTheme; onDelete: () => void }) => {
    const { getName } = theme;

    const { t } = useTranslation();
    const { themeMode, setAppTheme, appTheme, pureBlackMode } = useContext(ThemeModeContext);

    const popupState = usePopupState({ variant: 'popover', popupId: `theme-edit-dialog-${theme.id}` });

    const isSelected = theme.id === appTheme;

    const muiTheme = useMemo(() => createTheme(themeMode, theme, pureBlackMode), [theme, themeMode, pureBlackMode]);

    return (
        <>
            <Stack
                sx={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    minWidth: '150px',
                    maxWidth: '150px',
                    gap: 1,
                }}
            >
                <ThemeProvider theme={muiTheme}>
                    <Card
                        sx={{
                            width: '100%',
                            height: '225px',
                            position: 'relative',
                        }}
                    >
                        <Box
                            sx={{
                                position: 'absolute',
                                top: 0,
                                right: 0,
                                bottom: 0,
                                left: 0,
                                border: '4px solid',
                                borderColor: isSelected
                                    ? muiTheme.palette.primary.light
                                    : muiTheme.palette.background.paper,
                                zIndex: 1,
                                pointerEvents: 'none',
                                borderRadius: 1,
                            }}
                        />
                        <CardActionArea
                            sx={{
                                height: '100%',
                                backgroundColor: 'background.default',
                            }}
                            onClick={() => {
                                const needToLoadFonts = hasMissingFonts(theme.muiTheme);
                                if (!needToLoadFonts) {
                                    setAppTheme(theme.id);
                                    return;
                                }

                                makeToast(t('settings.appearance.theme.select.fonts.loading'), 'info');
                                loadThemeFonts(theme.muiTheme)
                                    .then(() => setAppTheme(theme.id))
                                    .catch(() => makeToast(t('settings.appearance.theme.select.fonts.error'), 'error'));
                            }}
                        >
                            <Stack sx={{ height: '100%', m: 0 }}>
                                <Stack sx={{ height: '100%', gap: 2, p: 2 }}>
                                    <Stack
                                        sx={{
                                            maxHeight: '20px',
                                            flexDirection: 'row',
                                            justifyContent: 'space-between',
                                            alignItems: 'flex-start',
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                width: '65%',
                                                height: '20px',
                                                backgroundColor: 'primary.dark',
                                                borderRadius: 1,
                                            }}
                                        />
                                        <Stack
                                            sx={{
                                                alignItems: 'center',
                                                gap: 1,
                                                mt: -0.25,
                                            }}
                                        >
                                            {isSelected && (
                                                <CheckCircleIcon
                                                    sx={{
                                                        visibility: isSelected ? 'visible' : 'hidden',
                                                        color: 'primary.light',
                                                    }}
                                                />
                                            )}
                                            {!isSelected && theme.isCustom && (
                                                <IconButton
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        onDelete();
                                                    }}
                                                    component="div"
                                                    size="small"
                                                    sx={{ mt: -0.5 }}
                                                >
                                                    <Tooltip title={t('global.button.delete')}>
                                                        <DeleteIcon />
                                                    </Tooltip>
                                                </IconButton>
                                            )}
                                            {theme.isCustom && (
                                                <IconButton
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        popupState.open();
                                                    }}
                                                    component="div"
                                                    size="small"
                                                >
                                                    <Tooltip title={t('global.button.edit')}>
                                                        <EditIcon />
                                                    </Tooltip>
                                                </IconButton>
                                            )}
                                        </Stack>
                                    </Stack>
                                    <Box
                                        sx={{
                                            width: '55%',
                                            height: '65%',
                                            backgroundColor: 'background.paper',
                                            p: 1,
                                            borderRadius: 1,
                                        }}
                                    >
                                        <Stack
                                            sx={{
                                                width: 'max-content',
                                                flexDirection: 'row',
                                                overflow: 'hidden',
                                                borderRadius: 1,
                                            }}
                                        >
                                            <ThemePreviewBadge sx={{ backgroundColor: 'primary.main' }} />
                                            <ThemePreviewBadge sx={{ backgroundColor: 'secondary.main' }} />
                                        </Stack>
                                    </Box>
                                </Stack>
                                <Stack
                                    sx={{
                                        height: '25%',
                                        backgroundColor: muiTheme.palette.background.paper,
                                        alignItems: 'center',
                                        flexDirection: 'row',
                                        gap: 2,
                                        p: 2,
                                    }}
                                >
                                    <Box
                                        sx={{
                                            width: '20px',
                                            height: '20px',
                                            borderRadius: '50%',
                                            backgroundColor: 'primary.main',
                                        }}
                                    />
                                    <Box
                                        sx={{
                                            flexGrow: 1,
                                            height: '20px',
                                            borderRadius: 1,
                                            backgroundColor: 'primary.light',
                                        }}
                                    />
                                </Stack>
                            </Stack>
                        </CardActionArea>
                    </Card>
                </ThemeProvider>
                <Tooltip title={getName()} placement="top">
                    <TypographyMaxLines sx={{ maxWidth: '100%' }}>{getName()}</TypographyMaxLines>
                </Tooltip>
            </Stack>
            <ThemeCreationDialog bindDialogProps={bindDialog(popupState)} mode="edit" appTheme={theme} />
        </>
    );
};
