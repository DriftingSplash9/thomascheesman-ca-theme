<?php
/**
 * Security headers + SEO schema augmentation
 *
 * Non-functional hardening that wraps every front-end response:
 *
 *   1. Security response headers — HSTS, nosniff, frame-ancestors,
 *      Referrer-Policy, tightened Permissions-Policy, a (loose-but-
 *      useful) Content-Security-Policy.
 *   2. Suppression of leaky server identification (X-Powered-By).
 *   3. Person JSON-LD schema for Thomas on the homepage (Google's
 *      knowledge-graph hook — links the site to its X / Facebook /
 *      YouTube / BYR / GPRS presences).
 *   4. robots.txt sitemap reference: point crawlers at the canonical
 *      wp-sitemap.xml directly (avoids the legacy /sitemap.xml -> 302
 *      redirect chain).
 *
 * Hostinger's LiteSpeed already emits a Permissions-Policy with a
 * couple of state-token directives; we send our own second
 * Permissions-Policy header alongside. Per spec, browsers receiving
 * multiple Permissions-Policy headers treat them as one concatenated
 * directive list — so Hostinger's state-token directives + our
 * feature denials both apply.
 *
 * Wired from functions.php via require_once.
 */

if ( ! defined( 'ABSPATH' ) ) { exit; }

/**
 * One CSP nonce per request (G9 — nonce-based script-src, 2026-06).
 *
 * 'strict-dynamic' is the script-src keyword that lets a nonce'd
 * script create further <script> tags (main.js lazily injecting
 * three.js, desk-drawer.js injecting Matter.js, etc.) without those
 * descendants needing a nonce of their own. The trade-off: browsers
 * that understand strict-dynamic then ignore 'self'/https: for the
 * INITIAL scripts too, so even our own same-origin <script src> tags
 * need this nonce to run at all — see the script_loader_tag and
 * wp_inline_script_attributes filters below, which attach it to every
 * WP-managed script tag, src= and inline alike.
 */
function tc_csp_nonce() {
    static $nonce = null;
    if ( null === $nonce ) {
        $nonce = base64_encode( random_bytes( 16 ) );
    }
    return $nonce;
}

/**
 * Attach the CSP nonce to every enqueued <script src="..."> tag.
 * Skipped in wp-admin — that's a different surface with its own
 * inline scripts, and tc_send_security_headers() never sends our CSP
 * there anyway.
 */
add_filter( 'script_loader_tag', function ( $tag, $handle, $src ) {
    if ( is_admin() || strpos( $tag, ' nonce=' ) !== false ) {
        return $tag;
    }
    return preg_replace( '/<script /', '<script nonce="' . esc_attr( tc_csp_nonce() ) . '" ', $tag, 1 );
}, 10, 3 );

/**
 * Attach the CSP nonce to every wp_add_inline_script() /
 * wp_localize_script() generated <script> block (the "-js-extra" /
 * "-js-before" / "-js-after" tags WP prints alongside a handle).
 */
add_filter( 'wp_inline_script_attributes', function ( $attributes ) {
    if ( is_admin() ) {
        return $attributes;
    }
    $attributes['nonce'] = tc_csp_nonce();
    return $attributes;
} );

/**
 * Send security headers on every front-end response.
 *
 * Wired to the send_headers action — fires after WP has routed the
 * request but before output starts. Skips admin, login, REST, and
 * AJAX requests so those surfaces aren't affected by the public
 * site's CSP (they have their own header policies and our CSP would
 * break inline admin scripts).
 *
 * Each header is filterable via the tc_security_headers map filter.
 * Return false for any key to skip sending that header — useful for
 * temporarily disabling CSP if a third-party embed misbehaves while
 * debugging.
 */
