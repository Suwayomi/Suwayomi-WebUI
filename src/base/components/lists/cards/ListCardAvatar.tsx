/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Avatar, { AvatarProps } from '@mui/material/Avatar';
import { SpinnerImage, SpinnerImageProps } from '@/base/components/SpinnerImage.tsx';

export const ListCardAvatar = ({
    iconUrl,
    alt,
    slots,
}: {
    iconUrl: string;
    alt: string;
    slots?: { avatarProps?: Partial<AvatarProps>; spinnerImageProps?: Partial<SpinnerImageProps> };
}) => (
    <Avatar
        variant="rounded"
        alt={alt}
        {...slots?.avatarProps}
        sx={{
            width: 56,
            height: 56,
            flex: '0 0 auto',
            background: 'transparent',
            ...slots?.avatarProps?.sx,
        }}
    >
        <SpinnerImage
            alt={alt}
            src={iconUrl}
            {...slots?.spinnerImageProps}
            spinnerStyle={{ small: true, ...slots?.spinnerImageProps?.spinnerStyle }}
            imgStyle={{ objectFit: 'cover', width: '100%', height: '100%', ...slots?.spinnerImageProps?.imgStyle }}
        />
    </Avatar>
);
