/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useCallback, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import type { DragEndEvent } from '@dnd-kit/core';
import { closestCenter, DndContext } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useLingui } from '@lingui/react/macro';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { DndSortableItem } from '@/lib/dnd-kit/DndSortableItem.tsx';
import { DndKitUtil } from '@/lib/dnd-kit/DndKitUtil.ts';
import { ListCardAvatar } from '@/base/components/lists/cards/ListCardAvatar.tsx';
import { ListCardContent } from '@/base/components/lists/cards/ListCardContent.tsx';
import type { SourceItem } from '@/features/migration/Migration.types.ts';
import type { SourceIdInfo } from '@/features/source/Source.types.ts';
import type { SelectableCollectionReturnType } from '@/base/collection/hooks/useSelectableCollection.ts';
import { assertIsDefined } from '@/base/Asserts.ts';
import { VirtuosoUtil } from '@/lib/virtuoso/Virtuoso.util.tsx';
import { StyledGroupedVirtuoso } from '@/base/components/virtuoso/StyledGroupedVirtuoso.tsx';
import { StyledGroupHeader } from '@/base/components/virtuoso/StyledGroupHeader.tsx';
import { DndOverlayItem } from '@/lib/dnd-kit/DndOverlayItem';
import { noOp } from '@/lib/HelperFunctions';
import CardActionArea from '@mui/material/CardActionArea';
import { StyledGroupItemWrapper } from '@/base/components/virtuoso/StyledGroupItemWrapper.tsx';
import DragHandle from '@mui/icons-material/DragHandle';
import { languageCodeToName } from '@/base/utils/Languages.ts';
import { DEFAULT_FULL_FAB_HEIGHT } from '@/base/components/buttons/StyledFab.tsx';
import Stack from '@mui/material/Stack';

const SourceCard = ({
    source,
    onToggle,
    isCurrentSource,
    isSelected,
    isDragging,
}: {
    source: SourceItem;
    onToggle: (id: SourceIdInfo['id']) => void;
    isCurrentSource: boolean;
    isSelected: boolean;
    isDragging?: boolean;
}) => {
    const { t } = useLingui();

    return (
        <StyledGroupItemWrapper>
            <Card>
                <CardActionArea onClick={() => onToggle(source.id)}>
                    <ListCardContent sx={{ justifyContent: 'space-between' }}>
                        <Stack sx={{ flexFlow: 'row', gap: 1, alignItems: 'center' }}>
                            <ListCardAvatar
                                iconUrl={requestManager.getValidImgUrlFor(source.iconUrl)}
                                alt={source.name}
                                slots={{ spinnerImageProps: { ignoreQueue: true } }}
                            />
                            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <Typography variant="h6" component="h3">
                                    {source.name}
                                </Typography>
                                <Typography variant="caption">{languageCodeToName(source.lang)}</Typography>
                            </Box>
                        </Stack>
                        <Stack sx={{ flexDirection: 'row', gap: 4 }}>
                            {isCurrentSource && (
                                <Chip size="small" label={t`Current source`} color="primary" variant="outlined" />
                            )}
                            {isSelected && (
                                <Box>
                                    <DragHandle sx={{ mr: 2, cursor: isDragging ? 'grabbing' : 'grab' }} />
                                </Box>
                            )}
                        </Stack>
                    </ListCardContent>
                </CardActionArea>
            </Card>
        </StyledGroupItemWrapper>
    );
};

