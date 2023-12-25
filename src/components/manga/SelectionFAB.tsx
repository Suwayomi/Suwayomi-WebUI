/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import MoreHoriz from '@mui/icons-material/MoreHoriz';
import { Fab, Menu, Box, styled } from '@mui/material';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DEFAULT_FAB_STYLE } from '@/components/util/StyledFab';
import { TranslationKey } from '@/typings.ts';

interface SelectionFABProps {
    children: (handleClose: () => void) => React.ReactNode;
    selectedItemsCount: number;
    title: TranslationKey;
}

const FabContainer = styled(Box)(({ theme }) => ({
    ...DEFAULT_FAB_STYLE,
    height: `calc(${DEFAULT_FAB_STYLE.height} + 1)`,
    paddingTop: '8px',
    zIndex: 1, // the "Checkbox" (MUI) component of the "ChapterCard" has z-index 1, which causes it to take over the mouse events
    [theme.breakpoints.down('md')]: {
        marginBottom: '64px',
    },
}));

export const SelectionFAB: React.FC<SelectionFABProps> = ({ children, selectedItemsCount, title }) => {
    const { t } = useTranslation();

    const anchorEl = useRef<HTMLElement>();
    const [open, setOpen] = useState(false);
    const handleClose = () => setOpen(false);

    return (
        <FabContainer ref={anchorEl}>
            <Fab variant="extended" color="primary" id="selectionMenuButton" onClick={() => setOpen(true)}>
                {`${selectedItemsCount} ${t(title, { count: selectedItemsCount })}`}
                <MoreHoriz sx={{ ml: 1 }} />
            </Fab>
            <Menu
                id="selectionMenu"
                anchorEl={anchorEl.current}
                open={open}
                onClose={handleClose}
                anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
                transformOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                MenuListProps={{
                    'aria-labelledby': 'selectionMenuButton',
                }}
            >
                {children(handleClose)}
            </Menu>
        </FabContainer>
    );
};
