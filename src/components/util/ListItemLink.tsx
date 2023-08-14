/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { Link } from 'react-router-dom';
import { ListItemButton, ListItemButtonProps } from '@mui/material';

export default function ListItemLink(props: ListItemButtonProps<typeof Link, { directLink?: boolean }>) {
    const { directLink, to } = props;
    if (directLink) {
        if (typeof to !== 'string') {
            throw new Error('ListItemLink: "to" has to be a string in case it is a directLink');
        }

        return <ListItemButton component="a" href={to} {...props} />;
    }

    return <ListItemButton component={Link} {...props} />;
}
