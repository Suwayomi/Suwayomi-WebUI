/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { LongPressPointerHandlers, LongPressResult } from 'use-long-press/lib/use-long-press.types';
import { PopupState } from 'material-ui-popup-state/hooks';
import { TManga, TPartialManga } from '@/typings.ts';
import { GridLayout } from '@/components/context/LibraryOptionsContext.tsx';
import { SelectableCollectionReturnType } from '@/components/collection/useSelectableCollection.ts';
import { useManageMangaLibraryState } from '@/components/manga/useManageMangaLibraryState.tsx';

export type MangaCardMode = 'default' | 'source' | 'migrate.search' | 'migrate.select' | 'duplicate';

export interface MangaCardProps {
    manga: TPartialManga;
    gridLayout?: GridLayout;
    inLibraryIndicator?: boolean;
    selected?: boolean | null;
    handleSelection?: SelectableCollectionReturnType<TManga['id']>['handleSelection'];
    mode?: MangaCardMode;
}

export type SpecificMangaCardProps = MangaCardProps &
    Pick<ReturnType<typeof useManageMangaLibraryState>, 'isInLibrary'> & {
        longPressBind: LongPressResult<LongPressPointerHandlers>;
        popupState: PopupState;
        handleClick: (event: React.MouseEvent | React.TouchEvent) => void;
        mangaLinkTo: string;
        continueReadingButton: JSX.Element;
        mangaBadges: JSX.Element;
    };
