/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useMemo, useState } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import HistoryIcon from '@mui/icons-material/History';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import Autocomplete from '@mui/material/Autocomplete';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { useQueryParam, StringParam } from 'use-query-params';
import { useLocation } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import { useHotkeys } from 'react-hotkeys-hook';
import { useLingui } from '@lingui/react/macro';
import { CustomTooltip } from '@/base/components/CustomTooltip.tsx';
import { SearchTextField } from '@/base/components/inputs/SearchTextField.tsx';
import { SearchParam } from '@/base/Base.types.ts';
import { STABLE_EMPTY_ARRAY } from '@/base/Base.constants.ts';
import { useSearchHistory } from '@/base/hooks/useSearchHistory.ts';
import { useMetadataServerSettings } from '@/features/settings/services/ServerSettingsMetadata.ts';
import { useDebounce } from '@/base/hooks/useDebounce.ts';
import { getFuzzyScore } from '@/base/utils/FuzzySearch.ts';
import { enhancedCleanup } from '@/base/utils/Strings.ts';

/** Enough to be worth scrolling through, few enough to not cover the whole screen on mobile. */
const MAX_SUGGESTIONS = 8;

/** Without anything typed there is nothing to rank the history by, so only the most recent entries are of use. */
const MAX_HISTORY_SUGGESTIONS = 5;

/** Short enough to still feel immediate, long enough to rank a large library only once per pause in the typing. */
const SUGGESTION_DEBOUNCE_MS = 150;

type SearchSuggestion = {
    label: string;
    isFromHistory: boolean;
};

/**
 * Scores a suggestion the same way the search that it is going to run does, so that the suggestions can never promise
 * a match the search itself does not find. With fuzzy search turned off that is a plain substring match, ranked by how
 * early the query occurs.
 */
const getSubstringSuggestionScore = (query: string, text: string): number | null => {
    const index = enhancedCleanup(text).indexOf(query);

    return index === -1 ? null : 1 / (1 + index);
};

/**
 * Picks the "limit" best matches for "query" out of "values".
 *
 * Only the best matches found so far are kept, instead of scoring everything into an array and sorting that: the values
 * are usually every title of the library, so holding a score per title - let alone the four intermediate arrays a
 * "map/filter/sort/slice" chain produces - would allocate megabytes for the handful of entries that end up visible.
 */
const collectBestMatches = (
    query: string,
    values: string[],
    limit: number,
    getScore: (query: string, value: string) => number | null,
    isExcluded?: (value: string) => boolean,
): string[] => {
    const bestValues: string[] = [];
    const isAlreadyKept = (value: string) =>
        bestValues.some((keptValue) => keptValue.toLowerCase() === value.toLowerCase());

    if (!query) {
        for (const value of values) {
            if (bestValues.length === limit) {
                break;
            }

            if (isExcluded?.(value) || isAlreadyKept(value)) {
                continue;
            }

            bestValues.push(value);
        }

        return bestValues;
    }

    const bestScores: number[] = [];

    for (const value of values) {
        if (isExcluded?.(value)) {
            continue;
        }

        const score = getScore(query, value);

        if (score === null) {
            continue;
        }

        // the same title can be in the library more than once, e.g. added from two sources - equal values score
        // equally, so the one that is already kept is the one that would win anyway
        if (isAlreadyKept(value)) {
            continue;
        }

        const isWorseThanTheWorstKeptMatch = bestValues.length === limit && score <= bestScores[limit - 1];
        if (isWorseThanTheWorstKeptMatch) {
            continue;
        }

        let insertAt = bestValues.length;
        while (insertAt > 0 && bestScores[insertAt - 1] < score) {
            insertAt--;
        }

        bestValues.splice(insertAt, 0, value);
        bestScores.splice(insertAt, 0, score);

        if (bestValues.length > limit) {
            bestValues.pop();
            bestScores.pop();
        }
    }

    return bestValues;
};

interface IProps {
    isClosable?: boolean;
    /**
     * Values to offer while typing, on top of the previously submitted searches, e.g. the titles of the mangas of the
     * screen that is being searched.
     */
    suggestions?: string[];
}

