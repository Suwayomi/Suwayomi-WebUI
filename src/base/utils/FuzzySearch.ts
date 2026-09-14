/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/**
 * Typo tolerant matching for the search inputs.
 *
 * Every function expects its inputs to already be normalized via "enhancedCleanup", which lower cases, applies NFKC
 * and collapses everything that is neither a letter nor a number into a single space. Callers normalize a query once
 * and then match it against many candidates, so normalizing in here as well would only be wasted work.
 *
 * A match returns a score, a non match returns null. Scores live in fixed bands so that match quality stays comparable
 * between candidates - a substring match always outranks a subsequence match, which always outranks a match that only
 * came together after correcting a typo:
 *
 * | kind        | range       | example, all against "Tower of God" |
 * |-------------|-------------|-------------------------------------|
 * | substring   | 0.80 - 1.00 | "tower"                             |
 * | subsequence | 0.50 - 0.79 | "tog"                               |
 * | typo        | 0.35 - 0.49 | "twoer"                             |
 */

const SUBSTRING_BASE_SCORE = 0.8;
const SUBSTRING_SCORE_RANGE = 0.2;

const SUBSEQUENCE_BASE_SCORE = 0.5;
const SUBSEQUENCE_SCORE_RANGE = 0.29;

const TYPO_BASE_SCORE = 0.35;
const TYPO_SCORE_RANGE = 0.14;

/** The score of a query that matches a text in full, and of an empty query, which matches everything. */
export const MAX_FUZZY_SCORE = 1;

/**
 * Below this length a subsequence match carries no signal - "abc" can be found scattered across almost any longer
 * text, which would turn the search into noise.
 */
const MIN_SUBSEQUENCE_QUERY_LENGTH = 3;

/**
 * How tightly packed the matched characters have to be, as "query length / length of the matched window". At 0.5 the
 * matched characters have to make up at least half of the text between the first and the last of them, so "nnmchne"
 * still finds "Nano Machine" while "nano" no longer finds "I'm Not That Kind of Talent".
 *
 * A query that is an acronym of the text is exempt, see {@link getSubsequenceScore}.
 */
const MIN_SUBSEQUENCE_DENSITY = 0.5;

/** Correcting typos in a query this short would match unrelated words. */
const MIN_TYPO_QUERY_LENGTH = 4;

const MAX_TYPOS_SHORT_QUERY = 1;
const MAX_TYPOS_LONG_QUERY = 2;
const LONG_QUERY_LENGTH = 7;

const isWordStart = (text: string, index: number): boolean => index === 0 || text[index - 1] === ' ';

const getMaxTypos = (queryLength: number): number => {
    if (queryLength < MIN_TYPO_QUERY_LENGTH) {
        return 0;
    }

    return queryLength < LONG_QUERY_LENGTH ? MAX_TYPOS_SHORT_QUERY : MAX_TYPOS_LONG_QUERY;
};

/**
 * The three rows the edit distance needs at a time, reused across calls.
 *
 * Searching a library scores thousands of candidates against several words each, so allocating the rows per call was
 * by far the largest source of garbage in a search. Sharing them is safe because the distance is computed
 * synchronously and never recurses, so only one call is ever in flight.
 */
const editDistanceRows = [new Int32Array(0), new Int32Array(0), new Int32Array(0)];

const ensureEditDistanceCapacity = (width: number): void => {
    if (editDistanceRows[0].length >= width) {
        return;
    }

    for (let index = 0; index < editDistanceRows.length; index++) {
        editDistanceRows[index] = new Int32Array(width);
    }
};

/**
 * Optimal string alignment distance, which is the Levenshtein distance extended by swaps of two adjacent characters,
 * so that "twoer" is one edit away from "tower" instead of two.
 *
 * Returns null as soon as the distance is known to exceed "maxDistance", which keeps the work per candidate bound to
 * the size of that budget instead of the length of the inputs.
 */
