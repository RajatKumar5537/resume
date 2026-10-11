/** The home-screen app scrolls inside main. A normal browser tab scrolls the window. */
export function deskScroller(): HTMLElement | null {
  const main = document.querySelector(".desk-app > main");
  if (!(main instanceof HTMLElement)) return null;
  const style = getComputedStyle(main);
  if (/(auto|scroll)/.test(style.overflowY) && main.scrollHeight > main.clientHeight + 8) return main;
  return null;
}

export function deskScrollTop(): number {
  return deskScroller()?.scrollTop ?? window.scrollY;
}

export function scrollDeskTo(top: number) {
  const scroller = deskScroller();
  if (scroller) scroller.scrollTop = top;
  else window.scrollTo(0, top);
}

export function scrollDeskBy(delta: number) {
  const scroller = deskScroller();
  if (scroller) scroller.scrollTop += delta;
  else window.scrollBy(0, delta);
}
