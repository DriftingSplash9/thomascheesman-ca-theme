<?php
/**
 * Page Template: Thomas — "Thomasito" (the first-person long-read)
 *
 * Auto-applied to the WP page with slug `thomas`. Page setup:
 *   - Title:  "Thomas"
 *   - Slug:   thomas
 *   - Parent: Family  →  /family/thomas/
 *
 * This is Thomas's own story — the canonical, comprehensive telling the
 * rest of the site orbits (About, HCS, and the eight heritage lines all
 * link back here). It reuses the editorial essay chrome from /about and
 * /hcs (.about-section / .about-figure, defined in style.css) and adds a
 * few Thomas-only pieces (era eyebrows, <details> folds, cross-link CTAs,
 * image credits) scoped under .thomas-page in style.css.
 *
 * IMAGES: figures point at the theme folder /assets/img/thomas/ (same
 * deterministic, version-cache-busted pattern as the heritage-line
 * photos). Drop optimized files in there with the filenames below and
 * they light up. Until then the figures render as labelled placeholders.
 * Credits for every reused Wikimedia image live in
 * `Heritage research/Thomasito-photos/IMAGE-CREDITS.md`.
 */

get_header();

/**
 * Small figure helper. $side = 'left' | 'right' | 'center'.
 * If the image file isn't present yet it still renders the caption so
 * the layout reads during review.
 */
if ( ! function_exists( 'tc_thomas_fig' ) ) {
	function tc_thomas_fig( $file, $side = 'right', $alt = '', $caption = '', $credit = '' ) {
		// $file may be a bare filename (resolved against the theme's thomas
		// image folder), a root-relative path like /wp-content/uploads/... (a
		// WP Media upload), or a full absolute URL.
		if ( preg_match( '#^https?://#', $file ) ) {
			$src = $file;
		} elseif ( isset( $file[0] ) && $file[0] === '/' ) {
			$src = home_url( $file );
		} else {
			$src = get_stylesheet_directory_uri() . '/assets/img/thomas/' . $file;
		}
		$class = 'about-figure about-figure--' . ( $side === 'center' ? 'center' : $side );
		echo '<figure class="' . esc_attr( $class ) . '">';
		echo '<img src="' . esc_url( $src ) . '" alt="' . esc_attr( $alt ) . '" loading="lazy" />';
		if ( $caption || $credit ) {
			echo '<figcaption>' . esc_html( $caption );
			if ( $credit ) {
				echo ' <span class="thomas-credit">' . esc_html( $credit ) . '</span>';
			}
			echo '</figcaption>';
		}
		echo '</figure>';
	}
}
?>

