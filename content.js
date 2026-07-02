// Fiverr Balance Hider with Toggle Support - Fixed Version


// Global state
let isHideEnabled = true;
let initialized = false;

// Dark mode constants
const DARK_CLASS = '_dark';
const DARK_STYLE_ID = '_dark-style';

function ensureDarkStylesheet() {
  if (document.getElementById(DARK_STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = DARK_STYLE_ID;
  style.textContent = `
    /* Proper dark theme: map light backgrounds to dark and darken text */
    html._dark {
      color-scheme: dark;
      --_bg: #0f1115;
      --_surface: #12151c;
      --_text: #f1f5f9; /* off-white */
      --_muted: #9aa4b2;
      --_border: #2a2f3a;
      --_input: #0e141b;
      --_link: #1DBF73; /* Fiverr primary green */
      --_link-hover: #17a865;
      --_hover: #1a2230;            /* solid hover bg */
      --_hover-soft: rgba(255,255,255,0.06); /* subtle hover tint */

      /* Map some common Fiverr token-like vars (from your DOM snippet) to dark */
      --_1byh6kb1o: var(--_text);       /* text */
      --_1byh6kb1h: var(--_surface);    /* surfaces */
      --_1byh6kb0: var(--_border);      /* subtle borders */
      --_1byh6kb1e: var(--_border);
      --_1byh6kb1f: var(--_border);
      --_1byh6kb9v: var(--_link);       /* primary */
      --_1byh6kba6: var(--_link-hover); /* primary hover */
      --_1byh6kb3z: var(--_surface);
      --_1byh6kb3q: var(--_border);
      --_1byh6kb1j: var(--_surface);
      --_1byh6kb1l: var(--_muted);

      /* Map additional Fiverr design tokens seen in inline styles to dark palette */
      /* Main surfaces and text */
      --t2seezd: var(--_surface);  /* frequently used as background */
      --t2seez0: transparent;         /* often used for transparent bg */
      --t2seez1y: var(--_text);    /* primary text */
      --t2seez1v: var(--_muted);   /* secondary/muted text */
      --t2seez1r: #0c0f14;            /* separators/lines */
      --t2seez1x: #9aa6b2;            /* muted icon/text */
      --t2seez1w: #7b8794;            /* even more muted */
      --t2seez1o: #9aa6b2;            /* strokes/icons */
      --t2seez1p: #cbd5e1;            /* hover/active text on dark */
      --t2seez1t: #22c55e;            /* status online dot, etc. */
    }

    /* Base page colors */
    html._dark, body._dark {
      background-color: var(--_bg) !important;
      color: var(--_text) !important;
    }

    /* Typography defaults to off-white */
    html._dark body,
    html._dark p,
    html._dark span,
    html._dark li,
    html._dark div,
    html._dark td,
    html._dark th,
    html._dark label,
    html._dark small {
      color: var(--_text) !important;
    }

    /* Headings a bit brighter */
    html._dark h1,
    html._dark h2,
    html._dark h3,
    html._dark h4,
    html._dark h5,
    html._dark h6,
    html._dark strong,
    html._dark b {
      color: #ffffff !important;
    }

    /* Links use Fiverr green */
    html._dark a,
    html._dark a:visited,
    html._dark a.link-blue {
      color: var(--_link) !important;
    }
    html._dark a:hover,
    html._dark a:focus,
    html._dark a:active {
      color: var(--_link-hover) !important;
    }

    /* Navbar and header tweaks */
    html._dark .header-row,
    html._dark .fiverr-nav {
      background-color: var(--_surface) !important;
    }

    /* Nav items default text + hover background */
    html._dark .fiverr-nav a,
    html._dark .seller-main-item,
    html._dark .button-icon {
      color: var(--_text) !important;
      background-color: transparent !important;
    }

    html._dark .fiverr-nav a:hover,
    html._dark .fiverr-nav a:focus,
    html._dark .seller-main-item:hover,
    html._dark .seller-main-item:focus,
    html._dark .QNoIIT4:hover,
    html._dark .QNoIIT4:focus {
      background-color: var(--_hover-soft) !important;
      color: var(--_link) !important;
      border-color: transparent !important;
    }

    html._dark .button-icon:hover,
    html._dark .button-icon:focus {
      background-color: var(--_hover) !important;
      color: var(--_text) !important;
    }

    /* Right-side navbar icon area (prevent white hover) */
    html._dark .fiverr-nav-right,
    html._dark .seller-nav-right {
      background-color: var(--_surface) !important;
    }

    /* Default state for wrappers */
    html._dark .seller-nav-right .seller-main-icon,
    html._dark .seller-nav-right .messages-wrapper,
    html._dark .seller-nav-right .yjQSnw8,
    html._dark .seller-nav-right .adRcHHj,
    html._dark .seller-nav-right .Dulmsm5,
    html._dark .seller-nav-right .button-icon {
      background-color: transparent !important;
      color: var(--_text) !important;
      border-color: transparent !important;
    }

    /* Hover/focus: force dark background on any of these wrappers */
    html._dark .seller-nav-right .seller-main-icon:hover,
    html._dark .seller-nav-right .messages-wrapper:hover,
    html._dark .seller-nav-right .yjQSnw8:hover,
    html._dark .seller-nav-right .adRcHHj:hover,
    html._dark .seller-nav-right .Dulmsm5:hover,
    html._dark .seller-nav-right .button-icon:hover,
    html._dark .seller-nav-right .seller-main-icon:focus,
    html._dark .seller-nav-right .messages-wrapper:focus,
    html._dark .seller-nav-right .yjQSnw8:focus,
    html._dark .seller-nav-right .adRcHHj:focus,
    html._dark .seller-nav-right .Dulmsm5:focus,
    html._dark .seller-nav-right .button-icon:focus {
      background-color: var(--_hover-soft) !important;
      color: var(--_text) !important;
      outline: none !important;
    }

    /* Popover containers (bell/letter drawers) should be dark, not white */
    html._dark .popover-notifications-drawer,
    html._dark .popover-notifications-drawer-light,
    html._dark .popover-bell-drawer,
    html._dark .popover-letter-drawer {
      background-color: var(--_surface) !important;
      color: var(--_text) !important;
      border-color: var(--_border) !important;
    }

    /* Avatar dropdown (account menu) */
    html._dark .seller-menu.avatar-menu {
      background-color: var(--_surface) !important;
      color: var(--_text) !important;
      border: 1px solid var(--_border) !important;
      box-shadow: none !important;
    }
    /* Items default and hover */
    html._dark .seller-menu.avatar-menu li,
    html._dark .seller-menu.avatar-menu .KVLCWmB,
    html._dark .seller-menu.avatar-menu .custom-item,
    html._dark .seller-menu.avatar-menu .wider-part {
      background-color: transparent !important;
      color: var(--_text) !important;
      border-color: transparent !important;
    }
    html._dark .seller-menu.avatar-menu li:hover,
    html._dark .seller-menu.avatar-menu .KVLCWmB:hover,
    html._dark .seller-menu.avatar-menu .custom-item:hover,
    html._dark .seller-menu.avatar-menu .wider-part:hover,
    html._dark .seller-menu.avatar-menu .no-hover-background:hover {
      background-color: var(--_hover-soft) !important;
      color: var(--_text) !important;
    }

    /* Links in menu */
    html._dark .seller-menu.avatar-menu a,
    html._dark .seller-menu.avatar-menu .nav-link {
      color: var(--_link) !important;
    }
    html._dark .seller-menu.avatar-menu a:hover,
    html._dark .seller-menu.avatar-menu a:focus {
      color: var(--_link-hover) !important;
    }
    html._dark .seller-menu.avatar-menu .nav-link-green {
      color: var(--_link) !important;
    }

    /* Buttons in menu */
    html._dark .seller-menu.avatar-menu .selection-trigger,
    html._dark .seller-menu.avatar-menu .switch-full-width-button,
    html._dark .seller-menu.avatar-menu button.menu {
      background: transparent !important;
      color: var(--_text) !important;
      border: 1px solid var(--_border) !important;
    }
    html._dark .seller-menu.avatar-menu .selection-trigger:hover,
    html._dark .seller-menu.avatar-menu .switch-full-width-button:hover,
    html._dark .seller-menu.avatar-menu button.menu:hover {
      background-color: var(--_hover-soft) !important;
      color: var(--_text) !important;
      border-color: var(--_border) !important;
    }

    /* Divider lines */
    html._dark .seller-menu.avatar-menu .bnoiq6h .FIsVjU3,
    html._dark .seller-menu.avatar-menu .bnoiq6h,
    html._dark .seller-menu.avatar-menu hr {
      background-color: var(--_border) !important;
      border-color: var(--_border) !important;
    }

    /* Text utilities inside menu */
    html._dark .seller-menu.avatar-menu .text-semi-bold,
    html._dark .seller-menu.avatar-menu .tbody-6,
    html._dark .seller-menu.avatar-menu .label {
      color: var(--_text) !important;
    }

    /* Orders filter header and tabs */
    html._dark .TindYQp,
    html._dark .TindYQp .VLYTWjV,
    html._dark .TindYQp .dOhjcmI {
      background: transparent !important;
      color: var(--_text) !important;
      border-color: transparent !important;
    }
    html._dark .TindYQp:hover,
    html._dark .TindYQp:focus {
      background-color: var(--_hover-soft) !important;
      color: var(--_text) !important;
    }

    html._dark .ZkFkaJe,
    html._dark .jQjhero {
      background-color: var(--_surface) !important;
      border-color: var(--_border) !important;
    }

    /* Tab buttons */
    html._dark .ErZ5psE {
      background: transparent !important;
      color: var(--_text) !important;
      border: 1px solid var(--_border) !important;
    }
    html._dark .ErZ5psE:hover,
    html._dark .ErZ5psE:focus {
      background-color: var(--_hover-soft) !important;
      color: var(--_link) !important;
      border-color: var(--_border) !important;
    }
    /* Selected/active tab variants */
    html._dark .ErZ5psE[aria-pressed="true"],
    html._dark .ErZ5psE[aria-selected="true"],
    html._dark .ErZ5psE[aria-current="true"],
    html._dark .ErZ5psE.active,
    html._dark .ErZ5psE.is-selected {
      background-color: var(--_hover) !important;
      color: var(--_link) !important;
      border-color: var(--_link) !important;
    }

    /* Icons inside tabs inherit color */
    html._dark .ErZ5psE .fGyPaK5,
    html._dark .ErZ5psE .nFghBOe {
      color: inherit !important;
    }

    /* =============================
       Generic, broad dark-mode rules
       ============================= */

    /* 1) Make all text off-white by default */
    html._dark *,
    html._dark :before,
    html._dark :after {
      color: var(--_text) !important;
      border-color: var(--_border) !important;
    }

    /* 2) Generic interactive hover for most clickable elements */
    html._dark a:hover,
    html._dark a:focus,
    html._dark button:hover,
    html._dark button:focus,
    html._dark [role="button"]:hover,
    html._dark [role="button"]:focus,
    html._dark [class*="btn" i]:hover,
    html._dark [class*="btn" i]:focus,
    html._dark [class*="link" i]:hover,
    html._dark [class*="link" i]:focus,
    html._dark [class*="item" i]:hover,
    html._dark [class*="item" i]:focus,
    html._dark [class*="tab" i]:hover,
    html._dark [class*="tab" i]:focus,
    html._dark [class*="menu" i] li:hover,
    html._dark [class*="menu" i] li:focus {
      background-color: var(--_hover-soft) !important;
      color: var(--_link) !important;
    }

    /* 3) Generic surfaces for common container-like components */
    html._dark [class*="menu" i],
    html._dark [class*="popover" i],
    html._dark [class*="popup" i],
    html._dark [class*="dropdown" i],
    html._dark [class*="tooltip" i],
    html._dark [class*="drawer" i],
    html._dark [class*="modal" i],
    html._dark [class*="dialog" i],
    html._dark [class*="conversation" i],
    html._dark [class*="message" i],
    html._dark [class*="chat" i] {
      background-color: var(--_surface) !important;
      color: var(--_text) !important;
      border-color: var(--_border) !important;
      /* keep existing box-shadows from site if they provide hierarchy; tone down only white glows */
      box-shadow: 0 0 0 rgba(0,0,0,0) !important;
    }

    /* Conversation/list rows: ensure per-row surface is dark */
    html._dark li[class*="item" i],
    html._dark li[class*="items" i] {
      background: transparent !important;
    }
    html._dark li[class*="item" i] > div,
    html._dark li[class*="items" i] > div {
      background-color: var(--_surface) !important;
    }

    /* 4) Kill white-ish inline backgrounds generically (more variants) */
    html._dark [style*="background: white" i],
    html._dark [style*="background:white" i],
    html._dark [style*="background: #fff" i],
    html._dark [style*="background:#fff" i],
    html._dark [style*="background: #ffffff" i],
    html._dark [style*="background:#ffffff" i],
    html._dark [style*="background:rgb(255, 255, 255)" i],
    html._dark [style*="background: rgba(255, 255, 255" i],
    html._dark [style*="background-color: white" i],
    html._dark [style*="background-color:white" i],
    html._dark [style*="background-color: #fff" i],
    html._dark [style*="background-color:#fff" i],
    html._dark [style*="background-color: #ffffff" i],
    html._dark [style*="background-color:#ffffff" i],
    html._dark [style*="background-color:rgb(255, 255, 255)" i],
    html._dark [style*="background-color: rgba(255, 255, 255" i],
    html._dark [style*="background: #fefefe" i],
    html._dark [style*="background-color: #fefefe" i],
    html._dark [style*="background: #fafafa" i],
    html._dark [style*="background-color: #fafafa" i],
    html._dark [style*="background: #f5f5f5" i],
    html._dark [style*="background-color: #f5f5f5" i],
    html._dark [style*="background: #f0f2f5" i],
    html._dark [style*="background-color: #f0f2f5" i],
    html._dark [style*="background: #f0f0f0" i],
    html._dark [style*="background-color: #f0f0f0" i] {
      background-color: var(--_surface) !important;
    }

    /* 5) Ensure list containers and items don't flash white */
    html._dark ul,
    html._dark li,
    html._dark .list,
    html._dark [class*="list" i],
    html._dark [class*="items" i] {
      background-color: transparent !important;
    }

    /* 6) Bring non-currentColor SVG icons into dark palette */
    html._dark svg [fill="#404145"],
    html._dark svg [fill="#555"],
    html._dark svg [fill="#222325"],
    html._dark svg [fill="#000"],
    html._dark svg [fill="#000000"] {
      fill: var(--_text) !important;
    }
    html._dark svg [stroke="#404145"],
    html._dark svg [stroke="#62646A"],
    html._dark svg [stroke="#222325"],
    html._dark svg [stroke="#000"],
    html._dark svg [stroke="#000000"] {
      stroke: var(--_text) !important;
    }

    /* 9) Restore link colors after generic color override */
    html._dark a,
    html._dark a:visited {
      color: var(--_link) !important;
    }
    html._dark a:hover,
    html._dark a:focus,
    html._dark a:active {
      color: var(--_link-hover) !important;
    }
    /* Buttons remain readable */
    html._dark button,
    html._dark [class*="btn" i] {
      color: var(--_text) !important;
    }

    /* 7) Delimiters/dividers/separators and simple text badges */
    html._dark [class*="delimiter" i],
    html._dark [class*="divider" i],
    html._dark [class*="separator" i] {
      background-color: transparent !important;
      border-color: var(--_border) !important;
      color: var(--_text) !important;
      box-shadow: none !important;
    }
    html._dark [class*="delimiter" i] .text,
    html._dark [class*="divider" i] .text,
    html._dark [class*="separator" i] .text,
    html._dark span.text {
      background-color: transparent !important;
      color: var(--_muted) !important;
    }

    /* 8) Inbox drawer items (generic) */
    /* Row container stays transparent; inner action gets surface */
    html._dark li[class*="drawer-item" i] {
      background: transparent !important;
    }
    html._dark li[class*="drawer-item" i] > a.main-action {
      background-color: var(--_surface) !important;
      color: var(--_text) !important;
      border: 1px solid var(--_border) !important;
    }
    /* Ensure main-action links use normal text color, not global green */
    html._dark a.main-action {
      color: var(--_text) !important;
      text-decoration: none !important;
    }
    html._dark a.main-action:hover,
    html._dark a.main-action:focus {
      background-color: var(--_hover-soft) !important;
      color: var(--_text) !important;
      outline: none !important;
    }

    /* Profile image wrappers don't introduce light backgrounds */
    html._dark .image-wrapper,
    html._dark .profile-picture,
    html._dark .user-image {
      background-color: transparent !important;
      border-color: var(--_border) !important;
    }

    /* Unread/Read toggle in the gutter */
    html._dark .controls,
    html._dark .unread-container {
      background-color: transparent !important;
    }
    html._dark .controls .toggle-read,
    html._dark .controls .toggle-read.read,
    html._dark .controls .toggle-read.unread {
      background-color: transparent !important;
      color: var(--_text) !important; /* off-white icon color */
      border: none !important;
    }
    html._dark .controls .toggle-read:hover,
    html._dark .controls .toggle-read:focus {
      background-color: var(--_hover-soft) !important;
      color: var(--_link) !important;
      outline: none !important;
    }
    /* Icons in controls follow color */
    html._dark .controls svg path,
    html._dark .controls svg [fill] {
      fill: currentColor !important;
    }

    /* 10) Tables and listing headers (generic) */
    /* Table containers use dark surface and muted separators */
    html._dark table,
    html._dark [class*="table" i],
    html._dark [class*="tbl-" i] {
      background-color: var(--_surface) !important;
      color: var(--_text) !important;
      border-color: var(--_border) !important;
    }
    /* Rows */
    html._dark tr,
    html._dark [class*="tbl-row" i] {
      background-color: var(--_surface) !important;
      border-bottom: 1px solid var(--_border) !important;
    }
    /* Header rows */
    html._dark thead tr,
    html._dark [class*="tbl-row" i].header,
    html._dark [class~="header"],
    html._dark [class*="header-" i] {
      background-color: var(--_input) !important;
      color: var(--_text) !important;
      border-bottom: 1px solid var(--_border) !important;
    }
    /* Cells */
    html._dark th,
    html._dark td,
    html._dark [class*="tbl-cell" i] {
      background-color: transparent !important;
      color: var(--_text) !important;
      border-color: var(--_border) !important;
    }
    /* Header icons (i) should not be white */
    html._dark [class*="tbl-cell" i] i,
    html._dark th i,
    html._dark td i {
      background-color: transparent !important;
      color: var(--_muted) !important;
    }
    /* Spacer and empty states */
    html._dark [class*="spacer" i] { background-color: transparent !important; }
    html._dark [class*="empty" i] {
      background-color: var(--_surface) !important;
      color: var(--_muted) !important;
      border: 1px dashed var(--_border) !important;
    }

    /* 11) Tabs counters: only style badges in the tabs list */
    html._dark .tabs li a span {
      display: inline-block !important;
      margin-left: 6px !important;
      padding: 0 6px !important;
      background-color: var(--_link) !important; /* Fiverr green */
      color: #ffffff !important; /* ensure contrast */
      border-radius: 9999px !important;
      font-weight: 600 !important;
      line-height: 1.4 !important;
      min-width: 1.25em !important;
      text-align: center !important;
      vertical-align: middle !important;
    }
    html._dark .tabs li a:hover span,
    html._dark .tabs li a:focus span {
      background-color: var(--_link-hover) !important;
      color: #ffffff !important;
    }

    /* Muted helper text */
    html._dark .co-text-lighter,
    html._dark [class*="muted" i] {
      color: var(--_muted) !important;
    }

    /* Common layout containers (broader coverage) */
    html._dark header,
    html._dark footer,
    html._dark nav,
    html._dark main,
    html._dark section,
    html._dark article,
    html._dark aside,
    html._dark .content,
    html._dark .right-panel,
    html._dark .dashboard-wrapper,
    html._dark .seller-performance-wrapper,
    html._dark .seller-dashboard-wrapper,
    html._dark .dashboard-box,
    html._dark .widget-card,
    html._dark .order-card,
    html._dark .card-inner,
    html._dark .items-container,
    html._dark .items-ul,
    html._dark .items-li,
    html._dark [class*="container" i],
    html._dark [class*="wrapper" i],
    html._dark [class*="inner" i],
    html._dark [class*="content" i],
    html._dark [class*="card" i],
    html._dark [class*="panel" i],
    html._dark [class*="box" i],
    html._dark [class*="surface" i] {
      background-color: var(--_surface) !important;
      color: var(--_text) !important;
    }

    /* Fiverr inbox header and row wrappers (hashed classes) */
    html._dark [class*="_1g8w6yds"],
    html._dark .hvwcvi0,
    html._dark .hvwcvi1,
    html._dark .hvwcvi2 {
      background-color: var(--_surface) !important;
    }

    /* Skeleton/loading shimmer should not flash white */
    html._dark ._12e1mi88,
    html._dark .d5j9pe1 {
      background-image: none !important;
      background-color: var(--_surface) !important;
    }

    /* Inputs */
    html._dark input,
    html._dark textarea,
    html._dark select {
      background-color: var(--_input) !important;
      color: var(--_text) !important;
      border-color: var(--_border) !important;
    }

    html._dark ::placeholder {
      color: var(--_muted) !important;
      opacity: 1 !important;
    }

    /* Soften borders and shadows */
    html._dark * {
      border-color: var(--_border) !important;
    }
    html._dark .shadow,
    html._dark [class*="shadow" i] {
      box-shadow: none !important;
    }

    /* Override inline light backgrounds to dark (more variants) */
    html._dark [style*="background:#fff"],
    html._dark [style*="background: #fff"],
    html._dark [style*="background:#ffffff"],
    html._dark [style*="background: #ffffff"],
    html._dark [style*="background:rgb(255, 255, 255)"],
    html._dark [style*="background: rgba(255, 255, 255, 1)"],
    html._dark [style*="background-color:#fff"],
    html._dark [style*="background-color: #fff"],
    html._dark [style*="background-color:#ffffff"],
    html._dark [style*="background-color: #ffffff"],
    html._dark [style*="background-color:rgb(255, 255, 255)"],
    html._dark [style*="background:#f8f9fa"],
    html._dark [style*="background-color:#f8f9fa"],
    html._dark [style*="background:#fafafa"],
    html._dark [style*="background-color:#fafafa"],
    html._dark [style*="background:#f5f5f5"],
    html._dark [style*="background-color:#f5f5f5"],
    html._dark [style*="background:#f0f2f5"],
    html._dark [style*="background-color:#f0f2f5"],
    html._dark [style*="background:#f0f0f0"],
    html._dark [style*="background-color:#f0f0f0"] {
      background-color: var(--_surface) !important;
    }

    /* Override inline dark text to light */
    html._dark [style*="color:#000"],
    html._dark [style*="color: #000"],
    html._dark [style*="color:#111"],
    html._dark [style*="color:#222"],
    html._dark [style*="color:#333"],
    html._dark [style*="color:#444"],
    html._dark [style*="color: rgb(0, 0, 0)"] {
      color: var(--_text) !important;
    }
  `;
  document.documentElement.appendChild(style);
}

function applyDarkMode(enabled) {
  ensureDarkStylesheet();
  document.documentElement.classList.toggle(DARK_CLASS, !!enabled);
  if (document.body) {
    document.body.classList.toggle(DARK_CLASS, !!enabled);
  }
}

// Inject CSS immediately to prevent flash
function injectImmediateCSS() {
  const immediateCSS = `
    /* Immediate hide to prevent flash */
    a.user-balance,
    a[class*="user-balance"],
    a[href*="/earnings"],
    li.display-from-sm.pad-left-for-avatar,
    [class*="grey-1200-balance"] {
      display: none !important;
      visibility: hidden !important;
    }
  `;
  
  const style = document.createElement('style');
  style.id = '_immediate-style';
  style.textContent = immediateCSS;
  (document.head || document.documentElement).appendChild(style);

}

// Specific selectors for Fiverr balance elements
const BALANCE_SELECTORS = [
  // Main balance link
  'a.user-balance',
  'a[class*="user-balance"]',
  'a[href*="/earnings"]',
  
  // Container elements
  'li.display-from-sm.pad-left-for-avatar',
  '[class*="grey-1200-balance"]',
  
  // General balance related selectors
  '[class*="balance"]',
  '[href*="/earnings"]',
  '[data-testid*="balance"]'
];

// CSS to hide elements
const STYLE_CSS = `
  ._hide {
    display: none !important;
    visibility: hidden !important;
  }
`;

function ensureStyle() {
  if (document.getElementById('_style')) return;
  const style = document.createElement('style');
  style.id = '_style';
  style.textContent = STYLE_CSS;
  document.documentElement.appendChild(style);
}

function showBalanceElements() {

  
  // Remove ALL fiverr extension styles
  const allStyles = document.querySelectorAll('#_immediate-style, #_style');
  allStyles.forEach(style => {
    style.remove();

  });
  
  // Show all previously hidden elements
  const hiddenElements = document.querySelectorAll('._hide');
  hiddenElements.forEach(el => {
    el.classList.remove('_hide');
    el.style.display = '';
    el.style.visibility = '';
  });

  
  // Force show all balance elements
  BALANCE_SELECTORS.forEach(selector => {
    try {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        el.style.display = 'block';
        el.style.visibility = 'visible';
        el.classList.remove('_hide');

      });
    } catch (e) {
      // Ignore selector errors
    }
  });
  
  // Additional force show for common balance elements
  const forceShow = document.querySelectorAll('a[href*="/earnings"], li.display-from-sm');
  forceShow.forEach(el => {
    el.style.display = '';
    el.style.visibility = '';
    el.classList.remove('_hide');
  });
  

}

