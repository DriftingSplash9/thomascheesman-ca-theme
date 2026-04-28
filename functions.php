<?php
/**
 * TC 'ventures Child Theme Functions
 */

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
}
add_action( 'wp_enqueue_scripts', 'tc_ventures_enqueue_scripts' );

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
 * Route wp_mail() through gmail's SMTP server.
 *
 * Hostinger's default PHP mail() silently drops most outbound mail
 * to gmail (sender domain isn't authenticated, so gmail rejects on
 * the receiving end). Sending via smtp.gmail.com with an App Password
 * solves that — gmail authenticates its own credentials, signs the
 * message itself, and trusts the result.
 *
 * Credentials live in wp-config.php (server-only, never in the public
 * theme repo) as TC_SMTP_USER and TC_SMTP_PASS. The password is a
 * 16-character Google App Password generated at
 * https://myaccount.google.com/apppasswords with 2FA enabled — NOT
 * the gmail account password.
 *
 * If either constant is missing this hook no-ops and wp_mail() falls
 * back to PHP's mail() — so rotating or removing the credentials
 * never breaks the site, only the contact form's deliverability.
 *
 * Reply-To is set per-message by tc_dispatch_handler() below, so even
 * though every form email is "from" the gmail account, hitting Reply
 * in the inbox routes to the visitor's address.
 */
function tc_route_mail_through_gmail( $phpmailer ) {
    if ( ! defined( 'TC_SMTP_USER' ) || ! defined( 'TC_SMTP_PASS' ) ) {
        set_transient(
            'tc_dispatch_smtp_route',
            'no — TC_SMTP_USER/PASS not defined in wp-config.php',
            30 * MINUTE_IN_SECONDS
        );
        return;
    }

    $phpmailer->isSMTP();
    $phpmailer->Host       = 'smtp.gmail.com';
    $phpmailer->SMTPAuth   = true;
    $phpmailer->Port       = 587;
    $phpmailer->SMTPSecure = 'tls';
    $phpmailer->Username   = TC_SMTP_USER;
    $phpmailer->Password   = TC_SMTP_PASS;

    $phpmailer->From     = TC_SMTP_USER;
    $phpmailer->FromName = 'TC ventures contact form';

    set_transient(
        'tc_dispatch_smtp_route',
        'yes — gmail SMTP configured (user: ' . TC_SMTP_USER . ')',
        30 * MINUTE_IN_SECONDS
    );
}
add_action( 'phpmailer_init', 'tc_route_mail_through_gmail' );

/**
 * Contact form handler — receives submissions from /contact.
 *
 * The form in page-contact.php POSTs to admin-post.php with
 * action=tc_dispatch_send. Both `admin_post_*` and
 * `admin_post_nopriv_*` hooks must be registered — the _nopriv
 * variant fires for anonymous visitors (i.e., everyone using the
 * contact form). Without it the request would 400 silently.
 *
 * Defenses (no third-party widget, no CAPTCHA):
 *   1. WP nonce — single-use token; blocks cross-site replay.
 *   2. Honeypot field "dispatch_website" — visually hidden in CSS,
 *      bots that fill every input will fill it. If it has a value
 *      we pretend success so the bot logs the submission as good
 *      and stops probing, instead of telling it the trap exists.
 *   3. Time-trap — render-time timestamp is stamped on the form.
 *      If the form returns in under 3 seconds it's almost certainly
 *      a script auto-filling and submitting.
 *
 * Recipient (wecare@bareyourrare.org) is hardcoded server-side and
 * is never present in the rendered HTML, so address-harvesters get
 * nothing to scrape.
 *
 * Result is communicated back via redirect to /contact/?dispatch=<status>
 * which page-contact.php renders as a status banner above the form.
 */
