//let dates = [];
let cards = {};
let slots = [];
let chars = {};
let queues = {};
let parties = {};
let divQueues = null;
let draggedCard = null;  // 當前拖曳中的卡牌
let selectedCard = null; // 當前點擊選取的卡牌
let selectedParty = null; 
let count_boss = {};
let divDayCols = [];

async function createPageRaidPlan(publish=false){
  cards = {};
  slots = [];
  chars = {};
  queues = {};
  parties = {};
  divQueues = null;
  draggedCard = null; 
  selectedCard = null;
  selectedParty = null; 
  count_boss = {};
  mainNavClick();
  document.getElementById('nav-link-User').className = "nav-link btn btn-blue";
  //document.getElementById('user-menu').classList.remove('show');

  var container = document.getElementById('main-view');
  const response = await fetch('pages/managerRaid.html');
  if (!response.ok) throw new Error('頁面載入失敗');
  const html = await response.text();
  container.innerHTML = html;
  
  var scrollBody = document.getElementById('scroll-body');
  //scrollBody.style = "width:1400px;"
  scrollBody.innerHTML = "";

  var block = document.createElement("div");
  block.id = "schedule-modify-page";
  block.className = "block";
  scrollBody.appendChild(block);

  var div = document.createElement("div");
  div.style = "display: grid; grid-auto-flow: column; justify-content: start; gap: 5px;"
  block.appendChild(div);

  // var btn = document.createElement("button");
  // btn.className = "btn btn-green btn-flex";
  // btn.setAttribute("onclick","alert('可能會刪掉這個按鈕');");
  // btn.innerHTML = "重置" ;
  // div.appendChild(btn);

  var btn = document.createElement("button");
  btn.className = "btn btn-green btn-flex";
  btn.setAttribute("onclick","scheduleSave();");
  btn.innerHTML = "儲存" ;
  div.appendChild(btn);

  var btn = document.createElement("button");
  btn.className = "btn btn-green btn-flex";
  btn.setAttribute("onclick","previewPlan();");
  btn.innerHTML = "預覽發布" ;
  div.appendChild(btn);

  var btn = document.createElement("button");
  btn.className = "btn btn-green btn-flex";
  btn.innerHTML = "下載圖片" ;
  btn.addEventListener('click',async function(e){
    var payload = scheduleGetPayload();
    payload.forEach(date=>{
      date['publish'] = true;
      date['regist'] = true;
    });
    
    var pop = document.createElement('div');
    pop.className = "box";
    pop.style = "position: fixed; top: 50%; left: 50%; z-index:999; transform: translate(-50%, -50%); ";
    document.body.appendChild(pop);

    var preview = document.createElement('div');
    preview.id = 'preview';
    preview.style = "display: grid; grid-auto-flow: column; gap: 6px; background-color: var(--paper-bg);"
    pop.append(preview)
    await createPageRaid(preview,payload);
    preview.querySelectorAll(".highlight").forEach(card=>{
      card.classList.remove("highlight")
    });
    removeHighlights();

    // 將 canvas 轉成圖片 Blob 或 DataURL
    html2canvas(preview).then(canvas => {
      var link = document.createElement('a');
      link.download = 'screenshot.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    });
    pop.remove();
  });
  div.appendChild(btn);

  block.appendChild(createSplitLine());

  var container = document.createElement("div");
  container.className ="plan-grid";
  block.appendChild(container);

  //  queue ///////////////////////////////

  var div = document.createElement("div");
  div.className = "raid-day-column ";
  div.style = "margin-top: 10px; margin-right: 6px; height:756px;";
  container.appendChild(div);

  var divHeader = document.createElement("div");
  divHeader.className = "queue-header boss-default";
  divHeader.innerHTML = "待組區";
  div.appendChild(divHeader);

  var btn = document.createElement("button");
  btn.className = "btn btn-header";
  btn.setAttribute("onclick","addCharAddiction(this)");
  btn.style = "border-radius:0px;"
  btn.innerHTML = "新增角色";
  div.appendChild(btn);

  divQueues = document.createElement("div"); //global
  divQueues.id = "queue";
  divQueues.className = "queue-body boss-default";
  divQueues.style = "overflow-y: scroll;";
  div.appendChild(divQueues);

  // ==================== 3. 手牌區放置與收回事件 (Hand Area) ====================
  // --- 拖曳至手牌區 ---
  divQueues.addEventListener('dragover', (e) => {
  e.preventDefault();
  const isCopy = e.ctrlKey || e.metaKey;
  // 只有當拖曳的卡牌「目前在戰場卡槽」時才顯示 hover 效果
  if (draggedCard && (isCopy || draggedCard.parentElement) !== divQueues) {
    e.dataTransfer.dropEffect = isCopy ? 'copy' : 'move';
    divQueues.classList.add('drag-over');
  }
  });

  divQueues.addEventListener('dragleave', () => {
    divQueues.classList.remove('drag-over');
  });

  divQueues.addEventListener('drop', (e) => {
    e.preventDefault();
    divQueues.classList.remove('drag-over');

    if (draggedCard) {
      const isCopy = e.ctrlKey || e.metaKey;

      if (isCopy) {
        // 按住 Ctrl 時可複製一份到手牌區
        const newCard = cloneCard(draggedCard);
        divQueues.appendChild(newCard);
      } else if (draggedCard.parentElement !== divQueues) {
        // 普通拖曳：從戰場回收回手牌
        moveCardToHand(draggedCard);
      }
    }
  });

  // --- 點擊手牌區背景 (將戰場選取的卡收回) ---
  divQueues.addEventListener('click', (e) => {
  // 若點擊的是手牌區空白處且當前選取的卡牌在戰場上
  if (selectedCard && selectedCard.parentElement !== divQueues && e.target === divQueues) {
      moveCardToHand(selectedCard);
      clearSelection();
  }
  });

  //  days ///////////////////////////////
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
  container.appendChild(divScroll)

  var divContainer = document.createElement("div");
  //divContainer.id = "shift-interactive-area";
  divContainer.style = "font-size: 12px; color: #6b7280; height: 100%;";
  divContainer.className = "plan-grid-container";
  divScroll.appendChild(divContainer)


  var {data: schedule,error} = await supabaseClient.from('schedule').select('date,queue,parties,holiday').eq('publish',publish).order('date', { ascending: true });
  if (error) {alert("資料庫載入: schedule");return;}

  var {data: temp,error} = await supabaseClient.from('characters').select('*');
  if (error) {alert("資料庫載入: characters");return;}
  for (var i in temp){
    chars[temp[i].id] = temp[i];
  }
  delete temp;

  for (var id in schedule){
    var date = schedule[id].date;
    var d = new Date(date+" GMT+8");

    count_boss[date] = {};
    for (var cid in schedule[id].queue) {
      if (!(cid in queues)){ queues[cid] = schedule[id].queue[cid] ;}
    }
    // queues[date] = schedule[id].queue;
    for (var boss in bosses) { count_boss[date][bosses[boss]] = 0; }

    var divCol = document.createElement("div");
    divCol.className = "raid-day-column";
    divCol.setAttribute('date',date);
    divContainer.appendChild(divCol);
    divDayCols.push(divCol);

    var divHeader = document.createElement("div");
    divHeader.className = "raid-day-header";
    if (schedule[id].holiday) {divHeader.className += " holiday";}
    divHeader.innerHTML = week[d.getDay()]+" "+(d.getMonth()+1)+"/"+d.getDate();
    divCol.appendChild(divHeader);

    var divCounter = document.createElement("div");
    divCounter.className = "grid-4";
    divCounter.style = "gap:1px;"
    divHeader.appendChild(divCounter)
    
    var btn = document.createElement("button");
    btn.className = "btn btn-header";
    btn.setAttribute("date",schedule[id].date);
    btn.setAttribute("onclick",'addParty("'+date+'")');
    btn.style = "border-radius:0px;"
    divCol.appendChild(btn);
    btn.innerHTML = "新增隊伍";
    
    var body = document.createElement("div");
    body.id = "body-"+date;
    body.className = "raid-day-body body-"+date;
    body.setAttribute("date",date);
    
    divCol.appendChild(body);
    
    for (var boss in bosses){
      for (var cid in schedule[id].queue){
        var priority = schedule[id].queue[cid]['priority'];
        if (bosses[boss] != priority[0]) {continue;}
        //var times = schedule[id].queue[cid]['times'][schedule[id].date];
        for (var ib in priority){
          count_boss[date][priority[ib]] += 1;
          if (ib >2) {break;}
        }
        // addStatusCard(body,cid,times,priority,chars[cid]);
      }
      var div = document.createElement("div");
      div.className = "card-char-plan-count boss-tag "+boss;
      div.style = "font-size: 0.6rem;"
      div.innerHTML = boss+": "+count_boss[date][boss];
      divCounter.appendChild(div);
    } // boss
    
    // var cards_q = divQueues.querySelectorAll('.card-char');
    // cards_q.forEach(card =>{ cards_queue[card.getAttribute('cid')] = card; });
    
    
    for (var cid in schedule[id].queue){
      if (cid in cards) {continue;}
      if (cid in chars) {
        addDragCard(chars[cid]);
      }
    }
  } //id
  // 加入已儲存隊伍
  for (var id in schedule){
    for (var ip in schedule[id].parties){ addParty(schedule[id].date,schedule[id].parties[ip]); }
  }
  sortQueueCard();

}

function addDragCard(char,plus=false){
  var card = document.createElement("div");
  card.className = "card-char-plan";
  //for (var date in times){ card.className += " d"+date;}
  card.draggable = "true"
  card.setAttribute("cid",char.id);
  if (char.id in cards){
    var cardid = char.id+"-p";
    var tag = document.createElement('span');
    tag.className = 'card-copy-tag';
    tag.textContent = '加場';
    card.appendChild(tag);
  }else{
    var cardid = char.id;
  }

  card.setAttribute("card-id",cardid);
  cards[cardid] = card ;
  card.setAttribute("job",char.job);
  card.setAttribute("attend",0);

  if ((char.id in queues) && ('priority' in queues[char.id])){
    var priority = queues[char.id]['priority'];
    card.setAttribute("boss",priority[0]);
  }else{
    card.setAttribute("boss",'ALL');
  }
  
  var header = document.createElement("div");
  header.className = "card-char-plan-header";
  header.setAttribute('job',char.job);
    
    var div = document.createElement("div");
    div.style = "overflow: hidden;";
    div.innerHTML = char.uname;
    header.appendChild(div);
    
    var div = document.createElement("div");
    div.innerHTML = char.job;
    if (char.MW20){div.innerHTML += " 🍁";}
    header.appendChild(div);
    
    var div = document.createElement("div");
    div.innerHTML =" Lv."+char.level;
    header.appendChild(div);
  card.appendChild(header);
  
  var info = document.createElement("div");
  info.className = "card-char-plan-info";
    var div = document.createElement("div");
    div.innerHTML = attends[char.attend];
    info.appendChild(div)
    
    var div = document.createElement("div");
    div.innerHTML = scrolls[char.scroll];
    info.appendChild(div)
  card.appendChild(info);

  var divBoss = document.createElement("div");
  divBoss.className = "card-char-plan-bosses";
    if (priority){
      for (var i in priority){
        var span = document.createElement("span");
        span.className += "boss-tag "+priority[i];
        span.innerHTML = (Number(i)+1)+":"+priority[i];
        divBoss.appendChild(span)
      }
    }
  card.appendChild(divBoss);

  divQueues.appendChild(card) ;
  setupCardEvents(card);

  var div = document.createElement("div");
  div.className = "card-char-plan-times hidden";
  div.style = "display: flex; flex-wrap: wrap; justify-content: space-around;"
  //div.innerHTML = "⏰"; //+times[0]+"~"+times[1];
  card.appendChild(div)

  var div = document.createElement("div");
  div.className = "card-char-plan-boss";
  card.appendChild(div)

  // if (priority){
  //   for (var i in priority){
  //     var span = document.createElement("span");
  //     span.className += "boss-tag-v1 boss-"+priority[i];
  //     span.innerHTML = (Number(i)+1)+":"+priority[i];
  //     div.appendChild(span)
  //     if (i==3) {break;}
  //   }
  // }else{
  //   var span = document.createElement("span");
  //   span.className += "boss-tag-v1 boss-default";
  //   span.innerHTML = "1 ALL";
  //   div.appendChild(span)
  // }
}

function setupCardEvents(card) {
  // --- 拖曳事件 (Drag Events) ---
  card.addEventListener('dragstart', (e) => {
    draggedCard = card;
    card.classList.add('dragging');
    // 清除點擊選取狀態
    clearSelection();

    // 若拖曳時按住 Ctrl/Cmd，設置效果為 copy，否則為 move
    e.dataTransfer.dropEffect = (e.ctrlKey || e.metaKey) ? 'copy' : 'move';
    
    // 根據卡牌當前位置高亮「可放置目標」
    highlightValidTargets(card);

    // 解決部分瀏覽器 DragText 相關相容問題
    e.dataTransfer.setData('text/plain', card.id);
  });

  card.addEventListener('dragend', () => {
    card.classList.remove('dragging');
    draggedCard = null;
    removeHighlights();
  });

  // --- 點擊事件 (Click/Tap Events) ---
  card.addEventListener('click', (e) => {
    e.stopPropagation(); // 阻止冒泡到 document

    // 若點擊已選取的卡牌，取消選取
    if (selectedCard === card) {
    clearSelection();
    return;
    }

    // 選取新卡牌
    clearSelection();
    selectedCard = card;
    card.classList.add('selected');

    // 高亮可放置目標
    highlightValidTargets(card);
    
  });
}

function addParty(date,party=null){
  var body = document.getElementById('body-'+date);
  var pid = parties.length;
  var divParty = document.createElement("div");
  //divParty.draggable = "true"
  parties[pid] = divParty;
  divParty.setAttribute('pid',pid);
  divParty.setAttribute('date',date);
  body.appendChild(divParty);
  //divParty.style = "";

  if (party){
    var boss = party['boss'];
  }else{
    for (var ib in bosses){var boss = bosses[ib];break;}
  }
  if (boss=="龍王"){
    var nslot = 12;
  }else{
    var nslot = 6;
  }

  divParty.className = "card-party ";
  divParty.setAttribute('boss',boss);

  var divPartyHeader = document.createElement("div");
  divPartyHeader.className = "party-header";
  divPartyHeader.setAttribute('boss',boss)
  divParty.appendChild(divPartyHeader)


  var div = document.createElement("div");
  div.style = "display: flex; gap: 5px";
  divPartyHeader.appendChild(div);
  

  var slt = document.createElement("select");
  slt.setAttribute("onchange","changeBoss(this)");
  slt.style = "text-align: center;"
  slt.className = "boss-slt ";
  divPartyHeader.appendChild(slt);

  for (var ib in bosses){
    var opt = document.createElement("option");
    opt.value = bosses[ib];
    opt.innerHTML = bosses[ib];
    if (bosses[ib]==boss) {opt.selected = true;}
    slt.appendChild(opt)
  }

  var btn = document.createElement("button");
  btn.className = "btn btn-gold btnTime";
  btn.style     = "padding: 2px";
  if (party && ('time' in party)) { 
    divParty.setAttribute('time',party['time']);
    btn.innerHTML = party['time']; 
  }else{
    divParty.setAttribute('time',"20:00");
    btn.innerHTML = "20:00"; 
  }
  btn.addEventListener('click',function(e) {
    var btn = e.target;
    var party = btn.parentNode.parentNode;
    var date  = party.getAttribute('date');
    var local_cards = party.querySelectorAll(".card-char-plan");
    var local_cids = [];

    local_cards.forEach(card=>{ local_cids.push(card.getAttribute('cid'));});

    popbody = createPopUp('h');

    var block0 = document.createElement('div');
    block0.className = "block";
    popbody.appendChild(block0);

    var table = document.createElement('table');
    table.id = "checkboxTable";
    table.className = "ms-table ms-table-paper";
    table.style = "width: 100%; user-select: none;"
    block0.appendChild(table);

    var thead = document.createElement("thead");
    thead.style = "vertical-align: bottom;";
      var row = document.createElement("tr");
        var col = document.createElement("th");
        //col.style = "text-align: left;"
        col.innerHTML = "玩家";
        row.appendChild(col);
        for (var hh=8;hh<23;hh++){
          for (var mm=0;mm<31;mm +=30){
            var col = document.createElement("th");
            col.style = "text-align: left;"
            if (mm==0) {col.innerHTML = (""+hh).padStart(2, '0')+"<br>"+(""+mm).padStart(2, '0');}
            else {col.innerHTML = (""+mm).padStart(2, '0');}
            row.appendChild(col);
          }
        }
        row.appendChild(col);
      thead.appendChild(row);
    table.appendChild(thead);
    var tbody = document.createElement("tbody");
    local_cids.forEach(cid=>{
      if (cid in queues) {
        if (date in queues[cid]['times']){ 
              var row = document.createElement('tr');
                var td = document.createElement('td');
                td.innerHTML = chars[cid].uname;
                row.appendChild(td);
                queues[cid]['times'][date].forEach(check=>{
                  var td = document.createElement('td');
                  td.className = "checkbox-cell";
                    var inp = document.createElement('input');
                    inp.type = "checkbox";
                    inp.className = "checkbox-time";
                    inp.checked = check;
                    inp.disabled = true;
                    td.appendChild(inp);
                  row.appendChild(td);
              tbody.appendChild(row);
            });
          }
        }
      });
    table.appendChild(tbody);


    var block1 = document.createElement('div');
    //block1.className = "block";
    block1.style = "display: grid; grid-auto-flow: column;"
    block0.appendChild(block1);

    var slt = document.createElement("select");
    slt.id = "select-party-time";
    block1.appendChild(slt);
    for (var it in dtimes){
      var opt = document.createElement("option");
      opt.value = dtimes[it];
      opt.innerHTML = dtimes[it];
      slt.appendChild(opt)
    }

    var btnConfirm = document.createElement("button");
    btnConfirm.className = "btn btn-gray";
    btnConfirm.style = "margin: 2px";
    btnConfirm.innerHTML = "確定";
    block1.appendChild(btnConfirm);
    btnConfirm.addEventListener('click', (e)=>{
      var time = document.getElementById("select-party-time").value;
      party.setAttribute('time',time);
      party.querySelector('.btnTime').innerHTML = time;
      var slots_local = party.querySelectorAll(".card-slot");
      slots_local.forEach(card =>{
        card.setAttribute('time',time);
      });
      document.getElementById('popmain').remove();
    });

    var btnExit = document.createElement("button");
    btnExit.className = "btn btn-gray";
    btnExit.style = "margin: 2px";
    btnExit.setAttribute("onclick","document.getElementById('popmain').remove()")
    btnExit.innerHTML = "取消"
    block1.appendChild(btnExit);

    // party.setAttribute('time',inp.value);
    // var slots_local = party.querySelectorAll(".card-slot");
    // slots_local.forEach(card =>{
    //   card.setAttribute('time',inp.value);
    // });
  });
  divPartyHeader.appendChild(btn);

  // var inp = document.createElement('input');
  // inp.type = "text";
  // inp.style = "width: 60px; text-align: center;";
  // inp.className = 'inpTime';
  // if (party && ('time' in party)) { 
  //   divParty.setAttribute('time',party['time']);
  //   inp.value = party['time']; 
  // }else{
  //   divParty.setAttribute('time',"20:00");
  //   inp.value = "20:00"; 
  // }
  // inp.addEventListener('change',function(e) {
  //   var inp = e.target;
  //   var party = inp.parentNode.parentNode;
  //   party.setAttribute('time',inp.value);
  //   var slots_local = party.querySelectorAll(".card-slot");
  //   slots_local.forEach(card =>{
  //     card.setAttribute('time',inp.value);
  //   });
  // });
  // divPartyHeader.appendChild(inp)

  var btn = document.createElement("button");
  btn.setAttribute("onclick","deleteParty(this)");
  btn.style = "color:red; border:none; background:none; cursor:pointer; font-weight:bold; font-size:12px;";
  btn.innerHTML = "❌";
  divPartyHeader.appendChild(btn);

  var grid = document.createElement("div");
  grid.className = "party-body-"+nslot;
  divParty.appendChild(grid);
  for (var i=0;i<nslot;i++){ 
    var slot = addSlot(grid,divParty,i); 
    if (party && party['chars'][i]){
      var cid = party['chars'][i];
      if (cid in cards){ 
        // 已有卡片
        if (cards[cid].getAttribute('attend')=='1'){
          // 加場
          slot.appendChild(cloneCard(cards[cid]));
        }else{
          // 常規
          moveCardToSlot(cards[cid],slot);
        }
      } else{
        // 新增卡片
        addDragCard(chars[cid],true);  
        moveCardToSlot(cards[cid],slot);
      }
    }
  }

  // --- 點擊事件 (Click/Tap Events) ---
  divParty.addEventListener('click', (e) => {
    e.stopPropagation(); // 阻止冒泡到 document

    // 若點擊已選取的卡牌，取消選取
    if (selectedParty === divParty) {
    clearSelection();
    sortQueueCard();
    return;
    }

    // 選取新卡牌
    clearSelection();
    selectedParty = divParty;
    divParty.classList.add('selected');

    // 高亮可放置目標
    //highlightValidTargets(party);
    sortQueueCard(date,divParty.getAttribute('boss'));
  });

}

function addSlot(p,party,i){
  var pid = party.getAttribute('pid');
  var date = party.getAttribute('date');
  var boss = party.getAttribute('boss');
  var time = party.getAttribute('time');
  var slot = document.createElement("div");
  slot.className = "card-slot s"+date;
  slot.id        = date+"-"+i;
  slot.setAttribute('pid',pid);
  slot.setAttribute('date',date);
  slot.setAttribute('boss',boss);
  slot.setAttribute('time',time);
  p.appendChild(slot);
  slots.push(slot);

  // --- 拖曳進出卡槽 ---
  slot.addEventListener('dragover', (e) => {
    e.preventDefault(); // 必須 preventDefault 才能觸發 drop
    // 只有當卡槽為空，且拖曳中的卡牌不在當前卡槽時才允許 hover 效果
    if (!slot.classList.contains('has-card')) {
      // 動態更新拖曳圖示效果
      e.dataTransfer.dropEffect = (e.ctrlKey || e.metaKey) ? 'copy' : 'move';
      slot.classList.add('drag-over');
    }
  });

  slot.addEventListener('dragleave', () => {
    slot.classList.remove('drag-over');
  });

  // --- 放開卡牌 (Drop) ---
  slot.addEventListener('drop', (e) => {
    e.preventDefault();
    slot.classList.remove('drag-over');

    if (draggedCard && !slot.classList.contains('has-card')) {
      const isCopy = e.ctrlKey || e.metaKey;
      const targetCard = isCopy ? cloneCard(draggedCard) : draggedCard;

      moveCardToSlot(targetCard, slot, isCopy);
    }
  });

  // --- 點擊卡槽 (對應點擊選擇邏輯) ---
  slot.addEventListener('click', () => {
    if (selectedCard && !slot.classList.contains('has-card')) {
      moveCardToSlot(selectedCard, slot);
      clearSelection();
    }
  });
  return slot;
}

function changeBoss(current){
  var party = current.parentNode.parentNode;
  var local_cards = party.querySelectorAll(".card-char-plan");
  local_cards.forEach(card=>{
    moveCardToHand(card);
  });
  party.setAttribute('boss',current.value);
  var header = party.querySelector(".party-header");
  header.setAttribute('boss',current.value);
  current.className = "boss-slt ";

  
  var inp = party.querySelector('.btnTime');
  inp.className = "btn btn-gold btnTime boss-"+current.value;

  var grid = party.lastElementChild;
  grid.remove();

  var grid = document.createElement("div");
  party.appendChild(grid);
  if (current.value=="龍王"){
    var nslot = 12;
  }else{
    var nslot = 6;
  }
  grid.className = "party-body-"+nslot;
  for (var i=0;i<nslot;i++){  addSlot(grid,party,i); }

}

function deleteParty(current){
  var party = current.parentNode.parentNode;
  var local_cards = party.querySelectorAll(".card-char-plan");
  local_cards.forEach(card=>{
    moveCardToHand(card);
  });

  party.remove();
  slots = slots.filter(el => el.isConnected);
  sortQueueCard();
}


function scheduleGetPayload (){
  var payload = [];
  var divDates = document.querySelectorAll(".raid-day-column");
  
  divDates.forEach(divDate=>{
    var date = divDate.getAttribute('date');
    //跳過待組區
    if (date){
      var divParties = divDate.querySelectorAll(".card-party");
      if (divParties.length>0){
        var lparties = {};
        for (var ip=0;ip<divParties.length;ip++){
          var time = divParties[ip].getAttribute('time');
          var boss = divParties[ip].getAttribute('boss');
          lparties[ip] = {'time':time,'boss':boss,'chars':[]}
          var lchars = divParties[ip].querySelectorAll('.card-char-plan');
          lchars.forEach(char=>{
            var cid = char.getAttribute('cid');
            lparties[ip]['chars'].push(cid);
          });
        }
        payload.push({date:date,parties:lparties});
      }else{
        payload.push({date:date,parties:{}});
      } 
    }
  });
  return payload;
}

async function previewPlan(){
  var cover = document.createElement('div');
  cover.style = "position: fixed; top: 0; left: 0; z-index:998; width: 100%; height: 100%; background:rgba(0, 0, 0, 0.4);"
  document.body.appendChild(cover);

  var pop = document.createElement('div');
  pop.className = "box";
  pop.style = "position: fixed; top: 50%; left: 50%; z-index:999; transform: translate(-50%, -50%); ";
  cover.appendChild(pop);

  var payload = scheduleGetPayload();
  var schedule = [];
  payload.forEach(date=>{
    if (Object.keys(date.parties).length>0) {schedule.push(date);}
  });


  var preview = document.createElement('div');
  preview.id = 'preview';
  //preview.className = "scroll-h-body";
  preview.style = "display: grid; grid-auto-flow: column; gap: 6px; background-color: #ffffff"
  pop.appendChild(preview)
  createPageRaid(preview,schedule);
  removeHighlights();

  pop.appendChild(createSplitLine())

  var div = document.createElement("div");
  div.style = "display: flex; justify-content: center; "
    var btnAdd = document.createElement("button");
      btnAdd.className = "btn btn-blue";
      btnAdd.style = "margin: 2px";
      btnAdd.setAttribute("onclick","")
      btnAdd.innerHTML = "發布"
      btnAdd.addEventListener('click',async function(e){
        
        var payload = scheduleGetPayload();
        payload.forEach(date=>{
          date['publish'] = true;
          date['regist'] = true;
        });

        // 將 canvas 轉成圖片 Blob 或 DataURL
        var element = document.getElementById('preview');
        html2canvas(element).then(canvas => {
          const link = document.createElement('a');
          link.download = 'screenshot.png';
          link.href = canvas.toDataURL('image/png');
          link.click();
        });

        var {error} = await supabaseClient.from('schedule').upsert(payload);
        if (error) {alert("發布失敗");return;}

        var {data,error} = await supabaseClient.from('profiles').select('id').eq('attend','true');
        if (error) {alert("profiles讀取失敗");return;}
        var uids = [];

        data.forEach(prf=>{
          uids.push(prf.id);
        });

        var {error} = await supabaseClient.from('profiles').update({attend:false,times:{}}).in('id',uids);
        if (error) {alert("profiles更新失敗");return;}

        alert("發布完成");
        e.target.parentNode.parentNode.parentNode.remove()
        schedulePage();

      });
    div.appendChild(btnAdd);

    var btnExit = document.createElement("button");
      btnExit.className = "btn btn-gray";
      btnExit.style = "margin: 2px";
      //btnExit.style     = "position: relative; left: 50%; transform: translate(-50%, 0%);"
      btnExit.setAttribute("onclick","this.parentNode.parentNode.parentNode.remove()")
      btnExit.innerHTML = "取消"
    div.appendChild(btnExit);
  pop.appendChild(div)
  
}

async function scheduleSave(){
  var payload = scheduleGetPayload();
  var {error} = await supabaseClient.from('schedule').upsert(payload);
  if (error) {alert("儲存失敗");}
  alert("儲存完成");
}

function sortQueueCard(date = null, boss = null){
  var crds = divQueues.querySelectorAll('.card-char-plan');
  if (date && boss){
    crds.forEach(card=>{
      var cid = card.getAttribute('cid');
      if (!((cid in queues) && (date in queues[cid]['times']) && queues[cid]['priority'].includes(boss))){
        divQueues.appendChild(card);
      }else{
        card.classList.add("highlight");
      }

    });
  } else { 
    for (var ib in bosses){
      crds.forEach(card=>{
        if (bosses[ib] == card.getAttribute('boss')){ divQueues.appendChild(card);}
      });
    }
  }
}

// ==================== 4. 點擊全域頁面取消選取 ====================
document.addEventListener('click', () => {
  clearSelection();
});

// ==================== 核心邏輯函式 ====================

// 移動卡牌至卡槽
function moveCardToSlot(card, slot, isCopy = false) {
  const oldParent = card.parentElement;
  var date = slot.getAttribute('date');
  var boss = slot.getAttribute('boss');
  var cid = card.getAttribute('cid');
  var cardid = card.getAttribute('card-id');
  
  // 若原先在其他卡槽，釋放舊卡槽狀態
  if (!isCopy && oldParent && oldParent.classList.contains('card-slot')) {
    oldParent.classList.remove('has-card');
  }
  
  // 將卡牌放入新卡槽
  slot.appendChild(card);
  slot.classList.add('has-card');
  
  // 修改卡片
  card.setAttribute("attend",1);
  if (cid in queues){
    var timemark = card.querySelector('.card-char-plan-times');
    var times = queues[cid]['times'];
    if (times[date]){
      var cTimes = getTimeRange(times[date]);
      var priority = queues[cid]['priority'];
      timemark.innerHTML = "<p>⏰"+cTimes[0]+"</p>";
      for (var it=1;it<cTimes.length;it++) { timemark.innerHTML += "<p>⏰"+cTimes[0]+"</p>"}
      if (!priority.includes(boss)) {timemark.innerHTML += "<p style='color: red;'>boss不符</p>"};
    }else{
      timemark.innerHTML = "<p style='color: red;'>日期不符</p>";
    }
    timemark.classList.remove('hidden');
  }

}

// 移動卡牌回手牌區
function moveCardToHand(card, isSilent = false) {
  const oldParent = card.parentElement;
  var cardid = card.getAttribute('card-id')
  var timemark = card.querySelector('.card-char-plan-times');
  timemark.classList.add('hidden');
  card.setAttribute("attend",0);
  
  
  // 若原先在卡槽，釋放該卡槽
  if (oldParent.classList.contains('card-slot')) {
    oldParent.classList.remove('has-card');
  }
  
  // 移動回手牌區
  divQueues.appendChild(card);
}

// 高亮「可放置的目標」
function highlightValidTargets(card) {
  const isInHand = card.parentElement === divQueues;
  var cid = card.getAttribute('cid');

  if (cid in queues){
    for (date in queues[cid]['times']){
      var priority = queues[cid]['priority'];
      var slts = document.querySelectorAll('.s'+date);
      slts.forEach(slot => {
          if (!slot.classList.contains('has-card') && (priority.includes(slot.getAttribute('boss'))) ) {
            slot.classList.add('highlight');
          }
      });
      divDayCols.forEach(divCol=>{
        if (date == divCol.getAttribute('date')){divCol.classList.add('highlight');}
      });
    }
  } else {
    var slts = document.querySelectorAll('.card-slot');
    slts.forEach(slot => {
      if (!slot.classList.contains('has-card') ) {
        slot.classList.add('highlight');
      }
    });
  }

  // 2. 若卡牌「已在戰場卡槽上」，則「手牌區」也是可放置的收回目標
  if (!isInHand) {
      divQueues.classList.add('highlight');
  }
}

// 清除所有高亮與選取狀態
function removeHighlights() {
  var div = document.getElementById("schedule-modify-page");

  if (div){
    divDayCols.forEach(divDayCol=>{
      divDayCol.classList.remove('highlight');
    })

    slots.forEach(slot => {
        slot.classList.remove('highlight', 'drag-over');
    });

    for (var cid in cards) {
      cards[cid].classList.remove('highlight', 'drag-over');
    }
    divQueues.classList.remove('highlight');
    sortQueueCard();
  }
}

function clearSelection() {
  var div = document.getElementById("schedule-modify-page");
  if (div){  
    if (selectedCard) {
        selectedCard.classList.remove('selected');
        selectedCard = null;
    }
    if (selectedParty) {
        selectedParty.classList.remove('selected');
        selectedParty = null;
        sortQueueCard();
    }
    removeHighlights();
  }
}


async function addCharAddiction(btn){
  var p = btn.parentNode;
  pop = createPopUp();

  // var cover = document.createElement('div');
  // cover.style = "position: fixed; top: 0; left: 0; z-index:998; width: 100%; height: 100%; background:rgba(0, 0, 0, 0.4);"
  // document.body.appendChild(cover);

  // var pop = document.createElement('div');
  // pop.className = "box";
  // pop.style = "position: fixed; top: 50%; left: 50%; z-index:999; transform: translate(-50%, -50%); ";
  // cover.appendChild(pop);

  var {data:ausers,error} = await supabaseClient.from('profiles').select('id,username');
  if (error){
    pop.innerHTML = "<p>讀取玩家錯誤！</p>"+
      '<button class="btn btn-blue" onclick="this.parentNode.parentNode.remove()">關閉視窗</button>';
  }

  var span = document.createElement("span");
  span.innerHTML = "篩選條件";
  span.style = "color: #1e40af; font-size: 15px";
  pop.appendChild(span)

  var div = document.createElement("div");
  div.className = "grid-2";
    var col = document.createElement("div");
      var lb = document.createElement("label");
      lb.innerHTML = "玩家";
      col.appendChild(lb);
      var sltUser = document.createElement("select");
      sltUser.id = "auid";
      sltUser.setAttribute("onchange","onUserChange()");
      sltUser.innerHTML = '<option value="">--選擇玩家--</option>';
        for (var i in ausers){
          var opt = document.createElement("option");
          opt.value = ausers[i].id;
          opt.innerHTML = ausers[i].username;
          sltUser.appendChild(opt);
        }
        
      col.appendChild(sltUser);
    div.appendChild(col);
    var col = document.createElement("div");
      var lb = document.createElement("label");
      lb.innerHTML = "職業";
      col.appendChild(lb);
      var sltJob = document.createElement("select");
      sltJob.id = "ajob";
      sltJob.setAttribute("onchange","onJobChange()");
      sltJob.innerHTML = '<option value="">--選擇職業--</option>';
        for (var job in jobs){
          var opt = document.createElement("option");
          opt.value = job;
          opt.innerHTML = jobs[job];
          sltJob.appendChild(opt);
        }
      col.appendChild(sltJob);
    div.appendChild(col);
  pop.appendChild(div);

  pop.appendChild(createSplitLine())
  
  var span = document.createElement("span");
  span.innerHTML = "選擇角色";
  span.style = "color: #1e40af; font-size: 15px";
  pop.appendChild(span)

  var sltCid = document.createElement("select");
  sltCid.id = "acid";
  sltCid.innerHTML = '<option value="">--選擇角色--</option>';
  pop.appendChild(sltCid);


  var tmp  = document.createElement("hr");
  tmp.className = "splitline";
  pop.appendChild(tmp);
  // 最後按鈕
  var div = document.createElement("div");
  div.style = "display: flex; justify-content: center; "
    var btnAdd = document.createElement("button");
      btnAdd.className = "btn btn-blue";
      btnAdd.style = "margin: 2px";
      btnAdd.setAttribute("onclick","onClickAdd()")
      btnAdd.innerHTML = "加入"
    div.appendChild(btnAdd);

    var btnExit = document.createElement("button");
      btnExit.className = "btn btn-gray";
      btnExit.style = "margin: 2px";
      //btnExit.style     = "position: relative; left: 50%; transform: translate(-50%, 0%);"
      btnExit.setAttribute("onclick","document.getElementById('popmain').remove()")
      btnExit.innerHTML = "取消"
    div.appendChild(btnExit);
  pop.appendChild(div)
}
async function onClickAdd(){
  var cid = document.getElementById('acid').value;
  var {data,error} = await supabaseClient.from('characters').select('*').eq('id',cid);
  if (error){alert("讀取角色錯誤！"); return ;}

  addDragCard(data[0]);
  document.getElementById('popmain').remove()
}

async function onUserChange(){
  var uid = document.getElementById('auid').value;
  var job = document.getElementById('ajob').value;
  var sltCid = document.getElementById('acid');

  if (!uid && !job) {return;}
  if (!uid) {onJobChange(); return;}

  var {data,error} = await supabaseClient.from('characters').select('id,uname,job,level,MW20').eq('uid',uid);
  if (error){alert("讀取角色錯誤！"); return ;}

  sltCid.innerHTML = "";
  for (var i in data){
    if (!job || (job == data[i].job) ) {
      var opt = document.createElement("option");
      opt.value = data[i].id;
      opt.innerHTML = data[i].uname+" "+data[i].job+" "+data[i].level;
      if (data[i].MW20) {opt.innerHTML += "🍁";}
      if (i == 0) {opt.selected = true; }
      sltCid.appendChild(opt);
    }
  }
}

async function onJobChange(){
  var uid = document.getElementById('auid').value;
  var job = document.getElementById('ajob').value;
  var sltCid = document.getElementById('acid');

  if (!uid && !job) {return;}
  if (!job) {onUserChange(); return;}

  var {data,error} = await supabaseClient.from('characters').select('id,uname,job,level,MW20,uid').eq('job',job);
  if (error){alert("讀取角色錯誤！"); return ;}

  sltCid.innerHTML = "";
  for (var i in data){
    if (!uid || (uid == data[i].uid) ) {
      var opt = document.createElement("option");
      opt.value = data[i].id;
      opt.innerHTML = data[i].uname+" "+data[i].job+" "+data[i].level;
      if (data[i].MW20) {opt.innerHTML += "🍁";}
      if (i == 0) {opt.selected = true; }
      sltCid.appendChild(opt);
    }
  }
}

function cloneCard(originalCard) {
  const cloned = originalCard.cloneNode(true);
  var cid = originalCard.getAttribute('cid');
  cloned.classList.remove('dragging', 'selected');
  cloned.setAttribute('card-id',cid+'s');
  cards[cid+'s'] = cloned
  //cloned.classList.add('cloned-anim');

  // 添加「複製」視覺小標籤（若未添加過）
  if (!cloned.querySelector('.card-copy-tag')) {
    var tag = document.createElement('span');
    tag.className = 'card-copy-tag';
    tag.textContent = '加場';
    cloned.appendChild(tag);
  }

  // 為新複製的卡牌重新繫結完整事件
  setupCardEvents(cloned);
  return cloned;
}

function calcPartyTime(){
  alert("44456");
}