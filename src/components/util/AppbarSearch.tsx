/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import React, { useState, useEffect } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import { IconButton, Input, Tooltip } from '@mui/material';
import CancelIcon from '@mui/icons-material/Cancel';
import { useQueryParam, StringParam } from 'use-query-params';
import { useTranslation } from 'react-i18next';

interface IProps {
    autoOpen?: boolean;
}

const defaultProps = {
    autoOpen: false,
};

export const AppbarSearch: React.FunctionComponent<IProps> = (props) => {
    const { t } = useTranslation();

    const { autoOpen } = props;
    const [query, setQuery] = useQueryParam('query', StringParam);
    const [searchOpen, setSearchOpen] = useState(!!query);
    const inputRef = React.useRef<HTMLInputElement>();

    const [searchString, setSearchString] = useState(query ?? '');

    function handleChange(newQuery: string) {
        if (newQuery === '') {
            return;
        }

        setQuery(newQuery);
    }

    const cancelSearch = () => {
        setSearchString('');
        setQuery(undefined);
        setSearchOpen(false);
    };
    const handleBlur = () => {
        if (!searchString) setSearchOpen(false);
    };

    const openSearch = () => {
        setSearchOpen(true);
    };

    const handleKeyboardEvent = (e: KeyboardEvent) => {
        if (e.code === 'F3' || (e.ctrlKey && e.code === 'KeyF')) {
            e.preventDefault();
            openSearch();
            return;
        }

        if (e.code === 'Enter') {
            e.preventDefault();
            handleChange(searchString);
        }
    };

    useEffect(() => {
        if (autoOpen) {
            openSearch();
        }
    }, []);

    useEffect(() => {
        if (!searchOpen || !inputRef.current) {
            return;
        }

        inputRef.current.focus();
    }, [searchOpen, inputRef.current]);

    useEffect(() => {
        if (query === undefined && searchString !== undefined) {
            setSearchString('');

            if (!autoOpen) {
                setSearchOpen(false);
            }

            return;
        }

        if (query && searchString !== query) {
            setSearchString(query);
            openSearch();
        }
    }, [query]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyboardEvent);

        return () => {
            window.removeEventListener('keydown', handleKeyboardEvent);
        };
    }, [handleKeyboardEvent]);

    if (searchOpen) {
        return (
            <Input
                value={searchString}
                onChange={(e) => setSearchString(e.target.value)}
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
        <Tooltip title={t('search.title.search')}>
            <IconButton onClick={openSearch}>
                <SearchIcon />
            </IconButton>
        </Tooltip>
    );
};

AppbarSearch.defaultProps = defaultProps;
