let profiles = {};
async function createPageCharacters(){
  mainNavClick();
  document.getElementById('nav-link-User').className = "nav-link btn btn-blue";
  //document.getElementById('user-menu').classList.remove('show');

  const container = document.getElementById('main-view');
  const response = await fetch('pages/managerCharacters.html');
  if (!response.ok) throw new Error('頁面載入失敗');
  const html = await response.text();
  container.innerHTML = html;
  
  var scrollBody = document.getElementById('scroll-body');
  scrollBody.innerHTML = "";

  var block = document.createElement("div");
  block.style = " max-width: 900px";
  block.className = "block";
  scrollBody.appendChild(block);

  var row = document.createElement("div");
  row.className = "grid-5 char-box";
  block.appendChild(row);

  var div = document.createElement("div");
  div.style = "display:grid; grid-auto-flow: row;"
    var lb = document.createElement("label");
    lb.innerHTML = "玩家";
    div.append(lb);
    var inp = document.createElement('input');
    inp.id = "newCharUname";
    div.appendChild(inp);
  row.appendChild(div);

  var div = document.createElement("div");
  div.style = "display:grid; grid-auto-flow: row;"
    var lb = document.createElement("label");
    lb.innerHTML = "職業";
    div.append(lb);
    var slt = createCharJobSelection();
    slt.id = "newCharJob";
    div.appendChild(slt);
  row.appendChild(div);

  var div = document.createElement("div");
  div.style = "display:grid; grid-auto-flow: row;"
    var lb = document.createElement("label");
    lb.innerHTML = "等級";
    div.append(lb);
    var inp = createCharLevelInput();
    inp.style = "text-align: center;";
    inp.id = "newCharLevel";
    div.appendChild(inp);
  row.appendChild(div);

  var div = document.createElement("div");
  div.style = "display:grid; grid-auto-flow: row; justify-content: left;"
    var lb = document.createElement("label");
    lb.innerHTML = "楓祝20";
    div.append(lb);
    var chk = document.createElement("input");
    chk.id = "newCharMW20";
    chk.className = "MW20";
    chk.type = "checkbox";
    div.appendChild(chk);
  row.appendChild(div);

  var div = document.createElement("div");
  div.style = "display:flex"
    var btn = document.createElement("button");
    btn.className = "btn btn-green btn-flex";
    btn.setAttribute("onclick","addNewChar(this.parentNode.parentNode)")
    btn.innerHTML = "新增角色" ;
    div.appendChild(btn);
  row.appendChild(div);

  var {data:profile, error } = await supabaseClient.from('profiles').select('id,username,chars');
  if (error){ alert("資料載入失敗");return;  }
  for (var i in profile){
    profiles[profile[i].id] = profile[i];
  }

  var block = document.createElement("div");
  //block.style = " max-width: 900px";
  block.className = "block";
  scrollBody.appendChild(block);

  var row = document.createElement("div");
  //row.className = "grid-5 char-box";
  row.style = "display: grid; grid-auto-flow: column; justify-items: center; gap: 5px;";
  block.appendChild(row);

  var slt = document.createElement("select");
  slt.id = "suid";
    var opt = document.createElement("option");
    opt.value = "";
    opt.innerHTML = "--選擇玩家--";
    slt.appendChild(opt);
    for (var i in profile){
      var opt = document.createElement("option");
      opt.value = profile[i].id;
      opt.innerHTML = profile[i].username;
      slt.appendChild(opt);
    }
  row.appendChild(slt);

  var slt = document.createElement("select");
  slt.id = "sjob";
    var opt = document.createElement("option");
    opt.value = "";
    opt.innerHTML = "--選擇職業--";
    slt.appendChild(opt);
    for (var job in jobs){
      var opt = document.createElement("option");
      opt.value = job;
      opt.innerHTML = jobs[job];
      slt.appendChild(opt);
    }
  row.appendChild(slt);
  
  var btn = document.createElement("button");
  btn.className = "btn btn-green btn-flex";
  btn.setAttribute("onclick","createCharTable();")
  btn.innerHTML = "載入資料" ;
  row.appendChild(btn);

  block.appendChild(createSplitLine());

  var table = document.createElement('table');
  table.className = "ms-table ms-table-paper";
    var thead = document.createElement('thead');
      var tr = document.createElement('tr');
        var th = document.createElement('th');
        th.innerHTML = "選取";
        tr.appendChild(th);
        var th = document.createElement('th');
        th.innerHTML = "玩家";
        tr.appendChild(th);
        var th = document.createElement('th');
        th.innerHTML = "職業";
        tr.appendChild(th);
        var th = document.createElement('th');
        th.innerHTML = "等級";
        tr.appendChild(th);
        var th = document.createElement('th');
        th.innerHTML = "楓20";
        tr.appendChild(th);
        var th = document.createElement('th');
        th.innerHTML = "報名";
        tr.appendChild(th);
        var th = document.createElement('th');
        th.innerHTML = "狀態";
        tr.appendChild(th);
      thead.appendChild(tr);
    table.appendChild(thead);
  block.appendChild(table);


  
  var maintable = document.createElement("tbody");
  maintable.id = "maintable";
  maintable.innerHTML = "請設定篩選條件後載入資料。"
  table.appendChild(maintable);
  
  
  block.appendChild(createSplitLine());
  var div = document.createElement("div");
  div.style = "display: flex; justify-content: center; gap: 5px;"
  block.appendChild(div);
  
  var btn = document.createElement("button");
  btn.className = "btn btn-green";
  btn.onclick  = saveChar;
  btn.innerHTML = "儲存" ;
  div.appendChild(btn);

  var btn = document.createElement("button");
  btn.className = "btn btn-red";
  btn.onclick  = deleteChar;
  btn.innerHTML = "刪除" ;
  div.appendChild(btn);
}

