/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import FilterListIcon from '@mui/icons-material/FilterList';
import { Button, Fab, Stack } from '@mui/material';
import { Box } from '@mui/system';
import OptionsPanel from 'components/molecules/OptionsPanel';
import React from 'react';
import CheckBoxFilter from './filters/CheckBoxFilter';
import HeaderFilter from './filters/HeaderFilter';
import SelectFilter from './filters/SelectFilter';
import SortFilter from './filters/SortFilter';
import TextFilter from './filters/TextFilter';
import TriStateFilter from './filters/TriStateFilter';
// this can only cycle once, so should be fine
// eslint-disable-next-line import/no-cycle
import GroupFilter from './filters/GroupFilter';
import SeperatorFilter from './filters/SeparatorFilter';

interface IFilters {
    sourceFilter: ISourceFilters[]
    updateFilterValue: Function
    group: number | undefined
    update: any
}

interface IFilters1 {
    sourceFilter: ISourceFilters[]
    updateFilterValue: Function
    resetFilterValue: Function
    setTriggerUpdate: Function
    setSearch: Function
    update: any
}

export function Options({
    sourceFilter,
    group,
    updateFilterValue,
    update,
}: IFilters) {
    return (
        <Stack key={`filters ${group}`}>
            { sourceFilter.map((e: ISourceFilters, index) => {
                let checkif = update.find((el: {
                    group: number | undefined; position: number;
                }) => el.group === group && el.position === index);
                checkif = checkif ? checkif.state : checkif;
                switch (e.type) {
                    case 'CheckBox':
                        return (
                            <CheckBoxFilter
                                key={`filters ${e.filter.name}`}
                                name={e.filter.name}
                                state={checkif === 'false' || e.filter.state as boolean}
                                position={index}
                                group={group}
                                updateFilterValue={updateFilterValue}
                                update={update}
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
                                update={update}
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
                                values={e.filter.displayValues}
                                state={parseInt(checkif, 10) || e.filter.state as number}
                                selected={e.filter.selected}
                                position={index}
                                group={group}
                                updateFilterValue={updateFilterValue}
                                update={update}
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
                                state={checkif ? JSON.parse(checkif) : e.filter.state as IState}
                                position={index}
                                group={group}
                                updateFilterValue={updateFilterValue}
                                update={update}
                            />
                        );
                    case 'Text':
                        return (
                            <TextFilter
                                key={`filters ${e.filter.name}`}
                                name={e.filter.name}
                                state={checkif || e.filter.state as string}
                                position={index}
                                group={group}
                                updateFilterValue={updateFilterValue}
                                update={update}
                            />
                        );
                    case 'TriState':
                        return (
                            <TriStateFilter
                                key={`filters ${e.filter.name}`}
                                name={e.filter.name}
                                state={parseInt(checkif, 10) || e.filter.state as number}
                                position={index}
                                group={group}
                                updateFilterValue={updateFilterValue}
                                update={update}
                            />
                        );
                    default:
                        return (<Box key={`${e.filter.name}null`} />);
                }
            })}
        </Stack>
    );
}

export default function SourceOptions({
    sourceFilter,
    updateFilterValue,
    resetFilterValue,
    setTriggerUpdate,
    setSearch,
    update,
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

            <OptionsPanel
                open={FilterOptions}
                onClose={() => setFilterOptions(false)}
            >
                <Box sx={{ display: 'flex', p: 2, pb: 0 }}>
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
                <Box
                    sx={{
                        pb: 2,
                        mx: 2,
                    }}
                >
                    <Options
                        sourceFilter={sourceFilter}
                        updateFilterValue={updateFilterValue}
                        group={undefined}
                        update={update}
                    />
                </Box>
            </OptionsPanel>
        </>
    );
}
