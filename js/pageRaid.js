//let chars = {};
async function createPageRaid(targetDiv=null,schedule=null){
  if (!targetDiv){
    mainNavClick();
    document.getElementById('nav-link-Raid').className = "nav-link btn btn-gold";

    const container = document.getElementById('main-view');
    const response = await fetch('pages/raid.html');
    if (!response.ok) throw new Error('頁面載入失敗');
    const html = await response.text();
    container.innerHTML = html;
    
    var targetDiv = document.getElementById('scroll-body');
    targetDiv.innerHTML = "";
    
  }
  
  var highlight = false;
  if (!schedule){
    chars = {};
    highlight = true;
    var {data: schedule,error} = await supabaseClient.from('schedule').select('date,parties,holiday').eq('regist',false).eq('publish',true).order('date', { ascending: true });
    if (error) {alert("資料庫載入: schedule");return;}
  }
  var {data: temp, error} = await supabaseClient.from('characters').select('*');
  if (error) {alert("資料庫載入: characters");return;}
  for (var i in temp){
    chars[temp[i].id] = temp[i];
  }
  delete temp;

  for (var id in schedule){
    if (Object.keys(schedule[id].parties).length>0){

      var date = schedule[id].date;
      var d = new Date(date+" GMT+8");

      body = createRaidDay(targetDiv,schedule[id])

      for (var ip in schedule[id].parties){
        createRaidParty(body,schedule[id].parties[ip],true);
      }


    } //ip
  } //id

  
}