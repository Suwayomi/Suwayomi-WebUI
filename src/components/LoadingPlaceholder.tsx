/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/require-default-props */
/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import React from 'react';
import makeStyles from '@mui/styles/makeStyles';
import CircularProgress from '@mui/material/CircularProgress';

const useStyles = makeStyles({
    loading: {
        margin: '10px auto',
        display: 'flex',
        justifyContent: 'center',
    },
});

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
    const classes = useStyles();

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
        <div className={classes.loading}>
            <CircularProgress thickness={5} />
        </div>
    );
}