function hideBalanceElements() {
  if (!isHideEnabled) {
    showBalanceElements();
    return;
  }

  // Ensure immediate CSS is present when hiding is enabled
  if (!document.getElementById('_immediate-style')) {
    injectImmediateCSS();
  }

  // Hide elements using specific selectors
  BALANCE_SELECTORS.forEach(selector => {
    try {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        el.classList.add('_hide');

      });
    } catch (e) {
      // Ignore selector errors
    }
  });

  // Also look for elements containing currency amounts
  const allLinks = document.querySelectorAll('a[href*="/earnings"]');
  allLinks.forEach(link => {
    if (/\$\d+/.test(link.textContent)) {
      link.classList.add('_hide');

    }
  });

  // Hide parent li elements that contain balance links
  const balanceLinks = document.querySelectorAll('a.user-balance, a[class*="user-balance"]');
  balanceLinks.forEach(link => {
    let parent = link.parentElement;
    while (parent && parent.tagName !== 'BODY') {
      if (parent.tagName === 'LI') {
        parent.classList.add('_hide');

        break;
      }
      parent = parent.parentElement;
    }
  });
}

function extractBalanceText() {
  // Try to read known balance elements even if hidden
  const candidates = [
    'a.user-balance',
    'a[class*="user-balance"]',
    'a[href*="/earnings"]',
    '[class*="balance"] a[href*="/earnings"]',
    '[data-testid*="balance" i]'
  ];

  for (const sel of candidates) {
    try {
      const el = document.querySelector(sel);
      if (el && el.textContent) {
        const text = el.textContent.trim();
        if (text && /[\$€£¥₹]|\d/.test(text)) {
          return text;
        }
      }
    } catch (_) {
      // ignore
    }
  }
  return null;
}

