/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { DraggableProvided } from 'react-beautiful-dnd';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { requestManager } from '@/lib/requests/requests/RequestManager.ts';
import { CategoryType } from '@/lib/graphql/generated/graphql.ts';

export const CategorySettingsCard = ({
    category,
    provided,
    onEdit,
}: {
    category: Pick<CategoryType, 'id' | 'name'>;
    provided: DraggableProvided;
    onEdit: () => void;
}) => {
    const { t } = useTranslation();

    const deleteCategory = () => {
        requestManager.deleteCategory(category.id);
    };

    return (
        <Box sx={{ p: 1, pb: 0 }} {...provided.draggableProps} {...provided.dragHandleProps} ref={provided.innerRef}>
            <Card>
                <CardContent
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: 1.5,
                        '&:last-child': {
                            paddingBottom: 1.5,
                        },
                        gap: 2,
                    }}
                >
                    <DragHandleIcon />
                    <Typography sx={{ flexGrow: 1 }} variant="h6" component="h2">
                        {category.name}
                    </Typography>
                    <Stack sx={{ flexDirection: 'row' }}>
                        <Tooltip title={t('global.button.edit')}>
                            <IconButton component={Box} onClick={onEdit} size="large">
                                <EditIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title={t('chapter.action.download.delete.label.action')}>
                            <IconButton component={Box} onClick={deleteCategory} size="large">
                                <DeleteIcon />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                </CardContent>
            </Card>
        </Box>
    );
};
