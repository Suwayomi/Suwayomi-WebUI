/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import type { DragEndEvent } from '@dnd-kit/core';
import { closestCenter, DndContext } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useLingui } from '@lingui/react/macro';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { translateExtensionLanguage } from '@/features/extension/Extensions.utils.ts';
import { DndSortableItem } from '@/lib/dnd-kit/DndSortableItem.tsx';
import { DndKitUtil } from '@/lib/dnd-kit/DndKitUtil.ts';
import { DndOverlayItem } from '@/lib/dnd-kit/DndOverlayItem.tsx';
import { noOp } from '@/lib/HelperFunctions.ts';
import { ListCardAvatar } from '@/base/components/lists/cards/ListCardAvatar.tsx';
import { ListCardContent } from '@/base/components/lists/cards/ListCardContent.tsx';

export interface SourceItem {
    id: string;
    name: string;
    lang: string;
    iconUrl: string;
    enabled: boolean;
    isCurrentSource: boolean;
}

const SourceCard = ({ source, onToggle }: { source: SourceItem; onToggle: (id: string) => void }) => {
    const { t } = useLingui();

    return (
        <Card sx={{ opacity: source.enabled ? 1 : 0.5 }}>
            <ListCardContent sx={{ justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Checkbox checked={source.enabled} onChange={() => onToggle(source.id)} />
                    <ListCardAvatar
                        iconUrl={requestManager.getValidImgUrlFor(source.iconUrl)}
                        alt={source.name}
                        slots={{ spinnerImageProps: { ignoreQueue: true } }}
                    />
                    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <Typography variant="body1">{source.name}</Typography>
                        <Typography variant="caption" sx={{ display: 'block' }}>
                            {translateExtensionLanguage(source.lang)}
                        </Typography>
                    </Box>
                </Box>
                {source.isCurrentSource && (
                    <Chip size="small" label={t`Current source`} color="primary" variant="outlined" />
                )}
            </ListCardContent>
        </Card>
    );
};

export const MigrationSourcePriorityList = ({
    sources,
    onSourcesChange,
}: {
    sources: SourceItem[];
    onSourcesChange: (sources: SourceItem[]) => void;
}) => {
    const dndSensors = DndKitUtil.useSensorsForDevice();
    const [dndActiveSource, setDndActiveSource] = useState<SourceItem | null>(null);

    const handleToggle = (id: string) => {
        onSourcesChange(sources.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)));
    };

    const onDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setDndActiveSource(null);

        if (!over || active.id === over.id) {
            return;
        }

        const oldIndex = sources.findIndex((s) => s.id === active.id);
        const newIndex = sources.findIndex((s) => s.id === over.id);
        onSourcesChange(arrayMove(sources, oldIndex, newIndex));
    };

    return (
        <DndContext
            sensors={dndSensors}
            collisionDetection={closestCenter}
            onDragStart={(event) => setDndActiveSource(sources.find((s) => s.id === event.active.id) ?? null)}
            onDragEnd={onDragEnd}
            onDragCancel={() => setDndActiveSource(null)}
            onDragAbort={() => setDndActiveSource(null)}
        >
            <Box>
                <SortableContext items={sources} strategy={verticalListSortingStrategy}>
                    {sources.map((source) => (
                        <DndSortableItem key={source.id} id={source.id} isDragging={source.id === dndActiveSource?.id}>
                            <SourceCard source={source} onToggle={handleToggle} />
                        </DndSortableItem>
                    ))}
                </SortableContext>
                <DndOverlayItem isActive={!!dndActiveSource}>
                    <SourceCard source={dndActiveSource!} onToggle={noOp} />
                </DndOverlayItem>
            </Box>
        </DndContext>
    );
};
