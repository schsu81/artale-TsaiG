const SUPABASE_URL = 'https://jjjeupzbxpbdfbnshclc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpqamV1cHpieHBiZGZibnNoY2xjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI2Nzk5NzksImV4cCI6MjEwODI1NTk3OX0.SMns68Q7Cu2TngNMxkXj2T8zq5rFgSk9L4UHFXbvXT4';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const loadingSection = document.getElementById('loading-section');
const loginSection = document.getElementById('login-section');
const userSection = document.getElementById('user-section');
const authCard = document.getElementById('auth-card');

// -------------------------------------------------------------
// 關鍵機制 1：網頁載入時主動檢查 Session 狀態
// -------------------------------------------------------------
document.addEventListener('DOMContentLoaded', async () => {
  // 從 localStorage 取得目前的 session 資訊
  const { data: { session }, error } = await supabaseClient.auth.getSession();

  if (error) {
    console.error('Session 取得失敗:', error.message);
  }

  // 隱藏載入提示
  loadingSection.style.display = 'none';

  if (session) {
    deleteLoginImg()
    // 已登入：渲染會員畫面

    const { data:Profile } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    Object.defineProperty(globalThis, 'Profile', {
      value: Object.freeze(Profile), 
      writable: false,           
      configurable: false,       
      enumerable: true           
    });
    Object.defineProperty(globalThis, 'UID', {
      value: Object.freeze(Profile.id), 
      writable: false,           
      configurable: false,       
      enumerable: true           
    });
    Object.defineProperty(globalThis, 'isadmin', {
      value: Object.freeze(Profile.isadmin), 
      writable: false,           
      configurable: false,       
      enumerable: true           
    });
    Object.defineProperty(globalThis, 'ismanager', {
      value: Object.freeze(Profile.ismanager), 
      writable: false,           
      configurable: false,       
      enumerable: true           
    });
    Object.defineProperty(globalThis, 'ishelper', {
      value: Object.freeze(Profile.ishelper), 
      writable: false,           
      configurable: false,       
      enumerable: true           
    });
    Object.defineProperty(globalThis, 'ismember', {
      value: Object.freeze(Profile.ismember), 
      writable: false,           
      configurable: false,       
      enumerable: true           
    });

    await renderLoggedInUI(session.user);
    if (!ismember) {alert("會員資格未驗證，請聯絡管理員。"); handleLogout();}

    createPageRaid();
    //createPageRaidPlan();
    
  } else {
    // 未登入：顯示登入頁面
    loginSection.style.display = 'block';
  }
});
// -------------------------------------------------------------
// 關鍵機制 2：動態監聽認證狀態轉變（登入/登出/重新整理）
// -------------------------------------------------------------
supabaseClient.auth.onAuthStateChange(async (event, session) => {
  if (event === 'SIGNED_IN' && session) {
    authCard.style.display = 'none';
    loadingSection.style.display = 'none';
    await renderLoggedInUI(session.user);
  } else if (event === 'SIGNED_OUT') {
    loadingSection.style.display = 'none';
    userSection.style.display = 'none';
    authCard.style.display = 'block';
    loginSection.style.display = 'block';                                             
  }
});

// 渲染登入後 UI 的函式
async function renderLoggedInUI(user) {
  authCard.style.display = 'none';
  loginSection.style.display = 'none';
  userSection.style.display = 'block';

  //document.getElementById('user-id').textContent = user.id.substring(0, 8) + '...';

  // 取得 profile 資料
  const { data: profile } = await supabaseClient
    .from('profiles')
    .select('username, avatar_url')
    .eq('id', user.id)
    .single();

  const name = profile?.username || user.user_metadata?.full_name || 'Discord 使用者';
  const avatar = profile?.avatar_url || user.user_metadata?.avatar_url || 'https://via.placeholder.com/80';

  document.getElementById('nav-name').textContent = name;
  document.getElementById('nav-avatar').src = avatar;
}

// 發起 Discord 登入
async function loginWithOAuth(providerName) {
  const isGitHubPages = window.location.hostname.includes('github.io');
  const redirectToUrl = isGitHubPages 
    ? `${window.location.origin}/artale-TsaiG/` 
    : `${window.location.origin}/`;

  const { error } = await supabaseClient.auth.signInWithOAuth({
    provider: providerName,
    options: {
      redirectTo: redirectToUrl
    }
  });


  if (error) alert(`${providerName} 登入失敗：` + error.message);
}

// 登出
async function handleLogout() {
  const { error } = await supabaseClient.auth.signOut();
  if (error) alert('登出失敗：' + error.message);
  createLoginImg()


}