/* Hub logic: load games inline, manage wallet, creations (using idb-keyval) */
const coinsEl = document.getElementById('coins');
const playerNameEl = document.getElementById('playerName');
const levelEl = document.getElementById('level');
const gameTitle = document.getElementById('gameTitle');
const gameFrame = document.getElementById('gameFrame');
const creationsList = document.getElementById('creations');

// default player state
let state = {
  name: localStorage.getItem('pl_name') || 'Player',
  coins: Number(localStorage.getItem('pl_coins') || 1000),
  level: Number(localStorage.getItem('pl_level') || 1)
};

function saveState(){ localStorage.setItem('pl_name', state.name); localStorage.setItem('pl_coins', state.coins); localStorage.setItem('pl_level', state.level); updateUI(); }
function updateUI(){ playerNameEl.textContent = state.name; coinsEl.textContent = state.coins; levelEl.textContent = state.level; }
updateUI();

// load creations from IndexedDB (idb-keyval)
const { get, set, keys, del } = idbKeyval;

async function loadCreations(){
  creationsList.innerHTML = '';
  const k = await keys();
  k.filter(x=>x&&x.startsWith('creation:')).forEach(async key=>{
    const data = await get(key);
    const li = document.createElement('li');
    li.textContent = data.name + ' ('+ data.type +')';
    const playBtn = document.createElement('button'); playBtn.textContent='Play'; playBtn.onclick=()=>loadCreation(data);
    const removeBtn = document.createElement('button'); removeBtn.textContent='Delete'; removeBtn.onclick=()=>{ del(key); loadCreations(); };
    li.append(' ', playBtn, ' ', removeBtn);
    creationsList.appendChild(li);
  });
}

loadCreations();

// game loaders
document.querySelectorAll('.game-btn').forEach(b=>b.addEventListener('click', ()=>{
  const g = b.dataset.game;
  gameTitle.textContent = 'Loading ' + g;
  if(g==='slot') loadSlot();
  else if(g==='snake') loadSnake();
  else if(g==='blackjack') loadBlackjack();
  else if(g==='creator') loadCreator();
}));

function clearFrame(){ gameFrame.innerHTML=''; }
function loadSlot(){
  clearFrame();
  const div = document.createElement('div');
  div.innerHTML = `<iframe src="games/slot/index.html" class="mini" style="width:100%;height:400px;border:0;background:transparent"></iframe>`;
  gameFrame.appendChild(div);
}
function loadSnake(){
  clearFrame();
  const div = document.createElement('div');
  div.innerHTML = `<iframe src="games/snake/index.html" class="mini" style="width:100%;height:400px;border:0;background:transparent"></iframe>`;
  gameFrame.appendChild(div);
}
function loadBlackjack(){
  clearFrame();
  const div = document.createElement('div');
  div.innerHTML = `<iframe src="games/blackjack/index.html" class="mini" style="width:100%;height:400px;border:0;background:transparent"></iframe>`;
  gameFrame.appendChild(div);
}
function loadCreator(){
  clearFrame();
  const div = document.createElement('div');
  div.innerHTML = `<iframe src="creator/index.html" class="mini" style="width:100%;height:640px;border:0;background:transparent"></iframe>`;
  gameFrame.appendChild(div);
}

// install prompt handling
let deferredPrompt;
const installBtn = document.getElementById('installBtn');
window.addEventListener('beforeinstallprompt', (e)=>{ e.preventDefault(); deferredPrompt = e; installBtn.style.display='inline-block'; });
installBtn.addEventListener('click', async ()=>{ if(!deferredPrompt) return; deferredPrompt.prompt(); const choice = await deferredPrompt.userChoice; deferredPrompt = null; installBtn.style.display='none'; });

// dark toggle
const darkBtn = document.getElementById('darkBtn');
darkBtn.addEventListener('click', ()=>{ document.documentElement.style.filter = document.documentElement.style.filter ? '' : 'invert(0)'; });

// basic offline ready notice
if('serviceWorker' in navigator){ console.log('sw supported'); }

// --- Avatar, friends and day/night auto-switch ---
(function(){
  // Avatar selection UI
  const profile = document.querySelector('.profile');
  const avatar = document.createElement('select');
  avatar.id = 'avatarSel';
  ['🧑','🕶️','🧙','👾','🐉'].forEach(s=>{ const o=document.createElement('option'); o.value=s; o.textContent=s; avatar.appendChild(o); });
  const avatarWrap = document.createElement('div');
  avatarWrap.style.marginLeft='12px'; avatarWrap.appendChild(avatar);
  profile.appendChild(avatarWrap);
  // load/save avatar
  avatar.value = localStorage.getItem('pl_avatar') || '🧑';
  avatar.addEventListener('change', ()=>{ localStorage.setItem('pl_avatar', avatar.value); document.getElementById('playerName').textContent = avatar.value + ' ' + (localStorage.getItem('pl_name')||'Player'); });

  // Friends system (simple local list)
  window.friends = JSON.parse(localStorage.getItem('pl_friends'||'[]')) || [];
  function saveFriends(){ localStorage.setItem('pl_friends', JSON.stringify(window.friends)); }
  // expose simple API to add friend
  window.addFriend = function(name){ if(!window.friends.includes(name)){ window.friends.push(name); saveFriends(); alert('Friend added: '+name); } else alert('Friend exists'); };

  // Day/night auto-switch based on hour
  function applyDayNight(){
    const h = new Date().getHours();
    if(h>=19 || h<6){ document.documentElement.style.setProperty('--bg','#071021'); } else { document.documentElement.style.setProperty('--bg','#f7f9fc'); document.documentElement.style.setProperty('--text','#0b1020'); }
  }
  applyDayNight();
  // also toggle every 5 minutes
  setInterval(applyDayNight, 5*60*1000);

  // show player name with avatar
  const name = localStorage.getItem('pl_name') || 'Player';
  document.getElementById('playerName').textContent = avatar.value + ' ' + name;
})();
