async function createPageCalendar(){
  mainNavClick();
  document.getElementById('nav-link-User').className = "nav-link btn btn-blue";
  //document.getElementById('user-menu').classList.remove('show');

  const container = document.getElementById('main-view');
  const response = await fetch('pages/managerCalendar.html');
  if (!response.ok) throw new Error('頁面載入失敗');
  const html = await response.text();
  container.innerHTML = html;
  
  var scrollBody = document.getElementById('scroll-body');
  scrollBody.style = "min-width:900px;"
  scrollBody.innerHTML = "";

  var block = document.createElement("div");
  //card.style = " display: flex;";
  block.className = "block";
  scrollBody.appendChild(block);

  var div = document.createElement("div");
  div.style = "display: flex; gap: 5px";
  block.appendChild(div);

  var d = new Date();
  var inp = document.createElement("input");
  inp.id = "setDate";
  inp.type = "date";
  inp.style = "width: max-content;";
  inp.value = d.getFullYear()+"-"+(d.getMonth()+1)+"-"+(""+d.getDate()).padStart(2, '0');
  div.appendChild(inp);
  var btn = document.createElement("button");
  btn.className = "btn btn-green";
  btn.setAttribute("onclick","addCalendarDay(this.previousElementSibling)")
  btn.innerHTML = "新增一日" ;
  div.appendChild(btn);

  var btn = document.createElement("button");
  btn.className = "btn btn-green";
  //btn.setAttribute("onclick","scheduleCalcDate(data);");
  btn.onclick  = calendarCalcDate;
  btn.innerHTML = "新增一週" ;
  div.appendChild(btn);

  block.appendChild(createSplitLine());

  var maintable = document.createElement("div");
  maintable.id = "maintable";
  maintable.className = "schedule-day-column";
  block.appendChild(maintable);

  var {data,error}  = await supabaseClient.from('schedule').select('date,holiday,regist,publish').order('date',{ ascending: false });
  if (error){ alert("資料載入失敗");return;  }

  createCalendarTable(data);

  block.appendChild(createSplitLine());

  var div = document.createElement("div");
  div.style = "display: flex; justify-content: center; gap: 5px;"
  block.appendChild(div);

  var btn = document.createElement("button");
  btn.className = "btn btn-green";
  btn.onclick  = saveCalendar;
  btn.innerHTML = "儲存" ;
  div.appendChild(btn);

  var btn = document.createElement("button");
  btn.className = "btn btn-blue";
  btn.onclick  = move2History;
  btn.innerHTML = "封存" ;
  div.appendChild(btn);

  var btn = document.createElement("button");
  btn.className = "btn btn-red";
  btn.onclick  = deleteCalendar;
  btn.innerHTML = "刪除" ;
  div.appendChild(btn);
}

function createCalendarTable(data){
  var maintable = document.getElementById('maintable');
  maintable.innerHTML = "";

  var row = document.createElement("div");
  row.className = "grid-5";
  row.innerHTML = "<h4>選取</h4>"+
                  "<h4>日期</h4>"+
                  "<h4>假日</h4>"+
                  "<h4>開放報名</h4>"+
                  "<h4>發布狀態</h4>";
  maintable.appendChild(row);

  for (var i in data){
    var date = data[i];
    var d = new Date(date.date+" GMT+8");

    if (i%7==0) {
      maintable.appendChild(createSplitLine());
    }
    
    var row = document.createElement("div");
    row.style = "margin: 2px; justify-items: center;"
    row.className = "grid-5 divDate";
    row.setAttribute("date",date.date);
    maintable.appendChild(row);

    var chk = document.createElement("input");
    chk.className = "ischange";
    chk.type = "checkbox";
    row.appendChild(chk);
  
    var p = document.createElement("p");
    p.innerHTML = date.date+" "+week[d.getDay()];
    row.appendChild(p);

    var chk = document.createElement("input");
    chk.className = "isholiday";
    chk.type = "checkbox";
    row.appendChild(chk);
    if (date.holiday) { chk.checked = true;}
    chk.addEventListener('click',function(e){
      e.target.parentNode.querySelector('.ischange').checked = true;
    });

    var chk = document.createElement("input");
    chk.className = "isregist";
    chk.type = "checkbox";
    row.appendChild(chk);
    if (date.regist) { chk.checked = true;}
    chk.addEventListener('click',function(e){
      e.target.parentNode.querySelector('.ischange').checked = true;
    });
  
    var p = document.createElement("p");
    if (date.publish){
      p.style = "color: #009600;"
      p.innerHTML = '已發布';
    }else{
      p.style = "color: #ec0000;"
      p.innerHTML = '未發布';
    }
    row.appendChild(p);
  }  
}

