/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import React from 'react';
import { Box } from '@mui/system';

interface IProps {
    settings: IReaderSettings
    curPage: number
    pageCount: number
}

export default function PageNumber(props: IProps) {
    const { settings, curPage, pageCount } = props;

    return (
        <Box sx={{
            display: settings.showPageNumber ? 'block' : 'none',
            position: 'fixed',
            bottom: '50px',
            right: settings.staticNav ? 'calc((100vw - 325px)/2)' : 'calc((100vw - 25px)/2)',
            padding: '2px',
            textAlign: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            borderRadius: '10px',
        }}
        >
            {`${curPage + 1} / ${pageCount}`}
        </Box>
    );
}
