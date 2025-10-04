/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import gql from 'graphql-tag';
import { useCategorySelect } from '@/features/category/hooks/useCategorySelect.tsx';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { makeToast } from '@/base/utils/Toast.ts';
import { getMetadataServerSettings } from '@/features/settings/services/ServerSettingsMetadata.ts';
import { Categories } from '@/features/category/services/Categories.ts';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import { Mangas } from '@/features/manga/services/Mangas.ts';
import { GetCategoriesBaseQuery, GetCategoriesBaseQueryVariables, MangaType } from '@/lib/graphql/generated/graphql.ts';
import { GET_CATEGORIES_BASE } from '@/lib/graphql/queries/CategoryQuery.ts';
import { AppRoutes } from '@/base/AppRoute.constants.ts';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';
import { GlobalDialogManager } from '@/base/global-dialog/GlobalDialogManager.tsx';

export const useManageMangaLibraryState = (
    manga: Pick<MangaType, 'id' | 'title'> & Partial<Pick<MangaType, 'inLibrary'>>,
    confirmRemoval: boolean = false,
) => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [isInLibrary, setIsInLibrary] = useState(!!manga.inLibrary);

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
                .catch((e) => {
                    makeToast(t('library.error.label.add_to_library'), 'error', getErrorMessage(e));
                });
        },
        [manga.id],
    );

    const removeFromLibrary = useCallback(async () => {
        if (confirmRemoval) {
            await GlobalDialogManager.confirm(`manga-library-state-remove-${manga.id}`, {
                title: t('global.label.are_you_sure'),
                message: t('manga.action.library.remove.dialog.label.message', { title: manga.title }),
                actions: {
                    confirm: { title: t('global.button.remove') },
                },
            });
        }

        await Mangas.removeFromLibrary([manga.id], true);
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

            let showAddToLibraryCategorySelectDialog: boolean;
            try {
                showAddToLibraryCategorySelectDialog = (await getMetadataServerSettings())
                    .showAddToLibraryCategorySelectDialog;
            } catch (e) {
                makeToast(t('global.error.label.failed_to_load_data'), 'error', getErrorMessage(e));
                return;
            }

            let categories: Awaited<
                ReturnType<
                    typeof requestManager.getCategories<GetCategoriesBaseQuery, GetCategoriesBaseQueryVariables>
                >['response']
            >;
            try {
                categories = await requestManager.getCategories<
                    GetCategoriesBaseQuery,
                    GetCategoriesBaseQueryVariables
                >(GET_CATEGORIES_BASE).response;
            } catch (e) {
                makeToast(t('category.error.label.request_failure'), 'error', getErrorMessage(e));
                return;
            }
            const userCreatedCategories = Categories.getUserCreated(categories.data.categories.nodes);

            let duplicatedLibraryMangas:
                | Awaited<ReturnType<typeof Mangas.getDuplicateLibraryMangas>['response']>
                | undefined;
            try {
                duplicatedLibraryMangas = await Mangas.getDuplicateLibraryMangas(manga.title).response;
            } catch (e) {
                await GlobalDialogManager.confirm(`manga-library-state-add-${manga.id}`, {
                    title: t('global.error.label.failed_to_load_data'),
                    message: t('manga.action.library.add.dialog.duplicate.label.failure', {
                        error: getErrorMessage(e),
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
                await GlobalDialogManager.confirm(`manga-library-state-add-duplicated-${manga.id}`, {
                    title: t('global.label.are_you_sure'),
                    message: t('manga.action.library.add.dialog.duplicate.label.info'),
                    actions: {
                        extra: { show: true, title: t('migrate.dialog.action.button.show_entry'), contain: true },
                        confirm: { title: t('global.button.add') },
                    },
                    onExtra: () => navigate(AppRoutes.manga.path(duplicatedLibraryMangas!.data.mangas.nodes[0].id)),
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
    }, [isInLibrary, removeFromLibrary, addToLibrary]);

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
        isInLibrary:
            Mangas.getFromCache(
                manga.id,
                gql`
                    fragment MangaInLibraryState on MangaType {
                        inLibrary
                    }
                `,
                'MangaInLibraryState',
            )?.inLibrary ?? isInLibrary,
    };
};
