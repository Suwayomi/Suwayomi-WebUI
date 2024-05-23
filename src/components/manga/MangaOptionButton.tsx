/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useTranslation } from 'react-i18next';
import { BaseSyntheticEvent, MouseEvent, TouchEvent, ChangeEvent, useMemo, forwardRef, ForwardedRef } from 'react';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { PopupState } from 'material-ui-popup-state/hooks';
import { bindTrigger } from 'material-ui-popup-state';
import { SelectableCollectionReturnType } from '@/components/collection/useSelectableCollection.ts';
import { TManga } from '@/typings.ts';
import { MediaQuery } from '@/lib/ui/MediaQuery.tsx';

export const MangaOptionButton = forwardRef(
    (
        {
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
        },
        ref: ForwardedRef<HTMLButtonElement | null>,
    ) => {
        const { t } = useTranslation();

        const isTouchDevice = MediaQuery.useIsTouchDevice();

        const bindTriggerProps = useMemo(() => bindTrigger(popupState), [popupState]);

        const preventDefaultAction = (e: BaseSyntheticEvent) => {
            e.stopPropagation();
            e.preventDefault();
        };

        const handleSelectionChange = (e: ChangeEvent, isSelected: boolean) => {
            preventDefaultAction(e);
            handleSelection?.(id, isSelected);
        };

        const handleClick = (e: MouseEvent | TouchEvent) => {
            if (isTouchDevice) return;

            preventDefaultAction(e);
            popupState.open(e);
            bindTriggerProps.onClick(e as any);
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
                        ref={ref}
                        {...bindTriggerProps}
                        onClick={handleClick}
                        onTouchStart={handleClick}
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
                    ref={ref}
                    {...bindTriggerProps}
                    onClick={handleClick}
                    onTouchStart={handleClick}
                    className="manga-option-button"
                    size="small"
                    variant="contained"
                    sx={{
                        minWidth: 'unset',
                        paddingX: '0',
                        paddingY: '2.5px',
                        visibility: popupState.isOpen ? 'visible' : 'hidden',
                        pointerEvents: 'none',
                        '@media not (pointer: fine)': {
                            visibility: 'hidden',
                            pointerEvents: undefined,
                        },
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                >
                    <MoreVertIcon />
                </Button>
            </Tooltip>
        );
    },
);
