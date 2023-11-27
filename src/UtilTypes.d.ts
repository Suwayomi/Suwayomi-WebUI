/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

type ExtractByKeyValue<T, Key extends keyof T, Value extends T[Key]> = T extends
    | Record<Key, Value>
    | Partial<Record<Key, Value>>
    ? T
    : never;

type RecursivePartial<T> = {
    [P in keyof T]?: T[P] extends (infer U)[]
        ? RecursivePartial<U>[]
        : T[P] extends object | undefined
          ? RecursivePartial<T[P]>
          : T[P];
};

type OptionalProperty<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
