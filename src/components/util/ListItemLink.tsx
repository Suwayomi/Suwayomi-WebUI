/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import ListItem, { ListItemProps } from '@mui/material/ListItem';
import { Link } from 'react-router-dom';

export default function ListItemLink(props: ListItemProps<Link, { directLink?: boolean }>) {
    const { directLink, to } = props;
    if (directLink) {
        return <ListItem button component="a" href={to} {...props} />;
    }

    return <ListItem button component={Link} {...props} />;
}
