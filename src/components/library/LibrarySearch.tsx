/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import React, { useState } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import { IconButton, Input } from '@mui/material';
import CancelIcon from '@mui/icons-material/Cancel';
import useLibraryOptions from '../../util/useLibraryOptions';

export default function LibrarySearch() {
    const {
        query,
        setQuery,
    } = useLibraryOptions();
    const [searchOpen, setSearchOpen] = useState(!!query);
    const inputRef = React.useRef<HTMLInputElement>();

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        setQuery(e.target.value === '' ? undefined : e.target.value);
    }
    const cancelSearch = () => {
        setQuery(null);
        setSearchOpen(false);
    };
    const handleBlur = () => { if (!query) setSearchOpen(false); };
    const openSearch = () => {
        setSearchOpen(true);
        // Put Focus Action at the end of the Callstack so Input actually exists on the dom
        setTimeout(() => {
            if (inputRef && inputRef.current) inputRef.current.focus();
        });
    };
    return (
        <>
            {searchOpen
                ? (
                    <Input
                        value={query || ''}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        inputRef={inputRef}
                        endAdornment={(
                            <IconButton
                                onClick={cancelSearch}
                            >
                                <CancelIcon />
                            </IconButton>
                        )}
                    />
                ) : <SearchIcon onClick={openSearch} /> }
        </>
    );
}
