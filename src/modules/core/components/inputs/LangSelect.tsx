/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import React, { useState } from 'react';
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
import { useTranslation } from 'react-i18next';
import { CustomTooltip } from '@/modules/core/components/CustomTooltip.tsx';
import { cloneObject } from '@/util/cloneObject.tsx';
import { translateExtensionLanguage } from '@/modules/extension/Extensions.utils.ts';

function removeAll(firstList: any[], secondList: any[]) {
    secondList.forEach((item) => {
        const index = firstList.indexOf(item);
        if (index !== -1) {
            firstList.splice(index, 1);
        }
    });

    return firstList;
}

interface IProps {
    shownLangs: string[];
    setShownLangs: (arg0: string[]) => void;
    allLangs: string[];
    forcedLangs?: string[];
}

export function LangSelect(props: IProps) {
    const { t } = useTranslation();

    const { shownLangs, setShownLangs, allLangs, forcedLangs = [] } = props;
    // hold a copy and only sate state on parent when OK pressed, improves performance
    const [mShownLangs, setMShownLangs] = useState(removeAll(cloneObject(shownLangs), forcedLangs));
    const [open, setOpen] = useState<boolean>(false);

    const handleCancel = () => {
        setOpen(false);
    };

    const handleOk = () => {
        setOpen(false);
        setShownLangs(mShownLangs);
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>, lang: string) => {
        const { checked } = event.target as HTMLInputElement;

        if (checked) {
            setMShownLangs([...mShownLangs, lang]);
        } else {
            const clone = cloneObject(mShownLangs);
            clone.splice(clone.indexOf(lang), 1);
            setMShownLangs(clone);
        }
    };

    return (
        <>
            <CustomTooltip title={t('settings.title')}>
                <IconButton onClick={() => setOpen(true)} aria-label="display more actions" edge="end" color="inherit">
                    <FilterListIcon />
                </IconButton>
            </CustomTooltip>
            <Dialog
                sx={{
                    '.MuiDialog-paper': {
                        maxHeight: 435,
                        width: '80%',
                    },
                }}
                maxWidth="xs"
                open={open}
                onClose={handleCancel}
            >
                <DialogTitle>{t('global.language.title.enabled_languages')}</DialogTitle>
                <DialogContent dividers sx={{ padding: 0 }}>
                    <List>
                        {allLangs.map((lang) => (
                            <ListItem key={lang}>
                                <ListItemText primary={translateExtensionLanguage(lang)} />

                                <Switch
                                    checked={mShownLangs.indexOf(lang) !== -1}
                                    onChange={(e) => handleChange(e, lang)}
                                />
                            </ListItem>
                        ))}
                    </List>
                </DialogContent>
                <DialogActions>
                    <Button autoFocus onClick={handleCancel} color="primary">
                        {t('global.button.cancel')}
                    </Button>
                    <Button onClick={handleOk} color="primary">
                        {t('global.button.ok')}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
