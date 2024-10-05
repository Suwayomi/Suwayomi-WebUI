/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Box from '@mui/material/Box';

import { IReaderSettings } from '@/modules/reader/Reader.types.ts';

interface IProps {
    settings: IReaderSettings;
    curPage: number;
    pageCount: number;
}

export function PageNumber(props: IProps) {
    const { settings, curPage, pageCount } = props;

    return (
        <Box
            sx={{
                display: settings.showPageNumber ? 'block' : 'none',
                position: 'fixed',
                bottom: '50px',
                padding: '2px',
                paddingLeft: '4px',
                paddingRight: '4px',
                textAlign: 'center',
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                borderRadius: '10px',
            }}
        >
            {`${curPage + 1} / ${pageCount}`}
        </Box>
    );
}
