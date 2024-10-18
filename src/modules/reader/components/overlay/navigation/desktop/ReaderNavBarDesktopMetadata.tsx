/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Stack from '@mui/material/Stack';
import { TypographyMaxLines } from '@/modules/core/components/TypographyMaxLines';

export const ReaderNavBarDesktopMetadata = ({
    mangaTitle,
    chapterTitle,
}: {
    mangaTitle: string;
    chapterTitle: string;
}) => (
    <Stack>
        <TypographyMaxLines variant="h6" component="h1" sx={{ textAlign: 'center' }}>
            {mangaTitle}
        </TypographyMaxLines>
        <TypographyMaxLines variant="body1" component="h2" sx={{ textAlign: 'center' }}>
            {chapterTitle}
        </TypographyMaxLines>
    </Stack>
);