async function calendarCalcDate(){
  var inp = document.getElementById('setDate');
  var now = new Date(inp.value+" GMT+8");
  var holiday = false;
  var payload = [];

  var current = new Date(now.getTime() +86400*1000. );

  while (current.getDay() != 2) { var current = new Date(current.getTime() +86400*1000. ); }

  for (var i=1;i<8;i++) {
    var d = current.getFullYear()+"-"+(current.getMonth()+1)+"-"+current.getDate();
    if (current.getDay()==0 || current.getDay()==6) {holiday=true;} else {holiday=false;}
    payload.push({date:d,holiday:holiday});
    var current = new Date(current.getTime() +86400*1000. );
  }
  var {error} = await supabaseClient.from('schedule').insert(payload)
  if (error) {
    var msg = '日期新增失敗: 請調整起始日期\n'
    payload.forEach(date=>{
      msg += date.date+" \n"
    });
    alert(msg);
    return; 
  }

  createPageCalendar();
}

async function addCalendarDay(inp){
  var d = inp.value;
  if (!d) {alert("請輸入日期");return;}
  var date = new Date(d);
  if (date.getDay()==0 || date.getDay()==6) {var holiday=true;} else {var holiday=false;}
  var {error} = await supabaseClient.from('schedule').insert([{date:d,holiday:holiday}]);
  if (error) { alert("日期新增失敗");return;}
  createPageCalendar();
}

async function saveCalendar(){
  var divDates = document.querySelectorAll('.divDate');
  var payload = [];
  
  divDates.forEach(divDate=>{
    if (divDate.querySelector(".ischange").checked) { 
      var date = divDate.getAttribute('date');
      var holiday = divDate.querySelector(".isholiday").checked;
      var regist = divDate.querySelector(".isregist").checked;
      payload.push({date:date,holiday:holiday,regist:regist})
    }
  });

  var {error} = await supabaseClient.from('schedule').upsert(payload);
  if (error) { alert("更新失敗");return;}
  createPageCalendar();

}

async function deleteCalendar(){
  var divDates = document.querySelectorAll('.divDate');
  var payload = [];
  
  divDates.forEach(divDate=>{
    if (divDate.querySelector(".ischange").checked) { 
      var date = divDate.getAttribute('date');
      payload.push(date);
    }

  });
  if (confirm("確定刪除嗎:\n"+payload)){
    var {error} = await supabaseClient.from('schedule').delete().in('date',payload)
    if (error) { alert("刪除失敗");return;}
    createPageCalendar();
  }
}

async function move2History(){
  var dates = [];
  var divDates = document.querySelectorAll('.divDate');

  divDates.forEach(divDate=>{
    if (divDate.querySelector(".ischange").checked) { 
      dates.push(divDate.getAttribute('date'));
    }
  });

  var {data,error} = await supabaseClient.from('schedule').select('date,holiday,parties,treasures').in('date',dates);
  if (error) {alert('讀取schedule失敗');return;}
  var payload = [];
  for (var i in data) {
    if (Object.keys(data[i].parties).length>0){
      payload.push({date:data[i].date,holiday:data[i].holiday,parties:data[i].parties,treasures:data[i].treasures});
    }
  }
  if (payload.length>0){
    var {error} = await supabaseClient.from('history').insert(payload);
    if (error) {alert('上傳history失敗');return;}
  }
  var {error} = await supabaseClient.from('schedule').delete().in('date',dates);
  if (error) {alert('刪除schedule失敗');return;}
  createPageCalendar()

}