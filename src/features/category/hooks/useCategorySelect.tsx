/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useMemo, useState } from 'react';
import { CategorySelect, CategorySelectProps } from '@/features/category/components/CategorySelect.tsx';

export const useCategorySelect = ({
    mangaId,
    mangaIds,
    onClose,
    addToLibrary,
}: Omit<CategorySelectProps, 'open' | 'onClose'> & Pick<Partial<CategorySelectProps>, 'onClose'>) => {
    const [isCategorySelectOpen, setIsCategorySelectOpen] = useState(false);

    const CategorySelectComponent = useMemo(() => {
        if (!isCategorySelectOpen) {
            return null;
        }

        return (
            <CategorySelect
                open={isCategorySelectOpen}
                onClose={(...args) => {
                    setIsCategorySelectOpen(false);
                    onClose?.(...args);
                }}
                mangaId={mangaId!} // either mangaId or mangaIds is undefined, however, ts is not able to infer it correctly and raises an error
                mangaIds={mangaIds as undefined}
                addToLibrary={addToLibrary}
            />
        );
    }, [mangaId, mangaIds, addToLibrary, onClose, isCategorySelectOpen]);

    return {
        openCategorySelect: setIsCategorySelectOpen,
        CategorySelectComponent,
    };
};
