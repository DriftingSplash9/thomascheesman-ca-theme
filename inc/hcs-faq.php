<?php
/**
 * HCS FAQ — visible accordion + FAQPage JSON-LD (one source of truth)
 *
 * A quick-reference Q&A appended to the /hcs essay for newly-diagnosed
 * searchers (and for AI answer-engines / Google rich results via the
 * FAQPage schema). Targets the audit's carried "HCS FAQ" item.
 *
 * Editorial guard: every answer here is DISTILLED FROM THOMAS'S OWN PROSE
 * already published on page-hcs.php — no new medical claims are introduced.
 * His hedges ("give or take", "roughly", "my diagnosis is clinical") are
 * kept deliberately. If the essay's facts change, change them here too.
 *
 * tc_hcs_faq_items()        — the single Q&A array (answers hold inline HTML).
 * tc_render_hcs_faq()       — echoes the visible <details> accordion; called
 *                             from page-hcs.php between the BYR bridge and
 *                             the Resources section.
 * tc_render_hcs_faq_schema() — wp_head FAQPage JSON-LD, gated to is_page('hcs').
 *                             Answer text is the visible answer with tags
 *                             stripped, so the schema mirrors the page (a
 *                             Google FAQPage requirement).
 *
 * Wired from functions.php via require_once.
 */

if ( ! defined( 'ABSPATH' ) ) { exit; }

/**
 * The FAQ content. Keys: 'q' (plain-text question), 'a' (answer; limited
 * inline HTML — <a>/<em> only — rendered verbatim in the accordion and
 * stripped to text for the schema).
 *
 * @return array<int,array{q:string,a:string}>
 */
function tc_hcs_faq_items() {
    $byr_guide = 'https://bareyourrare.org/conditions/hajdu-cheney-syndrome/';

    return array(
        array(
            'q' => 'What is Hajdu-Cheney Syndrome?',
            'a' => 'A rare bone and connective-tissue disorder. Your skeleton is always doing two jobs at once &mdash; building bone and breaking it down &mdash; and in HCS the breakdown runs faster than the rebuild. Bones get thinner, smaller, and less stable over time, especially in the hands and feet, where the tips of the fingers and toes can resorb back into the body. It can also reach the spine, skull, jaw, heart, kidneys, and immune system; the longer you have it, the more of you it tends to reach.',
        ),
        array(
            'q' => 'How do you pronounce &ldquo;Hajdu-Cheney&rdquo;?',
            'a' => 'Hay-dew chaye-knee.',
        ),
        array(
            'q' => 'What is acro-osteolysis?',
            'a' => 'It is the medical word for the bone loss and clubbing at the tips of the fingers and toes &mdash; the bone literally dissolving back. It is the headline symptom of HCS, but not the only one.',
        ),
        array(
            'q' => 'How rare is it? How many people have it?',
            'a' => 'There are roughly a hundred documented cases in the medical literature, and &mdash; going by our Facebook group, the one place we seem to have congregated &mdash; likely fewer than fifty of us alive in the world right now, give or take.',
        ),
        array(
            'q' => 'Is it inherited?',
            'a' => 'It is autosomal dominant, which means a parent passes it to roughly half their children &mdash; a coin flip per pregnancy. But many cases appear out of nowhere too: a new, spontaneous mutation (<em>de novo</em>) with no family history.',
        ),
        array(
            'q' => 'What causes it &mdash; what gene is involved?',
            'a' => 'For most people who carry the recognized form, a single faulty copy of a gene called NOTCH2. The HCS mutations cluster in the gene&rsquo;s last exon and cut the protein short, removing the &ldquo;expiry sticker&rdquo; (the PEST domain) that normally tells the body to clear it &mdash; so the bone-breakdown signal stays switched on too long. (My own genetic tests came back clean twice; my diagnosis is clinical.)',
        ),
        array(
            'q' => 'Can it be treated? Is there a cure?',
            'a' => 'There is no cure yet. Treatment slows the damage: bisphosphonates (pamidronate, alendronate, zoledronic acid) and denosumab reduce bone breakdown, and romosozumab (Evenity) builds bone and is promising, though it is not approved for HCS in Canada. Anti-Notch antibodies are the research frontier.',
        ),
        array(
            'q' => 'What symptoms does it cause?',
            'a' => 'It varies enormously &mdash; every case is its own dialect of the disease. Common features include the fingertip and toe bone loss (acro-osteolysis), low body weight, a spine and skull that change shape over time, jaw (TMJ) erosion, frequent upper-airway infections in the younger years, and organ involvement later in life. The textbook traits are a menu, not a destination.',
        ),
        array(
            'q' => 'I think I, or someone I love, might have HCS &mdash; where do I start?',
            'a' => 'You are not alone, even though it can feel that way. The <a href="' . esc_url( $byr_guide ) . '">HCS Patient Guide</a> and my own story on Bare Your Rare are the documents I wish someone had handed me; the OMIM and GeneReviews entries in the Resources below are the authoritative medical references; and registries like Care4Rare and NORD are worth joining. You are also welcome to email me.',
        ),
    );
}

