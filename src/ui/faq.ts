/** Ensures only one FAQ item is open at a time for cleaner UX. */
export function initFaqAccordion(root: ParentNode = document): void {
  const items = root.querySelectorAll<HTMLDetailsElement>('#faq details');
  items.forEach((item) => {
    item.addEventListener('toggle', () => {
      if (!item.open) return;
      items.forEach((other) => {
        if (other !== item) other.open = false;
      });
    });
  });
}
