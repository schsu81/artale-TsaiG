var charCounter=0;
async function createPageRegister(){
  charCounter = 0;

  mainNavClick();
  document.getElementById('nav-link-Register').className = "nav-link btn btn-gold";

  const container = document.getElementById('main-view');
  const response = await fetch('pages/register.html');
  if (!response.ok) throw new Error('頁面載入失敗');
  const html = await response.text();
  container.innerHTML = html;
  var scrollBody = document.getElementById('scroll-body');
  scrollBody.innerHTML = "";

  var div = document.createElement("div");
  div.className = "block";
  scrollBody.appendChild(div);

  var charContainer = document.createElement("div");
  charContainer.id = "characters-container";
  charContainer.style = "border:none; margin:15px 0;" ;
  div.appendChild(charContainer);

  var charBtnNew = document.createElement("button");
  charBtnNew.type = "button";
  charBtnNew.className = "btn btn-blue btn-full";
  //charBtnNew.style = "width:100%; margin-bottom:15px; font-size:13px; background:#0284c7;";
  charBtnNew.innerHTML = "➕ 新增一隻角色 (自由多角出戰)";
  charBtnNew.setAttribute("onclick","addCharacterBlock()");
  div.appendChild(charBtnNew);

  var {data,error} = await supabaseClient.from('profiles').select('chars,times').eq('id',UID).single();
  if (error) {alert("玩家資料讀取錯誤");return;}
  var chars = data.chars;
  var times = data.times;

  var {data,error} = await supabaseClient.from('characters').select('*').in('id',chars).order('level', { ascending: false });
  if (error) {alert("角色資料讀取錯誤");return;}

  if (!chars || chars.length==0){
    addCharacterBlock();
  }else{
    for (i in chars){ addCharacterBlock(data[i]);}
  }

  // 開打時間
  var {data:schedule,error} = await supabaseClient.from('schedule').select('date,holiday').eq('publish',false).order('date', { ascending: true });
  if (error){alert("日期讀取失敗");return;}

  var divTimes = document.createElement("div");
  divTimes.className = "block";
  scrollBody.appendChild(divTimes);

  var h4 = document.createElement("h3");
  h4.innerHTML = "開打時間";
  divTimes.appendChild(h4);

  var contain = document.createElement("div");
  contain.className = "ms-table-container";
  //block.style = "min-width: 800px;"
  divTimes.appendChild(contain);

  var table = document.createElement('table');
  table.id = "checkboxTable";
  table.className = "ms-table ms-table-paper";
  table.style = "width: 100%; user-select: none;"
  contain.appendChild(table);
  var thead = document.createElement("thead");
  thead.style = "vertical-align: bottom;";
    var row = document.createElement("tr");
      var col = document.createElement("th");
      //col.style = "text-align: left;"
      col.innerHTML = "日期";
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
    for (var id in schedule){
      var row = document.createElement('tr');
      var d = new Date(schedule[id].date+" GMT+8");
      row.setAttribute('date',schedule[id].date);
      row.className = "row-date";
        var td = document.createElement('td');
        if (schedule[id].holiday) { td.style = "color: #ff0000;";}
        td.innerHTML = "<p>"+week[d.getDay()]+" "+(d.getMonth()+1)+"/"+d.getDate()+"</p>";
        row.appendChild(td);
        for (var it in dtimes){
          var td = document.createElement('td');
          td.className = "checkbox-cell";
          var inp = document.createElement('input');
          inp.type = "checkbox";
          inp.className = "checkbox-time";
          if (times){
            if (times[schedule[id].date]){ inp.checked = times[schedule[id].date][it];}
          }else{
            if (dtimes[it]>="20:00") { inp.checked = true;}
          }
          td.appendChild(inp);
          row.appendChild(td);
        }
      tbody.appendChild(row);
    }
  table.appendChild(tbody);

  ///////////////////////////////////////////////////////////////////
  // const table = document.getElementById('checkboxTable');
  // console.log(table)
  let isMouseDown = false;
  let targetState = false;

  // 滑鼠按下時啟動選取
  table.addEventListener('mousedown', (e) => {
    const cell = e.target.closest('.checkbox-cell');
    if (!cell) return;

    isMouseDown = true;
    const checkbox = cell.querySelector('.checkbox-time');
    const row = cell.closest('tr');

    targetState = !checkbox.checked;
    checkbox.checked = targetState;
    row.classList.toggle('selected-row', targetState);
  });

  // 滑鼠經過表格列時更新狀態
  table.addEventListener('mouseover', (e) => {
    if (!isMouseDown) return;

    const cell = e.target.closest('.checkbox-cell');
    if (!cell) return;

    const checkbox = cell.querySelector('.checkbox-time');
    const row = cell.closest('tr');

    checkbox.checked = targetState;
    //row.classList.toggle('selected-row', targetState);
  });

  // 滑鼠放開時結束拖曳
  window.addEventListener('mouseup', () => {
    isMouseDown = false;
  });



  //////////////////////////////////////

  var divBtn = document.createElement("div");
  divBtn.className = "block";
  scrollBody.appendChild(divBtn);

  var progress = document.createElement("progress");
  progress.id = "saveProgress";
  progress.style.display = "none";
  progress.max = "100";
  progress.value = "0";
  divBtn.appendChild(progress);

  var charBtnNew = document.createElement("button");
  charBtnNew.id   = "saveButtion";
  charBtnNew.type = "button";
  charBtnNew.className = "btn btn-green btn-full";
  charBtnNew.innerHTML = "💾儲存";
  charBtnNew.onclick = saveBook;
  divBtn.appendChild(charBtnNew);
}

