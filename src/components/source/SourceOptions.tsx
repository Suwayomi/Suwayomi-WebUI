/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import FilterListIcon from '@mui/icons-material/FilterList';
import { Drawer, FormControlLabel, IconButton } from '@mui/material';
import useLibraryOptions from 'util/useLibraryOptions';
import ThreeStateCheckbox from 'components/util/ThreeStateCheckbox';
import { Box } from '@mui/system';

interface IGenres {
    genres: (string)[]
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

export default function SourceOptions({ genres }: IGenres) {
    const [genreFiltersOpen, setGenreFiltersOpen] = React.useState(false);
    const { activeGenre } = useLibraryOptions();
    return (
        <>
            <IconButton
                onClick={() => setGenreFiltersOpen(true)}
                color={activeGenre ? 'warning' : 'default'}
            >
                <FilterListIcon />
            </IconButton>

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
