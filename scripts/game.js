let coins = 0;
let league = 'Bronze';
let highestLeague = 'Bronze';
let tEnergy = 500;
let energy = 500;
let clickP = 1;
let regen = 1;
let fullSh = 0;
let bostp = 0;
let multitapLevel = 0;
let energyLimitLevel = 0;
let rechargingLevel = 0;
let offSec = 0;
let lastOnlineTime = Date.now();
let rotationCount = 0;
let isRotating = false;
let isCovered = false;
let clickStartTime = null;
let lastClickTime = null;
let hasTapBot = false;
// const tg = window.Telegram.WebApp;
// tg.expand(); //گسترش صفحه به تمام صفحه

const tg = window.Telegram.WebApp;

const userState = {
  userId: tg.initDataUnsafe?.user?.id,
  username: tg.initDataUnsafe?.user?.username,
  wallet: {
    address: null,
    balance: 0,
    lastConnected: null
  },
  game: {
    coins: 0,
    totalEarnedCoins: 0,
    spentCoins: 0,
    currentLeague: 'Bronze',
    highestLeague: 'Bronze',
    energy: {
      current: 500,
      max: 500,
      regen: 1
    }
  },
  upgrades: {
    multitapLevel: 0,
    energyLimitLevel: 0,
    rechargingLevel: 0,
    hasTapBot: false
  },
  tasks: {
    completed: [],
    rewards: 0
  },
  referral: {
    code: null,
    invitedFriends: [],
    rewards: 0
  },
  stats: {
    totalClicks: 0,
    onlineTime: 0,
    lastOnline: null,
    offlineEarnings: 0
  }
};

// ذخیره در CloudStorage تلگرام
function saveUserState() {
  tg.CloudStorage.setItem('userState', JSON.stringify(userState));
}

// بازیابی از CloudStorage تلگرام
async function loadUserState() {
  const saved = await tg.CloudStorage.getItem('userState');
  if (saved) {
    Object.assign(userState, JSON.parse(saved));
    updateAllDisplays();
  }
}

// آپدیت خودکار
setInterval(saveUserState, 30000);

// ذخیره هنگام بستن مینی اپ
tg.onEvent('viewportChanged', saveUserState);

// بازیابی هنگام باز کردن مینی اپ
document.addEventListener('DOMContentLoaded', loadUserState);

const CLICK_THRESHOLD = 500; // milliseconds between clicks
const TIME_LIMIT = 60000; // 1 minute in milliseconds

const homeCoinsDisplay = document.getElementById('homeCoinsDisplay');
const homeLeagueDisplay = document.getElementById('homeLeagueDisplay');
const energyDisplay = document.getElementById('energyDisplay');
const energyProgress = document.getElementById('energyProgress');
const largeCoin = document.getElementById('largeCoin');
const clickValue = document.getElementById('clickValue');

document.documentElement.style.setProperty(
  '--tg-theme-bg-color',
  tg.backgroundColor
);
document.documentElement.style.setProperty(
  '--tg-theme-text-color',
  tg.textColor
);

function updateDisplays() {
  updateLeague(); // اضافه کردن این خط
  homeCoinsDisplay.textContent = coins;
  homeLeagueDisplay.textContent = league;
  energyDisplay.textContent = `${energy} / ${tEnergy}`;
  energyProgress.style.width = `${(energy / tEnergy) * 100}%`;
  updateBoostPage();
  updateTaskPage();
}

function copyReferralCode() {
  const code = document.getElementById('referralCode').textContent;
  navigator.clipboard.writeText(code).then(() => {
    const copyBtn = document.querySelector('.copy-btn');
    copyBtn.innerHTML = '<i class="fas fa-check"></i>';
    setTimeout(() => {
      copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
    }, 2000);
  });
}
function createFloatingNumber(value) {
  const floatingNumber = document.createElement('div');
  floatingNumber.textContent = `+${value}`;
  floatingNumber.className = 'click-value';
  floatingNumber.style.left = `${event.clientX}px`;
  floatingNumber.style.top = `${event.clientY}px`;
  document.body.appendChild(floatingNumber);

  setTimeout(() => {
    floatingNumber.style.transform = 'translateY(-50px)';
    floatingNumber.style.opacity = '0';
  }, 50);

  setTimeout(() => {
    document.body.removeChild(floatingNumber);
  }, 500);
}

