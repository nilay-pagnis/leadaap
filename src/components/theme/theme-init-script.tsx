/**
 * Inline script runs before paint to set `class="dark"` on <html> from localStorage,
 * matching next-themes (storageKey + defaultTheme). Prevents flash of wrong theme.
 */
export function themeInitScript(): string {
  return `!function(){try{var k='enquireo-theme',v=localStorage.getItem(k),m=window.matchMedia('(prefers-color-scheme: dark)'),d=!1;v==='dark'?d=!0:v==='light'?d=!1:v==='system'?d=m.matches:d=!1;var r=document.documentElement;d?r.classList.add('dark'):r.classList.remove('dark')}catch(e){}}();`;
}
