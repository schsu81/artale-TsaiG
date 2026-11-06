//--------------------------------------------------------------------------------------
async function createPageProfile(){
  mainNavClick();
  document.getElementById('nav-link-User').className = "nav-link btn btn-blue";

  const container = document.getElementById('main-view');
  const response = await fetch('pages/profile.html');
  if (!response.ok) throw new Error('頁面載入失敗');
  const html = await response.text();
  container.innerHTML = html;
  
  var scrollBody = document.getElementById('scroll-body');
  scrollBody.innerHTML = "";

  var block = document.createElement("div");
  block.className = "block";
  scrollBody.appendChild(block);

  var nameDiv = document.createElement("div");
  nameDiv.style = "display: grid; align-items: center; grid-auto-flow: column; padding: 5px;"
  block.appendChild(nameDiv);

  var nameLabel = document.createElement("label");
  nameLabel.innerHTML = "暱稱："
  nameLabel.setAttribute('for',"user-name");
  nameDiv.appendChild(nameLabel);
  
  var nameInp = document.createElement("input");
  nameInp.className = "inp-user";
  nameInp.type = "text";
  nameInp.id = "user-name";
  nameInp.placeholder = Profile.username || 'Not found';
  nameDiv.appendChild(nameInp);

  var btnSubmit = document.createElement("button");
  btnSubmit.className = "btn btn-green btn-full";
  btnSubmit.onclick = profileSubmit ;
  btnSubmit.innerHTML = "修改" ;
  block.appendChild(btnSubmit);

  var block = document.createElement("div");
  block.style = " display: flex; justify-content: center;";
  block.className = "card";
  scrollBody.appendChild(block);

  var btnLogout = document.createElement("button");
  btnLogout.className = "btn btn-red";
  //btnLogout.setAttribute('onclick','handleDelete(this)')
  btnLogout.onclick = handleDelete ;
  btnLogout.innerHTML = "刪除帳號" ;
  block.appendChild(btnLogout);
}

async function profileSubmit(){
  var nameInp = document.getElementById("user-name").value.trim();

  if (nameInp) {
    var { error } = await supabaseClient.from('profiles').update({username: nameInp}).eq('id',UID);
    if (error) {alert("帳號更新失敗");}
    // var { error } = await supabaseClient.from('profiles').select('chars').eq('id',UID);
    // var payload = [];
    var { error} = await supabaseClient.from('characters').update({uname: nameInp}).eq('uid',UID)
    if (error) {alert("角色更新失敗");}    
  };
  alert("已修改完成");
  location.reload();
}

async function handleDelete(){
  if (confirm('確定要刪除帳號嗎?')){
    //const { error } = await supabaseClient.from('profiles').delete().eq('id',currentUser.id)
    alert("測試");
    alert("帳號已刪除!");
    location.reload();
  }
}
//--------------------------------------------------------------------------------------

async function createPageMembers(){
  mainNavClick();
  document.getElementById('nav-link-User').className = "nav-link btn btn-blue";

  const container = document.getElementById('main-view');
  const response = await fetch('pages/managerMembers.html');
  if (!response.ok) throw new Error('頁面載入失敗');
  const html = await response.text();
  container.innerHTML = html;
  
  var scrollBody = document.getElementById('scroll-body');
  scrollBody.innerHTML = "";

  var contain = document.createElement("div");
  contain.className = "ms-table-container";
  //block.style = "min-width: 800px;"
  scrollBody.appendChild(contain);

  var table = document.createElement("table");
  table.className = "ms-table ms-table-paper";
  table.style = "width: 100%;"
  contain.appendChild(table);

  var thead = document.createElement("thead");
    var row = document.createElement("tr");
      var col = document.createElement("th");
      col.style = "text-align: left;"
      col.innerHTML = "暱稱";
      row.appendChild(col);
      var col = document.createElement("th");
      col.style = "text-align: left;"
      col.innerHTML = "管理員";
      row.appendChild(col);
      var col = document.createElement("th");
      col.style = "text-align: left;"
      col.innerHTML = "副管理員";
      row.appendChild(col);
      var col = document.createElement("th");
      col.style = "text-align: left;"
      col.innerHTML = "小幫手";
      row.appendChild(col);
      var col = document.createElement("th");
      col.style = "text-align: left;"
      col.innerHTML = "會員";
      row.appendChild(col);
      var col = document.createElement("th");
      col.style = "text-align: left;"
      row.appendChild(col);
    thead.appendChild(row);
  table.appendChild(thead);
  

  var {data, error } = await supabaseClient.from('profiles').select('id,username,isadmin,ismanager,ishelper,ismember');
  if (error){ alert("資料載入失敗");return;  }

  // alert(data+" "+error);
  // alert(data[0].id);

  var tbody = document.createElement("tbody");
  for (var i in data){
    // alert(data[i].id);
    var row = document.createElement("tr");
    row.setAttribute('uid',data[i].id);
    tbody.appendChild(row);

    var col = document.createElement("td");
    col.innerHTML = "<p>"+data[i].username+"</p>";
    row.appendChild(col);

    var col = document.createElement("td");
    row.appendChild(col);
    var inp = document.createElement("input");
    inp.setAttribute('vn','isadmin');
    inp.type = "checkbox";
    if (data[i].isadmin) {inp.checked = true;}
    setupMemberEvents(inp);
    col.appendChild(inp);

    var col = document.createElement("td");
    row.appendChild(col);
    var inp = document.createElement("input");
    inp.setAttribute('vn','ismanager');
    inp.type = "checkbox";
    if (data[i].ismanager) {inp.checked = true;}
    setupMemberEvents(inp);
    col.appendChild(inp);

    var col = document.createElement("td");
    row.appendChild(col);
    var inp = document.createElement("input");
    inp.setAttribute('vn','ishelper');
    inp.type = "checkbox";
    if (data[i].ishelper) {inp.checked = true;}
    setupMemberEvents(inp);
    col.appendChild(inp);
    
    var col = document.createElement("td");
    row.appendChild(col);
    var inp = document.createElement("input");
    inp.setAttribute('vn','ismember');
    inp.type = "checkbox";
    if (data[i].ismember) {inp.checked = true;}
    setupMemberEvents(inp);
    col.appendChild(inp);

    var col = document.createElement("td");
    row.appendChild(col);
    var inp = document.createElement("input");
    inp.className = "hidden";
    inp.value = data[i].id;
    setupMemberEvents(inp);
    col.appendChild(inp);

    if (!data[i].isadmin) {
      var inp = document.createElement("button");
      inp.className = "btn btn-red";
      inp.setAttribute("onclick",'memberDelete("'+data[i].id+'","'+data[i].username+'")');
      inp.innerHTML = "刪除";
      col.appendChild(inp);
    }
  }
  table.appendChild(tbody);

}
async function memberDelete(id,name){
  if (confirm("確定要刪除 "+name+" ?")){
    var {error} = await supabaseClient.from('profiles').delete().eq('id',id);
    if (error) {alert('刪除失敗');return;}
    alert('已刪除 '+name);
    memberPage();
  }
}

function setupMemberEvents(inp){
  inp.addEventListener('change',async function(e){
    var inp = e.target;
    var vn = inp.getAttribute('vn');
    var uid = inp.parentNode.parentNode.getAttribute('uid');
    payload = [{}];
    payload[0][vn] = inp.checked

    var {error} = await supabaseClient.from('profiles').update(payload).eq('id',uid);
    if (error) {console.log(payload);}
  });
}
