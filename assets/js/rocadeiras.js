(() => {
  document.querySelectorAll("[data-optional-photo]").forEach(image => {
    const showPhoto = () => {
      if (image.naturalWidth > 0) image.parentElement.classList.add("has-photo");
      else image.hidden = true;
    };

    image.addEventListener("load", showPhoto, { once: true });
    image.addEventListener("error", showPhoto, { once: true });
    if (image.complete) showPhoto();
  });
})();
