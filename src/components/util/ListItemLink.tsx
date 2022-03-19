/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import React from 'react';
import ListItem, { ListItemProps } from '@mui/material/ListItem';
import { Link } from 'react-router-dom';

/**
 * If the `directLink` prop is true, then the `ListItem` will be rendered as a `button` with an `href`
 * attribute. Otherwise, it will be rendered as a `button` with a `component` attribute
 * @param props
 */
export default function ListItemLink(props: ListItemProps<Link, { directLink?: boolean }>) {
    const { directLink, to } = props;
    if (directLink) {
        // eslint-disable-next-line react/jsx-props-no-spreading
        return <ListItem button component="a" href={to} {...props} />;
    }

    // eslint-disable-next-line react/jsx-props-no-spreading
    return <ListItem button component={Link} {...props} />;
}
