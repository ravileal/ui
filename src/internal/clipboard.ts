/**
 * Copies text to the clipboard with a legacy fallback.
 *
 * `navigator.clipboard` is unavailable on insecure origins (plain HTTP on a
 * non-localhost host) and its promise can reject (permission denied, document
 * not focused). The previous call sites used `writeText(...).then(...)` without
 * a catch, so any failure silently swallowed the whole click feedback. This
 * helper always resolves to a boolean and falls back to the deprecated
 * `execCommand('copy')`, which still works without the async clipboard API.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through to the legacy path
  }

  try {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.top = '-1000px';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    textarea.setSelectionRange(0, text.length);
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    // The hidden textarea steals focus; give it back so hover/focus states
    // (tooltips, cursor feedback) are not interrupted by the copy.
    if (previouslyFocused && previouslyFocused !== document.body) {
      previouslyFocused.focus?.();
    }
    return ok;
  } catch {
    return false;
  }
}
