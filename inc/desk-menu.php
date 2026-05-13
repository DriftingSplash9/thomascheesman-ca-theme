<?php
/**
 * Desk menu — the BHAG site navigation surface.
 *
 * Renders Thomas's actual desk as the menu. The monitor (in the photo)
 * is the active portal showing the Contents nav; the desk objects
 * around it are meaningful personal artifacts — family gifts, books,
 * marbles, the kid-drawn Alberta crest — each with a small handwritten
 * card that fades in on hover. Three objects are clickable affordances:
 *
 *   - The keyboard      → opens a search interface inside the monitor
 *   - The notebooks     → opens the journal drawer (post categories)
 *   - The memory cards  → opens the slideshow drawer (per-kid + family)
 *
 * --- Visibility ----------------------------------------------------
 *
 * The root <div class="tc-desk"> starts hidden (aria-hidden="true").
 * Activation comes from setting html.tc-desk-open via the menu-trigger
 * button. Mirrors the legacy .tc-menu overlay pattern — see header.php
 * and main.js's initSiteChrome(). C4 of the build will wire the trigger
 * to open this overlay instead of the old menu list.
 *
 * --- Architecture ---------------------------------------------------
 *
 * - Stage frame: aspect-ratio-matched container so percentage-positioned
 *   hotspots stay photo-relative no matter the viewport shape. The
 *   hero image is exposed as a CSS custom property (--desk-hero) so it's
 *   swappable here (or via a future filter) without touching the CSS.
 *
 * - Monitor: positioned absolutely over the curved monitor in the photo,
 *   contains both the Contents nav AND the search UI. JS toggles between
 *   them when the keyboard hotspot is clicked.
 *
 * - Hotspots: invisible boxes positioned as percentages of the frame,
 *   each with a hover card (the story or attribution). Classes:
 *       .tc-desk__hotspot              hover-only, warm yellow glow
 *       .tc-desk__hotspot--clickable   actionable, cyan spotlight
 *
 * - Drawers: slideshow + journal directory popovers; full-viewport
 *   overlays with the desk visible blurred behind.
 *
 * Hotspot coordinates were dialed in across iterations against
 * IMG_4329 (the staged desk shot). Aspect ratio of that source is
 * 1800:1013 — the CSS encodes this so the frame fits any viewport.
 *
 * @return void Echoes markup directly. Call from header.php after C4.
 */
