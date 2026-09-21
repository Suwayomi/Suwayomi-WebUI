/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import React, { useEffect, useMemo, useState } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import HistoryIcon from '@mui/icons-material/History';
import CloseIcon from '@mui/icons-material/Close';
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
import { enhancedCleanup, escapeRegex } from '@/base/utils/Strings.ts';
import { useMetadataServerSettings } from '@/features/settings/services/ServerSettingsMetadata.ts';
import { useSearchHistory } from '@/base/hooks/useSearchHistory.ts';
import { useNavBarContext } from '@/features/navigation-bar/NavbarContext.tsx';
import { MediaQuery } from '@/base/utils/MediaQuery.tsx';
import { useForceUpdate } from '@mantine/hooks';
import List from '@mui/material/List';
import ListSubheader from '@mui/material/ListSubheader';
import Button from '@mui/material/Button';

/** Enough to be worth scrolling through, few enough to not cover the whole screen on mobile. */
const MAX_SUGGESTIONS = 8;

/** Short enough to still feel immediate, long enough to rank a large library only once per pause in the typing. */
const SUGGESTION_DEBOUNCE_MS = 150;

const MAX_HISTORY_SUGGESTIONS = 5;

type SearchSuggestion = {
    label: string;
    isFromHistory: boolean;
};

const getSubstringMatches = (query: string, suggestions: string[]): string[] =>
    suggestions.filter((suggestion) => enhancedCleanup(suggestion).includes(query));

interface IProps {
    searchHistoryKey: string;
    isClosable?: boolean;
    suggestions?: string[];
}

