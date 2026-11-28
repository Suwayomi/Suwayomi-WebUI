/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { expect, test } from 'bun:test';
import { Priority, Queue } from '@/lib/Queue.ts';
import { ControlledPromise } from '@/lib/ControlledPromise.ts';

const nextTick = () =>
    new Promise((resolve) => {
        setTimeout(resolve);
    });

test('clearing the queue rejects pending items without crashing their scheduled run', async () => {
    const queue = new Queue(1);
    const blocker = new ControlledPromise();

    queue.enqueue('running', () => blocker.promise);
    const pending = queue.enqueue('pending', () => 1);
    await nextTick();

    queue.clear();
    await expect(pending.promise).rejects.toThrow('Queue::clear');

    // the scheduled run of the cleared item happens now; bun fails the run on an unhandled error
    blocker.resolve();
    await nextTick();
});

test('runs pending items by priority and in order of arrival within a priority', async () => {
    const queue = new Queue(1);
    const blocker = new ControlledPromise();
    const order: string[] = [];

    queue.enqueue('running', () => blocker.promise);
    await nextTick();
    const items = (
        [
            ['low', Priority.LOW],
            ['first', Priority.HIGH],
            ['normal', Priority.NORMAL],
            ['second', Priority.HIGH],
        ] as const
    ).map(([name, priority]) => queue.enqueue(name, () => order.push(name), priority).promise);

    blocker.resolve();
    await Promise.all(items);

    expect(order).toEqual(['first', 'second', 'normal', 'low']);
});