largeCoin.addEventListener('click', () => {
  if (energy >= clickP && !isCovered) {
    const currentTime = Date.now();

    if (!clickStartTime) {
      clickStartTime = currentTime;
    }

    if (lastClickTime && currentTime - lastClickTime > CLICK_THRESHOLD) {
      clickStartTime = currentTime;
      rotationCount = 0;
    }

    if (currentTime - clickStartTime <= TIME_LIMIT) {
      rotationCount++;
      largeCoin.style.transform = `translate(-50%, -50%) rotate(${rotationCount}deg)`;
    } else {
      clickStartTime = currentTime;
      rotationCount = 0;
    }

    lastClickTime = currentTime;

    coins += clickP;
    energy -= clickP;
    createFloatingNumber(clickP);
    updateDisplays();

    if (rotationCount >= 360 && rotationCount < 365) {
      isCovered = true;
      const cover = document.createElement('div');
      cover.className = 'coin-cover';
      cover.innerHTML = `
                <i class="fas fa-gift"></i>
                <span>YOU WIN</span>
            `;
      document.querySelector('.game-area').appendChild(cover);
      coins += 100000;
      updateDisplays();

      setTimeout(() => {
        cover.remove();
        isCovered = false;
        rotationCount = 0;
        clickStartTime = null;
      }, 15000);
    }
  }
});

setInterval(() => {
  if (energy < tEnergy) {
    energy = Math.min(energy + regen, tEnergy);
    updateDisplays();
  }
}, 1000);
function updateBoostPage() {
  document.getElementById('boostCoinsDisplay').textContent = coins;
  document.getElementById('boostLeagueDisplay').textContent = league;
  document.getElementById('full_chargh_cont').textContent = fullSh;
  document.getElementById('boost_tap_cont').textContent = bostp;
}
function updateTaskPage() {
  document.getElementById('taskCoinsDisplay').textContent = coins;
  document.getElementById('taskLeagueDisplay').textContent = league;
}

function fullCharge() {
  if (fullSh < 3) {
    energy = tEnergy;
    fullSh++;
    if (fullSh === 4) {
      document.querySelector('.booster-btn.right-btn').disabled = true;
    }
    updateDisplays();
    document.querySelector('[data-page="home"]').click();
  }
}
function boostingTap() {
  if (bostp < 3) {
    bostp++;
    clickP *= 7;

    // ایجاد المان انیمیشن
    const boostAnimation = document.createElement('div');
    boostAnimation.className = 'boost-animation';

    // اضافه کردن تصاویر
    for (let i = 1; i <= 6; i++) {
      const img = document.createElement('img');
      img.src = `img/boost_animation/${i}.png`;
      boostAnimation.appendChild(img);
    }

    // اضافه کردن به صفحه
    document.querySelector('.game-area').appendChild(boostAnimation);

    // حذف انیمیشن بعد از 10 ثانیه
    setTimeout(() => {
      boostAnimation.remove();
      clickP /= 7;
    }, 10000);

    if (bostp === 4) {
      document.querySelector('.booster-btn.left-btn').disabled = true;
    }
    updateDisplays();
    document.querySelector('[data-page="home"]').click();
  }
}
function resetDailyBoosters() {
  const now = new Date();
  if (now.getHours() === 0 && now.getMinutes() === 0) {
    fullSh = 0;
    bostp = 0;
    document.querySelector('.booster-btn.right-btn').disabled = false;
    document.querySelector('.booster-btn.left-btn').disabled = false;
    updateDisplays();
  }
}

setInterval(resetDailyBoosters, 60000);

updateDisplays();

