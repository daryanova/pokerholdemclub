/* ==========================================================
   HOLDEM ACADEMY — SPA (Single Page App)
   File: app.js
   هدف: سایت موبایل‌اول، کلیک درست، منوی موبایل، بخش‌های زیاد، جستجو، ذخیره پیشرفت
   Channel: @HoldemClubPoker
   ========================================================== */

(() => {
  "use strict";

  /* ---------------------------
     Helpers
  --------------------------- */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const safeHTML = (str) =>
    String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const STORAGE_KEY = "holdem_academy_v1";
  const readStore = () => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    } catch {
      return {};
    }
  };
  const writeStore = (obj) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
    } catch {}
  };

  const store = readStore();

  /* ---------------------------
     Build layout (inject HTML)
     index.html باید فقط لینک به app.css و app.js داشته باشه
     ولی اگر index.html شما از قبل یک اسکلت دارد، این کد همچنان کار می‌کند:
     ما body را با ساختار استاندارد پر می‌کنیم.
  --------------------------- */
  const TELEGRAM_HANDLE = "@HoldemClubPoker";
  const TELEGRAM_URL = "https://t.me/HoldemClubPoker";

  document.body.innerHTML = `
    <div class="bgGlow"></div>
    <div class="bgScan"></div>

    <header class="topbar" role="banner">
      <button class="iconBtn" id="btnMenu" aria-label="باز کردن منو" aria-expanded="false">☰</button>

      <div class="brand" aria-label="آکادمی هولدم">
        <div class="logo" aria-hidden="true">♠</div>
        <div class="brandText">
          <b>آکادمی هولدم</b>
          <span>از مبتدی تا حرفه‌ای — ساده، خفن، کاربردی</span>
        </div>
      </div>

      <button class="iconBtn" id="btnZen" aria-label="حالت تمرکز">🧘</button>
    </header>

    <div class="layout">

      <aside class="sidebar" id="sidebar" aria-label="منوی سایت">
        <div class="sidebarTop">
          <div class="searchWrap">
            <input id="q" type="search" placeholder="جستجو: قوانین، پری‌فلاپ، 3bet، Range..." autocomplete="off" />
            <button class="miniBtn" id="btnSearch" title="جستجو">🔍</button>
            <button class="miniBtn danger" id="btnClear" title="پاک کردن">✕</button>
          </div>

          <div class="sideCard">
            <div class="sideCardTitle">📣 کانال تلگرام</div>
            <a class="tgLink" href="${TELEGRAM_URL}" target="_blank" rel="noopener noreferrer">
              <span>عضویت</span>
              <b>${TELEGRAM_HANDLE}</b>
            </a>
            <div class="sideHint">آپدیت‌ها، مثال‌ها، دست‌ها و تمرین‌ها تو کانال 🔥</div>
          </div>

          <ul class="miniList">
            <li><b>نکته:</b> روی موبایل منو ☰ رو بزن، بخش رو انتخاب کن، صفحه بالا میاد.</li>
            <li><b>هدف:</b> همه چیز ساده ولی حرفه‌ای توضیح داده شده.</li>
          </ul>
        </div>

        <nav class="nav" id="nav"></nav>

        <div class="sidebarFooter">
          نسخه 1 — آکادمی هولدم | ساخته‌شده برای موبایل 📱
        </div>
      </aside>

      <main class="main" id="main">
        <div class="container">
          <section class="hero">
            <h1>به آکادمی هولدم خوش آمدی</h1>
            <p>اینجا هر چیزی درباره پوکر (Texas Hold’em) رو یاد می‌گیری؛ از قوانین پایه تا رنج‌خوانی و تصمیم‌گیری سطح بالا.</p>

            <div class="heroBtns">
              <button class="btn primary" id="btnStart">شروع سریع</button>
              <button class="btn ghost" id="btnRandom">یه بخش رندوم 🎲</button>
              <a class="btn" href="${TELEGRAM_URL}" target="_blank" rel="noopener noreferrer">کانال تلگرام</a>
            </div>

            <div class="heroCard">
              <div class="heroCardRow" id="statsRow">
                <span class="pill">✅ کلیک‌ها سالم</span>
                <span class="pill">⚡ سریع و سبک</span>
                <span class="pill">📱 موبایل‌اول</span>
                <span class="pill pillLink">📣 ${TELEGRAM_HANDLE}</span>
              </div>
              <div class="heroHint" id="heroHint">آخرین بخش بازشده: —</div>
            </div>
          </section>

          <section class="contentSection">
            <h2 class="title" id="sectionTitle">📍 یک بخش انتخاب کن</h2>
            <div class="contentBox" id="content">
              <div class="muted">
                از منو (☰) یک بخش انتخاب کن تا اینجا نمایش داده بشه.
                <br/><br/>
                اگر روی موبایل دکمه‌ها کلیک نمی‌شن، یعنی یک لایه روی دکمه افتاده؛
                ما اینجا همه لایه‌های تزئینی رو <b>pointer-events:none</b> کردیم و دکمه‌ها رو <b>auto</b گذاشتیم ✅
              </div>
            </div>
          </section>

          <section class="footer">
            <div class="footerRow">
              <div>📌 این سایت آموزشی است و تضمین سود نمی‌دهد. پوکر بازی مهارت + مدیریت سرمایه است.</div>
              <a class="footerLink" href="${TELEGRAM_URL}" target="_blank" rel="noopener noreferrer">عضویت در ${TELEGRAM_HANDLE}</a>
              <div class="footerNote">© آکادمی هولدم — ساختار تک‌صفحه‌ای (SPA) برای تجربه سریع‌تر</div>
            </div>
          </section>
        </div>
      </main>

    </div>
  `;

  /* ---------------------------
     Mobile sidebar overlay close by tapping outside
  --------------------------- */
  const sidebar = $("#sidebar");
  const btnMenu = $("#btnMenu");
  const btnZen = $("#btnZen");
  const nav = $("#nav");
  const q = $("#q");
  const btnSearch = $("#btnSearch");
  const btnClear = $("#btnClear");
  const content = $("#content");
  const sectionTitle = $("#sectionTitle");
  const heroHint = $("#heroHint");
  const btnStart = $("#btnStart");
  const btnRandom = $("#btnRandom");

  // Fix iOS click delay / passive touches (plus: avoid overlay blocking)
  document.addEventListener(
    "touchstart",
    () => {},
    { passive: true }
  );

  const isMobile = () => window.matchMedia("(max-width: 979px)").matches;

  const openSidebar = () => {
    sidebar.classList.add("open");
    btnMenu.setAttribute("aria-expanded", "true");
  };
  const closeSidebar = () => {
    sidebar.classList.remove("open");
    btnMenu.setAttribute("aria-expanded", "false");
  };
  const toggleSidebar = () => {
    if (sidebar.classList.contains("open")) closeSidebar();
    else openSidebar();
  };

  btnMenu.addEventListener("click", (e) => {
    e.preventDefault();
    toggleSidebar();
  });

  // Zen mode
  btnZen.addEventListener("click", () => {
    document.body.classList.toggle("zen");
    const on = document.body.classList.contains("zen");
    try {
      store.zen = on;
      writeStore(store);
    } catch {}
  });

  if (store.zen) document.body.classList.add("zen");

  // Close sidebar when clicking outside (mobile)
  document.addEventListener("click", (e) => {
    if (!isMobile()) return;
    if (!sidebar.classList.contains("open")) return;

    const clickedInsideSidebar = sidebar.contains(e.target);
    const clickedMenuBtn = btnMenu.contains(e.target);
    if (!clickedInsideSidebar && !clickedMenuBtn) closeSidebar();
  });

  // ESC close (desktop)
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeSidebar();
    }
    if (e.key === "/" && !e.ctrlKey && !e.metaKey && !e.altKey) {
      // focus search
      e.preventDefault();
      q.focus();
    }
  });

  /* ---------------------------
     Content library (sections)
     ساختار هر بخش:
     { id, icon, title, sub, tags:[], body: `...html...` }
  --------------------------- */
  const SECTIONS = [
    // ----------------- START / ROADMAP
    {
      id: "start",
      icon: "🏁",
      title: "شروع و نقشه راه",
      sub: "از صفر تا مسیر حرفه‌ای",
      tags: ["مبتدی", "نقشه راه", "شروع"],
      body: `
        <h2>شروع سریع</h2>
        <p>
          اگر تازه‌کاری، این مسیر رو مثل بازی مرحله‌ای برو جلو:
        </p>
        <ol>
          <li><b>قوانین پایه</b> + ترتیب دست‌ها</li>
          <li><b>پوزیشن</b> (UTG/MP/CO/BTN/SB/BB)</li>
          <li><b>پری‌فلاپ</b>: کال/ریِیز/فولد و منطق پشتش</li>
          <li><b>پست‌فلاپ</b>: کانتینیوشن بت، چک، ریز، سایزینگ</li>
          <li><b>رنج‌خوانی</b> و فکر کردن “دستِ طرف چی می‌تونه باشه؟”</li>
          <li><b>مدیریت سرمایه</b> و کنترل تیلت</li>
        </ol>
        <p>
          ⚡ پیشنهاد: هر بخش رو بخون، بعد برو 5 دقیقه تمرین ذهنی (بخش تمرین‌ها).
        </p>
        <p class="muted">
          نکته: پوکر = تصمیم درست در طول زمان. هدف اینه که “تصمیم +EV” زیاد بزنی.
        </p>
      `,
    },

    // ----------------- RULES
    {
      id: "rules",
      icon: "📜",
      title: "قوانین و پایه‌ها",
      sub: "Texas Hold’em از صفر",
      tags: ["قوانین", "پایه", "Holdem"],
      body: `
        <h2>قوانین هولدم (خلاصه ولی کامل)</h2>
        <p>
          هر نفر <b>2 کارت</b> خصوصی می‌گیرد (Hole Cards) و روی میز <b>5 کارت</b> عمومی می‌آید:
          <b>فلاپ (3)</b>، <b>ترن (1)</b>، <b>ریور (1)</b>.
          بهترین <b>5 کارت</b> از ترکیب کارت‌های خودت + کارت‌های میز = دست نهایی.
        </p>

        <h3>فازهای بازی</h3>
        <ul>
          <li><b>Preflop</b>: قبل از دیدن فلاپ</li>
          <li><b>Flop</b>: بعد از آمدن 3 کارت</li>
          <li><b>Turn</b>: کارت چهارم</li>
          <li><b>River</b>: کارت پنجم</li>
          <li><b>Showdown</b>: رو کردن دست‌ها (اگر کسی فولد نکرده باشد)</li>
        </ul>

        <h3>اکشن‌ها</h3>
        <ul>
          <li><b>Fold</b>: کنار کشیدن</li>
          <li><b>Check</b>: بدون شرط (وقتی شرطی وجود ندارد)</li>
          <li><b>Call</b>: هم‌اندازه شرط را پرداخت کردن</li>
          <li><b>Bet</b>: شرط بستن (وقتی شرطی وجود ندارد)</li>
          <li><b>Raise</b>: افزایش شرط</li>
          <li><b>All-in</b>: کل چیپ‌ها</li>
        </ul>

        <p class="muted">
          🧠 قانون طلایی: وقتی فولد می‌کنی یعنی “الان” این دست برای ادامه به صرفه نیست.
        </p>
      `,
    },

    // ----------------- HAND RANKINGS
    {
      id: "handrank",
      icon: "🧾",
      title: "رتبه‌بندی دست‌ها",
      sub: "از High Card تا Royal Flush",
      tags: ["دست‌ها", "رتبه", "Hand Rankings"],
      body: `
        <h2>رتبه دست‌ها (از ضعیف به قوی)</h2>
        <ol>
          <li><b>High Card</b> (کارت بالا)</li>
          <li><b>One Pair</b> (یک جفت)</li>
          <li><b>Two Pair</b> (دو جفت)</li>
          <li><b>Trips / Three of a Kind</b> (سه‌تایی)</li>
          <li><b>Straight</b> (استریت)</li>
          <li><b>Flush</b> (فلاش)</li>
          <li><b>Full House</b> (فول‌هاوس)</li>
          <li><b>Quads</b> (چهارتایی)</li>
          <li><b>Straight Flush</b> (استریت فلاش)</li>
          <li><b>Royal Flush</b> (رویال فلاش)</li>
        </ol>

        <h3>نکته‌های مهم</h3>
        <ul>
          <li>استریت: پشت سر هم (A می‌تونه هم پایین باشد: A-2-3-4-5)</li>
          <li>فلاش: هم‌خال</li>
          <li>کیکر: کارت‌های کمکی برای شکست دادن جفت‌های برابر</li>
        </ul>
      `,
    },

    // ----------------- POSITIONS
    {
      id: "positions",
      icon: "📍",
      title: "پوزیشن‌ها",
      sub: "موقعیت یعنی قدرت",
      tags: ["پوزیشن", "Position", "BTN"],
      body: `
        <h2>Position یعنی چی؟</h2>
        <p>
          پوزیشن یعنی <b>نوبت تصمیم</b>. هرچی دیرتر تصمیم بگیری (آخر اکشن)، اطلاعات بیشتری داری و دستت بازتره.
        </p>

        <h3>پوزیشن‌های رایج (6-max/9-max)</h3>
        <ul>
          <li><b>UTG</b>: اول صحبت — سخت‌ترین</li>
          <li><b>MP</b>: وسط</li>
          <li><b>CO</b>: قبل دکمه</li>
          <li><b>BTN</b>: دکمه — بهترین (اغلب آخر تصمیم می‌گیری)</li>
          <li><b>SB</b>: اسمال بلایند</li>
          <li><b>BB</b>: بیگ بلایند</li>
        </ul>

        <h3>قانون سریع</h3>
        <p>
          ✅ هرچی به BTN نزدیک‌تر -> می‌تونی رنجت رو <b>گسترده‌تر</b> کنی.  
          ❌ هرچی UTG‌تر -> باید <b>تایت‌تر</b> بازی کنی.
        </p>
      `,
    },

    // ----------------- PREFLOP
    {
      id: "preflop",
      icon: "🎯",
      title: "پری‌فلاپ",
      sub: "تصمیم قبل از فلاپ",
      tags: ["Preflop", "RFI", "3bet", "مبتدی"],
      body: `
        <h2>پری‌فلاپ چیست؟</h2>
        <p>
          قبل از اینکه فلاپ بیاد، باید تصمیم بگیری: فولد/کال/ریِیز/3بت.
          تو اینجا پایه پول‌سازی شکل می‌گیره.
        </p>

        <h3>سه قانون طلایی</h3>
        <ul>
          <li><b>پوزیشن + دست</b> تعیین می‌کند بازی می‌کنی یا نه.</li>
          <li><b>ریِیز بهتر از کالِ بی‌هدف</b> است (کنترل بازی دست تو می‌افتد).</li>
          <li><b>بلایندها دفاع می‌کنند</b> ولی بدون منطق نه!</li>
        </ul>

        <h3>مفهوم RFI</h3>
        <p>
          RFI یعنی وقتی همه فولد کردند و تو اولین کسی هستی که وارد پات می‌شی.
          هر پوزیشن RFI مخصوص خودش رو داره (UTG تایت، BTN واید).
        </p>

        <h3>Open / Raise / Limp</h3>
        <ul>
          <li><b>Open</b>: اولین ریِیز</li>
          <li><b>Limp</b>: فقط کال کردن بیگ بلایند (اکثراً بد مگر سناریوهای خاص)</li>
        </ul>
      `,
    },

    // ----------------- 3BET
    {
      id: "threebet",
      icon: "⚡",
      title: "3Bet و 4Bet",
      sub: "فشار حرفه‌ای",
      tags: ["3bet", "4bet", "فشار"],
      body: `
        <h2>3Bet یعنی چی؟</h2>
        <p>
          اگر کسی Open کرد و تو رِیز کردی -> می‌شود <b>3Bet</b>.
          هدف: گرفتن ارزش (Value) یا گرفتن فولد (Bluff) + گرفتن ابتکار عمل.
        </p>

        <h3>Value 3bet vs Bluff 3bet</h3>
        <ul>
          <li><b>Value</b>: وقتی می‌خوای با دست قوی پول بگیری (مثلاً QQ+, AK)</li>
          <li><b>Bluff</b>: وقتی می‌خوای فولد بگیری (مثل A5s بعضی مواقع)</li>
        </ul>

        <h3>سایزینگ سریع</h3>
        <ul>
          <li>در پوزیشن: 3bet حدود 3 برابر</li>
          <li>خارج پوزیشن: 3bet حدود 3.5 تا 4 برابر</li>
        </ul>

        <h3>4Bet</h3>
        <p>
          اگر بعد از 3bet دوباره ریز کنی -> 4bet.
          اینجا باید خیلی حساب‌شده باشی: یا دست خیلی قوی یا بلوف‌های محدود/برنامه‌دار.
        </p>
      `,
    },

    // ----------------- FLOP BASICS
    {
      id: "postflop",
      icon: "🧠",
      title: "پست‌فلاپ پایه",
      sub: "بعد از فلاپ چی کار کنیم؟",
      tags: ["Flop", "Turn", "River", "پست فلاپ"],
      body: `
        <h2>پست‌فلاپ یعنی تصمیم واقعی</h2>
        <p>
          بعد از فلاپ، بازی از “حفظیات” تبدیل می‌شه به “تحلیل”.
          اول از همه باید بپرسی: <b>بورد چی می‌گه؟</b> و <b>رنج‌ها چطور به بورد می‌خورن؟</b>
        </p>

        <h3>سه مفهوم کلیدی</h3>
        <ul>
          <li><b>Equity</b>: شانس برنده شدن تا پایان</li>
          <li><b>Range vs Range</b>: جنگ رنج‌ها، نه فقط دست تو</li>
          <li><b>Position</b>: هنوز هم پادشاهه</li>
        </ul>

        <h3>Line های رایج</h3>
        <ul>
          <li><b>C-bet</b>: شرط ادامه دهنده بعد از ریِیز پری‌فلاپ</li>
          <li><b>Check-Call</b>: چک می‌کنی و اگر شرط کرد کال می‌کنی</li>
          <li><b>Check-Raise</b>: چک می‌کنی و با شرط طرف ریز می‌کنی</li>
          <li><b>Bet-Bet-Bet</b>: سه خیابان ارزش/فشار</li>
        </ul>
      `,
    },

    // ----------------- C-BET
    {
      id: "cbet",
      icon: "🎯",
      title: "C-bet و شرط‌ها",
      sub: "کی c-bet کنیم؟",
      tags: ["C-bet", "سایزینگ", "Continuation"],
      body: `
        <h2>C-bet چیست؟</h2>
        <p>
          وقتی پری‌فلاپ رِیز کردی و فلاپ اومد، شرط کردن تو فلاپ می‌شه C-bet.
        </p>

        <h3>چه زمانی خوبه؟</h3>
        <ul>
          <li>بوردهای خشک (Dry): A72r, K83r</li>
          <li>وقتی رنج تو برتری دارد (Range Advantage)</li>
          <li>وقتی دست داری یا بک‌دورهای خوب داری</li>
        </ul>

        <h3>چه زمانی بد می‌شه؟</h3>
        <ul>
          <li>بوردهای خیس (Wet): JTs9s</li>
          <li>وقتی حریف خیلی کال‌کننده/استیشن است</li>
          <li>وقتی رنج حریف به بورد می‌خوره</li>
        </ul>

        <h3>سایزینگ ساده</h3>
        <p>
          روی بورد خشک: سایز کوچک (25%-33% پات)  
          روی بورد خیس/پول‌ساز: سایز بزرگ‌تر (50%-75%)
        </p>
      `,
    },

    // ----------------- RANGE
    {
      id: "range",
      icon: "🧩",
      title: "رنج و رنج‌خوانی",
      sub: "فکر حرفه‌ای: دستش چیه؟",
      tags: ["Range", "رنج", "تحلیل"],
      body: `
        <h2>Range یعنی چی؟</h2>
        <p>
          رنج یعنی مجموعه دست‌هایی که <b>می‌تونه</b> داشته باشه.
          پروها کمتر می‌گن “اون حتما AK داره” — بیشتر می‌گن “رنجش شامل Axs، KQ، جفت‌ها…”
        </p>

        <h3>چطور رنج بسازیم؟</h3>
        <ul>
          <li><b>پوزیشن</b> (UTG تایت‌تر)</li>
          <li><b>اکشن</b> (Open / 3bet / call)</li>
          <li><b>تیپ بازیکن</b> (تایت/لوose/maniacs)</li>
          <li><b>برد</b> و خیابان‌ها (فلاپ/ترن/ریور)</li>
        </ul>

        <h3>Range Narrowing</h3>
        <p>
          هر اکشن مثل فیلتر عمل می‌کنه.  
          مثال: UTG open → flop bet → turn big bet  
          یعنی رنجش به سمت دست‌های قوی‌تر/دراهای قوی‌تر می‌ره.
        </p>
      `,
    },

    // ----------------- VALUE / BLUFF
    {
      id: "valuebluff",
      icon: "🎭",
      title: "Value و Bluff",
      sub: "هدف حرکتت چیه؟",
      tags: ["Value", "Bluff", "هدف"],
      body: `
        <h2>اول هدف رو مشخص کن</h2>
        <p>
          هر بت/ریز باید دلیل داشته باشه. اگر نداره… معمولاً اشتباهه 😄
        </p>

        <h3>Value Bet</h3>
        <p>
          شرطی که با دست قوی می‌زنی تا از دست‌های ضعیف‌تر پول بگیری.
        </p>

        <h3>Bluff</h3>
        <p>
          شرطی که با دست ضعیف‌تر می‌زنی تا دست‌های بهتر رو فولد کنی.
        </p>

        <h3>Bluff خوب چه ویژگی داره؟</h3>
        <ul>
          <li>داستان منطقی (خط بازی‌ات باید معنی بده)</li>
          <li>Blocker داشته باشی (مثلاً آس جلوی نات‌ها)</li>
          <li>حریف توانایی فولد کردن داشته باشه</li>
        </ul>
      `,
    },

    // ----------------- POT ODDS
    {
      id: "odds",
      icon: "🧮",
      title: "Pot Odds و Equity",
      sub: "کال کردن به صرفه هست؟",
      tags: ["Pot Odds", "Equity", "کال"],
      body: `
        <h2>Pot Odds چیست؟</h2>
        <p>
          یعنی “نسبت پولی که باید کال کنی به کل پات”.
          اگر شانس تکمیل شدن دستت (Equity) بیشتر از Pot Odds باشه، کال خوبه.
        </p>

        <h3>فرمول سریع</h3>
        <p>
          Pot Odds ≈ (مبلغ کال) / (پات بعد از کال)
        </p>

        <h3>Rule of 2 and 4 (تقریبی)</h3>
        <ul>
          <li>روی ترن: تعداد اوت × 2 ≈ درصد شانس تا ریور</li>
          <li>روی فلاپ: تعداد اوت × 4 ≈ درصد شانس تا ریور</li>
        </ul>

        <p class="muted">
          مثال: 9 اوت فلاش دراو روی فلاپ → 9×4=36% شانس تقریبی.
        </p>
      `,
    },

    // ----------------- BANKROLL
    {
      id: "bankroll",
      icon: "🏦",
      title: "Bankroll و مدیریت سرمایه",
      sub: "بدونش نابود می‌شی",
      tags: ["Bankroll", "سرمایه", "مدیریت"],
      body: `
        <h2>Bankroll یعنی چی؟</h2>
        <p>
          پولی که مخصوص پوکر گذاشتی و قرار نیست با زندگی روزمره‌ات قاطی بشه.
        </p>

        <h3>قانون‌های ساده</h3>
        <ul>
          <li>برای کش‌گیم: معمولاً 30 تا 50 بای‌این</li>
          <li>برای تورنومنت: معمولاً 100+ بای‌این (واریانس بالاتر)</li>
          <li>اگر چند بای‌این باختی، تصمیم احساسی نگیر</li>
        </ul>

        <h3>Downswing طبیعی است</h3>
        <p>
          حتی بهترین‌ها هم می‌بازن. فرقشون اینه: مدیریت می‌کنن، تیلت نمی‌زنن.
        </p>
      `,
    },

    // ----------------- TILT
    {
      id: "tilt",
      icon: "🔥",
      title: "Tilt و کنترل ذهن",
      sub: "نذار احساس بازی کنه",
      tags: ["Tilt", "ذهن", "کنترل"],
      body: `
        <h2>Tilt یعنی چی؟</h2>
        <p>
          یعنی بعد از یک باخت/بدبیاری، مغزت می‌ره روی حالت انتقام و تصمیم‌های بد می‌گیری.
        </p>

        <h3>علائم تیلت</h3>
        <ul>
          <li>می‌خوای سریع جبران کنی</li>
          <li>سایزهای عجیب می‌زنی</li>
          <li>دست‌های مرزی رو بی‌دلیل ادامه می‌دی</li>
        </ul>

        <h3>پادزهر</h3>
        <ul>
          <li>استاپ‌لاس (مثلاً 3 بای‌این)</li>
          <li>نفس عمیق + وقفه کوتاه</li>
          <li>یادآوری: “من تصمیم می‌فروشم، نه نتیجه”</li>
        </ul>
      `,
    },

    // ----------------- COMMON TERMS
    {
      id: "terms",
      icon: "📚",
      title: "اصطلاحات مهم",
      sub: "همه بفهمن چی به چیه",
      tags: ["اصطلاحات", "لغت", "Poker terms"],
      body: `
        <h2>اصطلاحات کاربردی (ساده)</h2>
        <ul>
          <li><b>Range</b>: مجموعه دست‌های ممکن</li>
          <li><b>Value Bet</b>: شرط برای پول گرفتن از دست‌های ضعیف‌تر</li>
          <li><b>Bluff</b>: شرط برای فولد گرفتن از دست‌های بهتر</li>
          <li><b>C-bet</b>: شرط ادامه‌دهنده بعد از ریز پری‌فلاپ</li>
          <li><b>3-bet</b>: ریز روی ریز</li>
          <li><b>4-bet</b>: ریز بعد از 3bet</li>
          <li><b>Blocker</b>: کارتی که احتمال داشتن نات‌ها توسط حریف رو کم می‌کنه</li>
          <li><b>Pot Control</b>: کنترل اندازه پات با دست متوسط</li>
          <li><b>Showdown Value</b>: دستت ممکنه بدون شرط هم برنده باشه</li>
          <li><b>EV</b>: ارزش مورد انتظار (در بلندمدت)</li>
        </ul>
      `,
    },

    // ----------------- FINAL SHOT
    {
      id: "finalshot",
      icon: "🧨",
      title: "تیر خلاص",
      sub: "جمع‌بندی خشن و حرفه‌ای",
      tags: ["جمع بندی", "تیر خلاص", "حرفه‌ای"],
      body: `
        <h2>تیر خلاص 😈</h2>
        <p>
          اگر می‌خوای واقعاً پیشرفت کنی، این 7 تا رو حک کن تو مغزت:
        </p>
        <ol>
          <li><b>پوزیشن</b> پادشاهه</li>
          <li><b>رنج</b> مهم‌تر از “یک دست”ه</li>
          <li><b>هر بت</b> باید هدف داشته باشه: Value یا Bluff</li>
          <li><b>سایزینگ</b> یعنی پیام دادن به حریف</li>
          <li><b>واریانس</b> یعنی ممکنه درست بازی کنی و ببازی… طبیعی!</li>
          <li><b>بانکرول</b> یعنی زنده موندن برای بازی بلندمدت</li>
          <li><b>تیلت</b> یعنی نابودی — کنترل کن، یا باخت پشت باخت میاد</li>
        </ol>
        <p>
          ✅ اگر از امروز فقط همینا رو رعایت کنی، سطح بازیت می‌پره بالا.
        </p>
        <p class="muted">
          برای تمرین‌های بیشتر و مثال دست‌ها بیا کانال: <b>${TELEGRAM_HANDLE}</b>
        </p>
      `,
    },
  ];

  /* ---------------------------
     Make Nav groups
  --------------------------- */
  const GROUPS = [
    {
      title: "مسیر یادگیری",
      ids: ["start", "rules", "handrank", "positions", "preflop", "postflop"],
    },
    {
      title: "تکنیک‌های مهم",
      ids: ["cbet", "threebet", "range", "valuebluff", "odds"],
    },
    {
      title: "ذهن و سرمایه",
      ids: ["bankroll", "tilt"],
    },
    {
      title: "مرجع سریع",
      ids: ["terms", "finalshot"],
    },
  ];

  const byId = new Map(SECTIONS.map((s) => [s.id, s]));

  function renderNav(list = SECTIONS) {
    nav.innerHTML = "";

    // اگر در حال جستجو هستیم، گروه‌بندی رو حذف کن و لیست نتایج بده
    const searching = list !== SECTIONS;

    if (searching) {
      const head = document.createElement("div");
      head.className = "navGroup";
      head.textContent = `نتایج جستجو (${list.length})`;
      nav.appendChild(head);

      list.forEach((sec) => nav.appendChild(makeNavItem(sec)));
      return;
    }

    GROUPS.forEach((g) => {
      const head = document.createElement("div");
      head.className = "navGroup";
      head.textContent = g.title;
      nav.appendChild(head);

      g.ids
        .map((id) => byId.get(id))
        .filter(Boolean)
        .forEach((sec) => nav.appendChild(makeNavItem(sec)));
    });
  }

  function makeNavItem(sec) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "navItem";
    if (sec.id === "finalshot") btn.classList.add("finalShot");
    btn.setAttribute("data-id", sec.id);
    btn.innerHTML = `
      <div class="navIco">${safeHTML(sec.icon || "•")}</div>
      <div class="navTxt">
        <b>${safeHTML(sec.title)}</b>
        <small>${safeHTML(sec.sub || "")}</small>
      </div>
    `;
    btn.addEventListener("click", () => {
      selectSection(sec.id, { closeOnMobile: true });
    });
    return btn;
  }

  /* ---------------------------
     Render content
  --------------------------- */
  function setActiveNav(id) {
    $$(".navItem").forEach((el) => {
      el.classList.toggle("active", el.getAttribute("data-id") === id);
    });
  }

  function selectSection(id, opts = {}) {
    const sec = byId.get(id);
    if (!sec) return;

    setActiveNav(id);

    sectionTitle.textContent = `${sec.icon} ${sec.title}`;
    content.innerHTML = sec.body;

    // store
    store.last = id;
    store.lastTitle = sec.title;
    writeStore(store);

    heroHint.textContent = `آخرین بخش بازشده: ${sec.title}`;

    // update URL hash (optional)
    try {
      history.replaceState(null, "", `#${encodeURIComponent(id)}`);
    } catch {}

    // close sidebar on mobile
    if (opts.closeOnMobile && isMobile()) {
      closeSidebar();
      // after closing, scroll to content
      setTimeout(scrollToTop, 50);
    } else {
      scrollToTop();
    }
  }

  /* ---------------------------
     Search
  --------------------------- */
  function doSearch() {
    const term = (q.value || "").trim().toLowerCase();
    if (!term) {
      renderNav(SECTIONS);
      return;
    }

    const res = SECTIONS.filter((s) => {
      const hay =
        `${s.title} ${s.sub} ${(s.tags || []).join(" ")} ${stripTags(s.body)}`.toLowerCase();
      return hay.includes(term);
    });

    renderNav(res.length ? res : []);
    if (!res.length) {
      // show empty state
      content.innerHTML = `
        <div class="muted">
          چیزی پیدا نشد 😶‍🌫️<br/>
          کلمات پیشنهادی: <b>قوانین</b>، <b>پوزیشن</b>، <b>پری‌فلاپ</b>، <b>3bet</b>، <b>رنج</b>، <b>تیلت</b>
        </div>
      `;
      sectionTitle.textContent = "🔎 نتیجه جستجو";
    }
  }

  function stripTags(html) {
    return String(html).replace(/<[^>]*>/g, " ");
  }

  btnSearch.addEventListener("click", doSearch);
  q.addEventListener("input", () => {
    // live search
    doSearch();
  });
  q.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      doSearch();
    }
  });

  btnClear.addEventListener("click", () => {
    q.value = "";
    renderNav(SECTIONS);
    sectionTitle.textContent = "📍 یک بخش انتخاب کن";
    content.innerHTML = `
      <div class="muted">
        از منو (☰) یک بخش انتخاب کن تا اینجا نمایش داده بشه.
        <br/><br/>
        اگر دوست داری سریع شروع کنی، روی “شروع سریع” بزن.
      </div>
    `;
    if (isMobile()) closeSidebar();
  });

  /* ---------------------------
     Quick buttons
  --------------------------- */
  btnStart.addEventListener("click", () => selectSection("start", { closeOnMobile: true }));
  btnRandom.addEventListener("click", () => {
    const pool = SECTIONS.map((s) => s.id);
    const pick = pool[Math.floor(Math.random() * pool.length)];
    selectSection(pick, { closeOnMobile: true });
  });

  /* ---------------------------
     Init
  --------------------------- */
  renderNav(SECTIONS);

  // restore last section
  const hashId = (() => {
    try {
      const h = decodeURIComponent(location.hash || "").replace("#", "").trim();
      return h || null;
    } catch {
      return null;
    }
  })();

  const startId = hashId && byId.has(hashId) ? hashId : (store.last && byId.has(store.last) ? store.last : null);

  if (startId) {
    selectSection(startId, { closeOnMobile: false });
  } else {
    heroHint.textContent = `آخرین بخش بازشده: —`;
  }

  // ensure sidebar state on desktop
  const syncSidebar = () => {
    if (!isMobile()) {
      // desktop: sidebar always "open" logically (but css makes it visible)
      btnMenu.setAttribute("aria-expanded", "false");
      closeSidebar();
    } else {
      closeSidebar();
    }
  };
  syncSidebar();
  window.addEventListener("resize", () => syncSidebar());

  /* ---------------------------
     EXTRA: Make sure no element steals clicks
     (اگر بعداً چیزی اضافه کردی و کلیک خراب شد، این دیباگ کمک می‌کنه)
  --------------------------- */
  window.__HOLDEM_DEBUG__ = {
    getTopElementAt: (x, y) => document.elementFromPoint(x, y),
    listBlockingLayers: () => {
      const blockers = [];
      const els = $$("*");
      for (const el of els) {
        const st = getComputedStyle(el);
        if (st.position === "fixed" || st.position === "absolute") {
          const z = parseInt(st.zIndex || "0", 10);
          if (z >= 50 && st.pointerEvents !== "none") {
            blockers.push({ el, z, pe: st.pointerEvents, cls: el.className });
          }
        }
      }
      blockers.sort((a, b) => b.z - a.z);
      return blockers.slice(0, 30);
    },
  };

})();
