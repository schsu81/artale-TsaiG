
function mainNavClick(){
  document.getElementById('main-view').innerHTML = "";
  var navs = document.querySelectorAll('.nav-link');
  for (i in navs){navs[i].className = 'nav-link btn btn-gray';}
}

// 切換使用者選單顯示/隱藏
document.getElementById('user-dropdown').addEventListener('click',function (e){
  // 阻止事件冒泡，防止觸發 document 的點擊事件
  e.stopPropagation();

  //document.getElementById('nav-link-User').className = "nav-link btn btn-blue";
  const menu = document.getElementById('user-menu');
  if (menu){
    menu.remove();
  }else{
    createUserMenu();    
  }
  // menu.classList.toggle('show');
  
});

// 點擊頁面任意其他地方時，關閉選單
document.addEventListener('click', function (event) {
  const dropdown = document.getElementById('user-dropdown');
  const menu = document.getElementById('user-menu');
  
  // 如果點擊的地方不在選單容器內，且選單目前是顯示狀態，就隱藏它
  if (!dropdown.contains(event.target) && menu) {
    menu.remove();
  }
});