function upgradeMultitap() {
  const upgrades = [
    { cost: 250, fee: 250, level: 1 },
    { cost: 2500, fee: 2500, level: 2 },
    { cost: 5000, fee: 5000, level: 3 },
    { cost: 10000, fee: 10000, level: 4 },
    { cost: 20000, fee: 20000, level: 5 },
    { cost: 40000, fee: 40000, level: 6 },
    { cost: 80000, fee: 80000, level: 7 },
    { cost: 160000, fee: 160000, level: 8 },
    { cost: 320000, fee: 320000, level: 9 },
    { cost: 640000, fee: 640000, level: 'Max' },
  ];

  if (multitapLevel < upgrades.length) {
    if (coins >= upgrades[multitapLevel].cost) {
      coins -= upgrades[multitapLevel].cost;
      clickP++;
      multitapLevel++;

      const upgrade = upgrades[multitapLevel];
      document.getElementById('feeCoinTap').textContent = upgrade.fee;
      document.getElementById(
        'lvlCoinTap'
      ).textContent = `${upgrade.level} level`;

      updateDisplays();
    } else {
      showNotification('Insufficient Balance');
    }
  }
}

function upgradeEnergyLimit() {
  const upgrades = [
    { cost: 250, fee: 250, level: 1 },
    { cost: 2500, fee: 2500, level: 2 },
    { cost: 5000, fee: 5000, level: 3 },
    { cost: 10000, fee: 10000, level: 4 },
    { cost: 20000, fee: 20000, level: 5 },
    { cost: 40000, fee: 40000, level: 6 },
    { cost: 80000, fee: 80000, level: 7 },
    { cost: 160000, fee: 160000, level: 8 },
    { cost: 320000, fee: 320000, level: 9 },
    { cost: 640000, fee: 640000, level: 'MAX' },
  ];

  if (energyLimitLevel < upgrades.length) {
    if (coins >= upgrades[energyLimitLevel].cost) {
      coins -= upgrades[energyLimitLevel].cost;
      tEnergy += 500;
      energyLimitLevel++;

      const upgrade = upgrades[energyLimitLevel];
      document.getElementById('feeTotalEnergy').textContent = upgrade.fee;
      document.getElementById(
        'lvlTotalEnergy'
      ).textContent = `${upgrade.level} level`;

      updateDisplays();
    } else {
      showNotification('Insufficient Balance');
    }
  }
}

function upgradeRecharging() {
  const upgrades = [
    { cost: 25000, fee: 25000, level: 1 },
    { cost: 50000, fee: 50000, level: 2 },
    { cost: 100000, fee: 100000, level: 3 },
    { cost: 200000, fee: 200000, level: 4 },
    { cost: 400000, fee: 400000, level: 5 },
    { cost: 600000, fee: 600000, level: 6 },
    { cost: 800000, fee: 800000, level: 7 },
    { cost: 1600000, fee: 1600000, level: 8 },
    { cost: 3200000, fee: 3200000, level: 9 },
    { cost: 6400000, fee: 6400000, level: 'MAX' },
  ];

  if (rechargingLevel < upgrades.length) {
    if (coins >= upgrades[rechargingLevel].cost) {
      coins -= upgrades[rechargingLevel].cost;
      regen++;
      rechargingLevel++;

      const upgrade = upgrades[rechargingLevel];
      document.getElementById('feeRegEnergy').textContent = upgrade.fee;
      document.getElementById(
        'lvlRegEnergy'
      ).textContent = `${upgrade.level} level`;

      updateDisplays();
    } else {
      showNotification('Insufficient Balance');
    }
  }
}

