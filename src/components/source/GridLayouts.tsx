/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import {
    IconButton, Menu, MenuItem, FormControlLabel, Radio,
} from '@mui/material';
import React from 'react';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import { useLibraryOptionsContext } from 'components/context/LibraryOptionsContext';

/**
 * It creates a menu that allows the user to select the type of grid layout they want to use.
 */
export default function SourceGridLayout() {
    const { options, setOptions } = useLibraryOptionsContext();

    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);
    /**
     * It sets the anchorEl to the current target.
     * @param {any} event - any
     */
    const handleClick = (event: any) => {
        setAnchorEl(event.currentTarget);
    };
    /**
     * It sets the anchorEl to null.
     */
    const handleClose = () => {
        setAnchorEl(null);
    };

    /**
     * It sets the options object to the value of the input element.
     * @param e - The event object.
     * @param {boolean} checked - boolean,
     */
    function setGridContextOptions(
        e: React.ChangeEvent<HTMLInputElement>,
        checked: boolean,
    ) {
        if (checked) {
            setOptions((prev: any) => ({ ...prev, SourcegridLayout: parseInt(e.target.name, 10) }));
        }
    }

    return (
        <>
            <IconButton
                onClick={handleClick}
                size="small"
                sx={{ ml: 2 }}
                aria-controls={open ? 'account-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
            >
                <ViewModuleIcon />
            </IconButton>
            <Menu
                id="basic-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                MenuListProps={{ 'aria-labelledby': 'basic-button' }}
            >
                <MenuItem onClick={handleClose}>
                    <FormControlLabel
                        label="Compact grid"
                        control={(
                            <Radio
                                name="0"
                                // eslint-disable-next-line max-len
                                checked={options.SourcegridLayout === 0 || options.SourcegridLayout === undefined}
                                onChange={setGridContextOptions}
                            />
                        )}
                    />
                </MenuItem>
                <MenuItem onClick={handleClose}>
                    <FormControlLabel
                        label="Comfortable grid"
                        control={(
                            <Radio
                                name="1"
                                checked={options.SourcegridLayout === 1}
                                onChange={setGridContextOptions}
                            />
                        )}
                    />
                </MenuItem>
                <MenuItem onClick={handleClose}>
                    <FormControlLabel
                        label="List"
                        control={(
                            <Radio
                                name="2"
                                checked={options.SourcegridLayout === 2}
                                onChange={setGridContextOptions}
                            />
                        )}
                    />
                </MenuItem>
            </Menu>

        </>
    );
}
