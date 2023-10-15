/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Label from '@mui/icons-material/Label';
import MoreHoriz from '@mui/icons-material/MoreHoriz';
import Refresh from '@mui/icons-material/Refresh';
import {
    IconButton,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Tooltip,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import CategorySelect from '@/components/navbar/action/CategorySelect';
import { TManga } from '@/typings.ts';

interface IProps {
    manga: TManga;
    onRefresh: () => any;
    refreshing: boolean;
}

const MangaToolbarMenu = ({ manga, onRefresh, refreshing }: IProps) => {
    const { t } = useTranslation();
    const theme = useTheme();
    const isLargeScreen = useMediaQuery(theme.breakpoints.up('sm'));

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClose = () => {
        setAnchorEl(null);
    };

    const [editCategories, setEditCategories] = useState(false);

    return (
        <>
            {isLargeScreen && (
                <>
                    <Tooltip title={t('manga.label.reload_from_source')}>
                        <IconButton
                            onClick={() => {
                                onRefresh();
                            }}
                            disabled={refreshing}
                        >
                            <Refresh />
                        </IconButton>
                    </Tooltip>
                    {manga.inLibrary && (
                        <Tooltip title={t('manga.label.edit_categories')}>
                            <IconButton
                                onClick={() => {
                                    setEditCategories(true);
                                }}
                            >
                                <Label />
                            </IconButton>
                        </Tooltip>
                    )}
                </>
            )}
            {!isLargeScreen && (
                <>
                    <IconButton
                        id="chaptersMenuButton"
                        aria-controls={open ? 'chaptersMenu' : undefined}
                        aria-haspopup="true"
                        aria-expanded={open ? 'true' : undefined}
                        onClick={(e) => setAnchorEl(e.currentTarget)}
                    >
                        <MoreHoriz />
                    </IconButton>
                    <Menu
                        id="chaptersMenu"
                        anchorEl={anchorEl}
                        open={open}
                        onClose={handleClose}
                        MenuListProps={{
                            'aria-labelledby': 'chaptersMenuButton',
                        }}
                    >
                        <MenuItem
                            onClick={() => {
                                onRefresh();
                                handleClose();
                            }}
                            disabled={refreshing}
                        >
                            <ListItemIcon>
                                <Refresh fontSize="small" />
                            </ListItemIcon>
                            <ListItemText>{t('manga.label.reload_from_source')}</ListItemText>
                        </MenuItem>
                        {manga.inLibrary && (
                            <MenuItem
                                onClick={() => {
                                    setEditCategories(true);
                                    handleClose();
                                }}
                            >
                                <ListItemIcon>
                                    <Label fontSize="small" />
                                </ListItemIcon>
                                <ListItemText>{t('manga.label.edit_categories')}</ListItemText>
                            </MenuItem>
                        )}
                    </Menu>
                </>
            )}

            <CategorySelect open={editCategories} setOpen={setEditCategories} mangaId={manga.id} />
        </>
    );
};

export default MangaToolbarMenu;
