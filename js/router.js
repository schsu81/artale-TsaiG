// 路由地圖：將 Hash 映射到對應的 HTML 視圖檔案
const routes = {
  '#attribution': 'pages/attribution.html',
  '#test': 'pages/test.html',
  '#raid': ['pages/raid.html',createPageRaid],
  '#register': ['pages/register.html',createPageRegister],
  '#status': 'pages/status.html',
  '#history': 'pages/history.html',
  '#tools': 'pages/tools.html',
};


const DEFAULT_ROUTE = '#test';

// 動態載入 View HTML 的核心函式
async function loadView(hash) {
  const container = document.getElementById('main-view');
  // 若傳入不認識的 Hash，預設降級回到首頁


  const viewUrl = routes[hash][0] || routes[DEFAULT_ROUTE];
  
  try {
    const response = await fetch(viewUrl);
    if (!response.ok) throw new Error('頁面載入失敗');
    const html = await response.text();
    container.innerHTML = html;
    routes[hash][1]();
  } catch (error) {
    container.innerHTML = `<p>無法載入頁面內容：${error.message}</p>`;
  }

    
    // 更新導覽列選單的高亮 active 狀態
    updateNavState(hash);
}

// 切換導覽列 active 樣式
function updateNavState(currentHash) {
  const activeHash = routes[currentHash] ? currentHash : DEFAULT_ROUTE;
  const navLinks = document.querySelectorAll('#navbar .nav-link');

  navLinks.forEach(link => {
    if (link.getAttribute('href') === activeHash) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

// 核心路由控制器
function handleRoute() {
  const hash = window.location.hash;
  
  // 如果開啟網頁時完全沒有 Hash（例如直接開 index.html），強制設為預設路由
  if (!hash) {
    window.location.hash = DEFAULT_ROUTE;
    return; // 改變 location.hash 會自動觸發 hashchange 事件，因此直接 return
  }

  loadView(hash);
}

// 1. 當網址 Hash 改變時觸發（點擊 <a> 或 按瀏覽器上一頁/下一頁）
window.addEventListener('hashchange', handleRoute);

// 2. 頁面初始化與重新整理時執行一次
document.addEventListener('DOMContentLoaded', handleRoute);