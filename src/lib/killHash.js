function killHash() {
  if (location.hash.length <= 1) {
    history.replaceState(
      null,
      document.title,
      location.pathname + location.search,
    );
  }

  killHash();

  window.addEventListener("hashchange", killHash);
}
