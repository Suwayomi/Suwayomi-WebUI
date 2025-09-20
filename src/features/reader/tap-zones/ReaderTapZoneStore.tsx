/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { ImmerStateCreator } from '@/lib/zustand/Zustand.types.ts';
import { TReaderTapZoneContext } from '@/features/reader/tap-zones/TapZoneLayout.types.ts';

export interface ReaderTapZoneStoreSlice {
    tapZone: TReaderTapZoneContext & {
        reset: () => void;
    };
}

const DEFAULT_STATE = {
    showPreview: false,
} satisfies Pick<ReaderTapZoneStoreSlice['tapZone'], 'showPreview'>;

export const createReaderTapZoneStoreSlice = <T extends ReaderTapZoneStoreSlice>(
    ...[set, get]: Parameters<ImmerStateCreator<T>>
): ReaderTapZoneStoreSlice => ({
    tapZone: {
        ...DEFAULT_STATE,
        setShowPreview: (showPreview) =>
            set((draft) => {
                draft.tapZone.showPreview = showPreview;
            }),
        reset: () => set(() => ({ tapZone: { ...get().tapZone, ...DEFAULT_STATE } })),
    },
});