function tc_render_desk_menu() {
    $hero_url = 'https://lightgoldenrodyellow-dugong-336485.hostingersite.com/wp-content/uploads/2026/05/desk-hero.jpg';
    ?>
<div
    class="tc-desk"
    id="tc-desk-menu"
    role="dialog"
    aria-modal="true"
    aria-hidden="true"
    aria-label="<?php esc_attr_e( "Thomas's desk — site navigation", 'tc-ventures-child' ); ?>"
>
    <div class="tc-desk__frame" style="--desk-hero: url('<?php echo esc_url( $hero_url ); ?>');">

        <!-- ============================================================
             MONITOR — the active portal.
             Default state shows the Contents nav. Click the keyboard
             hotspot to swap to the search interface.
             ============================================================ -->
        <div class="tc-desk__monitor" role="navigation" aria-label="<?php esc_attr_e( 'Site sections', 'tc-ventures-child' ); ?>">
            <h1 class="tc-desk__monitor-title">Contents</h1>
            <ul class="tc-desk__toc">
                <li><a href="<?php echo esc_url( home_url( '/' ) ); ?>">
                    <span class="title">Welcome &mdash; a note from me</span>
                    <span class="pageno">1</span>
                </a></li>
                <li><a href="<?php echo esc_url( home_url( '/about' ) ); ?>">
                    <span class="title">All about me</span>
                    <span class="pageno">7</span>
                </a></li>
                <li><a href="<?php echo esc_url( home_url( '/hcs' ) ); ?>">
                    <span class="title">The body I got</span>
                    <span class="pageno">35</span>
                </a></li>
                <li><a href="<?php echo esc_url( home_url( '/family' ) ); ?>">
                    <span class="title">Patience, Daniel, and Faith</span>
                    <span class="pageno">63</span>
                </a></li>
                <li><a href="<?php echo esc_url( home_url( '/journal' ) ); ?>">
                    <span class="title">Things I think about</span>
                    <span class="pageno">97</span>
                </a></li>
                <li><a href="https://tc-timeline.vercel.app/">
                    <span class="title">My whole life so far</span>
                    <span class="pageno">129</span>
                </a></li>
                <li><a href="<?php echo esc_url( home_url( '/contact' ) ); ?>">
                    <span class="title">Send me a letter</span>
                    <span class="pageno">165</span>
                </a></li>
            </ul>

            <!-- Matrix-style screensaver. Hidden by default; after 30s
                 of inactivity inside the overlay, JS adds .is-idle on
                 the monitor and this overlay fades in. Any movement /
                 click / keypress wakes it back to Contents.

                 Columns are pre-rendered in PHP with random characters
                 + per-column animation duration/delay custom properties,
                 so the CSS animation can drive the falling effect with
                 no runtime loop. -->
            <div class="tc-desk__screensaver" aria-hidden="true">
                <?php
                // Halfwidth katakana (the classic Matrix glyphs) + digits + a few symbols.
                $matrix_chars = array(
                    'ｱ','ｲ','ｳ','ｴ','ｵ','ｶ','ｷ','ｸ','ｹ','ｺ',
                    'ｻ','ｼ','ｽ','ｾ','ｿ','ﾀ','ﾁ','ﾂ','ﾃ','ﾄ',
                    'ﾅ','ﾆ','ﾇ','ﾈ','ﾉ','ﾊ','ﾋ','ﾌ','ﾍ','ﾎ',
                    'ﾏ','ﾐ','ﾑ','ﾒ','ﾓ','ﾔ','ﾕ','ﾖ','ﾗ','ﾘ',
                    'ﾙ','ﾚ','ﾛ','ﾜ','ﾝ',
                    '0','1','2','3','4','5','6','7','8','9',
                    '+','*','#','=','/','<','>','%',
                );
                $char_max = count( $matrix_chars ) - 1;
                $col_count = 26;
                for ( $col = 0; $col < $col_count; $col++ ) :
                    $left     = round( ( $col / ( $col_count - 1 ) ) * 100, 2 );
                    $delay    = mt_rand( 0, 5000 );
                    $duration = mt_rand( 5000, 11000 );
                    $col_len  = mt_rand( 14, 26 );
                    $glyphs   = '';
                    for ( $i = 0; $i < $col_len; $i++ ) {
                        $glyphs .= '<span>' . $matrix_chars[ mt_rand( 0, $char_max ) ] . '</span>';
                    }
                    $style = sprintf(
                        'left:%.2f%%;--delay:%dms;--duration:%dms;',
                        $left, $delay, $duration
                    );
                    echo '<div class="tc-desk__matrix-col" style="' . esc_attr( $style ) . '">' . $glyphs . '</div>';
                endfor;
                ?>
                <span class="tc-desk__screensaver-mark">TC&nbsp;&prime;ventures</span>
            </div>

            <!-- Search UI — hidden until the keyboard hotspot is clicked. -->
            <div class="tc-desk__search" id="tc-desk-search" hidden>
                <input
                    type="text"
                    class="tc-desk__search-input"
                    id="tc-desk-search-input"
                    placeholder="<?php esc_attr_e( 'Looking for something?', 'tc-ventures-child' ); ?>"
                    autocomplete="off"
                >
                <div class="tc-desk__chips">
                    <button class="tc-desk__chip" data-q="Patience">Patience</button>
                    <button class="tc-desk__chip" data-q="Daniel">Daniel</button>
                    <button class="tc-desk__chip" data-q="Faith">Faith</button>
                    <button class="tc-desk__chip" data-q="HCS">HCS</button>
                    <button class="tc-desk__chip" data-q="Spinal fusion">Spinal fusion</button>
                    <button class="tc-desk__chip" data-q="Bitcoin">Bitcoin</button>
                    <button class="tc-desk__chip" data-q="Kitchen">Kitchen</button>
                </div>
                <button class="tc-desk__search-back" id="tc-desk-search-back" type="button">&larr; back to menu</button>
            </div>
        </div>

        <!-- ============================================================
             HOTSPOTS — meaningful objects on the desk.
             Coordinates are percentages of the stage frame
             (photo-relative). Hover for the story; click the cyan-glow
             objects (keyboard, notebooks, memory cards) for actions.
             ============================================================ -->

        <!-- Patience's gift -->
        <div class="tc-desk__hotspot" style="left:14.89%; top:63.97%; width:9.67%; height:17.08%; --hot-x:14.89; --hot-y:63.97; --hot-w:9.67; --hot-h:17.08; --hot-png: url('https://lightgoldenrodyellow-dugong-336485.hostingersite.com/wp-content/uploads/2026/05/mug.png');" aria-label="Charlie Brown mug — gift from Patience">
            <div class="tc-desk__card tc-desk__card--above">Patience knows I love coffee, Christmas, and Charlie Brown &mdash; and got me the warmer it sits on.</div>
        </div>

        <!-- From the kids while in hospital -->
        <div class="tc-desk__hotspot" style="left:23.33%; top:53.90%; width:8.83%; height:19.25%; --hot-x:23.33; --hot-y:53.90; --hot-w:8.83; --hot-h:19.25; --hot-png: url('https://lightgoldenrodyellow-dugong-336485.hostingersite.com/wp-content/uploads/2026/05/stuffie.png');" aria-label="Lion stuffie — from the kids in hospital">
            <div class="tc-desk__card tc-desk__card--right">From the kids while I was in the hospital recovering from the spinal fusion.</div>
        </div>

        <!-- Faith's Alberta crest drawing -->
        <div class="tc-desk__hotspot" style="left:0.67%; top:40.28%; width:16.56%; height:45.80%; --hot-x:0.67; --hot-y:40.28; --hot-w:16.56; --hot-h:45.80; --hot-png: url('https://lightgoldenrodyellow-dugong-336485.hostingersite.com/wp-content/uploads/2026/05/crest.png');" aria-label="Alberta crest drawing by Faith">
            <div class="tc-desk__card tc-desk__card--right">Faith drew this. It's not coming down.</div>
        </div>

        <!-- THOMAS nameplate -->
        <div class="tc-desk__hotspot" style="left:1.56%; top:25.27%; width:6.06%; height:12.24%; --hot-x:1.56; --hot-y:25.27; --hot-w:6.06; --hot-h:12.24; --hot-png: url('https://lightgoldenrodyellow-dugong-336485.hostingersite.com/wp-content/uploads/2026/05/nameplate.png');" aria-label="Thomas nameplate">
            <div class="tc-desk__card tc-desk__card--below">That's my name on it.</div>
        </div>

        <!-- Faith's 67 sticker -->
        <div class="tc-desk__hotspot" style="left:41.56%; top:61.40%; width:3.33%; height:3.95%; --hot-x:41.56; --hot-y:61.40; --hot-w:3.33; --hot-h:3.95; --hot-png: url('https://lightgoldenrodyellow-dugong-336485.hostingersite.com/wp-content/uploads/2026/05/sticker-67.png');" aria-label="67 sticker — Faith's thing">
            <div class="tc-desk__card tc-desk__card--below">67 is Faith's thing. She's infatuated with it. I keep it for her.</div>
        </div>

        <!-- Daniel's 3D-pen spider -->
        <div class="tc-desk__hotspot" style="left:42.89%; top:56.37%; width:5.72%; height:5.23%; --hot-x:42.89; --hot-y:56.37; --hot-w:5.72; --hot-h:5.23; --hot-png: url('https://lightgoldenrodyellow-dugong-336485.hostingersite.com/wp-content/uploads/2026/05/spider.png');" aria-label="Blue spider — Daniel made it with a 3D pen">
            <div class="tc-desk__card tc-desk__card--below">Daniel made this with a 3D pen. Lives on the speaker.</div>
        </div>

        <!-- Hot Wheels — Daniel + Thomas shared hobby -->
        <div class="tc-desk__hotspot" style="left:53.28%; top:57.26%; width:3.83%; height:4.84%; --hot-x:53.28; --hot-y:57.26; --hot-w:3.83; --hot-h:4.84; --hot-png: url('https://lightgoldenrodyellow-dugong-336485.hostingersite.com/wp-content/uploads/2026/05/hotwheels.png');" aria-label="Hot Wheels — Daniel and Thomas">
            <div class="tc-desk__card tc-desk__card--below">Daniel and I collect these together.</div>
        </div>

        <!-- The grumpy toad — Thomas's avatar -->
        <div class="tc-desk__hotspot" style="left:68.00%; top:74.23%; width:2.78%; height:6.61%; --hot-x:68.00; --hot-y:74.23; --hot-w:2.78; --hot-h:6.61; --hot-png: url('https://lightgoldenrodyellow-dugong-336485.hostingersite.com/wp-content/uploads/2026/05/frog.png');" aria-label="Grumpy toad — basically a statue of Thomas">
            <div class="tc-desk__card tc-desk__card--above">Weird? Check. Mutated-looking? Check. Grumpy? Check. Basically a statue of me.</div>
        </div>

        <!-- Daniel's duck collection -->
        <div class="tc-desk__hotspot" style="left:61.00%; top:58.84%; width:7.67%; height:15.99%; --hot-x:61.00; --hot-y:58.84; --hot-w:7.67; --hot-h:15.99; --hot-png: url('https://lightgoldenrodyellow-dugong-336485.hostingersite.com/wp-content/uploads/2026/05/duck.png');" aria-label="Rubber duck — Daniel started the collection">
            <div class="tc-desk__card tc-desk__card--left">Daniel got me started. There's more on the dresser.</div>
        </div>

        <!-- Memory cards (clickable) — opens the slideshow drawer -->
        <div class="tc-desk__hotspot tc-desk__hotspot--clickable" id="tc-desk-bin" style="left:70.72%; top:52.42%; width:3.83%; height:5.13%; --hot-x:70.72; --hot-y:52.42; --hot-w:3.83; --hot-h:5.13; --hot-png: url('https://lightgoldenrodyellow-dugong-336485.hostingersite.com/wp-content/uploads/2026/05/memory-cards.png');" aria-label="Memory cards &mdash; open the slideshow drawer">
            <div class="tc-desk__card tc-desk__card--left">Memory cards. Click &mdash; flip through the slideshows.</div>
        </div>

        <!-- Peace sticker -->
        <div class="tc-desk__hotspot" style="left:2.67%; top:90.33%; width:5.56%; height:4.94%; --hot-x:2.67; --hot-y:90.33; --hot-w:5.56; --hot-h:4.94; --hot-png: url('https://lightgoldenrodyellow-dugong-336485.hostingersite.com/wp-content/uploads/2026/05/peace.png');" aria-label="Peace sticker">
            <div class="tc-desk__card tc-desk__card--above">My corner of the room.</div>
        </div>

        <!-- Cologne — Thomas's signature -->
        <div class="tc-desk__hotspot" style="left:72.39%; top:67.72%; width:4.50%; height:9.87%; --hot-x:72.39; --hot-y:67.72; --hot-w:4.50; --hot-h:9.87; --hot-png: url('https://lightgoldenrodyellow-dugong-336485.hostingersite.com/wp-content/uploads/2026/05/cologne.png');" aria-label="Cologne — L'Homme by Yves Saint Laurent">
            <div class="tc-desk__card tc-desk__card--left">L'Homme by Yves Saint Laurent. My one.</div>
        </div>

        <!-- Notebooks (clickable) — opens the journal drawer -->
        <div class="tc-desk__hotspot tc-desk__hotspot--clickable" id="tc-desk-notebooks" style="left:78.11%; top:46.30%; width:21.89%; height:25.77%; --hot-x:78.11; --hot-y:46.30; --hot-w:21.89; --hot-h:25.77; --hot-png: url('https://lightgoldenrodyellow-dugong-336485.hostingersite.com/wp-content/uploads/2026/05/notebooks.png');" aria-label="Notebooks &mdash; open the journal">
            <div class="tc-desk__card tc-desk__card--left">Notebooks. A lot of me is in those. Click &mdash; read the journal.</div>
        </div>

        <!-- Bitcoin Standard + Broken Money -->
        <div class="tc-desk__hotspot" style="left:80.28%; top:39.88%; width:19.17%; height:17.47%; --hot-x:80.28; --hot-y:39.88; --hot-w:19.17; --hot-h:17.47; --hot-png: url('https://lightgoldenrodyellow-dugong-336485.hostingersite.com/wp-content/uploads/2026/05/bitcoin.png');" aria-label="Bitcoin Standard and Broken Money">
            <div class="tc-desk__card tc-desk__card--left">Two of the best books ever written about money. Still standing by them.</div>
        </div>

        <!-- LOTR / The Hobbit -->
        <div class="tc-desk__hotspot" style="left:83.67%; top:21.62%; width:11.94%; height:25.86%; --hot-x:83.67; --hot-y:21.62; --hot-w:11.94; --hot-h:25.86; --hot-png: url('https://lightgoldenrodyellow-dugong-336485.hostingersite.com/wp-content/uploads/2026/05/lotr.png');" aria-label="Lord of the Rings books">
            <div class="tc-desk__card tc-desk__card--left">The Hobbit especially. Always.</div>
        </div>

        <!-- Keyboard (clickable) — opens the search interface -->
        <div class="tc-desk__hotspot tc-desk__hotspot--clickable" id="tc-desk-keyboard" style="left:30.78%; top:69.40%; width:29.72%; height:14.81%; --hot-x:30.78; --hot-y:69.40; --hot-w:29.72; --hot-h:14.81; --hot-png: url('https://lightgoldenrodyellow-dugong-336485.hostingersite.com/wp-content/uploads/2026/05/keyboard.png');" aria-label="Keyboard &mdash; open search">
            <div class="tc-desk__card tc-desk__card--above">Click &mdash; search the site.</div>
        </div>

        <!-- Marbles -->
        <div class="tc-desk__hotspot" style="left:71.61%; top:74.53%; width:7.39%; height:11.25%; --hot-x:71.61; --hot-y:74.53; --hot-w:7.39; --hot-h:11.25; --hot-png: url('https://lightgoldenrodyellow-dugong-336485.hostingersite.com/wp-content/uploads/2026/05/marbles.png');" aria-label="Marbles">
            <div class="tc-desk__card tc-desk__card--left">My marbles. Most of them, anyway.</div>
        </div>


        <!-- Mouse (clickable) — opens the cursor-trail picker -->
        <div class="tc-desk__hotspot tc-desk__hotspot--clickable" id="tc-desk-mouse" style="left:57%; top:86%; width:8%; height:10%; --hot-x:57; --hot-y:86; --hot-w:8; --hot-h:10;" aria-label="Mouse &mdash; pick a cursor trail">
            <div class="tc-desk__card tc-desk__card--above">Mouse. Click &mdash; pick a cursor trail.</div>
        </div>

    </div>

    <!-- ============================================================
         MOBILE FALLBACK — vertical list nav.
         Shown only at <=720px (CSS), where the desk-as-menu metaphor
         breaks (monitor too small, hotspots impossibly precise on
         touch). The desk hero stays as a dark blurred backdrop.
         ============================================================ -->
    <nav class="tc-desk__mobile" aria-label="<?php esc_attr_e( 'Site navigation', 'tc-ventures-child' ); ?>">
        <ul class="tc-desk__mobile-list">
            <li><a href="<?php echo esc_url( home_url( '/' ) ); ?>">Home</a></li>
            <li><a href="<?php echo esc_url( home_url( '/about' ) ); ?>">About</a></li>
            <li><a href="<?php echo esc_url( home_url( '/hcs' ) ); ?>">HCS</a></li>
            <li><a href="<?php echo esc_url( home_url( '/family' ) ); ?>">Family</a></li>
            <li><a href="<?php echo esc_url( home_url( '/journal' ) ); ?>">My Ramblings</a></li>
            <li><a href="https://tc-timeline.vercel.app/">Timeline</a></li>
            <li><a href="<?php echo esc_url( home_url( '/contact' ) ); ?>">Contact</a></li>
        </ul>
        <div class="tc-desk__mobile-meta">
            <div class="tc-desk__mobile-meta-block">
                <span class="tc-desk__mobile-meta-label">Heritage</span>
                <ul>
                    <li><a href="<?php echo esc_url( home_url( '/family/heritage' ) ); ?>">Heritage</a></li>
                    <li><a href="<?php echo esc_url( home_url( '/family/heritage/cheesmans' ) ); ?>">&#x21B3; Cheesmans</a></li>
                    <li><a href="<?php echo esc_url( home_url( '/family/heritage/lakemans' ) ); ?>">&#x21B3; Lakemans</a></li>
                    <li><a href="<?php echo esc_url( home_url( '/family/heritage/rycrofts' ) ); ?>">&#x21B3; Rycrofts</a></li>
                    <li><a href="<?php echo esc_url( home_url( '/family/heritage/haistes' ) ); ?>">&#x21B3; Haistes</a></li>
                    <li><a href="<?php echo esc_url( home_url( '/family/heritage/dochertys' ) ); ?>">&#x21B3; Dochertys</a></li>
                </ul>
            </div>
            <div class="tc-desk__mobile-meta-block">
                <span class="tc-desk__mobile-meta-label">Kids</span>
                <ul>
                    <li><a href="<?php echo esc_url( home_url( '/family/patience' ) ); ?>">Patience</a></li>
                    <li><a href="<?php echo esc_url( home_url( '/family/daniel' ) ); ?>">Daniel</a></li>
                    <li><a href="<?php echo esc_url( home_url( '/family/faith' ) ); ?>">Faith</a></li>
                </ul>
            </div>
            <div class="tc-desk__mobile-meta-block">
                <span class="tc-desk__mobile-meta-label">Elsewhere</span>
                <ul>
                    <li><a href="https://bareyourrare.org" target="_blank" rel="noopener noreferrer">Bare Your Rare <span aria-hidden="true">&#x2197;</span></a></li>
                    <li><a href="https://www.gpresidentialsociety.com" target="_blank" rel="noopener noreferrer">GPRS <span aria-hidden="true">&#x2197;</span></a></li>
                </ul>
            </div>
        </div>
    </nav>

    <!-- ============================================================
         CURSOR-TRAIL DRAWER — opens when the mouse is clicked.
         Each card sets a sitewide trail choice that persists in
         localStorage so it survives page navigation.
         ============================================================ -->
    <div class="tc-desk__drawer" id="tc-desk-trail-drawer" role="dialog" aria-hidden="true">
        <div class="tc-desk__drawer-inner">
            <button class="tc-desk__drawer-close" type="button" aria-label="<?php esc_attr_e( 'Close', 'tc-ventures-child' ); ?>">&times;</button>

            <!-- MAIN VIEW: variant picker. Clicking "Off" swaps to the
                 inner ink-settings view below; clicking any other card
                 closes the drawer and applies that variant. -->
            <div data-trail-view="main">
                <h2>Pick a cursor trail</h2>
                <p class="tc-desk__drawer-sub">Mouse magic. Your choice sticks across pages.</p>
                <div class="tc-desk__drawer-grid">
                    <a href="#" class="tc-desk__drawer-card" data-trail="stars">
                        <span class="tc-desk__drawer-card-title">Stars</span>
                        <span class="tc-desk__drawer-card-count">gold twinkles</span>
                    </a>
                    <a href="#" class="tc-desk__drawer-card" data-trail="comet">
                        <span class="tc-desk__drawer-card-title">Comet</span>
                        <span class="tc-desk__drawer-card-count">cyan afterglow</span>
                    </a>
                    <a href="#" class="tc-desk__drawer-card" data-trail="bubbles">
                        <span class="tc-desk__drawer-card-title">Bubbles</span>
                        <span class="tc-desk__drawer-card-count">drifting up</span>
                    </a>
                    <a href="#" class="tc-desk__drawer-card" data-trail="confetti">
                        <span class="tc-desk__drawer-card-title">Confetti</span>
                        <span class="tc-desk__drawer-card-count">candy flakes</span>
                    </a>
                    <a href="#" class="tc-desk__drawer-card" data-trail="sparkles">
                        <span class="tc-desk__drawer-card-title">Sparkles</span>
                        <span class="tc-desk__drawer-card-count">diamond glints</span>
                    </a>
                    <a href="#" class="tc-desk__drawer-card" data-trail="off">
                        <span class="tc-desk__drawer-card-title">Off</span>
                        <span class="tc-desk__drawer-card-count">tune the default</span>
                    </a>
                </div>
            </div>

            <!-- INK-SETTINGS VIEW: the "Off" card opens this. The default
                 ink trail keeps running here so the user can preview
                 colour + length changes live. The kill button at the
                 bottom turns the ink trail off completely. -->
            <div data-trail-view="ink" hidden>
                <button class="tc-desk__trail-back" type="button" data-trail-back>
                    &larr; back
                </button>
                <h2>Off</h2>
                <p class="tc-desk__drawer-sub">Or tune the default trail to taste.</p>

                <p class="tc-desk__trail-label">Trail colour</p>
                <div class="tc-desk__color-swatches">
                    <button type="button" data-ink-color="#ffffff" aria-label="White"  style="--swatch:#ffffff"></button>
                    <button type="button" data-ink-color="#ffd9b3" aria-label="Cream"  style="--swatch:#ffd9b3"></button>
                    <button type="button" data-ink-color="#ffb6e0" aria-label="Pink"   style="--swatch:#ffb6e0"></button>
                    <button type="button" data-ink-color="#b3e5ff" aria-label="Sky"    style="--swatch:#b3e5ff"></button>
                    <button type="button" data-ink-color="#c4ffd6" aria-label="Mint"   style="--swatch:#c4ffd6"></button>
                    <button type="button" data-ink-color="#d9b3ff" aria-label="Lilac"  style="--swatch:#d9b3ff"></button>
                    <button type="button" data-ink-color="#ffe680" aria-label="Butter" style="--swatch:#ffe680"></button>
                    <button type="button" data-ink-color="#80f8ff" aria-label="Cyan"   style="--swatch:#80f8ff"></button>
                </div>

                <p class="tc-desk__trail-label">Trail length</p>
                <input
                    type="range"
                    class="tc-desk__trail-slider"
                    data-ink-age
                    min="200"
                    max="1500"
                    step="20"
                    value="510"
                    aria-label="<?php esc_attr_e( 'Trail length in milliseconds', 'tc-ventures-child' ); ?>"
                >
                <div class="tc-desk__trail-slider-marks">
                    <span>short</span>
                    <span>long</span>
                </div>

                <button class="tc-desk__trail-kill" type="button" data-ink-off>
                    Turn it off completely
                </button>
            </div>

        </div>
    </div>

    <!-- ============================================================
         JOURNAL DRAWER — opens when notebooks are clicked.
         ============================================================ -->
    <div class="tc-desk__drawer" id="tc-desk-journal-drawer" role="dialog" aria-hidden="true">
        <div class="tc-desk__drawer-inner">
            <button class="tc-desk__drawer-close" type="button" aria-label="<?php esc_attr_e( 'Close', 'tc-ventures-child' ); ?>">&times;</button>
            <h2>The journal</h2>
            <p class="tc-desk__drawer-sub">Notebooks. Things I think about &mdash; squirrels, flying pigs, crayons.</p>
            <div class="tc-desk__drawer-grid">
                <a href="<?php echo esc_url( home_url( '/journal' ) ); ?>" class="tc-desk__drawer-card">
                    <span class="tc-desk__drawer-card-title">All entries</span>
                    <span class="tc-desk__drawer-card-count">the feed</span>
                </a>
                <a href="<?php echo esc_url( home_url( '/category/family' ) ); ?>" class="tc-desk__drawer-card">
                    <span class="tc-desk__drawer-card-title">Family stories</span>
                    <span class="tc-desk__drawer-card-count">kids + heritage</span>
                </a>
                <a href="<?php echo esc_url( home_url( '/category/hcs' ) ); ?>" class="tc-desk__drawer-card">
                    <span class="tc-desk__drawer-card-title">HCS</span>
                    <span class="tc-desk__drawer-card-count">life with this body</span>
                </a>
                <a href="<?php echo esc_url( home_url( '/category/culinary-arts' ) ); ?>" class="tc-desk__drawer-card">
                    <span class="tc-desk__drawer-card-title">Kitchen</span>
                    <span class="tc-desk__drawer-card-count">chef years</span>
                </a>
            </div>
        </div>
    </div>

    <!-- ============================================================
         SLIDESHOW DRAWER — opens when the memory-card bin is clicked.
         Surfaces every per-kid gallery + site-wide media stacks.
         ============================================================ -->
    <div class="tc-desk__drawer" id="tc-desk-slideshow-drawer" role="dialog" aria-hidden="true">
        <div class="tc-desk__drawer-inner">
            <button class="tc-desk__drawer-close" type="button" aria-label="<?php esc_attr_e( 'Close', 'tc-ventures-child' ); ?>">&times;</button>
            <h2>All the slideshows</h2>
            <p class="tc-desk__drawer-sub">Memory cards. Pick a stack &mdash; every slideshow and video on the site.</p>
            <div class="tc-desk__drawer-grid">
                <a href="<?php echo esc_url( home_url( '/family/patience' ) ); ?>" class="tc-desk__drawer-card">
                    <span class="tc-desk__drawer-card-title">Patience</span>
                    <span class="tc-desk__drawer-card-count">134 photos</span>
                </a>
                <a href="<?php echo esc_url( home_url( '/family/daniel' ) ); ?>" class="tc-desk__drawer-card">
                    <span class="tc-desk__drawer-card-title">Daniel</span>
                    <span class="tc-desk__drawer-card-count">207 photos</span>
                </a>
                <a href="<?php echo esc_url( home_url( '/family/faith' ) ); ?>" class="tc-desk__drawer-card">
                    <span class="tc-desk__drawer-card-title">Faith</span>
                    <span class="tc-desk__drawer-card-count">219 photos</span>
                </a>
                <a href="<?php echo esc_url( home_url( '/family' ) ); ?>" class="tc-desk__drawer-card">
                    <span class="tc-desk__drawer-card-title">Family &mdash; all of us</span>
                    <span class="tc-desk__drawer-card-count">560 photos</span>
                </a>
                <a href="<?php echo esc_url( home_url( '/family/heritage' ) ); ?>" class="tc-desk__drawer-card">
                    <span class="tc-desk__drawer-card-title">Heritage docs</span>
                    <span class="tc-desk__drawer-card-count">YouTube series</span>
                </a>
                <a href="#" class="tc-desk__drawer-card">
                    <span class="tc-desk__drawer-card-title">Site videos</span>
                    <span class="tc-desk__drawer-card-count">coming soon</span>
                </a>
            </div>
        </div>
    </div>

</div>
    <?php
}
