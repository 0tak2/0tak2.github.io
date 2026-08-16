export function shouldDestroyOnPageHide(persisted) {
  return !persisted;
}

export function createPageHideHandler(cleanup) {
  let hasCleanedUp = false;

  return (event) => {
    if (hasCleanedUp || !shouldDestroyOnPageHide(event.persisted)) return false;
    hasCleanedUp = true;
    cleanup();
    return true;
  };
}