function tc_send_security_headers() {

    // Skip admin / REST / AJAX. Login (wp-login.php) is technically
    // public so we DO want headers there — only the action contexts
    // are skipped.
    if ( is_admin() ) {
        return;
    }
    if ( defined( 'REST_REQUEST' ) && REST_REQUEST ) {
        return;
    }
    if ( defined( 'DOING_AJAX' ) && DOING_AJAX ) {
        return;
    }

    $headers = array(

        // 1-year HSTS with subdomain coverage and preload eligibility.
        // After a few weeks of stable rollout, submit the domain to
        // https://hstspreload.org so browsers ship the rule baked in.
        'Strict-Transport-Security' => 'max-age=31536000; includeSubDomains; preload',

        // Block MIME-sniffing: stops IE/Chrome from treating a
        // mislabelled response as a different content type (an old
        // but still occasionally relevant XSS vector).
        'X-Content-Type-Options'    => 'nosniff',

        // Belt-and-braces clickjacking protection. Modern browsers
        // honour CSP frame-ancestors (set below) and ignore this;
        // older browsers still pick it up.
        'X-Frame-Options'           => 'SAMEORIGIN',

        // Send the origin (not the full URL) cross-origin; full URL
        // same-origin. Sane default that doesn't break referer-based
        // analytics on internal navigations.
        'Referrer-Policy'           => 'strict-origin-when-cross-origin',

        // Deny features the site doesn't use. fullscreen() IS used by
        // the arcade / pinball / drawer secret-screen on this origin,
        // so it's allowed for self only. interest-cohort=() opts out
        // of Google's FLoC (now Topics API) cohort assignment.
        'Permissions-Policy'        => implode( ', ', array(
            'camera=()',
            'microphone=()',
            'geolocation=()',
            'payment=()',
            'usb=()',
            'magnetometer=()',
            'gyroscope=()',
            'accelerometer=()',
            'midi=()',
            'bluetooth=()',
            'fullscreen=(self)',
            'interest-cohort=()',
        ) ),

        // Loose CSP. Still hardens four meaningful things:
        //   - base-uri 'self'           — blocks <base> tag injection
        //   - form-action 'self'        — blocks form-jacking redirects
        //   - object-src 'none'         — kills Flash / Java applets
        //   - frame-ancestors 'self'    — blocks clickjacking iframes
        // 'unsafe-inline' + 'unsafe-eval' stay here for now — this is
        // the ENFORCED policy, kept loose until the Report-Only policy
        // below comes back clean from a live verification pass. See
        // the nonce'd Content-Security-Policy-Report-Only entry for
        // the G9 tightened policy actually being tested.
        'Content-Security-Policy'   => implode( ' ', array(
            "default-src 'self' https: data: blob:;",
            "script-src 'self' https: 'unsafe-inline' 'unsafe-eval';",
            "style-src 'self' https: 'unsafe-inline';",
            "img-src 'self' https: data: blob:;",
            "font-src 'self' https: data:;",
            "connect-src 'self' https:;",
            "media-src 'self' https: blob:;",
            "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://accounts.google.com;",
            "frame-ancestors 'self';",
            "object-src 'none';",
            "base-uri 'self';",
            "form-action 'self';",
            "upgrade-insecure-requests;",
        ) ),

        // G9 — nonce-based script-src, in REPORT-ONLY mode for now.
        // Drops 'unsafe-inline' and 'unsafe-eval' from script-src in
        // favour of a per-request nonce + 'strict-dynamic' (see
        // tc_csp_nonce() above). This header never blocks anything —
        // it only makes the browser log would-this-have-been-blocked
        // violations to the console — so it's safe to ship while it's
        // verified against the live site. Once a clean pass confirms
        // nothing breaks, fold this into the real policy above and
        // delete this entry.
        'Content-Security-Policy-Report-Only' => implode( ' ', array(
            "default-src 'self' https: data: blob:;",
            "script-src 'self' https: 'nonce-" . tc_csp_nonce() . "' 'strict-dynamic';",
            "style-src 'self' https: 'unsafe-inline';",
            "img-src 'self' https: data: blob:;",
            "font-src 'self' https: data:;",
            "connect-src 'self' https:;",
            "media-src 'self' https: blob:;",
            "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://accounts.google.com;",
            "frame-ancestors 'self';",
            "object-src 'none';",
            "base-uri 'self';",
            "form-action 'self';",
            "upgrade-insecure-requests;",
        ) ),
    );

    /**
     * Filter the security headers map before sending.
     *
     * @param array $headers Map of header name => value.
     */
    $headers = apply_filters( 'tc_security_headers', $headers );

    foreach ( $headers as $name => $value ) {
        if ( $value === false || $value === null || $value === '' ) {
            continue;
        }
        header( $name . ': ' . $value );
    }

    // Suppress server identification. PHP sets X-Powered-By by default;
    // this removes it from the outgoing response. (The proper fix is
    // expose_php = Off in php.ini, but that requires host-level access.)
    header_remove( 'X-Powered-By' );
}
add_action( 'send_headers', 'tc_send_security_headers' );


