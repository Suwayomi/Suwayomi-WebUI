/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/*
 * Runtime shims for legacy browsers, primarily Safari 12 (iOS 12.5.8 iPad Air).
 *
 * This file is bundled into the "polyfills-legacy-*.js" chunk by @vitejs/plugin-legacy
 * (see "additionalLegacyPolyfills" in vite.config.ts), so it only ever runs in browsers
 * that take the legacy (SystemJS) path - modern browsers never download it.
 * Syntax transforms (?. ?? class fields ...) and core-js polyfills are handled by babel
 * via the "targets" option; this file covers the gaps babel/core-js don't:
 * DOM/Intl/Web APIs and iOS-12-specific quirks.
 *
 * It runs before everything else (incl. core-js), so it must stick to ES2015-level syntax and
 * APIs that every legacy target already has - no optional chaining, no newer built-ins.
 *
 * When adding support for a newer API, grep the built "-legacy-" chunks for it first; most
 * libraries feature-guard (OffscreenCanvas, navigator.locks, FinalizationRegistry, wakeLock,
 * screen.orientation, visualViewport, BigInt are all guarded) - only unguarded uses need a shim.
 */

// Intl.PluralRules is Safari 13+ (lingui plural messages need it, e.g. for the "ru" locale)
import 'intl-pluralrules';

const IS_IOS_12 = /\bOS 12_\d/.test(navigator.userAgent);
const noop = () => {};

// Copies text without the async Clipboard API (Safari 13.1+): select it inside a textarea and
// run the legacy copy command. Must be called from a user gesture (tap/click) on iOS.
function legacyCopyText(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.cssText =
        'position:fixed;top:0;left:0;width:2em;height:2em;padding:0;border:0;opacity:0.01;font-size:16px';
    document.body.appendChild(ta);
    let ok = false;
    try {
        // iOS refuses to select inside a readonly textarea unless it's contentEditable
        ta.contentEditable = 'true';
        ta.focus();
        const range = document.createRange();
        range.selectNodeContents(ta);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        ta.setSelectionRange(0, text.length);
        ok = document.execCommand('copy');
    } catch (e) {
        ok = false;
    }
    document.body.removeChild(ta);
    return ok;
}

// On-screen error panel: an old iPad has no usable console, so surface the first errors
// directly on the page. "Copy" puts every collected message on the clipboard (so it can be
// pasted into a chat/mail), "Close" hides the panel. Every report is also written to the
// console with a "[legacy]" prefix via the original console.error.
(function () {
    let box = null;
    let body = null;
    const messages = [];
    // eslint-disable-next-line no-console
    const originalConsoleError = console.error;

    function describe(err) {
        if (!err) {
            return String(err);
        }
        if (err.message || err.stack) {
            // Safari's error.stack holds only the frames (no "Name: message" first line like V8),
            // so always print both.
            return `${err.name || 'Error'}: ${err.message}\n${String(err.stack || '').slice(0, 800)}`;
        }
        if (typeof err === 'object') {
            try {
                return JSON.stringify(err).slice(0, 300);
            } catch (e) {
                /* ignore */
            }
        }
        return String(err);
    }

    function button(label, onClick) {
        const b = document.createElement('button');
        b.textContent = label;
        b.style.cssText =
            'margin:0 8px 0 0;padding:4px 10px;border:1px solid #f88;border-radius:4px;background:#500;color:#fdd;font:12px monospace';
        b.onclick = (e) => {
            e.stopPropagation();
            onClick();
        };
        return b;
    }

    function show(msg, fromConsole) {
        if (!fromConsole) {
            try {
                originalConsoleError.call(console, `[legacy] ${msg}`);
            } catch (e) {
                /* ignore */
            }
        }
        try {
            messages.push(msg);
            if (!box) {
                box = document.createElement('div');
                box.style.cssText =
                    'position:fixed;left:0;right:0;bottom:0;max-height:45%;display:flex;flex-direction:column;margin:0;' +
                    'background:#300;color:#fdd;font:11px/1.35 monospace;z-index:2147483647';
                const bar = document.createElement('div');
                bar.style.cssText = 'flex:none;padding:6px 8px;border-bottom:1px solid #822';
                bar.appendChild(
                    button('Copy', () => {
                        const ok = legacyCopyText(messages.join('\n\n'));
                        bar.lastChild.textContent = ok ? ` copied ${messages.length} message(s)` : ' copy failed';
                    }),
                );
                bar.appendChild(
                    button('Close', () => {
                        box.style.display = 'none';
                    }),
                );
                bar.appendChild(document.createTextNode(` errors (${navigator.userAgent.slice(0, 60)})`));
                box.appendChild(bar);
                body = document.createElement('pre');
                body.style.cssText =
                    'flex:1 1 auto;overflow:auto;margin:0;padding:8px;white-space:pre-wrap;word-break:break-all;-webkit-overflow-scrolling:touch';
                box.appendChild(body);
                (document.body || document.documentElement).appendChild(box);
            }
            box.style.display = '';
            if (body.childNodes.length < 15) {
                body.appendChild(document.createTextNode(`${msg}\n\n`));
            }
        } catch (e) {
            /* ignore */
        }
    }

    window.__legacyReport = show;

    window.addEventListener('error', (e) => {
        // Vite's modern-browser probe (a data: module import) fails on old browsers by design
        // and surfaces as an opaque "Script error." - not a real error.
        if (e.message === 'Script error.' && !e.filename) {
            return;
        }
        const file = (e.filename || '').split('/').pop();
        const stack = e.error && e.error.stack ? `\n${String(e.error.stack).slice(0, 800)}` : '';
        show(`Error: ${e.message}\n  at ${file}:${e.lineno}:${e.colno}${stack}`);
    });

    window.addEventListener('unhandledrejection', (e) => {
        show(`Unhandled rejection: ${describe(e.reason)}`);
    });

    // eslint-disable-next-line no-console
    console.error = function () {
        try {
            const text = [].slice.call(arguments).map(describe).join(' ');
            // React reports render crashes via console.error
            if (/error|exception|uncaught/i.test(text)) {
                show(`console.error: ${text.slice(0, 1000)}`, true);
            }
        } catch (e) {
            /* ignore */
        }
        return originalConsoleError.apply(console, arguments);
    };
})();