function addCharacterBlock(data) {
    data = data || null;
    charCounter++;
    var idx = charCounter;
    var container = document.getElementById('characters-container');
    if (!container) return;

    var box = document.createElement('div');
    box.className = 'char-box';
    box.id = 'char-box-' + idx;
    container.appendChild(box);
    
    var title = document.createElement('div');
    title.className = "char-title";
    box.appendChild(title);

    var span = document.createElement('span');
    span.style = "font-size: 1rem;";
    span.innerHTML = "⚔️ 出戰角色 #" + idx;
    title.appendChild(span)

    var inp = document.createElement('input');
    inp.id = "cid-"+idx;
    inp.className = "c-cid hidden";
    inp.style = "width: 0px;";
    title.appendChild(inp)

    var deleteBtn = document.createElement('button');
    deleteBtn.type = "button";
    deleteBtn.className = "btn btn-red"
    deleteBtn.style = "color:red; font-size:12px;";
    deleteBtn.innerHTML = "❌ 刪除";
    deleteBtn.setAttribute("onclick",'deleteBookChar("'+idx+'")');
    title.appendChild(deleteBtn);

    var grid = document.createElement('div');
    grid.className = "grid-4";
    grid.style="margin-bottom: 8px;" ;
      var div = document.createElement('div');
        var lb = document.createElement('label');
        lb.innerHTML = "職業 (必填)";
        div.appendChild(lb);
        var slt = document.createElement('select');
        slt.className = "c-job";
          var opt = document.createElement('option');
          opt.value = "";
          opt.innerHTML = "--請選擇--";
          slt.appendChild(opt)
          for (var job in jobs){
            var opt = document.createElement('option');
            opt.value = job;
            opt.innerHTML = jobs[job];
            slt.appendChild(opt)
          }
        div.appendChild(slt);
      grid.appendChild(div);
      var div = document.createElement('div');
        var lb = document.createElement('label');
        lb.innerHTML = "等級 (最高 200)";
        div.appendChild(lb);
        var inp = document.createElement('input');
          inp.type = "number";
          inp.className = "c-level";
          inp.value = 120;
          inp.setAttribute("min",1);
          inp.setAttribute("max",200);
        div.appendChild(inp);
      grid.appendChild(div);
      var div = document.createElement('div');
        var lb = document.createElement('label');
        lb.innerHTML = "出戰型態 (必填)";
        div.appendChild(lb);
        var slt = document.createElement('select');
        slt.className = "c-attend";
          for (var atd in attends){
            var opt = document.createElement('option');
            opt.value = atd;
            opt.innerHTML = attends[atd];
            if (atd=='9') {opt.selected = true;}
            slt.appendChild(opt)
          }
        div.appendChild(slt);
      grid.appendChild(div);
      var div = document.createElement('div');
        var lb = document.createElement('label');
        lb.innerHTML = "突襲券意願 (必填)";
        div.appendChild(lb);
        var slt = document.createElement('select');
        slt.className = "c-scroll";
          for (var scl in scrolls){
            var opt = document.createElement('option');
            opt.value = scl;
            opt.innerHTML = scrolls[scl];
            if (scl=='0') {opt.selected = true;}
            slt.appendChild(opt)
          }
        div.appendChild(slt);
      grid.appendChild(div);
    box.appendChild(grid);


    var div = document.createElement('div');
    div.style = "display: flex; margin-bottom: 8px;";
    box.appendChild(div);

    var lb = document.createElement('label');
    //lb.style = "font-weight:normal; cursor:pointer; color:#1e40af;";
    
    div.appendChild(lb);

    var inp = document.createElement('input');
    inp.type = "checkbox";
    inp.className = "c-mw20";
    //inp.style = "width:auto;";
    lb.appendChild(inp);
    lb.innerHTML += "具備🍁楓祝20 技能";

    box.appendChild(createSplitLine());

    var p = document.createElement('p');
    p.style = "margin-bottom: 4px; color: #4b5563;";
    p.innerHTML = "優先序 (9高意願->1低意願,0不打)";
    box.appendChild(p);
    
    addBossPriority(box);
    

    if (data) {
      box.setAttribute("cid",data.id);
      box.querySelector('.c-cid').value = data.id ?? '';
      box.querySelector('.c-job').value = data.job ?? '';
      box.querySelector('.c-level').value = data.level ?? '120';
      box.querySelector('.c-attend').value = data.attend ?? 9;
      box.querySelector('.c-scroll').value = data.scroll ?? 0;
      box.querySelector('.c-mw20').checked = !!data.MW20;
      if (data.priority){
        for (boss in bosses){ 
          if (boss in data.priority){box.querySelector('.c-'+boss).value = data.priority[boss];}
        }
      }
    }

  
}