/**
 * Emit Person JSON-LD schema for Thomas on the homepage.
 *
 * AIOSEO already publishes BreadcrumbList + Organization + WebPage +
 * WebSite via its own JSON-LD block. Google's schema spec allows
 * multiple JSON-LD blocks per page; the entities are merged by @id.
 * Since we use a distinct @id (#thomas) there's no collision with
 * AIOSEO's graph.
 *
 * Person schema only fires on the front page — Schema.org guidance
 * places the site's main entity at the root URL. Subpages get the
 * AIOSEO Organization + WebPage entities and don't need a duplicate
 * Person on every URL.
 *
 * The schema is filterable via tc_person_schema so an image URL can
 * be plugged in later without editing this file.
 */
function tc_render_person_schema() {

    if ( ! is_front_page() ) {
        return;
    }

    $person = array(
        '@context'     => 'https://schema.org',
        '@type'        => 'Person',
        '@id'          => home_url( '/#thomas' ),
        'name'         => 'Thomas Cheesman',
        'url'          => home_url( '/' ),
        'jobTitle'     => 'Builder, writer, rare-disease advocate',
        'description'  => 'Former chef. Father of three. Lives with Hajdu-Cheney Syndrome. Builds personal sites and writes about rare disease through Bare Your Rare.',
        'homeLocation' => array(
            '@type'   => 'Place',
            'address' => array(
                '@type'           => 'PostalAddress',
                'addressLocality' => 'Grande Prairie',
                'addressRegion'   => 'AB',
                'addressCountry'  => 'CA',
            ),
        ),
        'sameAs'       => array(
            'https://x.com/TCheesy_',
            'https://www.facebook.com/thomas.cheesman.9',
            'https://www.youtube.com/@DriftingSplash9',
            'https://bareyourrare.org',
            'https://www.gpresidentialsociety.com',
        ),
        'knowsAbout'   => array(
            'Hajdu-Cheney Syndrome',
            'Rare diseases',
            'Genealogy',
            'Culinary arts',
            'Web development',
        ),
    );

    /**
     * Filter the Person schema before rendering.
     *
     * Useful when a canonical portrait URL is settled — add an `image`
     * key, or extend sameAs / knowsAbout from elsewhere in the theme.
     *
     * @param array $person Person schema as an associative array.
     */
    $person = apply_filters( 'tc_person_schema', $person );

    echo "\n" . '<script type="application/ld+json" nonce="' . esc_attr( tc_csp_nonce() ) . '" class="tc-person-schema">';
    // wp_json_encode handles UTF-8 + escaping correctly. The slashes /
    // unicode flags keep the output compact and human-readable in source.
    echo wp_json_encode( $person, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE );
    echo '</script>' . "\n";
}
add_action( 'wp_head', 'tc_render_person_schema', 30 );


/**
 * Replace the robots.txt Sitemap reference with WordPress's canonical
 * wp-sitemap.xml.
 *
 * Current state: AIOSEO injects `Sitemap: https://.../sitemap.xml`,
 * which 302-redirects to wp-sitemap.xml. Crawlers follow the redirect,
 * but giving them the final URL up-front is cleaner and avoids the
 * appearance of a redirect chain in SEO audits.
 *
 * If AIOSEO is serving its own robots.txt (rather than letting WP
 * generate it and filtering through robots_txt), this filter is a
 * no-op — confirm with `curl https://thomascheesman.ca/robots.txt`
 * after deploy. If our line doesn't appear, the same change can be
 * made in AIOSEO → Tools → Robots.txt Editor.
 *
 * @param string $output The existing robots.txt body.
 * @param bool   $public Whether the site is set to public.
 */
function tc_fix_robots_sitemap( $output, $public ) {
    if ( ! $public ) {
        return $output;
    }
    // Strip any existing Sitemap: lines so we don't end up with both
    // the legacy /sitemap.xml AND the canonical wp-sitemap.xml.
    $output = preg_replace( '/^Sitemap:.*$/mi', '', $output );
    // Tidy up the run of blank lines preg_replace left behind, then
    // append our canonical reference.
    $output = preg_replace( "/\n{3,}/", "\n\n", $output );
    $output = rtrim( $output ) . "\n\nSitemap: " . home_url( '/wp-sitemap.xml' ) . "\n";
    return $output;
}
add_filter( 'robots_txt', 'tc_fix_robots_sitemap', 99, 2 );
