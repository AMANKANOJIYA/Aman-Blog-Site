console.log("it works");
let left_ = document.querySelector("#left");
let trigger = document.querySelector(".trigger");
if (window.innerWidth <= 800 && trigger) {
  trigger.addEventListener("click", () => {
    if (left_.style.width == "0%") {
      left_.style.width = "100%";
    } else {
      left_.style.width = "0%";
    }
  });
}
let hamburger = document.getElementById("hamburger");
window.addEventListener("resize", () => {
  if (window.innerWidth <= 800) {
    document.getElementById("ham-opener").style.display = "flex";
  } else {
    document.getElementById("ham-opener").style.display = "none";
  }
});

console.log(window.innerWidth);
if (window.innerWidth <= 800) {
  document.getElementById("ham-opener").style.display = "flex";
} else {
  document.getElementById("ham-opener").style.display = "none";
}
document.getElementById("ham-opener").addEventListener("click", () => {
  if (hamburger.style.display != "flex") {
    hamburger.style.display = "flex";
  } else {
    hamburger.style.display = "none";
  }
});

if (window.innerWidth < 800) {
  document.getElementById("ham-closer").addEventListener("click", () => {
    if (hamburger.style.display != "flex") {
      hamburger.style.display = "flex";
    } else {
      hamburger.style.display = "none";
    }
  });
}
