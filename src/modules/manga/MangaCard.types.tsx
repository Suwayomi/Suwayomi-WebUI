/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { LongPressPointerHandlers, LongPressResult } from 'use-long-press/lib/use-long-press.types';
import { PopupState } from 'material-ui-popup-state/hooks';
import { GridLayout } from '@/components/context/LibraryOptionsContext.tsx';
import { SelectableCollectionReturnType } from '@/modules/collection/hooks/useSelectableCollection.ts';
import { useManageMangaLibraryState } from '@/modules/manga/hooks/useManageMangaLibraryState.tsx';
import { MangaThumbnailInfo } from '@/modules/manga/services/Mangas.ts';
import { ChapterType, MangaType } from '@/lib/graphql/generated/graphql.ts';
import { SingleModeProps } from '@/modules/manga/components/MangaActionMenuItems.tsx';
import { IReaderSettings } from '@/typings';

export type MangaCardMode = 'default' | 'source' | 'migrate.search' | 'migrate.select' | 'duplicate';

type MangaCardBaseProps = Pick<MangaType, 'id' | 'title' | 'sourceId'> &
    Omit<SingleModeProps['manga'], 'downloadCount' | 'unreadCount' | 'chapters'> &
    Partial<Pick<MangaType, 'inLibrary' | 'downloadCount' | 'unreadCount'>> & {
        firstUnreadChapter?: Pick<ChapterType, 'id' | 'sourceOrder'> | null;
    };

type MangaCardSpecificProps = MangaCardBaseProps & MangaThumbnailInfo;

export interface MangaCardProps {
    manga: MangaCardBaseProps;
    gridLayout?: GridLayout;
    inLibraryIndicator?: boolean;
    selected?: boolean | null;
    handleSelection?: SelectableCollectionReturnType<MangaType['id']>['handleSelection'];
    mode?: MangaCardMode;
}

export type SpecificMangaCardProps = Omit<MangaCardProps, 'manga'> &
    Pick<ReturnType<typeof useManageMangaLibraryState>, 'isInLibrary'> & {
        manga: MangaCardSpecificProps;
        longPressBind: LongPressResult<LongPressPointerHandlers>;
        popupState: PopupState;
        handleClick: (event: React.MouseEvent | React.TouchEvent) => void;
        mangaLinkTo: string;
        continueReadingButton: JSX.Element;
        mangaBadges: JSX.Element;
    };

export type MangaMetadataKeys = keyof IReaderSettings;
