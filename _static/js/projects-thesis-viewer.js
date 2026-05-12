document.addEventListener("DOMContentLoaded", () => {
  const browser = document.querySelector("[data-thesis-browser]");
  const links = Array.from(document.querySelectorAll("[data-thesis-link]"));

  if (!browser || !links.length) {
    return;
  }

  const frame = browser.querySelector("[data-thesis-browser-frame]");
  const frameTitle = browser.querySelector("[data-thesis-browser-title]");
  const frameMeta = browser.querySelector("[data-thesis-browser-meta]");
  const emptyState = browser.querySelector("[data-thesis-browser-empty]");

  if (!frame || !frameTitle || !frameMeta || !emptyState) {
    return;
  }

  function openThesis(link) {
    const pdfUrl = link.getAttribute("href");
    const title = link.dataset.thesisTitle || link.textContent.trim();
    const meta = link.dataset.thesisMeta || "";

    frame.src = pdfUrl;
    frame.title = `${title} PDF preview`;
    frameTitle.textContent = title;
    frameMeta.textContent = meta;
    emptyState.setAttribute("hidden", "hidden");
    browser.dataset.thesisReady = "true";
    browser.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  links.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      openThesis(link);
    });
  });
});