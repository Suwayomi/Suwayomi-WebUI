/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import PopupState, { bindMenu } from 'material-ui-popup-state';
import { memo, useCallback, useMemo } from 'react';
import type { SingleModeProps } from '@/views/manga/components/MangaActionMenuItems.tsx';
import { MangaActionMenuItems } from '@/views/manga/components/MangaActionMenuItems.tsx';
import { Menu } from '@/views/base/components/menu/Menu.tsx';
import { useManageMangaLibraryState } from '@/controllers/manga/hooks/useManageMangaLibraryState.tsx';
import { MangaGridCard } from '@/views/manga/components/cards/MangaGridCard.tsx';
import { MangaListCard } from '@/views/manga/components/cards/MangaListCard.tsx';
import type { MangaCardMode, MangaCardProps } from '@/models/manga/Manga.types.ts';
import { ContinueReadingButton } from '@/views/manga/components/ContinueReadingButton.tsx';
import { MangaBadges } from '@/views/manga/components/MangaBadges.tsx';
import { GridLayout } from '@/models/base/Base.types.ts';
import { AppRoutes } from '@/models/base/AppRoute.constants.ts';
import { useMetadataServerSettings } from '@/controllers/settings/services/ServerSettingsMetadata.ts';
import { t } from '@lingui/core/macro';
import { useParams } from 'react-router-dom';
import { ReactRouter } from '@/lib/react-router/ReactRouter.ts';
import { MigrationOptionsDialog } from '@/views/migration/components/MigrationOptionsDialog.tsx';
import { AwaitableComponent } from 'awaitable-component';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler';
import { MangaMigration } from '@/controllers/migration/services/MangaMigration.ts';
import { MANGA_ACTION_TO_TRANSLATION } from '@/models/manga/Manga.constants.ts';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';
import { assertIsDefined } from '@/utils/base/Asserts.ts';
import { usePress } from '@/controllers/base/hooks/usePress.ts';
import { Confirmation } from '@/controllers/base/services/AppAwaitableComponent.ts';
import { Notifications } from '@/controllers/base/services/notification/Notifications.ts';

const getMangaLinkTo = (mode: MangaCardMode, mangaId: number): string => {
    switch (mode) {
        case 'default':
        case 'source':
        case 'duplicate':
            return AppRoutes.manga.path(mangaId);
        case 'migrate.select.single':
        case 'migrate.select.bulk':
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

    const mangaLinkTo = getMangaLinkTo(mode, manga.id);

    const handleClick = useCallback(
        (event: React.MouseEvent | React.TouchEvent, openMenu?: () => void) => {
            const isDefaultMode = mode === 'default';
            const isSourceMode = mode === 'source';
            const isMigrationSelectSingleMode = mode === 'migrate.select.single';
            const isMigrationSelectBulkMode = mode === 'migrate.select.bulk';
            const isMigrateSelectMode = isMigrationSelectSingleMode || isMigrationSelectBulkMode;
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
                if (isMigrationSelectBulkMode) {
                    Confirmation.show({
                        title: t`Bulk migration manual search`,
                        message: `Select "${manga.title}" as the migration destination?`,
                        actions: {
                            confirm: {
                                title: t`Select`,
                            },
                            extra: {
                                show: true,
                                title: t`Show entry`,
                                link: AppRoutes.manga.path(id),
                            },
                            autoFocus: 'extra',
                        },
                    }).then(() => {
                        assertIsDefined(onMigrateSelect);
                        onMigrateSelect({ ...manga, missingChapters: undefined });
                    });
                    return;
                }

                const migrate = () => {
                    const optionsDialog = AwaitableComponent.showControlled(
                        MigrationOptionsDialog,
                        {
                            mangaIdToMigrateTo: id,
                            isMigrating: false,
                            startMigration: async (options) => {
                                Notifications.info(t`Migrating manga…`);

                                optionsDialog.update({ isMigrating: true });

                                try {
                                    try {
                                        await MangaMigration.migrateByIdWithFetch(migrationSourceMangaId, id, options);
                                    } catch (e) {
                                        Notifications.error(
                                            t(MANGA_ACTION_TO_TRANSLATION.migrate.error),
                                            getErrorMessage(e),
                                        );
                                    }
                                    optionsDialog.submit(options);

                                    ReactRouter.navigate(AppRoutes.manga.path(id), { replace: true });
                                } catch {
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

    const longPressBind = usePress({
        onLongPress: useCallback(
            (e: any, { context }: any) => {
                e.shiftKey = true;
                handleClick(e, context as () => void);
            },
            [handleClick],
        ),
        onPress: handleClick,
    });

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
