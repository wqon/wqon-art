// pocket-mode memory
const handmode = document.querySelector("#setHandMode");
handmode.checked = localStorage.getItem("handmodeLeft") === "true";

handmode.addEventListener("change", () => {
  console.log("Hand mode setting saved.");
  localStorage.setItem("handmodeLeft", handmode.checked);
});
