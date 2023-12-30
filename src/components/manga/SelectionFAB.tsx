/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import MoreHoriz from '@mui/icons-material/MoreHoriz';
import { Fab, Box, styled } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import PopupState, { bindMenu, bindTrigger } from 'material-ui-popup-state';
import { DEFAULT_FAB_STYLE } from '@/components/util/StyledFab';
import { TranslationKey } from '@/typings.ts';
import { Menu } from '@/components/menu/Menu.tsx';

interface SelectionFABProps {
    children: (handleClose: () => void, setHideMenu: (hide: boolean) => void) => JSX.Element;
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

    return (
        <PopupState variant="popover" popupId="selection-fab-menu">
            {(popupState) => (
                <>
                    <FabContainer {...bindTrigger(popupState)}>
                        <Fab variant="extended" color="primary" id="selectionMenuButton">
                            {`${selectedItemsCount} ${t(title, { count: selectedItemsCount })}`}
                            <MoreHoriz sx={{ ml: 1 }} />
                        </Fab>
                    </FabContainer>
                    <Menu
                        {...bindMenu(popupState)}
                        id="selectionMenu"
                        anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
                        transformOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                        MenuListProps={{
                            'aria-labelledby': 'selectionMenuButton',
                        }}
                    >
                        {(onClose, setHideMenu) => children(onClose, setHideMenu)}
                    </Menu>
                </>
            )}
        </PopupState>
    );
};
