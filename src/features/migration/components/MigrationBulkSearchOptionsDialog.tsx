/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { useLingui } from '@lingui/react/macro';
import { CheckboxInput } from '@/base/components/inputs/CheckboxInput.tsx';
import type { AwaitableComponentProps } from 'awaitable-component';
import Typography from '@mui/material/Typography';
import WarningIcon from '@mui/icons-material/Warning';
import { useState } from 'react';
import type { MigrationBulkSearchSettings } from '@/features/migration/Migration.types.ts';

export const MigrationBulkSearchOptionsDialog = ({
    isVisible,
    onDismiss,
    onSubmit,
    onExitComplete,
}: AwaitableComponentProps<MigrationBulkSearchSettings>) => {
    const { t } = useLingui();

    const [selectHighestChapterNumberSource, setSelectHighestChapterNumberSource] = useState(false);
    const [ignoreOutdatedMatches, setIgnoreOutdatesMatches] = useState(false);
    const [performAdvancedSearch, setPerformAdvancedSearch] = useState(false);

    return (
        <Dialog open={isVisible} fullWidth onClose={onDismiss} onTransitionExited={onExitComplete}>
            <DialogTitle>{t`Search options`}</DialogTitle>
            <DialogContent dividers>
                <CheckboxInput
                    label={
                        <Stack
                            sx={{
                                // Padding comes from the MUI Checkbox component
                                pt: '9px',
                            }}
                        >
                            <Typography>{t`Ignore matches without newer chapters`}</Typography>
                            <Typography
                                variant="body2"
                                color="textSecondary"
                            >{t`Do not automatically select matches if they are behind the current source. They will still be shown in the found matches`}</Typography>
                        </Stack>
                    }
                    sx={{
                        alignItems: 'start',
                    }}
                    checked={ignoreOutdatedMatches}
                    onChange={(_, checked) => setIgnoreOutdatesMatches(checked)}
                />
            </DialogContent>
            <DialogContent dividers>
                <Stack
                    direction="row"
                    sx={{
                        alignItems: 'center',
                    }}
                >
                    <WarningIcon color="warning" />
                    <Typography
                        variant="body1"
                        sx={{
                            marginLeft: '10px',
                            marginTop: '5px',
                            whiteSpace: 'pre-line',
                        }}
                        color="error"
                    >
                        {t`These options are slow and dangerous and may lead to restrictions from sources`}
                    </Typography>
                </Stack>
                <CheckboxInput
                    label={
                        <Stack
                            sx={{
                                // Padding comes from the MUI Checkbox component
                                pt: '9px',
                            }}
                        >
                            <Typography>{t`Advanced search mode`}</Typography>
                            <Typography
                                variant="body2"
                                color="textSecondary"
                            >{t`Breaks down the title into keywords for a wider search`}</Typography>
                        </Stack>
                    }
                    sx={{
                        alignItems: 'start',
                    }}
                    checked={performAdvancedSearch}
                    onChange={(_, checked) => setPerformAdvancedSearch(checked)}
                />
                <CheckboxInput
                    label={
                        <Stack
                            sx={{
                                // Padding comes from the MUI Checkbox component
                                pt: '9px',
                            }}
                        >
                            <Typography>{t`Match based on chapter number`}</Typography>
                            <Typography
                                variant="body2"
                                color="textSecondary"
                            >{t`If enabled, chooses the match furthest ahead.\nOtherwise, picks the first match by source priority.`}</Typography>
                        </Stack>
                    }
                    sx={{
                        alignItems: 'start',
                    }}
                    checked={selectHighestChapterNumberSource}
                    onChange={(_, checked) => setSelectHighestChapterNumberSource(checked)}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onDismiss}>{t`Cancel`}</Button>
                <Button
                    variant="contained"
                    onClick={() =>
                        onSubmit({
                            selectHighestChapterNumberSource,
                            ignoreOutdatedMatches,
                            performAdvancedSearch,
                        })
                    }
                >
                    {t`Search`}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
