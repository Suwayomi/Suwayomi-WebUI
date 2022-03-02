/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import FilterListIcon from '@mui/icons-material/FilterList';
import {
    Drawer, IconButton, Button, FormControl, Input, InputLabel,
} from '@mui/material';
import { Box } from '@mui/system';
import SearchIcon from '@mui/icons-material/Search';
import SelectFilter from './filters/SelectFilter';
import CheckBoxFilter from './filters/CheckBoxFilter';
import HeaderFilter from './filters/HeaderFilter';
import SeperatorFilter from './filters/SeparatorFilter';
import SortFilter from './filters/SortFilter';
import TextFilter from './filters/TextFilter';
import TriStateFilter from './filters/TriStateFilter';
// this can only cycle once, so should be fine
// eslint-disable-next-line import/no-cycle
import GroupFilter from './filters/GroupFilter';

interface IFilters {
    sourceFilter: ISourceFilters[]
    updateFilterValue: Function
    group: number | undefined
}

interface IFilters1 {
    sourceFilter: ISourceFilters[]
    updateFilterValue: Function
    resetFilterValue: Function
    setsearchst: Function
    searchst: string
}

export function Options({
    sourceFilter,
    group,
    updateFilterValue,
}: IFilters) {
    return (
        <Box key={`filters ${group}`}>
            { sourceFilter.map((e: ISourceFilters, index) => {
                switch (e.type) {
                    case 'CheckBox':
                        return (
                            <CheckBoxFilter
                                key={`filters ${e.filter.name}`}
                                name={e.filter.name}
                                state={e.filter.state as boolean}
                                position={index}
                                group={group}
                                updateFilterValue={updateFilterValue}
                            />
                        );
                    case 'Group':
                        return (
                            <GroupFilter
                                key={`filters ${e.filter.name}`}
                                name={e.filter.name}
                                state={e.filter.state as ISourceFilters[]}
                                position={index}
                                updateFilterValue={updateFilterValue}
                            />
                        );
                    case 'Header':
                        return (
                            <HeaderFilter
                                key={`filters ${e.filter.name}`}
                                name={e.filter.name}
                            />
                        );
                    case 'Select':
                        return (
                            <SelectFilter
                                key={`filters ${e.filter.name}`}
                                name={e.filter.name}
                                values={e.filter.values}
                                state={e.filter.state as number}
                                selected={e.filter.selected}
                                position={index}
                                group={group}
                                updateFilterValue={updateFilterValue}
                            />
                        );
                    case 'Separator':
                        return (
                            <SeperatorFilter
                                key={`filters ${e.filter.name}`}
                                name={e.filter.name}
                            />
                        );
                    case 'Sort':
                        return (
                            <SortFilter
                                key={`filters ${e.filter.name}`}
                                name={e.filter.name}
                                values={e.filter.values}
                                state={e.filter.state as IState}
                                position={index}
                                group={group}
                                updateFilterValue={updateFilterValue}
                            />
                        );
                    case 'Text':
                        return (
                            <TextFilter
                                key={`filters ${e.filter.name}`}
                                name={e.filter.name}
                                state={e.filter.state as string}
                                position={index}
                                group={group}
                                updateFilterValue={updateFilterValue}
                            />
                        );
                    case 'TriState':
                        return (
                            <TriStateFilter
                                key={`filters ${e.filter.name}`}
                                name={e.filter.name}
                                state={e.filter.state as number}
                                position={index}
                                group={group}
                                updateFilterValue={updateFilterValue}
                            />
                        );
                    default:
                        return (<Box key={`${e.filter.name}null`} />);
                }
            })}
        </Box>
    );
}

export default function SourceOptions({
    sourceFilter,
    updateFilterValue,
    resetFilterValue,
    setsearchst,
    searchst,
}: IFilters1) {
    const [FilterOptions, setFilterOptions] = React.useState(false);
    const [Search, setsearch] = React.useState(searchst);

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        setsearch(e.target.value === '' ? '' : e.target.value);
        setsearchst(e.target.value === '' ? '' : e.target.value);
    }

    function handleReset() {
        setsearch('');
        resetFilterValue(0);
    }

    return (
        <>
            <IconButton
                onClick={() => setFilterOptions(!FilterOptions)}
            >
                <FilterListIcon />
            </IconButton>

            <Drawer
                anchor="right"
                open={FilterOptions}
                onClose={() => setFilterOptions(false)}
                PaperProps={{
                    style: {
                        maxWidth: 600, padding: '1em', marginLeft: 'auto', marginRight: 'auto',
                    },
                }}
            >
                <Button
                    variant="contained"
                    onClick={handleReset}
                >
                    Reset
                </Button>
                <Box sx={{ display: 'flex', flexDirection: 'row', minWidth: 120 }}>
                    <SearchIcon
                        sx={{
                            margin: 'auto',
                        }}
                    />
                    <FormControl fullWidth>
                        <InputLabel sx={{ margin: '10px 0 10px 0' }}>
                            Search
                        </InputLabel>
                        <Input
                            name="Search"
                            value={Search || ''}
                            onChange={handleChange}
                            sx={{ margin: '10px 0 10px 0' }}
                        />
                    </FormControl>
                </Box>
                <Options
                    sourceFilter={sourceFilter}
                    updateFilterValue={updateFilterValue}
                    group={undefined}
                />
            </Drawer>
        </>
    );
}