function updateLeague() {
  let newLeague = 'Bronze';

  if (coins > 50000000) {
    newLeague = 'Mythic';
  } else if (coins > 10000000) {
    newLeague = 'Legendary';
  } else if (coins > 5000000) {
    newLeague = 'Elite';
  } else if (coins > 2500000) {
    newLeague = 'Grandmaster';
  } else if (coins > 1000000) {
    newLeague = 'Master';
  } else if (coins > 500000) {
    newLeague = 'Diamond';
  } else if (coins > 250000) {
    newLeague = 'Platinum';
  } else if (coins > 50000) {
    newLeague = 'Gold';
  } else if (coins > 5000) {
    newLeague = 'Silver';
  }

  const leagueRanks = {
    Bronze: 1,
    Silver: 2,
    Gold: 3,
    Platinum: 4,
    Diamond: 5,
    Master: 6,
    Grandmaster: 7,
    Elite: 8,
    Legendary: 9,
    Mythic: 10,
  };

  if (leagueRanks[newLeague] > leagueRanks[highestLeague]) {
    highestLeague = newLeague;
  }

  league = highestLeague;
}

// این تابع را در زمان بارگذاری صفحه فراخوانی کنید
function checkOfflineTime() {
  const currentTime = Date.now();
  offSec = Math.floor((currentTime - lastOnlineTime) / 1000);

  // محدودیت 3 ساعته
  offSec = Math.min(offSec, 3 * 60 * 60);

  if (offSec > 0) {
    showOfflineEarnings();
  }

  lastOnlineTime = currentTime;
}

function showOfflineEarnings() {
  const earnings = offSec * regen;

  const modal = document.createElement('div');
  modal.className = 'offline-modal';
  modal.innerHTML = `
        <i class="fas fa-robot"></i>
        <p>شما در مدت غیبت خود ${earnings} سکه به دست آوردید!</p>
        <button onclick="closeOfflineModal()">تایید</button>
    `;

  document.body.appendChild(modal);
}

function closeOfflineModal() {
  const modal = document.querySelector('.offline-modal');
  if (modal) {
    modal.remove();
  }
  coins += offSec * regen;
  updateDisplays();
}

const tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
  manifestUrl: '/tonconnect-manifest.json',
  buttonRootId: 'ton-connect-button',
});

function updateAssets(assets) {
  const walletAssets = document.getElementById('walletAssets');
  walletAssets.innerHTML = assets.map(asset => `
    <div class="asset-item">
      <i class="fab fa-${getAssetIcon(asset.symbol)}"></i>
      <div class="asset-info">
        <span class="asset-name">${asset.symbol}</span>
        <span class="asset-balance">${asset.balance} ${asset.symbol}</span>
      </div>
    </div>
  `).join('');
}
tonConnectUI.onStatusChange((wallet) => {
  if (wallet) {
    const address = wallet.account.address;

    fetch(`https://toncenter.com/api/v2/getAddressBalance?address=${address}`)
      .then(response => response.json())
      .then(data => {
        // تبدیل با دقت بیشتر
        const tonBalance = Number(data.result) / 1e9;
        const tonPrice = 5.17; // قیمت به‌روز TON
        const usdValue = tonBalance * tonPrice;

        // نمایش با 4 رقم اعشار برای TON
        document.querySelector('.balance-value').textContent = formatBalance(usdValue);

        const walletAssets = document.getElementById('walletAssets');
        walletAssets.innerHTML = `
            <div class="asset-item">
              <i class="fab fa-telegram-plane"></i>
              <div class="asset-info">
                <span class="asset-name">TON</span>
                <span class="asset-balance">${tonBalance.toFixed(4)} TON</span>
              </div>
            </div>
          `;
      });
  } else {
    // ریست کردن تمام مقادیر به صفر
    document.querySelector('.balance-value').textContent = '0.00';

    const walletAssets = document.getElementById('walletAssets');
    walletAssets.innerHTML = `
      <div class="asset-item">
        <i class="fab fa-telegram-plane"></i>
        <div class="asset-info">
          <span class="asset-name">TON</span>
          <span class="asset-balance">0.00 TON</span>
        </div>
      </div>
    `;
  }
});
function formatBalance(value) {
  if (!value || isNaN(value)) return '0.00';
  // نمایش دلار با دو رقم اعشار
  return value.toFixed(2);
}