export const AppbarSearch: React.FunctionComponent<IProps> = (props) => {
    const { searchHistoryKey, isClosable = true, suggestions = STABLE_EMPTY_ARRAY } = props;

    const theme = useTheme();
    const { t } = useLingui();
    const { setHideTitle, navBarWidth } = useNavBarContext();
    const scrollbarYSize = MediaQuery.useGetScrollbarSize('Y');
    const forceUpdate = useForceUpdate();

    const [prevLocationKey, setPrevLocationKey] = useState<string>();
    const location = useLocation();

    const [query, setQuery] = useQueryParam(SearchParam.QUERY, StringParam);
    const [isSearchOpen, setIsSearchOpen] = useState(!isClosable || !!query);
    const inputRef = React.useRef<HTMLInputElement>(undefined);

    const [searchString, setSearchString] = useState(query ?? '');
    const [liveAutoCompletion, setLiveAutoCompletion] = useState<string>();

    const [focused, setFocused] = useState(false);

    const {
        settings: { fuzzySearch: isFuzzySearchEnabled },
    } = useMetadataServerSettings();

    const { history, addToHistory, removeFromHistory, clearHistory } = useSearchHistory(
        searchHistoryKey,
        MAX_HISTORY_SUGGESTIONS,
    );

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

    const options = useMemo<SearchSuggestion[]>(() => {
        const trimmedSearchString = debouncedSearchString.trim();

        if (!trimmedSearchString) {
            return history.map((label) => ({ label, isFromHistory: true }));
        }

        const matches = fuzzySearchIndex
            ? fuzzySearch(fuzzySearchIndex, trimmedSearchString, { limit: MAX_SUGGESTIONS })
            : getSubstringMatches(enhancedCleanup(trimmedSearchString), suggestions);

        return [...new Set(matches)].slice(0, MAX_SUGGESTIONS).map((label) => ({ label, isFromHistory: false }));
    }, [isOpen, debouncedSearchString, fuzzySearchIndex, suggestions, history]);

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
        const normalizedQuery = newQuery.trim();

        if (normalizedQuery === '') {
            return;
        }
        setLiveAutoCompletion(undefined);
        setSearchString(normalizedQuery);
        addToHistory(normalizedQuery);
        setQuery(normalizedQuery);
        updateSearchOpenState(false);
    }

    const cancelSearch = () => {
        setLiveAutoCompletion(undefined);
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
    useHotkeys(
        'tab',
        (e) => {
            if (!focused || !liveAutoCompletion || liveAutoCompletion === searchString) {
                return;
            }

            e.preventDefault();
            e.stopPropagation();

            setSearchString(liveAutoCompletion);
        },
        {
            enableOnFormTags: true,
        },
        [focused, liveAutoCompletion, searchString],
    );

    useEffect(() => {
        if (isOpen) {
            requestAnimationFrame(() => {
                forceUpdate();
            });
        }

        setHideTitle(isOpen);
        return () => setHideTitle(false);
    }, [isOpen]);

    if (isOpen) {
        return (
            <Autocomplete<SearchSuggestion, false, true, true>
                open={focused}
                freeSolo
                disableClearable
                forcePopupIcon={false}
                openOnFocus
                fullWidth
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
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
                getOptionLabel={(option) => (typeof option === 'string' ? option : option.label)}
                groupBy={(option) => (option.isFromHistory ? t`Recent searches` : '')}
                inputValue={searchString}
                onInputChange={(_, value, reason) => {
                    // "reset" fires on mount and after selecting an option, both of which would overwrite the state
                    // that is kept in sync with the query param
                    if (reason === 'input') {
                        setSearchString(value);

                        const tmpNormalizedValue = value.trimStart().toLowerCase();

                        if (!tmpNormalizedValue) {
                            setLiveAutoCompletion(undefined);
                            return;
                        }

                        const findLiveAutoCompletion = (list: string[]) =>
                            list.find((item) => item.toLowerCase().startsWith(tmpNormalizedValue));

                        const liveAutoCompletionString =
                            findLiveAutoCompletion(options.map(({ label }) => label)) ??
                            findLiveAutoCompletion(suggestions);
                        setLiveAutoCompletion(liveAutoCompletionString);
                    }
                }}
                onChange={(_, value) => {
                    handleChange(typeof value === 'string' ? value : value.label);
                }}
                renderGroup={(value) => (
                    <List
                        subheader={
                            value.group && (
                                <ListSubheader sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    {value.group}
                                    <Button onClick={clearHistory}>{t`Delete all`}</Button>
                                </ListSubheader>
                            )
                        }
                    >
                        {value.children}
                    </List>
                )}
                renderOption={({ key, ...optionProps }, option) => (
                    <Box key={key} component="li" sx={{ gap: 1 }} {...optionProps}>
                        {option.isFromHistory ? <HistoryIcon /> : <SearchIcon />}
                        <Box sx={{ flexGrow: 1 }}>
                            <CustomTooltip title={option.label} placement="right">
                                <TypographyMaxLines sx={{ width: 'fit-content' }}>{option.label}</TypographyMaxLines>
                            </CustomTooltip>
                        </Box>
                        {option.isFromHistory && (
                            <CustomTooltip title={t`Delete`} placement="auto">
                                <IconButton
                                    edge="end"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeFromHistory(option.label);
                                    }}
                                >
                                    <CloseIcon />
                                </IconButton>
                            </CustomTooltip>
                        )}
                    </Box>
                )}
                renderInput={(params) => (
                    <Box sx={{ position: 'relative' }}>
                        {focused && liveAutoCompletion && (
                            <Box
                                sx={{
                                    position: 'absolute',
                                    display: 'flex',
                                    alignItems: 'center',
                                    height: '100%',
                                    color: 'text.secondary',
                                    whiteSpace: 'pre',
                                    pointerEvents: 'none',
                                    zIndex: 0,
                                }}
                            >
                                <span style={{ visibility: 'hidden' }}>{searchString}</span>
                                {liveAutoCompletion.replace(new RegExp(escapeRegex(searchString).trimStart(), 'i'), '')}
                            </Box>
                        )}
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
                    </Box>
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
