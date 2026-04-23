/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import PopupState, { bindMenu } from 'material-ui-popup-state';
import { memo, useCallback, useMemo } from 'react';
import { useLongPress } from 'use-long-press';
import type { SingleModeProps } from '@/features/manga/components/MangaActionMenuItems.tsx';
import { MangaActionMenuItems } from '@/features/manga/components/MangaActionMenuItems.tsx';
import { Menu } from '@/base/components/menu/Menu.tsx';
import { useManageMangaLibraryState } from '@/features/manga/hooks/useManageMangaLibraryState.tsx';
import { MangaGridCard } from '@/features/manga/components/cards/MangaGridCard.tsx';
import { MangaListCard } from '@/features/manga/components/cards/MangaListCard.tsx';
import type { MangaCardMode, MangaCardProps } from '@/features/manga/Manga.types.ts';
import { ContinueReadingButton } from '@/features/manga/components/ContinueReadingButton.tsx';
import { MangaBadges } from '@/features/manga/components/MangaBadges.tsx';
import { GridLayout } from '@/base/Base.types.ts';
import { AppRoutes } from '@/base/AppRoute.constants.ts';
import { useMetadataServerSettings } from '@/features/settings/services/ServerSettingsMetadata.ts';
import { makeToast } from '@/base/utils/Toast.ts';
import { t } from '@lingui/core/macro';
import { useParams } from 'react-router-dom';
import { ReactRouter } from '@/lib/react-router/ReactRouter.ts';
import { MigrationOptionsDialog } from '@/features/migration/components/MigrationOptionsDialog.tsx';
import { AwaitableComponent } from 'awaitable-component';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler';
import { MangaMigration } from '@/features/migration/MangaMigration.ts';
import { MANGA_ACTION_TO_TRANSLATION } from '@/features/manga/Manga.constants.ts';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';

const getMangaLinkTo = (
    mode: MangaCardMode,
    mangaId: number,
    sourceId: string | undefined,
    mangaTitle: string,
): string => {
    switch (mode) {
        case 'default':
        case 'source':
        case 'duplicate':
            return AppRoutes.manga.path(mangaId);
        case 'migrate.search':
            return AppRoutes.migrate.childRoutes.singleMangaSearch.path(sourceId ?? '-1', mangaId, mangaTitle);
        case 'migrate.select':
            return '';
        default:
            throw new Error(`getMangaLinkTo: unexpected MangaCardMode "${mode}"`);
    }
};

export const MangaCard = memo((props: MangaCardProps) => {
    const {
        manga,
        gridLayout,
        inLibraryIndicator,
        selected,
        handleSelection,
        mode = 'default',
        onMigrateSelect,
    } = props;
    const { id, firstUnreadChapter, downloadCount, unreadCount } = manga;

    const { mangaId: mangaIdAsString } = useParams<{ mangaId: string }>();
    const migrationSourceMangaId = Number(mangaIdAsString);

    const {
        settings: { showContinueReadingButton },
    } = useMetadataServerSettings();

    const { updateLibraryState, isInLibrary } = useManageMangaLibraryState(manga, mode === 'source');

    const mangaLinkTo = getMangaLinkTo(mode, manga.id, manga.sourceId, manga.title);

    const handleClick = useCallback(
        (event: React.MouseEvent | React.TouchEvent, openMenu?: () => void) => {
            const isDefaultMode = mode === 'default';
            const isSourceMode = mode === 'source';
            const isMigrateSelectMode = mode === 'migrate.select';
            const isSelectionMode = selected !== null;
            const isLongPress = !!openMenu;

            const shouldHandleClick =
                isMigrateSelectMode || isSelectionMode || ((isDefaultMode || isSourceMode) && isLongPress);
            if (!shouldHandleClick) {
                return;
            }

            event.preventDefault();

            if (isSourceMode) {
                updateLibraryState();
                return;
            }

            if (isSelectionMode) {
                handleSelection?.(id, !selected, { selectRange: event.shiftKey });
                return;
            }

            if (isDefaultMode) {
                openMenu?.();
                return;
            }

            if (isMigrateSelectMode) {
                const isBulkMigrationManualSearch = !!onMigrateSelect;
                if (isBulkMigrationManualSearch) {
                    onMigrateSelect(manga);
                    return;
                }

                const migrate = () => {
                    const optionsDialog = AwaitableComponent.showControlled(
                        MigrationOptionsDialog,
                        {
                            mangaIdToMigrateTo: id,
                            isMigrating: false,
                            startMigration: async (options) => {
                                makeToast(t`Migrating manga…`, 'info');

                                optionsDialog.update({ isMigrating: true });

                                try {
                                    try {
                                        await MangaMigration.migrate(migrationSourceMangaId, id, options);
                                    } catch (e) {
                                        makeToast(
                                            t(MANGA_ACTION_TO_TRANSLATION['migrate'].error),
                                            'error',
                                            getErrorMessage(e),
                                        );
                                    }
                                    optionsDialog.submit(options);

                                    ReactRouter.navigate(AppRoutes.manga.path(id), { replace: true });
                                } catch (e) {
                                    optionsDialog.update({ isMigrating: false, startMigration: () => migrate() });
                                }
                            },
                        },
                        { id: `manga-migration-single-manga-${migrationSourceMangaId}-${id}` },
                    );
                    optionsDialog.promise.catch(defaultPromiseErrorHandler('MangaCard::migrate'));
                };
                migrate();
            }
        },
        [mode, selected, updateLibraryState, handleSelection, migrationSourceMangaId],
    );

    const longPressBind = useLongPress(
        useCallback(
            (e: any, { context }: any) => {
                // oxlint-disable-next-line no-param-reassign
                e.shiftKey = true;
                handleClick(e, context as () => void);
            },
            [handleClick],
        ),
    );

    const MangaCardComponent = useMemo(
        () => (gridLayout === GridLayout.List ? MangaListCard : MangaGridCard),
        [gridLayout],
    );

    return (
        <PopupState variant="popover" popupId="manga-card-action-menu">
            {(popupState) => (
                <>
                    <MangaCardComponent
                        {...props}
                        longPressBind={longPressBind}
                        popupState={popupState}
                        handleClick={handleClick}
                        mangaLinkTo={mangaLinkTo}
                        isInLibrary={isInLibrary}
                        inLibraryIndicator={inLibraryIndicator}
                        continueReadingButton={
                            <ContinueReadingButton
                                showContinueReadingButton={showContinueReadingButton && mode === 'default'}
                                chapter={firstUnreadChapter}
                                mangaLinkTo={mangaLinkTo}
                            />
                        }
                        mangaBadges={
                            <MangaBadges
                                inLibraryIndicator={inLibraryIndicator}
                                isInLibrary={isInLibrary}
                                unread={unreadCount}
                                downloadCount={downloadCount}
                                updateLibraryState={updateLibraryState}
                                mode={mode}
                            />
                        }
                    />
                    {!!handleSelection && popupState.isOpen && (
                        <Menu {...bindMenu(popupState)}>
                            {(onClose, setHideMenu) => (
                                <MangaActionMenuItems
                                    manga={manga as SingleModeProps['manga']}
                                    handleSelection={handleSelection}
                                    onClose={onClose}
                                    setHideMenu={setHideMenu}
                                />
                            )}
                        </Menu>
                    )}
                </>
            )}
        </PopupState>
    );
});
