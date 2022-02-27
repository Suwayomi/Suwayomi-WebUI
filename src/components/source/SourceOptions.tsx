/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import FilterListIcon from '@mui/icons-material/FilterList';
import { Drawer, IconButton } from '@mui/material';
import SelectFilter from './filters/SelectFilter';
import CheckBoxFilter from './filters/CheckBoxFilter';

interface IFilters {
    sourceFilter: ISourceFilters[]
}

function Options({ sourceFilter }: IFilters) {
    const ret = sourceFilter.map((e: ISourceFilters) => {
        switch (e.type) {
            case 'CheckBox':
                if (typeof (e.filter.state) === 'boolean') {
                    return (
                        <CheckBoxFilter
                            name={e.filter.name}
                            state={e.filter.state}
                        />
                    );
                }
                break;
            case 'Group':
                // eslint-disable-next-line no-console
                console.log(e, 'Group');
                return (<></>);
            case 'Header':
                // eslint-disable-next-line no-console
                console.log(e, 'Header');
                return (<></>);
            case 'Select':
                if (typeof (e.filter.state) === 'number') {
                    return (
                        <SelectFilter
                            name={e.filter.name}
                            values={e.filter.values}
                            state={e.filter.state}
                        />
                    );
                }
                break;
            case 'Separator':
                // eslint-disable-next-line no-console
                console.log(e, 'Separator');
                return (<></>);
            case 'Sort':
                // eslint-disable-next-line no-console
                console.log(e, 'Sort');
                return (<></>);
            case 'Text':
                // eslint-disable-next-line no-console
                console.log(e, 'Text');
                return (<></>);
            case 'TriState':
                // eslint-disable-next-line no-console
                console.log(e, 'TriState');
                return (<></>);
            default:
                // eslint-disable-next-line no-console
                console.log(e, 'error');
                break;
        }
        return (<></>);
    });
    return (<>{ ret }</>);
}

export default function SourceOptions({ sourceFilter }: IFilters) {
    const [FilterOptions, setFilterOptions] = React.useState(false);
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
                <Options
                    sourceFilter={sourceFilter}
                />
            </Drawer>
        </>
    );
}
