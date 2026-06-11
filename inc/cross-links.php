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


/**
 * Render the "rest of the family" quick-links for a person-spoke page.
 *
 * Replaces the HCS aside on the kid pages with something more apt: a small
 * card grid jumping to the OTHER members of the immediate family. On a kid's
 * page that's the siblings + Mom & Dad; on a parent's page it's the children
 * + the other parent. Reuses the .heritage-siblings styling.
 *
 * Each person is only linked if their WP page actually exists (path
 * family/<slug>), so the block never 404s — and Melanie's card appears
 * automatically the moment her page is published.
 *
 * @param string $current_slug The person whose page is rendering
 *                             (patience|daniel|faith|thomas|melanie).
 */
function tc_render_family_links( $current_slug ) {
    // Immediate family. 'kind' groups people; 'gender' drives the relation
    // word shown on each card.
    $people = array(
        'patience' => array( 'title' => 'Patience', 'kind' => 'child',  'gender' => 'f' ),
        'daniel'   => array( 'title' => 'Daniel',   'kind' => 'child',  'gender' => 'm' ),
        'faith'    => array( 'title' => 'Faith',    'kind' => 'child',  'gender' => 'f' ),
        'thomas'   => array( 'title' => 'Thomas',   'kind' => 'parent', 'gender' => 'm' ),
        'melanie'  => array( 'title' => 'Melanie',  'kind' => 'parent', 'gender' => 'f' ),
    );

    if ( ! isset( $people[ $current_slug ] ) ) {
        return;
    }
    $current_kind = $people[ $current_slug ]['kind'];

    // Relation of another person TO the person whose page we're on.
    $relation = function ( $other ) use ( $current_kind ) {
        if ( 'parent' === $other['kind'] ) {
            return 'f' === $other['gender'] ? 'Mom' : 'Dad';
        }
        if ( 'parent' === $current_kind ) {
            return 'f' === $other['gender'] ? 'Daughter' : 'Son';
        }
        return 'f' === $other['gender'] ? 'Sister' : 'Brother';
    };

    // Same-generation relatives first (siblings / children), parents last.
    $items = array();
    foreach ( array( 'child', 'parent' ) as $kind ) {
        foreach ( $people as $slug => $p ) {
            if ( $slug === $current_slug || $p['kind'] !== $kind ) {
                continue;
            }
            // Skip anyone whose page isn't published yet (e.g. Melanie).
            if ( ! get_page_by_path( 'family/' . $slug ) ) {
                continue;
            }
            $items[] = array(
                'slug'     => $slug,
                'title'    => $p['title'],
                'relation' => $relation( $p ),
            );
        }
    }

    if ( empty( $items ) ) {
        return;
    }
    ?>
    <aside class="heritage-siblings heritage-siblings--family scroll-animate" aria-labelledby="family-links-heading">
        <h2 id="family-links-heading" class="heritage-siblings__heading">
            <?php esc_html_e( 'The rest of the family', 'tc-ventures-child' ); ?>
        </h2>
        <ul class="heritage-siblings__list">
            <?php foreach ( $items as $it ) : ?>
                <li class="heritage-siblings__item">
                    <a class="heritage-siblings__link" href="<?php echo esc_url( home_url( '/family/' . $it['slug'] ) ); ?>">
                        <span class="heritage-siblings__title"><?php echo esc_html( $it['title'] ); ?></span>
                        <span class="heritage-siblings__subtitle"><?php echo esc_html( $it['relation'] ); ?></span>
                        <span class="heritage-siblings__cta" aria-hidden="true">&rarr;</span>
                    </a>
                </li>
            <?php endforeach; ?>
        </ul>
    </aside>
    <?php
}
