/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Box from '@mui/material/Box';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { FC } from 'react';
import type {
    NovelFontFamily,
    NovelReaderSettingsState,
    NovelReaderThemeColors,
} from '@/features/novel-reader/stores/NovelReaderSettingsStore.ts';
import { requestManager } from '@/lib/requests/RequestManager.ts';

export interface NovelReaderIframeProps {
    html: string;
    customCss?: string | null;
    customJs?: string | null;
    settings: Pick<
        NovelReaderSettingsState,
        'fontFamily' | 'fontSize' | 'lineHeight' | 'maxWidth' | 'textAlign' | 'margin' | 'paragraphSpacing'
    >;
    themeColors?: NovelReaderThemeColors;
    onToggleControls?: () => void;
    onKeyDown?: (key: string) => void;
    onHeightChange?: (height: number) => void;
    onWheelUp?: () => void;
    onWheelDown?: () => void;
}

const MAX_IFRAME_HEIGHT = 10_000_000;

function prepareChapterHtml(html: string): string {
    const doc = new DOMParser().parseFromString(html, 'text/html');

    doc.querySelectorAll<HTMLImageElement>(
        'img[data-lnreader-image-url][data-lnreader-chapter-id][data-lnreader-image-token]',
    ).forEach((image) => {
        const imageUrl = image.dataset.lnreaderImageUrl;
        const chapterId = Number(image.dataset.lnreaderChapterId);
        const imageToken = image.dataset.lnreaderImageToken;

        image.removeAttribute('data-lnreader-image-url');
        image.removeAttribute('data-lnreader-chapter-id');
        image.removeAttribute('data-lnreader-image-token');

        if (!imageUrl || !imageToken || !Number.isSafeInteger(chapterId) || chapterId <= 0) {
            return;
        }

        try {
            const url = new URL(imageUrl);
            if ((url.protocol === 'http:' || url.protocol === 'https:') && !url.username && !url.password) {
                const query = new URLSearchParams({ url: imageUrl, token: imageToken });
                image.setAttribute('src', requestManager.getValidUrlFor(`chapter/${chapterId}/illustration?${query}`));
            }
        } catch {
            // Ignore malformed illustration URLs.
        }
    });

    return doc.body.innerHTML;
}

export const FONT_FAMILY_MAP: Record<NovelFontFamily, string> = {
    'sans-serif': '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    serif: 'Georgia, Cambria, "Times New Roman", Times, serif',
    monospace: 'Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    opendyslexic: 'OpenDyslexic, "Comic Sans MS", cursive, sans-serif',
};

