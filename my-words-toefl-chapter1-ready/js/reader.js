
const data = window.CHAPTER_DATA;
const wordMap = new Map(data.words.map(item=>[item.word.toLowerCase(),item]));
const article = document.querySelector("#story-content");
const wordList = document.querySelector("#word-list");
const sidePanel = document.querySelector("#side-panel");
const progressKey = "myWords.reader.toefl-chapter-1";

function escapeHtml(value){
  return value.replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[ch]));
}
function escapeRegExp(value){return value.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");}

function decorateParagraph(text){
  let html=escapeHtml(text);
  const sorted=[...data.words].sort((a,b)=>b.word.length-a.word.length);
  sorted.forEach(item=>{
    const token=`${item.word}（${item.meaning}）`;
    const regex=new RegExp(escapeRegExp(token),"gi");
    html=html.replace(regex,match=>{
      const wordPart=match.slice(0,item.word.length);
      return `<button class="vocab" type="button" data-word="${escapeHtml(item.word)}"><span class="word-text">${escapeHtml(wordPart)}</span><span class="inline-meaning">（${escapeHtml(item.meaning)}）</span></button>`;
    });
  });
  return html;
}

function renderStory(){
  article.innerHTML=data.paragraphs.map((p,index)=>`
    <p class="story-paragraph" id="p-${index+1}">
      <span class="paragraph-no">${index+1}</span>
      ${decorateParagraph(p)}
    </p>`).join("");
  article.querySelectorAll(".vocab").forEach(button=>{
    button.addEventListener("click",()=>selectWord(button.dataset.word,true));
  });
}
function renderWordList(filter=""){
  const q=filter.trim().toLowerCase();
  wordList.innerHTML=data.words
    .filter(item=>!q||item.word.toLowerCase().includes(q)||item.meaning.includes(q))
    .map(item=>{
      const saved=isWordSaved(item.word);
      return `<article class="word-card" data-word="${escapeHtml(item.word)}">
        <div class="word-card-head">
          <span class="word-number">${String(item.index).padStart(2,"0")}</span>
          <button class="icon-btn speak-word" title="播放发音" data-word="${escapeHtml(item.word)}">🔊</button>
          <h3>${escapeHtml(item.word)}</h3>
        </div>
        <p class="word-meaning">${escapeHtml(item.meaning)}</p>
        <button class="add-word ${saved?"saved":""}" data-word="${escapeHtml(item.word)}">${saved?"✓ 已加入单词本":"+ 加入单词本"}</button>
      </article>`;
    }).join("");
  wordList.querySelectorAll(".speak-word").forEach(btn=>btn.addEventListener("click",()=>speakEnglish(btn.dataset.word)));
  wordList.querySelectorAll(".add-word").forEach(btn=>btn.addEventListener("click",()=>toggleWord(btn.dataset.word)));
  wordList.querySelectorAll(".word-card").forEach(card=>card.addEventListener("click",event=>{
    if(event.target.closest("button")) return;
    selectWord(card.dataset.word,false);
  }));
}
function toggleWord(word){
  const item=wordMap.get(word.toLowerCase());
  if(isWordSaved(word)){
    removeFromWordbook(word);
    showToast(`已从单词本移除：${word}`);
  }else{
    addToWordbook({...item,source:data.title,chapterId:data.id});
    showToast(`已加入单词本：${word}`);
  }
  renderWordList(document.querySelector("#word-search").value);
  selectWord(word,false);
}
function selectWord(word,openMobile){
  document.querySelectorAll(".vocab.active,.word-card.active").forEach(el=>el.classList.remove("active"));
  document.querySelectorAll(`.vocab[data-word="${CSS.escape(word)}"]`).forEach(el=>el.classList.add("active"));
  const card=[...document.querySelectorAll(".word-card")].find(el=>el.dataset.word.toLowerCase()===word.toLowerCase());
  if(card){
    card.classList.add("active");
    card.scrollIntoView({block:"nearest",behavior:"smooth"});
  }
  if(openMobile && window.innerWidth<=900) sidePanel.classList.add("mobile-open");
}
function updateProgress(){
  const docHeight=document.documentElement.scrollHeight-window.innerHeight;
  const percent=docHeight>0?Math.min(100,Math.max(0,window.scrollY/docHeight*100)):0;
  document.querySelector("#reading-progress").style.width=`${percent}%`;
  localStorage.setItem(progressKey,JSON.stringify({scrollY:window.scrollY,percent,updatedAt:Date.now()}));
}
function loadSavedProgress(){
  try{
    const saved=JSON.parse(localStorage.getItem(progressKey)||"null");
    if(saved?.scrollY>120) setTimeout(()=>window.scrollTo({top:saved.scrollY,behavior:"smooth"}),250);
  }catch{}
}
renderStory();
renderWordList();

document.querySelector("#word-search").addEventListener("input",event=>renderWordList(event.target.value));
document.querySelector("#toggle-meaning").addEventListener("click",event=>{
  document.body.classList.toggle("hide-meanings");
  event.currentTarget.querySelector(".label-text").textContent=document.body.classList.contains("hide-meanings")?"显示中文":"隐藏中文";
});
document.querySelector("#toggle-highlight").addEventListener("click",event=>{
  document.body.classList.toggle("hide-highlights");
  event.currentTarget.querySelector(".label-text").textContent=document.body.classList.contains("hide-highlights")?"显示重点词":"隐藏重点词";
});
let fontSize=18;
document.querySelector("#font-down").addEventListener("click",()=>{
  fontSize=Math.max(15,fontSize-1);
  document.querySelectorAll(".story-paragraph").forEach(el=>el.style.fontSize=`${fontSize}px`);
});
document.querySelector("#font-up").addEventListener("click",()=>{
  fontSize=Math.min(24,fontSize+1);
  document.querySelectorAll(".story-paragraph").forEach(el=>el.style.fontSize=`${fontSize}px`);
});
document.querySelector("#toggle-original").addEventListener("click",()=>{
  const section=document.querySelector("#original-section");
  section.hidden=!section.hidden;
  if(!section.hidden)section.scrollIntoView({behavior:"smooth",block:"start"});
});
document.querySelector("#mobile-word-toggle").addEventListener("click",()=>sidePanel.classList.toggle("mobile-open"));
document.querySelector("#close-word-panel").addEventListener("click",()=>sidePanel.classList.remove("mobile-open"));
window.addEventListener("scroll",updateProgress,{passive:true});
window.addEventListener("wordbook-changed",()=>renderWordList(document.querySelector("#word-search").value));
loadSavedProgress();
updateProgress();