function getAssetIcon(symbol) {
  switch (symbol) {
    case 'TON': return 'telegram-plane';
    case 'BTC': return 'bitcoin';
    case 'ETH': return 'ethereum';
    case 'USDT': return 'usd';
    default: return 'coin';
  }
}

function markTaskAsCompleted(taskElement) {
  // تغییر آیکن به تیک سبز
  const chevronIcon = taskElement.querySelector('.fa-chevron-right');
  chevronIcon.className = 'fas fa-check';
  chevronIcon.style.color = '#4CAF50';

  // غیرفعال کردن کلیک
  taskElement.style.opacity = '0.7';
  taskElement.style.cursor = 'default';
  taskElement.onclick = null;
}

function watchYoutube() {
  const taskElement = event.currentTarget;
  if (!taskElement.classList.contains('completed')) {
    const reward = 1000;
    window.open('https://youtube.com/channel/YOUR_CHANNEL', '_blank');
    coins += reward;
    updateDisplays();
    taskElement.classList.add('completed');
    markTaskAsCompleted(taskElement);
  }
}

function invite3Friends() {
  const taskElement = event.currentTarget;
  if (!taskElement.classList.contains('completed')) {
    const reward = 5000;
    const shareText =
      'Join me in this awesome game! Use my referral code: ' +
      document.getElementById('referralCode').textContent;

    if (navigator.share) {
      navigator.share({
        title: 'Join My Game',
        text: shareText,
        url: window.location.href,
      });
    }

    coins += reward;
    updateDisplays();
    taskElement.classList.add('completed');
    markTaskAsCompleted(taskElement);
  }
}

function FollowOnTwitter() {
  const taskElement = event.currentTarget;
  if (!taskElement.classList.contains('completed')) {
    const reward = 10000;
    window.open('https://twitter.com/YOUR_TWITTER', '_blank');
    coins += reward;
    updateDisplays();
    taskElement.classList.add('completed');
    markTaskAsCompleted(taskElement);
  }
}


function showNotification(message) {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = 'balance-notification';
  notification.textContent = 'Insufficient Balance';

  // Add to boost page
  document.querySelector('.boostPage').appendChild(notification);

  // Remove after 3 seconds
  setTimeout(() => {
    notification.classList.add('fade-out');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

function buyBot() {
  const botCost = 2000000;

  if (coins >= botCost && !hasTapBot) {
    coins -= botCost;
    hasTapBot = true;
    updateDisplays();
  } else if (!hasTapBot) {
    showNotification('Insufficient Balance');
  }
}

// ایجاد کد دعوت منحصر به فرد برای هر کاربر
function generateReferralCode() {
  const tg = window.Telegram?.WebApp || {
    initDataUnsafe: {
      user: {
        id: Math.random().toString(36),
      },
    },
  };

  const userId = tg.initDataUnsafe?.user?.id || Math.random().toString(36);
  return `REF${userId}${Math.random().toString(36).substr(2, 6)}`.toUpperCase();
}

function generateTelegramRefLink() {
  const botUsername = 'CryptooTapBot'; // نام بات تلگرام شما
  const userCode = generateReferralCode(); // کد منحصر به فرد کاربر
  return `https://t.me/${botUsername}?start=${userCode}`;
}

function updateReferralUI() {
  const referralCodeElement = document.getElementById('referralCode');
  const userReferralCode = generateReferralCode();
  const telegramLink = generateTelegramRefLink();

  // فقط آپدیت متن کد ریفرال
  referralCodeElement.textContent = telegramLink;
}
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    const copyBtn = document.querySelector('.copy-btn');
    copyBtn.innerHTML = '<i class="fas fa-check"></i>';
    setTimeout(() => {
      copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
    }, 2000);
  });
}

// اجرای تابع هنگام لود صفحه
document.addEventListener('DOMContentLoaded', updateReferralUI);