function updateBalanceCache() {
  const text = extractBalanceText();
  if (text) {
chrome.storage.local.set({ lastBalance: text, lastBalanceAt: Date.now() });
  }
}

function process() {
  ensureStyle();
  hideBalanceElements();
  updateBalanceCache();
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'toggleHide') {
    isHideEnabled = request.enabled;

    process();
    sendResponse({ success: true });
    return; // no async
  }
  if (request.action === 'toggleDark') {
    applyDarkMode(request.enabled);
    sendResponse({ success: true });
    return; // no async
  }
  if (request.action === 'getBalance') {
    const text = extractBalanceText();
    if (text) {
      sendResponse({ success: true, balanceText: text, source: 'dom' });
      // Also cache it
chrome.storage.local.set({ lastBalance: text, lastBalanceAt: Date.now() });
      return; // no async
    }
    // Fallback to storage (async)
chrome.storage.local.get(['lastBalance', 'lastBalanceAt'], (res) => {
      sendResponse({
        success: !!res.lastBalance,
        balanceText: res.lastBalance || null,
        source: 'cache',
        at: res.lastBalanceAt || null
      });
    });
    return true; // keep the channel open for async response
  }
  if (request.action === 'toggleAutoRefresh') {
    if (request.enabled) {
      enableAutoRefreshUI();
    } else {
      disableAutoRefreshUI();
    }
    sendResponse({ success: true });
    return;
  }
});

