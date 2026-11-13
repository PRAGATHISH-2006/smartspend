// PWA Helper: Service Worker Registration, Meta Tags Injection & Install Prompt Management

import { FAVICON_DATA_URI } from './faviconBase64';

let deferredPrompt: any = null;
const installListeners: Array<(canInstall: boolean) => void> = [];

export function applyBrandMetaAndFavicon() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const APP_NAME = 'வெற்றி நிதி மேலாண்மை';
  const head = document.head;

  // 1. Force document title
  document.title = APP_NAME;

  let titleTag = document.querySelector('title');
  if (!titleTag) {
    titleTag = document.createElement('title');
    titleTag.innerText = APP_NAME;
    head.appendChild(titleTag);
  } else {
    titleTag.innerText = APP_NAME;
  }

  // 2. Force fresh Favicon by replacing all icon link tags
  const existingIcons = document.querySelectorAll('link[rel*="icon"]');
  let hasMatchingFavicon = false;
  existingIcons.forEach((el) => {
    if (el.getAttribute('href') === FAVICON_DATA_URI) {
      hasMatchingFavicon = true;
    } else {
      el.remove();
    }
  });

  if (!hasMatchingFavicon) {
    const favLink = document.createElement('link');
    favLink.rel = 'icon';
    favLink.type = 'image/png';
    favLink.setAttribute('sizes', '32x32');
    favLink.href = FAVICON_DATA_URI;
    head.appendChild(favLink);

    const shortcutLink = document.createElement('link');
    shortcutLink.rel = 'shortcut icon';
    shortcutLink.type = 'image/png';
    shortcutLink.href = FAVICON_DATA_URI;
    head.appendChild(shortcutLink);
  }

  // 4. Inject Apple touch icon & Manifest
  if (!document.querySelector('link[rel="apple-touch-icon"]')) {
    const appleIcon = document.createElement('link');
    appleIcon.rel = 'apple-touch-icon';
    appleIcon.href = '/apple-touch-icon.png';
    head.appendChild(appleIcon);
  }

  if (!document.querySelector('link[rel="manifest"]')) {
    const manifestLink = document.createElement('link');
    manifestLink.rel = 'manifest';
    manifestLink.href = `/manifest.json?v=${Date.now()}`;
    head.appendChild(manifestLink);
  }
}

// Run immediately upon bundle load
if (typeof window !== 'undefined') {
  applyBrandMetaAndFavicon();
}

export function initPWA() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const APP_NAME = 'வெற்றி நிதி மேலாண்மை';
  applyBrandMetaAndFavicon();

  try {
    const head = document.head;
    const titleTag = document.querySelector('title');
    if (titleTag) {
      try {
        const observer = new MutationObserver(() => {
          if (document.title !== APP_NAME) {
            document.title = APP_NAME;
          }
        });
        observer.observe(titleTag, { childList: true, subtree: true, characterData: true });
      } catch {}
    }

    // Keep title & icon enforced periodically for 15s to counter any late navigation rewrites
    let checks = 0;
    const lockInterval = setInterval(() => {
      applyBrandMetaAndFavicon();
      checks++;
      if (checks > 30) {
        clearInterval(lockInterval);
      }
    }, 500);

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
    appleIcon.href = '/apple-touch-icon.png';
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
