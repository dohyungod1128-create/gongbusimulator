/**
 * K-고3: 수능 전국 수석 키우기 - 운명의 200일 편
 * 원본 파이썬 게임 로직 100% 반영 + UI/UX 및 버그 보완 웹 버전
 */

const SUBJECT_META = [
  { key: "국어", num: 1, icon: "📖", buffDesc: "100등 이내: 등수 상승량 1.5배" },
  { key: "수학", num: 2, icon: "📐", buffDesc: "100등 이내: 공부 장학금 2배" },
  { key: "영어", num: 3, icon: "🔤", buffDesc: "100등 이내: 상점 전 품목 20% 할인" },
  { key: "한국사", num: 4, icon: "🏺", buffDesc: "100등 이내: 하락 확률 0% 고정" },
  { key: "과학", num: 5, icon: "🧪", buffDesc: "100등 이내: 드링크 효율 2배(+10%p)" },
  { key: "사회", num: 6, icon: "🌍", buffDesc: "100등 이내: 과외 효율 2배(+20%p)" }
];

const ENDINGS_CATALOG = [
  {
    id: "perfect",
    icon: "👑",
    title: "[엔딩: 전설의 수능 만점자]",
    story: "서울대 의예과 수석 합격! 뉴스 인터뷰: '교과서 위주로 충실히 공부했어요^^'",
    condition: "전 과목 10등 이내 달성"
  },
  {
    id: "liberal_arts",
    icon: "🏛️",
    title: "[엔딩: 문과 황제]",
    story: "압도적인 문과 성적으로 서울대 경영학과 수석 합격! 차기 로스쿨 수석 예약!",
    condition: "국어·영어·사회 50등 이내 & 종합 200등 이내"
  },
  {
    id: "science_genius",
    icon: "🔬",
    title: "[엔딩: 이과 천재]",
    story: "수학과 과학의 신! 카이스트 장학생으로 조기 입학! 랩실 노예 확정!",
    condition: "수학·과학 50등 이내 & 종합 200등 이내"
  },
  {
    id: "in_seoul",
    icon: "🏫",
    title: "[엔딩: 인서울 명문대 합격]",
    story: "성공적인 수험 생활! 원하는 인서울 명문대에 프리패스 합격했습니다!",
    condition: "최종 종합 등수 200등 이내"
  },
  {
    id: "normal_college",
    icon: "🎒",
    title: "[엔딩: 평범하고 즐거운 대학생]",
    story: "무난하게 지거국에 합격하여 즐거운 MT와 미팅 등 대학 생활을 시작합니다.",
    condition: "최종 종합 등수 500등 이내"
  },
  {
    id: "retake",
    icon: "📝",
    title: "[엔딩: 다시 한번 도전! (4수생)]",
    story: "대치동 재수 종합 학원 VIP 멤버로 등록되었습니다. 내년엔 꼭 성공합시다!",
    condition: "최종 종합 등수 501등 이하 또는 중도 포기"
  },
  {
    id: "hospital",
    icon: "🏥",
    title: "[엔딩: 건강을 잃은 수험생]",
    story: "성적도 중요하지만 건강이 최고입니다. 무리한 공부로 요양병원에 입원했습니다...",
    condition: "응급실 누적 3회 입원"
  }
];

// 효과음 합성기 (Web Audio API)
class SoundFX {
  constructor() {
    this.enabled = true;
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  playTone(freq, type = "sine", duration = 0.12, delay = 0, vol = 0.12) {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const startTime = this.ctx.currentTime + delay;

      osc.type = type;
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(vol, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration);
    } catch (e) {
      // 오디오 컨텍스트 예외 무시
    }
  }

  crit() {
    this.playTone(523.25, "triangle", 0.1, 0, 0.16);
    this.playTone(659.25, "triangle", 0.1, 0.07, 0.16);
    this.playTone(783.99, "triangle", 0.12, 0.14, 0.18);
    this.playTone(1046.5, "triangle", 0.25, 0.21, 0.2);
  }

  rise() {
    this.playTone(440, "sine", 0.1, 0, 0.13);
    this.playTone(587.33, "sine", 0.16, 0.08, 0.14);
  }

  maintain() {
    this.playTone(349.23, "sine", 0.12, 0, 0.1);
  }

  drop() {
    this.playTone(311.13, "sawtooth", 0.14, 0, 0.1);
    this.playTone(233.08, "sawtooth", 0.22, 0.1, 0.12);
  }

  buy() {
    this.playTone(659.25, "sine", 0.08, 0, 0.12);
    this.playTone(880, "sine", 0.15, 0.07, 0.14);
  }

  error() {
    this.playTone(196, "square", 0.15, 0, 0.1);
  }

  siren() {
    this.playTone(600, "sawtooth", 0.2, 0, 0.14);
    this.playTone(420, "sawtooth", 0.2, 0.2, 0.14);
    this.playTone(600, "sawtooth", 0.2, 0.4, 0.14);
  }

  fanfare() {
    [523.25, 659.25, 783.99, 1046.5].forEach((f, idx) => {
      this.playTone(f, "triangle", 0.2, idx * 0.1, 0.16);
    });
  }
}

const sfx = new SoundFX();

// 게임 상태 객체
let state = {};
let activeEvent = null;
let unlockedEndings = new Set();

function loadUnlockedEndings() {
  try {
    const saved = localStorage.getItem("k_go3_endings_v1");
    if (saved) {
      unlockedEndings = new Set(JSON.parse(saved));
    }
  } catch (e) {}
  updateEndingCountBadge();
}

function saveUnlockedEnding(id) {
  unlockedEndings.add(id);
  try {
    localStorage.setItem("k_go3_endings_v1", JSON.stringify([...unlockedEndings]));
  } catch (e) {}
  updateEndingCountBadge();
}

function updateEndingCountBadge() {
  const badge = document.getElementById("endingCountBadge");
  if (badge) {
    badge.textContent = `${unlockedEndings.size}/${ENDINGS_CATALOG.length}`;
  }
}