// Load user preference first, then inject CSS if needed
chrome.storage.local.get(['hideBalance', 'darkMode'], function(result) {
  isHideEnabled = result.hideBalance !== false; // Default to true
  const darkEnabled = !!result.darkMode;


  // Apply dark mode preference
  applyDarkMode(darkEnabled);
  
  // Only inject immediate CSS if hiding is enabled
  if (isHideEnabled) {
    injectImmediateCSS();
  }
  
  process();
});

// Initialize the extension
(function init() {

  
  // Initial processing (will be overridden by storage load)
  // process();

  // Watch for dynamic content changes (Fiverr is a SPA)
  let scheduled = false;
  const observer = new MutationObserver((mutations) => {
    if (scheduled) return;
    scheduled = true;
    
    // Check if any mutations might have added balance elements
    let shouldProcess = false;
    mutations.forEach(mutation => {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        shouldProcess = true;
      }
    });
    
    if (shouldProcess) {
      requestAnimationFrame(() => {
        scheduled = false;
        process();
      });
    } else {
      scheduled = false;
    }
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });

  // Also run when page loads
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', process);
  }
  
  // Run again after a short delay to catch any late-loading elements
  setTimeout(process, 1000);
  setTimeout(process, 3000);
})();

// ============ Auto-Refresh Feature ============