// crypto.randomUUID is Safari 15.4+ (subscription bookkeeping uses it unguarded)
(function () {
    if (
        typeof crypto === 'undefined' ||
        typeof crypto.randomUUID === 'function' ||
        typeof crypto.getRandomValues !== 'function'
    ) {
        return;
    }
    crypto.randomUUID = () => {
        const bytes = crypto.getRandomValues(new Uint8Array(16));
        bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
        bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant
        const hex = [];
        for (let i = 0; i < 16; i++) {
            hex.push((bytes[i] + 0x100).toString(16).slice(1));
        }
        return [hex.slice(0, 4), hex.slice(4, 6), hex.slice(6, 8), hex.slice(8, 10), hex.slice(10)]
            .map((part) => part.join(''))
            .join('-');
    };
})();

// AbortSignal.any is Safari 17.4+ (global search / migration use it unguarded)
(function () {
    if (
        typeof AbortSignal === 'undefined' ||
        typeof AbortController === 'undefined' ||
        typeof AbortSignal.any === 'function'
    ) {
        return;
    }
    AbortSignal.any = (signals) => {
        const controller = new AbortController();
        for (let i = 0; i < signals.length; i++) {
            const signal = signals[i];
            if (!signal) {
                continue;
            }
            if (signal.aborted) {
                controller.abort(signal.reason);
                break;
            }
            signal.addEventListener('abort', () => controller.abort(signal.reason));
        }
        return controller.signal;
    };
})();

// Element.animate (Web Animations API) is Safari 13.1+. dnd-kit calls it for the drop
// animation of a dragged item; without it the drop throws. Minimal stand-in: no animation,
// "finishes" on the next tick.
(function () {
    if (typeof Element === 'undefined' || typeof Element.prototype.animate === 'function') {
        return;
    }
    Element.prototype.animate = () => {
        const animation = {
            onfinish: null,
            oncancel: null,
            playState: 'finished',
            ready: Promise.resolve(),
            play: noop,
            pause: noop,
            cancel: noop,
            finish: noop,
            reverse: noop,
            addEventListener: noop,
            removeEventListener: noop,
        };
        animation.finished = new Promise((resolve) => {
            setTimeout(() => {
                if (typeof animation.onfinish === 'function') {
                    animation.onfinish({ target: animation });
                }
                resolve(animation);
            }, 0);
        });
        return animation;
    };
})();

// navigator.clipboard is Safari 13.1+. Back the copy buttons with the legacy copy command
// (works from a tap handler, which is how the app calls it).
(function () {
    if (typeof navigator === 'undefined' || navigator.clipboard || typeof document.execCommand !== 'function') {
        return;
    }
    try {
        Object.defineProperty(navigator, 'clipboard', {
            configurable: true,
            value: {
                writeText: (text) =>
                    legacyCopyText(String(text)) ? Promise.resolve() : Promise.reject(new Error('copy command failed')),
                readText: () => Promise.reject(new Error('clipboard read not supported')),
            },
        });
    } catch (e) {
        /* ignore */
    }
})();

