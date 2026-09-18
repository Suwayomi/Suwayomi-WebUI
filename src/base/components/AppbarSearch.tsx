/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import React, { useEffect, useMemo, useState } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import IconButton from '@mui/material/IconButton';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import { useQueryParam, StringParam } from 'use-query-params';
import { useLocation } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import { useHotkeys } from 'react-hotkeys-hook';
import { useLingui } from '@lingui/react/macro';
import { CustomTooltip } from '@/base/components/CustomTooltip.tsx';
import { SearchTextField } from '@/base/components/inputs/SearchTextField.tsx';
import { SearchParam } from '@/base/Base.types.ts';
import { TypographyMaxLines } from '@/base/components/texts/TypographyMaxLines.tsx';
import { STABLE_EMPTY_ARRAY } from '@/base/Base.constants.ts';
import { useDebounce } from '@/base/hooks/useDebounce.ts';
import { createFuzzySearch, fuzzySearch } from '@/base/utils/FuzzySearch.ts';
import { enhancedCleanup } from '@/base/utils/Strings.ts';
import { useMetadataServerSettings } from '@/features/settings/services/ServerSettingsMetadata.ts';
import { useNavBarContext } from '@/features/navigation-bar/NavbarContext.tsx';
import { MediaQuery } from '@/base/utils/MediaQuery.tsx';

/** Enough to be worth scrolling through, few enough to not cover the whole screen on mobile. */
const MAX_SUGGESTIONS = 8;

/** Short enough to still feel immediate, long enough to rank a large library only once per pause in the typing. */
const SUGGESTION_DEBOUNCE_MS = 150;

const getSubstringMatches = (query: string, suggestions: string[]): string[] =>
    suggestions.filter((suggestion) => enhancedCleanup(suggestion).includes(query));

interface IProps {
    isClosable?: boolean;
    suggestions?: string[];
}

export const AppbarSearch: React.FunctionComponent<IProps> = (props) => {
    const { isClosable = true, suggestions = STABLE_EMPTY_ARRAY } = props;

    const theme = useTheme();
    const { t } = useLingui();
    const { setHideTitle, navBarWidth } = useNavBarContext();
    const scrollbarYSize = MediaQuery.useGetScrollbarSize('Y');

    const [prevLocationKey, setPrevLocationKey] = useState<string>();
    const location = useLocation();

    const [query, setQuery] = useQueryParam(SearchParam.QUERY, StringParam);
    const [isSearchOpen, setIsSearchOpen] = useState(!isClosable || !!query);
    const inputRef = React.useRef<HTMLInputElement>(undefined);

    const [searchString, setSearchString] = useState(query ?? '');

    const {
        settings: { fuzzySearch: isFuzzySearchEnabled },
    } = useMetadataServerSettings();

    if (prevLocationKey !== location.key) {
        setPrevLocationKey(location.key);
        setSearchString(query ?? '');
        setIsSearchOpen(!isClosable || !!query);
    }

    const isOpen = isSearchOpen || !!query;

    const debouncedSearchString = useDebounce(searchString, SUGGESTION_DEBOUNCE_MS);

    const fuzzySearchIndex = useMemo(
        () => (isOpen && isFuzzySearchEnabled ? createFuzzySearch(suggestions, []) : null),
        [isOpen, isFuzzySearchEnabled, suggestions],
    );

    const options = useMemo<string[]>(() => {
        const trimmedSearchString = debouncedSearchString.trim();

        const showSuggestions = isOpen && !!trimmedSearchString;
        if (!showSuggestions) {
            return STABLE_EMPTY_ARRAY;
        }

        const matches = fuzzySearchIndex
            ? fuzzySearch(fuzzySearchIndex, trimmedSearchString, { limit: MAX_SUGGESTIONS })
            : getSubstringMatches(enhancedCleanup(trimmedSearchString), suggestions);

        return [...new Set(matches)].slice(0, MAX_SUGGESTIONS);
    }, [isOpen, debouncedSearchString, fuzzySearchIndex, suggestions]);

    const updateSearchOpenState = (open: boolean) => {
        if (!isClosable && !open) {
            return;
        }

        setIsSearchOpen(open);

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

        setSearchString(newQuery);
        setQuery(newQuery);
        updateSearchOpenState(false);
    }

    const cancelSearch = () => {
        setSearchString('');
        setQuery(undefined);
        updateSearchOpenState(false);
    };
    const handleBlur = () => {
        if (!searchString) {
            updateSearchOpenState(false);
        }
    };

    useHotkeys(
        'ctrl+f, F3',
        () => {
            updateSearchOpenState(true);
        },
        { preventDefault: true },
    );

    useEffect(() => {
        setHideTitle(isOpen);
        return () => setHideTitle(false);
    }, [isOpen]);

    if (isOpen) {
        return (
            <Autocomplete<string, false, true, true>
                freeSolo
                disableClearable
                forcePopupIcon={false}
                fullWidth
                slotProps={{
                    popper: {
                        placement: 'bottom-start',
                        sx: {
                            [theme.breakpoints.down('md')]: {
                                width: `calc(100vw - ${navBarWidth}px - ${scrollbarYSize}px) !important`,
                            },
                        },
                    },
                }}
                options={options}
                // the options are already ranked by relevance, re-filtering them would drop the typo tolerant hits
                filterOptions={(unfilteredOptions) => unfilteredOptions}
                inputValue={searchString}
                onInputChange={(_, value, reason) => {
                    // "reset" fires on mount and after selecting an option, both of which would overwrite the state
                    // that is kept in sync with the query param
                    if (reason === 'input') {
                        setSearchString(value);
                    }
                }}
                onChange={(_, value) => {
                    handleChange(value);
                }}
                renderOption={({ key, ...optionProps }, option) => (
                    <Box key={key} component="li" sx={{ gap: 1 }} {...optionProps}>
                        <SearchIcon fontSize="small" />
                        <TypographyMaxLines>{option}</TypographyMaxLines>
                    </Box>
                )}
                renderInput={(params) => (
                    <SearchTextField
                        {...params}
                        autoFocus
                        variant="standard"
                        fullWidth
                        onCancel={cancelSearch}
                        onBlur={handleBlur}
                        inputRef={inputRef}
                        sx={{
                            ...theme.applyStyles('light', {
                                '& .MuiInput-underline:before': {
                                    borderBottomColor: 'primary.contrastText', // Default color
                                },
                                '& .MuiInput-underline:hover:before': {
                                    borderBottomColor: 'primary.contrastText', // Hover color
                                },
                                '& .MuiInput-underline:after': {
                                    borderBottomColor: 'primary.dark', // Focused color
                                },
                            }),
                        }}
                        cancelButtonProps={{
                            sx: { ...theme.applyStyles('light', { color: 'primary.contrastText' }) },
                        }}
                    />
                )}
            />
        );
    }

    return (
        <CustomTooltip title={t`Search`}>
            <IconButton onClick={() => updateSearchOpenState(true)} color="inherit">
                <SearchIcon />
            </IconButton>
        </CustomTooltip>
    );
};