let autoRefreshCounter = null;
let countdownTimerId = null;
let activityListenersAttached = false;
const COUNTER_STYLE_ID = '_counter-style';

function injectCounterStyles() {
  if (document.getElementById(COUNTER_STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = COUNTER_STYLE_ID;
  style.textContent = `
    /* === LIGHT MODE (dark mode OFF) — visible on white backgrounds === */
    #_auto-refresh-counter {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 2147483647;
      background: linear-gradient(160deg, rgba(220,230,245,0.2), rgba(200,210,230,0.08));
      backdrop-filter: blur(28px) saturate(1.4);
      -webkit-backdrop-filter: blur(28px) saturate(1.4);
      border-radius: 24px;
      padding: 16px 26px 12px;
      min-width: 170px;
      cursor: grab;
      user-select: none;
      -webkit-user-select: none;
      box-shadow: 0 8px 40px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.5);
      display: none;
      flex-direction: column;
      align-items: center;
      gap: 3px;
      pointer-events: auto;
      border: none;
      transition: opacity 0.25s ease, box-shadow 0.2s ease;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    #_auto-refresh-counter:hover {
      box-shadow: 0 12px 48px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.55);
    }
    #_auto-refresh-counter:active {
      cursor: grabbing;
    }
    #_auto-refresh-counter ._time-row {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      padding: 4px 0;
    }
    #_auto-refresh-counter ._counter-time {
      font-size: 44px;
      font-weight: 800;
      font-variant-numeric: tabular-nums;
      letter-spacing: 1.5px;
      line-height: 1;
      color: rgba(30,35,45,0.85);
      text-shadow: 0 1px 6px rgba(0,0,0,0.06);
    }
    #_auto-refresh-counter ._controls-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: 100%;
      margin-top: 2px;
    }
    #_auto-refresh-counter ._btn {
      cursor: pointer;
      border: 1px solid rgba(0,0,0,0.1);
      border-radius: 14px;
      padding: 5px 14px;
      font-size: 11px;
      font-weight: 600;
      transition: all 0.2s ease;
      line-height: 1.4;
      backdrop-filter: blur(6px);
      -webkit-backdrop-filter: blur(6px);
      letter-spacing: 0.3px;
      background: rgba(255,255,255,0.15);
      color: rgba(30,35,45,0.75);
      box-shadow: inset 0 1px 0 rgba(255,255,255,0.35), 0 2px 8px rgba(0,0,0,0.04);
    }
    #_auto-refresh-counter ._btn:hover {
      background: rgba(255,255,255,0.25);
      box-shadow: inset 0 1px 0 rgba(255,255,255,0.45), 0 0 20px rgba(0,0,0,0.04), 0 2px 8px rgba(0,0,0,0.08);
      transform: scale(1.05);
      color: rgba(30,35,45,0.9);
    }
    #_auto-refresh-counter._counter-warning ._counter-time {
      color: rgba(200,120,30,0.85);
    }
    #_auto-refresh-counter._counter-critical ._counter-time {
      color: rgba(200,50,50,0.85);
      animation: _pulse 1s ease-in-out infinite;
    }
    @keyframes _pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    /* === DARK MODE (dark mode ON) — pure white glass, exact same as approved === */
    html._dark #_auto-refresh-counter {
      background: linear-gradient(160deg, rgba(255,255,255,0.12), rgba(200,210,230,0.06));
      backdrop-filter: blur(32px) saturate(1.5);
      -webkit-backdrop-filter: blur(32px) saturate(1.5);
      box-shadow: 0 8px 40px rgba(0,0,0,0.08), 0 0 0 1px rgba(255,255,255,0.15), inset 0 1px 0 rgba(255,255,255,0.3);
      border: none;
    }
    html._dark #_auto-refresh-counter:hover {
      box-shadow: 0 12px 48px rgba(0,0,0,0.12), 0 0 0 1px rgba(255,255,255,0.2), inset 0 1px 0 rgba(255,255,255,0.35);
    }
    html._dark #_auto-refresh-counter ._counter-time {
      color: rgba(255,255,255,0.9);
      text-shadow: 0 2px 12px rgba(0,0,0,0.15);
    }
    html._dark #_auto-refresh-counter ._btn {
      border: 1px solid rgba(255,255,255,0.18);
      background: rgba(255,255,255,0.06);
      color: rgba(255,255,255,0.8);
      box-shadow: inset 0 1px 0 rgba(255,255,255,0.15), 0 2px 8px rgba(0,0,0,0.06);
    }
    html._dark #_auto-refresh-counter ._btn:hover {
      background: rgba(255,255,255,0.12);
      box-shadow: inset 0 1px 0 rgba(255,255,255,0.2), 0 0 20px rgba(255,255,255,0.06), 0 2px 8px rgba(0,0,0,0.1);
      color: rgba(255,255,255,0.95);
    }
    html._dark #_auto-refresh-counter._counter-warning ._counter-time {
      color: rgba(255,255,255,0.9);
    }
    html._dark #_auto-refresh-counter._counter-critical ._counter-time {
      color: rgba(255,255,255,0.9);
    }
  `;
  document.head.appendChild(style);
}

function createCounterElement() {
  if (autoRefreshCounter) return;

  injectCounterStyles();

  autoRefreshCounter = document.createElement('div');
  autoRefreshCounter.id = '_auto-refresh-counter';
  autoRefreshCounter.innerHTML = `
    <div class="_time-row">
      <span class="_counter-time">--:--</span>
    </div>
    <div class="_controls-row">
      <button class="_btn _btn-refresh">&#x21BB; Refresh</button>
      <button class="_btn _btn-off">&#x2715; OFF</button>
    </div>
  `;

  chrome.storage.local.get('autoRefreshPos', (result) => {
    if (result.autoRefreshPos) {
      autoRefreshCounter.style.left = result.autoRefreshPos.left;
      autoRefreshCounter.style.top = result.autoRefreshPos.top;
      autoRefreshCounter.style.bottom = 'auto';
      autoRefreshCounter.style.right = 'auto';
    }
  });

  const refreshBtn = autoRefreshCounter.querySelector('._btn-refresh');
  const offBtn = autoRefreshCounter.querySelector('._btn-off');

  refreshBtn.addEventListener('mousedown', (e) => e.stopPropagation());
  refreshBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'forceRefresh' });
  });

  offBtn.addEventListener('mousedown', (e) => e.stopPropagation());
  offBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'setAutoRefresh', enabled: false });
    disableAutoRefreshUI();
  });

  let isDragging = false;
  let startX, startY, origLeft, origTop;

  autoRefreshCounter.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
    isDragging = true;
    const rect = autoRefreshCounter.getBoundingClientRect();
    startX = e.clientX;
    startY = e.clientY;
    origLeft = rect.left;
    origTop = rect.top;
    autoRefreshCounter.style.cursor = 'grabbing';
    autoRefreshCounter.style.transition = 'none';
    e.preventDefault();
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    autoRefreshCounter.style.left = (origLeft + dx) + 'px';
    autoRefreshCounter.style.top = (origTop + dy) + 'px';
    autoRefreshCounter.style.bottom = 'auto';
    autoRefreshCounter.style.right = 'auto';
  });

  document.addEventListener('mouseup', () => {
    if (!isDragging) return;
    isDragging = false;
    autoRefreshCounter.style.cursor = 'grab';
    autoRefreshCounter.style.transition = '';
    chrome.storage.local.set({
      autoRefreshPos: {
        left: autoRefreshCounter.style.left,
        top: autoRefreshCounter.style.top
      }
    });
  });

  const appendToBody = () => {
    if (document.body) {
      document.body.appendChild(autoRefreshCounter);
    } else {
      requestAnimationFrame(appendToBody);
    }
  };
  appendToBody();
}

