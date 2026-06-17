<?php
/**
 * Page Template: Person Spoke — Daniel
 *
 * Auto-applied to the WP page with slug `daniel`. Page setup:
 *   - Title: "Daniel"
 *   - Slug: daniel
 *   - Parent: Family  →  /family/daniel/
 *
 * Same chrome as the other two per-person spokes; the
 * `.person-spoke--daniel` body class swaps in his green accent, with
 * a Daniel-only override: bigger headings, a richer rotating green
 * gradient, and a contrasting warm-flame brow (see style.css).
 *
 * Photos and home-video .mp4s both live in WP Media (2026/06), optimized
 * from the two 2026-06 media folders — same hosting model as the Faith
 * and Patience pages.
 */

get_header();
$di = home_url( '/wp-content/uploads/2026/06/' ); // Daniel photo base (WP Media)
?>

<main id="primary" class="site-main heritage-page heritage-spoke person-spoke person-spoke--daniel">

    <section class="page-hero">
        <div class="container">
            <a class="heritage-page__back" href="<?php echo esc_url( home_url( '/family' ) ); ?>">&larr; Family</a>
            <span class="page-hero__eyebrow">Son &mdash; middle</span>
            <h1 class="page-hero__title kinetic-text">Daniel</h1>
            <p class="page-hero__subtitle kinetic-fade">
                Charlie Brown &mdash; the quiet observer, the maker, the boy with a constellation of his own
            </p>
        </div>
    </section>

    <article class="heritage-lines">
        <div class="container container--narrow">

            <section class="heritage-line heritage-line--spoke heritage-line--person scroll-animate" id="daniel">
                <div class="heritage-line__body">

                    <figure class="heritage-line__figure heritage-line__figure--full">
                        <img
                            src="<?php echo esc_url( $di . 'the-elegant-son.jpg' ); ?>"
                            alt="<?php esc_attr_e( 'Daniel dressed up and looking sharp', 'tc-ventures-child' ); ?>"
                            loading="eager"
                        />
                        <figcaption>The elegant son.</figcaption>
                    </figure>

                    <p>Daniel arrived in the summer of 2015. Patience had made us a family; Daniel rounded us out, a boy and a girl, and just like that we were complete &mdash; the envy, I think, of every family that ended up with all boys or all girls or no kids at all. What amazed me was that there was still so much room left in my heart. I would have sworn it was full. It wasn't.</p>

                    <p>By the time he came along, Melanie and I were more than ready. I was between jobs and took a couple of months off after the birth so I could be the kind of help I hadn't managed to be when Patience arrived. He showed up just after Township 71 closed its doors &mdash; our whole pregnancy ran the length of that place's last season, the sort of thing you only notice looking back. The day we brought him home, both sets of grandparents were waiting &mdash; and my dad had surprised us and driven up too.</p>

                    <figure class="heritage-line__figure heritage-line__figure--small-right">
                        <img
                            src="<?php echo esc_url( $di . 'held-by-big-sister.jpg' ); ?>"
                            alt="<?php esc_attr_e( 'Baby Daniel held by his big sister Patience', 'tc-ventures-child' ); ?>"
                            loading="lazy"
                        />
                        <figcaption>Held by his big sister.</figcaption>
                    </figure>

                    <p>My first memory of him is holding him after his first weigh-in. Melanie was still a little loopy and being stitched up from the operation, so the first snuggle fell to me. He was so small, and so pink, and he had these enormous brown puppy eyes that I have never quite gotten over. Patience would hold him and it was, every single time, the cutest thing I had ever seen.</p>

                    <p>The early weeks were hard in the way nobody puts on a greeting card. Feeding a newborn turned out to be its own long battle, and Melanie fought it on fumes and sheer stubborn will. I was deep in my own pain by then and short on sleep, and between the two of us we were about as tired as two people can be. She had it worse. She always did, in those early days.</p>

                    <p>We named him Daniel for a few reasons at once. It was the name of my best friend as a boy; it was the name of Melanie's best friend from her own childhood; and it was her father's name. For whatever reason it had always sat in the back of my mind as the name I would use if I ever had a son &mdash; it was even on the shortlist for Patience, right up until we found out she was a she. His name carries his great-grandfather Eric in it, and one more name I intend to take to the grave.</p>

                    <figure class="heritage-line__figure heritage-line__figure--big-left">
                        <img
                            src="<?php echo esc_url( $di . 'first-birthday-charlie-brown.jpg' ); ?>"
                            alt="<?php esc_attr_e( 'Daniel on his first birthday', 'tc-ventures-child' ); ?>"
                            loading="lazy"
                        />
                        <figcaption>Happy first birthday, Charlie Brown.</figcaption>
                    </figure>

                    <p>He never crawled, not properly. He butt-scootched &mdash; sat bolt upright and dragged himself across the floor one leg at a time, like a little rook sliding across a chessboard, and he was quick, too, when there was a cup of milk at the far end of it. Milk was his fuel right up to about six &mdash; first thing every morning, in cups and sippy cups, never a bottle. I have never in my life met such a milk fiend.</p>

                    <figure class="heritage-line__figure">
                        <video
                            src="<?php echo esc_url( home_url( '/wp-content/uploads/2026/05/Daniels-Crawl.mp4' ) ); ?>"
                            controls
                            preload="metadata"
                            playsinline
                            aria-label="<?php esc_attr_e( 'Daniel butt-scootching as a baby', 'tc-ventures-child' ); ?>"
                        ></video>
                        <figcaption>The butt-scootch in action.</figcaption>
                    </figure>

                    <p>He arrived bald &mdash; gloriously, completely bald, with a head in the ninetieth percentile &mdash; and his uncle took one look and christened him Charlie Brown. The name stuck for a while. The head, he grew into.</p>

                    <?php /* Screen-reader-only h2 — see page-patience.php:
                             groups the h3 chapters so the outline doesn't
                             jump h1 → h3 (review-2 heading-order fix). */ ?>
                    <h2 class="screen-reader-text"><?php esc_html_e( 'Daniel, chapter by chapter', 'tc-ventures-child' ); ?></h2>

                    <h3>The quiet observer</h3>

                    <figure class="heritage-line__figure heritage-line__figure--left">
                        <img
                            src="<?php echo esc_url( $di . 'daniel-little.jpg' ); ?>"
                            alt="<?php esc_attr_e( 'Daniel as a little boy', 'tc-ventures-child' ); ?>"
                            loading="lazy"
                        />
                        <figcaption>The quiet one, taking it all in.</figcaption>
                    </figure>

                    <p>If you held me to three words: compassionate, creative, patient. If you held me to three more: shy, quiet, private. He won't be the one standing out in a crowd or working the room &mdash; he's the boy off to the side, quietly taking the whole thing in, working out how the world actually runs underneath what everyone is saying about it. It showed up early, in pre-K, when making friends and speaking up didn't come easily. It takes him a while to come out of his shell. But when he does &mdash; and he does &mdash; he is funny, sharp, adventurous, and fully alive.</p>

                    <p>He has three small moles set in a line, and they are Orion's Belt exactly &mdash; even the brightness is right, the middle one a little softer than its neighbours. I noticed it years ago and I've never been able to unsee it: a boy with a constellation, mad about space. I don't think that's a coincidence either.</p>

                    <p>He has a dry, oddball humour. He'll make a strange noise out of nowhere for no reason I can identify. But he's funniest when he's excited &mdash; when a story gets hold of him and he has to tell it <em>right now</em>, all in a rush, usually at bedtime when he's finally good and ready to talk. We call him a lot of things around the house: G, Bro, Brosky, Bra, Dude, Little Dude. When he's tired he goes whiny and slow, and I call it draggin' ass, which makes him groan, which is rather the point.</p>

                    <h3>The maker</h3>

                    <p>Here's the thing you most need to know about Daniel: he makes things. He's a genuine artist &mdash; drawings, cartoons, comics, stop-motion Lego animations he builds and films himself. Give him a free afternoon and no rules and he'll draw, or build something, or disappear into a game, and honestly any of the three is fine by me.</p>

                    <figure class="heritage-line__figure heritage-line__figure--big-left">
                        <img
                            src="<?php echo esc_url( $di . 'terry-fator.jpg' ); ?>"
                            alt="<?php esc_attr_e( 'Daniel at the Terry Fator show in Dawson Creek', 'tc-ventures-child' ); ?>"
                            loading="lazy"
                        />
                        <figcaption>Dawson Creek, to see the great Terry Fator &mdash; a real working puppeteer, doing the thing for a crowd.</figcaption>
                    </figure>

                    <p>But the puppets are the love of his life right now. He's gone deep on puppets and on Fugglers &mdash; those gleefully ugly things with the human teeth &mdash; and he makes his own Kermits from scratch, cutting and sewing and gluing until there's a whole cast of them. Ask him what he wants to be when he grows up and the answer, with no hesitation, is <em>puppeteer</em>. I love that. It's not a thing most ten-year-olds would even think to want, which is exactly why it is so completely him.</p>

                    <p>It started long before Kermit. Years ago he was already directing little home movies starring an Elmo &mdash; writing them, filming them, running the whole production himself. Watch a few seconds of one and you can see the puppeteer he's becoming, already in there.</p>

                    <figure class="heritage-line__figure">
                        <video
                            src="<?php echo esc_url( home_url( '/wp-content/uploads/2026/06/elmo-video-1.mp4' ) ); ?>"
                            controls
                            preload="metadata"
                            playsinline
                            aria-label="<?php esc_attr_e( 'Daniel\'s home movie with Elmo', 'tc-ventures-child' ); ?>"
                        ></video>
                        <figcaption>One of his Elmo productions, before Kermit came along.</figcaption>
                    </figure>

                    <p>This spring he spent two or three weekends building what he calls the Man Hut with his crafty uncle JP &mdash; a fort cobbled together out of old pallets and a tired girly playhouse we had kicking around. We spent the next weekend painting it. Then it went cool and rainy, which the land needed and the boy did not, and the Man Hut has been waiting out the weather ever since. It'll get its summer.</p>

                    <figure class="heritage-line__figure heritage-line__figure--small-right">
                        <img
                            src="<?php echo esc_url( $di . 'reading-together.jpg' ); ?>"
                            alt="<?php esc_attr_e( 'Thomas reading to a young Daniel', 'tc-ventures-child' ); ?>"
                            loading="lazy"
                        />
                        <figcaption>I miss reading to you, son.</figcaption>
                    </figure>

                    <p>His reading is its own kind of funny: Garfield, and then, with a perfectly straight face, the dictionary or the thesaurus. He likes words the way he likes Lego &mdash; as parts you can pull out and rearrange.</p>

                    <h3>Bacon, metal, and a perfect day</h3>

                    <figure class="heritage-line__figure heritage-line__figure--big-left">
                        <img
                            src="<?php echo esc_url( $di . 'bubble-party.jpg' ); ?>"
                            alt="<?php esc_attr_e( 'Daniel at a bubble party at the neighbours', 'tc-ventures-child' ); ?>"
                            loading="lazy"
                        />
                        <figcaption>A bubble party at the neighbours' &mdash; thanks, Graham and Cate.</figcaption>
                    </figure>

                    <p>His perfect day is outside with his best friend &mdash; and the two of them have secret knocks, so when the right rhythm lands on the door, Daniel lights up and bolts to answer it. There'd be a fire in it, and s'mores, and hotdogs, and quite possibly a bubble party. He's an outdoors kid eight months of the year and a sensible indoors one for the other four, this being Alberta.</p>

                    <figure class="heritage-line__figure heritage-line__figure--pair">
                        <img
                            src="<?php echo esc_url( $di . 'daniel-lucas-upright.jpg' ); ?>"
                            alt="<?php esc_attr_e( 'Daniel with his dog Lucas', 'tc-ventures-child' ); ?>"
                            loading="eager"
                        />
                        <img
                            src="<?php echo esc_url( $di . 'daniel-and-allister.jpg' ); ?>"
                            alt="<?php esc_attr_e( 'Daniel with his lizard Allister', 'tc-ventures-child' ); ?>"
                            loading="eager"
                        />
                        <figcaption>Two of his great loves: Lucas the dog, and Allister the lizard.</figcaption>
                    </figure>

                    <p>Food: bacon, first and forever &mdash; if Daniel's feeling low, bacon is what the doctor orders. After that it's fried chicken, wings, and a good steak. He will not, under any circumstances, eat a taco. The music has gotten heavier as he's gotten older &mdash; these days it's metal, Slipknot lately, though there's still room for Ozzy and Michael Jackson, and somewhere back there is a five-year-old who loved Imagine Dragons. His colour is green. His animal is the dog. His movie is <em>Real Steel</em> &mdash; boxing robots, which tracks, because for a good while boxing was his thing too, and he was good at it.</p>

                    <figure class="heritage-line__figure">
                        <video
                            src="<?php echo esc_url( home_url( '/wp-content/uploads/2026/06/rocking-out-to-acdc.mp4' ) ); ?>"
                            controls
                            preload="metadata"
                            playsinline
                            aria-label="<?php esc_attr_e( 'Daniel rocking out to AC/DC', 'tc-ventures-child' ); ?>"
                        ></video>
                        <figcaption>Rocking out to AC/DC. (Thunderstruck, if this page had a sound.)</figcaption>
                    </figure>

                    <p>The best place he's ever been is British Columbia &mdash; the mountains and lakes and valleys of it. The way we travel is the way he likes it: stop at every lake, pull over for every view, take the long road on purpose.</p>

                    <h3>Brave in the ways that count</h3>

                    <p>Daniel feels things deeply &mdash; he gets that from his mom, the two of them welling up at the sad part of the same movie while Patience and I trade looks across the room. He says <em>I love you</em> easily, he's a hugger, and when he's hurting the thing that fixes it is a snuggle, plain and simple. None of that is weakness. I've watched him prove it.</p>

                    <p>When I had to have my neck fused &mdash; a big, frightening operation, the kind that shuts most kids down &mdash; Daniel was steady. He didn't panic. He asked questions, he gave hugs, he stayed close. He has an uncommon gift for being near pain without flinching from it, and he carries my hard days more gently than I manage to carry them myself.</p>

                    <p>He's grown up alongside people whose minds run fast and switch channels without warning, and he meets them with patience and grace &mdash; rolls with it, changes the game on a dime, never once makes anyone feel like a problem. That's a rare thing in a grown adult, let alone a boy his age.</p>

                    <h3>Brother, middle, peacemaker</h3>

                    <figure class="heritage-line__figure heritage-line__figure--left">
                        <img
                            src="<?php echo esc_url( $di . 'helping-with-chores.jpg' ); ?>"
                            alt="<?php esc_attr_e( 'Daniel helping with chores in the yard', 'tc-ventures-child' ); ?>"
                            loading="lazy"
                        />
                        <figcaption>Already pitching in with the chores around the yard.</figcaption>
                    </figure>

                    <p>Daniel is our middle child and our only boy, tucked between two sisters about twenty-one months on either side &mdash; which, as it happens, is almost exactly the spacing my brothers and I grew up with. He's the helper and the peacemaker of the house. He does the dishes, he pitches in without being asked, and when the temperature rises between his sisters he's usually the one who brings it back down.</p>

                    <p>He and Patience are close &mdash; Roblox together, fishing together, a game of catch &mdash; and the only thing she does that truly gets under his skin is vanishing into her room for hours. I've also caught her quietly coaching him on his hair and his clothes, fixing him up before school, and watching that happen does something to my soul: if they look after each other like that now, I have to believe they'll be alright when they're grown and it really counts.</p>

                    <figure class="heritage-line__figure heritage-line__figure--small-right">
                        <img
                            src="<?php echo esc_url( $di . 'daniel-and-poppy.jpg' ); ?>"
                            alt="<?php esc_attr_e( 'Daniel with Princess Poppy', 'tc-ventures-child' ); ?>"
                            loading="lazy"
                        />
                        <figcaption>Daniel with Princess Poppy.</figcaption>
                    </figure>

                    <p>With Faith he's a good big brother &mdash; sometimes reluctantly, the way big brothers are, but he'll fold her into whatever he and his buddy are building, and he is fiercely protective of her. The best of it happens when I'm not looking: the three of them making a meal together in the kitchen, certain I can't hear, while I sit just out of sight and let the whole thing play out. Those are the afternoons I'd keep, if I could only keep a few.</p>

                    <figure class="heritage-line__figure heritage-line__figure--right">
                        <img
                            src="<?php echo esc_url( $di . 'selfie-with-mom.jpg' ); ?>"
                            alt="<?php esc_attr_e( 'Daniel taking a selfie with his mom', 'tc-ventures-child' ); ?>"
                            loading="lazy"
                        />
                        <figcaption>A selfie with Mom.</figcaption>
                    </figure>

                    <p>He calls me <em>Daaaad</em>, with the extra As, and he calls his mom Mom. He and his mom have their things &mdash; a run to Subway, a crime drama on the couch. He and I have ours &mdash; Lego, the small "blue jobs" around the house, and always the puppets. He is close with his Papa Dan, who he adores, and with his Gramzie. And Christmas is his season: the food, the time off school, and that troublesome Elf who turns up every night all month &mdash; who I'm told is online now too, and who I would very much like to leave me alone.</p>

                    <p>For one of his birthdays we rented a place called the Sand Zone and invited his entire class &mdash; and nearly all of them came. It turns out the quiet kid is a popular one. It didn't surprise me. People can feel his heart from across a room, even when he isn't saying a word.</p>

                    <h3>Who he's becoming</h3>

                    <figure class="heritage-line__figure heritage-line__figure--right">
                        <img
                            src="<?php echo esc_url( $di . 'off-to-school-2025.jpg' ); ?>"
                            alt="<?php esc_attr_e( 'Daniel heading off to school in 2025', 'tc-ventures-child' ); ?>"
                            loading="lazy"
                        />
                        <figcaption>Off to school, 2025.</figcaption>
                    </figure>

                    <p>He's in grade five now, and he likes it there. His subject is math &mdash; he's proud of his division, and rightly so &mdash; and every year he comes home with something for teamwork or for STEM. His report cards do the same quiet thing he does: they just keep getting better, a little at a time, no fuss. He's pulled toward science and space, with a side interest in history.</p>

                    <p>Right now he's between things &mdash; he recently set boxing down, and he's taking the time to figure out what's next, which I think is exactly the right move at ten. I don't want him to feel he has to be anything. I want him to find what he actually loves and go at it. He's becoming a smart, kind, adventurous kid, and the soft, curious centre of him &mdash; the part that wants to know how the world really works &mdash; is the part I would protect with everything I have.</p>

                    <h3>A letter to Daniel</h3>

                    <p>Dear Daniel,</p>

                    <p>I'm sure you already know I love you &mdash; but I don't think you'll really know, not all the way down, until you have a family of your own. So let me put it here, where it will keep.</p>

                    <p>I am proud of you. I'm proud of how you handle your sisters and the ordinary weather of a kid's life &mdash; friendships, school, home, a houseful of pets &mdash; none of which is as easy as grown-ups pretend to remember. You do it like water off a duck's back. Keep that. And keep the warm, caring soul you've got, because it's rarer in the world than it should be, and the world doesn't always know what to do with the gentle ones. It can be cold, and it can be careless, and now and then it will put something in your way that isn't fair. Guard that softness anyway. I trust you to know right from wrong, and to see straight through the nonsense when it comes dressed up as something important.</p>

                    <p>You'll be around thirty when you read this, and the truth is I have no idea what the world looks like from there, or what I'd tell you about it. I can only tell you what I see now. I think by then you'll have found the love of your life &mdash; and I'd put money on her being a lot like you: wondrous, curious, up for the adventure.</p>

                    <p>You make it all look effortless, buddy. Keep going, keep gaining confidence, and never lose the part of you that makes things &mdash; puppets, comics, forts out of old pallets, whatever it is by then.</p>

                    <p>I love you. I always will.</p>

                    <p>Dad</p>

                </div>
            </section>

            <section class="kid-videos" aria-label="<?php esc_attr_e( 'Home videos', 'tc-ventures-child' ); ?>">
                <h2 class="kid-videos__title">Home videos &mdash; watch if you like</h2>
                <?php /* Mixed layout: two portrait clips flank a stacked pair of
                         landscape clips, so the row lines up instead of stair-stepping. */ ?>
                <div class="kid-videos__grid kid-videos__grid--mixed">
                    <figure class="kid-videos__item">
                        <video src="<?php echo esc_url( home_url( '/wp-content/uploads/2026/06/boxing-tooth-pick.mp4' ) ); ?>" controls preload="metadata" playsinline></video>
                        <figcaption>Boxing with &ldquo;Tooth Pick.&rdquo;</figcaption>
                    </figure>
                    <div class="kid-videos__stack">
                        <figure class="kid-videos__item">
                            <video src="<?php echo esc_url( home_url( '/wp-content/uploads/2026/06/boxing-instructors-beatdown.mp4' ) ); ?>" controls preload="metadata" playsinline></video>
                            <figcaption>The boys laying the beat-down on their boxing instructors.</figcaption>
                        </figure>
                        <figure class="kid-videos__item">
                            <video src="<?php echo esc_url( home_url( '/wp-content/uploads/2026/06/elmo-video-2.mp4' ) ); ?>" controls preload="metadata" playsinline></video>
                            <figcaption>Another of Daniel's Elmo productions.</figcaption>
                        </figure>
                    </div>
                    <figure class="kid-videos__item">
                        <video src="<?php echo esc_url( home_url( '/wp-content/uploads/2026/06/the-ten-dollar-train.mp4' ) ); ?>" controls preload="metadata" playsinline></video>
                        <figcaption>The ten-dollar marketplace train that comes out every year &mdash; it reminded me of being a kid.</figcaption>
                    </figure>
                </div>
            </section>

            <?php
            // Book-quality PDF of this story — renders only once
            // keepsake-daniel.pdf is in Media. See inc/keepsake-download.php.
            if ( function_exists( 'tc_render_keepsake_download' ) ) {
                tc_render_keepsake_download( 'daniel', __( "Download Daniel's story as a keepsake PDF", 'tc-ventures-child' ) );
            }
            ?>

            <?php tc_render_family_links( 'daniel' ); ?>

        </div>
    </article>

</main>

<?php get_footer(); ?>
