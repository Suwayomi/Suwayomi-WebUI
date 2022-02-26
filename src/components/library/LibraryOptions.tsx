/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import { Drawer, FormControlLabel, IconButton } from '@mui/material';
import useLibraryOptions from 'util/useLibraryOptions';
import ThreeStateCheckbox from 'components/util/ThreeStateCheckbox';
import Switch from '@mui/material/Switch';
import Radio from '@mui/material/Radio';
import { Box } from '@mui/system';

interface IGenres {
    genres: string[]
}

function Options() {
    const {
        downloaded, setDownloaded, unread, setUnread,
    } = useLibraryOptions();
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <FormControlLabel control={<ThreeStateCheckbox name="Unread" checked={unread} onChange={setUnread} />} label="Unread" />
            <FormControlLabel control={<ThreeStateCheckbox name="Downloaded" checked={downloaded} onChange={setDownloaded} />} label="Downloaded" />
        </Box>
    );
}

function SortOptions() {
    const {
        sorts, setSorts, sortDesc, setSortDesc,
    } = useLibraryOptions();

    const handleSortChange = (name: string) => (event: { target: { checked: boolean; }; }) => {
        setSorts(event.target.checked ? name : undefined);
    };

    const handleOrderChange = () => (event: { target: { checked: boolean; }; }) => {
        setSortDesc(event.target.checked);
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <FormControlLabel control={<Switch name="sortDesc" checked={sortDesc === true} onChange={handleOrderChange()} color="default" />} label="Asc/Desc" />
            <FormControlLabel control={<Radio name="sortToRead" checked={sorts === 'sortToRead'} onChange={handleSortChange('sortToRead')} />} label="Sort by left to read" />
            <FormControlLabel control={<Radio name="sortAlph" checked={sorts === 'sortAlph'} onChange={handleSortChange('sortAlph')} />} label="Sort alphbetical" />
            <FormControlLabel control={<Radio name="sortID" checked={sorts === 'sortID' || sorts === undefined} onChange={handleSortChange('sortID')} />} label="Sort by ID" />
        </Box>
    );
}

function GenreOptions({ genres }: IGenres) {
    const {
        genreY,
        setGenreY,
        genreN,
        setGenreN,
    } = useLibraryOptions();

    function handleGenreChange(ele: string, checked: boolean | undefined | null) {
        switch (checked) {
            case true:
                setGenreY([...Array.from(genreY || []), ele]);
                break;
            case false:
                setGenreY(genreY?.filter((e) => e !== ele));
                setGenreN([...Array.from(genreN || []), ele]);
                break;
            default:
                setGenreN(genreN?.filter((e) => e !== ele));
        }
    }

    const ret = genres.map((ele) => {
        let check: null | boolean;
        if (genreY?.find((elem) => elem === ele)) {
            check = true;
        } else if (genreN?.find((elem) => elem === ele)) {
            check = false;
        } else {
            check = null;
        }

        return (
            <FormControlLabel
                key={ele}
                control={(
                    <ThreeStateCheckbox
                        name={ele}
                        checked={check}
                        onChange={(checked) => handleGenreChange(ele, checked)}
                    />
                )}
                label={ele}
            />
        );
    });
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            {ret}
        </Box>
    );
}

export default function LibraryOptions({ genres }: IGenres) {
    const [filtersOpen, setFiltersOpen] = React.useState(false);
    const [genreFiltersOpen, setGenreFiltersOpen] = React.useState(false);
    const [sortsOpen, setSortsOpen] = React.useState(false);
    const { active, activeSort } = useLibraryOptions();
    return (
        <>
            <IconButton
                onClick={() => setFiltersOpen(!filtersOpen)}
                color={active ? 'warning' : 'default'}
            >
                <FilterListIcon />
            </IconButton>

            <Drawer
                anchor="bottom"
                open={filtersOpen}
                onClose={() => setFiltersOpen(false)}
                PaperProps={{
                    style: {
                        maxWidth: 600, padding: '1em', marginLeft: 'auto', marginRight: 'auto',
                    },
                }}
            >
                <Options />
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <IconButton
                        sx={{
                            marginRight: 'auto',
                        }}
                        onClick={() => {
                            setFiltersOpen(false);
                            setGenreFiltersOpen(!genreFiltersOpen);
                        }}
                        color={active ? 'warning' : 'default'}
                        size="small"
                    >
                        <FilterListIcon />
                        Genre Filter
                    </IconButton>
                </Box>
            </Drawer>

            <IconButton
                onClick={() => setSortsOpen(!filtersOpen)}
                color={activeSort ? 'warning' : 'default'}
            >
                <SortIcon />
            </IconButton>

            <Drawer
                anchor="bottom"
                open={sortsOpen}
                onClose={() => setSortsOpen(false)}
                PaperProps={{
                    style: {
                        maxWidth: 600, padding: '1em', marginLeft: 'auto', marginRight: 'auto',
                    },
                }}
            >
                <SortOptions />
            </Drawer>

            <Drawer
                anchor="right"
                open={genreFiltersOpen}
                onClose={() => setGenreFiltersOpen(false)}
                PaperProps={{
                    style: {
                        maxWidth: 600, padding: '1em', marginLeft: 'auto', marginRight: 'auto',
                    },
                }}
            >
                <GenreOptions
                    genres={genres}
                />
            </Drawer>

        </>
    );
}