async function createCharTable(){
  var suid = document.getElementById("suid").value;
  var sjob = document.getElementById("sjob").value;
  
  if ( suid && sjob ){
    var {data, error } = await supabaseClient.from('characters').select('id,job,level,MW20,attend,uid,uname').eq('uid',suid).eq('job',sjob).order('level',{ ascending: false });
  } 
  else if ( suid ){
    var {data, error } = await supabaseClient.from('characters').select('id,job,level,MW20,attend,uid,uname').eq('uid',suid).order('level',{ ascending: false });
  }
  else if ( sjob ){
    var {data, error } = await supabaseClient.from('characters').select('id,job,level,MW20,attend,uid,uname').eq('job',sjob).order('level',{ ascending: false });
  }else{
    var {data, error } = await supabaseClient.from('characters').select('id,job,level,MW20,attend,uid,uname').order('level',{ ascending: false });
  }
  if (error){ alert("資料載入失敗");return;  }

  var maintable = document.getElementById('maintable');
  maintable.innerHTML = "";
  if (data.length == 0){
    maintable.innerHTML = "找不到角色，請重新篩選";
    return;
  }

  for (var i in data){
    var char = data[i];

    var tr = document.createElement('tr');
    tr.className = "divChar";
    tr.setAttribute('cid',char.id);
      var td = document.createElement('td');
        var chk = document.createElement("input");
        chk.className = "ischange";
        chk.type = "checkbox";
        td.appendChild(chk);
      tr.appendChild(td);
      var td = document.createElement('td');
        var p = document.createElement("p");
        p.innerHTML = char.uname;
        td.appendChild(p);
      tr.appendChild(td);
      var td = document.createElement('td');
        var slt = createCharJobSelection(char.job);
        slt.classList.add('c-job');
        td.appendChild(slt);
      tr.appendChild(td);
      var td = document.createElement('td');
        var inp = createCharLevelInput(char.level);
        inp.style =  "text-align: center;";
        inp.classList.add('c-level');
        td.appendChild(inp);
      tr.appendChild(td);
      var td = document.createElement('td');
        var chk = document.createElement("input");
        chk.className = "MW20";
        chk.type = "checkbox";
        td.appendChild(chk);
        if (char.MW20) { chk.checked = true;}
        chk.addEventListener('click',function(e){
          e.target.parentNode.parentNode.querySelector('.ischange').checked = true;
        });
      tr.appendChild(td);
      var td = document.createElement('td');
        var p = document.createElement("p");
        if (char.attend){
          p.style = "color: #009600;"
          p.innerHTML = '出戰';
        }else{
          p.style = "color: #ec0000;"
          p.innerHTML = '不出戰';
        }
        td.appendChild(p);
      tr.appendChild(td);
      var td = document.createElement('td');
        if ( !(char.uid && profiles[char.uid].chars && profiles[char.uid].chars.includes(char.id)) ){
          var btn = document.createElement("button");
          btn.className = "btn btn-green";
          btn.innerHTML = "角色需歸戶" ;
          // onclick
          btn.addEventListener('click',function(e){
            var btn = e.target;
            var bcid = btn.parentNode.parentNode.getAttribute('cid');
            pop = createPopUp();

            var sltUser = document.createElement('select');
            sltUser.id = 'bind-uid';
            sltUser.setAttribute('bcid',bcid);
              for (var id in profiles){
                var opt = document.createElement('option');
                opt.value = id;
                opt.innerHTML = profiles[id].username;
                sltUser.appendChild(opt);
              }
            pop.appendChild(sltUser);
            var sltChar = document.createElement('select');
            sltChar.id = 'bind-cid';
            sltChar.innerHTML = "<option value=''>---可不選角色---</option>";
            pop.appendChild(sltChar);
            sltUser.addEventListener('change', async function(e){
              var { data, error } = await supabaseClient.from('characters').select('id,job,level,uname').eq('uid',sltUser.value);
              if (error) {alert("讀取資料錯誤");return;}
              for (var ic in data){
                var opt = document.createElement('option');
                opt.value = data[ic].id;
                opt.innerHTML = data[ic].uname+" "+data[ic].job+" "+data[ic].level;
                sltChar.appendChild(opt);
              }
            });
            

            var div = document.createElement('div');
            div.className = "grid-2";
            pop.append(div);

            var btnsave = document.createElement("button");
            btnsave.className = "btn btn-green";
            btnsave.style = "margin: 2px";
            //btnExit.style     = "position: relative; left: 50%; transform: translate(-50%, 0%);"
            btnsave.innerHTML = "確定"
            btnsave.addEventListener('click',async function(e){
              var buid = sltUser.value;
              var bcid = sltUser.getAttribute('bcid');
              var tcid = sltChar.value;
              var chars = profiles[buid].chars;
              if (tcid) {
                var { data, error } = await supabaseClient.from('schedule').select('date,parties').eq('publish',true);
                if (error) {alert("突襲資料圖取失敗");document.getElementById('popmain').remove();   return;}
                for (var id in data){
                  for (var ip in data[id].parties) {
                    for (var ic in data[id].parties[ip]['chars']) {
                      if (data[id].parties[ip]['chars'][ic]==bcid){
                        data[id].parties[ip]['chars'][ic] = tcid ;
                        var {  error } = await supabaseClient.from('schedule').update([{parties:data[id].parties}]).eq('date',data[id].date);
                        if (error) {alert("突襲更新失敗");document.getElementById('popmain').remove();   return;}
                      }
                    }
                  }
                }

                var { data, error } = await supabaseClient.from('history').select('date,parties');
                if (error) {alert("歷史資料圖取失敗");document.getElementById('popmain').remove();   return;}
                for (var id in data){
                  for (var ip in data[id].parties) {
                    for (var ic in data[id].parties[ip]['chars']) {
                      if (data[id].parties[ip]['chars'][ic]==bcid){
                        data[id].parties[ip]['chars'][ic] = tcid ;
                        var {  error } = await supabaseClient.from('history').update([{parties:data[id].parties}]).eq('date',data[id].date);
                        if (error) {alert("歷史更新失敗");document.getElementById('popmain').remove();   return;}
                      }
                    }
                  }
                }
                var { error } = await supabaseClient.from('characters').delete().eq('id',bcid);
                if (error) {alert("舊角色刪除失敗");document.getElementById('popmain').remove();   return;}
              }else{    
                var { error } = await supabaseClient.from('characters').update([{uid:buid,uname:profiles[buid].username}]).eq('id',bcid);
                if (error) {alert("角色更新失敗");document.getElementById('popmain').remove();   return;}
                if (chars){
                  chars.push(bcid);
                }else{
                  chars = [bcid];
                }
                var { error } = await supabaseClient.from('profiles').update([{chars:chars}]).eq('id',buid);
                if (error) {alert("帳號更新失敗");document.getElementById('popmain').remove();   return;} 
              }

              document.getElementById('popmain').remove();  
              createPageCharacters();      
            });
            div.appendChild(btnsave);

            var btnExit = document.createElement("button");
            btnExit.className = "btn btn-gray";
            btnExit.style = "margin: 2px";
            //btnExit.style     = "position: relative; left: 50%; transform: translate(-50%, 0%);"
            btnExit.setAttribute("onclick","document.getElementById('popmain').remove();")
            btnExit.innerHTML = "取消"
            div.appendChild(btnExit);
          });
          td.appendChild(btn);
        }
      tr.appendChild(td);
    maintable.appendChild(tr);
  }  
}