const getBoundedEditDistance = (
    a: string,
    b: string,
    bStart: number,
    bEnd: number,
    maxDistance: number,
): number | null => {
    // "b" is addressed through offsets so that a single word of a text can be compared without slicing it out first
    const bLength = bEnd - bStart;

    if (Math.abs(a.length - bLength) > maxDistance) {
        return null;
    }

    if (!a.length || !bLength) {
        const distance = Math.max(a.length, bLength);
        return distance <= maxDistance ? distance : null;
    }

    const width = bLength + 1;
    ensureEditDistanceCapacity(width);

    // "twoRowsAbove" is only read once "aIndex" is past the first row, so the leftover content of the previous call
    // is never used
    let [twoRowsAbove, rowAbove, row] = editDistanceRows;

    for (let bIndex = 0; bIndex < width; bIndex++) {
        rowAbove[bIndex] = bIndex;
    }

    for (let aIndex = 1; aIndex <= a.length; aIndex++) {
        row[0] = aIndex;

        let smallestInRow = aIndex;
        for (let bIndex = 1; bIndex < width; bIndex++) {
            const substitutionCost = a[aIndex - 1] === b[bStart + bIndex - 1] ? 0 : 1;

            let distance = Math.min(
                rowAbove[bIndex] + 1, // deletion
                row[bIndex - 1] + 1, // insertion
                rowAbove[bIndex - 1] + substitutionCost, // substitution
            );

            const isSwapOfAdjacentCharacters =
                aIndex > 1 &&
                bIndex > 1 &&
                a[aIndex - 1] === b[bStart + bIndex - 2] &&
                a[aIndex - 2] === b[bStart + bIndex - 1];
            if (isSwapOfAdjacentCharacters) {
                distance = Math.min(distance, twoRowsAbove[bIndex - 2] + 1);
            }

            row[bIndex] = distance;
            smallestInRow = Math.min(smallestInRow, distance);
        }

        // every following row can only grow, so the budget can no longer be met
        if (smallestInRow > maxDistance) {
            return null;
        }

        // the row that is about to fall out of the window becomes the one that is written next
        const reusableRow = twoRowsAbove;
        twoRowsAbove = rowAbove;
        rowAbove = row;
        row = reusableRow;
    }

    const distance = rowAbove[bLength];
    return distance <= maxDistance ? distance : null;
};

/**
 * Scores the query appearing in the text as is. Matching at the start of the text scores higher than matching at the
 * start of a word, which scores higher than matching in the middle of one, and the less of the text is left over, the
 * better - which is what makes "Tower of God" beat "The Tower of Babel and the Tower of Pisa" for the query "tower".
 */
const getSubstringScore = (query: string, text: string): number | null => {
    const index = text.indexOf(query);

    if (index === -1) {
        return null;
    }

    const positionRating = (() => {
        if (index === 0) {
            return 1;
        }

        return isWordStart(text, index) ? 0.6 : 0.2;
    })();
    const coverageRating = query.length / text.length;

    return SUBSTRING_BASE_SCORE + SUBSTRING_SCORE_RANGE * (0.6 * positionRating + 0.4 * coverageRating);
};

/**
 * Whether the query spells out the initial letters of consecutive words of the text, e.g. "tog" for "Tower of God" or
 * "tbate" for "The Beginning After the End".
 *
 * Walking the words rather than the characters is what separates a deliberate acronym from a few letters that happen
 * to start some words somewhere in a long text - "abc" is not an acronym of "a very big long text with characters",
 * even though each of its characters does start a word.
 */
const isAcronymOfConsecutiveWords = (query: string, text: string): boolean => {
    let wordStart = 0;

    while (wordStart < text.length) {
        let queryIndex = 0;
        let currentWordStart = wordStart;

        while (
            queryIndex < query.length &&
            currentWordStart < text.length &&
            text[currentWordStart] === query[queryIndex]
        ) {
            queryIndex++;

            const separator = text.indexOf(' ', currentWordStart);
            if (separator === -1) {
                currentWordStart = text.length;
                break;
            }

            currentWordStart = separator + 1;
        }

        if (queryIndex === query.length) {
            return true;
        }

        const separator = text.indexOf(' ', wordStart);
        if (separator === -1) {
            return false;
        }

        wordStart = separator + 1;
    }

    return false;
};

/**
 * Scores every character of the query appearing in the text in order, but not necessarily next to each other, which is
 * what lets "tog" find "Tower of God".
 *
 * The characters are located twice, once forwards to find the end of a match and once backwards from that end, because
 * the backwards pass yields the smallest window that still contains the query. Scoring the smallest window keeps a
 * stray character late in the text from dragging an otherwise tight match down.
 */
