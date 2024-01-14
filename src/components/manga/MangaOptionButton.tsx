/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useTranslation } from 'react-i18next';
import React, { TouchEvent, useMemo } from 'react';
import { Button, Tooltip } from '@mui/material';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { PopupState } from 'material-ui-popup-state/es/hooks';
import { bindTrigger } from 'material-ui-popup-state';
import { isMobile } from 'react-device-detect';
import { SelectableCollectionReturnType } from '@/components/collection/useSelectableCollection.ts';
import { TManga } from '@/typings.ts';

export const MangaOptionButton = ({
    id,
    selected,
    handleSelection,
    asCheckbox = false,
    popupState,
}: {
    id: number;
    selected?: boolean | null;
    handleSelection?: SelectableCollectionReturnType<TManga['id']>['handleSelection'];
    asCheckbox?: boolean;
    popupState: PopupState;
}) => {
    const { t } = useTranslation();

    const bindTriggerProps = useMemo(() => bindTrigger(popupState), [popupState]);

    const preventDefaultAction = (e: React.BaseSyntheticEvent<unknown>) => {
        e.stopPropagation();
        e.preventDefault();
    };

    const handleSelectionChange = (e: React.BaseSyntheticEvent<unknown>, isSelected: boolean) => {
        preventDefaultAction(e);
        handleSelection?.(id, isSelected);
    };

    const handleClick = (e: React.BaseSyntheticEvent<unknown>) => {
        preventDefaultAction(e);
        bindTriggerProps.onClick(e as any);
    };

    const handleTouchStart = (e: React.BaseSyntheticEvent<unknown>) => {
        preventDefaultAction(e);
        bindTriggerProps.onTouchStart(e as TouchEvent);
    };

    if (!handleSelection) {
        return null;
    }

    const isSelected = selected !== null;
    if (isSelected) {
        if (!asCheckbox) {
            return null;
        }

        return (
            <Tooltip title={t(selected ? 'global.button.deselect' : 'global.button.select')}>
                <Checkbox checked={selected} onMouseDown={preventDefaultAction} onChange={handleSelectionChange} />
            </Tooltip>
        );
    }

    if (asCheckbox) {
        return (
            <Tooltip title={t('global.button.options')}>
                <IconButton
                    {...bindTriggerProps}
                    onClick={handleClick}
                    onTouchStart={handleTouchStart}
                    aria-label="more"
                    size="large"
                    onMouseDown={preventDefaultAction}
                >
                    <MoreVertIcon />
                </IconButton>
            </Tooltip>
        );
    }

    return (
        <Tooltip title={t('global.button.options')}>
            <Button
                {...bindTriggerProps}
                onClick={handleClick}
                onTouchStart={handleTouchStart}
                className="manga-option-button"
                size="small"
                variant="contained"
                sx={{
                    minWidth: 'unset',
                    paddingX: '0',
                    paddingY: '2.5px',
                    visibility: popupState.isOpen || isMobile ? 'visible' : 'hidden',
                    pointerEvents: isMobile ? undefined : 'none',
                }}
                onMouseDown={(e) => e.stopPropagation()}
            >
                <MoreVertIcon />
            </Button>
        </Tooltip>
    );
};
