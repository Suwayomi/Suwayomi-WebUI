/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import React from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import { Box } from '@mui/system';

interface IProps {
    shouldRender?: boolean | (() => boolean)
    children?: React.ReactNode
    component?: string | React.FunctionComponent<any> | React.ComponentClass<any, any>
    componentProps?: any
}

export default function LoadingPlaceholder(props: IProps) {
    const {
        children, shouldRender, component, componentProps,
    } = props;

    let condition = true;
    if (shouldRender !== undefined) {
        condition = shouldRender instanceof Function ? shouldRender() : shouldRender;
    }

    if (condition) {
        if (component) {
            return React.createElement(component, componentProps);
        }

        if (children) {
            return (
                <>
                    {children}
                </>
            );
        }
    }

    return (
        <Box sx={{
            margin: '10px auto',
            display: 'flex',
            justifyContent: 'center',
        }}
        >
            <CircularProgress thickness={5} />
        </Box>
    );
}