function tc_dispatch_handler() {
    // 1. Nonce.
    if ( ! isset( $_POST['tc_dispatch_nonce'] )
         || ! wp_verify_nonce( $_POST['tc_dispatch_nonce'], 'tc_dispatch' ) ) {
        wp_safe_redirect( home_url( '/contact/?dispatch=error' ) );
        exit;
    }

    // 2. Honeypot — pretend success so the bot doesn't learn the trap.
    if ( ! empty( $_POST['dispatch_website'] ) ) {
        wp_safe_redirect( home_url( '/contact/?dispatch=sent' ) );
        exit;
    }

    // 3. Time-trap — under 3 seconds since render is bot territory.
    $t0 = isset( $_POST['dispatch_t0'] ) ? intval( $_POST['dispatch_t0'] ) : 0;
    if ( $t0 === 0 || ( time() - $t0 ) < 3 ) {
        wp_safe_redirect( home_url( '/contact/?dispatch=error' ) );
        exit;
    }

    // Sanitize. wp_unslash undoes WordPress's automatic magic-quoting
    // before sanitizing, so apostrophes in names/messages survive intact.
    $name    = sanitize_text_field(     wp_unslash( $_POST['dispatch_name']    ?? '' ) );
    $email   = sanitize_email(          wp_unslash( $_POST['dispatch_email']   ?? '' ) );
    $subject = sanitize_text_field(     wp_unslash( $_POST['dispatch_subject'] ?? '' ) );
    $message = sanitize_textarea_field( wp_unslash( $_POST['dispatch_message'] ?? '' ) );

    // Validate required fields.
    if ( ! is_email( $email ) || empty( $message ) ) {
        wp_safe_redirect( home_url( '/contact/?dispatch=invalid' ) );
        exit;
    }

    // Recipient is configured via TC_CONTACT_RECIPIENT in wp-config.php
    // (server-only file, outside the public theme repo) so the address
    // never appears in source code. If the constant is missing or
    // invalid we fail closed — never silently send to nowhere.
    $to = defined( 'TC_CONTACT_RECIPIENT' ) && is_email( TC_CONTACT_RECIPIENT )
        ? TC_CONTACT_RECIPIENT
        : '';

    if ( empty( $to ) ) {
        wp_safe_redirect( home_url( '/contact/?dispatch=error' ) );
        exit;
    }

    // Self-mail workaround: gmail SMTP authenticates as TC_SMTP_USER,
    // and when the recipient is also that same account gmail can route
    // the message into "All Mail" or treat it as a Sent-folder duplicate
    // and skip the Inbox entirely. Rewriting the To header to use a
    // +alias variant makes gmail treat the message as delivery to a
    // distinct address — the base account still receives it via gmail's
    // alias routing, but inbox classification works normally.
    if ( defined( 'TC_SMTP_USER' )
         && strtolower( $to ) === strtolower( TC_SMTP_USER )
         && strpos( $to, '+' ) === false ) {
        list( $local, $domain ) = explode( '@', $to, 2 );
        $to = $local . '+tcsite@' . $domain;
    }

    // Compose. Subject prefix flags it as form mail in the inbox so
    // it's easy to filter or visually scan for.
    $subject_prefix = '[thomascheesman.ca]';
    $final_subject  = $subject
        ? $subject_prefix . ' ' . $subject
        : $subject_prefix . ' New message via /contact';

    $body  = "Name:    " . ( $name ?: '(not provided)' ) . "\n";
    $body .= "Email:   " . $email . "\n";
    if ( $subject ) {
        $body .= "Subject: " . $subject . "\n";
    }
    $body .= "\n----\n\n" . $message . "\n";

    // Reply-To = visitor's address so hitting Reply in the inbox
    // goes to them, not back to wecare@.
    $reply_to = $name ? sprintf( '%s <%s>', $name, $email ) : $email;
    $headers  = array(
        'Reply-To: ' . $reply_to,
        'Content-Type: text/plain; charset=UTF-8',
    );

    $sent = wp_mail( $to, $final_subject, $body, $headers );

    // Capture what just happened so the /contact page can surface it
    // to admin users only (visitors never see it) — useful for
    // diagnosing deliverability without needing PHP error logs.
    // 30-minute TTL so transients age out cleanly.
    set_transient( 'tc_dispatch_last_attempt', array(
        'to'      => $to,
        'subject' => $final_subject,
        'sent'    => (bool) $sent,
        'time'    => current_time( 'mysql' ),
    ), 30 * MINUTE_IN_SECONDS );

    wp_safe_redirect( home_url( '/contact/?dispatch=' . ( $sent ? 'sent' : 'error' ) ) );
    exit;
}
add_action( 'admin_post_tc_dispatch_send',        'tc_dispatch_handler' );
add_action( 'admin_post_nopriv_tc_dispatch_send', 'tc_dispatch_handler' );

/**
 * Capture wp_mail errors to a transient so the contact page can show
 * them inline for admin users. Saves a trip into PHP error logs when
 * something goes wrong with the SMTP send.
 */
add_action( 'wp_mail_failed', function ( $wp_error ) {
    set_transient(
        'tc_dispatch_last_error',
        $wp_error->get_error_message(),
        30 * MINUTE_IN_SECONDS
    );
} );

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
