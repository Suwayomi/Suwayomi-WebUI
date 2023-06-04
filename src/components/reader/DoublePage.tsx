/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import { Box, styled } from '@mui/material';
import { IReaderSettings } from '@/typings';

const Image = styled('img')({
    marginBottom: 0,
    width: 'auto',
    minHeight: '99vh',
    height: 'auto',
    maxHeight: '99vh',
    objectFit: 'contain',
});

interface IProps {
    index: number;
    image1src: string;
    image2src: string;
    settings: IReaderSettings;
}

const DoublePage = React.forwardRef((props: IProps, ref: any) => {
    const { image1src, image2src, index, settings } = props;

    return (
        <Box
            ref={ref}
            sx={{
                display: 'flex',
                flexDirection: settings.readerType === 'DoubleLTR' ? 'row' : 'row-reverse',
                justifyContent: 'center',
                margin: '0 auto',
                width: 'auto',
                height: 'auto',
                overflowX: 'scroll',
            }}
        >
            <Image src={image1src} alt={`Page #${index}`} />
            <Image src={image2src} alt={`Page #${index + 1}`} />
        </Box>
    );
});

export default DoublePage;