// MediaQueryList.addEventListener('change') is Safari 14+; MUI's useMediaQuery calls it
// unguarded -> the first render throws.
(function () {
    if (typeof window.matchMedia !== 'function') {
        return;
    }
    const proto = Object.getPrototypeOf(window.matchMedia('all'));
    if (proto && typeof proto.addEventListener !== 'function' && typeof proto.addListener === 'function') {
        proto.addEventListener = function (type, fn) {
            if (type === 'change') {
                this.addListener(fn);
            }
        };
        proto.removeEventListener = function (type, fn) {
            if (type === 'change') {
                this.removeListener(fn);
            }
        };
    }
})();

// ParentNode.replaceChildren is Safari 14+ (used by the reader's tap zone layout)
(function () {
    function replaceChildren() {
        while (this.lastChild) {
            this.removeChild(this.lastChild);
        }
        for (let i = 0; i < arguments.length; i++) {
            const node = arguments[i];
            this.appendChild(typeof node === 'string' ? document.createTextNode(node) : node);
        }
    }
    [Element, Document, DocumentFragment].forEach((Constructor) => {
        const proto = Constructor && Constructor.prototype;
        if (proto && !proto.replaceChildren) {
            proto.replaceChildren = replaceChildren;
        }
    });
})();

// Intl.DisplayNames / Intl.RelativeTimeFormat are Safari 14+. Minimal fallbacks so callers
// degrade instead of throwing "undefined is not a constructor".
(function () {
    if (typeof Intl === 'undefined') {
        return;
    }
    if (!Intl.DisplayNames) {
        Intl.DisplayNames = function (locales, opts) {
            this._o = opts || {};
        };
        // returning the code itself makes callers use their own fallback name
        Intl.DisplayNames.prototype.of = (code) => String(code);
        Intl.DisplayNames.prototype.resolvedOptions = function () {
            return this._o;
        };
    }
    if (!Intl.RelativeTimeFormat) {
        Intl.RelativeTimeFormat = function (locales, opts) {
            this._o = opts || {};
        };
        Intl.RelativeTimeFormat.prototype.format = function (value, unit) {
            const v = Number(value);
            const u = String(unit).replace(/s$/, '');
            const n = Math.abs(v);
            if (v === 0 && this._o.numeric === 'auto') {
                return 'now';
            }
            const label = `${n} ${u}${n === 1 ? '' : 's'}`;
            return v < 0 ? `${label} ago` : `in ${label}`;
        };
        Intl.RelativeTimeFormat.prototype.formatToParts = function (value, unit) {
            return [{ type: 'literal', value: this.format(value, unit) }];
        };
        Intl.RelativeTimeFormat.prototype.resolvedOptions = function () {
            return this._o;
        };
    }
})();

// iOS 12 Safari sends NO cookies on crossorigin="anonymous" requests, even same-origin ones.
// The WebUI sets crossOrigin="anonymous" on its (same-origin) reader/cover images, so behind
// a cookie-based auth proxy they get rejected. Same-origin images never need CORS mode, and
// losing it on a cross-origin image only taints canvas reads, so make it a no-op on <img>.
(function () {
    if (!IS_IOS_12 || typeof HTMLImageElement === 'undefined') {
        return;
    }
    const imageProto = HTMLImageElement.prototype;
    const descriptor = Object.getOwnPropertyDescriptor(imageProto, 'crossOrigin');
    if (descriptor && descriptor.set) {
        Object.defineProperty(imageProto, 'crossOrigin', {
            configurable: true,
            enumerable: descriptor.enumerable,
            get: descriptor.get,
            set: () => {},
        });
    }
    const { setAttribute } = Element.prototype;
    Element.prototype.setAttribute = function (name) {
        if (this instanceof HTMLImageElement && String(name).toLowerCase() === 'crossorigin') {
            return undefined;
        }
        return setAttribute.apply(this, arguments);
    };
})();

// iOS 12: keep the service worker out of the picture. Its only job here is runtime image
// caching, and on iOS 12 an SW-intercepted image fetch through an auth proxy is one more
// cookie quirk to get wrong; the browser's HTTP cache already covers thumbnails.
// The registration promise simply never settles, so the PWA register helper stays quiet.
(function () {
    if (!IS_IOS_12 || !('serviceWorker' in navigator) || typeof ServiceWorkerContainer === 'undefined') {
        return;
    }
    ServiceWorkerContainer.prototype.register = () => new Promise(() => {});
})();