/**
 * Render the visible FAQ accordion. Sits inside the /hcs article body as
 * an .about-section so it inherits the page's link + heading chrome.
 */
function tc_render_hcs_faq() {
    $items = tc_hcs_faq_items();
    if ( empty( $items ) ) {
        return;
    }
    $allowed = array( 'a' => array( 'href' => array() ), 'em' => array() );
    ?>
    <section id="faq" class="about-section about-section--faq scroll-animate" aria-labelledby="hcs-faq-heading">
        <h2 class="about-section__heading" id="hcs-faq-heading">Common questions</h2>
        <p>The short answers, for anyone who landed here looking for them. The longer story is everything above.</p>

        <div class="hcs-faq__list">
            <?php foreach ( $items as $item ) : ?>
                <details class="hcs-faq__item">
                    <summary class="hcs-faq__q"><?php echo wp_kses( $item['q'], array( 'em' => array() ) ); ?></summary>
                    <div class="hcs-faq__a">
                        <p><?php echo wp_kses( $item['a'], $allowed ); ?></p>
                    </div>
                </details>
            <?php endforeach; ?>
        </div>
    </section>
    <?php
}

/**
 * Emit FAQPage JSON-LD on /hcs.
 *
 * Mirrors the tc_render_person_schema() pattern in security-and-seo.php:
 * a distinct block in wp_head, separate from AIOSEO's graph (no @id
 * collision). The acceptedAnswer text is the visible answer with HTML
 * entities decoded and tags stripped, so schema == page (Google's rule).
 */
function tc_render_hcs_faq_schema() {

    if ( ! is_page( 'hcs' ) ) {
        return;
    }

    $items = tc_hcs_faq_items();
    if ( empty( $items ) ) {
        return;
    }

    $main = array();
    foreach ( $items as $item ) {
        $q = wp_strip_all_tags( html_entity_decode( $item['q'], ENT_QUOTES, 'UTF-8' ) );
        $a = wp_strip_all_tags( html_entity_decode( $item['a'], ENT_QUOTES, 'UTF-8' ) );
        $main[] = array(
            '@type'          => 'Question',
            'name'           => $q,
            'acceptedAnswer' => array(
                '@type' => 'Answer',
                'text'  => $a,
            ),
        );
    }

    $faq = array(
        '@context'   => 'https://schema.org',
        '@type'      => 'FAQPage',
        '@id'        => home_url( '/hcs/#faq' ),
        'mainEntity' => $main,
    );

    /**
     * Filter the HCS FAQPage schema before rendering.
     *
     * @param array $faq FAQPage schema as an associative array.
     */
    $faq = apply_filters( 'tc_hcs_faq_schema', $faq );

    echo "\n" . '<script type="application/ld+json" class="tc-hcs-faq-schema">';
    echo wp_json_encode( $faq, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE );
    echo '</script>' . "\n";
}
add_action( 'wp_head', 'tc_render_hcs_faq_schema', 30 );
