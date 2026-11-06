// function createScrollHor (){
//   var main = document.getElementById('main-view');

//   var section = document.createElement('section');
//   section.className = "scroll-h-wrapper";
//     var capLeft = document.createElement('div');
//     capLeft.className = "scroll-h-cap left";
//     section.appendChild(capLeft);

//     var body = document.createElement('div');
//     body.className = "scroll-h-body";
//     body.id = "scroll-body";
//     section.appendChild(body);

//     var capRight = document.createElement('div');
//     capRight.className = "scroll-h-cap right";
//     section.appendChild(capRight);
//   main.appendChild(section);
//   return body
// }

// function createScrollVer (inner=null){
//   var main = document.getElementById('main-view');

//   var section = document.createElement('section');
//   section.className = "scroll-v-wrapper";
//     var capLeft = document.createElement('div');
//     capLeft.className = "scroll-v-cap left";
//     section.appendChild(capLeft);

//     var body = document.createElement('div');
//     body.className = "scroll-v-body";
//     body.id = "scroll-body";
//     if (inner) {body.innerHTML = inner;}
//     section.appendChild(body);

//     var capRight = document.createElement('div');
//     capRight.className = "scroll-v-cap right";
//     section.appendChild(capRight);
//   main.appendChild(section);
//   return body
// }

function createUserMenu(){
  var dropdown = document.getElementById('user-dropdown');

  var menu = document.createElement('div');
  menu.id = "user-menu"
  menu.className = "dropdown-menu";
    var btn = document.createElement("button");
    btn.id = "nav-sub-btn-prf";
    btn.className = "dropdown-item";
    btn.setAttribute("onclick","createPageProfile();")
    btn.innerHTML = "👤 個人資料" ;
    menu.appendChild(btn);
    if ( isadmin){
        var btn = document.createElement("button");
        btn.id = "nav-sub-btn-mem";
        btn.className = "dropdown-item";
        btn.setAttribute("onclick","createPageMembers();")
        btn.innerHTML = "會員管理" ;
        menu.appendChild(btn);
    }
    if (ismanager){
        var btn = document.createElement("button");
        btn.id = "nav-sub-btn-char";
        btn.className = "dropdown-item";
        btn.setAttribute("onclick","createPageCharacters();")
        btn.innerHTML = "角色管理" ;
        menu.appendChild(btn);
    }
    if (ishelper){
      var btn = document.createElement("button");
      btn.id = "nav-sub-btn-calendar";
      btn.className = "dropdown-item";
      btn.setAttribute("onclick","createPageCalendar();")
      btn.innerHTML = "日期管理" ;
      menu.appendChild(btn);
      
      var btn = document.createElement("button");
      btn.id = "nav-sub-btn-schedule-m";
      btn.className = "dropdown-item";
      btn.setAttribute("onclick","createPageRaidPlan(true);")
      btn.innerHTML = "修改本週班表" ;
      menu.appendChild(btn);
      
      var btn = document.createElement("button");
      btn.id = "nav-sub-btn-schedule";
      btn.className = "dropdown-item";
      btn.setAttribute("onclick","createPageRaidPlan();")
      btn.innerHTML = "規劃下週班表" ;
      menu.appendChild(btn);
    }

    var hr = document.createElement("hr");
    hr.className = "dropdown-divider";
    menu.appendChild(hr);

    var btnLogout = document.createElement("button");
    btnLogout.className = "dropdown-item";
    btnLogout.onclick = handleLogout ;
    btnLogout.innerHTML = "🚪 登出" ;
    menu.appendChild(btnLogout);
  dropdown.appendChild(menu);
}

function createCharJobSelection(selected=null){
  var slt = document.createElement("select");
  for (var job in jobs){
    var opt = document.createElement("option");
    opt.value = job;
    opt.innerHTML = jobs[job];
    if (selected && (job == selected)) {opt.selected = true;}
    slt.appendChild(opt);
  }
  return slt;
}

function createCharLevelInput(level=null){
  var inp = document.createElement("input");
  inp.className = "oi";
  inp.type = 'number';
  inp.setAttribute("min",1)
  inp.setAttribute("max",200)
  if (level) {
    inp.value = level;
  }else{
    inp.value = 120;
  }
  return inp;
}

function createSplitLine(){
  var hr = document.createElement('hr');
  hr.style = "border:none; border-top:1px dashed var(--border-wood); margin:15px 0;";
  return hr
}

