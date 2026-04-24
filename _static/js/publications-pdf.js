document.addEventListener("DOMContentLoaded", () => {
  const browser = document.querySelector("[data-publication-browser]");

  if (!browser) {
    return;
  }

  const dataNode = browser.querySelector("[data-publication-data]");
  const select = browser.querySelector("[data-publication-select]");
  const viewer = browser.querySelector("[data-publication-pdf]");
  const frameShell = browser.querySelector("[data-publication-pdf-frame]");
  const emptyState = browser.querySelector("[data-publication-pdf-empty]");
  const title = browser.querySelector("[data-publication-title]");
  const subtitle = browser.querySelector("[data-publication-subtitle]");
  const description = browser.querySelector("[data-publication-description]");
  const venue = browser.querySelector("[data-publication-venue]");
  const path = browser.querySelector("[data-publication-path]");
  const paperLink = browser.querySelector("[data-publication-paper]");
  const codeLink = browser.querySelector("[data-publication-code]");

  if (!dataNode || !select || !viewer || !frameShell || !emptyState) {
    return;
  }

  let publications;
  try {
    publications = JSON.parse(dataNode.textContent || "[]");
  } catch {
    publications = [];
  }

  if (!Array.isArray(publications) || !publications.length) {
    return;
  }

  async function pdfExists(url) {
    try {
      const headResponse = await fetch(url, {
        method: "HEAD",
        cache: "no-store"
      });

      if (headResponse.ok) {
        return true;
      }

      if (headResponse.status !== 405 && headResponse.status !== 501) {
        return false;
      }
    } catch {
      return false;
    }

    try {
      const getResponse = await fetch(url, {
        method: "GET",
        cache: "no-store"
      });
      return getResponse.ok;
    } catch {
      return false;
    }
  }

  function clearFrame() {
    frameShell.querySelectorAll(".publication-pdf__frame").forEach((node) => node.remove());
  }

  function updateMeta(entry) {
    if (title) {
      title.textContent = entry.title || entry.label || entry.id || "Untitled paper";
    }
    if (subtitle) {
      subtitle.textContent = entry.subtitle || "";
    }
    if (description) {
      description.textContent = entry.description || "";
    }
    if (venue) {
      venue.textContent = `Venue / Year: ${entry.venue || "TBA"}${entry.year ? `, ${entry.year}` : ""}`;
    }
    if (path) {
      path.textContent = entry.path || entry.pdf || "";
    }
    if (paperLink && entry.paper) {
      paperLink.href = entry.paper;
      paperLink.textContent = "Paper Link";
    }
    if (codeLink && entry.code) {
      codeLink.href = entry.code;
      codeLink.textContent = "Code Repository";
    }
  }

  async function renderEntry(entry) {
    if (!entry) {
      return;
    }

    updateMeta(entry);
    clearFrame();

    const pdfUrl = entry.pdf;
    viewer.dataset.pdfSrc = pdfUrl || "";
    viewer.dataset.pdfTitle = `${entry.title || entry.label || entry.id || "Publication"} PDF preview`;

    if (!pdfUrl) {
      viewer.dataset.pdfStatus = "missing";
      emptyState.hidden = false;
      return;
    }

    const available = await pdfExists(pdfUrl);
    if (!available) {
      viewer.dataset.pdfStatus = "missing";
      emptyState.hidden = false;
      return;
    }

    const iframe = document.createElement("iframe");
    iframe.className = "publication-pdf__frame";
    iframe.src = pdfUrl;
    iframe.title = viewer.dataset.pdfTitle;
    iframe.loading = "lazy";

    frameShell.appendChild(iframe);
    viewer.dataset.pdfStatus = "ready";
    emptyState.hidden = true;
  }

  select.innerHTML = "";
  publications.forEach((entry, index) => {
    const option = document.createElement("option");
    option.value = entry.id || `paper-${index + 1}`;
    option.textContent = entry.label || entry.title || option.value;
    select.appendChild(option);
  });

  const findEntry = (value) => publications.find((entry) => (entry.id || "") === value) || publications[0];

  select.addEventListener("change", () => {
    void renderEntry(findEntry(select.value));
  });

  void renderEntry(findEntry(select.value));
});