function updateCounterDisplay() {
  if (!autoRefreshCounter) return;

  chrome.storage.local.get(['nextRefreshAt', 'autoRefresh'], (result) => {
    if (!result.autoRefresh) {
      autoRefreshCounter.style.display = 'none';
      chrome.runtime.sendMessage({ action: 'updateBadge', text: '' }).catch(() => {});
      return;
    }

    autoRefreshCounter.style.display = 'flex';
    const timeEl = autoRefreshCounter.querySelector('._counter-time');

    autoRefreshCounter.classList.remove('_counter-warning', '_counter-critical');

    if (!result.nextRefreshAt) {
      timeEl.textContent = '--:--';
      chrome.runtime.sendMessage({ action: 'updateBadge', text: '' }).catch(() => {});
      return;
    }

    const remaining = Math.max(0, result.nextRefreshAt - Date.now());
    const totalSecs = Math.ceil(remaining / 1000);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    timeEl.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;

    if (totalSecs <= 15) {
      autoRefreshCounter.classList.add('_counter-critical');
    } else if (totalSecs <= 45) {
      autoRefreshCounter.classList.add('_counter-warning');
    }

    const badgeText = `${mins}:${secs.toString().padStart(2, '0')}`;
    chrome.runtime.sendMessage({ action: 'updateBadge', text: badgeText }).catch(() => {});
  });
}