// 초기 상태 리셋
function initGameState() {
  state = {
    subjects: {
      "국어": 1000,
      "수학": 1000,
      "영어": 1000,
      "한국사": 1000,
      "과학": 1000,
      "사회": 1000
    },
    money: 60,
    totalTurns: 0,
    maxTurns: 200,
    hp: 100,
    hospitalCount: 0,
    drinkCount: 0,
    bookCount: 0,
    tutorCount: 0,
    hasGinseng: false,
    hasPhone: false,
    hasPlanner: false,
    hasHeadphone: false,
    completedMockExams: [], // [40, 80, 120, 160]
    logs: [],
    isGameOver: false
  };
  activeEvent = null;
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getGrade(rank) {
  if (rank <= 40) return { text: "1등급", num: 1 };
  if (rank <= 110) return { text: "2등급", num: 2 };
  if (rank <= 230) return { text: "3등급", num: 3 };
  if (rank <= 400) return { text: "4등급", num: 4 };
  if (rank <= 600) return { text: "5등급", num: 5 };
  if (rank <= 770) return { text: "6등급", num: 6 };
  if (rank <= 890) return { text: "7등급", num: 7 };
  if (rank <= 960) return { text: "8등급", num: 8 };
  return { text: "9등급", num: 9 };
}

function getOverallRank() {
  const vals = Object.values(state.subjects);
  const sum = vals.reduce((a, b) => a + b, 0);
  return Math.floor(sum / 6);
}

// 패시브 버프 및 확률 계산 (원본 수식 100% 동일)
function computeDerivedStats() {
  const s = state.subjects;
  const buffKor = s["국어"] <= 100;
  const buffMath = s["수학"] <= 100;
  const buffEng = s["영어"] <= 100;
  const buffHist = s["한국사"] <= 100;
  const buffSci = s["과학"] <= 100;
  const buffSoc = s["사회"] <= 100;

  const discount = buffEng ? 0.8 : 1.0;
  const moneyMult = buffMath ? 2 : 1;
  const boostMult = buffKor ? 1.5 : 1.0;
  const drinkEff = buffSci ? 10 : 5;
  const tutorEff = buffSoc ? 20 : 10;

  const critChance = Math.min(50, state.tutorCount * tutorEff);
  const dropChance = buffHist ? 0 : Math.max(0, 15 - state.bookCount * 5);
  const baseRise = 50 + state.drinkCount * drinkEff + (state.hasHeadphone ? 10 : 0);
  const riseChance = Math.min(100 - critChance - dropChance, baseRise);
  const maintainChance = Math.max(0, 100 - critChance - dropChance - riseChance);

  const activeBuffCount = [buffKor, buffMath, buffEng, buffHist, buffSci, buffSoc].filter(Boolean).length;

  return {
    buffKor,
    buffMath,
    buffEng,
    buffHist,
    buffSci,
    buffSoc,
    discount,
    moneyMult,
    boostMult,
    drinkEff,
    tutorEff,
    critChance,
    dropChance,
    riseChance,
    maintainChance,
    activeBuffCount
  };
}

// 수험 일지 로그 추가
function addLog(message) {
  const dday = Math.max(0, state.maxTurns - state.totalTurns);
  const tag = dday === 0 ? "D-Day" : `D-${dday}`;
  state.logs.unshift({ tag, message });
  if (state.logs.length > 35) state.logs.pop();
}

// 상단 피드백 배너 업데이트
function setFeedback(icon, mainText, subText, flashType = "") {
  const banner = document.getElementById("liveFeedbackBanner");
  document.getElementById("feedbackIcon").textContent = icon;
  document.getElementById("feedbackMain").textContent = mainText;
  document.getElementById("feedbackSub").textContent = subText;

  banner.classList.remove("flash-crit", "flash-rise", "flash-drop");
  if (flashType) {
    void banner.offsetWidth; // reflow
    banner.classList.add(flashType);
  }
}

// 화면 플로팅 텍스트 연출
function spawnFloatingText(targetEl, text, color = "#34d399") {
  if (!targetEl) return;
  const rect = targetEl.getBoundingClientRect();
  const pop = document.createElement("div");
  pop.className = "floating-pop";
  pop.textContent = text;
  pop.style.color = color;
  pop.style.left = `${rect.left + rect.width / 2 - 35}px`;
  pop.style.top = `${rect.top + 10}px`;
  document.body.appendChild(pop);
  setTimeout(() => pop.remove(), 1100);
}

// 전체 UI 렌더링
function renderAll() {
  const derived = computeDerivedStats();
  const overallRank = getOverallRank();
  const overallGrade = getGrade(overallRank);
  const remainingDays = Math.max(0, state.maxTurns - state.totalTurns);

  // 1. D-Day & 타임라인
  document.getElementById("ddayDisplay").textContent = remainingDays === 0 ? "D-Day" : `D-${remainingDays}`;
  const nextMockTurn = [40, 80, 120, 160].find(t => t > state.totalTurns && !state.completedMockExams.includes(t));
  const nextMockLabel = nextMockTurn ? `다음 모의고사: D-${state.maxTurns - nextMockTurn}` : "파이널 스퍼트 구간!";
  document.getElementById("turnSubDisplay").textContent = `경과: ${state.totalTurns}일 / 200일 (${nextMockLabel})`;
  const progressPct = Math.min(100, (state.totalTurns / state.maxTurns) * 100);
  document.getElementById("timelineFill").style.width = `${progressPct}%`;

  // 입원 횟수 뱃지
  const hospBadge = document.getElementById("hospitalBadge");
  hospBadge.textContent = `🏥 입원 ${state.hospitalCount} / 3회`;
  hospBadge.className = "hospital-pill";
  if (state.hospitalCount === 1) hospBadge.classList.add("warn-1");
  if (state.hospitalCount >= 2) hospBadge.classList.add("warn-2");

  // 2. 체력 게이지
  const hpVal = Math.max(0, state.hp);
  document.getElementById("hpDisplay").textContent = hpVal;
  const hpFill = document.getElementById("hpBarFill");
  hpFill.style.width = `${Math.min(100, hpVal)}%`;
  hpFill.className = "hp-bar-inner";

  const hpStatusBadge = document.getElementById("hpStatusBadge");
  hpStatusBadge.className = "hp-status-badge";
  if (hpVal > 50) {
    hpStatusBadge.textContent = "안정";
    hpStatusBadge.classList.add("status-stable");
    document.body.classList.remove("burnout-alert");
  } else if (hpVal > 20) {
    hpStatusBadge.textContent = "경고";
    hpStatusBadge.classList.add("status-warning");
    hpFill.classList.add("warn");
    document.body.classList.remove("burnout-alert");
  } else {
    hpStatusBadge.textContent = "🔥번아웃🔥";
    hpStatusBadge.classList.add("status-burnout");
    hpFill.classList.add("danger");
    document.body.classList.add("burnout-alert");
  }

  document.getElementById("hpHintText").textContent = state.hasGinseng
    ? "💊 홍삼 적용: 공부 시 7~10 소모"
    : "공부 시 10~15 소모";

  // 3. 종합 등수 & 장학금
  document.getElementById("overallRankDisplay").textContent = overallRank;
  const overallGradeEl = document.getElementById("overallGradeBadge");
  overallGradeEl.textContent = `평균 ${overallGrade.text}`;
  overallGradeEl.className = `grade-pill grade-${overallGrade.num}`;
  document.getElementById("activeBuffCountText").textContent = `활성화된 과목 패시브: ${derived.activeBuffCount} / 6개`;

  document.getElementById("moneyDisplay").textContent = state.money.toLocaleString();
  const discountBadge = document.getElementById("discountBadge");
  if (derived.buffEng) {
    discountBadge.classList.remove("hidden");
  } else {
    discountBadge.classList.add("hidden");
  }
  document.getElementById("moneySubText").textContent = derived.buffMath
    ? "📐 수학 패시브 ON: 열공 장학금 2배 적용 중!"
    : "열공 및 모의고사로 장학금 획득";

  // 4. 확률 바 업데이트
  document.getElementById("probCritText").textContent = `${derived.critChance}%`;
  document.getElementById("probRiseText").textContent = `${derived.riseChance}%`;
  document.getElementById("probMaintainText").textContent = `${derived.maintainChance}%`;
  document.getElementById("probDropText").textContent = `${derived.dropChance}%`;

  document.getElementById("barCrit").style.width = `${derived.critChance}%`;
  document.getElementById("barRise").style.width = `${derived.riseChance}%`;
  document.getElementById("barMaintain").style.width = `${derived.maintainChance}%`;
  document.getElementById("barDrop").style.width = `${derived.dropChance}%`;

  // 5. 6개 과목 카드 렌더링
  renderSubjects(derived);

  // 6. 상점 & 휴식 & 영구 장비 렌더링
  renderShop(derived);

  // 7. 로그 업데이트
  const logList = document.getElementById("studyLogList");
  document.getElementById("logTurnIndicator").textContent = remainingDays === 0 ? "D-Day" : `D-${remainingDays}`;
  logList.innerHTML = state.logs
    .map(item => `<li><span class="log-turn-badge">${item.tag}</span><span>${item.message}</span></li>`)
    .join("");
}

function renderSubjects(derived) {
  const container = document.getElementById("subjectsGrid");
  container.innerHTML = "";

  SUBJECT_META.forEach(meta => {
    const rank = state.subjects[meta.key];
    const grade = getGrade(rank);
    const isBuffOn = rank <= 100;
    const isMaxed = rank <= 1;
    const progress = Math.max(2, ((1000 - rank) / 999) * 100);

    const card = document.createElement("div");
    card.className = `subject-card ${isBuffOn ? "buff-active" : ""} ${isMaxed ? "rank-maxed" : ""}`;
    card.id = `subject-card-${meta.num}`;
    card.innerHTML = `
      <div class="subj-top-row">
        <div class="subj-name-group">
          <span class="key-badge">[${meta.num}]</span>
          <span class="subj-icon">${meta.icon}</span>
          <span class="subj-title">${meta.key}</span>
        </div>
        <span class="grade-pill grade-${grade.num}">${grade.text}</span>
      </div>
      <div class="subj-mid-row">
        <div>
          <span class="subj-rank-num">${rank}</span>
          <span class="subj-rank-unit">등 / 1000등</span>
        </div>
        <span style="font-size:0.76rem; color:${isMaxed ? "#fbbf24" : "#94a3b8"}; font-weight:700;">
          ${isMaxed ? "👑 전국 1등 마스터!" : "클릭하여 열공"}
        </span>
      </div>
      <div class="subj-progress-track">
        <div class="subj-progress-fill" style="width: ${progress}%"></div>
      </div>
      <div class="subj-buff-row">
        <span class="buff-desc">${meta.buffDesc}</span>
        <span class="buff-Active-tag ${isBuffOn ? "on" : "off"}">${isBuffOn ? "버프 ON ✨" : "OFF"}</span>
      </div>
    `;
    card.addEventListener("click", () => handleStudySubject(meta.key, meta.num));
    container.appendChild(card);
  });
}

function renderShop(derived) {
  const disc = derived.discount;
  const consumables = [
    {
      num: 7,
      icon: "☕",
      name: "에너지 드링크",
      price: Math.floor(50 * disc),
      desc: `상승 확률 +${derived.drinkEff}%p`,
      stack: `누적 ${state.drinkCount}회`,
      disabled: state.money < Math.floor(50 * disc)
    },
    {
      num: 8,
      icon: "📘",
      name: "시크릿 족보",
      price: Math.floor(150 * disc),
      desc: derived.dropChance <= 0 ? "하락 확률 이미 0%" : "하락 확률 -5%p",
      stack: `누적 ${state.bookCount}권`,
      disabled: state.money < Math.floor(150 * disc) || derived.dropChance <= 0
    },
    {
      num: 9,
      icon: "👨‍🏫",
      name: "일타강사 과외",
      price: Math.floor(500 * disc),
      desc: derived.critChance >= 50 ? "대박 확률 최대치(50%)" : `대박 확률 +${derived.tutorEff}%p`,
      stack: `누적 ${state.tutorCount}회`,
      disabled: state.money < Math.floor(500 * disc) || derived.critChance >= 50
    },
    {
      num: 10,
      icon: "🛌",
      name: "꿀낮잠 자기",
      price: 0,
      desc: "체력 +25 회복 (1일 소모)",
      stack: "무료 휴식",
      disabled: false,
      isFree: true
    },
    {
      num: 11,
      icon: "🍗",
      name: "치킨 먹방",
      price: Math.floor(40 * disc),
      desc: "체력 +40 회복 (턴 소모 없음!)",
      stack: "즉시 회복",
      disabled: state.money < Math.floor(40 * disc)
    },
    {
      num: 16,
      icon: "🍵",
      name: "전설의 총명탕",
      price: Math.floor(1000 * disc),
      desc: "즉시 전 과목 30등 상승!",
      stack: "특수 비약",
      disabled: state.money < Math.floor(1000 * disc)
    }
  ];

  const cGrid = document.getElementById("consumablesGrid");
  cGrid.innerHTML = "";
  consumables.forEach(item => {
    const btn = document.createElement("button");
    btn.className = "shop-btn";
    btn.id = `shop-btn-${item.num}`;
    btn.disabled = item.disabled;
    btn.innerHTML = `
      <div class="shop-top">
        <span class="shop-name"><span class="key-badge">[${item.num}]</span> ${item.icon} ${item.name}</span>
        <span class="shop-price ${item.isFree ? "free" : ""}">${item.isFree ? "0원" : `${item.price}원`}</span>
      </div>
      <div class="shop-desc">
        <span>${item.desc}</span>
        <span class="stack-badge">${item.stack}</span>
      </div>
    `;
    btn.addEventListener("click", () => handleShopAction(item.num));
    cGrid.appendChild(btn);
  });

  const equipments = [
    {
      num: 12,
      icon: "💊",
      name: "고려 홍삼",
      price: Math.floor(120 * disc),
      desc: "공부 시 체력 소모 30% 감소",
      owned: state.hasGinseng
    },
    {
      num: 13,
      icon: "📱",
      name: "수험생 2G폰",
      price: Math.floor(250 * disc),
      desc: "성적 하락 시 하락폭 절반 방어",
      owned: state.hasPhone
    },
    {
      num: 14,
      icon: "⏰",
      name: "스터디 플래너",
      price: Math.floor(350 * disc),
      desc: "30% 확률로 타 과목 1+1 상승",
      owned: state.hasPlanner
    },
    {
      num: 15,
      icon: "🎧",
      name: "노캔 헤드폰",
      price: Math.floor(600 * disc),
      desc: "상승 확률 영구 +10%p 증가",
      owned: state.hasHeadphone
    }
  ];

  const eGrid = document.getElementById("equipmentGrid");
  eGrid.innerHTML = "";
  equipments.forEach(eq => {
    const btn = document.createElement("button");
    btn.className = `shop-btn ${eq.owned ? "owned-item" : ""}`;
    btn.id = `shop-btn-${eq.num}`;
    btn.disabled = eq.owned || state.money < eq.price;
    btn.innerHTML = `
      <div class="shop-top">
        <span class="shop-name"><span class="key-badge">[${eq.num}]</span> ${eq.icon} ${eq.name}</span>
        <span class="shop-price ${eq.owned ? "owned" : ""}">${eq.owned ? "장착 완료 [O]" : `${eq.price}원`}</span>
      </div>
      <div class="shop-desc">
        <span>${eq.desc}</span>
        <span class="stack-badge">${eq.owned ? "영구 적용 중" : "미보유 [X]"}</span>
      </div>
    `;
    btn.addEventListener("click", () => handleShopAction(eq.num));
    eGrid.appendChild(btn);
  });
}

// 과목 열공 처리 (1~6)
function handleStudySubject(subjectKey, subjectNum) {
  if (state.isGameOver || isAnyModalOpen()) return;

  const cardEl = document.getElementById(`subject-card-${subjectNum}`);
  if (state.subjects[subjectKey] <= 1) {
    sfx.error();
    setFeedback("✨", `${subjectKey} 과목은 이미 전국 1등으로 완벽합니다!`, "다른 과목을 선택하여 열공해 보세요.");
    spawnFloatingText(cardEl, "이미 전국 1등!", "#fbbf24");
    return;
  }

  const derived = computeDerivedStats();
  let efficiency = 1.0;

  // 번아웃 체크 (체력 <= 20)
  if (state.hp <= 20) {
    if (Math.random() < 0.5) {
      sfx.drop();
      state.hp = Math.min(100, state.hp + 5);
      state.totalTurns += 1;
      const msg = `💤 번아웃! ${subjectKey} 공부 도중 기절하듯 잠들었습니다! (1일 소모, 체력 +5)`;
      addLog(msg);
      setFeedback("💤", "번아웃으로 인해 책상에서 기절하듯 잠들었습니다...", "체력이 20 이하일 때는 휴식(낮잠/치킨)이 시급합니다! (체력 +5, 1일 소모)", "flash-drop");
      spawnFloatingText(cardEl, "💤 기절 잠 (체력+5)", "#f59e0b");
      renderAll();
      checkPostTurnEvents(false);
      return;
    } else {
      efficiency = 0.5;
    }
  }

  // 1턴 경과 및 체력 소모
  state.totalTurns += 1;
  const baseHpLoss = randInt(10, 15);
  const actualHpLoss = state.hasGinseng ? Math.floor(baseHpLoss * 0.7) : baseHpLoss;
  state.hp -= actualHpLoss;

  // 확률 굴림 (1~100)
  const roll = randInt(1, 100);
  const wasUnder100 = state.subjects[subjectKey] <= 100;

  let mainMsg = "";
  let subMsg = efficiency < 1.0 ? "⚠️ 번아웃 상태로 공부 효율이 절반(50%)으로 감소했습니다." : `체력 -${actualHpLoss} 소모`;
  let flashType = "";

  if (roll <= derived.critChance) {
    // 대박
    const boost = Math.max(1, Math.floor(randInt(25, 55) * derived.boostMult * efficiency));
    state.subjects[subjectKey] = Math.max(1, state.subjects[subjectKey] - boost);
    const reward = Math.floor((120 + boost * 2) * derived.moneyMult);
    state.money += reward;

    sfx.crit();
    mainMsg = `💥 [대박 터짐!] ${subjectKey} ${boost}등 수직 상승! (💰 장학금 +${reward}원)`;
    flashType = "flash-crit";
    spawnFloatingText(cardEl, `💥 -${boost}등! (+${reward}원)`, "#fb7185");
  } else if (roll <= derived.critChance + derived.riseChance) {
    // 상승
    const boost = Math.max(1, Math.floor(randInt(6, 18) * derived.boostMult * efficiency));
    state.subjects[subjectKey] = Math.max(1, state.subjects[subjectKey] - boost);
    const reward = Math.floor((40 + boost) * derived.moneyMult);
    state.money += reward;

    sfx.rise();
    mainMsg = `📈 [성적 상승] ${subjectKey} ${boost}등 상승! (💰 장학금 +${reward}원)`;
    flashType = "flash-rise";
    spawnFloatingText(cardEl, `📈 -${boost}등 (+${reward}원)`, "#60a5fa");
  } else if (roll > 100 - derived.dropChance) {
    // 하락
    let drop = randInt(6, 12);
    if (state.hasPhone) drop = Math.max(2, Math.floor(drop / 2));
    state.subjects[subjectKey] = Math.min(1000, state.subjects[subjectKey] + drop);

    sfx.drop();
    mainMsg = `📉 [집중력 저하] 딴짓하다가 ${subjectKey} ${drop}등 하락...${state.hasPhone ? " (📱2G폰 방어 발동)" : ""}`;
    flashType = "flash-drop";
    spawnFloatingText(cardEl, `📉 +${drop}등 하락`, "#facc15");
  } else {
    // 유지
    sfx.maintain();
    mainMsg = `➖ [제자리걸음] ${subjectKey} 등수 변동 없이 유지되었습니다.`;
    spawnFloatingText(cardEl, `➖ 등수 유지`, "#94a3b8");
  }

  // 스터디 플래너 1+1 효과 (30% 확률)
  if (state.hasPlanner && Math.random() < 0.3) {
    const otherKeys = Object.keys(state.subjects).filter(k => k !== subjectKey);
    const otherSub = otherKeys[randInt(0, otherKeys.length - 1)];
    const bonus = Math.max(1, Math.floor(randInt(3, 8) * derived.boostMult * efficiency));
    state.subjects[otherSub] = Math.max(1, state.subjects[otherSub] - bonus);
    subMsg = `📅 [플래너 1+1 발동!] ${otherSub} 과목도 덩달아 ${bonus}등 추가 상승!`;
    addLog(`📅 [플래너 효과] ${otherSub} ${bonus}등 추가 상승!`);
  }

  // 100등 이내 첫 진입 축하 메시지
  if (!wasUnder100 && state.subjects[subjectKey] <= 100) {
    subMsg = `🎉 [${subjectKey} 100등 이내 진입!] 고유 패시브 버프가 활성화되었습니다!`;
    addLog(`✨ [${subjectKey}] 100등 이내 돌파! 패시브 버프 ON!`);
  }

  addLog(mainMsg);
  setFeedback(
    flashType === "flash-crit" ? "💥" : flashType === "flash-rise" ? "📈" : flashType === "flash-drop" ? "📉" : "➖",
    mainMsg,
    subMsg,
    flashType
  );

  renderAll();
  checkPostTurnEvents(true);
}

// 상점 & 휴식 액션 처리 (7~16)
function handleShopAction(actNum) {
  if (state.isGameOver || isAnyModalOpen()) return;

  const derived = computeDerivedStats();
  const basePrices = {
    7: 50,
    8: 150,
    9: 500,
    10: 0,
    11: 40,
    12: 120,
    13: 250,
    14: 350,
    15: 600,
    16: 1000
  };
  const actualPrice = Math.floor(basePrices[actNum] * derived.discount);
  const btnEl = document.getElementById(`shop-btn-${actNum}`);

  if (state.money < actualPrice) {
    sfx.error();
    setFeedback("❌", "보유한 장학금이 부족합니다!", "과목을 열공하거나 모의고사를 통해 장학금을 모아보세요.", "flash-drop");
    return;
  }

  if (actNum === 7) {
    state.money -= actualPrice;
    state.drinkCount += 1;
    sfx.buy();
    const msg = `☕ 에너지 드링크 섭취! 각성 상태에 진입합니다. (상승 확률 +${derived.drinkEff}%p)`;
    addLog(msg);
    setFeedback("☕", msg, `현재 누적 드링크: ${state.drinkCount}캔`, "flash-rise");
    spawnFloatingText(btnEl, `상승 +${derived.drinkEff}%p`, "#60a5fa");
  } else if (actNum === 8) {
    if (derived.dropChance <= 0) {
      sfx.error();
      setFeedback("❌", "성적 하락 확률이 이미 0%입니다!", "더 이상 시크릿 족보가 필요하지 않습니다.");
      return;
    }
    state.money -= actualPrice;
    state.bookCount += 1;
    sfx.buy();
    const msg = `📘 시크릿 족보 획득! 성적 하락 확률이 5%p 감소합니다.`;
    addLog(msg);
    setFeedback("📘", msg, "함정 문제를 피할 수 있는 눈이 생겼습니다!", "flash-rise");
    spawnFloatingText(btnEl, "하락 -5%p", "#34d399");
  } else if (actNum === 9) {
    if (derived.critChance >= 50) {
      sfx.error();
      setFeedback("❌", "대박 확률이 이미 최대치(50%)입니다!", "더 이상 과외를 추가할 수 없습니다.");
      return;
    }
    state.money -= actualPrice;
    state.tutorCount += 1;
    sfx.buy();
    const msg = `👨‍🏫 대치동 일타강사 섭외 완료! (대박 확률 +${derived.tutorEff}%p)`;
    addLog(msg);
    setFeedback("👨‍🏫", msg, "귀에 쏙쏙 박히는 일타강사의 비법 강의!", "flash-crit");
    spawnFloatingText(btnEl, `대박 +${derived.tutorEff}%p`, "#fb7185");
  } else if (actNum === 10) {
    // 낮잠은 1턴 소모
    state.totalTurns += 1;
    state.hp = Math.min(100, state.hp + 25);
    sfx.buy();
    const msg = `🛌 달콤한 꿀잠을 잤습니다. (체력 +25 회복, 1일 소모)`;
    addLog(msg);
    setFeedback("🛌", msg, "적당한 휴식도 수험 전략의 일부입니다.");
    spawnFloatingText(btnEl, "체력 +25 (1일 소모)", "#34d399");
    renderAll();
    checkPostTurnEvents(false);
    return;
  } else if (actNum === 11) {
    state.money -= actualPrice;
    state.hp = Math.min(100, state.hp + 40);
    sfx.buy();
    const msg = `🍗 바삭한 치킨 먹방! (체력 +40 즉시 회복, 턴 소모 없음)`;
    addLog(msg);
    setFeedback("🍗", msg, "치느님의 영접으로 스트레스가 확 날아갑니다!", "flash-rise");
    spawnFloatingText(btnEl, "체력 +40!", "#34d399");
  } else if (actNum === 12) {
    if (state.hasGinseng) return;
    state.money -= actualPrice;
    state.hasGinseng = true;
    sfx.buy();
    const msg = `💊 고려 홍삼 복용 시작! 이제 공부 시 체력 소모가 30% 감소합니다.`;
    addLog(msg);
    setFeedback("💊", msg, "부모님의 사랑이 담긴 홍삼 파워!", "flash-rise");
    spawnFloatingText(btnEl, "체력소모 30% 감소!", "#34d399");
  } else if (actNum === 13) {
    if (state.hasPhone) return;
    state.money -= actualPrice;
    state.hasPhone = true;
    sfx.buy();
    const msg = `📱 스마트폰 처분 & 2G폰 장착! 성적 하락 패널티를 절반으로 방어합니다.`;
    addLog(msg);
    setFeedback("📱", msg, "유튜브와 SNS의 유혹으로부터 완전히 해방되었습니다!", "flash-rise");
    spawnFloatingText(btnEl, "하락폭 절반 방어!", "#34d399");
  } else if (actNum === 14) {
    if (state.hasPlanner) return;
    state.money -= actualPrice;
    state.hasPlanner = true;
    sfx.buy();
    const msg = `⏰ 스터디 플래너 장착! 공부 시 30% 확률로 다른 과목도 1+1 상승합니다.`;
    addLog(msg);
    setFeedback("⏰", msg, "체계적인 시간 관리로 자투리 시간까지 활용합니다!", "flash-rise");
    spawnFloatingText(btnEl, "1+1 공부 발동!", "#34d399");
  } else if (actNum === 15) {
    if (state.hasHeadphone) return;
    state.money -= actualPrice;
    state.hasHeadphone = true;
    sfx.buy();
    const msg = `🎧 노이즈 캔슬링 헤드폰 장착! 성적 상승 확률이 영구적으로 +10%p 증가합니다.`;
    addLog(msg);
    setFeedback("🎧", msg, "독서실 백색소음 모드 ON! 초집중 상태에 들어갑니다.", "flash-rise");
    spawnFloatingText(btnEl, "상승확률 +10%p!", "#60a5fa");
  } else if (actNum === 16) {
    state.money -= actualPrice;
    Object.keys(state.subjects).forEach(sub => {
      state.subjects[sub] = Math.max(1, state.subjects[sub] - 30);
    });
    sfx.crit();
    const msg = `🍵 전설의 총명탕 발동! 전 과목 등수가 즉시 30등씩 상승했습니다!`;
    addLog(msg);
    setFeedback("🍵", msg, "머리가 맑아지고 전 과목의 깨달음이 몰려옵니다!", "flash-crit");
    spawnFloatingText(btnEl, "전과목 -30등!!", "#fbbf24");
  }

  renderAll();
}

// 턴 종료 후 체력 고갈(응급실), 모의고사, 돌발 이벤트, D-Day 체크
function checkPostTurnEvents(allowRandomEvent = true) {
  // 1. 체력 고갈 판정 (hp <= 0)
  if (state.hp <= 0) {
    triggerHospital();
    return;
  }

  // 2. 수능 D-Day 도달 체크
  if (state.totalTurns >= state.maxTurns) {
    triggerEnding();
    return;
  }

  // 3. 40턴 주기 모의고사 체크 (40, 80, 120, 160)
  const dueMock = [40, 80, 120, 160].find(
    milestone => state.totalTurns >= milestone && !state.completedMockExams.includes(milestone)
  );
  if (dueMock) {
    state.completedMockExams.push(dueMock);
    triggerMockExam(dueMock);
    return;
  }

  // 4. 15% 확률 돌발 이벤트 (공부 턴일 때만)
  if (allowRandomEvent && Math.random() < 0.15) {
    triggerRandomEvent();
  }
}

// 응급실 입원 처리
function triggerHospital() {
  sfx.siren();
  state.money = Math.max(0, state.money - 200);
  state.hp = 60;
  state.totalTurns = Math.min(state.maxTurns, state.totalTurns + 3);
  state.hospitalCount += 1;

  addLog(`🚨 [응급실 입원] 과로로 쓰러졌습니다! (장학금 -200원, 3일 소모, 입원 ${state.hospitalCount}/3회)`);
  renderAll();

  if (state.hospitalCount >= 3) {
    // 3번 쓰러지면 즉시 건강 엔딩
    triggerEnding();
    return;
  }

  document.getElementById("hospitalCountAlert").textContent =
    `누적 응급실 입원: ${state.hospitalCount} / 3회 (3회 입원 시 즉시 요양병원 엔딩!)`;
  document.getElementById("hospitalModal").classList.remove("hidden");
}

// 전국 연합 학력평가 (모의고사)
function triggerMockExam(milestoneTurn) {
  sfx.fanfare();
  const overallRank = getOverallRank();
  const overallGrade = getGrade(overallRank);
  const examIndex = milestoneTurn / 40;
  const remaining = state.maxTurns - milestoneTurn;

  document.getElementById("mockExamTitle").textContent =
    `제 ${examIndex}차 전국 연합 학력평가 성적표 (D-${remaining})`;
  document.getElementById("mockOverallRank").textContent =
    `전국 ${overallRank}등 (평균 ${overallGrade.text})`;

  // 과목별 성적 미니 테이블
  const tableEl = document.getElementById("mockSubjectsTable");
  tableEl.innerHTML = SUBJECT_META.map(m => {
    const r = state.subjects[m.key];
    const g = getGrade(r);
    return `
      <div class="mini-subj-cell">
        <span>${m.icon} ${m.key}</span>
        <strong>${r}등 (${g.text})</strong>
      </div>
    `;
  }).join("");

  let emoji = "🎉";
  let title = "";
  let rewardText = "";

  if (overallRank <= 50) {
    emoji = "🎉";
    title = "[전국구 에이스!] 학교의 자랑입니다!";
    rewardText = "특별 장학금 +1,000원 지급!";
    state.money += 1000;
  } else if (overallRank <= 200) {
    emoji = "👏";
    title = "[성적 우수] 명문대 합격 안정권입니다!";
    rewardText = "우수 장학금 +400원 지급!";
    state.money += 400;
  } else if (overallRank <= 500) {
    emoji = "😐";
    title = "[평범] 조금 더 분발하세요. 할 수 있습니다!";
    rewardText = "격려 장학금 +100원 지급!";
    state.money += 100;
  } else {
    emoji = "😡";
    title = "[성적 경고] 부모님이 크게 실망하셨습니다.";
    rewardText = "용돈 200원 삭감...";
    state.money = Math.max(0, state.money - 200);
  }

  document.getElementById("mockEvalEmoji").textContent = emoji;
  document.getElementById("mockEvalTitle").textContent = title;
  document.getElementById("mockEvalReward").textContent = rewardText;

  addLog(`🔔 [제 ${examIndex}차 모의고사] 전국 ${overallRank}등! (${rewardText})`);
  renderAll();
  document.getElementById("mockExamModal").classList.remove("hidden");
}

// 돌발 이벤트 3종 (원본 완벽 구현)
function triggerRandomEvent() {
  sfx.maintain();
  const eventType = randInt(1, 3);
  activeEvent = eventType;

  const emojiEl = document.getElementById("eventEmoji");
  const titleEl = document.getElementById("eventTitle");
  const descEl = document.getElementById("eventDesc");
  const c1Title = document.getElementById("choice1Title");
  const c1Effect = document.getElementById("choice1Effect");
  const c2Title = document.getElementById("choice2Title");
  const c2Effect = document.getElementById("choice2Effect");

  document.getElementById("eventChoicesBox").classList.remove("hidden");
  document.getElementById("eventResultBox").classList.add("hidden");

  if (eventType === 1) {
    emojiEl.textContent = "😈";
    titleEl.textContent = "친구의 PC방 유혹";
    descEl.textContent = "친구: '야, 오늘 PC방 각? 롤 5인팟 한 명 빈다!'";
    c1Title.textContent = "콜! 스트레스나 풀자";
    c1Effect.textContent = "체력 +40, 전 과목 30등 하락";
    c2Title.textContent = "미안, 난 대학 가야 해";
    c2Effect.textContent = "체력 -15, 용돈 +50원";
  } else if (eventType === 2) {
    emojiEl.textContent = "🤒";
    titleEl.textContent = "환절기 감기 기운";
    descEl.textContent = "환절기 감기 기운이 돕니다. 머리가 지끈거립니다...";
    c1Title.textContent = "하루 푹 쉰다";
    c1Effect.textContent = "체력 +50, 1일(1턴) 즉시 소모";
    c2Title.textContent = "약 먹고 버틴다";
    c2Effect.textContent = "장학금 -20원, 체력 -20, 전 과목 10등 하락";
  } else {
    emojiEl.textContent = "🍀";
    titleEl.textContent = "길에서 주운 500원 동전";
    descEl.textContent = "길을 걷다 반짝이는 500원짜리 동전을 주웠습니다!";
    c1Title.textContent = "내 주머니로 꿀꺽한다";
    c1Effect.textContent = "장학금 +500원, 전 과목 20등 하락";
    c2Title.textContent = "불우이웃 돕기 성금함에 넣는다";
    c2Effect.textContent = "장학금 +50원, 전 과목 15등 상승";
  }

  document.getElementById("eventModal").classList.remove("hidden");
}

function resolveEventChoice(choiceNum) {
  if (!activeEvent) return;
  let resultMsg = "";

  if (activeEvent === 1) {
    if (choiceNum === 1) {
      state.hp = Math.min(100, state.hp + 40);
      Object.keys(state.subjects).forEach(s => {
        state.subjects[s] = Math.min(1000, state.subjects[s] + 30);
      });
      sfx.drop();
      resultMsg = "🎮 펜타킬! 신나게 놀았습니다!\n(체력 +40 회복, 전 과목 30등 하락)";
    } else {
      state.hp -= 15;
      state.money += 50;
      sfx.rise();
      resultMsg = "😤 유혹을 꾹 참았습니다! 부모님이 대견해하십니다.\n(체력 -15, 용돈 +50원)";
    }
  } else if (activeEvent === 2) {
    if (choiceNum === 1) {
      state.hp = Math.min(100, state.hp + 50);
      state.totalTurns = Math.min(state.maxTurns, state.totalTurns + 1);
      sfx.rise();
      resultMsg = "🛌 하루 종일 푹 잤습니다. 몸이 개운합니다!\n(체력 +50 회복, 1일 소모)";
    } else {
      state.money = Math.max(0, state.money - 20);
      state.hp -= 20;
      Object.keys(state.subjects).forEach(s => {
        state.subjects[s] = Math.min(1000, state.subjects[s] + 10);
      });
      sfx.drop();
      resultMsg = "🤕 비몽사몽 공부했습니다. 약값만 날렸네요.\n(장학금 -20원, 체력 -20, 전 과목 10등 하락)";
    }
  } else if (activeEvent === 3) {
    if (choiceNum === 1) {
      state.money += 500;
      Object.keys(state.subjects).forEach(s => {
        state.subjects[s] = Math.min(1000, state.subjects[s] + 20);
      });
      sfx.drop();
      resultMsg = "💰 횡재했다! 하지만 왠지 찜찜해서 집중이 안 됩니다.\n(장학금 +500원, 전 과목 20등 하락)";
    } else {
      state.money += 50;
      Object.keys(state.subjects).forEach(s => {
        state.subjects[s] = Math.max(1, state.subjects[s] - 15);
      });
      sfx.crit();
      resultMsg = "👼 착한 일의 보답! 우연히 본 문제가 머리에 쏙 박힙니다.\n(장학금 +50원, 전 과목 15등 상승!)";
    }
  }

  activeEvent = null;
  addLog(`⚠️ [돌발 이벤트] ${resultMsg.replace("\n", " ")}`);
  renderAll();

  document.getElementById("eventChoicesBox").classList.add("hidden");
  const resBox = document.getElementById("eventResultBox");
  document.getElementById("eventResultText").innerText = resultMsg;
  resBox.classList.remove("hidden");
}

function closeEventModal() {
  document.getElementById("eventModal").classList.add("hidden");
  // 이벤트 선택 결과로 체력이 0 이하가 되었거나 200턴에 도달했는지 체크
  if (state.hp <= 0) {
    triggerHospital();
  } else if (state.totalTurns >= state.maxTurns) {
    triggerEnding();
  }
}

// 최종 멀티 엔딩 판정 (원본 엔딩 분기 완벽 구현)
function triggerEnding(isGiveUp = false) {
  state.isGameOver = true;
  document.body.classList.remove("burnout-alert");
  sfx.fanfare();

  const s = state.subjects;
  const overallRank = getOverallRank();
  const overallGrade = getGrade(overallRank);

  let endingObj = null;

  if (state.hospitalCount >= 3) {
    endingObj = ENDINGS_CATALOG.find(e => e.id === "hospital");
  } else if (Object.values(s).every(rank => rank <= 10)) {
    endingObj = ENDINGS_CATALOG.find(e => e.id === "perfect");
  } else if (s["국어"] <= 50 && s["영어"] <= 50 && s["사회"] <= 50 && overallRank <= 200) {
    endingObj = ENDINGS_CATALOG.find(e => e.id === "liberal_arts");
  } else if (s["수학"] <= 50 && s["과학"] <= 50 && overallRank <= 200) {
    endingObj = ENDINGS_CATALOG.find(e => e.id === "science_genius");
  } else if (overallRank <= 200) {
    endingObj = ENDINGS_CATALOG.find(e => e.id === "in_seoul");
  } else if (overallRank <= 500) {
    endingObj = ENDINGS_CATALOG.find(e => e.id === "normal_college");
  } else {
    endingObj = ENDINGS_CATALOG.find(e => e.id === "retake");
  }

  saveUnlockedEnding(endingObj.id);

  document.getElementById("endingHeaderBadge").textContent = isGiveUp
    ? "🏳️ 수능 중도 포기 결과"
    : "🎓 수능 D-Day 최종 결과";
  document.getElementById("endingBigIcon").textContent = endingObj.icon;
  document.getElementById("endingTitle").textContent = endingObj.title;
  document.getElementById("endingStory").textContent = endingObj.story;

  document.getElementById("endingFinalRank").textContent = `전국 ${overallRank}등 (${overallGrade.text})`;
  document.getElementById("endingTotalTurns").textContent = `${state.totalTurns}일`;
  document.getElementById("endingHospitalCount").textContent = `${state.hospitalCount}회`;

  const tableEl = document.getElementById("endingSubjectsTable");
  tableEl.innerHTML = SUBJECT_META.map(m => {
    const r = state.subjects[m.key];
    const g = getGrade(r);
    return `
      <div class="mini-subj-cell">
        <span>${m.icon} ${m.key}</span>
        <strong>${r}등 (${g.text})</strong>
      </div>
    `;
  }).join("");

  document.getElementById("endingModal").classList.remove("hidden");
}

// 엔딩 도감 모달 렌더링
function openCollectionModal() {
  const grid = document.getElementById("collectionGrid");
  grid.innerHTML = ENDINGS_CATALOG.map(item => {
    const isUnlocked = unlockedEndings.has(item.id);
    return `
      <div class="ending-collect-item ${isUnlocked ? "unlocked" : "locked"}">
        <div class="collect-icon">${isUnlocked ? item.icon : "🔒"}</div>
        <div class="collect-info">
          <strong>${isUnlocked ? item.title : "??? (미해금 엔딩)"}</strong>
          <p>${isUnlocked ? item.story : "조건을 달성하여 이 엔딩을 확인해 보세요."}</p>
          <span class="collect-cond">달성 조건: ${item.condition}</span>
        </div>
      </div>
    `;
  }).join("");

  document.getElementById("collectionModal").classList.remove("hidden");
}

function isAnyModalOpen() {
  const modals = ["introModal", "eventModal", "mockExamModal", "hospitalModal", "endingModal", "collectionModal"];
  return modals.some(id => !document.getElementById(id).classList.contains("hidden"));
}

// 이벤트 리스너 바인딩
document.addEventListener("DOMContentLoaded", () => {
  loadUnlockedEndings();
  initGameState();
  renderAll();

  // 시작/도움말 모달 닫기
  document.getElementById("btnStartGame").addEventListener("click", () => {
    sfx.buy();
    document.getElementById("introModal").classList.add("hidden");
  });

  document.getElementById("btnGuide").addEventListener("click", () => {
    document.getElementById("introModal").classList.remove("hidden");
  });

  // 효과음 토글
  const btnSound = document.getElementById("btnSound");
  btnSound.addEventListener("click", () => {
    sfx.enabled = !sfx.enabled;
    btnSound.textContent = sfx.enabled ? "🔊 효과음 ON" : "🔇 효과음 OFF";
  });

  // 수능 포기 (Q)
  document.getElementById("btnGiveUp").addEventListener("click", () => {
    if (state.isGameOver) return;
    triggerEnding(true);
  });

  // 돌발 이벤트 선택지
  document.getElementById("btnEventChoice1").addEventListener("click", () => resolveEventChoice(1));
  document.getElementById("btnEventChoice2").addEventListener("click", () => resolveEventChoice(2));
  document.getElementById("btnEventConfirm").addEventListener("click", closeEventModal);

  // 모의고사 확인
  document.getElementById("btnMockConfirm").addEventListener("click", () => {
    document.getElementById("mockExamModal").classList.add("hidden");
  });

  // 응급실 퇴원 확인
  document.getElementById("btnHospitalConfirm").addEventListener("click", () => {
    document.getElementById("hospitalModal").classList.add("hidden");
    if (state.totalTurns >= state.maxTurns) {
      triggerEnding();
    }
  });

  // 새 게임 시작
  document.getElementById("btnRestartGame").addEventListener("click", () => {
    sfx.buy();
    document.getElementById("endingModal").classList.add("hidden");
    initGameState();
    setFeedback("✏️", "새로운 200일의 수험 생활이 시작되었습니다!", "이번에는 원하는 목표 대학에 꼭 합격해 보세요!");
    renderAll();
  });

  // 엔딩 도감 열기/닫기
  document.getElementById("btnEndingsBook").addEventListener("click", openCollectionModal);
  document.getElementById("btnOpenBookFromEnding").addEventListener("click", openCollectionModal);
  document.getElementById("btnCloseCollection").addEventListener("click", () => {
    document.getElementById("collectionModal").classList.add("hidden");
  });
  document.getElementById("btnConfirmCollection").addEventListener("click", () => {
    document.getElementById("collectionModal").classList.add("hidden");
  });

  // 키보드 단축키 지원
  window.addEventListener("keydown", e => {
    // 모달이 열려 있을 때의 키 입력 처리
    if (!document.getElementById("introModal").classList.contains("hidden")) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        document.getElementById("btnStartGame").click();
      }
      return;
    }

    if (!document.getElementById("eventModal").classList.contains("hidden")) {
      const choicesVisible = !document.getElementById("eventChoicesBox").classList.contains("hidden");
      if (choicesVisible) {
        if (e.key === "1") resolveEventChoice(1);
        if (e.key === "2") resolveEventChoice(2);
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        closeEventModal();
      }
      return;
    }

    if (!document.getElementById("mockExamModal").classList.contains("hidden")) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        document.getElementById("btnMockConfirm").click();
      }
      return;
    }

    if (!document.getElementById("hospitalModal").classList.contains("hidden")) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        document.getElementById("btnHospitalConfirm").click();
      }
      return;
    }

    if (isAnyModalOpen() || state.isGameOver) return;

    // 1~6: 과목 열공
    if (e.key >= "1" && e.key <= "6") {
      const num = parseInt(e.key, 10);
      const subj = SUBJECT_META.find(m => m.num === num);
      if (subj) handleStudySubject(subj.key, subj.num);
    } else if (e.key >= "7" && e.key <= "9") {
      handleShopAction(parseInt(e.key, 10));
    } else if (e.key === "0") {
      handleShopAction(10); // 10. 낮잠
    } else if (e.key.toLowerCase() === "q") {
      triggerEnding(true);
    }
  });
});
