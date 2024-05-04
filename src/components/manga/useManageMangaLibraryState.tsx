/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useCategorySelect } from '@/components/navbar/action/useCategorySelect.tsx';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { makeToast } from '@/components/util/Toast.tsx';
import { useMetadataServerSettings } from '@/lib/metadata/metadataServerSettings.ts';
import { Categories } from '@/lib/data/Categories.ts';
import { defaultPromiseErrorHandler } from '@/util/defaultPromiseErrorHandler.ts';
import { Mangas } from '@/lib/data/Mangas.ts';
import { TManga } from '@/typings.ts';
import { awaitConfirmation } from '@/lib/ui/AwaitableDialog.tsx';

export const useManageMangaLibraryState = (
    manga: Pick<TManga, 'id' | 'title' | 'inLibrary'>,
    confirmRemoval: boolean = false,
) => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [isInLibrary, setIsInLibrary] = useState(manga.inLibrary);

    const {
        settings: { showAddToLibraryCategorySelectDialog },
        loading: areSettingsLoading,
    } = useMetadataServerSettings();

    const categories = requestManager.useGetCategories();
    const userCreatedCategories = useMemo(
        () => Categories.getUserCreated(categories.data?.categories.nodes ?? []),
        [categories.data?.categories.nodes],
    );

    const addToLibrary = useCallback(
        (didSubmit: boolean, addToCategories: number[] = [], removeFromCategories: number[] = []) => {
            if (!didSubmit) {
                return;
            }

            requestManager
                .updateManga(manga.id, {
                    updateManga: { inLibrary: true },
                    updateMangaCategories: { addToCategories, removeFromCategories },
                })
                .response.then(() => makeToast(t('library.info.label.added_to_library'), 'success'))
                .then(() => setIsInLibrary(true))
                .catch(() => {
                    makeToast(t('library.error.label.add_to_library'), 'error');
                });
        },
        [manga.id],
    );

    const removeFromLibrary = useCallback(async () => {
        if (confirmRemoval) {
            await awaitConfirmation({
                title: t('global.label.are_you_sure'),
                message: t('manga.action.library.remove.dialog.label.message', { title: manga.title }),
                actions: {
                    confirm: { title: t('global.button.remove') },
                },
            });
        }

        await Mangas.removeFromLibrary([manga.id]);
        setIsInLibrary(false);
    }, [manga.id, confirmRemoval]);

    const { openCategorySelect, CategorySelectComponent } = useCategorySelect({
        mangaId: manga.id,
        addToLibrary: true,
        onClose: addToLibrary,
    });

    const updateLibraryState = useCallback(() => {
        const update = async () => {
            if (isInLibrary) {
                removeFromLibrary().catch(
                    defaultPromiseErrorHandler('useManageMangaLibraryState::updateLibraryState::removeFromLibrary'),
                );
                return;
            }

            if (areSettingsLoading || categories.loading) {
                makeToast(t('global.label.load_in_progress'), 'info');
                return;
            }

            if (categories.error) {
                makeToast(t('category.error.label.request_failure'), 'error');
                categories
                    .refetch()
                    .catch(
                        defaultPromiseErrorHandler(
                            'useManageMangaLibraryState::updateLibraryState: refetch categories',
                        ),
                    );
                return;
            }

            let duplicatedLibraryMangas:
                | Awaited<ReturnType<typeof Mangas.getDuplicateLibraryMangas>['response']>
                | undefined;
            try {
                duplicatedLibraryMangas = await Mangas.getDuplicateLibraryMangas(manga.title).response;
            } catch (e: any) {
                await awaitConfirmation({
                    title: t('global.error.label.failed_to_load_data'),
                    message: t('manga.action.library.add.dialog.duplicate.label.failure', {
                        error: e.message,
                    }),
                    actions: {
                        extra: { show: true, title: t('global.button.retry'), contain: true },
                        confirm: { title: t('global.button.add') },
                    },
                    onExtra: () =>
                        update().catch(
                            defaultPromiseErrorHandler('useManageMangaLibraryState::update: retry duplicate check'),
                        ),
                });
            }

            const doDuplicatesExist = duplicatedLibraryMangas?.data.mangas.totalCount;
            if (doDuplicatesExist) {
                await awaitConfirmation({
                    title: t('global.label.are_you_sure'),
                    message: t('manga.action.library.add.dialog.duplicate.label.info'),
                    actions: {
                        extra: { show: true, title: t('migrate.dialog.action.button.show_entry'), contain: true },
                        confirm: { title: t('global.button.add') },
                    },
                    onExtra: () => navigate(`/manga/${duplicatedLibraryMangas!.data.mangas.nodes[0].id}`),
                });
            }

            const showCategorySelectDialog = showAddToLibraryCategorySelectDialog && !!userCreatedCategories.length;
            if (!showCategorySelectDialog) {
                addToLibrary(true, Categories.getIds(Categories.getDefaults(userCreatedCategories!)));
                return;
            }

            openCategorySelect(true);
        };

        update().catch(defaultPromiseErrorHandler('useManageMangaLibraryState::updateLibraryState'));
    }, [isInLibrary, removeFromLibrary, addToLibrary, areSettingsLoading, categories.loading]);

    return {
        CategorySelectComponent,
        updateLibraryState,
        /**
         * In case of browsing the source, the data has to be fetched via a mutation.
         * Thus, the source browse data never has the updated in library state unless it has to rerender, which does not get
         * triggered by updating the manga in this hook.
         *
         * To work around this issue, the currently known in library state gets returned here
         */
        isInLibrary: Mangas.getFromCache<TManga>(manga.id)?.inLibrary ?? isInLibrary,
    };
};
