/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import React, { useState, useEffect } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import { IconButton, Input } from '@mui/material';
import CancelIcon from '@mui/icons-material/Cancel';
import { useQueryParam, StringParam } from 'use-query-params';

interface IProps {
    autoOpen?: boolean;
}

const defaultProps = {
    autoOpen: false,
};

const AppbarSearch: React.FunctionComponent<IProps> = (props) => {
    const { autoOpen } = props;
    const [query, setQuery] = useQueryParam('query', StringParam);
    const [searchOpen, setSearchOpen] = useState(!!query);
    const inputRef = React.useRef<HTMLInputElement>();

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        setQuery(e.target.value === '' ? undefined : e.target.value);
    }

    const cancelSearch = () => {
        setQuery(null);
        setSearchOpen(false);
    };
    const handleBlur = () => {
        if (!query) setSearchOpen(false);
    };
    const openSearch = () => {
        setSearchOpen(true);
        // Put Focus Action at the end of the Callstack so Input actually exists on the dom
        setTimeout(() => {
            if (inputRef && inputRef.current) inputRef.current.focus();
        });
    };

    const handleSearchShortcut = (e: KeyboardEvent) => {
        if (e.code === 'F3' || (e.ctrlKey && e.code === 'KeyF')) {
            e.preventDefault();
            openSearch();
        }
    };

    useEffect(() => {
        if (autoOpen) {
            openSearch();
        }
    }, []);

    useEffect(() => {
        window.addEventListener('keydown', handleSearchShortcut);

        return () => {
            window.removeEventListener('keydown', handleSearchShortcut);
        };
    }, [handleSearchShortcut]);

    if (searchOpen) {
        return (
            <Input
                value={query || ''}
                onChange={handleChange}
                onBlur={handleBlur}
                inputRef={inputRef}
                endAdornment={
                    <IconButton onClick={cancelSearch}>
                        <CancelIcon />
                    </IconButton>
                }
            />
        );
    }

    return (
        <IconButton onClick={openSearch}>
            <SearchIcon />
        </IconButton>
    );
};

AppbarSearch.defaultProps = defaultProps;

export default AppbarSearch;
