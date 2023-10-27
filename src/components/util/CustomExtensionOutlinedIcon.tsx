/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import createSvgIcon from '@mui/material/utils/createSvgIcon';

const d =
    'M 11 1 C 9.3550302 1 8 2.3550302 8 4 L 4 4 C 2.9069372 4 2 4.9069372 2 6 L 2 12 L 4 12 C 4.5650302 12 5 12.43497 5 13 C 5 13.56503 4.5650302 14 4 14 L 2 14 L 2 20 C 2 21.093063 2.9069372 22 4 22 L 10 22 L 10 20 C 10 19.43497 10.43497 19 11 19 C 11.56503 19 12 19.43497 12 20 L 12 22 L 18 22 C 19.093063 22 20 21.093063 20 20 L 20 16 C 21.64497 16 23 14.64497 23 13 C 23 11.35503 21.64497 10 20 10 L 20 6 C 20 4.9069372 19.093063 4 18 4 L 14 4 C 14 2.3550302 12.64497 1 11 1 z M 11 3 C 11.56503 3 12 3.4349698 12 4 L 12 6 L 18 6 L 18 12 L 20 12 C 20.56503 12 21 12.43497 21 13 C 21 13.56503 20.56503 14 20 14 L 18 14 L 18 20 L 14 20 C 14 18.35503 12.64497 17 11 17 C 9.3550302 17 8 18.35503 8 20 L 4 20 L 4 16 C 5.6449698 16 7 14.64497 7 13 C 7 11.35503 5.6449698 10 4 10 L 4 6 L 10 6 L 10 4 C 10 3.4349698 10.43497 3 11 3 z';

export const ExtensionOutlinedIcon = createSvgIcon(<path d={d} />, 'CustomExtensionOutlined');
