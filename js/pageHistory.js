//let chars = {};
async function createPageHistory(){
  mainNavClick();
  document.getElementById('nav-link-History').className = "nav-link btn btn-gold";

  const container = document.getElementById('main-view');
  const response = await fetch('pages/history.html');
  if (!response.ok) throw new Error('頁面載入失敗');
  const html = await response.text();
  container.innerHTML = html;
  var scrollBody = document.getElementById('scroll-body');

  var divScroll = document.createElement("div");
  divScroll.className = "plan-scroll-wrapper";
  divScroll.addEventListener('wheel', (e) => {
    // 檢查目前是否還能橫向捲動
    const canScrollLeft = divScroll.scrollLeft > 0;
    const canScrollRight = divScroll.scrollLeft < (divScroll.scrollWidth - divScroll.clientWidth);

    // 如果在可以橫向捲動範圍內，截斷預設的縱向滾動並轉為橫向
    if ((e.deltaY*2 > 0 && canScrollRight) || (e.deltaY*2 < 0 && canScrollLeft)) {
      e.preventDefault();
      divScroll.scrollLeft += e.deltaY*2;
    }
  }, { passive: false });
  scrollBody.appendChild(divScroll)

  var divContainer = document.createElement("div");
  //divContainer.id = "shift-interactive-area";
  divContainer.style = "color: #6b7280;";
  divContainer.className = "plan-grid-container";
  divScroll.appendChild(divContainer)

  var {data: history, error} = await supabaseClient.from('history').select('date,holiday,parties').order('date', { ascending: true });
  if (error) {alert("歷史資料讀取錯誤");return;}
  var {data: characters, error} = await supabaseClient.from('characters').select('id,job,uid,uname');
  if (error) {alert("角色資料讀取錯誤");return;}
  for (var ic in characters) { chars[characters[ic].id] = characters[ic]; }

  for (var id in history){
    dayBody = createRaidDay(divContainer,history[id]);
    
    for (var ip in history[id].parties){
      party = createRaidParty(dayBody,history[id].parties[ip]);
    }

  }

}
