<?php
/**
 * TC 'ventures Child Theme Functions
 */

/**
 * Helper includes — small reusable PHP-side renderers used across
 * multiple page templates. Kept in inc/ so each helper is one file
 * with one responsibility, easy to find and refactor.
 */
require_once get_stylesheet_directory() . '/inc/photo-gallery.php';
require_once get_stylesheet_directory() . '/inc/desk-menu.php';
require_once get_stylesheet_directory() . '/inc/games-leaderboard.php';
require_once get_stylesheet_directory() . '/inc/daily-quote.php';

/**
 * Enqueue parent and child theme styles and scripts.
 *
 * Load order is enforced via the third argument of wp_enqueue_style/script,
 * which declares dependencies. WordPress guarantees a handle's dependencies
 * are output before the handle itself.
 */
function tc_ventures_enqueue_scripts() {

    // Parent theme (Astra) stylesheet.
    // get_template_directory_uri() points to the PARENT theme folder.
    wp_enqueue_style(
        'astra-parent-style',
        get_template_directory_uri() . '/style.css',
        array(),
        wp_get_theme( 'astra' )->get( 'Version' )
    );

    // PhotoSwipe v5 lightbox CSS (CDN). The JS for PhotoSwipe is
    // dynamically imported by main.js's initLightbox() the first time
    // the user clicks a figure — keeps the initial load light.
    //
    // Enqueued BEFORE the child stylesheet so the child can override
    // PhotoSwipe's defaults (frosted pills on buttons, counter, etc.).
    // Same-specificity selectors lose if PhotoSwipe loads later.
    wp_enqueue_style(
        'photoswipe',
        'https://unpkg.com/photoswipe@5.4.4/dist/photoswipe.css',
        array(),
        '5.4.4'
    );

    // Child theme stylesheet — must load AFTER the parent and AFTER
    // PhotoSwipe so it can override either. get_stylesheet_uri() points
    // to the CHILD theme's style.css.
    wp_enqueue_style(
        'astra-child-style',
        get_stylesheet_uri(),
        array( 'astra-parent-style', 'photoswipe' ),
        wp_get_theme()->get( 'Version' )
    );

    // Italiana — Didone display serif used for the lightbox counter
    // ("01 / 06"). Single weight (400) keeps the file small.
    wp_enqueue_style(
        'tc-italiana',
        'https://fonts.googleapis.com/css2?family=Italiana&display=swap',
        array(),
        null
    );

    // Fraunces — variable serif used by the footer marquee. Two axes:
    //   wght 300..900 — drives per-character "breathing" (light at the
    //                   marquee's edges, heavy through the center) once
    //                   the breathing JS is wired up. The transition is
    //                   GPU-cheap because it interpolates a single axis.
    //   opsz 9..144   — optical size axis lets the glyphs be drawn at
    //                   display sizes without looking thin/spindly.
    // Google Fonts serves a single variable file covering both ranges.
    wp_enqueue_style(
        'tc-fraunces',
        'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300..900&display=swap',
        array(),
        null
    );

    // Caveat — handwritten Google Font used by the desk-menu hover cards
    // (small attribution slips that fade in when an object is hovered).
    // Loaded site-wide because the desk-menu overlay is the global menu.
    wp_enqueue_style(
        'tc-caveat',
        'https://fonts.googleapis.com/css2?family=Caveat:wght@400;600&display=swap',
        array(),
        null
    );

    // Desk menu — the BHAG navigation surface. Loaded site-wide; the
    // overlay is always in the DOM (rendered by tc_render_desk_menu()
    // from inc/desk-menu.php) but hidden by default. Activated by setting
    // html.tc-desk-open via the menu-trigger button (wired in C4).
    //
    // Depends on astra-child-style so its rules can override sitewide
    // defaults. Version bumps via the child theme's style.css header.
    wp_enqueue_style(
        'tc-desk-menu',
        get_stylesheet_directory_uri() . '/assets/css/desk-menu.css',
        array( 'astra-child-style' ),
        wp_get_theme()->get( 'Version' )
    );

    // GSAP core library (CDN).
    wp_enqueue_script(
        'gsap-core',
        'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js',
        array(),
        '3.12.2',
        false
    );

    // GSAP ScrollTrigger plugin — depends on GSAP core.
    wp_enqueue_script(
        'gsap-scroll-trigger',
        'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js',
        array( 'gsap-core' ),
        '3.12.2',
        false
    );

    // (GSAP MotionPathPlugin enqueue was removed with the jeep timeline.)

    // Three.js (UMD build) — used by main.js to drive the WebGL background.
    // Pinned to r128 because it's widely cached on cdnjs and definitively
    // has the UMD `three.min.js` artifact. Newer releases (r150+) shifted
    // to ES modules and the UMD path is unreliable across CDNs.
    wp_enqueue_script(
        'three-js',
        'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',
        array(),
        'r128',
        true
    );

    // Custom main JavaScript — depends on GSAP, ScrollTrigger, and Three.js.
    // Loaded in the footer (final arg = true) so it runs after DOM parse.
    // Version reads from the child theme's style.css header so a single
    // bump there cache-busts both CSS and JS in one place.
    wp_enqueue_script(
        'tc-ventures-main',
        get_stylesheet_directory_uri() . '/assets/js/main.js',
        array( 'gsap-core', 'gsap-scroll-trigger', 'three-js' ),
        wp_get_theme()->get( 'Version' ),
        true
    );

    // Expose a small data object from PHP to main.js as window.tcVentures.
    wp_localize_script( 'tc-ventures-main', 'tcVentures', array(
        'siteUrl'  => home_url(),
        'themeUrl' => get_stylesheet_directory_uri(),
    ));

    // Desk menu interactions. Self-contained module: wires the drawer
    // + search affordances inside the .tc-desk overlay. Open/close of
    // the overlay itself is wired in header.php / main.js in C4.
    // No JS deps; loaded in the footer after DOM parse.
    wp_enqueue_script(
        'tc-desk-menu',
        get_stylesheet_directory_uri() . '/assets/js/desk-menu.js',
        array(),
        wp_get_theme()->get( 'Version' ),
        true
    );

    // Desk-games arcade. The canvas games (Snake / Pong / Pac-Man /
    // Asteroids / Brickles / Solitaire) tucked behind the toad
    // hotspot. Depends on desk-menu.js for the drawer's open/close
    // wiring; this file owns picker→play view switching, the game
    // loops, and the REST-backed leaderboard wiring.
    wp_enqueue_script(
        'tc-desk-games',
        get_stylesheet_directory_uri() . '/assets/js/desk-games.js',
        array( 'tc-desk-menu' ),
        wp_get_theme()->get( 'Version' ),
        true
    );
    wp_localize_script(
        'tc-desk-games',
        'tcDeskGames',
        array(
            'scoresUrl' => esc_url_raw( rest_url( 'tc-games/v1/scores' ) ),
            // Cache-buster for the lazy-loaded desk-pinball.js; reads
            // the same Version: header that cache-busts every other
            // CSS/JS handle, so a single style.css version bump
            // invalidates the pinball script too.
            'version'   => wp_get_theme()->get( 'Version' ),
        )
    );

    // The Drawer footer — sitemap compartments + daily quote + giant
    // click-to-copy email + live clock + a marble that escalates into
    // pinball. The pinball script (desk-pinball.js) and Matter.js are
    // lazy-loaded by desk-drawer.js on first marble click, so visitors
    // who never trigger it pay zero. Loaded site-wide because footer.php
    // is the global footer template.
    wp_enqueue_style(
        'tc-desk-drawer',
        get_stylesheet_directory_uri() . '/assets/css/desk-drawer.css',
        array( 'astra-child-style', 'tc-caveat', 'tc-fraunces' ),
        wp_get_theme()->get( 'Version' )
    );
    wp_enqueue_style(
        'tc-desk-pinball',
        get_stylesheet_directory_uri() . '/assets/css/desk-pinball.css',
        array( 'tc-desk-drawer' ),
        wp_get_theme()->get( 'Version' )
    );
    wp_enqueue_script(
        'tc-desk-drawer',
        get_stylesheet_directory_uri() . '/assets/js/desk-drawer.js',
        array( 'tc-desk-games' ),
        wp_get_theme()->get( 'Version' ),
        true
    );

}
add_action( 'wp_enqueue_scripts', 'tc_ventures_enqueue_scripts' );