// بررسی و ثبت کاربر دعوت شده
function checkReferral() {
  const tg = window.Telegram?.WebApp || {
    initDataUnsafe: {
      start_param: null,
      user: {
        id: null,
        first_name: 'Guest',
        photo_url: null,
      },
    },
  };

  const startParam = tg.initDataUnsafe?.start_param;

  if (startParam && startParam.startsWith('REF')) {
    const referrer = startParam;
    const invitedUser = {
      id: tg.initDataUnsafe?.user?.id,
      name: tg.initDataUnsafe?.user?.first_name,
      photo: tg.initDataUnsafe?.user?.photo_url,
      level: 1,
      lastUpdate: Date.now(),
    };

    saveInvitedUser(referrer, invitedUser);
  }
}
// ذخیره اطلاعات کاربر دعوت شده
function saveInvitedUser(referrer, user) {
  let invitedUsers = JSON.parse(localStorage.getItem('invitedUsers') || '{}');
  if (!invitedUsers[referrer]) {
    invitedUsers[referrer] = [];
  }
  invitedUsers[referrer].push(user);
  localStorage.setItem('invitedUsers', JSON.stringify(invitedUsers));
  updateInvitedUsersList();
}

// آپدیت لیست کاربران دعوت شده
function updateInvitedUsersList() {
  const userList = document.querySelector('.user-list');
  const referralCode = localStorage.getItem('referralCode');
  const invitedUsers =
    JSON.parse(localStorage.getItem('invitedUsers') || '{}')[referralCode] ||
    [];

  userList.innerHTML = invitedUsers
    .map(
      (user) => `
        <div class="user-item">
            <div class="user-info">
                ${user.photo
          ? `<img src="${user.photo}" alt="${user.name}" class="user-avatar">`
          : '<i class="fas fa-user-circle"></i>'
        }
                <span>${user.name}</span>
            </div>
            <div class="user-level">
                <i class="fas fa-trophy"></i>
                <span>${user.league || 'Bronze'}</span>
            </div>
        </div>
    `
    )
    .join('');
}

function saveInvitedUser(referrer, user) {
  let invitedUsers = JSON.parse(localStorage.getItem('invitedUsers') || '{}');
  if (!invitedUsers[referrer]) {
    invitedUsers[referrer] = [];
  }

  const newUser = {
    id: user.id,
    name: user.name,
    photo: user.photo,
    league: league, // استفاده از متغیر سراسری league
  };

  invitedUsers[referrer].push(newUser);
  localStorage.setItem('invitedUsers', JSON.stringify(invitedUsers));
  updateInvitedUsersList();
}

// آپدیت سطح کاربران دعوت شده
function updateInvitedUsersLevel() {
  const referralCode = localStorage.getItem('referralCode');
  let invitedUsers = JSON.parse(localStorage.getItem('invitedUsers') || '{}');

  if (invitedUsers[referralCode]) {
    invitedUsers[referralCode] = invitedUsers[referralCode].map((user) => ({
      ...user,
      level: calculateUserLevel(user),
      lastUpdate: Date.now(),
    }));

    localStorage.setItem('invitedUsers', JSON.stringify(invitedUsers));
    updateInvitedUsersList();
  }
}

// محاسبه سطح کاربر بر اساس فعالیت
function calculateUserLevel(user) {
  const daysSinceJoined =
    (Date.now() - user.lastUpdate) / (1000 * 60 * 60 * 24);
  return Math.min(Math.floor(daysSinceJoined / 2) + user.level, 10);
}

// اجرای توابع در زمان لود صفحه
document.addEventListener('DOMContentLoaded', () => {
  updateReferralCode();
  checkReferral();
  updateInvitedUsersList();

  // آپدیت سطح کاربران هر 24 ساعت
  setInterval(updateInvitedUsersLevel, 24 * 60 * 60 * 1000);
});

window.addEventListener('load', () => {
  setTimeout(() => {
    const loadingPage = document.getElementById('loadingPage');
    loadingPage.style.opacity = '0';
    loadingPage.style.transition = 'opacity 0.5s ease';
    setTimeout(() => {
      loadingPage.style.display = 'none';
    }, 500);
  }, 3000); // تغییر از 2000 به 3000 میلی‌ثانیه
});
