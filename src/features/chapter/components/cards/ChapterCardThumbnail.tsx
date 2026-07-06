/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { Link } from 'react-router-dom';
import { AppRoutes } from '@/base/AppRoute.constants.ts';
import { Mangas } from '@/features/manga/services/Mangas.ts';
import type { MangaIdInfo, MangaThumbnailInfo, MangaTitleInfo } from '@/features/manga/Manga.types.ts';
import { ListCardAvatar } from '@/base/components/lists/cards/ListCardAvatar.tsx';
import type { ComponentProps } from 'react';
import merge from 'lodash/fp/merge';

export const ChapterCardThumbnail = ({
    mangaId,
    mangaTitle,
    thumbnailUrl,
    thumbnailUrlLastFetched,
    slots,
}: MangaThumbnailInfo & {
    mangaId: MangaIdInfo['id'];
    mangaTitle: MangaTitleInfo['title'];
    slots?: {
        listCardAvatar?: Omit<ComponentProps<typeof ListCardAvatar>, 'alt' | 'iconUrl'>;
    };
}) => (
    <Link to={AppRoutes.manga.path(mangaId)} style={{ textDecoration: 'none' }}>
        <ListCardAvatar
            iconUrl={Mangas.getThumbnailUrl({ thumbnailUrl, thumbnailUrlLastFetched })}
            alt={mangaTitle}
            slots={merge(
                { spinnerImageProps: { imgStyle: { imageRendering: 'pixelated' } } },
                slots?.listCardAvatar?.slots,
            )}
        />
    </Link>
);
