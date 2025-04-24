/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { Link } from 'react-router-dom';
import { AppRoutes } from '@/modules/core/AppRoute.constants.ts';
import { Mangas } from '@/modules/manga/services/Mangas.ts';
import { MangaIdInfo, MangaThumbnailInfo } from '@/modules/manga/Manga.types.ts';
import { MangaType } from '@/lib/graphql/generated/graphql.ts';
import { ListCardAvatar } from '@/modules/core/components/cards/list/ListCardAvatar.tsx';

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
        <ListCardAvatar
            iconUrl={Mangas.getThumbnailUrl({ thumbnailUrl, thumbnailUrlLastFetched })}
            alt={mangaTitle}
            slots={{ spinnerImageProps: { imgStyle: { imageRendering: 'pixelated' } } }}
        />
    </Link>
);
