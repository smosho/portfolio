// Flips through the images inside any .cycler element, like turning pages.
// Hover pauses it, click steps to the next image. Speed: data-speed (ms).
document.querySelectorAll(".cycler").forEach(box => {
  const imgs = box.querySelectorAll("img");
  const counter = box.parentElement.querySelector(".counter");
  const speed = +box.dataset.speed || 1400;
  let i = 0, paused = false;

  function show(n) {
    imgs[i].classList.remove("on");
    i = (n + imgs.length) % imgs.length;
    imgs[i].classList.add("on");
    if (counter) counter.textContent = `${i + 1} / ${imgs.length}`;
  }

  show(0);
  setInterval(() => { if (!paused) show(i + 1); }, speed);
  box.addEventListener("mouseenter", () => paused = true);
  box.addEventListener("mouseleave", () => paused = false);
  box.addEventListener("click", () => show(i + 1));
});
