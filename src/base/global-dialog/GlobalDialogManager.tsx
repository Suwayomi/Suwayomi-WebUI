/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { ComponentProps, ComponentType, ReactNode } from 'react';
import { ControlledPromise } from '@/lib/ControlledPromise.ts';
import { ConfirmDialog } from '@/base/components/modals/ConfirmDialog.tsx';

type Id = string;

export interface DialogProps<T = any> {
    onCancel: () => void;
    onConfirm: (value: T) => void;
}

type DialogPropsParam<Props extends {}> = Omit<Props, keyof DialogProps>;

type ExtractDialogReturnType<T> = T extends DialogProps<infer U> ? U : never;

export class GlobalDialogManager {
    private static subscriberCounter = 0;

    private static queue = new Set<Id>();

    private static dialogs = new Map<Id, ReactNode>();

    private static subscribers = new Map<Id, () => void>();

    private static getNextId = (): Id => {
        this.subscriberCounter = (this.subscriberCounter + 1) % Number.MAX_SAFE_INTEGER;

        return this.subscriberCounter.toString();
    };

    private static notify(): void {
        this.subscribers.forEach((callback) => {
            callback();
        });
    }

    private static add(id: Id, dialog: ReactNode): void {
        this.queue.delete(id);
        this.queue.add(id);
        this.dialogs.set(id, dialog);

        const showDialog = !(this.dialogs.size - 1);
        if (showDialog) {
            this.notify();
        }
    }

    private static remove(id: Id): void {
        this.queue.delete(id);
        this.dialogs.delete(id);
        this.notify();
    }

    private static unsubscribe(key: Id): void {
        this.subscribers.delete(key);
    }

    static subscribe(callback: () => void): () => void {
        const key = this.getNextId();
        this.subscribers.set(key, callback);

        return () => this.unsubscribe(key);
    }

    static getActive(): ReactNode {
        const id = [...this.queue].slice(-1)[0];

        return this.dialogs.get(id);
    }

    static async show<AllProps extends DialogProps>(
        Dialog: ComponentType<AllProps>,
        ...args: HasRequiredKeys<DialogPropsParam<AllProps>> extends true
            ? [props: DialogPropsParam<AllProps>]
            : [props?: DialogPropsParam<AllProps>]
    ): Promise<ExtractDialogReturnType<AllProps>>;
    static async show<AllProps extends DialogProps>(
        id: Id,
        Dialog: ComponentType<AllProps>,
        ...args: HasRequiredKeys<DialogPropsParam<AllProps>> extends true
            ? [props: DialogPropsParam<AllProps>]
            : [props?: DialogPropsParam<AllProps>]
    ): Promise<ExtractDialogReturnType<AllProps>>;
    static async show<AllProps extends DialogProps>(
        idOrDialog: Id | ComponentType<AllProps>,
        dialogOrProps?: ComponentType<AllProps> | DialogPropsParam<AllProps>,
        propsOrNothing?: DialogPropsParam<AllProps> | never,
    ): Promise<ExtractDialogReturnType<AllProps>> {
        const dialogPromise = new ControlledPromise<ExtractDialogReturnType<AllProps>>();

        const wasIdPassed = typeof idOrDialog === 'string';
        const id = wasIdPassed ? idOrDialog : this.getNextId();
        const Dialog = (wasIdPassed ? dialogOrProps : idOrDialog) as ComponentType<AllProps>;
        const props = (wasIdPassed ? propsOrNothing : dialogOrProps) as DialogPropsParam<AllProps> | undefined;

        const dialog = (
            <Dialog
                {...({
                    ...(props ?? {}),
                    onCancel: () => dialogPromise.reject(new Error('Dialog was cancelled')),
                    onConfirm: dialogPromise.resolve.bind(dialogPromise),
                } as unknown as AllProps)}
            />
        );

        this.add(id, dialog);

        try {
            return await dialogPromise.promise;
        } finally {
            this.remove(id);
        }
    }

    static confirm(
        props: DialogPropsParam<ComponentProps<typeof ConfirmDialog>>,
    ): Promise<ExtractDialogReturnType<ComponentProps<typeof ConfirmDialog>>>;
    static confirm(
        id: Id,
        props: DialogPropsParam<ComponentProps<typeof ConfirmDialog>>,
    ): Promise<ExtractDialogReturnType<ComponentProps<typeof ConfirmDialog>>>;
    static confirm(
        idOrProps: Id | DialogPropsParam<ComponentProps<typeof ConfirmDialog>>,
        propsOrNothing?: DialogPropsParam<ComponentProps<typeof ConfirmDialog>>,
    ): Promise<ExtractDialogReturnType<ComponentProps<typeof ConfirmDialog>>> {
        if (typeof idOrProps === 'string') {
            return this.show(idOrProps, ConfirmDialog, propsOrNothing!);
        }

        return this.show(ConfirmDialog, idOrProps);
    }
}
