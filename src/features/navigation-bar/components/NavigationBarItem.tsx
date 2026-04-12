/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { NavbarItem } from '@/features/navigation-bar/NavigationBar.types.ts';
import { ListItemLink } from '@/base/components/lists/ListItemLink.tsx';
import { CustomTooltip } from '@/base/components/CustomTooltip.tsx';
import { TypographyMaxLines } from '@/base/components/texts/TypographyMaxLines.tsx';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { useLocation } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import type { ComponentProps } from 'react';
import { useMemo } from 'react';
import ListItem from '@mui/material/ListItem';
import Badge from '@mui/material/Badge';
import Typography from '@mui/material/Typography';
import { useLingui } from '@lingui/react/macro';
import { useNavBarContext } from '@/features/navigation-bar/NavbarContext.tsx';

export const NavigationBarItem = ({
    path,
    title,
    IconComponent,
    SelectedIconComponent,
    useBadge,
    slots,
    forceCollapsed,
}: NavbarItem & {
    slots?: {
        listItemLink?: Partial<ComponentProps<typeof ListItemLink>>;
    };
    forceCollapsed?: boolean;
}) => {
    const { t } = useLingui();
    const location = useLocation();
    const { isCollapsed: isCollapsedContext } = useNavBarContext();
    const theme = useTheme();
    const badgeInfo = useBadge?.();

    const isCollapsed = forceCollapsed ?? isCollapsedContext;

    const isActive = location.pathname.startsWith(path);
    const Icon = isActive ? SelectedIconComponent : IconComponent;

    const { listItemProps, listItemIconProps } = useMemo(
        () => ({
            listItemProps: isCollapsed ? { p: 0.5, display: 'flex', flexDirection: 'column' } : {},
            listItemIconProps: isCollapsed ? { justifyContent: 'center' } : {},
        }),
        [isCollapsed],
    );

    return (
        <ListItemLink
            {...slots?.listItemLink}
            selected={!isCollapsed && isActive}
            sx={{ p: 0, m: 0, ...slots?.listItemLink?.sx }}
            to={path}
        >
            <CustomTooltip
                title={
                    <>
                        {t(title)}
                        <br />
                        {badgeInfo?.title}
                    </>
                }
                placement="right"
            >
                <ListItem sx={listItemProps}>
                    <ListItemIcon sx={listItemIconProps}>
                        <Badge badgeContent={badgeInfo?.count} color="primary">
                            <Icon
                                sx={{
                                    color: isActive ? 'primary.dark' : undefined,
                                    ...theme.applyStyles('dark', {
                                        color: isActive ? 'primary.light' : undefined,
                                    }),
                                }}
                            />
                        </Badge>
                    </ListItemIcon>

                    <ListItemText
                        primary={
                            <TypographyMaxLines
                                lines={1}
                                variant={isCollapsed ? 'caption' : undefined}
                                sx={{
                                    color: isActive ? 'primary.dark' : undefined,
                                    ...theme.applyStyles('dark', {
                                        color: isActive ? 'primary.light' : undefined,
                                    }),
                                }}
                            >
                                {t(title)}
                            </TypographyMaxLines>
                        }
                        secondary={
                            !isCollapsed && (
                                <Typography variant="caption" color="textSecondary">
                                    {badgeInfo?.title}
                                </Typography>
                            )
                        }
                        sx={{ maxWidth: '100%', m: 0, display: 'flex', flexDirection: 'column' }}
                    />
                </ListItem>
            </CustomTooltip>
        </ListItemLink>
    );
};