export function generateIframeDoc(
    html: string,
    customCss: string | null | undefined,
    customJs: string | null | undefined,
    colors: NovelReaderThemeColors,
    fontFamily: NovelFontFamily,
    fontSize: number,
    lineHeight: number,
    maxWidth: number,
    textAlign: string,
    margin: number,
    paragraphSpacing: number,
): string {
    const fontStr = FONT_FAMILY_MAP[fontFamily];

    // Sanitize any potential </script> escape sequence in customJs
    const safeCustomJs = customJs ? customJs.replaceAll(/<\/script>/gi, '<\\/script>') : '';

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src http: https: data: blob:; style-src 'unsafe-inline'; script-src 'unsafe-inline';">
  <style id="base-style">
    :root {
      --bg-color: ${colors.background};
      --text-color: ${colors.text};
      --link-color: ${colors.link};
      --font-family: ${fontStr};
      --font-size: ${fontSize}px;
      --line-height: ${lineHeight};
      --max-width: ${maxWidth}px;
      --text-align: ${textAlign};
      --margin: ${margin}px;
      --para-spacing: ${paragraphSpacing}em;
    }

    * {
      box-sizing: border-box;
    }

    html, body {
      margin: 0;
      padding: 0;
      overflow: hidden;
      height: auto;
      background-color: var(--bg-color);
      color: var(--text-color);
      font-family: var(--font-family);
      font-size: var(--font-size);
      line-height: var(--line-height);
      text-align: var(--text-align);
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      word-wrap: break-word;
      overflow-wrap: break-word;
    }

    a {
      color: var(--link-color);
      text-decoration: underline;
    }

    img {
      max-width: 100%;
      height: auto;
      display: block;
      margin: 1.5em auto;
      border-radius: 4px;
    }

    p {
      margin-top: 0;
      margin-bottom: var(--para-spacing);
    }

    .chapter-container {
      max-width: var(--max-width);
      margin: 0 auto;
      padding: calc(var(--margin) + 24px) var(--margin) calc(var(--margin) + 32px) var(--margin);
    }
  </style>
  ${customCss ? `<style id="custom-css">${customCss}</style>` : ''}
</head>
<body>
  <div class="chapter-container" id="chapter-container">
    ${html}
    <div id="novel-chapter-end-anchor" style="text-align: center; padding: 24px 0 12px; opacity: 0.45; font-size: 0.85em; user-select: none;">
      --- End of Chapter ---
    </div>
  </div>

  <script>
    (function() {
      function reportHeight() {
        const doc = document.documentElement;
        const body = document.body;
        const height = Math.max(
          doc.scrollHeight || 0,
          body.scrollHeight || 0,
          doc.offsetHeight || 0
        );
        if (height > 0) {
          try {
            window.parent.postMessage({ type: 'NOVEL_READER_RESIZE', height: height }, '*');
          } catch(e) {}
        }
      }

      window.addEventListener('DOMContentLoaded', reportHeight);
      window.addEventListener('load', reportHeight);
      window.addEventListener('resize', reportHeight);

      if (typeof ResizeObserver !== 'undefined') {
        const ro = new ResizeObserver(function() {
          reportHeight();
        });
        ro.observe(document.body);
      }

      // Wheel events forward to parent for boundary detection
      window.addEventListener('wheel', function(e) {
        if (e.deltaY < 0) {
          try {
            window.parent.postMessage({ type: 'NOVEL_READER_WHEEL_UP', deltaY: e.deltaY }, '*');
          } catch(err) {}
        } else if (e.deltaY > 0) {
          try {
            window.parent.postMessage({ type: 'NOVEL_READER_WHEEL_DOWN', deltaY: e.deltaY }, '*');
          } catch(err) {}
        }
      }, { passive: true });

      // Touch events
      let touchStartY = 0;
      window.addEventListener('touchstart', function(e) {
        if (e.touches && e.touches[0]) touchStartY = e.touches[0].clientY;
      }, { passive: true });

      window.addEventListener('touchmove', function(e) {
        if (e.touches && e.touches[0]) {
          const deltaY = e.touches[0].clientY - touchStartY;
          if (deltaY > 25) {
            try {
              window.parent.postMessage({ type: 'NOVEL_READER_WHEEL_UP', deltaY: -deltaY }, '*');
            } catch(err) {}
          } else if (deltaY < -25) {
            try {
              window.parent.postMessage({ type: 'NOVEL_READER_WHEEL_DOWN', deltaY: -deltaY }, '*');
            } catch(err) {}
          }
        }
      }, { passive: true });

      window.addEventListener('message', function(event) {
        if (!event.data || typeof event.data !== 'object') return;
        if (event.data.type === 'UPDATE_THEME') {
          const { colors, settings: s } = event.data;
          const root = document.documentElement;
          if (colors) {
            root.style.setProperty('--bg-color', colors.background);
            root.style.setProperty('--text-color', colors.text);
            root.style.setProperty('--link-color', colors.link);
          }
          if (s) {
            const varMap = {
              fontFamily: ['--font-family', ''],
              fontSize: ['--font-size', 'px'],
              lineHeight: ['--line-height', ''],
              maxWidth: ['--max-width', 'px'],
              textAlign: ['--text-align', ''],
              margin: ['--margin', 'px'],
              paragraphSpacing: ['--para-spacing', 'em'],
            };
            for (const [k, [v, u]] of Object.entries(varMap)) {
              if (s[k] !== undefined) root.style.setProperty(v, s[k] + u);
            }
          }
          setTimeout(reportHeight, 30);
        }
      });

      // Forward safe links to the parent, since sandboxed frames cannot open popups.
      document.addEventListener('click', function(e) {
        const link = e.target && e.target.closest && e.target.closest('a[href]');
        if (link) {
          e.preventDefault();
          e.stopPropagation();
          const href = link.getAttribute('href');
          if (href && href.charAt(0) === '#') {
            let target = null;
            try { const id = decodeURIComponent(href.slice(1)); target = document.getElementById(id) || document.getElementsByName(id)[0]; } catch(err) {}
            if (target) window.parent.postMessage({ type: 'NOVEL_READER_ANCHOR', top: target.getBoundingClientRect().top }, '*');
            return;
          }
          try {
            window.parent.postMessage({ type: 'NOVEL_READER_OPEN_LINK', href: link.href }, '*');
          } catch(err) {}
          return;
        }
        if (e.target && e.target.closest && e.target.closest('button, input, select, textarea')) return;
        const selection = window.getSelection && window.getSelection();
        if (selection && !selection.isCollapsed) return;
        try {
          window.parent.postMessage({ type: 'NOVEL_READER_TOGGLE_CONTROLS' }, '*');
        } catch(err) {}
      }, true);

      // Forward keydown events
      document.addEventListener('keydown', function(e) {
        const target = e.target;
        if (target && target.closest && target.closest('input, textarea, select')) return;
        if (target && target.isContentEditable) return;
        try {
          window.parent.postMessage({ type: 'NOVEL_READER_KEY_DOWN', key: e.key }, '*');
        } catch(err) {}
      });
    })();
  </script>
  ${safeCustomJs ? `<script>${safeCustomJs}</script>` : ''}
</body>
</html>`;
}

export const NovelReaderIframe: FC<NovelReaderIframeProps> = ({
    html,
    customCss,
    customJs,
    settings,
    themeColors,
    onToggleControls,
    onKeyDown,
    onHeightChange,
    onWheelUp,
    onWheelDown,
}) => {
    const iframeRef = useRef<HTMLIFrameElement | null>(null);
    const [iframeHeight, setIframeHeight] = useState<number>(600);
    const committedIframeHeightRef = useRef(600);
    const pendingHeightChangeRef = useRef<number | null>(null);
    const onHeightChangeRef = useRef(onHeightChange);
    onHeightChangeRef.current = onHeightChange;
    const settingsRef = useRef(settings);
    settingsRef.current = settings;

    const resolvedColors = useMemo(
        () =>
            themeColors ?? {
                background: '#1e1e1e',
                text: '#e0e0e0',
                link: '#90caf9',
                border: '#333333',
            },
        [themeColors],
    );

    const preparedHtml = useMemo(() => prepareChapterHtml(html), [html]);
    const initialColorsRef = useRef(resolvedColors);

    const srcdocContent = useMemo(
        () =>
            generateIframeDoc(
                preparedHtml,
                customCss,
                customJs,
                initialColorsRef.current,
                settingsRef.current.fontFamily,
                settingsRef.current.fontSize,
                settingsRef.current.lineHeight,
                settingsRef.current.maxWidth,
                settingsRef.current.textAlign,
                settingsRef.current.margin,
                settingsRef.current.paragraphSpacing,
            ),
        [preparedHtml, customCss, customJs],
    );

    useLayoutEffect(() => {
        committedIframeHeightRef.current = iframeHeight;
        if (pendingHeightChangeRef.current === iframeHeight) {
            pendingHeightChangeRef.current = null;
            onHeightChangeRef.current?.(iframeHeight);
        }
    }, [iframeHeight]);

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (!iframeRef.current || event.source !== iframeRef.current.contentWindow) {
                return;
            }

            const { data } = event;
            if (!data || typeof data !== 'object' || typeof data.type !== 'string') {
                return;
            }

            if (data.type === 'NOVEL_READER_RESIZE') {
                if (
                    typeof data.height === 'number' &&
                    Number.isFinite(data.height) &&
                    data.height > 0 &&
                    data.height <= MAX_IFRAME_HEIGHT
                ) {
                    const height = Math.ceil(data.height);
                    if (height === committedIframeHeightRef.current) {
                        pendingHeightChangeRef.current = null;
                        setIframeHeight(height);
                        onHeightChangeRef.current?.(height);
                        return;
                    }
                    pendingHeightChangeRef.current = height;
                    setIframeHeight(height);
                }
            } else if (data.type === 'NOVEL_READER_WHEEL_UP') {
                onWheelUp?.();
            } else if (data.type === 'NOVEL_READER_WHEEL_DOWN') {
                onWheelDown?.();
            } else if (data.type === 'NOVEL_READER_TOGGLE_CONTROLS') {
                onToggleControls?.();
            } else if (data.type === 'NOVEL_READER_KEY_DOWN') {
                if (typeof data.key === 'string' && data.key.length > 0 && data.key.length <= 64) {
                    onKeyDown?.(data.key);
                }
            } else if (data.type === 'NOVEL_READER_ANCHOR') {
                if (
                    typeof data.top === 'number' &&
                    Number.isFinite(data.top) &&
                    Math.abs(data.top) <= MAX_IFRAME_HEIGHT
                ) {
                    const container = iframeRef.current.closest<HTMLElement>('[data-novel-reader-scroll]');
                    if (container) {
                        container.scrollBy({
                            top:
                                iframeRef.current.getBoundingClientRect().top +
                                data.top -
                                container.getBoundingClientRect().top,
                            behavior: 'smooth',
                        });
                    }
                }
            } else if (data.type === 'NOVEL_READER_OPEN_LINK') {
                if (typeof data.href !== 'string') {
                    return;
                }

                try {
                    const url = new URL(data.href, window.location.href);
                    if ((url.protocol === 'http:' || url.protocol === 'https:') && !url.username && !url.password) {
                        window.open(url.href, '_blank', 'noopener,noreferrer');
                    }
                } catch {
                    // Ignore malformed or unsafe link targets.
                }
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [onHeightChange, onWheelUp, onWheelDown, onToggleControls, onKeyDown]);

    // Send theme/typography updates directly to avoid full iframe reload
    useEffect(() => {
        if (!iframeRef.current?.contentWindow) {
            return;
        }

        iframeRef.current.contentWindow.postMessage(
            {
                type: 'UPDATE_THEME',
                colors: resolvedColors,
                settings: {
                    ...settings,
                    fontFamily: FONT_FAMILY_MAP[settings.fontFamily],
                },
            },
            '*',
        );
    }, [settings, resolvedColors]);

    return (
        <Box
            sx={{
                width: '100%',
                height: `${iframeHeight}px`,
                display: 'block',
                backgroundColor: resolvedColors.background,
            }}
        >
            <iframe
                ref={iframeRef}
                srcDoc={srcdocContent}
                title="Light Novel Reader"
                sandbox="allow-scripts"
                style={{
                    width: '100%',
                    height: `${iframeHeight}px`,
                    border: 'none',
                    backgroundColor: 'transparent',
                    display: 'block',
                }}
            />
        </Box>
    );
};

NovelReaderIframe.displayName = 'NovelReaderIframe';