const getSubsequenceScore = (query: string, text: string): number | null => {
    if (query.length < MIN_SUBSEQUENCE_QUERY_LENGTH) {
        return null;
    }

    let queryIndex = 0;
    let end = -1;
    for (let textIndex = 0; textIndex < text.length && queryIndex < query.length; textIndex++) {
        if (text[textIndex] === query[queryIndex]) {
            queryIndex++;
            end = textIndex;
        }
    }

    const isMatch = queryIndex === query.length;
    if (!isMatch) {
        return null;
    }

    // the matched positions are only needed to count the ones that start a word and to find the first of them, both of
    // which can be tracked while walking backwards, so none of them have to be collected
    let start = end;
    let wordStartCount = 0;
    let remainingQueryIndex = query.length - 1;
    for (let textIndex = end; textIndex >= 0 && remainingQueryIndex >= 0; textIndex--) {
        if (text[textIndex] === query[remainingQueryIndex]) {
            start = textIndex;
            wordStartCount += isWordStart(text, textIndex) ? 1 : 0;
            remainingQueryIndex--;
        }
    }

    const density = query.length / (end - start + 1);

    // a scattered match is coincidence rather than intent - without a floor "nano" is found in "I'm Not That Kind of
    // Talent". An acronym is the one kind of sparse match that is deliberate, so it is allowed through.
    if (density < MIN_SUBSEQUENCE_DENSITY && !isAcronymOfConsecutiveWords(query, text)) {
        return null;
    }

    const wordStartRating = wordStartCount / query.length;

    return SUBSEQUENCE_BASE_SCORE + SUBSEQUENCE_SCORE_RANGE * (0.7 * density + 0.3 * wordStartRating);
};

/**
 * Scores the query against each word of the text, allowing for a small number of typos. Only whole words are compared,
 * since allowing edits anywhere in a long text would match nearly everything.
 */
const getTypoScore = (query: string, text: string): number | null => {
    const maxTypos = getMaxTypos(query.length);

    if (!maxTypos) {
        return null;
    }

    // the words are walked through by index instead of splitting the text, which would allocate an array and a string
    // per word for every candidate of a search
    let smallestDistance: number | null = null;
    let wordStart = 0;
    while (wordStart <= text.length) {
        const nextSeparator = text.indexOf(' ', wordStart);
        const wordEnd = nextSeparator === -1 ? text.length : nextSeparator;

        const distance = getBoundedEditDistance(query, text, wordStart, wordEnd, maxTypos);

        if (distance !== null && (smallestDistance === null || distance < smallestDistance)) {
            smallestDistance = distance;

            if (smallestDistance === 0) {
                break;
            }
        }

        if (nextSeparator === -1) {
            break;
        }

        wordStart = nextSeparator + 1;
    }

    if (smallestDistance === null) {
        return null;
    }

    return TYPO_BASE_SCORE + TYPO_SCORE_RANGE * (1 - smallestDistance / (maxTypos + 1));
};

/** The part of {@link getTermScore} that is left once the term is known to not occur in the text as is. */
const getInexactTermScore = (term: string, text: string): number | null =>
    getSubsequenceScore(term, text) ?? getTypoScore(term, text);

const getTermScore = (term: string, text: string): number | null =>
    getSubstringScore(term, text) ?? getInexactTermScore(term, text);

/**
 * Scores how well "query" matches "text", from {@link MAX_FUZZY_SCORE} for an exact match down to 0.35 for a match
 * that needed a typo corrected. Returns null when the two do not match at all.
 *
 * A query of multiple words matches when every one of its words matches somewhere in the text, in any order, so that
 * "god tower" still finds "Tower of God". Both inputs are expected to be normalized, see the module documentation.
 */
export const getFuzzyScore = (query: string, text: string): number | null => {
    if (!query) {
        return MAX_FUZZY_SCORE;
    }

    if (!text) {
        return null;
    }

    // a query that occurs as is always outranks the same query matched word by word
    const substringScore = getSubstringScore(query, text);
    if (substringScore !== null) {
        return substringScore;
    }

    // a normalized query of a single word is the common case and must not pay for splitting itself up - the substring
    // score above is the one a term would start with, so only the remaining kinds of match are left to try
    if (query.indexOf(' ') === -1) {
        return getInexactTermScore(query, text);
    }

    const terms = query.split(' ');

    let totalScore = 0;
    for (const term of terms) {
        const score = getTermScore(term, text);

        if (score === null) {
            return null;
        }

        totalScore += score;
    }

    return totalScore / terms.length;
};
