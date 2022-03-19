/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import React from 'react';

interface IProps {
    children: React.ReactNode;
    index: any;
    currentIndex: any;
}

/**
 * The TabPanel component is a wrapper component that renders the children only when the index matches
 * the currentIndex prop
 * @param {IProps} props - IProps
 */
export default function TabPanel(props: IProps) {
    const {
        children, index, currentIndex,
    } = props;

    return (
        <div
            role="tabpanel"
            hidden={index !== currentIndex}
            id={`simple-tabpanel-${index}`}
        >
            {currentIndex === index && children}
        </div>
    );
}
