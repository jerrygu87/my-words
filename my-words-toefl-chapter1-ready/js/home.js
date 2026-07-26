
const cards = [...document.querySelectorAll(".zone-card")];
const tabs = [...document.querySelectorAll(".tab")];
const searchInput = document.querySelector("#home-search");

function applyFilter(){
  const category = document.querySelector(".tab.active")?.dataset.category || "all";
  const query = (searchInput.value || "").trim().toLowerCase();
  cards.forEach(card=>{
    const matchesCategory = category === "all" || card.dataset.category === category;
    const matchesQuery = !query || card.textContent.toLowerCase().includes(query);
    card.style.display = matchesCategory && matchesQuery ? "" : "none";
  });
}
tabs.forEach(tab=>tab.addEventListener("click",()=>{
  tabs.forEach(item=>item.classList.remove("active"));
  tab.classList.add("active");
  applyFilter();
}));
searchInput.addEventListener("input",applyFilter);
document.querySelector("#search-btn").addEventListener("click",applyFilter);
document.querySelectorAll(".coming .zone-action").forEach(button=>{
  button.addEventListener("click",event=>{
    event.preventDefault();
    showToast("这个专区稍后开放，先从托福第一章开始吧");
  });
});