function setupActivityDetection() {
  if (activityListenersAttached) return;
  activityListenersAttached = true;

  let lastSave = 0;
  const saveActivity = (e) => {
    if (autoRefreshCounter && autoRefreshCounter.contains(e.target)) return;
    const now = Date.now();
    if (now - lastSave > 1000) {
      lastSave = now;
      chrome.storage.local.set({ userLastActiveAt: now });
    }
  };

  document.addEventListener('mousedown', saveActivity, true);
  document.addEventListener('keydown', saveActivity, true);
  document.addEventListener('touchstart', saveActivity, true);
  document.addEventListener('scroll', saveActivity, true);

  chrome.storage.local.set({ userLastActiveAt: Date.now() });
}

function enableAutoRefreshUI() {
  createCounterElement();
  setupActivityDetection();
  if (!countdownTimerId) {
    countdownTimerId = setInterval(updateCounterDisplay, 1000);
  }
  updateCounterDisplay();
}

function disableAutoRefreshUI() {
  if (autoRefreshCounter) {
    autoRefreshCounter.style.display = 'none';
  }
  if (countdownTimerId) {
    clearInterval(countdownTimerId);
    countdownTimerId = null;
  }
}

chrome.storage.local.get('autoRefresh', (result) => {
  if (result.autoRefresh) {
    enableAutoRefreshUI();
  }
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== 'local') return;

  if (changes.autoRefresh) {
    if (changes.autoRefresh.newValue) {
      enableAutoRefreshUI();
    } else {
      disableAutoRefreshUI();
    }
  }

  if (changes.nextRefreshAt && autoRefreshCounter) {
    updateCounterDisplay();
  }
});
