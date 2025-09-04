gsap.registerPlugin(SplitText);

console.clear();

document.fonts.ready.then(() => {
  gsap.set(".split", { opacity: 1 });

  let split = SplitText.create(".split", {
    type: "chars, words",
    mask: "chars"
  });

  let tween = gsap.from(split.chars, {
    duration: 0.6,
    yPercent: "random([-150, 150])",
    xPercent: "random([-150, 150])",
    stagger: {
      from: "random",
      amount: 0.6,
    },
    ease: "power3.out"
  });

  document.getElementById("replay").addEventListener("click", () => {
    tween.timeScale(0.5).play(0);
  });

  const musicBtn = document.getElementById("music");
  const audio = new Audio("title.mp3");
  let isPlaying = false;

  musicBtn.addEventListener("click", () => {
    if (!isPlaying) {
      audio.play();
      musicBtn.textContent = "Pause Music";
      isPlaying = true;
    } else {
      audio.pause();
      musicBtn.textContent = "Play Music";
      isPlaying = false;
    }
  });
});