/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import { Button, Drawer } from '@mui/material';
import React from 'react';
import { Box } from '@mui/system';
import FilterListIcon from '@mui/icons-material/FilterList';
// eslint-disable-next-line import/no-cycle
import { Options } from '../SourceOptions';

interface Props {
    state: ISourceFilters[]
    name: string
}

export default function GroupFilter(props: Props) {
    const { state, name } = props;
    const [filtersOpen, setFiltersOpen] = React.useState(false);
    // eslint-disable-next-line no-console
    console.log(state, name);
    return (
        <>
            <Button
                sx={{ width: '100%', color: 'inherit' }}
                onClick={() => setFiltersOpen(!filtersOpen)}
            >
                <Box
                    sx={{ margin: 'auto auto auto 0' }}
                >
                    <FilterListIcon sx={{ verticalAlign: 'bottom' }} />
                    {name}
                </Box>
            </Button>

            <Drawer
                anchor="right"
                open={filtersOpen}
                onClose={() => setFiltersOpen(false)}
                PaperProps={{
                    style: {
                        maxWidth: 600, padding: '1em', marginLeft: 'auto', marginRight: 'auto',
                    },
                }}
            >
                <Options
                    sourceFilter={state}
                />
            </Drawer>

        </>
    );
}
