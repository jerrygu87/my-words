
let currentFilter="all";
function getStatusLabel(status){
  return {new:"新加入",learning:"学习中",mastered:"已掌握"}[status]||"新加入";
}
function render(){
  const query=(document.querySelector("#book-search").value||"").trim().toLowerCase();
  const all=getWordbook();
  const items=all.filter(item=>{
    const matchesFilter=currentFilter==="all"||item.status===currentFilter;
    const matchesQuery=!query||item.word.toLowerCase().includes(query)||(item.meaning||"").includes(query);
    return matchesFilter&&matchesQuery;
  });
  document.querySelector("#total-count").textContent=all.length;
  document.querySelector("#learning-count").textContent=all.filter(x=>x.status==="learning").length;
  document.querySelector("#mastered-count").textContent=all.filter(x=>x.status==="mastered").length;
  const grid=document.querySelector("#book-grid");
  if(!items.length){
    grid.innerHTML=`<div class="card empty-state" style="grid-column:1/-1">📖<br><br>${all.length?"没有符合筛选条件的单词":"单词本还是空的，去第一章点击粉色单词收藏吧"}</div>`;
    return;
  }
  grid.innerHTML=items.map(item=>`
    <article class="card book-card">
      <div class="book-card-head">
        <button class="icon-btn speak" data-word="${item.word}">🔊</button>
        <h2>${item.word}</h2>
        <span class="badge">${getStatusLabel(item.status)}</span>
      </div>
      <p>${item.meaning||""}</p>
      <p class="muted" style="font-size:12px">${item.source||"托福第一章"}</p>
      <div class="card-actions">
        <select class="status-select" data-word="${item.word}">
          <option value="new" ${item.status==="new"?"selected":""}>新加入</option>
          <option value="learning" ${item.status==="learning"?"selected":""}>学习中</option>
          <option value="mastered" ${item.status==="mastered"?"selected":""}>已掌握</option>
        </select>
        <button class="small-btn delete" data-word="${item.word}">删除</button>
      </div>
    </article>`).join("");
  grid.querySelectorAll(".speak").forEach(btn=>btn.addEventListener("click",()=>speakEnglish(btn.dataset.word)));
  grid.querySelectorAll(".status-select").forEach(select=>select.addEventListener("change",()=>{
    updateWordStatus(select.dataset.word,select.value);render();
  }));
  grid.querySelectorAll(".delete").forEach(btn=>btn.addEventListener("click",()=>{
    removeFromWordbook(btn.dataset.word);render();showToast("已删除");
  }));
}
document.querySelector("#book-search").addEventListener("input",render);
document.querySelectorAll(".filter-btn").forEach(btn=>btn.addEventListener("click",()=>{
  document.querySelectorAll(".filter-btn").forEach(x=>x.classList.remove("active"));
  btn.classList.add("active");currentFilter=btn.dataset.filter;render();
}));
document.querySelector("#clear-book").addEventListener("click",()=>{
  if(confirm("确定清空全部单词吗？")){saveWordbook([]);render();}
});
render();
