/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { Link } from 'react-router-dom';
import Avatar from '@mui/material/Avatar';
import { AppRoutes } from '@/modules/core/AppRoute.constants.ts';
import { SpinnerImage } from '@/modules/core/components/SpinnerImage.tsx';
import { Mangas } from '@/modules/manga/services/Mangas.ts';
import { MangaIdInfo, MangaThumbnailInfo } from '@/modules/manga/Manga.types.ts';
import { MangaType } from '@/lib/graphql/generated/graphql.ts';

export const ChapterCardThumbnail = ({
    mangaId,
    mangaTitle,
    thumbnailUrl,
    thumbnailUrlLastFetched,
}: MangaThumbnailInfo & {
    mangaId: MangaIdInfo['id'];
    mangaTitle: MangaType['title'];
}) => (
    <Link to={AppRoutes.manga.path(mangaId)} style={{ textDecoration: 'none' }}>
        <Avatar
            variant="rounded"
            sx={{
                width: 56,
                height: 56,
                flex: '0 0 auto',
                marginRight: 1,
                background: 'transparent',
            }}
        >
            <SpinnerImage
                imgStyle={{
                    objectFit: 'cover',
                    width: '100%',
                    height: '100%',
                    imageRendering: 'pixelated',
                }}
                spinnerStyle={{ small: true }}
                alt={mangaTitle}
                src={Mangas.getThumbnailUrl({ thumbnailUrl, thumbnailUrlLastFetched })}
            />
        </Avatar>
    </Link>
);
