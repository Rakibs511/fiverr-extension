// Fiverr Balance Hider with Toggle Support - Fixed Version
console.log('Fiverr Privacy Extension: Loading at document_start...');

// Global state
let isHideEnabled = true;
let initialized = false;

// Dark mode constants
const DARK_CLASS = 'fbh-dark';
const DARK_STYLE_ID = 'fbh-dark-style';

function ensureDarkStylesheet() {
  if (document.getElementById(DARK_STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = DARK_STYLE_ID;
  style.textContent = `
    /* Proper dark theme: map light backgrounds to dark and darken text */
    html.fbh-dark {
      color-scheme: dark;
      --fbh-bg: #0f1115;
      --fbh-surface: #12151c;
      --fbh-text: #f1f5f9; /* off-white */
      --fbh-muted: #9aa4b2;
      --fbh-border: #2a2f3a;
      --fbh-input: #0e141b;
      --fbh-link: #1DBF73; /* Fiverr primary green */
      --fbh-link-hover: #17a865;
      --fbh-hover: #1a2230;            /* solid hover bg */
      --fbh-hover-soft: rgba(255,255,255,0.06); /* subtle hover tint */

      /* Map some common Fiverr token-like vars (from your DOM snippet) to dark */
      --_1byh6kb1o: var(--fbh-text);       /* text */
      --_1byh6kb1h: var(--fbh-surface);    /* surfaces */
      --_1byh6kb0: var(--fbh-border);      /* subtle borders */
      --_1byh6kb1e: var(--fbh-border);
      --_1byh6kb1f: var(--fbh-border);
      --_1byh6kb9v: var(--fbh-link);       /* primary */
      --_1byh6kba6: var(--fbh-link-hover); /* primary hover */
      --_1byh6kb3z: var(--fbh-surface);
      --_1byh6kb3q: var(--fbh-border);
      --_1byh6kb1j: var(--fbh-surface);
      --_1byh6kb1l: var(--fbh-muted);

      /* Map additional Fiverr design tokens seen in inline styles to dark palette */
      /* Main surfaces and text */
      --t2seezd: var(--fbh-surface);  /* frequently used as background */
      --t2seez0: transparent;         /* often used for transparent bg */
      --t2seez1y: var(--fbh-text);    /* primary text */
      --t2seez1v: var(--fbh-muted);   /* secondary/muted text */
      --t2seez1r: #0c0f14;            /* separators/lines */
      --t2seez1x: #9aa6b2;            /* muted icon/text */
      --t2seez1w: #7b8794;            /* even more muted */
      --t2seez1o: #9aa6b2;            /* strokes/icons */
      --t2seez1p: #cbd5e1;            /* hover/active text on dark */
      --t2seez1t: #22c55e;            /* status online dot, etc. */
    }

    /* Base page colors */
    html.fbh-dark, body.fbh-dark {
      background-color: var(--fbh-bg) !important;
      color: var(--fbh-text) !important;
    }

    /* Typography defaults to off-white */
    html.fbh-dark body,
    html.fbh-dark p,
    html.fbh-dark span,
    html.fbh-dark li,
    html.fbh-dark div,
    html.fbh-dark td,
    html.fbh-dark th,
    html.fbh-dark label,
    html.fbh-dark small {
      color: var(--fbh-text) !important;
    }

    /* Headings a bit brighter */
    html.fbh-dark h1,
    html.fbh-dark h2,
    html.fbh-dark h3,
    html.fbh-dark h4,
    html.fbh-dark h5,
    html.fbh-dark h6,
    html.fbh-dark strong,
    html.fbh-dark b {
      color: #ffffff !important;
    }

    /* Links use Fiverr green */
    html.fbh-dark a,
    html.fbh-dark a:visited,
    html.fbh-dark a.link-blue {
      color: var(--fbh-link) !important;
    }
    html.fbh-dark a:hover,
    html.fbh-dark a:focus,
    html.fbh-dark a:active {
      color: var(--fbh-link-hover) !important;
    }

    /* Navbar and header tweaks */
    html.fbh-dark .header-row,
    html.fbh-dark .fiverr-nav {
      background-color: var(--fbh-surface) !important;
    }

    /* Nav items default text + hover background */
    html.fbh-dark .fiverr-nav a,
    html.fbh-dark .seller-main-item,
    html.fbh-dark .button-icon {
      color: var(--fbh-text) !important;
      background-color: transparent !important;
    }

    html.fbh-dark .fiverr-nav a:hover,
    html.fbh-dark .fiverr-nav a:focus,
    html.fbh-dark .seller-main-item:hover,
    html.fbh-dark .seller-main-item:focus,
    html.fbh-dark .QNoIIT4:hover,
    html.fbh-dark .QNoIIT4:focus {
      background-color: var(--fbh-hover-soft) !important;
      color: var(--fbh-link) !important;
      border-color: transparent !important;
    }

    html.fbh-dark .button-icon:hover,
    html.fbh-dark .button-icon:focus {
      background-color: var(--fbh-hover) !important;
      color: var(--fbh-text) !important;
    }

    /* Right-side navbar icon area (prevent white hover) */
    html.fbh-dark .fiverr-nav-right,
    html.fbh-dark .seller-nav-right {
      background-color: var(--fbh-surface) !important;
    }

    /* Default state for wrappers */
    html.fbh-dark .seller-nav-right .seller-main-icon,
    html.fbh-dark .seller-nav-right .messages-wrapper,
    html.fbh-dark .seller-nav-right .yjQSnw8,
    html.fbh-dark .seller-nav-right .adRcHHj,
    html.fbh-dark .seller-nav-right .Dulmsm5,
    html.fbh-dark .seller-nav-right .button-icon {
      background-color: transparent !important;
      color: var(--fbh-text) !important;
      border-color: transparent !important;
    }

    /* Hover/focus: force dark background on any of these wrappers */
    html.fbh-dark .seller-nav-right .seller-main-icon:hover,
    html.fbh-dark .seller-nav-right .messages-wrapper:hover,
    html.fbh-dark .seller-nav-right .yjQSnw8:hover,
    html.fbh-dark .seller-nav-right .adRcHHj:hover,
    html.fbh-dark .seller-nav-right .Dulmsm5:hover,
    html.fbh-dark .seller-nav-right .button-icon:hover,
    html.fbh-dark .seller-nav-right .seller-main-icon:focus,
    html.fbh-dark .seller-nav-right .messages-wrapper:focus,
    html.fbh-dark .seller-nav-right .yjQSnw8:focus,
    html.fbh-dark .seller-nav-right .adRcHHj:focus,
    html.fbh-dark .seller-nav-right .Dulmsm5:focus,
    html.fbh-dark .seller-nav-right .button-icon:focus {
      background-color: var(--fbh-hover-soft) !important;
      color: var(--fbh-text) !important;
      outline: none !important;
    }

    /* Popover containers (bell/letter drawers) should be dark, not white */
    html.fbh-dark .popover-notifications-drawer,
    html.fbh-dark .popover-notifications-drawer-light,
    html.fbh-dark .popover-bell-drawer,
    html.fbh-dark .popover-letter-drawer {
      background-color: var(--fbh-surface) !important;
      color: var(--fbh-text) !important;
      border-color: var(--fbh-border) !important;
    }

    /* Avatar dropdown (account menu) */
    html.fbh-dark .seller-menu.avatar-menu {
      background-color: var(--fbh-surface) !important;
      color: var(--fbh-text) !important;
      border: 1px solid var(--fbh-border) !important;
      box-shadow: none !important;
    }
    /* Items default and hover */
    html.fbh-dark .seller-menu.avatar-menu li,
    html.fbh-dark .seller-menu.avatar-menu .KVLCWmB,
    html.fbh-dark .seller-menu.avatar-menu .custom-item,
    html.fbh-dark .seller-menu.avatar-menu .wider-part {
      background-color: transparent !important;
      color: var(--fbh-text) !important;
      border-color: transparent !important;
    }
    html.fbh-dark .seller-menu.avatar-menu li:hover,
    html.fbh-dark .seller-menu.avatar-menu .KVLCWmB:hover,
    html.fbh-dark .seller-menu.avatar-menu .custom-item:hover,
    html.fbh-dark .seller-menu.avatar-menu .wider-part:hover,
    html.fbh-dark .seller-menu.avatar-menu .no-hover-background:hover {
      background-color: var(--fbh-hover-soft) !important;
      color: var(--fbh-text) !important;
    }

    /* Links in menu */
    html.fbh-dark .seller-menu.avatar-menu a,
    html.fbh-dark .seller-menu.avatar-menu .nav-link {
      color: var(--fbh-link) !important;
    }
    html.fbh-dark .seller-menu.avatar-menu a:hover,
    html.fbh-dark .seller-menu.avatar-menu a:focus {
      color: var(--fbh-link-hover) !important;
    }
    html.fbh-dark .seller-menu.avatar-menu .nav-link-green {
      color: var(--fbh-link) !important;
    }

    /* Buttons in menu */
    html.fbh-dark .seller-menu.avatar-menu .selection-trigger,
    html.fbh-dark .seller-menu.avatar-menu .switch-full-width-button,
    html.fbh-dark .seller-menu.avatar-menu button.menu {
      background: transparent !important;
      color: var(--fbh-text) !important;
      border: 1px solid var(--fbh-border) !important;
    }
    html.fbh-dark .seller-menu.avatar-menu .selection-trigger:hover,
    html.fbh-dark .seller-menu.avatar-menu .switch-full-width-button:hover,
    html.fbh-dark .seller-menu.avatar-menu button.menu:hover {
      background-color: var(--fbh-hover-soft) !important;
      color: var(--fbh-text) !important;
      border-color: var(--fbh-border) !important;
    }

    /* Divider lines */
    html.fbh-dark .seller-menu.avatar-menu .bnoiq6h .FIsVjU3,
    html.fbh-dark .seller-menu.avatar-menu .bnoiq6h,
    html.fbh-dark .seller-menu.avatar-menu hr {
      background-color: var(--fbh-border) !important;
      border-color: var(--fbh-border) !important;
    }

    /* Text utilities inside menu */
    html.fbh-dark .seller-menu.avatar-menu .text-semi-bold,
    html.fbh-dark .seller-menu.avatar-menu .tbody-6,
    html.fbh-dark .seller-menu.avatar-menu .label {
      color: var(--fbh-text) !important;
    }

    /* Orders filter header and tabs */
    html.fbh-dark .TindYQp,
    html.fbh-dark .TindYQp .VLYTWjV,
    html.fbh-dark .TindYQp .dOhjcmI {
      background: transparent !important;
      color: var(--fbh-text) !important;
      border-color: transparent !important;
    }
    html.fbh-dark .TindYQp:hover,
    html.fbh-dark .TindYQp:focus {
      background-color: var(--fbh-hover-soft) !important;
      color: var(--fbh-text) !important;
    }

    html.fbh-dark .ZkFkaJe,
    html.fbh-dark .jQjhero {
      background-color: var(--fbh-surface) !important;
      border-color: var(--fbh-border) !important;
    }

    /* Tab buttons */
    html.fbh-dark .ErZ5psE {
      background: transparent !important;
      color: var(--fbh-text) !important;
      border: 1px solid var(--fbh-border) !important;
    }
    html.fbh-dark .ErZ5psE:hover,
    html.fbh-dark .ErZ5psE:focus {
      background-color: var(--fbh-hover-soft) !important;
      color: var(--fbh-link) !important;
      border-color: var(--fbh-border) !important;
    }
    /* Selected/active tab variants */
    html.fbh-dark .ErZ5psE[aria-pressed="true"],
    html.fbh-dark .ErZ5psE[aria-selected="true"],
    html.fbh-dark .ErZ5psE[aria-current="true"],
    html.fbh-dark .ErZ5psE.active,
    html.fbh-dark .ErZ5psE.is-selected {
      background-color: var(--fbh-hover) !important;
      color: var(--fbh-link) !important;
      border-color: var(--fbh-link) !important;
    }

    /* Icons inside tabs inherit color */
    html.fbh-dark .ErZ5psE .fGyPaK5,
    html.fbh-dark .ErZ5psE .nFghBOe {
      color: inherit !important;
    }

    /* =============================
       Generic, broad dark-mode rules
       ============================= */

    /* 1) Make all text off-white by default */
    html.fbh-dark *,
    html.fbh-dark :before,
    html.fbh-dark :after {
      color: var(--fbh-text) !important;
      border-color: var(--fbh-border) !important;
    }

    /* 2) Generic interactive hover for most clickable elements */
    html.fbh-dark a:hover,
    html.fbh-dark a:focus,
    html.fbh-dark button:hover,
    html.fbh-dark button:focus,
    html.fbh-dark [role="button"]:hover,
    html.fbh-dark [role="button"]:focus,
    html.fbh-dark [class*="btn" i]:hover,
    html.fbh-dark [class*="btn" i]:focus,
    html.fbh-dark [class*="link" i]:hover,
    html.fbh-dark [class*="link" i]:focus,
    html.fbh-dark [class*="item" i]:hover,
    html.fbh-dark [class*="item" i]:focus,
    html.fbh-dark [class*="tab" i]:hover,
    html.fbh-dark [class*="tab" i]:focus,
    html.fbh-dark [class*="menu" i] li:hover,
    html.fbh-dark [class*="menu" i] li:focus {
      background-color: var(--fbh-hover-soft) !important;
      color: var(--fbh-link) !important;
    }

    /* 3) Generic surfaces for common container-like components */
    html.fbh-dark [class*="menu" i],
    html.fbh-dark [class*="popover" i],
    html.fbh-dark [class*="popup" i],
    html.fbh-dark [class*="dropdown" i],
    html.fbh-dark [class*="tooltip" i],
    html.fbh-dark [class*="drawer" i],
    html.fbh-dark [class*="modal" i],
    html.fbh-dark [class*="dialog" i],
    html.fbh-dark [class*="conversation" i],
    html.fbh-dark [class*="message" i],
    html.fbh-dark [class*="chat" i] {
      background-color: var(--fbh-surface) !important;
      color: var(--fbh-text) !important;
      border-color: var(--fbh-border) !important;
      /* keep existing box-shadows from site if they provide hierarchy; tone down only white glows */
      box-shadow: 0 0 0 rgba(0,0,0,0) !important;
    }

    /* Conversation/list rows: ensure per-row surface is dark */
    html.fbh-dark li[class*="item" i],
    html.fbh-dark li[class*="items" i] {
      background: transparent !important;
    }
    html.fbh-dark li[class*="item" i] > div,
    html.fbh-dark li[class*="items" i] > div {
      background-color: var(--fbh-surface) !important;
    }

    /* 4) Kill white-ish inline backgrounds generically (more variants) */
    html.fbh-dark [style*="background: white" i],
    html.fbh-dark [style*="background:white" i],
    html.fbh-dark [style*="background: #fff" i],
    html.fbh-dark [style*="background:#fff" i],
    html.fbh-dark [style*="background: #ffffff" i],
    html.fbh-dark [style*="background:#ffffff" i],
    html.fbh-dark [style*="background:rgb(255, 255, 255)" i],
    html.fbh-dark [style*="background: rgba(255, 255, 255" i],
    html.fbh-dark [style*="background-color: white" i],
    html.fbh-dark [style*="background-color:white" i],
    html.fbh-dark [style*="background-color: #fff" i],
    html.fbh-dark [style*="background-color:#fff" i],
    html.fbh-dark [style*="background-color: #ffffff" i],
    html.fbh-dark [style*="background-color:#ffffff" i],
    html.fbh-dark [style*="background-color:rgb(255, 255, 255)" i],
    html.fbh-dark [style*="background-color: rgba(255, 255, 255" i],
    html.fbh-dark [style*="background: #fefefe" i],
    html.fbh-dark [style*="background-color: #fefefe" i],
    html.fbh-dark [style*="background: #fafafa" i],
    html.fbh-dark [style*="background-color: #fafafa" i],
    html.fbh-dark [style*="background: #f5f5f5" i],
    html.fbh-dark [style*="background-color: #f5f5f5" i],
    html.fbh-dark [style*="background: #f0f2f5" i],
    html.fbh-dark [style*="background-color: #f0f2f5" i],
    html.fbh-dark [style*="background: #f0f0f0" i],
    html.fbh-dark [style*="background-color: #f0f0f0" i] {
      background-color: var(--fbh-surface) !important;
    }

    /* 5) Ensure list containers and items don't flash white */
    html.fbh-dark ul,
    html.fbh-dark li,
    html.fbh-dark .list,
    html.fbh-dark [class*="list" i],
    html.fbh-dark [class*="items" i] {
      background-color: transparent !important;
    }

    /* 6) Bring non-currentColor SVG icons into dark palette */
    html.fbh-dark svg [fill="#404145"],
    html.fbh-dark svg [fill="#555"],
    html.fbh-dark svg [fill="#222325"],
    html.fbh-dark svg [fill="#000"],
    html.fbh-dark svg [fill="#000000"] {
      fill: var(--fbh-text) !important;
    }
    html.fbh-dark svg [stroke="#404145"],
    html.fbh-dark svg [stroke="#62646A"],
    html.fbh-dark svg [stroke="#222325"],
    html.fbh-dark svg [stroke="#000"],
    html.fbh-dark svg [stroke="#000000"] {
      stroke: var(--fbh-text) !important;
    }

    /* 9) Restore link colors after generic color override */
    html.fbh-dark a,
    html.fbh-dark a:visited {
      color: var(--fbh-link) !important;
    }
    html.fbh-dark a:hover,
    html.fbh-dark a:focus,
    html.fbh-dark a:active {
      color: var(--fbh-link-hover) !important;
    }
    /* Buttons remain readable */
    html.fbh-dark button,
    html.fbh-dark [class*="btn" i] {
      color: var(--fbh-text) !important;
    }

    /* 7) Delimiters/dividers/separators and simple text badges */
    html.fbh-dark [class*="delimiter" i],
    html.fbh-dark [class*="divider" i],
    html.fbh-dark [class*="separator" i] {
      background-color: transparent !important;
      border-color: var(--fbh-border) !important;
      color: var(--fbh-text) !important;
      box-shadow: none !important;
    }
    html.fbh-dark [class*="delimiter" i] .text,
    html.fbh-dark [class*="divider" i] .text,
    html.fbh-dark [class*="separator" i] .text,
    html.fbh-dark span.text {
      background-color: transparent !important;
      color: var(--fbh-muted) !important;
    }

    /* 8) Inbox drawer items (generic) */
    /* Row container stays transparent; inner action gets surface */
    html.fbh-dark li[class*="drawer-item" i] {
      background: transparent !important;
    }
    html.fbh-dark li[class*="drawer-item" i] > a.main-action {
      background-color: var(--fbh-surface) !important;
      color: var(--fbh-text) !important;
      border: 1px solid var(--fbh-border) !important;
    }
    /* Ensure main-action links use normal text color, not global green */
    html.fbh-dark a.main-action {
      color: var(--fbh-text) !important;
      text-decoration: none !important;
    }
    html.fbh-dark a.main-action:hover,
    html.fbh-dark a.main-action:focus {
      background-color: var(--fbh-hover-soft) !important;
      color: var(--fbh-text) !important;
      outline: none !important;
    }

    /* Profile image wrappers don't introduce light backgrounds */
    html.fbh-dark .image-wrapper,
    html.fbh-dark .profile-picture,
    html.fbh-dark .user-image {
      background-color: transparent !important;
      border-color: var(--fbh-border) !important;
    }

    /* Unread/Read toggle in the gutter */
    html.fbh-dark .controls,
    html.fbh-dark .unread-container {
      background-color: transparent !important;
    }
    html.fbh-dark .controls .toggle-read,
    html.fbh-dark .controls .toggle-read.read,
    html.fbh-dark .controls .toggle-read.unread {
      background-color: transparent !important;
      color: var(--fbh-text) !important; /* off-white icon color */
      border: none !important;
    }
    html.fbh-dark .controls .toggle-read:hover,
    html.fbh-dark .controls .toggle-read:focus {
      background-color: var(--fbh-hover-soft) !important;
      color: var(--fbh-link) !important;
      outline: none !important;
    }
    /* Icons in controls follow color */
    html.fbh-dark .controls svg path,
    html.fbh-dark .controls svg [fill] {
      fill: currentColor !important;
    }

    /* 10) Tables and listing headers (generic) */
    /* Table containers use dark surface and muted separators */
    html.fbh-dark table,
    html.fbh-dark [class*="table" i],
    html.fbh-dark [class*="tbl-" i] {
      background-color: var(--fbh-surface) !important;
      color: var(--fbh-text) !important;
      border-color: var(--fbh-border) !important;
    }
    /* Rows */
    html.fbh-dark tr,
    html.fbh-dark [class*="tbl-row" i] {
      background-color: var(--fbh-surface) !important;
      border-bottom: 1px solid var(--fbh-border) !important;
    }
    /* Header rows */
    html.fbh-dark thead tr,
    html.fbh-dark [class*="tbl-row" i].header,
    html.fbh-dark [class~="header"],
    html.fbh-dark [class*="header-" i] {
      background-color: var(--fbh-input) !important;
      color: var(--fbh-text) !important;
      border-bottom: 1px solid var(--fbh-border) !important;
    }
    /* Cells */
    html.fbh-dark th,
    html.fbh-dark td,
    html.fbh-dark [class*="tbl-cell" i] {
      background-color: transparent !important;
      color: var(--fbh-text) !important;
      border-color: var(--fbh-border) !important;
    }
    /* Header icons (i) should not be white */
    html.fbh-dark [class*="tbl-cell" i] i,
    html.fbh-dark th i,
    html.fbh-dark td i {
      background-color: transparent !important;
      color: var(--fbh-muted) !important;
    }
    /* Spacer and empty states */
    html.fbh-dark [class*="spacer" i] { background-color: transparent !important; }
    html.fbh-dark [class*="empty" i] {
      background-color: var(--fbh-surface) !important;
      color: var(--fbh-muted) !important;
      border: 1px dashed var(--fbh-border) !important;
    }

    /* 11) Tabs counters: only style badges in the tabs list */
    html.fbh-dark .tabs li a span {
      display: inline-block !important;
      margin-left: 6px !important;
      padding: 0 6px !important;
      background-color: var(--fbh-link) !important; /* Fiverr green */
      color: #ffffff !important; /* ensure contrast */
      border-radius: 9999px !important;
      font-weight: 600 !important;
      line-height: 1.4 !important;
      min-width: 1.25em !important;
      text-align: center !important;
      vertical-align: middle !important;
    }
    html.fbh-dark .tabs li a:hover span,
    html.fbh-dark .tabs li a:focus span {
      background-color: var(--fbh-link-hover) !important;
      color: #ffffff !important;
    }

    /* Muted helper text */
    html.fbh-dark .co-text-lighter,
    html.fbh-dark [class*="muted" i] {
      color: var(--fbh-muted) !important;
    }

    /* Common layout containers (broader coverage) */
    html.fbh-dark header,
    html.fbh-dark footer,
    html.fbh-dark nav,
    html.fbh-dark main,
    html.fbh-dark section,
    html.fbh-dark article,
    html.fbh-dark aside,
    html.fbh-dark .content,
    html.fbh-dark .right-panel,
    html.fbh-dark .dashboard-wrapper,
    html.fbh-dark .seller-performance-wrapper,
    html.fbh-dark .seller-dashboard-wrapper,
    html.fbh-dark .dashboard-box,
    html.fbh-dark .widget-card,
    html.fbh-dark .order-card,
    html.fbh-dark .card-inner,
    html.fbh-dark .items-container,
    html.fbh-dark .items-ul,
    html.fbh-dark .items-li,
    html.fbh-dark [class*="container" i],
    html.fbh-dark [class*="wrapper" i],
    html.fbh-dark [class*="inner" i],
    html.fbh-dark [class*="content" i],
    html.fbh-dark [class*="card" i],
    html.fbh-dark [class*="panel" i],
    html.fbh-dark [class*="box" i],
    html.fbh-dark [class*="surface" i] {
      background-color: var(--fbh-surface) !important;
      color: var(--fbh-text) !important;
    }

    /* Fiverr inbox header and row wrappers (hashed classes) */
    html.fbh-dark [class*="_1g8w6yds"],
    html.fbh-dark .hvwcvi0,
    html.fbh-dark .hvwcvi1,
    html.fbh-dark .hvwcvi2 {
      background-color: var(--fbh-surface) !important;
    }

    /* Skeleton/loading shimmer should not flash white */
    html.fbh-dark ._12e1mi88,
    html.fbh-dark .d5j9pe1 {
      background-image: none !important;
      background-color: var(--fbh-surface) !important;
    }

    /* Inputs */
    html.fbh-dark input,
    html.fbh-dark textarea,
    html.fbh-dark select {
      background-color: var(--fbh-input) !important;
      color: var(--fbh-text) !important;
      border-color: var(--fbh-border) !important;
    }

    html.fbh-dark ::placeholder {
      color: var(--fbh-muted) !important;
      opacity: 1 !important;
    }

    /* Soften borders and shadows */
    html.fbh-dark * {
      border-color: var(--fbh-border) !important;
    }
    html.fbh-dark .shadow,
    html.fbh-dark [class*="shadow" i] {
      box-shadow: none !important;
    }

    /* Override inline light backgrounds to dark (more variants) */
    html.fbh-dark [style*="background:#fff"],
    html.fbh-dark [style*="background: #fff"],
    html.fbh-dark [style*="background:#ffffff"],
    html.fbh-dark [style*="background: #ffffff"],
    html.fbh-dark [style*="background:rgb(255, 255, 255)"],
    html.fbh-dark [style*="background: rgba(255, 255, 255, 1)"],
    html.fbh-dark [style*="background-color:#fff"],
    html.fbh-dark [style*="background-color: #fff"],
    html.fbh-dark [style*="background-color:#ffffff"],
    html.fbh-dark [style*="background-color: #ffffff"],
    html.fbh-dark [style*="background-color:rgb(255, 255, 255)"],
    html.fbh-dark [style*="background:#f8f9fa"],
    html.fbh-dark [style*="background-color:#f8f9fa"],
    html.fbh-dark [style*="background:#fafafa"],
    html.fbh-dark [style*="background-color:#fafafa"],
    html.fbh-dark [style*="background:#f5f5f5"],
    html.fbh-dark [style*="background-color:#f5f5f5"],
    html.fbh-dark [style*="background:#f0f2f5"],
    html.fbh-dark [style*="background-color:#f0f2f5"],
    html.fbh-dark [style*="background:#f0f0f0"],
    html.fbh-dark [style*="background-color:#f0f0f0"] {
      background-color: var(--fbh-surface) !important;
    }

    /* Override inline dark text to light */
    html.fbh-dark [style*="color:#000"],
    html.fbh-dark [style*="color: #000"],
    html.fbh-dark [style*="color:#111"],
    html.fbh-dark [style*="color:#222"],
    html.fbh-dark [style*="color:#333"],
    html.fbh-dark [style*="color:#444"],
    html.fbh-dark [style*="color: rgb(0, 0, 0)"] {
      color: var(--fbh-text) !important;
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
  style.id = 'fbh-immediate-style';
  style.textContent = immediateCSS;
  (document.head || document.documentElement).appendChild(style);
  console.log('Fiverr Privacy Extension: Immediate CSS injected');
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
  .fbh-hide {
    display: none !important;
    visibility: hidden !important;
  }
`;

function ensureStyle() {
  if (document.getElementById('fbh-style')) return;
  const style = document.createElement('style');
  style.id = 'fbh-style';
  style.textContent = STYLE_CSS;
  document.documentElement.appendChild(style);
}

function showBalanceElements() {
  console.log('Fiverr Privacy Extension: SHOWING balance elements');
  
  // Remove ALL fiverr extension styles
  const allStyles = document.querySelectorAll('#fbh-immediate-style, #fbh-style');
  allStyles.forEach(style => {
    style.remove();
    console.log('Fiverr Privacy Extension: Removed style:', style.id);
  });
  
  // Show all previously hidden elements
  const hiddenElements = document.querySelectorAll('.fbh-hide');
  hiddenElements.forEach(el => {
    el.classList.remove('fbh-hide');
    el.style.display = '';
    el.style.visibility = '';
  });
  console.log('Fiverr Privacy Extension: Removed .fbh-hide from', hiddenElements.length, 'elements');
  
  // Force show all balance elements
  BALANCE_SELECTORS.forEach(selector => {
    try {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        el.style.display = 'block';
        el.style.visibility = 'visible';
        el.classList.remove('fbh-hide');
        console.log('Fiverr Privacy Extension: Force shown element:', el.tagName, el.className);
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
    el.classList.remove('fbh-hide');
  });
  
  console.log('Fiverr Privacy Extension: Balance showing complete');
}

function hideBalanceElements() {
  if (!isHideEnabled) {
    showBalanceElements();
    return;
  }

  // Ensure immediate CSS is present when hiding is enabled
  if (!document.getElementById('fbh-immediate-style')) {
    injectImmediateCSS();
  }

  // Hide elements using specific selectors
  BALANCE_SELECTORS.forEach(selector => {
    try {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        el.classList.add('fbh-hide');
        console.log('Fiverr Privacy Extension: Hidden element with selector:', selector);
      });
    } catch (e) {
      // Ignore selector errors
    }
  });

  // Also look for elements containing currency amounts
  const allLinks = document.querySelectorAll('a[href*="/earnings"]');
  allLinks.forEach(link => {
    if (/\$\d+/.test(link.textContent)) {
      link.classList.add('fbh-hide');
      console.log('Fiverr Privacy Extension: Hidden earnings link with amount:', link.textContent);
    }
  });

  // Hide parent li elements that contain balance links
  const balanceLinks = document.querySelectorAll('a.user-balance, a[class*="user-balance"]');
  balanceLinks.forEach(link => {
    let parent = link.parentElement;
    while (parent && parent.tagName !== 'BODY') {
      if (parent.tagName === 'LI') {
        parent.classList.add('fbh-hide');
        console.log('Fiverr Privacy Extension: Hidden parent LI element');
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
    console.log('Fiverr Privacy Extension: Toggle received, enabled:', isHideEnabled);
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
});

// Load user preference first, then inject CSS if needed
chrome.storage.local.get(['hideBalance', 'darkMode'], function(result) {
  isHideEnabled = result.hideBalance !== false; // Default to true
  const darkEnabled = !!result.darkMode;
  console.log('Fiverr Privacy Extension: Initial state loaded, hiding enabled:', isHideEnabled, 'dark mode:', darkEnabled);

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
  console.log('Fiverr Privacy Extension: Started');
  
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
