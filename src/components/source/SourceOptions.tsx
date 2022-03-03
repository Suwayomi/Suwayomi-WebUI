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
    Drawer, Button, Fab,
} from '@mui/material';
import { Box } from '@mui/system';
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
    setTriggerUpdate: Function
    setSearch: Function
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
    setTriggerUpdate,
    setSearch,
}: IFilters1) {
    const [FilterOptions, setFilterOptions] = React.useState(false);

    function handleReset() {
        resetFilterValue(0);
        setFilterOptions(false);
    }

    function handleSubmit() {
        setTriggerUpdate(0);
        setSearch(true);
        setFilterOptions(false);
    }

    return (
        <>
            <Fab
                sx={{ position: 'fixed', bottom: '2em', right: '3em' }}
                onClick={() => setFilterOptions(!FilterOptions)}
                variant="extended"
                color="primary"
            >
                <FilterListIcon />
                Filter
            </Fab>

            <Drawer
                anchor="bottom"
                open={FilterOptions}
                onClose={() => setFilterOptions(false)}
                PaperProps={{
                    style: {
                        maxWidth: 600, padding: '1em', marginLeft: 'auto', marginRight: 'auto',
                    },
                }}
            >
                <Box sx={{ display: 'flex' }}>
                    <Button
                        onClick={handleReset}
                    >
                        Reset
                    </Button>
                    <Button
                        sx={{ marginLeft: 'auto' }}
                        variant="contained"
                        onClick={handleSubmit}
                    >
                        Submit
                    </Button>
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
