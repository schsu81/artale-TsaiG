async function createPageStatus(){
  mainNavClick();
  document.getElementById('nav-link-Status').className = "nav-link btn btn-gold";

  var container = document.getElementById('main-view');
  const response = await fetch('pages/status.html');
  if (!response.ok) throw new Error('頁面載入失敗');
  const html = await response.text();
  container.innerHTML = html;

  var scroll = document.getElementById('scroll-body');
  scroll.innerHTML = "";

  var {data: schedule,error} = await supabaseClient.from('schedule').select('date,holiday,queue').eq('publish',false).order('date', { ascending: true });
  if (error) {alert("資料庫載入: schedule");return;}
  var queues = {};
  var counters = {};
  for (var id in schedule){
    for (var cid in schedule[id].queue){
      queues[cid] = schedule[id].queue[cid];
    }
    counters[schedule[id].date] = {};
    for (var boss in bosses){
      counters[schedule[id].date][boss] = 0;
    }
  }
  var {data: temp,error} = await supabaseClient.from('characters').select('*').gt('attend',0).order('uname',{ ascending: true });
  if (error) {alert("資料庫載入: characters");return;}
  var chars = {};
  for (var i in temp){
    chars[temp[i].id] = temp[i];
  }
  delete temp;

  var container = document.createElement("div");
  container.className = "ms-table-container";
    var table = document.createElement("table");
    table.className = "ms-table ms-table-paper";
      var thead = document.createElement("thead");
        var tr = document.createElement("tr");
          var th = document.createElement("th");
          th.innerHTML = "暱稱";
          tr.appendChild(th);
          var th = document.createElement("th");
          th.innerHTML = "等級";
          th.style = "width: 50px"
          tr.appendChild(th);
          var th = document.createElement("th");
          th.innerHTML = "職業";
          th.style = "width: 70px"
          tr.appendChild(th);
          var th = document.createElement("th");
          th.innerHTML = "突襲卷";
          th.style = "width: 120px"
          tr.appendChild(th);
          var th = document.createElement("th");
          th.innerHTML = "BOSS";
          th.style = "width: 130px"
          tr.appendChild(th);
          for (var id in schedule){
            var d = new Date (schedule[id].date);
            var th = document.createElement("th");
            
            th.id = "d-"+schedule[id].date;
            if (schedule[id].holiday) { 
              th.style = "width: 160px; color: #ff0000;"; 
            }else{
              th.style = "width: 160px;" ;
            }
            th.innerHTML = week[d.getDay()]+" "+getMonth(d)+"-"+getDay(d);
              var tags = document.createElement('div');
              tags.className = "grid-3";
              tags.style = "gap: 2px; justify-items: center;";
              tags.id = "tags-"+schedule[id].date;
              th.appendChild(tags);
            tr.appendChild(th);
          }
        thead.appendChild(tr);
      table.appendChild(thead);
      var tbody = document.createElement("tbody");
      for (var cid in chars) {
          var tr = document.createElement("tr");
            var td = document.createElement('td');
            td.innerHTML = chars[cid].uname;
            tr.appendChild(td);
            var td = document.createElement('td');
            td.innerHTML = chars[cid].level;
            tr.appendChild(td);
            var td = document.createElement('td');
            td.innerHTML = jobs[chars[cid].job];
            tr.appendChild(td);
            var td = document.createElement('td');
            td.innerHTML = scrolls[chars[cid].scroll];
            tr.appendChild(td);
            var td = document.createElement('td');
            // td.className = "grid-3"
              var tags = document.createElement('div');
              tags.className = "grid-3";
              tags.style = "gap: 2px; justify-items: center;";
                for (var ib in queues[cid]['priority']){
                  var boss = queues[cid]['priority'][ib];
                    createBossTag(boss,"font-size: 0.7rem;",null,tags);
                }
              td.appendChild(tags);
            tr.appendChild(td);
            for (var id in schedule) {
              var td = document.createElement('td');
              if (queues[cid]['times'][schedule[id].date]) {
                var cTimes = getTimeRange(queues[cid]['times'][schedule[id].date]);
                if (cTimes.length>0){
                  td.innerHTML = cTimes[0];
                  for (var it=1;it<cTimes.length;it++){
                    td.innerHTML += "<br>"+cTimes[it];
                  }
                }

                //td.innerHTML = queues[cid]['times'][schedule[id].date][0]+"~"+queues[cid]['times'][schedule[id].date][1];
                for (var boss in bosses){
                  if (queues[cid]['priority'][0]==boss){counters[schedule[id].date][boss] += 1 ;}
                }
              }
              tr.appendChild(td);
            }
          tbody.appendChild(tr);      
        }
      table.appendChild(tbody);    
    container.appendChild(table);
  scroll.appendChild(container);

  for (var date in counters){
    var th = document.getElementById('d-'+date);
    var tags = document.createElement('div');
    tags.className = "grid-3";
    tags.style = "gap: 2px; justify-items: center;";
    for (var boss in bosses){
      createBossTag(boss,"font-size: 0.7rem;",boss+": "+counters[date][boss],tags);
    }
    th.appendChild(tags);

  }
}

