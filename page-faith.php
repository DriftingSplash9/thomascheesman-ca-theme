<?php
/**
 * Page Template: Person Spoke — Faith
 *
 * Auto-applied to the WP page with slug `faith`. Page setup:
 *   - Title: "Faith"
 *   - Slug: faith
 *   - Parent: Family  →  /family/faith/
 *
 * Same chrome as the other two per-person spokes; the
 * `.person-spoke--faith` body class swaps in her pink accent.
 */

get_header(); ?>

<main id="primary" class="site-main heritage-page heritage-spoke person-spoke person-spoke--faith">

    <section class="page-hero">
        <div class="container">
            <a class="heritage-page__back" href="<?php echo esc_url( home_url( '/family' ) ); ?>">&larr; Family</a>
            <span class="page-hero__eyebrow">Daughter &mdash; youngest</span>
            <h1 class="page-hero__title kinetic-text">Faith</h1>
            <p class="page-hero__subtitle kinetic-fade">
                <?php if ( tc_user_is_family() ) : ?>
                    Came to me in a dream at 3 a.m.
                <?php else : ?>
                    A page kept for family.
                <?php endif; ?>
            </p>
        </div>
    </section>

    <article class="heritage-lines">
        <div class="container container--narrow">

        <?php if ( tc_user_is_family() ) : // OD-1/PRIV-1: whole page gated to family ?>

            <section class="heritage-line heritage-line--spoke heritage-line--person scroll-animate" id="faith">
                <div class="heritage-line__body">

                    <figure class="heritage-line__figure heritage-line__figure--full">
                        <img
                            src="<?php echo esc_url( home_url( '/wp-content/uploads/2024/10/20180524_163145-scaled.jpg' ) ); ?>"
                            alt="<?php esc_attr_e( 'Close-up of Faith as a baby with big, two-toned blue eyes', 'tc-ventures-child' ); ?>"
                            loading="eager"
                        />
                        <figcaption>Those eyes. Two-toned &mdash; and on a bright afternoon the blue really comes up.</figcaption>
                    </figure>

                    <p>Everybody starts with the eyes. You can't help it. They're two different colours, and on a bright day the blue comes up like something switched on from the inside &mdash; I've lost whole minutes to those eyes, and I'd lose them again. But I'm getting ahead of myself. The eyes came later. First there was a name, and before the name there was a dream.</p>

                    <p>Faith arrived in the spring of 2017 &mdash; the last full stop on our family. We'd chewed over names for months and I had nothing; Melanie had all the ideas and I had a blank page. Then the name turned up in a dream, of all places. I woke at three in the morning, shook Melanie half-awake, and asked her what she thought of &ldquo;Faith.&rdquo; She mumbled &ldquo;I like it&rdquo; and was gone again before I'd finished the sentence. We came within an inch of calling her Charlotte. I'm glad we didn't, and here's why.</p>

                    <figure class="heritage-line__figure heritage-line__figure--small-right">
                        <img
                            src="<?php echo esc_url( home_url( '/wp-content/uploads/2026/05/P4010184-scaled.jpg' ) ); ?>"
                            alt="<?php esc_attr_e( 'Newborn Faith safe in her mother\'s arms', 'tc-ventures-child' ); ?>"
                            loading="lazy"
                        />
                        <figcaption>Safe with Mom again.</figcaption>
                    </figure>

                    <p>Not long after she was born there was a moment &mdash; the kind that empties the air out of a room &mdash; when her breathing needed help, and the place filled with swift, skilled hands. I have never forgotten the terror of it, or the relief that came after, or the sight of her mother &mdash; upright on sheer will a day after major surgery &mdash; wheeling herself in to be there for it, scanning the room like a hawk. We looked at each other and didn't say a word, because there was nothing to do and nothing to say &mdash; only to have faith that she'd be alright. She was. She came back to us breathing and already a little furious about the whole business, and she has been going at full tilt ever since.</p>

                    <?php /* Screen-reader-only h2 — see page-patience.php:
                             groups the h3 chapters so the outline doesn't
                             jump h1 → h3 (review-2 heading-order fix). */ ?>
                    <h2 class="screen-reader-text"><?php esc_html_e( 'Faith, chapter by chapter', 'tc-ventures-child' ); ?></h2>

                    <h3>A carefree wandering fireball</h3>

                    <figure class="heritage-line__figure heritage-line__figure--left">
                        <img
                            src="<?php echo esc_url( home_url( '/wp-content/uploads/2026/05/20171025_093702.jpg' ) ); ?>"
                            alt="<?php esc_attr_e( 'Faith at six months old, dressed up for a photoshoot', 'tc-ventures-child' ); ?>"
                            loading="lazy"
                        />
                        <figcaption>Six months old, and already particular about the outfit.</figcaption>
                    </figure>

                    <p>Carefree, wandering, fireball &mdash; three words, if you held me to it. I have met a lot of people, and not one of them with Faith's engine. She runs flat out from the moment her feet hit the floor, and I keep up the way you keep up with weather &mdash; mostly by watching where it's headed.</p>

                    <figure class="heritage-line__figure heritage-line__figure--small-right">
                        <img
                            src="<?php echo esc_url( home_url( '/wp-content/uploads/2026/05/034.jpeg' ) ); ?>"
                            alt="<?php esc_attr_e( 'Faith at her first-birthday cake-smash photoshoot', 'tc-ventures-child' ); ?>"
                            loading="lazy"
                        />
                        <figcaption>The cake-smash shoot for her first birthday.</figcaption>
                    </figure>

                    <p>And she runs on the bright side &mdash; here's the kind of thing I mean. One afternoon we decided we were above following a recipe and would write our own, and out came a batch of chocolate-chip macchiato protein cookies &mdash; her idea, more or less. The dough came out thin, so we put more flour in. Still thin, so a little more. We added a bit of this and a bit of that with no theory behind any of it, ate a frankly unsafe amount of the batter, and they turned out&hellip; good, actually. That batch is nearly gone now. The next one will be better. It is always going to be better &mdash; that's the part I want to keep.</p>

                    <figure class="heritage-line__figure heritage-line__figure--big-left">
                        <img
                            src="<?php echo esc_url( home_url( '/wp-content/uploads/2026/05/20180319_075032.jpg' ) ); ?>"
                            alt="<?php esc_attr_e( "Faith on her first birthday in a tutu", 'tc-ventures-child' ); ?>"
                            loading="lazy"
                        />
                        <figcaption>Our first birthday. The tutu made the day &mdash; and I think she agreed.</figcaption>
                    </figure>

                    <p>People will tell you she's bright and leave it at that, as if that settles it. It doesn't. She got out ahead in math in the lockdown years &mdash; fell hard for Numberblocks, hard enough that we ended up with several sets and Melanie sewing the numbers one to ten out of felt &mdash; and she's doing grade-five math in grade three without much fuss. But the math is only the doorway. What she's really after is bigness. Scale. She'll rattle off the planets in order and most of their moons, the belts, a handful of stars, the black holes; she wants to know how many Earths you could pour into the sun, how one galaxy stacks against another, what the biggest thing is and then what's bigger than that. A small girl with an enormous appetite for the size of the universe &mdash; and if she keeps her eyes up there, I have not one doubt she could help build the thing that flies into it. Her name is Faith and she is mad for the cosmos, and I don't think those two facts are unrelated.</p>

                    <figure class="heritage-line__figure heritage-line__figure--center">
                        <img
                            src="<?php echo esc_url( home_url( '/wp-content/uploads/2026/05/IMG_2471.jpg' ) ); ?>"
                            alt="<?php esc_attr_e( 'Faith watching fireworks', 'tc-ventures-child' ); ?>"
                            loading="lazy"
                        />
                        <figcaption>Fireworks. There's something about peaceful explosions &mdash; all that colour and light.</figcaption>
                    </figure>

                    <h3>Fridays, ducks, and the rules of the front seat</h3>

                    <figure class="heritage-line__figure heritage-line__figure--right">
                        <img
                            src="<?php echo esc_url( home_url( '/wp-content/uploads/2026/05/Thomas-LG-g7-ThinQ-20200203-3498.jpg' ) ); ?>"
                            alt="<?php esc_attr_e( 'Faith with a slushy in winter', 'tc-ventures-child' ); ?>"
                            loading="lazy"
                        />
                        <figcaption>Slushies in winter. Naturally.</figcaption>
                    </figure>

                    <p>Every Friday after school we go to the Circle-K for a slushy, and I do mean every Friday &mdash; minus forty doesn't get you out of it. She'd mix all the flavours into one cup if she could, and she more or less does, within the law: the food-colouring ones are out, because Allura Red and the blue turn her dial all the way up, so it's Coke and Pepsi and Dr Pepper and root beer, caramel colour being a friend of ours. These are the things you end up an expert in.</p>

                    <figure class="heritage-line__figure heritage-line__figure--big-left">
                        <img
                            src="<?php echo esc_url( home_url( '/wp-content/uploads/2026/05/Thomas-LG-g7-ThinQ-20200203-2061.jpg' ) ); ?>"
                            alt="<?php esc_attr_e( "Faith dozing on a boat on the Shuswap", 'tc-ventures-child' ); ?>"
                            loading="lazy"
                        />
                        <figcaption>Vacation siesta on Uncle Buck's boat, out on the Shuswap.</figcaption>
                    </figure>

                    <p>There's a front-seat system in the truck now, too, and it runs itself &mdash; the kids take turns, no refereeing required, and when all three are aboard Faith rides in the back where she's safest. I marvel at this. My brothers and I damn near came to blows over shotgun, and my poor mother spent half her driving years as a judge.</p>

                    <p>The duck collection rides shotgun on the dash, skating clean across it on every corner &mdash; small ones, a couple of big ones, gathered over the past year &mdash; which has done more for my driving than any instructor ever managed. Take a corner too sharp and they slide to the far end; touch the gas and they come back into my lap. The kids get carsick from my driving, so the ducks and I are working on it together.</p>

                    <h3>Soft in the middle</h3>

                    <figure class="heritage-line__figure heritage-line__figure--right">
                        <img
                            src="<?php echo esc_url( home_url( '/wp-content/uploads/2026/05/20190504_133340.jpg' ) ); ?>"
                            alt="<?php esc_attr_e( 'Faith napping curled up with a cat', 'tc-ventures-child' ); ?>"
                            loading="lazy"
                        />
                        <figcaption>Naptime with Bubbalou.</figcaption>
                    </figure>

                    <p>For all that motor, there's a tender thing underneath that feels more than she'll ever tell you, and the animals seem to clock it before the rest of us do. She'll torment a cat all afternoon &mdash; then the moment she's asleep, the same cat folds against her like she's the gentlest soul alive. I can't explain it. Maybe they're onto something.</p>

                    <p>You can watch the weather change in her. The meltdowns don't come from nowhere; they come when the day tips pessimistic on her &mdash; when something isn't fair, when the answer is no, when the cost or the timing or the sheer energy of a thing lands the wrong way. Catch her early and turn her back toward the bright side, and the storm just&hellip; doesn't arrive. It's a knack I'm still learning.</p>

                    <figure class="heritage-line__figure heritage-line__figure--pair">
                        <img
                            src="<?php echo esc_url( home_url( '/wp-content/uploads/2026/05/IMG_1581.jpg' ) ); ?>"
                            alt="<?php esc_attr_e( 'Faith starting across the rock islands', 'tc-ventures-child' ); ?>"
                            loading="eager"
                        />
                        <img
                            src="<?php echo esc_url( home_url( '/wp-content/uploads/2026/05/IMG_1575.jpg' ) ); ?>"
                            alt="<?php esc_attr_e( 'Faith reaching the big island rock at the end', 'tc-ventures-child' ); ?>"
                            loading="eager"
                        />
                        <figcaption>Made it! Mom and Patience helped her hop across the rock islands to the big one at the end.</figcaption>
                    </figure>

                    <p>And she'll flip in a heartbeat. She used to climb out along the ropes at the playground and get further than her nerve could carry her, and freeze, and I'd go up and bring her down &mdash; and before her feet had properly found the ground she was off sprinting for the next thing to climb. That's the whole of her, really. She'd have thrown herself off the high board into the deep end the first chance she got, and would have been fine; the lifeguards disagreed, and we'll wait until she's bigger. Some days a crowd terrifies her. Some days she <em>is</em> the crowd. Either way she's got me.</p>

                    <figure class="heritage-line__figure heritage-line__figure--left">
                        <img
                            src="<?php echo esc_url( home_url( '/wp-content/uploads/2026/05/IMG_3756.jpg' ) ); ?>"
                            alt="<?php esc_attr_e( 'Faith at swimming lessons', 'tc-ventures-child' ); ?>"
                            loading="lazy"
                        />
                        <figcaption>Swimming lessons at Eastlink &mdash; practising to cross the pool on her own. No jacket, no stopping.</figcaption>
                    </figure>

                    <figure class="heritage-line__figure heritage-line__figure--small-right">
                        <img
                            src="<?php echo esc_url( home_url( '/wp-content/uploads/2026/05/IMG_1237.jpg' ) ); ?>"
                            alt="<?php esc_attr_e( 'Faith in a tiny toddler bed', 'tc-ventures-child' ); ?>"
                            loading="lazy"
                        />
                        <figcaption>GO TO SLEEP! That itty-bitty bed was Patience's first big-girl bed, once upon a time.</figcaption>
                    </figure>

                    <p>The laugh deserves a mention, though I'll have to dig up a video to do it justice. There was a version of it when she was small that undid all of us &mdash; and being Faith, she noticed it undid us, and started deploying it on purpose, and ran it clean into the ground until the magic wore off. That's her in miniature: hand her your delight and she'll spend it all at once. I wouldn't change it. When she finally runs down at night &mdash; she'll fire ten thousand questions into the dark before she goes; the CIA could take notes &mdash; she burrows in for warmth, and it settles something in me I didn't know was unsettled.</p>

                    <h3>School, and the long game</h3>

                    <p>School is where Faith works hardest, and not at the part you'd guess. The rules and the order she can do; it's the social side that asks the most of her. But the tide has been coming in this year &mdash; a few birthday invitations have landed, and most mornings she's out front of the school early, running flat out in a game of tag before the bell. The speed and free will of Faith can be intimidating to the most confident boys in grade three, and I confess I love every bit of that.</p>

                    <p>I don't worry about where she ends up. I imagine Faith growing into someone very successful, and here is why: once she finds the thing that's worth her time &mdash; and she will &mdash; watch out. She will not stop until she gets what she wants.</p>

                    <h3>What she's taught me</h3>

                    <figure class="heritage-line__figure heritage-line__figure--left">
                        <img
                            src="<?php echo esc_url( home_url( '/wp-content/uploads/2026/05/IMG_0568-scaled.jpg' ) ); ?>"
                            alt="<?php esc_attr_e( "Faith helping her dad", 'tc-ventures-child' ); ?>"
                            loading="lazy"
                        />
                        <figcaption>Daddy's little helper.</figcaption>
                    </figure>

                    <p>More than she knows. Faith took my own lifelong project &mdash; keeping myself level &mdash; and turned it up to eleven, because she is a mirror. If I flare, she flares, over nothing at all. So she has quietly made me learn to be the calm I'd like her to copy, which is the hardest and most worthwhile homework I've ever been handed.</p>

                    <figure class="heritage-line__figure heritage-line__figure--center">
                        <img
                            src="<?php echo esc_url( home_url( '/wp-content/uploads/2026/05/69636072_10157708906948708_2479287210398973952_n-2.jpg' ) ); ?>"
                            alt="<?php esc_attr_e( 'A favourite candid photo of Faith', 'tc-ventures-child' ); ?>"
                            loading="lazy"
                        />
                        <figcaption>I love this one. I don't know why we never printed it &mdash; don't be surprised if it shows up on a wall near you.</figcaption>
                    </figure>

                    <p>She's the spitting image of her mum &mdash; lay their baby photos side by side and you'd swear they were the same child. She's got her own arts, mind you. She'll chant &ldquo;six-seven&rdquo; around the house purely because she knows it needles her big sister &mdash; sixty-seven has been Faith's number for as long as I can remember, and there's a 67 sticker on my desk I'm keeping for her. She and Daniel tear around together like a pair of weather systems, and she and Patience are still negotiating the ancient treaty of sharing a kitchen before school. I hope they find their way to being friends. I think, given time, they will.</p>

                    <h3>A letter for later</h3>

                    <figure class="heritage-line__figure heritage-line__figure--right">
                        <img
                            src="<?php echo esc_url( home_url( '/wp-content/uploads/2026/05/IMG_1978-scaled.jpg' ) ); ?>"
                            alt="<?php esc_attr_e( 'Faith with her pet hamster Geoffrey', 'tc-ventures-child' ); ?>"
                            loading="lazy"
                        />
                        <figcaption>Faith and her hamster, Geoffrey &mdash; I think that's the spelling; sorry, Faith.</figcaption>
                    </figure>

                    <p>Hi Faith. I want you to know how much I love you, and I can't &mdash; I genuinely can't put a number to it, and you of all people should appreciate that there simply isn't one big enough. You'll have to take my word for it.</p>

                    <figure class="heritage-line__figure heritage-line__figure--left">
                        <img
                            src="<?php echo esc_url( home_url( '/wp-content/uploads/2026/05/IMG_9503-scaled.jpg' ) ); ?>"
                            alt="<?php esc_attr_e( 'Faith on her seventh birthday', 'tc-ventures-child' ); ?>"
                            loading="lazy"
                        />
                        <figcaption>Seventh-birthday vibes.</figcaption>
                    </figure>

                    <p>By the time you read this you're grown, off figuring out the world, and I'd put money on you being at a university or already out the far side of one, doing something that scares me a little &mdash; building a rocket, maybe, or standing somewhere up past the moons you could always name.</p>

                    <p>A lot can happen in sixteen years. Have you still got the blue eyes and the blonde hair? You certainly didn't get those from me. I'll bet there are a couple of cats. I hope you and your sister are close, or close enough &mdash; family is a lot, and you won't fully understand that until you've made one of your own, but when you do you'll find yourself wanting them near. Marry whoever makes you laugh the way you laughed when you were small.</p>

                    <p>And promise me one thing, just the one: not a chef. Don't be one, and don't date one. Love always, Dad.</p>

                </div>
            </section>

            <p class="faith-game-cta-wrap">
                <a class="faith-game-cta" href="<?php echo esc_url( home_url( '/capybara' ) ); ?>">
                    <span aria-hidden="true">🐹</span>
                    <?php esc_html_e( "Play Faith's CopyCatCapybara Clicker", 'tc-ventures-child' ); ?>
                    <span aria-hidden="true">&rarr;</span>
                </a>
            </p>

            <?php
            // Book-quality PDF of this story — GATED to family (it contains the
            // kids' photos). Renders only for signed-in family AND once
            // keepsake-faith.pdf is in Media. See inc/keepsake-download.php.
            if ( tc_user_is_family() && function_exists( 'tc_render_keepsake_download' ) ) {
                tc_render_keepsake_download( 'faith', __( "Download Faith's story as a keepsake PDF", 'tc-ventures-child' ) );
            }
            ?>

            <?php tc_render_family_links( 'faith' ); ?>

            <?php if ( tc_user_is_family() ) : ?>
                <?php
                // Photo wall — Faith. GATED to signed-in family
                // (inc/family-login.php). 219 photos from inc/gallery-faith.php;
                // restored from git 629dd99 behind the family login. The 3 photos
                // tagged 2016 are pre-natal, folded into Year One.
                $faith_items = require get_stylesheet_directory() . '/inc/gallery-faith.php';
                tc_render_photo_gallery(
                    $faith_items,
                    array(
                        array( 'label' => 'Year One — 2016–2017',     'years' => array( 2016, 2017 ) ),
                        array( 'label' => 'Toddler Years — 2018',     'years' => array( 2018 ) ),
                        array( 'label' => 'Little Person — 2019–2020', 'years' => array( 2019, 2020 ) ),
                        array( 'label' => 'The Pandemic Years — 2021–2022', 'years' => array( 2021, 2022 ) ),
                        array( 'label' => 'Schoolgirl Begins — 2023–2024', 'years' => array( 2023, 2024 ) ),
                        array( 'label' => 'Today — 2025–2026',         'years' => array( 2025, 2026 ) ),
                    ),
                    'Faith'
                );
                ?>
            <?php else : ?>
                <?php tc_render_family_gate_notice( 'Faith' ); ?>
            <?php endif; ?>

            <!-- Home videos — playable .mp4 uploads (WP media, 2026/06).
                 Re-encoded from .mov (HEVC/VP9) to web-optimized H.264 +
                 faststart so they play in desktop Chrome, not just iOS. -->
            <section class="kid-videos" aria-label="<?php esc_attr_e( 'Home videos', 'tc-ventures-child' ); ?>">
                <h2 class="kid-videos__title">Home videos &mdash; watch if you like</h2>
                <div class="kid-videos__grid">
                    <figure class="kid-videos__item">
                        <video src="<?php echo esc_url( home_url( '/wp-content/uploads/2026/06/paw-patrol-live.mp4' ) ); ?>" controls preload="metadata" playsinline></video>
                        <figcaption>You at Paw Patrol Live.</figcaption>
                    </figure>
                    <figure class="kid-videos__item">
                        <video src="<?php echo esc_url( home_url( '/wp-content/uploads/2026/06/faith-puddle-jumper.mp4' ) ); ?>" controls preload="metadata" playsinline></video>
                        <figcaption>Puddle jumper &mdash; you never met a puddle you didn't like.</figcaption>
                    </figure>
                    <figure class="kid-videos__item">
                        <video src="<?php echo esc_url( home_url( '/wp-content/uploads/2026/06/workout-with-mom.mp4' ) ); ?>" controls preload="metadata" playsinline></video>
                        <figcaption>Working out with Mom, showing off those muscles.</figcaption>
                    </figure>
                </div>
            </section>

        <?php else : // OD-1/PRIV-1 page gate ?>

            <?php tc_render_family_gate_notice( 'Faith', 'page' ); ?>

        <?php endif; ?>

        </div>
    </article>

</main>

<?php get_footer(); ?>