<main id="primary" class="site-main about-page thomas-page">

	<!-- ==============================================================
	     PAGE HERO
	     ============================================================== -->
	<section class="page-hero">
		<div class="container">
			<a class="heritage-page__back" href="<?php echo esc_url( home_url( '/family' ) ); ?>">&larr; Family</a>
			<span class="page-hero__eyebrow">My own story</span>
			<h1 class="page-hero__title kinetic-text">Thomasito</h1>
			<p class="page-hero__subtitle kinetic-fade">
				The long way round &mdash; born a Lakeman, raised a Cheesman, and still here to tell it.
			</p>
		</div>
	</section>

	<section class="hcs-hero-figure-section">
		<div class="container container--narrow">
			<?php tc_thomas_fig( 'thomas.jpg', 'center', 'Thomas Cheesman', '' ); ?>
		</div>
	</section>

	<article class="about-body">
		<div class="container container--narrow">

			<!-- ============================ CH1 ============================ -->
			<section class="about-section scroll-animate">
				<p class="thomas-era">Who I am</p>
				<h2 class="about-section__heading">The short version</h2>

				<p class="about-lead">There is a flame I have been watching my whole life. When I was small it stood in the air over Turner Valley: a gas flare burning day and night on the edge of the Alberta foothills, left over from the morning in 1914 when the first natural gas in the province came roaring out of the ground there. On dark nights its glow would climb my bedroom wall and move across the ceiling like candlelight, and I called it my fire. I didn&rsquo;t understand yet that fire of exactly that kind &mdash; oil and gas, pressure and heat &mdash; ran through both the family I was born into and the one I was given. I only knew that it was out there in the dark, steady, and that it was mine.</p>

				<p>I was told, early and more than once, that I wouldn&rsquo;t get to watch it for long. The doctors gave me until about twelve. They told my mother I shouldn&rsquo;t have children, that I&rsquo;d be in a wheelchair young, that the disease quietly taking my hands apart had no map and no expert &mdash; that one day I would simply have to become my own. I am forty-five now. I have three children. The fire is still burning out there somewhere, and so am I.</p>

				<p>My name is Thomas Cheesman, and I carry that name by choice rather than by blood. My father by blood was a Lakeman; my mother carries Irish and Scottish-island lines down through her own people. The name Cheesman came to me across a kitchen table when I was a boy and my mother married into it, and I made it legally my own at twenty. A family is not only the people you descend from. It is also the people who show up, build the fences beside you, and stay at the table until the word just becomes true.</p>

				<p>Eight family lines run down the centuries from four corners of the world and meet, finally, in my three children, and I am the one who sat down and wrote them all out. This one is mine. If you only ever read one account of me, I would rather it be this than a tidy paragraph: a body I was told to give up on, a name I chose, a kitchen I loved and lost, and three kids who were never supposed to be here.</p>

				<p class="thomas-cta"><a href="<?php echo esc_url( home_url( '/family/heritage' ) ); ?>">The eight family lines that meet in my kids &rarr;</a></p>
			</section>

			<!-- ============================ CH2 ============================ -->
			<section class="about-section scroll-animate">
				<p class="thomas-era">Calgary &amp; Turner Valley &middot; 1980&ndash;1990</p>
				<h2 class="about-section__heading">The fire on the ceiling</h2>

				<?php tc_thomas_fig( 'turner-valley-gas-plant.jpg', 'right', 'The Turner Valley gas plant', 'The old Turner Valley Gas Plant &mdash; the flare I grew up beneath.', 'Photo: jasonwoodhead23, CC BY 2.0, via Wikimedia Commons.' ); ?>

				<p>I was born in Calgary on the fourth of November, 1980, but I don&rsquo;t remember the city. My memory starts a little to the south and four years later, in Turner Valley, the foothills town that the flare belonged to. We landed there when I was four, and it was the right town to be a boy in. I was an outdoor kid through and through. We had the biggest fire pit on the block, which meant half the street drifted through our backyard on summer nights. I think my family was on a first-name basis with most of it. The days ran together into bikes and sprinklers and somebody&rsquo;s mom handing out something cold, and when the heat got to be too much we&rsquo;d walk down to the outdoor pool and brave the icy water and the rough concrete that scraped your feet raw, and call it a perfect day.</p>

				<h3 class="about-section__subheading">My mother and my father</h3>

				<?php tc_thomas_fig( 'tv-drilling.jpg', 'left', 'Drilling floor in the Turner Valley oil field', 'On the drilling floor in the Turner Valley field, where the province&rsquo;s oil began.', 'Photo: Provincial Archives of Alberta (no known copyright restrictions), via Wikimedia Commons.' ); ?>

				<p>My mother, Maryanne, was a tough woman in the literal sense. She trained hard and competed as a bodybuilder, and she got strong enough to bench-press my father, who had a foot and a hundred pounds on her, partly, I came to understand, so that she could defend herself if he ever tried anything. Their fights were made of yelling rather than fists; I came up the stairs one afternoon just in time to watch a jar of mustard fly across the kitchen and shatter, my mother crying behind it. They were opposites in every register. My father had changed after I was born, trading a carefree, rock-and-roll boyhood for a serious adulthood of nothing but the news and classical music, while my mother filled the house with M&ouml;tley Cr&uuml;e and Poison and Chris de Burgh and Meatloaf. I have both of them in me somewhere, and I&rsquo;ve never been able to say which one wins.</p>

				<?php tc_thomas_fig( 'three-sisters.jpg', 'right', 'The Three Sisters peaks near Canmore', 'The mountains we drove to as a family &mdash; the Three Sisters, above the Bow valley.', 'Photo: Jakub Fry&scaron;, CC BY-SA 4.0, via Wikimedia Commons.' ); ?>

				<p>My father by blood is Martin, and he was there for the early part of all this. Before the divorce we went to the mountains often &mdash; the waterfalls above Banff, the hot springs, the tour buses pouring through that little town with every accent on earth aboard them. I have a dim, fond memory of learning to ride a bike with him running alongside, helping and getting frustrated in the same breath, because his fuse was short and I could never quite read when or why it would burn down. I didn&rsquo;t know any better, so I took it as simply how he was. After the divorce our contact thinned, year by year, until around 2005 it stopped altogether &mdash; until the day I called to tell him I&rsquo;d met Melanie, bought a house, and had a baby on the way. I laid it on a little thick that day, and I&rsquo;ve wished ever since that it hadn&rsquo;t needed a headline to make the call; that it had just been ordinary and frequent all along. It&rsquo;s still thin now. He&rsquo;ll send a birthday message and otherwise it&rsquo;s quiet, and a text can take him days, so a real back-and-forth was never in the cards. I&rsquo;ve made my peace with the shape of it.</p>

				<p class="thomas-cta"><a href="<?php echo esc_url( home_url( '/family/heritage/lakemans' ) ); ?>">The Lakemans &mdash; my father&rsquo;s blood line, out of the Dutch polders &rarr;</a></p>

				<p>Not all of childhood was tender. There was a neighbour, a fly fisherman, who once penned a live brown trout in a little ring of rocks in the shallows so he could take it home alive, and I, seeing only a poor trapped fish, scooped it up and set it free. He grabbed me and left a handprint on my backside I can still summon the memory of. Lesson learned, more or less.</p>

				<details class="thomas-fold">
					<summary>The thumb that wouldn&rsquo;t close</summary>
					<p>It was in Turner Valley, around four years old, that I was diagnosed with Hajdu-Cheney Syndrome, and the first sign of it was small and strange: I couldn&rsquo;t make a fist. My fingers wouldn&rsquo;t close all the way, as though something inside them had jammed &mdash; it felt, in hindsight, like severe arthritis, though at the time it was only aches and a body that wouldn&rsquo;t quite do as it was told. My knees wouldn&rsquo;t bend enough to sit cross-legged. My head turned about eighty percent of the way and then stopped. This was before genetic testing, so the diagnosis was read off my own body and off a long season of appointments where someone was forever holding my hands and turning my head, and the treatment that followed was a needle of Calcimar twice a day.</p>
					<p>To my friends none of it meant anything; back then we didn&rsquo;t judge each other for that kind of thing, and cooties were still years off. The one it landed hardest on was my mother. The pictures of HCS in those days were the extreme cases, because in a disease this rare the early information is built almost entirely from the children born fighting just to survive, and there were no honest statistics for a boy like me. The journals printed a tidy &ldquo;normal life expectancy&rdquo; that was simply made up, because there was nothing real to print. I think my lifelong hatred of misinformation was born right there, watching a doctor hand my mother the most frightening version of her son&rsquo;s future and call it a fact.</p>
				</details>

				<details class="thomas-fold">
					<summary>What Hajdu-Cheney actually is</summary>
					<p>Your skeleton works two jobs at once, every day of your life &mdash; laying down new bone and breaking old bone away &mdash; and in Hajdu-Cheney the demolition crew simply outruns the construction crew. The bones grow thinner and smaller over time, worst in the hands and feet, where the very tips of the fingers and toes can dissolve back into the body; the medical word for that is acro-osteolysis. It is the headline, but it is not the whole story, because the same restlessness reaches into the spine and the skull and the jaw, into the heart and the kidneys and the immune system. The longer you carry it, the more of you it comes to own.</p>
					<p>It usually rides in on a fault in a gene called NOTCH2, and it is autosomal dominant, which is the polite way of saying a parent passes it to about half their children. There are perhaps a hundred of us in the whole medical literature and not even fifty alive in the world today &mdash; a young group, with not many of us past forty. My own case carries a twist: I&rsquo;ve been tested twice for the known NOTCH2 mutations and come back clean both times, so my diagnosis is written on my bones rather than in my code, a textbook case with a genotype the textbook hasn&rsquo;t met yet.</p>
					<p class="thomas-cta"><a href="<?php echo esc_url( home_url( '/hcs' ) ); ?>">The disease in full clinical detail &mdash; Hajdu-Cheney Syndrome &rarr;</a></p>
				</details>
			</section>

			<!-- ============================ CH3 ============================ -->
			<section class="about-section scroll-animate">
				<p class="thomas-era">The farms &middot; 1991&ndash;1999</p>
				<h2 class="about-section__heading">The name I chose</h2>

				<p>We turned north for the Peace Country in the summer of 1991, and I turned eleven in a house north of Teepee Creek. I remember the birthday loot with perfect clarity: a cotton jumpsuit of the sort Velcro clings to, and a dartboard hung with little white Velcro balls. It did not take the household long to discover that those balls clung just as happily to me, and from then on I was the target &mdash; dodging, I&rsquo;ll tell you, like a ninja, which is to say like a large slow boy with nowhere to run.</p>

				<p>That same summer my mother married Brian Cheesman, in a double wedding on the very day his brother Dave married a woman named Kelly, and I became a Cheesman. There is not a drop of Cheesman blood in me &mdash; the name reached me across a kitchen table rather than down a bloodline &mdash; but I made it legally my own at twenty, and I&rsquo;ve handed it now to three children. Brian didn&rsquo;t arrive alone; he came with a whole second household, and for most of the next decade our two families lived braided into one, moving from farm to farm across the north.</p>

				<?php tc_thomas_fig( 'candy-cane-farm.jpg', 'right', 'The Candy Cane farm', 'The Candy Cane Farm &mdash; red-and-white striped, by accident of paint.' ); ?>

				<h3 class="about-section__subheading">The farms, one after another</h3>

				<p>The first of them, just north of Teepee Creek, was a bird farm, of all things &mdash; pens of chukars and quail and pheasants, ducks and geese and chickens and turkeys &mdash; and what I remember most is the spring a thousand chicks were raised in the dirt basement, the chirping and the warm animal smell of them rising up through the floorboards. That set the rhythm of the whole decade: arrive somewhere half-broken, and build it back up by hand. The bird farm lasted about two years before the marriage took a breath and we spent a short stretch in Edmonton, just my mother and my brothers and me; then the family mended itself and turned north again.</p>

				<p>By 1995 we had landed in LaGlace, and for the first time in a long while I got to feel like an ordinary fifteen-year-old. The town was warm and the kids were kind, and we played marathon games of town tag that were best in winter, when there were snowbanks to dive into when someone came hunting you. There were so few kids that when the boys wanted a basketball team they had to recruit anyone with a pulse, so I joined to fill the roster and belonged &mdash; and God, we were terrible, and I was the worst of us, so I mostly just tried to steal the ball off the other team and hand it to someone who could do something with it. The winter of 1996 is the one that stayed in my bones: we went back to ready that old bird farm for renters after it had sat empty, and it was forty below with four feet of snow to move by hand in rubber boots, fingers gone past stinging, throwing snow over our heads to tunnel toward the little warmth waiting inside.</p>

				<p>Then came the place that wore two names. We called it the Candy Cane Farm because of the paint: we&rsquo;d ended up with pails of white and a red that came out of the can fire-engine bright, so the barn and the fences went on in stripes. We called it the Pig Farm because this time we didn&rsquo;t just build the place, we stocked it: eighty Black Angus cows, twenty or thirty pigs depending on the litters, chickens, and a cast of characters I still think about. Trumac was the bull, so enormous he couldn&rsquo;t fit through the cattle chutes, but the whole herd followed him, so once you knew the trick you could move eighty cows with a single bucket of oats just by leading him around the field. Spud was the boar, a vast and friendly animal who lived for a good scratch. The goats were Festus, whose jaw sat crooked as if it had once been knocked loose and healed wrong, and Rubber-Leg-Joe, who limped on her front leg and who once headbutted the patio door until we gave up and let her into the living room to keep us company. There was a horse no one could ever catch, too anxious by half, who spent one winter eating every bit of foam and hose off the snowmobile &mdash; only the parts that weren&rsquo;t metal.</p>

				<p>It wasn&rsquo;t all gentle. One winter night I woke to a glow in the barn and found it was a real fire, and one of the sows was hurling herself down onto the burning hay to smother it with her own body, because she had a litter to keep alive. We caught it before it spread. Another time a pack of coyotes ringed me on the feed trailer and had nearly worked out how to come up after me when Cone, the farm dog, came tearing across the yard and ran them off &mdash; she&rsquo;d come with the place, the lone survivor of a shed the previous owner had locked his dogs inside, and somehow she came through all of it loyal to the bone and lived outdoors year-round at forty below. And there was Beastly the cat, who once chased me a full hundred yards into the house and up onto the back of a living-room chair, where I stood and kicked and screamed until Cone arrived to save me. I genuinely believed I might die on the back of that chair.</p>

				<p>The days were chores from end to end &mdash; building, feeding, mucking pens, hauling water three hundred frozen feet to troughs that iced up the moment you turned your back &mdash; and the great communal labour of baling, which took the whole family at once: one on the tractor, one riding the baler, one or two stacking, somebody driving the wagon. We&rsquo;d put up better than three thousand bales in a season to carry the herd through winter. Being the eldest of that joined-up household, I was forever the one left in charge, the head babysitter, the one who wore the blame when the younger ones went wrong. And I&rsquo;ve come to believe it was the making of me, because it taught me young how to run a busy operation full of people, which is precisely the work I&rsquo;d end up doing for a living.</p>

				<p>In 1997 my mother and Brian finally bought a place of their own, out near Little Smokey &mdash; a half-section of trees and swamp at the literal end of the road, where the paving crews gave up because their machines kept sinking into the muskeg. There was no natural gas; the well water ran so thick with iron you couldn&rsquo;t drink it; we heated the house with a wood furnace and warmed our bath water in an oil barrel over an open fire. Moose stood in the yard, bears and eagles worked the green belt, and I taught myself to snare rabbits along a trapline through the snow. My brothers and I built a wagon from two tires and a sheet of plywood to drag whole trees back to the house rather than carry the wood out armful by armful. We were living, in 1997, very much the way the homesteaders in the older family lines had lived a century before &mdash; and it was right there, as I turned eighteen, that Brian came down with the chronic illness that would take years to name.</p>

				<p class="thomas-cta"><a href="<?php echo esc_url( home_url( '/family/heritage/cheesmans/story' ) ); ?>">The whole farm decade, in the family&rsquo;s telling &mdash; the Cheesman line &rarr;</a></p>

				<h3 class="about-section__subheading">My brothers</h3>
				<p>I am the eldest of three. My brother Chris and I are closest when we&rsquo;re in the same room, and since I came out the far side of the spinal fusion he&rsquo;s made a point of travelling up with his brood once a year or so, which means more to me than I can easily say. Jonathan lives nearby and has turned into a wonderful uncle &mdash; Faith adores him, and Daniel is forever building or fixing something at his elbow when he comes to help with whatever Melanie and I can&rsquo;t manage ourselves; a brother in construction is a handy thing to have. Jonathan was one of the tough kids back in the day, always into something, and he grew into a good man.</p>

				<details class="thomas-fold">
					<summary>A teenager, in the blur</summary>
					<p>At school in Valleyview I was the quiet new guy, good at math and science &mdash; most of the boys in my class were, and a good number of them went on to the engineering program at the college. I&rsquo;ve wondered now and then whether that was the road I should have taken; but I don&rsquo;t think it would have led me to this family, and I wouldn&rsquo;t trade them for any career on earth, so I&rsquo;ve let the wondering be. I lived at the end of nowhere, first onto the bus and last off it, an hour each way and chores waiting the moment I got home, and I survived the whole arrangement on a Walkman and a great deal of Ozzy. Ozzy more or less saved me. I still keep him close, a little at a time.</p>
					<p>My friends come back to me now as a roll call, town by town, the way they arrived. In Turner Valley there was Crystal next door, my hopeless grade-four crush, and Judy down the street, who was my first kiss; around Teepee Creek, Robie&rsquo;s brother Justin, who was one of the closest I had. Most of them are distant to me now; I&rsquo;ll be honest that I&rsquo;ve never been much good at holding on. It&rsquo;s one of the things you learn from moving as often as we did &mdash; to live in the present and not grieve what you can&rsquo;t reach, and that once you&rsquo;ve moved on you may as well be all the way gone.</p>
					<p>There was a girl, too, for a short season &mdash; quiet and modest, with a smile I loved &mdash; my history teacher&rsquo;s youngest daughter, which made his class a particular kind of awkward, though I liked the man and had sat at the front of his room before I ever sat across from his daughter. It lasted three months, but I fall hard when I fall, and the ending of it put me under for the better part of a year. One winter lunch I went tearing down the packed-snow street after her, meaning to slide up alongside her smooth and cool; my feet shot out from under me and I came down on my back and shoulders hard enough that I&rsquo;m fairly sure I cracked some range of motion loose for good. Worth it.</p>
				</details>

				<details class="thomas-fold">
					<summary><span class="thomas-fold__title">The Mustang</span></summary>

					<?php tc_thomas_fig( 'mustang.jpg', 'right', 'The red 1983 Mustang', 'The red &rsquo;83 Mustang &mdash; a manual, and a whole other story.' ); ?>

					<p>By the end of grade twelve I finally had wheels: a red 1983 Mustang that had sat a year in a farmer&rsquo;s field until Brian and Dave coaxed it back to life &mdash; a manual, which is no trouble at all if you were raised on farms. There&rsquo;s a whole other story in that car, and since I promised it, here it is.</p>
					<p>I put it in the ditch more than once. I spun a full 360 at five in the morning, in the dark, doing a hundred around a bend, and walked away amazed. The floor rusted clean through beneath the seat, so the rain sprayed up at me and the seat sank a little lower through the hole with every wet day. I once backed it straight over a culvert and came to rest at a fifty-degree tilt, nose to the sky, until my dad&rsquo;s coworker hauled me out with his tractor and was decent enough not to laugh too hard. My uncle took it down a gravel road at a hundred and fifty, hit a bump, and crumpled the gas tank &mdash; which I patched with silicone, a plastic pad, and bungee cords, and which, against all reason, held.</p>
					<p>Then the wiring harness dropped onto the engine and caught fire. I rewired the thing in the dark with no headlights and no dash and nothing but the hazards blinking, limped it into Valleyview to sleep in a hotel, and nursed it to Canadian Tire the next morning: six fuses and twenty wires and a snarl of emissions hoses, just another puzzle that surrendered to patience. The best chapter, though, I had no hand in. I dropped the car at a shop one morning and came back to be told I&rsquo;d already picked it up; it turned out a pair of kids had broken out of juvie and the shop had simply handed them my keys. They nearly drove it through the garage door, lit out toward Fox Creek, and got pulled over on the wrong side of the road, and the shop was so embarrassed it didn&rsquo;t charge for the tow. Weeks later the transmission seized in fourth gear, and I limped it home on the back roads trailing smoke the whole way, parked it, and there, for all I know, it sits to this day.</p>
				</details>
			</section>

			<!-- ============================ CH4 ============================ -->
			<section class="about-section scroll-animate">
				<p class="thomas-era">Grande Prairie &middot; 1999&ndash;2004</p>
				<h2 class="about-section__heading">Grande Prairie and The Keg</h2>

				<?php tc_thomas_fig( 'frac-pump.jpg', 'right', 'At the head of a frac pump', 'The oilfield world I trained for.', 'Photo: Joshua Doubek, CC BY-SA 3.0, via Wikimedia Commons.' ); ?>

				<p>In 1999 I finished high school and moved to Grande Prairie &mdash; the first move in this whole story that I made on my own. The doctors had never left me much room to plan a life: twelve years, they&rsquo;d said, and behind all of it the strange dare one of them had handed me &mdash; that so little was known about my disease that one day I would have to become its expert myself. So I enrolled in a Bachelor of Science and went after it like a man with something to prove, which I was: analytical chemistry, biology, genetics, and physics thrown in purely to understand how the universe is bolted together. I wanted to be the expert nobody else could be for me.</p>

				<details class="thomas-fold">
					<summary>Why science</summary>
					<p>I loved science, and I still do, though I&rsquo;ve never been a God-fearing man. I respect God, and I believe there is one of some kind, for the simple reason that I cannot explain the miracle of life away. I can&rsquo;t accept the tidy story of a primordial soup, because soup is precisely the kind of thing we can already cook up in a lab; and I know how viruses work, those strange and complicated little machines, almost like spaceships, that grow harder to pin down the closer you look at them, the way the Heisenberg principle says they should. Prions are simpler &mdash; those I could imagine arising on their own &mdash; but the world life actually began on doesn&rsquo;t exist anymore, or we&rsquo;d be watching new life appear, and we aren&rsquo;t. So I&rsquo;ve settled in the middle: a deep respect for the science, and an equally deep respect for the mystery the science keeps running its nose into.</p>
				</details>

				<?php tc_thomas_fig( 'aunty-uncle.jpg', 'left', 'Aunty Eleanor and Uncle George', 'Aunty Eleanor and Uncle George, who staked my practicum.' ); ?>

				<p>I trained as a power engineer too, earning my fourth-class ticket and a piece of my third, and did a practicum at the SAGD plant up in Fort McMurray, boiling water to a furious pressure and driving it underground to bring up oil and sand &mdash; a stretch made possible by a two-thousand-dollar gift from my Aunty Eleanor and Uncle George. The plan was to make real money in the patch and open a restaurant of my own. Then I walked into the thing that would shape the rest of my working life: every oilfield job wanted a medical for the insurance, and a condition no insurer will touch is a poor foundation to build a career on. The restaurant died there before it was ever born.</p>

				<?php tc_thomas_fig( 'sagd-conoco.jpg', 'right', 'A SAGD plant in the oil sands', 'A SAGD plant in the Alberta oil sands.', 'Photo: jasonwoodhead23, CC BY 2.0, via Wikimedia Commons.' ); ?>

				<p>So in 2001 I walked into The Keg for a serving job and got hired as a salad tender instead, and though I didn&rsquo;t know it that day, I&rsquo;d give the place twelve years. The owner and chef could see I was adrift, and when they spun off a caf&eacute; called The Iron Lunchbox and half the crew went with it, I stepped neatly into the gap they left behind. A real team grew up in that kitchen &mdash; Emma in the bar, Greg managing the floor, Camille and then Tara &mdash; and we made a habit of raising the standards and the sales together by training people well and keeping them, because when the team is good the work stops feeling like work. I sometimes wonder what the caf&eacute; or the patch would have made of me. But I was falling for Melanie by then, in the best and most distracting way, and the Keg was still only a job. It was about to become a calling.</p>

				<p>I met Melanie that same year &mdash; not across the pass, but through Leah, a friend from my science courses who would go on to become a vet and, years later, to stand up and officiate our wedding.</p>

				<?php tc_thomas_fig( 'keg-me.jpg', 'left', 'Thomas in the Keg years', 'The Keg years.' ); ?>

				<p>There&rsquo;s a name on the cover of this page, and the Keg is where it comes from. One of the grill cooks who trained me was a man named Tony, though I called him Mario and he called me Thomasito. He was an inspiration to me &mdash; the kind of man who made me glad, and a little proud, to be growing up in Canada &mdash; and we spent a great many evenings long after the shift had ended, just the two of us and a few beers and the easy talk of people who like each other. That nickname stayed lodged in my head for more than twenty years, so when it came time to name the story of my whole life, his name for me is the one I reached for.</p>

				<details class="thomas-fold">
					<summary>A young oil town</summary>
					<p>Grande Prairie in those years was an oil-and-gas town with a young population and money to spend, and a busy dining room turned out to be a fine place to learn economics. After 9/11 I watched the business move with the price of gas and the wars that spike it, and back then everyone was spending like the taps would never close, so we were slammed &mdash; by the time I left, a one-to-two-hour wait four nights a week was ordinary, eighty people deep some evenings, standing out in a blizzard for a table. The town runs backwards that way: foul weather fills the dining room and fair weather empties it, so the wise move was always to take your holidays in lobster summer, when nobody wanted to be indoors.</p>
					<p>A young town with money in its pockets also pulls in good music, and I caught more of it than I had any right to: Nickelback, Merle Haggard, Bryan Adams &mdash; Shania Twain herself came through. But Ti&euml;sto was the best concert of my life, and the one I still can&rsquo;t quite believe happened. He played a place called Rock City &mdash; the old Corral &mdash; a venue that couldn&rsquo;t have held two thousand people, and I stood there genuinely unable to work out how or why the top DJ on the planet had come to us. The answer, of course, was the same as everything else in that town: he came at the very peak of the boom, to a young city with oil money burning holes in its pockets, and no plainer testament to what that economy could pull north ever crossed my path. I went with a friend&rsquo;s ex and her friend and caught an early glimpse of a new collaborator of his you may have heard of: Haddaway. If I ever want to see him again it&rsquo;ll be flights and hotels and tickets, so I&rsquo;m not holding my breath &mdash; but I do hope the economy up here climbs again someday, enough to pull in artists who have no business coming this far north.</p>
					<p>My crowd in those years was a scattering of Newfoundlanders through my apartment building, thickest on my own floor, and I played slow-pitch softball with them for six seasons between 2000 and 2006, half of it in Valleyview and half in town. It ended the night I broke a toe in a parking-lot scrap outside the Crown and Anchor, trying to save my buddy Calvin&rsquo;s Oakleys from getting stomped &mdash; that pub is still open, a kind of monument to a changed town, now that nearly every bar but it and Moxie&rsquo;s has gone dark. A few of those guys began drifting toward cocaine and the company that comes with it, and I quietly stepped back, because I&rsquo;ve never fully trusted myself near it: drugs ease pain, and the last thing a man in my body needs is that particular door left ajar. The good ones stayed clear of it. Calvin&rsquo;s a charmer and a like-minded soul, and he and I still cross paths and trade comments online to this day.</p>
				</details>
			</section>

			<!-- ============================ CH5 ============================ -->
			<section class="about-section scroll-animate">
				<p class="thomas-era">The climb &middot; 2004&ndash;2012</p>
				<h2 class="about-section__heading">What the kitchen gave me</h2>

				<?php tc_thomas_fig( '/wp-content/uploads/2026/06/me.jpg', 'left', 'Thomas in chef whites', 'In the whites.' ); ?>

				<p>The kitchen, for me, was an escape &mdash; and a strange kind of medicine. My body hurt in a way that made the first movements of the day hard, but once I was moving I felt almost well, because the pain is like rust in the joints that has to be worked loose; the moment I stop, I seize back up. The line kept me moving, eight and ten and twelve hours at a stretch, and it gave me something to point all of it at. The leadership had been built into me young, out on the farms, and the disease had taught me to work smarter rather than harder, which turns out to be exactly the thing a busy kitchen rewards. I came up the Keg line over a couple of years to assistant manager, then ran the kitchen as manager for the better part of a decade, and took the whole thing over the day the head chef had a heart attack.</p>

				<p>By around 2010 I was itching for more and finding every door shut. I couldn&rsquo;t get past my kitchen manager: I asked to go out on the opening teams the way the other managers did and was left instead to rot in the back of the house, for reasons I&rsquo;ve never understood; I put my name in to corporate for a couple of postings and heard nothing; I was offered Fort McMurray and had no appetite for another desperate oil town paying half what the patch pays. So I hit my own ceiling, and I knew by then that my working years would be short, and I had to ask myself whether I wanted to spend the few I had grinding for the people blocking me &mdash; a brutal thing to weigh, because the crew around me were good friends, and leaving felt like a divorce from a whole life.</p>

				<?php tc_thomas_fig( 'plate-chicken-parm.jpg', 'right', 'A plated chicken parmesan', 'On the plate: chicken parm.' ); ?>

				<p>Becoming a chef on paper turned out to be its own long fight. I wanted the apprenticeship for years and couldn&rsquo;t get it signed; it was like pulling teeth. In the end I took the booklet, filled it out myself, and brought it to be signed only when I was ready to move to the next stage &mdash; which felt a little like cheating, except that it was the only way to get it signed. In 2011 I went down to SAIT in Calgary for the schooling, and my Grandma Sandy put me up and fed me and gave me the long talks I&rsquo;ll always be grateful for, and I came home with my Red Seal in 2012. And I&rsquo;ll be honest about the rest of it, since this is the whole story: drink ran alongside Keg life, hand in hand. I had my six ounces a day and a good deal more on my days off, in the bars and with the staff. It is part of the true shape of those years, and I won&rsquo;t pretend it away.</p>

				<details class="thomas-fold">
					<summary>Tales from the houseboat</summary>
					<p>The reward for management was the trips: the Keg Cups, the wine tastings, the courses on food and pairings, a few days touring the Kelowna wineries where we somehow ended up eating at a Keg every single time. But the best of them were the houseboat runs on the Shuswap. We ran them as themed tasting days: whisky one afternoon, sake the next, five vintages of a single wine lined up side by side to argue over. One year KC and I built a contraption we christened the Kegashuk, for the sole and holy purpose of holding our booze.</p>
					<p>One night I lobbed a firework into the fire as a joke, and when it went off Tara dove behind the log we were perched on and came up having jumped clean out of her sandals &mdash; they were still sitting there, side by side, exactly where her feet had been. Another night I did a tequila tasting and lost most of the evening to it; I surfaced the next morning clutching a stone that looked like fossilized wood, which I&rsquo;d apparently found under the moss beside a little fire that Lucas and I had tended on the flooded shore. The lake was so high that year there were no beaches at all, only soaked trees and stones, but the rain hardly matters when you&rsquo;re day-drunk in a hot tub. The day after, I lay in bed dying, holding that cool fossil to my cheek because it was the one comfortable thing in the world, very glad indeed to be next to the washroom. I have not been that drunk since, and I never intend to be; I&rsquo;ll be suspicious of a tequila tasting until the day I die.</p>
					<?php tc_thomas_fig( 'tara-and-i.jpg', 'right', 'On the houseboat', 'Shuswap days.' ); ?>
				</details>

				<h3 class="about-section__subheading">The kitchen years, in pictures</h3>
				<div class="thomas-culinary">
					<?php
					// The culinary-career wall — 28 photos Thomas gathered from
					// the Keg/Ric's/Township 71/Majors years (WP Media, 2026/06).
					// Masonry via CSS columns; framed hover treatment in the
					// THOMAS CULINARY block of style.css. Plain <img> tags so
					// initLightbox() wraps them for the sitewide PhotoSwipe.
					// Captions can be backfilled (filename => alt for now).
					$tc_culinary = array(
						array( 'me.jpg', 'Thomas in the kitchen years' ),
						array( 'iphone-Oct-2012-789.jpg', 'From the kitchen years, 2012' ),
						array( '10150130534233708.jpg', 'From the kitchen years' ),
						array( 'Chicken-Parm.jpg', 'Chicken parmesan, plated' ),
						array( '10150159865463708.jpg', 'From the kitchen years' ),
						array( '10151234016758708.jpg', 'From the kitchen years' ),
						array( 'LOBSTER.jpg', 'Lobster' ),
						array( '10151582343418708.jpg', 'From the kitchen years' ),
						array( 'Lasagnia-Upright-Wide-Close-2.jpg', 'Lasagna, stood upright' ),
						array( '10152459275908708.jpg', 'From the kitchen years' ),
						array( '10152459275998708.jpg', 'From the kitchen years' ),
						array( 'IMG_1981.jpg', 'From the kitchen years' ),
						array( '10152459276128708.jpg', 'From the kitchen years' ),
						array( '10152666381033708.jpg', 'From the kitchen years' ),
						array( 'iphone-Oct-2012-795.jpg', 'From the kitchen years, 2012' ),
						array( '10152666385753708.jpg', 'From the kitchen years' ),
						array( '10152666386738708.jpg', 'From the kitchen years' ),
						array( 'P1150047.jpg', 'From the kitchen years' ),
						array( '10152666387033708.jpg', 'From the kitchen years' ),
						array( 'P1150054.jpg', 'From the kitchen years' ),
						array( 'IMG_2278-2.jpg', 'From the kitchen years' ),
						array( '10153782114673708.jpg', 'From the kitchen years' ),
						array( 'tc-iphone-003-73.jpg', 'From the kitchen years' ),
						array( 'TOWNSHIP-2015-3-BEAVER-ROO-PHOTOGRAPHY.jpg', 'Township 71, 2015 — photograph by Beaver Roo Photography' ),
						array( 'tc-iphone-017-17.jpg', 'From the kitchen years' ),
						array( 'TOWNSHIP-2015-6-BEAVER-ROO-PHOTOGRAPHY.jpg', 'Township 71, 2015 — photograph by Beaver Roo Photography' ),
						array( '20160214_095609-2.jpg', 'From the kitchen years, 2016' ),
						array( '2023-07-2720.jpg', 'Cooking for family, 2023' ),
					);
					foreach ( $tc_culinary as $tc_cphoto ) {
						printf(
							'<figure class="thomas-culinary__item"><img src="%1$s" alt="%2$s" loading="lazy" /></figure>',
							esc_url( home_url( '/wp-content/uploads/2026/06/' . $tc_cphoto[0] ) ),
							esc_attr( $tc_cphoto[1] )
						);
					}
					?>
				</div>

				<p>And somewhere in those years, in 2011, Melanie came back into my life through a computer screen. We&rsquo;d been apart a long time by then &mdash; when we first dated she had needed to get out of the Peace Country and I had needed to stay put and stable, and that was the fault line that split us, though I told myself that if it was meant to be it would find its way back one day. I&rsquo;d visited Edmonton a few times in between and kept her at arm&rsquo;s length the whole while, for reasons I&rsquo;ll come to. It took two tries. But the second time she found me, I think I already knew how it would end.</p>
			</section>

			<!-- ============================ CH6 ============================ -->
			<section class="about-section scroll-animate">
				<p class="thomas-era">Family &amp; the good hard years &middot; 2013&ndash;2017</p>
				<h2 class="about-section__heading">Three kids I was told I&rsquo;d never have</h2>

				<h3 class="about-section__subheading">Why I&rsquo;d built the wall</h3>
				<p>Here is the thing I had carried for a long time, the reason I&rsquo;d kept her at arm&rsquo;s length in the years between. I was always hesitant to take a girlfriend at all, let alone marry, because I did not want to put another person through the burden I was certain I&rsquo;d become. I had built a second wall, taller than the first, against ever having children &mdash; I would not risk an affected child who might one day put someone else through this same long nightmare &mdash; and I had made my peace with being alone behind both walls, because I felt I had a kind of duty to be. Melanie cracked me open anyway. She is an extraordinary woman with the kindest heart I&rsquo;ve known, forever trying to make the thing in front of her a little better, at work and at home &mdash; she just goes. I still cannot fully explain how it happened, or why I felt the way I did in her company, except that in the end I had to surrender to fate and trust the higher order that had carried me this far. My spark has burned as long as anyone&rsquo;s.</p>

				<?php tc_thomas_fig( 'gprc.jpg', 'right', 'Grande Prairie Regional College', 'GPRC (now Northwestern Polytechnic) &mdash; where I studied and later taught.', 'Photo: Rr parker, CC BY-SA 3.0, via Wikimedia Commons.' ); ?>

				<p>My daughter Patience was born on the exact day I started as head chef at Ric&rsquo;s Grill, ten days late, as though she&rsquo;d been waiting for the shift to line up, and from there the next few years came at a run. I shut Ric&rsquo;s down to renovate it into a fine-dining room called Township 71, and the night before we opened the doors, Melanie and I learned she was carrying the boy who would become Daniel. For a stretch in the middle of all this I was also teaching the cooking half of the Hospitality and Tourism diploma at the college, writing the curriculum and building the lesson plans and standing in front of students who needed me to have the answer by day one. It was the hardest thing I had ever done, and it was the best.</p>

				<?php tc_thomas_fig( 'township-71.jpg', 'right', 'Township 71', 'Township 71 &mdash; fine dining in the Peace Country.' ); ?>

				<p>Township 71 was my swing at keeping real fine dining alive in the Peace Country, and I could not have chosen a worse moment to take it &mdash; November 2014, with oil falling out of the sky, the government turning over, the whole province bracing for the cold. We fought for it and lost money most months before we finally pulled the plug at the end of May &mdash; I stayed through June shutting everything down properly &mdash; and the town has never quite been the same since. The failure itself wasn&rsquo;t the part that hurt; it was saying goodbye to the staff, and the feeling that I had failed them &mdash; above all the foreign workers who had broken their backs and swallowed so much to get here, and who were suddenly turned loose to the wind: Candace, Jada, Daylin, Emma, Ricky, SriJohn, Saurabh, Dibie, and more. A couple of them got their papers right around the closing, which still feels to me like a small miracle. I think about that crew often.</p>

				<?php tc_thomas_fig( 'wedding.jpg', 'left', 'The wedding, 2 July 2016', 'The wedding &mdash; 2 July 2016, with the mosquitoes winning.' ); ?>

				<p>Daniel arrived. Melanie and I married on the second of July, 2016, in Calgary, with Leah, who had introduced us all those years before, standing up to perform the service; and the truest thing I can tell you about the day is that the mosquitoes were so thick the photographer could barely make the pictures happen. Patience was the hit of the whole affair &mdash; not quite three, in the sweetest dress Melanie had found for her, up on the stage dancing and catching bubbles &mdash; and when the time came for our first dance she insisted on sharing the moment, so I picked her up and the three of us danced it together. Daniel was barely one and still napping his way through the days, so he bounced between relatives and slept in the little wagon Nana Bette had gotten the kids &mdash; quite the handsome little man, and I have no idea where those cute looks came from. Faith came along. Three children in five years &mdash; three children I had been told, plainly and more than once, that I would never have.</p>

				<p>I won&rsquo;t pretend those years were kind to me. I was in so much pain that I could barely be present in them: my feet had collapsed and grown spurs of bone straight out the bottoms, so that every step landed on a stone, and even after a surgeon trimmed them away it took two years for the calluses to settle enough that I stopped feeling it. Pain is noise, and there is only so much of it a mind can carry and still think. I love turning an idea over, and you cannot turn anything over with that much static running underneath you, let alone keep enough quiet left over to truly be there for the people you love. It has taken me twenty-five years to learn to manage that noise, and it was a hard, slow lesson. But no matter how bad it got, I made every awards night and every birthday and every holiday. I was there.</p>

				<h3 class="about-section__subheading">The spark</h3>
				<p>Becoming a father, after a lifetime of being told it wasn&rsquo;t in the cards, has been the plain unarguable blessing of my life &mdash; and the returned time to actually be with them is better than anything I could have pictured. Life is a flame we each carry back to that first spark, which means that at some distance every living thing is a cousin of mine, and I try to honour anything that lives or has lived on the strength of that shared fire. I felt it as a chef, too, about the food itself &mdash; the care folded into the soil and the planting and the harvest, every hand a thing passes through before it reaches a plate.</p>

				<p class="thomas-cta"><a href="<?php echo esc_url( home_url( '/family/patience' ) ); ?>">Meet Patience &rarr;</a></p>
				<p class="thomas-cta"><a href="<?php echo esc_url( home_url( '/family/daniel' ) ); ?>">Meet Daniel &rarr;</a></p>
				<p class="thomas-cta"><a href="<?php echo esc_url( home_url( '/family/faith' ) ); ?>">Meet Faith &rarr;</a></p>
				<p class="thomas-cta"><a href="<?php echo esc_url( home_url( '/family/heritage' ) ); ?>">Melanie&rsquo;s side &mdash; the Haiste, Rycroft &amp; Steinke lines &rarr;</a></p>
			</section>

			<!-- ============================ CH7 ============================ -->
			<section class="about-section scroll-animate">
				<p class="thomas-era">The hinge &middot; 2018&ndash;2022</p>
				<h2 class="about-section__heading">The body&rsquo;s turn</h2>

				<?php tc_thomas_fig( 'majors.jpg', 'left', 'Thomas at Majors Homestyle', 'Majors Homestyle &mdash; the last kitchen I ran.' ); ?>

				<p>The kitchen went first, and the kitchen was where I had lived. By 2018 I could no longer hold a twelve-hour line &mdash; not with a thirty-pound stockpot and a fifty-pound box of potatoes and twelve miles of walking under my feet by the end of a shift &mdash; and Majors Homestyle and Tractor Jack&rsquo;s was the last full kitchen I would ever run. I knew before anyone around me that the kitchen was going to win this argument, and I left on my own terms, which I am grateful for and angry about in roughly equal measure, because I have never quite forgiven myself for not leaving years earlier, with more left in the tank for the family that was waiting. Somewhere in there I quit smoking, too &mdash; I&rsquo;d tried so many times I&rsquo;d lost the count, and I honestly can&rsquo;t name the day I finally did it, which tells me my hold on it was never as fierce as some people&rsquo;s. I seem to have an odd ability to simply put a thing down.</p>

				<p>And then came the accident that broke the story in half. We were out sledding, and at the top of the hill, once I&rsquo;d caught my breath, I knew something was wrong: the fun went straight out of the afternoon, and Melanie and I looked at each other and understood without a word that I needed to be checked. The hospital gave me a couple of cold hours on a hard bed and a dose of tramadol and sent me home. The next morning I lay a little longer than usual, stiff and thinking nothing of it, and when I finally stood up my head hurt in a way I had never felt in my life &mdash; as though it had turned to a bowling ball I could no longer hold upright, a full ton bearing straight down, with relief only when I lay it back down. We called an ambulance, and rather than fight a stretcher down the stairs they propped every door open so I could walk fast and lie down again inside. I spent the next ten days in hospital, on the pediatrics ward, because the new building was only soft-opening and there was nowhere else to put me. I am a forty-five-year-old man living inside an eighty-seven-year-old body, and a neck injury only hurries the whole thing along.</p>

				<?php tc_thomas_fig( 'halo.jpg', 'right', 'Thomas in the halo brace', 'In the halo.' ); ?>

				<p>When I finally read my own history off the X-rays, I could see that my neck had been quietly dislocating for years. In 2018, where the digital records begin, it sat three millimetres out of true. Then four. After the sledding accident, seven. But slowly, that time, it settled, and I came back: I started out eating lying on my side, because that was all I could bear, and then got upright a little longer each day, and then could cook a small meal for myself, and then for the kids, and then do a little around the house, and at last drive again, so that Melanie could go back to work. Being that fragile and that dependent took a real toll on her. She is remarkably strong &mdash; some of that Irish and English iron in her, I think.</p>

				<details class="thomas-fold">
					<summary>The fourteen millimetres</summary>
					<?php tc_thomas_fig( 'acadia-to-edmonton.jpg', 'right', 'Lying in the back of the Acadia, en route to Edmonton', 'Flat on my back in the Acadia, the whole way to Edmonton.' ); ?>
					<p>By that June I was feeling like myself again, sure I&rsquo;d come through it &mdash; and I was wrong. A couple of ordinary jerks of my body slipped the neck again, another seven millimetres, to fourteen out of alignment. The spine of my third vertebra was in shards and the front of it had fractured; my neck was, in plain words, dislocated and broken, and the swelling kept dragging me further down. I was already on oxycodone: I&rsquo;d had to go on it just to get out of the hospital the first time, and it had taken those ten days to find the dose that would put me back on my feet. I went to emergency, and they took an X-ray and discharged me without a word, and still I got worse, my head growing heavier and heavier until the only mercy left was to lay it down. I was losing my days to it, falling out of my own life by the hour. I even missed my friend Bubba and the boys raising a shed in my own yard, the kind of afternoon I&rsquo;d normally have loved, a couple of beers while the work gets done. My family doctor had run clean out of ideas and could only keep raising the oxy, so in the end I phoned the surgeon in Edmonton myself to tell him I was worse, and he set an appointment for the day after I was already due to see the foot surgeon about a spike growing out of the sole of my foot. I couldn&rsquo;t bear to sit upright, so I rode the whole way to Edmonton flat on my back in the rear of the Acadia.</p>
					<p>When the surgeon and I finally sat with the real scans together, we were both quietly amazed that I was alive to look at them. By every rule my spinal cord should have been pinched or sheared through, and it hadn&rsquo;t been &mdash; one of the few mercies of the kind of osteoporosis I carry is that the bone had retreated so far backward that the canal around the cord had widened, and so fourteen millimetres of slippage still hadn&rsquo;t been enough to cut it. I could walk, so a pair of nurses simply walked me across to the University of Alberta Hospital and checked me in, while the family stayed behind to talk with Dr.&nbsp;Huang and go find a hotel.</p>
				</details>

				<details class="thomas-fold">
					<summary>The halo, the surgery, the long way back</summary>
					<p>Dr.&nbsp;Huang was everything you would want a surgeon to be &mdash; he listened, and he took my worries seriously. The plan opened with a halo: a steel ring bolted into the skull, the bone dimpled so the bolts could bite, and then strung up to weights and pulleys that stretched my neck a little further each day while the nurses logged the load and the X-rays stacked up. For a week it pulled at me, and the strange gift of it was that the stretching took the pain clean away &mdash; there were dark days later when I genuinely missed it. Once a nurse who couldn&rsquo;t read a weight simply lifted it to get a better look, and it felt as though a ton of brick had dropped square onto my head; she set it down and I was fine again, but my God.</p>
					<p>The operation itself was really three operations stacked into one. First a tracheotomy, because they couldn&rsquo;t thread a breathing tube down past the vertebra pushing into my throat. Then they opened the left side of my neck, from below the ear down and around to the front, to reach the third vertebra from the front. Then they turned me over and went in from the base of my skull down to the third thoracic, and built the scaffold that holds me upright now &mdash; three rods, a stack of plates, a fistful of screws, donor bone, surgical glue, and who knows what else. They threw the whole kitchen at me.</p>
					<p>Recovery was long, and none of it was easy. I came up into an ICU that was roasting: pumps and machines everywhere and no air moving because of COVID. I was cheerfully oblivious to how badly off I really was, asking how soon I could go home. Once I was stable they shipped me down to the trauma ward for three or four weeks, and within three days I&rsquo;d been handed a pneumonia I&rsquo;d almost certainly been brewing in that hot room upstairs. The feeding tube was a saga of its own, because nothing about my throat is shaped the way a throat is meant to be, so it was forever sliding or plugging, and we made a daily adventure of coaxing it back into place. I cannot do a single thing the simple way, it turns out &mdash; not even be fed.</p>
					<p>Little by little, with the occupational and physical therapists at my elbow, I could do more. They went so gently on me that I took to wandering the halls on long walks when I couldn&rsquo;t sleep, and the finest thing in the building was sitting in the common area where the smell of coffee drifted through &mdash; a cruel gift, since I couldn&rsquo;t drink a drop of it with a hole in my throat. Then one night they told me a flight to Grande Prairie was booked, and it was the happiest I&rsquo;d been in longer than I could remember. The tracheotomy, of course, refused to close on its own; they stitched it three separate times and it leaked a while longer anyway, and they sent me home the moment it sealed, with a tube run straight through my abdomen to feed me while my throat learned, again, how to swallow.</p>
					<p>My brother drove me home, and I had him stop and let me out half a block early so I could walk the last of it and say hello to the neighbours. I was overjoyed to see my own bed again, and the cats, and Lucas. Melanie had set an air conditioner up in my room against a thirty-degree summer, which I was grateful for past saying, because a sheepskin vest had been trapped between me and the halo for the forty days in hospital and would stay there three months more. The halo came off a few weeks early in the end, because something had gone wrong inside it and it began firing pain into my skull at random &mdash; standing, turning, shifting in my sleep, a nail driven in without warning. The emergency doctor sent to remove it decided he knew better than my surgeon and wanted to tighten me back into the thing, and I got all three of my doctors on the phone right there to overrule him. And when the halo finally came off, I felt as though I&rsquo;d had a tune-up and could go again for another decade.</p>
				</details>

				<p>So far, so good. My back curves a little more than it did, and my shoulders are all but gone. The collarbones and the shoulder blades have nearly dissolved, and it&rsquo;s the lost motion, more than the pain, that I mind. There&rsquo;s no pill that grows a shoulder back, so I do my physiotherapy and I get on with it. This is the hinge of the whole story &mdash; the body finally taking the kitchen, and very nearly taking the rest of me with it. What I told myself, over and over through that year, was the simplest thing in the world: I&rsquo;ve got this. I can get back up, and I can be the best parent I&rsquo;m able to be by being here, for as long as I&rsquo;m able to be here.</p>

				<p class="thomas-cta"><a href="<?php echo esc_url( home_url( '/hcs' ) ); ?>">The disease, in full clinical detail &mdash; Hajdu-Cheney Syndrome &rarr;</a></p>
			</section>

			<!-- ============================ CH8 ============================ -->
			<section class="about-section scroll-animate">
				<p class="thomas-era">The new life &middot; 2022&ndash;now</p>
				<h2 class="about-section__heading">The life inside the lines</h2>

				<p>I won&rsquo;t tell you Hajdu-Cheney is a gift, because it isn&rsquo;t. But a constraint draws a line around a life, and the life inside my lines is one I would not trade away. The disease took the kitchen from me and handed back, in exchange, a thing the kitchen had always kept for itself: time. Not extra time &mdash; there&rsquo;s no extra of anything when your spine is fused and the scale keeps dropping &mdash; but the hours a chef pours onto the line, returned to me to spend as I choose. I&rsquo;ve spent some of them poorly and most of them well, and the well ones have built more than I&rsquo;d have dared to guess.</p>

				<p>I run three websites now, which is a funny thing to type for a man who is not a programmer. This one is the personal hub. Bare Your Rare is my writing project for Hajdu-Cheney in particular and rare disease in general &mdash; the site I went looking for when I was young and never found. And the GP Residential Society site belongs to the volunteer board I sit on. I build all three with AI at my side: Claude writes the code to my specifications, Grok and ChatGPT handle the research and the images and the second opinions, and somewhere past twenty-two thousand prompts I&rsquo;ve quietly turned into a kind of wizard at it.</p>

				<p>The other thing I&rsquo;ve done with the returned time is the family record itself, back to the 1600s on a couple of branches now, which has become the eight stories under this site and a pair of long documentaries on YouTube. I do it because our families grow older and smaller and more fragile every year, and I want it down on the page before the people who still remember it stop being here to ask. Maybe one of my own kids takes the way-back machine some day and is glad it&rsquo;s here. I think, too, about the world the three of them are growing up into &mdash; whether the next great machine, an artificial intelligence this time, will scatter working people the way the drained lakes and the failed colonies and the dust storms and the oil booms scattered every generation that came before us, or whether it will stop mattering at all where a person happens to stand.</p>

				<p>I also advocate, because living on disability is hard in a way most people never see from the outside. Everyone in the country was handed two thousand dollars a month, guaranteed, through COVID &mdash; and that was before two rounds of inflation rolled over us &mdash; and yet the governments have decided that seventeen hundred and forty a month is enough for a disabled person to live on, when rent alone is easily a thousand. It is not enough, and I say so out loud. What I want from the next stretch of my life is to find some kind of work that genuinely helps us while the kids are in school, to be productive in a way that lifts my family, so that one day I no longer feel that they are worse off for having me. One of the things I love about Melanie is that she plans for exactly that contingency, saving for the kids&rsquo; education, keeping them insured, so that if anything ever happens to me, they won&rsquo;t have to lean on a system like AISH the way I&rsquo;ve had to.</p>

				<p>I don&rsquo;t do the advocacy alone, either. I&rsquo;m part of ARISE, AISH Recipients In Search of Equity, a grassroots handful of us trying to dispel the myths around the program and push for real change: the clawbacks, and the fear so many of us live under of losing our income simply for working, or for getting married. Jan Nass and I were both quoted the day CBC came to write about the group.</p>

				<p class="thomas-cta"><a href="https://www.cbc.ca/news/canada/calgary/aish-recipients-arise-group-1.6949884" target="_blank" rel="noopener">CBC &mdash; AISH recipients form a grassroots group (ARISE) &rarr;</a></p>

				<p>A good day now is a simple thing, and I&rsquo;ve learned to measure it carefully. It means my medications are doing their work, and I&rsquo;m not hurting too badly, and I&rsquo;ve got my ducks in a row and gas left in the tank &mdash; enough to do more than a few chores before the basics wear me down. With a hand on the housework, a good day might be dinner and a movie, or fishing, or errands, or an afternoon with family, or one of the long road trips we love, out to BC or down to West Edmonton Mall. And if you read only one paragraph in all of this and keep nothing else, let it be this one: I am the father of three happy, healthy children, and I want for nothing beyond that. It takes very nearly everything I have to fully show up for a single day with them &mdash; and it is worth every last bit of it.</p>

				<p class="thomas-cta"><a href="https://bareyourrare.org" target="_blank" rel="noopener">Bare Your Rare &mdash; my rare-disease writing project &rarr;</a></p>
				<p class="thomas-cta"><a href="https://gpresidentialsociety.com" target="_blank" rel="noopener">The GP Residential Society &mdash; the board I serve on &rarr;</a></p>
				<p class="thomas-cta"><a href="https://www.youtube.com/@DriftingSplash9" target="_blank" rel="noopener">The family documentaries &mdash; YouTube @DriftingSplash9 &rarr;</a></p>
				<p class="thomas-cta"><a href="<?php echo esc_url( home_url( '/hcs/case-studies' ) ); ?>">The case-study library I keep on HCS &rarr;</a></p>
			</section>

			<!-- ============================ CH9 ============================ -->
			<section class="about-section scroll-animate">
				<p class="thomas-era">For Patience, Daniel &amp; Faith</p>
				<h2 class="about-section__heading">For my kids</h2>

				<?php tc_thomas_fig( 'three-kids.jpg', 'right', 'The three kids together', 'Patience, Daniel, and Faith.' ); ?>

				<p>If the three of you are reading this one day, this part is yours. The rest of the page is the long road I walked to get to you; this is only the short, plain truth of how I feel about it. Carrying my spark this far has been the treasure of my life, and watching each of you carry yours will be the greater one &mdash; the brightest flame of all. I hope you each find your purpose the way I eventually found mine &mdash; it took me a very long time, and it took your mom, so respect her for that alone if for nothing else.</p>

				<h3 class="about-section__subheading">To Faith</h3>
				<p>You are extraordinarily gifted, and an unusual kind &mdash; a lot like me, which is part of why I want to understand you as well as I possibly can. I watch you struggle and I watch you shine, and I know either one can throw a person around in this life. People won&rsquo;t always understand you, and that is hard, because we tend to assume we&rsquo;re the ordinary ones when in fact we&rsquo;re the exceptions. However things turn out, you will always have my love and my support, and I want to be right there beside you, cheering you on at whatever you choose to become.</p>

				<h3 class="about-section__subheading">To Patience</h3>
				<p>You are already such a beautiful, bright young woman: I can hardly believe how smart you are. Keep at it, and never stop learning, kiddo. The universe is a wondrous and misunderstood place, and it&rsquo;s up to people like you to unlock the secrets it&rsquo;s still keeping. I hope by the time you read this you and Faith can call each other true friends; I know growing up isn&rsquo;t always fair. You sort of turned five and decided that was quite enough of being little &mdash; you were simply going to grow up &mdash; and you did, faster than I was ready for. I hope you&rsquo;ve found the real meaning of life by now and are holding onto it with both hands. My one ambition is to stick around long enough to meet a grandbaby someday, which is absolutely not a hint to hurry, and yes, I&rsquo;ll still be getting the shotgun if you bring home any bad boys.</p>

				<?php tc_thomas_fig( 'king-daniel.jpg', 'left', 'Daniel', 'King Daniel.' ); ?>

				<h3 class="about-section__subheading">To Daniel</h3>
				<p>My boy &mdash; you have such wondrous, curious eyes. I always called you my dreamer, and I&rsquo;d bet a good deal that nothing has changed. The three little moles beneath your eye line up like Orion&rsquo;s Belt; coincidence? I don&rsquo;t worry about you. You&rsquo;re strong and you&rsquo;re smart, smarter than school knows how to measure, because you&rsquo;ve got this way of working a thing out for yourself, at your own pace, and life will be no different. The middle is a tough place to stand: the youngest gets away with everything and the oldest gets the freedom you envy. But people are the same wherever you go, in work and in life, and I suspect you already know it.</p>

				<p class="thomas-kicker">And to the three of you together, the single rule beneath all the rest of it: family takes care of family.</p>
			</section>

			<!-- ============================ CODA ============================ -->
			<section class="about-section about-section--closing scroll-animate">
				<h2 class="about-section__heading">Still here</h2>
				<p>The Lakemans, my father&rsquo;s people, carried a word four hundred years for what got them through: <em>doorkomen</em>, to come through, to break out the far side of the gale and reach the next harbour. I wasn&rsquo;t born to that line of words, and the Cheesman name is too new and too chosen to have grown one of its own. But I think we hold the truest version of the act anyway. We are the proof that a family can be chosen &mdash; that a name freely given and freely kept can hold as fast as any drawn in blood &mdash; and that a life a boy was told he could not have can be lived anyway, on his own terms, beneath his own fire. Patience, Daniel, and Faith inherit all of it: the chosen channel, and the seven rivers that pour into it. The world they will live through is not written yet. But this family has been here before, and it has always, somehow, come through.</p>

				<p class="thomas-cta"><a href="<?php echo esc_url( home_url( '/family' ) ); ?>">The whole family tree, and the eight lines that meet in my kids &rarr;</a></p>
			</section>

		</div>
	</article>

	<?php
	// Book-quality PDF of this story — renders only once keepsake-thomas.pdf
	// is in Media. See inc/keepsake-download.php.
	if ( function_exists( 'tc_render_keepsake_download' ) ) :
	?>
		<div class="container container--narrow">
			<?php tc_render_keepsake_download( 'thomas', __( 'Download my story as a keepsake PDF', 'tc-ventures-child' ) ); ?>
		</div>
	<?php endif; ?>

	<!-- ============================ GALLERY ============================ -->
	<?php
	// Photo wall — Thomas. Auto-includes every optimized g-*.jpg in the folder
	// (plus a few figure-named extras), so dropping in a new g-*.jpg adds it
	// here. Captions for the photos I can identify; the rest show without one.
	// Sitewide PhotoSwipe (main.js) wires the lightbox onto each figure.
	$thomas_base = get_stylesheet_directory_uri() . '/assets/img/thomas/';
	$thomas_dir  = get_stylesheet_directory() . '/assets/img/thomas/';
	$thomas_caps = array(
		'g-3yo.jpg' => 'Three years old, already a kicker.',
		'g-family-1999.jpg' => 'The family, 1999.',
		'g-grad.jpg' => 'Graduation.',
		'g-little-smokey.jpg' => 'Out at Little Smokey.',
		'g-kittens.jpg' => 'Kittens at Little Smokey.',
		'g-kegashuk.jpg' => 'The Kegashuk, on the Shuswap.',
		'g-cousins.jpg' => 'Kristina and Marlee.',
		'g-father.jpg' => 'My father at a car show.',
		'g-shadow.jpg' => 'Shadow.',
		'g-dusty.jpg' => 'Me and Dusty.',
		'g-mary.jpg' => 'Mary.',
		'g-mom-kids.jpg' => 'Mom and the kids.',
		'g-edmonton.jpg' => 'Visiting Edmonton.',
		'g-me.jpg' => 'Me.',
		'kids-robson.jpg' => 'The kids at Mount Robson.',
		'dad-bike.jpg' => 'Learning to ride, with my dad.',
		'calgary-baby.jpg' => 'Calgary, the very start.',
		'keg-hangout.jpg' => 'Hanging at the Keg.',
		'wedding-aisle.jpg' => 'Waiting at the end of the aisle.',
		'granny-docherty.jpg' => 'Granny Docherty and me.',
		'g-a-baby-thomas.jpg' => 'Baby Thomas.',
		'g-baby-me-and-granny.jpg' => 'Baby me and Granny.',
		'g-baby-thomas-at-christmas.jpg' => 'Christmas, small.',
		'g-me-as-a-todler.jpg' => 'Toddler me.',
		'g-teddy-bottle-fed.jpg' => 'Bottle-feeding Teddy.',
		'g-faith-favorite.jpg' => 'Faith\'s favourite.',
		'g-wild-ones.jpg' => 'The wild ones.',
		'g-keg-golf-tourney.jpg' => 'The Keg golf tournament.',
		'g-cheese.jpg' => 'Cheese, naturally.',
		'g-burger-single-wide-2.jpg' => 'On the plate: the burger.',
		'g-cheesesteak-eggrolls-wide-2.jpg' => 'Cheesesteak eggrolls.',
		'g-french-onion-2.jpg' => 'French onion soup.',
		'g-katsu-2.jpg' => 'Katsu.',
		'g-lasagnia-upright-wide-close.jpg' => 'Lasagna.',
		'g-lasagnia-upright-wide-close-2.jpg' => 'Lasagna.',
		'g-tuna-tartar-wide-2.jpg' => 'Tuna tartare.',
		'g-township-2015-2-prairie-ranger.jpg' => 'Township 71.',
		'g-township-2015-3-beaver-roo-photography.jpg' => 'Township 71.',
		'g-township-2015-4-prairie-ranger.jpg' => 'Township 71.',
		'g-township-2015-6-beaver-roo-photography.jpg' => 'Township 71.',
		'g-township-2015-6-prairie-ranger.jpg' => 'Township 71.',
		'g-township-2015-7-prairie-ranger.jpg' => 'Township 71.',
		'g-mel-s-camera-120510-042-2.jpg' => 'From Mel\'s camera, 2012.',
		'g-mel-s-camera-120510-188-2.jpg' => 'From Mel\'s camera, 2012.',
		'g-mel-s-camera-120510-189-2.jpg' => 'From Mel\'s camera, 2012.',
		'g-mel-s-camera-120510-190-2.jpg' => 'From Mel\'s camera, 2012.',
		'g-broke-my-neck.jpg' => 'After the neck broke.',
		'g-brokeneckthomas.jpg' => 'The broken neck.',
		'g-day-after-surgert.jpg' => 'The day after surgery.',
		'g-after-surgery.jpg' => 'After surgery.',
		'g-jarred-my-neck.jpg' => 'Jarred my neck.',
		'g-walk-after-surgery.jpg' => 'First walks after surgery.',
		'g-sprained-neck-2.jpg' => 'The neck, again.',
		'g-footc-3.jpg' => 'The foot.',
		'g-left-foot-ct-2-showing-hook.jpg' => 'CT: the bone hook under my foot.',
		'g-osteolysis-of-jaw-bones.jpg' => 'Osteolysis in the jaw.',
	);
	$thomas_files = glob( $thomas_dir . 'g-*.jpg' );
	sort( $thomas_files );
	foreach ( array( 'kids-robson.jpg', 'dad-bike.jpg', 'calgary-baby.jpg', 'keg-hangout.jpg', 'wedding-aisle.jpg', 'granny-docherty.jpg' ) as $thomas_extra ) {
		if ( file_exists( $thomas_dir . $thomas_extra ) ) { $thomas_files[] = $thomas_dir . $thomas_extra; }
	}
	?>
	<div class="container container--narrow">
		<h2 class="about-section__heading">Gallery</h2>
		<div class="thomas-gallery">
			<?php foreach ( $thomas_files as $thomas_gf ) :
				$thomas_name = basename( $thomas_gf );
				$thomas_cap  = isset( $thomas_caps[ $thomas_name ] ) ? $thomas_caps[ $thomas_name ] : '';
			?>
				<figure class="thomas-gallery__item">
					<img src="<?php echo esc_url( $thomas_base . $thomas_name ); ?>" alt="<?php echo esc_attr( $thomas_cap !== '' ? $thomas_cap : 'A photo from my life' ); ?>" loading="lazy" />
					<?php if ( $thomas_cap !== '' ) : ?><figcaption><?php echo esc_html( $thomas_cap ); ?></figcaption><?php endif; ?>
				</figure>
			<?php endforeach; ?>
		</div>
	</div>

    <div class="container container--narrow">
        <?php comments_template(); // open-tier comments — see inc/comments.php ?>
    </div>

</main>

<?php get_footer(); ?>