function addBossPriority(pdiv){
  var div = document.createElement('div') ; 
  //div.className = "grid-5";
  div.style = "display: flex; justify-content: center; justify-items: center; gap: 5px; margin-bottom: 8px;";
  div.innerHTML = "";
  
  for (boss in bosses) {
    div.innerHTML += 
    '<div style="display: grid; align-items: center; grid-auto-flow: row; margin: 5px;">' +  
      '<h4 class="boss-tag '+boss+'" >'+bosses[boss]+'</h4>'+
      '<div style="display: flex; align-items: center; justify-content: center;">'+
        '<button type="button" class="input-button" style="width: 35px; margin: 1px;" onclick="this.nextElementSibling.stepDown()">-</button>'+
        '<input id="inp-'+boss+'" type="number" class="noArrow c-'+boss+'" style="width: 40px; margin: 1px;" value="1" min=0 max=9 step=1>'+
        '<button type="button" class="input-button" style="width: 35px; margin: 1px;" onclick="this.previousElementSibling.stepUp()">+</button>'+
      '</div>'+
    '</div>';
  }
  pdiv.appendChild(div);
}

async function saveBook(){
  var saveProgress = document.getElementById('saveProgress');
  var saveButtion = document.getElementById('saveButtion');
  var charBoxes = document.querySelectorAll('.char-box');
  if (charBoxes.length === 0) { alert('請至少新增一隻出戰角色！'); return; }
  var {data:schedule,error} = await supabaseClient.from('schedule').select('date,queue').eq('publish',false).order('date', { ascending: true });
  if (error) {alert("schedule 載入失敗");return;}

  // time
  var times = {};
  var dateRows = document.querySelectorAll(".row-date");
  dateRows.forEach(dateRow=>{
    var date = dateRow.getAttribute('date');
    var timeboxes = dateRow.querySelectorAll(".checkbox-time");
    var containT = false;
    times[date] = [];
    timeboxes.forEach(timebox=>{
      times[date].push(timebox.checked);
      if (timebox.checked) {containT=true;}
    });
    if (!containT) { delete times[date];}
  });



  saveProgress.max = charBoxes.length+7;
  var progress = 0;
  saveProgress.style.display = "block";
  saveButtion.style.display = "none";
  payload_char = [];
  payload_queue = [];

  var characters = [];
  for (var i = 0; i < charBoxes.length; i++) {
    var box = charBoxes[i];
    var cid = box.querySelector('.c-cid');
    var job = box.querySelector('.c-job').value;
    var level = parseInt(box.querySelector('.c-level').value || 0, 10);
    if (!job || !level ) { 
      alert('請完整填寫【角色 #' + (i + 1) + '】的所有必填欄位！'); 
      return; 
    }
    var attend = Math.trunc(Number(box.querySelector('.c-attend').value));
    var scroll = Math.trunc(Number(box.querySelector('.c-scroll').value));
    var hasMW20 = box.querySelector('.c-mw20').checked;
    var priority = {};
    for (boss in bosses){ priority[boss] = box.querySelector('.c-'+boss).value;  }

    var listPriority = [];
    var ischange = [false,false,false,false,false,false,false];
    for (var ii=9;ii>0;ii--){
      for (boss in bosses){ if (priority[boss]==ii) {listPriority.push(bosses[boss]);}}
    }


    if (!cid.value) {
      var {data,error} = await supabaseClient.from('characters').insert([
        {uid:UID,uname:Profile.username,job:job,level:level,attend:attend,scroll:scroll,MW20:hasMW20,priority:priority}
      ]).select('id').single();
      if (error){alert("角色新增錯誤"); return;}
      cid.value = data.id;
      characters.push(data.id);
    }else{
      payload_char.push({id:cid.value,job:job,level:level,attend:attend,scroll:scroll,MW20:hasMW20,priority:priority,uname:Profile.username})
      // var {error} = await supabaseClient.from('characters').upsert([
      //   {id:cid.value,job:job,level:level,attend:attend,scroll:scroll,MW20:hasMW20,priority:priority,uname:Profile.username}
      // ]);
      // if (error){alert("角色更新錯誤"); return;}
      characters.push(cid.value);
    }

    for (var id in schedule){
      if (cid.value in schedule[id].queue){
        ischange[id] = true;
        delete schedule[id].queue[cid.value];
      }
      if (attend>0 && (schedule[id].date in times )){
        schedule[id].queue[cid.value] = {'times':times,'priority':listPriority};
        ischange[id] = true;
      }
    }

    progress +=1 ;
    saveProgress.value = progress;
  }
  var {error} = await supabaseClient.from('characters').upsert(payload_char);
  if (error){alert("角色更新錯誤"); return;}

  for (var id in schedule){
    if (ischange[id]) {
      payload_queue.push({date:schedule[id].date,queue:schedule[id].queue});
      // var {error} = await supabaseClient.from('schedule').update({queue:schedule[id].queue}).eq('date',schedule[id].date);
      // if (error) {alert("資料庫更新失敗:schedule day="+id);return;}
    }
    progress +=1 ;
    saveProgress.value = progress;
  }
  var {error} = await supabaseClient.from('schedule').upsert(payload_queue);
  if (error) {alert("資料庫更新失敗:schedule day="+id);return;}

  var {error} = await supabaseClient.from('profiles').update({chars:characters,attend:true,times:times}).eq('id',UID);
  if (error) {alert("資料庫更新失敗:characters");return;}
  progress +=1 ;
  saveProgress.value = progress;
  alert("更新完成");
  createPageRegister();
}

async function deleteBookChar(idx){
  var div = document.getElementById('char-box-'+idx );
  var cid = div.querySelector('.c-cid').value;

  if (cid){
    var {error} = await supabaseClient.from('characters').delete().eq('id',cid);
    if (!error) { 
      var newchars = [];
      var {data, error} = await supabaseClient.from('profiles').select('chars').eq('id',UID).single();
      for (char in data.chars){
        if (data.chars[char] == cid){continue;}
        newchars.push(data.chars[char]);
      }
      var {error} = await supabaseClient.from('profiles').update({chars:newchars}).eq('id',UID);
      if (error) {alert("資料庫刪除失敗");return;}

    }
  }
  div.remove()
}
