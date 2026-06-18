<?php
/**
 * Heritage line body — The Rycrofts.
 *
 * Required into the .heritage-line__body wrapper by the shared template
 * (inc/page-heritage-line.php). Edit prose here; chrome lives at the
 * template; hero metadata lives at page-rycrofts.php.
 *
 * Melanie's mother's line. The far-flung one: Leeds → the American Civil
 * War → the Kingdom of Hawai'i → a Peace River homestead that named a town.
 * Rewritten as a summary of the full long-read at /rycrofts/story.
 * Keeps the 2x2 grandparents-with-grandchildren grid + the shared headstone.
 */

if ( ! defined( 'ABSPATH' ) ) { exit; }
?>

<p>The Rycroft side is my wife Melanie's mother's family, and it carries the most far-flung story in the whole tree. The town of <strong>Rycroft, Alberta</strong> is named after her great-grandfather &mdash; but the family reached that Peace River homestead the long way round: out of industrial <strong>Leeds</strong>, through the <strong>American Civil War</strong>, by way of the <strong>Kingdom of Hawai&lsquo;i</strong>.</p>

<aside class="heritage-line__quote" aria-hidden="true">
    <p>From a Leeds back-street to a Honolulu soda works to a town on the Peace.</p>
</aside>

<p class="heritage-line__readmore">
    <a href="<?php echo esc_url( home_url( '/family/heritage/rycrofts/story' ) ); ?>">Read the full Rycroft story &mdash; Leeds to Hawai&lsquo;i to the Peace Country &rarr;</a>
</p>

<p>It begins with two men named Robert Henry Rycroft, father and son. The father, <strong>Robert Henry Rycroft Sr.</strong> (1843&ndash;1909), left Leeds at sixteen, rode about sixteen months in the U.S. Cavalry during the Civil War, and washed up in Honolulu &mdash; where he worked the Iron Works, pioneered coffee on the Big Island, founded the Fountain Soda Works, and left his name on <strong>Rycroft Street, Honolulu</strong> to this day. He married Elizabeth Campbell, a sister of the Treasurer of Hawai&lsquo;i.</p>

<p>His eldest son, also <strong>Robert Henry Rycroft</strong> (1872&ndash;1944), was born in Honolulu and ran the family soda business &mdash; then did the unlikeliest thing of all. In 1906 he met <strong>Helene Thommessen</strong>, a Norwegian sea-captain's orphaned daughter who had somehow made her way to the islands; they married in 1911 and honeymooned up through British Columbia, where they heard about free homestead land in the Peace Country. By 1912 they had registered two parcels near Spirit River and left the tropics for good.</p>

<p>In 1920, when the new district that split off from Spirit River needed a name, four pioneers &mdash; R.H. Rycroft, W.S.O. &ldquo;Billy&rdquo; English, H.E. &ldquo;Doc&rdquo; Calkin, and George Garnett &mdash; wrote their names on slips of paper, dropped them in a hat, and drew one out.</p>

<aside class="heritage-line__quote" aria-hidden="true">
    <p>The slip said Rycroft.</p>
</aside>

<p>R.H. hosted the first meeting of the Spirit River Rural Municipality in his home in January 1917, served as its secretary-treasurer, sat on the school board, and was a Justice of the Peace for many years. He died at Sexsmith in 1944 and is buried at Teepee Creek.</p>

<p>His son <strong>Eric Jarman Rycroft</strong> (1909&ndash;1993) was the Hawaiian-born one &mdash; a small child when the family came north, who grew up in the snow instead of the surf. He married <strong>Laureta Maude Janette Clark</strong> of Centralia, Washington, in 1933 at Teepee Creek, and farmed there the rest of his life.</p>

<p>Eric's son <strong>Sam</strong> &mdash; Samuel Eric John Rycroft (1935&ndash;2015) &mdash; married <strong>Bette Steinke</strong> in 1959. Bette (1942&ndash;2025) was a daughter of Henry and Martha Steinke, a German Lutheran family of the Sexsmith prairie. Sam and Bette raised four children: <strong>Lorne, Lana, Vance,</strong> and <strong>Clark</strong>.</p>

<!-- Grandparents-with-grandchildren grid. Papa Sam died after Patience
     was born but before Daniel and Faith, so there is one Papa Sam photo
     (with Patience) and three with Nana Bette (one per grandchild). The
     2x2 visual asymmetry carries that story without prose. -->
<?php if ( tc_user_is_family() ) : // OD-1: kids' photos gated to family ?>
<div class="heritage-line__grid heritage-line__grid--2x2">
    <figure class="heritage-line__figure">
        <img
            src="<?php echo esc_url( home_url( '/wp-content/uploads/2026/05/Papa-Sam-and-Patience.png' ) ); ?>"
            alt="<?php esc_attr_e( 'Papa Sam Rycroft holding newborn Patience', 'tc-ventures-child' ); ?>"
            loading="lazy"
        />
    </figure>
    <figure class="heritage-line__figure">
        <img
            src="<?php echo esc_url( home_url( '/wp-content/uploads/2026/05/Nana-and-Patience.png' ) ); ?>"
            alt="<?php esc_attr_e( 'Nana Bette Rycroft with infant Patience', 'tc-ventures-child' ); ?>"
            loading="lazy"
        />
    </figure>
    <figure class="heritage-line__figure">
        <img
            src="<?php echo esc_url( home_url( '/wp-content/uploads/2026/05/Nana-and-Daniel.png' ) ); ?>"
            alt="<?php esc_attr_e( 'Nana Bette Rycroft with infant Daniel', 'tc-ventures-child' ); ?>"
            loading="lazy"
        />
    </figure>
    <figure class="heritage-line__figure">
        <img
            src="<?php echo esc_url( home_url( '/wp-content/uploads/2026/05/Nana-and-Faith.png' ) ); ?>"
            alt="<?php esc_attr_e( 'Nana Bette Rycroft with infant Faith', 'tc-ventures-child' ); ?>"
            loading="lazy"
        />
    </figure>
</div>
<?php endif; ?>

<p>Sam and Bette's daughter <strong>Lana Lyn Rycroft</strong> (1961&ndash;2015) is Melanie's mother &mdash; she married Dan Steven Haiste, of the Yorkshire-and-prairie Haistes, and that is where I come into the picture. Lana died too young, the same hard year as her father Sam. Their youngest great-grandchild carries her name forward: <strong>Faith</strong>.</p>

<figure class="heritage-line__figure">
    <img
        src="<?php echo esc_url( home_url( '/wp-content/uploads/2026/04/sam-and-bette-tombstone.jpg' ) ); ?>"
        alt="<?php esc_attr_e( 'The shared headstone of Sam and Bette Rycroft', 'tc-ventures-child' ); ?>"
        loading="lazy"
    />
</figure>

<p>There is far more &mdash; the Leeds parents I am still trying to pin to a record, the Civil War regiment, Helene's road from a Larvik quay to a Honolulu harbour, the German village the Steinkes came from. The <a href="<?php echo esc_url( home_url( '/family/heritage/rycrofts/story' ) ); ?>">full story</a> tells what we have found, and is honest about what is still being chased.</p>
