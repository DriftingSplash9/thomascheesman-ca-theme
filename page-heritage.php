<?php
/**
 * Page Template: Heritage / The Families
 *
 * Auto-applied for any WP page with slug `heritage` (template hierarchy
 * resolves `page-{slug}.php` before generic `page.php`). The intended
 * URL is /family/heritage — make the WP page a child of the Family
 * page in admin (Page Attributes → Parent: Family).
 *
 * Page-title in WP admin can be "The Families" (or anything); the slug
 * stays `heritage` to keep the URL stable.
 *
 * Renders the long-form family-lines hub: a single scrollable page
 * that covers all five lines (Cheesmans, Dochertys, Lakemans, Rycrofts,
 * Haistes) plus a closing note. Designed as the index for future
 * spoke pages — each line will eventually grow into its own
 * /family/heritage/<line>/ child page; this hub stays as the
 * 30,000-foot overview.
 *
 * Content is hard-coded here for typographic control. When Thomas
 * wants edits, he sends them and we update this file.
 */

get_header(); ?>

<main id="primary" class="site-main heritage-page">

    <!-- ==============================================================
         PAGE HERO
         Same minimal pattern as page-family.php — kinetic title plus
         eyebrow and subtitle. Adds a "back to Family" link above the
         eyebrow so the breadcrumb is obvious without a full nav bar.
         ============================================================== -->
    <section class="page-hero">
        <div class="container">
            <a class="heritage-page__back" href="<?php echo esc_url( home_url( '/family' ) ); ?>">&larr; Family</a>
            <span class="page-hero__eyebrow">Five lines, one household</span>
            <h1 class="page-hero__title kinetic-text">The Families</h1>
            <p class="page-hero__subtitle kinetic-fade">
                A working map of where my kids come from
            </p>
        </div>
    </section>

    <!-- ==============================================================
         INTRO LEAD
         The "five lines pulling in different directions" framing.
         Narrow column, larger type than body — sets the voice.
         ============================================================== -->
    <section class="heritage-intro">
        <div class="container container--narrow">
            <p class="heritage-intro__lead">
                Family is its own kind of map. Mine has five lines pulling in different directions &mdash; Cheesmans, Dochertys, Lakemans, Rycrofts, and Haistes. Some I know inside and out. Others are still mostly names on paper and a few photographs I'm trying to put faces to. This page is where I keep what I know, what I'm learning, and the pieces I want my kids to have one day.
            </p>
            <p class="heritage-intro__lead heritage-intro__lead--secondary">
                If you have a story, a photo, or a correction, send it my way. These pages are working drafts for as long as I can keep typing.
            </p>
        </div>
    </section>

    <!-- ==============================================================
         FAMILY LINES
         Each .heritage-line is a numbered section: 01–05. They reveal
         on scroll via the existing .scroll-animate hook (initScrollReveals
         in main.js). H3 sub-sections within bodies are styled to read as
         "named subjects" within the line (Grampa Docherty, Ganny Docherty).
         ============================================================== -->
    <article class="heritage-lines">
        <div class="container container--narrow">

            <!-- 01 — CHEESMANS -->
            <section class="heritage-line scroll-animate" id="cheesmans">
                <span class="heritage-line__number" aria-hidden="true">01</span>
                <h2 class="heritage-line__title">The Cheesmans</h2>
                <p class="heritage-line__subtitle">The Cheesiest Clan</p>

                <div class="heritage-line__body">
                    <p>No, I don't know any actual cheese makers. No, you're not original with whatever joke just popped into your head. Yes, I love cheese &mdash; the real stuff, not the processed plastic.</p>

                    <p>We became Cheesmans on July 20, 1991, when my mom Maryanne (Elizabeth) Docherty married Brian Cheesman. It was a double wedding &mdash; same day, same ceremony as Brian's older brother Dave (born July 1967) and his bride Kelly. Brian was 20 at the time. The two couples stood up together and walked out as two new families in one afternoon.</p>

                    <p>Amber, Dave and Kelly's oldest, had already been born earlier that January. Their other two daughters, Marla and Clarisa, came later. Marla went on to marry Ryan Linson.</p>

                    <p>The grandparents on this side were John and Sandra Cheesman. John passed away from cancer. Sandy is still with us, though pain and limited mobility keep her close to home. The Cheesmans tend to keep a tight circle &mdash; for years it was really just John, Sandy, the two boys, and Sandy's mother. It must be a Cheesman thing.</p>

                    <p>Brian is my stepfather. My biological father is Martin Lakeman, which is its own family line further down this page. Both men are part of how I got here. The Cheesman name is the one I carry, and the one my kids carry now.</p>

                    <p>For a long stretch &mdash; roughly 1990 to 2013 &mdash; the Cheesman side stayed small and close. Mostly just my immediate family and a handful of relatives. I'd love more group photos of the cousins and their families now. If you have them, send them. It's been long enough. Time to put everyone in the same frame again.</p>
                </div>
            </section>

            <hr class="heritage-line__divider" aria-hidden="true">

            <!-- 02 — DOCHERTYS -->
            <section class="heritage-line scroll-animate" id="dochertys">
                <span class="heritage-line__number" aria-hidden="true">02</span>
                <h2 class="heritage-line__title">The Dochertys (and McIvers)</h2>
                <p class="heritage-line__subtitle">Few and far between, deep roots</p>

                <div class="heritage-line__body">
                    <p>The Dochertys are my mom's side. A smaller crowd than the Cheesmans, but the few there are matter a lot &mdash; and the further back you dig, the more interesting it gets.</p>

                    <p>The anchor photo for this side is from around 1986: my Ganny Docherty at the centre, her two sons Rick and Davey, her daughter Maryanne (my mom), her daughter-in-law Laura, and her son-in-law Martin. The grandchildren in the photo are Jonathan, Chris, me, and Levi.</p>

                    <h3>Grampa Docherty</h3>
                    <p>Thomas Richard Docherty was born January 16, 1914, in Alix, Alberta, and died March 20, 1977, in Calgary at 63. He served as an anti-aircraft gunner during the Second World War, stationed around Prince Rupert. Before that, in the 1930s, he was a Golden Gloves boxer who took prize fights for the purse &mdash; and there's a family story that he once found himself stranded in California without money and prize-fought his way back to Canada one bout at a time. The Dochertys came over from Scotland &mdash; Hamilton, Lanarkshire &mdash; and migrated through the eastern United States before settling in Alix. Presbyterian, the lot of them. His funeral was at &ldquo;The Little Chapel on The Corner&rdquo; with Rev. J.L. Pottruff officiating.</p>

                    <p>His siblings included his brother Abraham Lincoln &ldquo;Abe&rdquo; Docherty (born February 9, 1916, in Alix), his older sister Catharina Grace Docherty (born May 16, 1909, in Preemption, Mercer County, Illinois &mdash; yes, Illinois &mdash; and died May 20, 1968, in Calgary; she married Herbert Nelson McKay), and a half-sister, Lena Sullivan. Family record holds that Lena was a niece of John L. Sullivan, the bare-knuckle boxing champion. That one's family lore worth chasing down before I'd swear to it, but it's the story that got handed down &mdash; and it does fit the boxing thread on this side.</p>

                    <h3>Ganny Docherty</h3>
                    <p>Elizabeth Annie McIver was born March 20, 1919, in Saltcoats, Saskatchewan, and died April 24, 1988, in Edmonton at 69. Her funeral was at Eastminster Presbyterian Church in Edmonton. The McIver line carries its own weight here: my great-grandmother Henrietta Margaret McIver was born August 24, 1899, in Prince Albert, Saskatchewan, and lived to be 99 or 100 years old, passing in 1999. The family went by &ldquo;Elizabeth&rdquo; in conversation. The earliest McIvers in the records are Donald G. McIver and Elizabeth Campbell, with a marriage certificate and family Bible from Earlwood, Saskatchewan. Family memory places the McIver origins in the Outer Hebrides off the west coast of Scotland &mdash; desolate fringe at the time their ancestors left.</p>

                    <p>There's also Roy Thomas Docherty (1951&ndash;1970), buried at Queen's Park Cemetery in Calgary, with a service at &ldquo;The Little Chapel on The Corner&rdquo; in September 1970. His exact relationship to the immediate family is something I'm still untangling.</p>

                    <p class="heritage-line__callout">If you're family on this side and you're reading this &mdash; please reach out. I want to do this side of the tree justice.</p>
                </div>
            </section>

            <hr class="heritage-line__divider" aria-hidden="true">

            <!-- 03 — LAKEMANS -->
            <section class="heritage-line scroll-animate" id="lakemans">
                <span class="heritage-line__number" aria-hidden="true">03</span>
                <h2 class="heritage-line__title">The Lakemans</h2>
                <p class="heritage-line__subtitle">Indonesia, Holland, Calgary, and most places in between</p>

                <div class="heritage-line__body">
                    <p>The Lakemans are my biological father's side, and they carry a story that ranges from the Dutch East Indies through five continents to a Calgary taxi dispatch office. Most of what follows comes straight from a long email my dad Martin wrote me &mdash; it's his story to tell, and he told it well.</p>

                    <p>My biological father is <strong>Martin Gerard Lakeman</strong>, born March 30, 1957, at the Holy Cross Hospital in Calgary. The newspaper announcement that ran a few days later read: <em>&ldquo;Dr. and Mrs. R. Lakeman announce the birth of their son Martin Gerard on March 30th at Holy Cross Hospital.&rdquo;</em> Martin has two older brothers, <strong>Rienk Jr.</strong> and <strong>Alexander &ldquo;Lex&rdquo; Lakeman</strong>, both born outside Canada. Martin was the first of the three sons to be born on Canadian soil.</p>

                    <p>Their father &mdash; my grandfather &mdash; was <strong>Dr. Rienk Lakeman</strong>, born October 1, 1918, in Soerabaja (Surabaya) in what was then the Dutch East Indies, before the locals gained their independence and became Indonesians. He earned a doctorate in geology and spent his career chasing oil. His first job out of school was with Royal Dutch Shell in Venezuela in the early 1950s. In 1955 the Venezuelan government nationalized Shell's assets and replaced all the European staff with locals &mdash; so the family packed up and moved to Calgary, along with a whole retinue of other ex-Shell employees who ended up forming their own little Dutch-Canadian community.</p>

                    <p>In 1962 the oil company my grandfather worked for was bought by British Petroleum, and he was offered a position at BP head office in London. So they moved to England. My dad attended a preparatory school there and, in his own words, came out speaking perfect Queen's English. In 1967 they moved again, this time to Kuwait, where my dad attended an American school and from that day on spoke 'Merican. In 1970 they came back to Britain for fifteen months, then off to Singapore for another three-year assignment.</p>

                    <p>In 1974 my grandfather retired. On the way back to Calgary the family stopped in Holland to visit relatives and stayed for the 1975 New Year's celebration. My dad still talks about it &mdash; fireworks for sale to anyone who wanted them, no restrictions, and the whole night sky went bright red, white, and blue. After that they finally settled back in Calgary.</p>

                    <p>A year or two later my dad met my mom. The story goes like this: my mother had a brief relationship with a guy named Jim, and after it ended she asked Jim to introduce her to <em>his tall blonde friend</em>. As it turned out, Jim had two tall blonde friends. Mom had her eye on the other one. She got my dad. As Martin puts it: <em>&ldquo;if it wasn't for Jim I might never have been your father.&rdquo;</em></p>

                    <p>My grandmother <strong>Suzanna Verboom</strong> was born September 25, 1918, in Ter Aar, Zuid-Holland, in the Netherlands. The surname is pronounced &ldquo;ver-BOAM.&rdquo; She lived to be 100, dying in Calgary in 2018. Her father was a tailor and a barber whose shop was attached to the family home, and he taught her to sew and tailor &mdash; she became a most excellent seamstress, and she'll be remembered for her cooking, her impeccable taste, and the unmistakable Dutch accent she never lost.</p>

                    <p>The Verbooms were a Ter Aar family. Suzanna's parents were <strong>Cornelis Verboom</strong> and <strong>Aagje Donker</strong>. Her brother Pieter Verboom married a woman named Kelly and ran a hair salon about a block south of his father's barber shop &mdash; he got around on a Vespa big enough to fit himself, his wife, and two daughters. Her other brother Jacob &ldquo;Yap&rdquo; Verboom took over the barber shop when their father retired. So somewhere in Ter Aar, the odds are good that Verboom cousins or grandchildren are still cutting hair.</p>

                    <p>Going back another generation on the Lakeman side: my great-grandfather was <strong>Pieter Karel Willem Lakeman</strong> &mdash; known in the family as P.K.W. &mdash; born January 27, 1881, in The Hague. He served as Burgemeester (mayor) in the Dutch East Indies, including postings in Magelang (1929&ndash;1934) and Malang (1933&ndash;1936). He patrolled his whole district on horseback. He retired to the Netherlands in 1933, when my grandfather was 15. They sailed back to Holland together.</p>

                    <p>Rienk Sr. also had a brother, <strong>Pieter Lakeman</strong>, a medical doctor with two daughters.</p>

                    <p>There's more to fill in here &mdash; the wartime years in the Indies, deeper Verboom roots in Friesland, the Timmermans line on the great-grandmother's side that traces back to baptisms in the 1700s. Material for another day.</p>
                </div>
            </section>

            <hr class="heritage-line__divider" aria-hidden="true">

            <!-- 04 — RYCROFTS -->
            <section class="heritage-line scroll-animate" id="rycrofts">
                <span class="heritage-line__number" aria-hidden="true">04</span>
                <h2 class="heritage-line__title">The Rycrofts</h2>
                <p class="heritage-line__subtitle">Pioneers of the Region</p>

                <div class="heritage-line__body">
                    <p>The Rycroft side carries a piece of Peace Country history that still surprises me when I tell it. The town of Rycroft, Alberta is named after my wife's great-great-grandfather.</p>

                    <p><strong>Robert Henry Rycroft</strong> was born in 1872 in Honolulu to English parents. He spent years running a sugar and coffee plantation, moving goods between Hawaii, Japan, and the Philippines. In 1906 he met a 21-year-old Norwegian woman, <strong>Helene Lovise Christiane Thommessen</strong>, who was visiting Honolulu. They married five years later, on June 29, 1911, in Honolulu. Their honeymoon took them through British Columbia, where they first heard about the opportunities waiting up in the Peace Country. By 1912 they had registered two parcels of land near Spirit River.</p>

                    <p>In 1920, when the area split off from Spirit River and needed a name, four pioneers &mdash; R.H. Rycroft, W.S.O. &ldquo;Billy&rdquo; English, H.E. &ldquo;Doc&rdquo; Calkin, and George Garnett &mdash; wrote their names on slips of paper, dropped them in a hat, and pulled one out. The slip said Rycroft. (For about fourteen years afterward the local post office got it wrong and called itself &ldquo;Roycroft,&rdquo; until the Board of Trade finally got the spelling fixed in 1934 to match what the railway had used since 1916.)</p>

                    <p>R.H. and Helene hosted the first meeting of the Spirit River Rural Municipality in their home in January 1917. He served as the municipality's secretary-treasurer, sat on the school board, and was a Justice of the Peace for many years.</p>

                    <p>Their son <strong>Eric Jarmann Rycroft</strong> was born January 30, 1909, in Honolulu and came to Vancouver as a small child in 1912. He married <strong>Laureta Maud Jennie Clark</strong> on November 26, 1933, in Teepee Creek, Alberta. Eric died January 4, 1993, at 83 and is buried in Teepee Creek.</p>

                    <p>Eric and Laureta had a son, <strong>Samuel Eric Rycroft</strong> &mdash; Sam &mdash; born July 14, 1935, in Grande Prairie. Sam married <strong>Bette Steinke</strong> in 1959, and together they had four children: Lana, Lance, Vance, and Clark. They also had Lorne (May 1960), and other Rycroft cousins of that generation include Dennison &ldquo;Dennis&rdquo; (1937), Lona Helen Delores (1938), Thomas Floyd &ldquo;Tommy&rdquo; (1940), and Heather Bernice (1944).</p>

                    <p>Lana Rycroft is my wife's mother. That's where I come into the picture.</p>

                    <p>I'm still digging through the family tree to fill in dates and connections &mdash; Eric Jarmann had eight or so siblings I haven't fully traced, and there are plenty of Rycroft cousins around the Peace Country I'd like to know better. More to add as I learn it.</p>
                </div>
            </section>

            <hr class="heritage-line__divider" aria-hidden="true">

            <!-- 05 — HAISTES -->
            <section class="heritage-line scroll-animate" id="haistes">
                <span class="heritage-line__number" aria-hidden="true">05</span>
                <h2 class="heritage-line__title">The Haistes</h2>
                <p class="heritage-line__subtitle">Yorkshire to the Peace Country</p>

                <div class="heritage-line__body">
                    <p>The Haistes are my wife Melanie's father's side, and they came a long way to get here. The trail runs from a registration district in Yorkshire to a homestead in the Saskatchewan prairie to a life in Edmonton &mdash; three generations and an ocean.</p>

                    <p>The earliest confirmed Haiste in Melanie's direct line is <strong>John Haiste</strong>, born around 1840 in Yorkshire, who married <strong>Jessy Hobson</strong> in late 1866 in the Wharfedale registration district, near Otley. They had nine children. One of those children was <strong>Ernest Haiste</strong>, born October 16, 1881, in Pontefract, Yorkshire &mdash; a working-class family in industrial Yorkshire when the textile mills and coal mines were running flat-out.</p>

                    <p>Around 1900, Ernest emigrated to Canada. By the 1926 Canada Census he was farming in the Assiniboia district of Saskatchewan with his wife and several children. Ernest is the great-great-grandfather on this branch.</p>

                    <p>His son <strong>Sydney Haiste</strong> was born around 1906 in Saskatchewan and came of age on the family's prairie farm. The next generation &mdash; Sidney's son &mdash; is the one Melanie knew as her grandfather.</p>

                    <p><strong>Sidney James &ldquo;Jim&rdquo; Haiste</strong> was born April 23, 1931, in Alberta and died August 18, 2018, in Edmonton at 87. He spent the last 23 years of his life with Parkinson's disease. His funeral was held at St. Patrick's Anglican Church in Edmonton. Jim's brothers were Cliff (married to June), Bob (married to Audrey), and Grant, who predeceased him.</p>

                    <p>Jim's first wife was <strong>Margaret E. &ldquo;Betty&rdquo; Funnell Haiste</strong> &mdash; Melanie's grandmother &mdash; born around 1930 in Manitoba to Thomas Ernest Funnell (1892) and Ethel Bastin (1893&ndash;1975). Betty and Jim raised their family across Dawson Creek, Edmonton, and Calgary in the post-war decades. After Betty passed, Jim married <strong>Catherine Caroline Barclay</strong> (January 18, 1936 &ndash; April 26, 2016).</p>

                    <p>Jim and Betty had six children: Patrick (married to Karen), Cynthia, Patricia, <strong>Daniel &ldquo;Dan&rdquo;</strong> (Melanie's father), Eric (married to Cheraty), and Chris, who passed before his father.</p>

                    <p>The Haistes are an Anglican family, deep into prairie agriculture going back to Ernest's homestead, and now spread across Alberta from Edmonton to Grande Prairie. There's more to gather &mdash; I want to track Sydney's full life and find out where the Haiste name actually lands in Yorkshire records (probable spelling variants include Haste and Hayste).</p>
                </div>
            </section>

        </div>
    </article>

    <!-- ==============================================================
         CODA — A NOTE ON NAMES
         Closes the page with the surname-history map. Centred,
         smaller type, signs off the long-form like a colophon.
         ============================================================== -->
    <section class="heritage-coda scroll-animate">
        <div class="container container--narrow">
            <h2 class="heritage-coda__title">A note on names</h2>
            <p>
                If you're keeping score, my surname history runs Lakeman &rarr; Cheesman, my mom's runs Docherty &rarr; Lakeman &rarr; Cheesman, my wife's runs Rycroft &rarr; Haiste &rarr; Cheesman. Five family lines, one household, three kids who carry pieces of all of it. That's the map I'm trying to draw.
            </p>
        </div>
    </section>

</main>

<?php get_footer(); ?>
