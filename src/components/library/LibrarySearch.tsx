/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import React, { useState } from 'react';
import { TextField } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import useLibraryOptions from '../../util/useLibraryOptions';

export default function LibrarySearch() {
    const {
        query,
        setQuery,
    } = useLibraryOptions();
    const [searchOpen, setSearchOpen] = useState(!!query);

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        setQuery(e.target.value === '' ? undefined : e.target.value);
    }

    return (
        <>
            {searchOpen
                ? (
                    <TextField
                        label="Standard"
                        value={query}
                        onChange={handleChange}
                        variant="standard"
                    />
                ) : <SearchIcon onClick={() => setSearchOpen(true)} /> }
        </>
    );
}
