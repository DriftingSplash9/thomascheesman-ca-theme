<?php
/**
 * Cross-link components — kid-spoke → HCS, heritage line → siblings.
 *
 * Two small renderers wired into the relevant page templates to tighten
 * the site's internal-link graph:
 *
 *   1. tc_render_hcs_crosslink() — a quiet "In our family" aside that
 *      sits between the kid-spoke's bio prose and its photo wall. Says
 *      what HCS is, in one line, and links to the full page. Same
 *      component on Patience / Daniel / Faith because the HCS context
 *      is the same for all three.
 *
 *   2. tc_render_heritage_siblings( $current_slug ) — the sibling nav
 *      at the bottom of each heritage line page (Cheesmans / Dochertys
 *      / Lakemans / Rycrofts / Haistes). Renders the OTHER four lines
 *      as a card grid with the same subtitles used on the /family/
 *      heritage hub, so a reader who finishes one line has a clear
 *      hand-off to the next.
 *
 * Both are styled in style.css under their own block — see
 * .heritage-crosslink and .heritage-siblings.
 */

if ( ! defined( 'ABSPATH' ) ) { exit; }


/**
 * Render the "In our family" HCS crosslink aside for a kid-spoke page.
 *
 * Placed between the bio <section> and the photo wall in
 * page-patience.php / page-daniel.php / page-faith.php. Same prose for
 * all three because HCS is the family's shared backdrop.
 */
function tc_render_hcs_crosslink() {
    ?>
    <aside class="heritage-crosslink heritage-crosslink--hcs scroll-animate" aria-labelledby="heritage-crosslink-hcs-heading">
        <p class="heritage-crosslink__eyebrow">In our family</p>
        <h2 id="heritage-crosslink-hcs-heading" class="heritage-crosslink__heading">Hajdu-Cheney Syndrome</h2>
        <p class="heritage-crosslink__prose">
            The rare condition I've carried since I was five. It changed what being a dad looks like &mdash; what it took, what it gave. The full story is on its own page.
        </p>
        <a class="heritage-crosslink__cta" href="<?php echo esc_url( home_url( '/hcs' ) ); ?>">
            <?php esc_html_e( 'About HCS', 'tc-ventures-child' ); ?>
            <span aria-hidden="true">&nbsp;&rarr;</span>
        </a>
    </aside>
    <?php
}


/**
 * Render the sibling-nav block at the bottom of a heritage line page.
 *
 * Lists the OTHER four heritage lines as a small card grid. Subtitles
 * mirror those on the /family/heritage hub page so the voice carries.
 *
 * @param string $current_slug Slug of the heritage line being rendered.
 *                             One of: cheesmans, dochertys, lakemans,
 *                             rycrofts, haistes. Used to filter that
 *                             line out of the list (so the page doesn't
 *                             link back to itself).
 */
function tc_render_heritage_siblings( $current_slug ) {
    // Single source of truth for the line list. When Batch 5 collapses
    // the five heritage PHPs into one template + data files, this array
    // moves into the per-line data — for now it lives here.
    $lines = array(
        'cheesmans' => array(
            'title'    => 'The Cheesmans',
            'subtitle' => 'The Cheesiest Clan',
        ),
        'dochertys' => array(
            'title'    => 'The Dochertys',
            'subtitle' => 'Few and far between, deep roots',
        ),
        'lakemans'  => array(
            'title'    => 'The Lakemans',
            'subtitle' => 'Indonesia, Holland, Calgary, and most places in between',
        ),
        'rycrofts'  => array(
            'title'    => 'The Rycrofts',
            'subtitle' => 'Pioneers of the Region',
        ),
        'haistes'   => array(
            'title'    => 'The Haistes',
            'subtitle' => 'Yorkshire to the Peace Country',
        ),
    );

    // Drop the current line so the page doesn't link to itself.
    unset( $lines[ $current_slug ] );

    if ( empty( $lines ) ) {
        return;
    }
    ?>
    <aside class="heritage-siblings scroll-animate" aria-labelledby="heritage-siblings-heading">
        <h2 id="heritage-siblings-heading" class="heritage-siblings__heading">
            <?php esc_html_e( 'Other lines on the family tree', 'tc-ventures-child' ); ?>
        </h2>
        <ul class="heritage-siblings__list">
            <?php foreach ( $lines as $slug => $line ) : ?>
                <li class="heritage-siblings__item">
                    <a class="heritage-siblings__link" href="<?php echo esc_url( home_url( '/family/heritage/' . $slug ) ); ?>">
                        <span class="heritage-siblings__title"><?php echo esc_html( $line['title'] ); ?></span>
                        <span class="heritage-siblings__subtitle"><?php echo esc_html( $line['subtitle'] ); ?></span>
                        <span class="heritage-siblings__cta" aria-hidden="true">&rarr;</span>
                    </a>
                </li>
            <?php endforeach; ?>
        </ul>
    </aside>
    <?php
}