/**
 * Bing Webmaster Tools — site verification.
 *
 * Bing verifies ownership by fetching a token file at the site root.
 * They generate a `BingSiteAuth.xml` containing a one-line user token
 * and expect it served from `https://thomascheesman.ca/BingSiteAuth.xml`.
 *
 * Rather than ship the file via Hostinger's File Manager (which means
 * a file that lives outside this repo and can drift), we intercept
 * the exact URL via WordPress's `parse_request` action — which fires
 * before WP tries to match the URL against posts/pages — and emit the
 * XML response directly.
 *
 * Token from the Bing-generated file (Downloads/BingSiteAuth.xml,
 * 2026-05-20). If Bing ever asks for re-verification with a new token,
 * update this constant and push.
 */
const TC_BING_VERIFY_TOKEN = '5776B695B9937BEFEC7FA41711B62BA9';

// Method 1: serve the XML token file at /BingSiteAuth.xml. Intercept
// the URL before WP tries to match it to a post/page.
add_action( 'parse_request', function () {
    $req = isset( $_SERVER['REQUEST_URI'] ) ? $_SERVER['REQUEST_URI'] : '';
    // Match the exact path with or without a trailing slash and ignore
    // any query string. Case-insensitive because Bing has historically
    // probed with mixed casing.
    $path = strtolower( strtok( $req, '?' ) );
    if ( $path === '/bingsiteauth.xml' || $path === '/bingsiteauth.xml/' ) {
        status_header( 200 );
        nocache_headers();
        header( 'Content-Type: application/xml; charset=UTF-8' );
        echo "<?xml version=\"1.0\"?>\n";
        echo "<users>\n";
        echo "\t<user>" . TC_BING_VERIFY_TOKEN . "</user>\n";
        echo "</users>\n";
        exit;
    }
}, 0 );