export const MigrationSourceList = ({
    sources,
    handleSelection,
    selectedSourceIds,
    handlePriorityChange,
    currentSourceId,
}: {
    sources: SourceItem[];
    handleSelection: SelectableCollectionReturnType<SourceIdInfo['id'], 'default'>['handleSelection'];
    handlePriorityChange: (oldIndex: number, newIndex: number) => void;
    selectedSourceIds: SourceIdInfo['id'][];
    currentSourceId: SourceIdInfo['id'] | null;
}) => {
    const { t } = useLingui();
    const dndSensors = DndKitUtil.useSensorsForDevice();
    const [dndActiveSource, setDndActiveSource] = useState<SourceItem | null>(null);

    const selectedSources = useMemo(
        () =>
            selectedSourceIds.map((sourceId) => {
                const selectedSource = sources.find((source) => source.id === sourceId);

                assertIsDefined(selectedSource);
                return selectedSource;
            }),
        [sources, selectedSourceIds],
    );
    const unselectedSources = useMemo(
        () => sources.filter((source) => !selectedSourceIds.includes(source.id)),
        [sources, selectedSourceIds],
    );
    const allSources = useMemo(() => [...selectedSources, ...unselectedSources], [selectedSources, unselectedSources]);
    const groupedSourcesBySelectionState = useMemo<[boolean, SourceItem[]][]>(
        () =>
            [selectedSources.length ? [true, selectedSources] : undefined, [false, unselectedSources]].filter(
                (entry) => entry !== undefined,
            ) as [boolean, SourceItem[]][],
        [selectedSources, unselectedSources],
    );

    const groupCounts = useMemo(
        () => groupedSourcesBySelectionState.map(([, sourcesOfGroup]) => sourcesOfGroup.length),
        [groupedSourcesBySelectionState],
    );
    const computeItemKey = VirtuosoUtil.useCreateGroupedComputeItemKey(
        groupCounts,
        useCallback(
            (index) => String(groupedSourcesBySelectionState[index][VirtuosoUtil.GROUP]),
            [groupedSourcesBySelectionState],
        ),
        useCallback((index) => allSources[index].id, [groupedSourcesBySelectionState]),
    );

    const handleToggle = useCallback(
        (id: SourceIdInfo['id']) => {
            handleSelection(id, !selectedSourceIds.includes(id));
        },
        [handleSelection, selectedSourceIds],
    );

    const onDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setDndActiveSource(null);

        if (!over || active.id === over.id) {
            return;
        }

        const oldIndex = selectedSourceIds.indexOf(String(active.id));
        const newIndex = selectedSourceIds.indexOf(String(over.id));
        handlePriorityChange(oldIndex, newIndex);
    };

    return (
        <DndContext
            sensors={dndSensors}
            collisionDetection={closestCenter}
            onDragStart={(event) => setDndActiveSource(sources.find((source) => source.id === event.active.id) ?? null)}
            onDragEnd={onDragEnd}
            onDragCancel={() => setDndActiveSource(null)}
            onDragAbort={() => setDndActiveSource(null)}
        >
            <SortableContext items={selectedSources} strategy={verticalListSortingStrategy}>
                <StyledGroupedVirtuoso
                    style={{ marginBottom: DEFAULT_FULL_FAB_HEIGHT }}
                    persistKey="migration-source-selection"
                    groupCounts={groupCounts}
                    computeItemKey={computeItemKey}
                    groupContent={(index) => {
                        const [group] = groupedSourcesBySelectionState[index];

                        return (
                            <StyledGroupHeader
                                isFirstItem={!index}
                                sx={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    pr: 1,
                                }}
                            >
                                <Typography variant="h5" component="h2">
                                    {group ? t`Selected` : t`Available`}
                                </Typography>

                                {group && !!selectedSources.length && (
                                    <Typography variant="body2" color="text.secondary">
                                        {t`Drag to prioritize`}
                                    </Typography>
                                )}
                            </StyledGroupHeader>
                        );
                    }}
                    itemContent={(index, groupIndex) => {
                        const [isSelected] = groupedSourcesBySelectionState[groupIndex];
                        const source = allSources[index];

                        const sourceCard = (
                            <SourceCard
                                source={source}
                                onToggle={handleToggle}
                                isCurrentSource={source.id === currentSourceId}
                                isSelected={isSelected}
                            />
                        );

                        if (isSelected) {
                            return (
                                <DndSortableItem
                                    key={source.id}
                                    id={source.id}
                                    isDragging={source.id === dndActiveSource?.id}
                                >
                                    {sourceCard}
                                </DndSortableItem>
                            );
                        }

                        return sourceCard;
                    }}
                />
            </SortableContext>
            <DndOverlayItem isActive={!!dndActiveSource}>
                <SourceCard
                    source={dndActiveSource!}
                    onToggle={noOp}
                    isCurrentSource={dndActiveSource?.id === currentSourceId}
                    isSelected
                    isDragging
                />
            </DndOverlayItem>
        </DndContext>
    );
};