function createBossTag(boss,style="font-size: 1rem;",str=null,p=null){
  var tag = document.createElement('div');
  tag.style = style;
  tag.className = "boss-tag "+boss;
  if (str) {
    tag.innerHTML = str;
  }else{
    tag.innerHTML = boss;
  }
  if (p) {p.appendChild(tag);} else {return tag;}
}
/////////////////////////////////////////////////////////////////////////////
function createRaidDay(p,schedule){
  var date = schedule.date;
  var d = new Date(date+" GMT+8");
  var holiday = schedule.holiday;

  var divCol = document.createElement("div");
  divCol.className = "raid-day-column";
  p.appendChild(divCol);

  var divHeader = document.createElement("div");
  divHeader.className = "raid-day-header";
  if (holiday) {divHeader.className += " holiday";}
  divHeader.innerHTML = week[d.getDay()]+" "+(d.getMonth()+1)+"/"+d.getDate();
  divCol.appendChild(divHeader);

  var body = document.createElement("div");
  body.id = "body-"+date;
  body.className = "raid-day-body body-"+date;
  body.setAttribute("date",date);
  divCol.appendChild(body);
  return body
}

function createRaidParty(p,party,detail=false){
  var time = party["time"];
  var boss = party["boss"];
  var local_chars = party["chars"];

  var divParty = document.createElement("div");
  divParty.className = "card-party boss-"+boss;
  divParty.setAttribute('boss',boss);
  //divParty.setAttribute('pid',ip);
  //divParty.setAttribute('date',date);
  p.appendChild(divParty);

  var divPartyheader = document.createElement("div");
  divPartyheader.className = "party-header "+boss;

    var h3 = document.createElement('h3');
    h3.innerHTML = boss;
    // p.className = "card-party boss-"+boss;
    divPartyheader.appendChild(h3)
    
    var h3 = document.createElement('h3');
    h3.innerHTML = time;
    // p.className = "card-party boss-"+boss;
    divPartyheader.appendChild(h3)
  divParty.appendChild(divPartyheader);

  var slots = document.createElement('div');
  if (boss=='龍王'){
    slots.className = "party-body-12";
  }else{
    slots.className = "party-body-6";
  }
  divParty.appendChild(slots);

  for (var ic in local_chars){
    var divChar = document.createElement("div");
    var char = chars[local_chars[ic]];
    divChar.className = "card-char-raid";

    if (char.uid && (char.uid == UID)) {divChar.classList.add("highlight");}
    divChar.setAttribute("job",char.job);
    divChar.setAttribute("cid",char.id);
    slots.appendChild(divChar) ;

    var div = document.createElement("div");
    div.className = "card-char-raid-job "+char.job;
    div.innerHTML = jobs[char.job];
    if (detail ) {
      if (char.MW20) {div.innerHTML += "🍁";}
      div.innerHTML += " Lv."+char.level; 
    }
    divChar.appendChild(div)


    var div = document.createElement("div");
    div.className = "card-char-raid-name";
    div.innerHTML = char.uname;
    divChar.appendChild(div)
    
  } // ic
  return divParty;
}
/////////////////////////////////////////////////////////////////////////////
function createPopUp(typ='v'){
  var cover = document.createElement('div');
  cover.id = "popmain";
  cover.style = "position: fixed; top: 0; left: 0; z-index:998; width: 100%; height: 100%; background:rgba(0, 0, 0, 0.4);"
  document.body.appendChild(cover);

  var box = document.createElement('div');
  box.className = "box";
  cover.appendChild(box);
  
  var section = document.createElement('section');
  section.className = "scroll-"+typ+"-wrapper";
  section.style = "position: fixed; top: 50%; left: 50%; z-index:999; transform: translate(-50%, -50%); ";
    var capLeft = document.createElement('div');
    capLeft.className = "scroll-"+typ+"-cap left";
    section.appendChild(capLeft);

    var body = document.createElement('div');
    body.className = "scroll-"+typ+"-body";
    section.appendChild(body);

    var capRight = document.createElement('div');
    capRight.className = "scroll-"+typ+"-cap right";
    section.appendChild(capRight);
  cover.appendChild(section);

  return body
  // var btnExit = document.createElement("button");
  // btnExit.className = "btn btn-gray";
  // btnExit.style = "margin: 2px";
  // //btnExit.style     = "position: relative; left: 50%; transform: translate(-50%, 0%);"
  // btnExit.setAttribute("onclick","document.getElementById('popmain').remove()")
  // btnExit.innerHTML = "取消"
  // div.appendChild(btnExit);
}
////////////////////////////////////////////////
function createLoginImg(){
  document.body.style = "width: 100%; height: 100%; overflow: hidden;";
  var img = document.createElement("img");
  img.id = 'login-img';
  img.src = "img/login.jfif";
  img.className = "authimg";
  document.body.prepend(img)
}

function deleteLoginImg(){
  document.body.style = "";
  document.getElementById('login-img').remove();
}