// Method 2: emit the <meta name="msvalidate.01"> tag in <head> on
// every page. Bing's note when generating the tag: "don't remove
// the meta tag even after verification succeeds" — they spot-check
// periodically. wp_head priority 1 puts it near the top of <head>.
add_action( 'wp_head', function () {
    echo '<meta name="msvalidate.01" content="' . esc_attr( TC_BING_VERIFY_TOKEN ) . '" />' . "\n";
}, 1 );

/**
 * Theme setup: register features the theme supports.
 * Runs once, after Astra's own after_setup_theme.
 */
function tc_ventures_setup() {
    add_theme_support( 'title-tag' );
    add_theme_support( 'post-thumbnails' );
    add_theme_support( 'custom-logo' );
    add_theme_support( 'html5', array( 'search-form', 'comment-form', 'comment-list', 'gallery', 'caption' ) );

    register_nav_menus( array(
        'primary' => esc_html__( 'Primary Menu', 'tc-ventures-child' ),
        'footer'  => esc_html__( 'Footer Menu', 'tc-ventures-child' ),
    ));
}
add_action( 'after_setup_theme', 'tc_ventures_setup' );

/**
 * Disable WordPress attachment pages.
 *
 * Every file uploaded to the Media Library gets a public "attachment page"
 * at /<slug>/ that mirrors the file. They:
 *   - Have no value to visitors (the actual file URL already serves the file)
 *   - Hijack slugs we want for real pages — uploading family.jpg made
 *     /family/ permanently route to the JPEG, blocking the Family page
 *   - Often get indexed as duplicate/thin content by search engines
 *
 * This filter marks the `attachment` post type as not publicly queryable
 * and removes its rewrite rule. Attachment URLs return 404 (or, via the
 * belt-and-suspenders redirect below, send visitors to the file itself).
 *
 * IMPORTANT — after deploying this, visit `Settings → Permalinks` in WP
 * admin and click `Save Changes` (no fields need to be touched). That
 * flushes the cached rewrite rules so the change actually takes effect.
 */
function tc_ventures_disable_attachment_pages( $args, $post_type ) {
    if ( 'attachment' === $post_type ) {
        $args['publicly_queryable'] = false;
        $args['rewrite']            = false;
    }
    return $args;
}
add_filter( 'register_post_type_args', 'tc_ventures_disable_attachment_pages', 10, 2 );

/**
 * Belt-and-suspenders: if a stale link or external referrer still hits
 * an attachment URL after the filter above, redirect to the file's
 * direct URL (under /wp-content/uploads/...) so we don't break inbound
 * links to images during the transition.
 */
function tc_ventures_redirect_attachment_to_file() {
    if ( is_attachment() ) {
        $file_url = wp_get_attachment_url( get_queried_object_id() );
        if ( $file_url ) {
            wp_safe_redirect( $file_url, 301 );
            exit;
        }
    }
}
add_action( 'template_redirect', 'tc_ventures_redirect_attachment_to_file' );

/**
 * Allow pages and posts to reclaim slugs that are "taken" by attachments.
 *
 * WordPress enforces slug uniqueness across ALL post types — so even
 * after we've disabled attachment URLs above, the slug records in the
 * database still count as taken. Result: trying to publish a page named
 * "Family" with a family.jpg attachment present will auto-rename the
 * page slug to "family-2", "family-3", etc.
 *
 * This filter looks at the slug WP wants to use (the modified one) and
 * the original slug the user requested. If the only conflict for the
 * original slug is with an attachment, we hand back the original — the
 * attachment's slug doesn't matter anymore because attachment URLs no
 * longer route. Pages and other posts are still checked normally, so
 * two real pages can't ever share a slug.
 *
 * Filter signature ref: WP core's `wp_unique_post_slug`.
 */
