
const WORDBOOK_KEY = "myWords.wordbook.v1";

function getWordbook(){
  try{
    const raw = localStorage.getItem(WORDBOOK_KEY);
    return raw ? JSON.parse(raw) : [];
  }catch(error){
    console.warn("读取单词本失败", error);
    return [];
  }
}
function saveWordbook(items){
  localStorage.setItem(WORDBOOK_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent("wordbook-changed"));
}
function isWordSaved(word){
  return getWordbook().some(item => item.word.toLowerCase() === word.toLowerCase());
}
function addToWordbook(wordData){
  const items = getWordbook();
  if(items.some(item => item.word.toLowerCase() === wordData.word.toLowerCase())) return false;
  items.unshift({
    ...wordData,
    status:"new",
    addedAt:new Date().toISOString()
  });
  saveWordbook(items);
  return true;
}
function removeFromWordbook(word){
  const items = getWordbook().filter(item => item.word.toLowerCase() !== word.toLowerCase());
  saveWordbook(items);
}
function updateWordStatus(word,status){
  const items = getWordbook();
  const item = items.find(item => item.word.toLowerCase() === word.toLowerCase());
  if(item){ item.status = status; saveWordbook(items); }
}
function speakEnglish(text){
  if(!("speechSynthesis" in window)){
    alert("当前浏览器暂不支持语音朗读");
    return;
  }
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = 0.82;
  speechSynthesis.speak(utterance);
}
function showToast(message){
  let toast = document.querySelector(".toast");
  if(!toast){
    toast=document.createElement("div");
    toast.className="toast";
    document.body.appendChild(toast);
  }
  toast.textContent=message;
  toast.classList.add("show");
  clearTimeout(window.__toastTimer);
  window.__toastTimer=setTimeout(()=>toast.classList.remove("show"),1800);
}
