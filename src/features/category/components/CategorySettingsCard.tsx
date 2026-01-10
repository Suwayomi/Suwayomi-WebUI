/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import IconButton from '@mui/material/IconButton';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useLingui } from '@lingui/react/macro';
import { CustomTooltip } from '@/base/components/CustomTooltip.tsx';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { CategoryType } from '@/lib/graphql/generated/graphql.ts';
import { ListCardContent } from '@/base/components/lists/cards/ListCardContent.tsx';

export const CategorySettingsCard = ({
    category,
    onEdit,
}: {
    category: Pick<CategoryType, 'id' | 'name'>;
    onEdit: () => void;
}) => {
    const { t } = useLingui();

    const deleteCategory = () => {
        requestManager.deleteCategory(category.id);
    };

    return (
        <Box sx={{ p: 1, pb: 0 }}>
            <Card>
                <ListCardContent sx={{ gap: 2 }}>
                    <DragHandleIcon />
                    <Typography sx={{ flexGrow: 1 }} variant="h6" component="h2">
                        {category.name}
                    </Typography>
                    <Stack sx={{ flexDirection: 'row' }}>
                        <CustomTooltip title={t`Edit`}>
                            <IconButton component={Box} onClick={onEdit}>
                                <EditIcon />
                            </IconButton>
                        </CustomTooltip>
                        <CustomTooltip title={t`Delete`}>
                            <IconButton component={Box} onClick={deleteCategory}>
                                <DeleteIcon />
                            </IconButton>
                        </CustomTooltip>
                    </Stack>
                </ListCardContent>
            </Card>
        </Box>
    );
};
