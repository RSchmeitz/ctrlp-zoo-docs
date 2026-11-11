document.addEventListener("DOMContentLoaded", () => {
  const selector = "article img";
  const images = Array.from(document.querySelectorAll(selector));

  if (!images.length) {
    return;
  }

  const overlay = document.createElement("div");
  overlay.className = "doc-lightbox";
  overlay.setAttribute("hidden", "hidden");
  overlay.innerHTML = [
    '<button class="doc-lightbox__close" type="button" aria-label="Close enlarged image">Close</button>',
    '<div class="doc-lightbox__frame">',
    '  <img class="doc-lightbox__image" alt="" />',
    '  <p class="doc-lightbox__caption"></p>',
    '</div>'
  ].join("");
  document.body.appendChild(overlay);

  const overlayImage = overlay.querySelector(".doc-lightbox__image");
  const overlayCaption = overlay.querySelector(".doc-lightbox__caption");
  const closeButton = overlay.querySelector(".doc-lightbox__close");

  let activeTrigger = null;

  function getDisplayedImageSource(image) {
    const computedContent = window.getComputedStyle(image).content;
    const contentMatch = computedContent.match(/^url\(["']?(.*?)["']?\)$/);

    if (contentMatch && contentMatch[1] && contentMatch[1] !== "none") {
      try {
        return new URL(contentMatch[1], window.location.href).href;
      } catch {
        return contentMatch[1];
      }
    }

    return image.currentSrc || image.src;
  }

  function shouldSkip(image) {
    if (image.closest("a[href$='.zip']")) {
      return true;
    }

    if (image.closest(".thesis-browser") || image.closest(".publication-pdf")) {
      return true;
    }

    return image.dataset.lightbox === "off";
  }

  function enhanceImage(image) {
    if (image.dataset.lightboxBound === "true" || shouldSkip(image)) {
      return;
    }

    image.dataset.lightboxBound = "true";
    image.classList.add("doc-lightbox-trigger");
    image.setAttribute("tabindex", "0");
    image.setAttribute("role", "button");
    image.setAttribute("aria-label", `${image.alt || "Figure"}. Click to enlarge.`);

    const figure = image.closest("figure");
    if (figure) {
      figure.classList.add("doc-lightbox-figure");
    }

    image.addEventListener("click", () => openLightbox(image));
    image.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openLightbox(image);
      }
    });
  }

  function closeLightbox() {
    overlay.setAttribute("hidden", "hidden");
    document.body.classList.remove("doc-lightbox-open");
    overlayImage.removeAttribute("src");
    overlayImage.removeAttribute("srcset");
    overlayCaption.textContent = "";
    if (activeTrigger) {
      activeTrigger.focus();
      activeTrigger = null;
    }
  }

  function openLightbox(image) {
    activeTrigger = image;
    overlayImage.src = getDisplayedImageSource(image);
    if (image.srcset && overlayImage.src === (image.currentSrc || image.src)) {
      overlayImage.srcset = image.srcset;
    } else {
      overlayImage.removeAttribute("srcset");
    }
    overlayImage.alt = image.alt || "Expanded documentation figure";

    const figure = image.closest("figure");
    const caption = figure ? figure.querySelector("figcaption") : null;
    overlayCaption.textContent = caption ? caption.textContent.trim() : (image.alt || "");

    overlay.removeAttribute("hidden");
    document.body.classList.add("doc-lightbox-open");
    closeButton.focus();
  }

  images.forEach((image) => {
    if (image.complete) {
      enhanceImage(image);
      return;
    }

    image.addEventListener("load", () => enhanceImage(image), { once: true });
  });

  overlay.addEventListener("click", (event) => {
    if (event.target === overlay || event.target === closeButton) {
      closeLightbox();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !overlay.hasAttribute("hidden")) {
      closeLightbox();
    }
  });
});