function tc_ventures_allow_page_slug_over_attachment( $slug, $post_id, $post_status, $post_type, $post_parent, $original_slug ) {
    // Only relevant when WP changed the slug (collision detected) and
    // the post being saved is a page or a regular post.
    if ( $slug === $original_slug ) {
        return $slug;
    }
    if ( ! in_array( $post_type, array( 'page', 'post' ), true ) ) {
        return $slug;
    }

    global $wpdb;

    // Direct DB check: is there any *non-attachment* post with this
    // slug, excluding the current one and excluding trashed / auto-draft
    // entries? If not, the conflict was only with attachments — safe to
    // reuse the original slug.
    $conflict = $wpdb->get_var( $wpdb->prepare(
        "SELECT ID FROM {$wpdb->posts}
         WHERE post_name = %s
           AND post_type != 'attachment'
           AND post_status NOT IN ('trash', 'auto-draft')
           AND ID != %d
         LIMIT 1",
        $original_slug,
        $post_id
    ) );

    if ( ! $conflict ) {
        return $original_slug;
    }

    return $slug;
}
add_filter( 'wp_unique_post_slug', 'tc_ventures_allow_page_slug_over_attachment', 10, 6 );

/**
 * Contact form — formerly server-side via wp_mail() to wecare@bareyourrare.org
 * with Gmail POP3 fetching. That path was abandoned 2026-05-11 after
 * persistent delivery flakiness (Gmail forwarder dropping silently,
 * Hostinger SMTP failing SPF on outbound to gmail.com, POP fetches
 * stalling). The /contact form now uses a client-side mailto: composer
 * (see initContactMailto() in main.js) — visitor's own email client
 * sends the message, no server-side mail at all.
 *
 * The TC_CONTACT_RECIPIENT constant in wp-config.php is now unused
 * but harmless if left defined.
 */

/**
 * Placeholders — uncomment when ready.
 */

// Custom post type example (stories, projects, etc.):
// function tc_ventures_register_post_types() {
//     register_post_type( 'tc_story', array(
//         'label'    => 'Stories',
//         'public'   => true,
//         'supports' => array( 'title', 'editor', 'thumbnail' ),
//     ));
// }
// add_action( 'init', 'tc_ventures_register_post_types' );

// Disable Gutenberg editor entirely (we want PHP templates, not blocks):
// add_filter( 'use_block_editor_for_post_type', '__return_false', 10 );

/**
 * Render the "Read next" carousel — a horizontal strip of other posts.
 *
 * Lives in one place so single.php and the bespoke page/post templates
 * (e.g. the case-studies page, the Proud Of Canada essay) can all drop
 * it in. initPostCarousel() in main.js drives the prev/next arrows.
 */
function tc_render_read_next() {
    $q = new WP_Query( array(
        'post_type'           => 'post',
        'posts_per_page'      => 9,
        'post__not_in'        => array( get_queried_object_id() ),
        'orderby'             => 'date',
        'order'               => 'DESC',
        'ignore_sticky_posts' => true,
    ) );
    if ( ! $q->have_posts() ) {
        return;
    }
    ?>
    <section class="post-carousel" aria-label="<?php esc_attr_e( 'More posts to read', 'tc-ventures-child' ); ?>">
        <div class="container">
            <h2 class="post-carousel__heading">Read next</h2>
            <div class="post-carousel__viewport">
                <button type="button" class="post-carousel__arrow post-carousel__arrow--prev" aria-label="<?php esc_attr_e( 'Scroll back', 'tc-ventures-child' ); ?>">&larr;</button>
                <ul class="post-carousel__track">
                    <?php while ( $q->have_posts() ) : $q->the_post(); ?>
                        <li class="post-carousel__item">
                            <a class="post-carousel__card" href="<?php the_permalink(); ?>">
                                <span class="post-carousel__thumb">
                                    <?php
                                    if ( has_post_thumbnail() ) {
                                        the_post_thumbnail( 'medium' );
                                    } else {
                                        echo '<span class="post-carousel__thumb-fallback" aria-hidden="true">TC</span>';
                                    }
                                    ?>
                                </span>
                                <span class="post-carousel__card-body">
                                    <span class="post-carousel__card-meta"><?php echo esc_html( get_the_date( 'F j, Y' ) ); ?></span>
                                    <span class="post-carousel__card-title"><?php the_title(); ?></span>
                                </span>
                            </a>
                        </li>
                    <?php endwhile; ?>
                </ul>
                <button type="button" class="post-carousel__arrow post-carousel__arrow--next" aria-label="<?php esc_attr_e( 'Scroll forward', 'tc-ventures-child' ); ?>">&rarr;</button>
            </div>
        </div>
    </section>
    <?php
    wp_reset_postdata();
}
