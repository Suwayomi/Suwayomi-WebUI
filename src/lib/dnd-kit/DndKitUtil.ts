/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import {
    MouseSensor,
    PointerSensorOptions,
    Sensor,
    SensorDescriptor,
    TouchSensor,
    useSensor,
    SensorOptions,
    useSensors,
} from '@dnd-kit/core';
import { AbstractPointerSensorOptions } from '@dnd-kit/core/dist/sensors';
import { MediaQuery } from '@/modules/core/utils/MediaQuery.tsx';

export class DndKitUtil {
    static getSensorForDevice(): Sensor<PointerSensorOptions> {
        if (MediaQuery.isTouchDevice()) {
            return TouchSensor;
        }

        return MouseSensor;
    }

    static useSensorsForDevice(options?: AbstractPointerSensorOptions): SensorDescriptor<SensorOptions>[] {
        return useSensors(
            useSensor(DndKitUtil.getSensorForDevice(), {
                ...options,
                activationConstraint: { distance: 15, ...options?.activationConstraint },
            }),
        );
    }
}