async function switchStatus(){
  mainNavClick();
  document.getElementById('nav-btn-status').className = "nav-main btn btn-blue";
  var main = document.getElementById('main');
  var card = document.createElement("div");
  card.className = "card";
  main.appendChild(card);

  var div0 = document.createElement("div");
  div0.id = "full-book-area";
  card.appendChild(div0);

  var div1 = document.createElement("div");
  div1.className = "book-scroll-wrapper";
  div0.appendChild(div1)

  var div2 = document.createElement("div");
  div2.className = "book-grid-container";
  div1.appendChild(div2)

  var {data: schedule,error} = await supabaseClient.from('schedule').select('date,holiday,queue').eq('publish',false).order('date', { ascending: true });
  if (error) {alert("資料庫載入: schedule");return;}
  var {data: temp,error} = await supabaseClient.from('characters').select('*');
  if (error) {alert("資料庫載入: characters");return;}
  var chars = {};
  for (var i in temp){
    chars[temp[i].id] = temp[i];
  }
  delete temp;

  for (var id in schedule){
    var divCol = document.createElement("div");
    divCol.className = "book-day-column";
    div2.appendChild(divCol);

    var d = new Date(schedule[id].date+" GMT+8");
    var divHeader = document.createElement("div");
    divHeader.className = "book-day-header";
    if (schedule[id].holiday) {divHeader.className += " holiday";}
    divHeader.innerHTML = week[d.getDay()]+" "+(d.getMonth()+1)+"/"+d.getDate();
    divCol.appendChild(divHeader);

    var divCounter = document.createElement("div");
    divCounter.className = "grid-3";
    divCounter.style = "gap:1px;"
    divHeader.appendChild(divCounter)

    var body = document.createElement("div");
    body.className = "book-day-body";
    divCol.appendChild(body);
    
    var counters = {};
    for (var boss in bosses){
      counters[bosses[boss]] = 0;
      for (var cid in schedule[id].queue){
        var priority = schedule[id].queue[cid]['priority'];
        if (bosses[boss] != priority[0]) {continue;}
        var times = schedule[id].queue[cid]['times'][schedule[id].date];
        for (var ib in priority){
          counters[priority[ib]] += 1;
          if (ib >2) {break;}
        }
        if (cid in chars){addStatusCard(body,cid,times,priority,chars[cid]);}
      }
      var div = document.createElement("div");
      div.className = "card-char-count boss-"+bosses[boss];
      div.innerHTML = bosses[boss]+": "+counters[bosses[boss]];
      divCounter.appendChild(div);
    }
  }

}

function addStatusCard(p,cid,times,priority,char){
  var card = document.createElement("div");
  // card.className = "card-char boss-"+priority[0];
  card.className = "card-char";
  card.setAttribute("boss-type",priority[0]);
  p.appendChild(card) ;

  var div = document.createElement("div");
  div.className = "card-char-name job-color-"+char.job;
  div.innerHTML = char.uname;
  card.appendChild(div)

  var div = document.createElement("div");
  div.className = "card-char-job job-color-"+char.job;
  div.innerHTML = char.job+" Lv."+char.level;
  card.appendChild(div)

  var div = document.createElement("div");
  div.className = "card-char-att";
  div.innerHTML = attends[char.attend];
  card.appendChild(div)

  var div = document.createElement("div");
  div.className = "card-char-sclr";
  div.innerHTML = scrolls[char.scroll];
  card.appendChild(div)

  if (times){
    var div = document.createElement("div");
    div.className = "card-char-times";
    div.innerHTML = "⏰"+times[0]+"~"+times[1];
    card.appendChild(div)
  }

  var div = document.createElement("div");
  div.className = "card-char-boss";
  card.appendChild(div)

  for (var i in priority){
    var span = document.createElement("span");
    span.className += "boss-tag-v1 boss-"+priority[i];
    span.innerHTML = (Number(i)+1)+":"+priority[i];
    div.appendChild(span)
    if (i==3) {break;}
  }
}