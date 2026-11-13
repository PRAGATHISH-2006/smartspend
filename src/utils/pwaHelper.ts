// PWA Helper: Service Worker Registration, Meta Tags Injection & Install Prompt Management

const FAVICON_BASE64 =
  'data:image/png;base64,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';

let deferredPrompt: any = null;
const installListeners: Array<(canInstall: boolean) => void> = [];

export function initPWA() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  // 1. Inject PWA Manifest & Meta Tags if not present
  try {
    const head = document.head;
    const APP_NAME = 'வெற்றி நிதி மேலாண்மை';

    // Document title
    document.title = APP_NAME;

    // Keep title locked to APP_NAME
    let titleTag = document.querySelector('title');
    if (!titleTag) {
      titleTag = document.createElement('title');
      titleTag.innerText = APP_NAME;
      head.appendChild(titleTag);
    } else {
      titleTag.innerText = APP_NAME;
    }

    try {
      const observer = new MutationObserver(() => {
        if (document.title !== APP_NAME) {
          document.title = APP_NAME;
        }
      });
      observer.observe(titleTag, { childList: true, subtree: true, characterData: true });
    } catch {}

    // Periodic check for 10 seconds to counteract any client-side router title rewrites
    const titleInterval = setInterval(() => {
      if (document.title !== APP_NAME) {
        document.title = APP_NAME;
      }
    }, 400);
    setTimeout(() => clearInterval(titleInterval), 10000);

    // Dynamic cache-busting Favicon injection with base64 data URI
    let favLink = document.querySelector('link[rel="icon"]') as HTMLLinkElement | null;
    if (!favLink) {
      favLink = document.createElement('link');
      favLink.rel = 'icon';
      head.appendChild(favLink);
    }
    favLink.type = 'image/png';
    favLink.href = FAVICON_BASE64;

    let shortcutLink = document.querySelector('link[rel="shortcut icon"]') as HTMLLinkElement | null;
    if (!shortcutLink) {
      shortcutLink = document.createElement('link');
      shortcutLink.rel = 'shortcut icon';
      head.appendChild(shortcutLink);
    }
    shortcutLink.type = 'image/png';
    shortcutLink.href = FAVICON_BASE64;

    if (!document.querySelector('link[rel="manifest"]')) {
      const manifestLink = document.createElement('link');
      manifestLink.rel = 'manifest';
      manifestLink.href = `/manifest.json?v=${Date.now()}`;
      head.appendChild(manifestLink);
    }

    if (!document.querySelector('meta[name="theme-color"]')) {
      const themeMeta = document.createElement('meta');
      themeMeta.name = 'theme-color';
      themeMeta.content = '#059669';
      head.appendChild(themeMeta);
    }

    if (!document.querySelector('meta[name="apple-mobile-web-app-capable"]')) {
      const appleMeta = document.createElement('meta');
      appleMeta.name = 'apple-mobile-web-app-capable';
      appleMeta.content = 'yes';
      head.appendChild(appleMeta);
    }

    if (!document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]')) {
      const appleStatusMeta = document.createElement('meta');
      appleStatusMeta.name = 'apple-mobile-web-app-status-bar-style';
      appleStatusMeta.content = 'black-translucent';
      head.appendChild(appleStatusMeta);
    }

    if (!document.querySelector('meta[name="apple-mobile-web-app-title"]')) {
      const appleTitleMeta = document.createElement('meta');
      appleTitleMeta.name = 'apple-mobile-web-app-title';
      appleTitleMeta.content = APP_NAME;
      head.appendChild(appleTitleMeta);
    }

    let appleIcon = document.querySelector('link[rel="apple-touch-icon"]') as HTMLLinkElement | null;
    if (!appleIcon) {
      appleIcon = document.createElement('link');
      appleIcon.rel = 'apple-touch-icon';
      head.appendChild(appleIcon);
    }
    appleIcon.href = FAVICON_BASE64;
  } catch (err) {
    console.warn('[PWA] Meta injection warning:', err);
  }

  // 2. Register Service Worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('[PWA] Service Worker registered successfully:', registration.scope);
        })
        .catch((error) => {
          console.warn('[PWA] Service Worker registration failed:', error);
        });
    });
  }

  // 3. Listen for BeforeInstallPrompt event on Mobile
  window.addEventListener('beforeinstallprompt', (e: any) => {
    e.preventDefault();
    deferredPrompt = e;
    notifyInstallListeners(true);
    console.log('[PWA] beforeinstallprompt captured, ready for install prompt');
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    notifyInstallListeners(false);
    console.log('[PWA] SmartSpend app successfully installed!');
  });
}

export function subscribeToInstallPrompt(callback: (canInstall: boolean) => void) {
  installListeners.push(callback);
  callback(!!deferredPrompt);

  return () => {
    const idx = installListeners.indexOf(callback);
    if (idx !== -1) installListeners.splice(idx, 1);
  };
}

function notifyInstallListeners(canInstall: boolean) {
  installListeners.forEach((cb) => cb(canInstall));
}

export async function promptPWAInstall(): Promise<{ outcome: 'accepted' | 'dismissed' | 'unavailable' }> {
  if (!deferredPrompt) {
    return { outcome: 'unavailable' };
  }

  try {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`[PWA] User response to install prompt: ${outcome}`);
    deferredPrompt = null;
    notifyInstallListeners(false);
    return { outcome };
  } catch (err) {
    console.warn('[PWA] Install prompt error:', err);
    return { outcome: 'dismissed' };
  }
}