export const AppbarSearch: React.FunctionComponent<IProps> = (props) => {
    const { isClosable = true, suggestions = STABLE_EMPTY_ARRAY } = props;

    const theme = useTheme();
    const { t } = useLingui();

    const [prevLocationKey, setPrevLocationKey] = useState<string>();
    const location = useLocation();

    const [query, setQuery] = useQueryParam(SearchParam.QUERY, StringParam);
    const [isSearchOpen, setIsSearchOpen] = useState(!isClosable || !!query);
    const inputRef = React.useRef<HTMLInputElement>(undefined);

    const [searchString, setSearchString] = useState(query ?? '');

    const { history, addToHistory, removeFromHistory } = useSearchHistory();

    // the suggestions have to match the way the search behaves, otherwise the dropdown offers a title that the search
    // it runs then cannot find
    const {
        settings: { fuzzySearch },
    } = useMetadataServerSettings();
    const getSuggestionScore = useCallback(
        (cleanedUpQuery: string, value: string) =>
            fuzzySearch
                ? getFuzzyScore(cleanedUpQuery, enhancedCleanup(value))
                : getSubstringSuggestionScore(cleanedUpQuery, value),
        [fuzzySearch],
    );

    if (prevLocationKey !== location.key) {
        setPrevLocationKey(location.key);
        setSearchString(query ?? '');
        setIsSearchOpen(!isClosable || !!query);
    }

    const isOpen = isSearchOpen || !!query;

    // ranking every suggestion of the screen is only worth doing once the typing settles down
    const debouncedSearchString = useDebounce(searchString, SUGGESTION_DEBOUNCE_MS);

    const options = useMemo<SearchSuggestion[]>(() => {
        // the suggestions of a closed search box are never shown, and ranking them is the expensive part
        if (!isOpen) {
            return STABLE_EMPTY_ARRAY;
        }

        const cleanedUpSearchString = enhancedCleanup(debouncedSearchString);

        const historyOptions = collectBestMatches(
            cleanedUpSearchString,
            history,
            MAX_HISTORY_SUGGESTIONS,
            getSuggestionScore,
        ).map((label) => ({ label, isFromHistory: true }));

        // without anything typed the suggestions are just the unsorted content of the screen, which says nothing
        if (!cleanedUpSearchString) {
            return historyOptions;
        }

        const suggestedLabels = new Set(historyOptions.map((option) => option.label.toLowerCase()));

        const suggestionOptions = collectBestMatches(
            cleanedUpSearchString,
            suggestions,
            MAX_SUGGESTIONS,
            getSuggestionScore,
            (value) => suggestedLabels.has(value.toLowerCase()),
        ).map((label) => ({ label, isFromHistory: false }));

        return [...historyOptions, ...suggestionOptions];
    }, [isOpen, debouncedSearchString, history, suggestions, getSuggestionScore]);

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
        addToHistory(newQuery);
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

    if (isOpen) {
        return (
            <Autocomplete<SearchSuggestion, false, true, true>
                freeSolo
                disableClearable
                forcePopupIcon={false}
                autoComplete={false}
                // an empty input keeps the popup closed by default, which would make the previous searches - the only
                // thing an empty search box has to offer - unreachable
                openOnFocus
                // "Autocomplete" defaults this to true, which would widen the field and push the sibling toolbar
                // actions out of the appbar. Without it the field collapses to the width of its adornment, so it
                // needs a width of its own.
                fullWidth={false}
                // grows into whatever the appbar has left over, down to nothing on a narrow phone where the title and
                // the actions already fill the row
                sx={{ flexGrow: 1, minWidth: 0, width: { xs: 180, sm: 260, md: 340 }, maxWidth: 340 }}
                slotProps={{
                    popper: {
                        sx: {
                            // the popper is pinned to the width of the field it is anchored to, which is far too
                            // narrow for manga titles - "!important" is what it takes to beat the inline width
                            width: 'auto !important',
                            minWidth: { xs: 240, sm: 320, md: 420 },
                            maxWidth: 'min(560px, calc(100vw - 32px))',
                        },
                    },
                }}
                options={options}
                // the options are already ranked by relevance, re-filtering them by substring would drop the fuzzy hits
                filterOptions={(unfilteredOptions) => unfilteredOptions}
                getOptionLabel={(option) => (typeof option === 'string' ? option : option.label)}
                groupBy={(option) => (option.isFromHistory ? t`Recent searches` : t`Suggestions`)}
                inputValue={searchString}
                onInputChange={(_, value, reason) => {
                    // "reset" fires on mount and after selecting an option, both of which would overwrite the state
                    // that is kept in sync with the query param
                    if (reason === 'input') {
                        setSearchString(value);
                    }
                }}
                onChange={(_, value) => {
                    // fires both for a selected suggestion and for pressing enter on a free form query
                    handleChange(typeof value === 'string' ? value : value.label);
                }}
                renderOption={({ key, ...optionProps }, option) => (
                    <li key={key} {...optionProps}>
                        <ListItemIcon sx={{ minWidth: 'unset', mr: 1 }}>
                            {option.isFromHistory ? <HistoryIcon fontSize="small" /> : <SearchIcon fontSize="small" />}
                        </ListItemIcon>
                        <ListItemText
                            primary={option.label}
                            // "minWidth" lets the flex child shrink below its content, without it a long title
                            // stretches the row instead of being cut off
                            sx={{ minWidth: 0, my: 0 }}
                            slotProps={{
                                primary: {
                                    sx: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
                                },
                            }}
                        />
                        {option.isFromHistory && (
                            <CustomTooltip title={t`Remove from search history`}>
                                <IconButton
                                    size="small"
                                    edge="end"
                                    aria-label={t`Remove from search history`}
                                    // missing this on a touch screen runs the search instead of removing it, so the
                                    // hit area follows the 44px touch target guideline even though the icon is small
                                    sx={{ width: { xs: 44, sm: 32 }, height: { xs: 44, sm: 32 } }}
                                    // keeps the click from selecting the option that is being removed
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeFromHistory(option.label);
                                    }}
                                >
                                    <CloseIcon fontSize="small" />
                                </IconButton>
                            </CustomTooltip>
                        )}
                    </li>
                )}
                renderInput={(params) => (
                    <SearchTextField
                        {...params}
                        autoFocus
                        variant="standard"
                        // "params" carries the "fullWidth: false" of the autocomplete, which would leave the input
                        // sized to its content instead of filling the width set above
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