async function saveChar(){
  var divChars = document.querySelectorAll('.divChar');
  var payload = [];
  
  divChars.forEach(divChar=>{
    if (divChar.querySelector(".ischange").checked) { 
      var cid = divChar.getAttribute('cid');
      var job = divChar.querySelector('.c-job').value;
      var level = divChar.querySelector('.c-level').value;
      var MW20 = divChar.querySelector('.MW20').checked;
      payload.push({id:cid,job:job,level:level,MW20:MW20});
    }

  });
  //console.log(payload);
  var {error} = await supabaseClient.from('characters').upsert(payload);
  if (error) { alert("更新失敗");return;}
  createPageCharacters();
  // var {data, error } = await supabaseClient.from('characters').select('id,job,level,MW20,attend,uid,uname').order('level',{ ascending: false });
  // if (error) { alert("讀取失敗");return;}
  // createCharTable(data);
}

async function deleteChar(){
  var divChars = document.querySelectorAll('.divChar');
  var payload = [];
  
  divChars.forEach(divChar=>{
    if (divChar.querySelector(".ischange").checked) { 
      var cid = divChar.getAttribute('cid');
      payload.push(cid);
    }

  });
  var {error} = await supabaseClient.from('characters').delete().in('id',payload);
  if (error) { alert("刪除失敗");return;}
  createPageCharacters();

  // var {data, error } = await supabaseClient.from('characters').select('id,job,level,MW20,attend,uid,uname').order('level',{ ascending: false });
  // if (error) { alert("讀取失敗");return;}
  // createCharTable(data);
}

async function addNewChar(p){
  var uname = p.querySelector("#newCharUname").value;
  var job = p.querySelector("#newCharJob").value;
  var level = p.querySelector("#newCharLevel").value;
  var MW20 = p.querySelector("#newCharMW20").checked;

  var {error} = await supabaseClient.from('characters').insert([{uname:uname,job:job,level:level,MW20:MW20}]);
  if (error) { alert("新增失敗");return;}
  createPageCharacters();
  // var {data, error } = await supabaseClient.from('characters').select('id,job,level,MW20,attend,uid,uname').order('level',{ ascending: false });
  // if (error) { alert("讀取失敗");return;}
  // createCharTable(data);
}

