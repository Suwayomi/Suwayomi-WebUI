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
import { useLocation, useNavigate } from 'react-router-dom';

interface IProps {
    autoOpen?: boolean;
}

const defaultProps = {
    autoOpen: false,
};

export const AppbarSearch: React.FunctionComponent<IProps> = (props) => {
    const { autoOpen } = props;

    const { t } = useTranslation();

    const { pathname, search: locationSearch, state: fullLocationState } = useLocation<{ wasSearchOpen?: boolean }>();
    const { wasSearchOpen, ...locationState } = fullLocationState ?? {};

    const navigate = useNavigate();

    const [query, setQuery] = useQueryParam('query', StringParam);
    const [searchOpen, setSearchOpen] = useState(!!query);
    const inputRef = React.useRef<HTMLInputElement>();

    const [searchString, setSearchString] = useState(query ?? '');

    const updateSearchOpenState = (open: boolean) => {
        setSearchOpen(open);

        // try to focus input component since in case of navigating to the previous/next page in the browser history
        // the "openSearch" state might not change and thus, won't trigger a focus
        if (open) {
            inputRef.current?.focus();
        }
    };

    function handleChange(newQuery: string) {
        if (newQuery === '') {
            return;
        }

        setQuery(newQuery);
    }

    const cancelSearch = () => {
        setSearchString('');
        setQuery(undefined);
        updateSearchOpenState(false);
    };
    const handleBlur = () => {
        if (!searchString) updateSearchOpenState(false);
    };

    const handleKeyboardEvent = (e: KeyboardEvent) => {
        if (e.key === 'F3' || (e.ctrlKey && e.key === 'f')) {
            e.preventDefault();
            updateSearchOpenState(true);
        }
    };

    useEffect(() => {
        if ((autoOpen && wasSearchOpen === undefined) || (wasSearchOpen && query)) {
            updateSearchOpenState(true);
            return;
        }

        updateSearchOpenState(false);
    }, [autoOpen, pathname]);

    useEffect(() => {
        if (!searchOpen || !inputRef.current) {
            return;
        }

        inputRef.current.focus();
    }, [searchOpen, inputRef.current]);

    useEffect(() => {
        if (wasSearchOpen === searchOpen) {
            return;
        }

        navigate(
            { pathname, search: locationSearch },
            { replace: true, state: { ...locationState, wasSearchOpen: searchOpen } },
        );
    }, [searchOpen]);

    useEffect(() => {
        if (query === undefined && searchString !== undefined) {
            setSearchString('');
            return;
        }

        if (query && searchString !== query) {
            setSearchString(query);
            updateSearchOpenState(true);
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
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        handleChange(searchString);
                    }
                }}
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
            <IconButton onClick={() => updateSearchOpenState(true)}>
                <SearchIcon />
            </IconButton>
        </Tooltip>
    );
};

AppbarSearch.defaultProps = defaultProps;
