/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import FilterListIcon from '@mui/icons-material/FilterList';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SourceFilters } from '@/typings';
import { OptionsPanel } from '@/components/molecules/OptionsPanel';
import { CheckBoxFilter } from '@/components/source/filters/CheckBoxFilter';
import { HeaderFilter } from '@/components/source/filters/HeaderFilter';
import { SelectFilter } from '@/components/source/filters/SelectFilter';
import { SortFilter } from '@/components/source/filters/SortFilter';
import { TextFilter } from '@/components/source/filters/TextFilter';
import { TriStateFilter } from '@/components/source/filters/TriStateFilter';
// this can only cycle once, so should be fine
// eslint-disable-next-line import/no-cycle
import { GroupFilter } from '@/components/source/filters/GroupFilter';
import { SeparatorFilter } from '@/components/source/filters/SeparatorFilter';
import { StyledFab } from '@/components/util/StyledFab';

interface IFilters {
    sourceFilter: SourceFilters[];
    updateFilterValue: Function;
    group: number | undefined;
    update: any;
}

interface IFilters1 {
    sourceFilter: SourceFilters[];
    updateFilterValue: Function;
    resetFilterValue: Function;
    setTriggerUpdate: Function;
    update: any;
}

export function Options({ sourceFilter, group, updateFilterValue, update }: IFilters) {
    return (
        <Stack key={`filters ${group}`}>
            {sourceFilter.map((e, index) => {
                let checkif = update.find(
                    (el: { group: number | undefined; position: number }) =>
                        el.group === group && el.position === index,
                );
                checkif = checkif ? checkif.state : checkif;
                switch (e.type) {
                    case 'CheckBoxFilter':
                        return (
                            <CheckBoxFilter
                                key={`filters ${e.name}`}
                                name={e.name}
                                state={checkif ?? e.CheckBoxFilterDefault}
                                position={index}
                                group={group}
                                updateFilterValue={updateFilterValue}
                                update={update}
                            />
                        );
                    case 'GroupFilter':
                        return (
                            <GroupFilter
                                key={`filters ${e.name}`}
                                name={e.name}
                                state={e.filters}
                                position={index}
                                updateFilterValue={updateFilterValue}
                                update={update}
                            />
                        );
                    case 'HeaderFilter':
                        return <HeaderFilter key={`filters ${e.name}`} name={e.name} />;
                    case 'SelectFilter':
                        return (
                            <SelectFilter
                                key={`filters ${e.name}`}
                                name={e.name}
                                values={e.values}
                                state={checkif != null ? parseInt(checkif, 10) : e.SelectFilterDefault}
                                position={index}
                                group={group}
                                updateFilterValue={updateFilterValue}
                                update={update}
                            />
                        );
                    case 'SeparatorFilter':
                        return <SeparatorFilter key={`filters ${e.name}`} name={e.name} />;
                    case 'SortFilter':
                        return (
                            <SortFilter
                                key={`filters ${e.name}`}
                                name={e.name}
                                values={e.values}
                                state={
                                    checkif ?? {
                                        ascending: e.SortFilterDefault?.ascending,
                                        index: e.SortFilterDefault?.index,
                                    }
                                }
                                position={index}
                                group={group}
                                updateFilterValue={updateFilterValue}
                                update={update}
                            />
                        );
                    case 'TextFilter':
                        return (
                            <TextFilter
                                key={`filters ${e.name}`}
                                name={e.name}
                                state={checkif ?? e.TextFilterDefault}
                                position={index}
                                group={group}
                                updateFilterValue={updateFilterValue}
                                update={update}
                            />
                        );
                    case 'TriStateFilter':
                        return (
                            <TriStateFilter
                                key={`filters ${e.name}`}
                                name={e.name}
                                state={checkif != null ? checkif : e.TriStateFilterDefault}
                                position={index}
                                group={group}
                                updateFilterValue={updateFilterValue}
                                update={update}
                            />
                        );
                    default:
                        throw new Error(`Unknown source filter "${e}"`);
                }
            })}
        </Stack>
    );
}

export function SourceOptions({
    sourceFilter,
    updateFilterValue,
    resetFilterValue,
    setTriggerUpdate,
    update,
}: IFilters1) {
    const { t } = useTranslation();
    const [FilterOptions, setFilterOptions] = useState(false);

    function handleReset() {
        resetFilterValue(0);
        setFilterOptions(false);
    }

    function handleSubmit() {
        setTriggerUpdate(0);
        setFilterOptions(false);
    }

    return (
        <>
            <StyledFab onClick={() => setFilterOptions(!FilterOptions)} variant="extended" color="primary">
                <FilterListIcon />
                {t('global.button.filter')}
            </StyledFab>

            <OptionsPanel open={FilterOptions} onClose={() => setFilterOptions(false)}>
                <Box sx={{ display: 'flex', p: 2, pb: 0 }}>
                    <Button onClick={handleReset}>{t('global.button.reset')}</Button>
                    <Button sx={{ marginLeft: 'auto' }} variant="contained" onClick={handleSubmit}>
                        {t('global.button.submit')}
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
