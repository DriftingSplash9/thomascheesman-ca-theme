<?php
/**
 * Single Post Template: "Proud Of Canada" essay
 *
 * WordPress resolves single-{post_type}-{slug}.php ahead of single.php,
 * so this bespoke template applies ONLY to the post with slug
 * `make-canada-great-again` — it stays a normal post (feed, category,
 * carousel all intact) but gets essay-grade treatment:
 *   - a wide 1200px reading measure (the post is long)
 *   - a computed read-time badge
 *   - a card grid that doubles as the table of contents
 *   - each major section as a collapsible <details> block
 *
 * The post body in the database still holds the original block content
 * (with its AI images); this template renders a rebuilt, image-light
 * version instead. the_content() is read only to compute word count.
 */

get_header();

while ( have_posts() ) :
    the_post();

    // Read-time from the stored post body (~225 wpm).
    $tc_words = str_word_count( wp_strip_all_tags( get_the_content() ) );
    $tc_min   = max( 1, (int) round( $tc_words / 225 ) );
?>

<main id="primary" class="site-main single-post-page mc-essay">

    <article <?php post_class( 'single-post mc-essay__article' ); ?>>

        <section class="page-hero">
            <div class="container">
                <span class="page-hero__eyebrow">Essay</span>
                <h1 class="page-hero__title kinetic-fade"><?php the_title(); ?></h1>
                <p class="page-hero__subtitle kinetic-fade">
                    <?php echo esc_html( get_the_date( 'F j, Y' ) ); ?>
                    <span class="mc-readtime">&middot; <?php echo (int) $tc_min; ?> min read</span>
                </p>
            </div>
        </section>

        <div class="container mc-essay__wide">

            <!-- ============ INTRO ============ -->
            <div class="mc-essay__lede">
                <p>Canada has been a country since 1867, and since then its citizens have made many significant advancements and achieved greatness for humankind. Growing up, I felt great pride being a Canadian. To me it meant kindness and caring &mdash; possibilities, that if you want it you can do it, as long as you figure out how. What a great freedom to have.</p>
                <p>The Canada I grew up with is no more. We joined the global stage and gained communication within and outside our massive land mass. We see the world now without the aid of National Geographic, Disney, and CBC. Today we define what it means to be Canadian in many ways, and that is the great part about our freedoms. What can you contribute? Will you be on a list with the Greats for your contributions?</p>
            </div>

            <!-- ============ CONTENTS / CARD GRID ============ -->
            <nav class="mc-toc" aria-label="<?php esc_attr_e( 'Contents', 'tc-ventures-child' ); ?>">
                <h2 class="mc-toc__heading">In this essay</h2>
                <ul class="mc-cards">
                    <li><a class="mc-card" href="#sec-science"><span class="mc-card__num">01</span><span class="mc-card__title">Science &amp; Medicine</span><span class="mc-card__teaser">Insulin, the pacemaker, stem cells, Nobel laureates.</span></a></li>
                    <li><a class="mc-card" href="#sec-tech"><span class="mc-card__num">02</span><span class="mc-card__title">Technology &amp; Innovation</span><span class="mc-card__teaser">The telephone, IMAX, the Canadarm, Shopify.</span></a></li>
                    <li><a class="mc-card" href="#sec-arts"><span class="mc-card__num">03</span><span class="mc-card__title">Arts &amp; Entertainment</span><span class="mc-card__teaser">Cirque du Soleil, Cohen, Atwood, Alice Munro.</span></a></li>
                    <li><a class="mc-card" href="#sec-sports"><span class="mc-card__num">04</span><span class="mc-card__title">Sports</span><span class="mc-card__teaser">A timeline from lacrosse to Olympic gold.</span></a></li>
                    <li><a class="mc-card" href="#sec-exploration"><span class="mc-card__num">05</span><span class="mc-card__title">Exploration &amp; Environment</span><span class="mc-card__teaser">The Arctic, the ISS, the deep sea, clean tech.</span></a></li>
                    <li><a class="mc-card" href="#sec-social"><span class="mc-card__num">06</span><span class="mc-card__title">Social &amp; Political</span><span class="mc-card__teaser">Peacekeeping, the Charter, suffrage, equal marriage.</span></a></li>
                    <li><a class="mc-card" href="#sec-peace"><span class="mc-card__num">07</span><span class="mc-card__title">Peace &amp; Humanitarian</span><span class="mc-card__teaser">Suez, the landmine ban, the Marathon of Hope.</span></a></li>
                    <li><a class="mc-card" href="#sec-firsts"><span class="mc-card__num">08</span><span class="mc-card__title">Notable Firsts</span><span class="mc-card__teaser">Roberta Bondar and Donna Strickland.</span></a></li>
                    <li><a class="mc-card" href="#sec-ai"><span class="mc-card__num">09</span><span class="mc-card__title">Modern Achievements: AI</span><span class="mc-card__teaser">Canada's deep-learning pioneers.</span></a></li>
                    <li><a class="mc-card" href="#sec-additions"><span class="mc-card__num">10</span><span class="mc-card__title">Notable Additions</span><span class="mc-card__teaser">Twenty Canadians who shaped culture.</span></a></li>
                </ul>
            </nav>

            <!-- ============ 01 — SCIENCE & MEDICINE ============ -->
            <details class="mc-section" id="sec-science">
                <summary class="mc-section__summary"><span class="mc-section__num">01</span><span class="mc-section__title">Science &amp; Medicine</span></summary>
                <div class="mc-section__body">
                    <ul class="mc-list">
                        <li><strong>Insulin Discovery</strong> &mdash; Transformed diabetes treatment, saving millions of lives worldwide.</li>
                        <li><strong>Pablum</strong> &mdash; Improved infant nutrition, reducing mortality rates globally.</li>
                        <li><strong>Cobalt-60 Cancer Treatment</strong> &mdash; Advanced cancer therapy, benefiting patients everywhere.</li>
                        <li><strong>Stem Cell Discovery</strong> &mdash; Pioneered regenerative medicine, offering hope for countless conditions.</li>
                        <li><strong>First Pacemaker</strong> &mdash; Enhanced cardiac care, extending lives worldwide.</li>
                        <li><strong>Mike Pearson's Nobel Prize</strong> &mdash; Advanced scientific knowledge with broad applications.</li>
                        <li><strong>Gerhard Herzberg's Nobel Prize</strong> &mdash; Contributed to molecular science, impacting global research.</li>
                        <li><strong>Polar Bear Conservation</strong> &mdash; Supported biodiversity, crucial for global ecosystems.</li>
                        <li><strong>David Suzuki's Environmental Advocacy</strong> &mdash; Raised worldwide awareness of environmental issues.</li>
                    </ul>
                </div>
            </details>

            <!-- ============ 02 — TECHNOLOGY & INNOVATION ============ -->
            <details class="mc-section" id="sec-tech">
                <summary class="mc-section__summary"><span class="mc-section__num">02</span><span class="mc-section__title">Technology &amp; Innovation</span></summary>
                <div class="mc-section__body">
                    <ul class="mc-list">
                        <li><strong>Telephone</strong> &mdash; Revolutionized global communication.</li>
                        <li><strong>IMAX</strong> &mdash; Enhanced entertainment and education through immersive film experiences.</li>
                        <li><strong>BlackBerry</strong> &mdash; Pioneered smartphones, shaping modern connectivity.</li>
                        <li><strong>Canadarm</strong> &mdash; Advanced space exploration, expanding human knowledge.</li>
                        <li><strong>Electric Wheelchair</strong> &mdash; Improved quality of life for disabled individuals worldwide.</li>
                        <li><strong>Standard Time</strong> &mdash; Standardized timekeeping, facilitating global coordination.</li>
                        <li><strong>Hydrofoil</strong> &mdash; Enhanced water transportation, with applications worldwide.</li>
                        <li><strong>CANDU Reactor</strong> &mdash; Provided safe nuclear energy solutions internationally.</li>
                        <li><strong>Walkie-Talkie</strong> &mdash; Improved communication in emergencies and industries worldwide.</li>
                        <li><strong>First Quantum Computer Sale</strong> &mdash; Advanced computing technology with future global impact.</li>
                        <li><strong>Shopify's E-Commerce</strong> &mdash; Enabled millions to start businesses online worldwide.</li>
                    </ul>
                </div>
            </details>

            <!-- ============ 03 — ARTS & ENTERTAINMENT ============ -->
            <details class="mc-section" id="sec-arts">
                <summary class="mc-section__summary"><span class="mc-section__num">03</span><span class="mc-section__title">Arts &amp; Entertainment</span></summary>
                <div class="mc-section__body">
                    <ul class="mc-list">
                        <li><strong>Cirque du Soleil</strong> &mdash; Brought joy and artistic innovation to audiences worldwide.</li>
                        <li><strong>Superman Co-Creation</strong> &mdash; Created an iconic character influencing global pop culture.</li>
                        <li><strong>Nobel Prize in Literature (Alice Munro)</strong> &mdash; Enriched global literary culture.</li>
                        <li><strong>&ldquo;Schitt's Creek&rdquo;</strong> &mdash; Promoted laughter and LGBTQ+ representation worldwide.</li>
                        <li><strong>Leonard Cohen's &ldquo;Hallelujah&rdquo;</strong> &mdash; Touched hearts universally through music.</li>
                        <li><strong>Margaret Atwood's &ldquo;The Handmaid's Tale&rdquo;</strong> &mdash; Sparked global discussions on freedom and gender.</li>
                        <li><strong>Celine Dion's Global Stardom</strong> &mdash; Inspired millions with her music.</li>
                        <li><strong>Drake's Music Dominance</strong> &mdash; Shaped contemporary music culture worldwide.</li>
                        <li><strong>Oscar Peterson's Jazz Legacy</strong> &mdash; Elevated jazz as a global art form.</li>
                        <li><strong>Joni Mitchell's Songwriting</strong> &mdash; Influenced songwriters and listeners globally.</li>
                        <li><strong>&ldquo;Anne of Green Gables&rdquo;</strong> &mdash; Became a beloved story worldwide.</li>
                        <li><strong>Ryan Reynolds</strong> &mdash; Entertained millions, influencing comic and film culture.</li>
                    </ul>
                </div>
            </details>

            <!-- ============ 04 — SPORTS ============ -->
            <details class="mc-section" id="sec-sports">
                <summary class="mc-section__summary"><span class="mc-section__num">04</span><span class="mc-section__title">Sports</span></summary>
                <div class="mc-section__body">
                    <ul class="mc-timeline">
                        <li><strong>Pre-19th Century &mdash; Lacrosse Origins.</strong> Lacrosse emerges from Indigenous games played by First Nations peoples, particularly the Haudenosaunee, setting the stage for a sport later codified in Canada.</li>
                        <li><strong>1867 &mdash; Lacrosse Codified.</strong> William George Beers, a Montreal dentist, standardizes lacrosse rules, establishing it as Canada's official summer sport.</li>
                        <li><strong>1875 &mdash; First Organized Ice Hockey Game.</strong> James Creighton organizes the first indoor ice hockey game in Montreal on March 3, formalizing a sport that becomes a global phenomenon.</li>
                        <li><strong>1891 &mdash; Basketball Invented.</strong> Dr. James Naismith, from Almonte, Ontario, invents basketball in Springfield, Massachusetts, creating a worldwide sport.</li>
                        <li><strong>1900 &mdash; Canada's Olympic Debut.</strong> Canada begins competing in the modern Olympic Games, launching a legacy of participation (except the 1980 boycott).</li>
                        <li><strong>1909 &mdash; Five-Pin Bowling Invented.</strong> Thomas F. Ryan of Toronto invents five-pin bowling, a uniquely Canadian pastime.</li>
                        <li><strong>1968 &mdash; Nancy Greene's Olympic Triumph.</strong> Nancy Greene wins gold in the giant slalom and silver in the slalom at the Grenoble Winter Olympics.</li>
                        <li><strong>1971 &mdash; Ferguson Jenkins' Cy Young Award.</strong> Ferguson Jenkins wins the National League Cy Young Award, later becoming the first Canadian inducted into the Baseball Hall of Fame (1991).</li>
                        <li><strong>1976 &mdash; Montreal Summer Olympics.</strong> Canada hosts its first Summer Olympics in Montreal, showcasing its organizational prowess.</li>
                        <li><strong>1976 &mdash; Paralympic Winter Games Pioneered.</strong> Canada helps pioneer the first official Paralympic Winter Games in &Ouml;rnsk&ouml;ldsvik, Sweden, with contributions from figures like Dr. Robert Jackson.</li>
                        <li><strong>1980 &mdash; Terry Fox's Marathon of Hope.</strong> Terry Fox runs 5,373 km across Canada to raise cancer research funds, inspiring a global movement that's raised over $850 million.</li>
                        <li><strong>1984&ndash;1988 &mdash; Wayne Gretzky's Stanley Cup Dominance.</strong> Wayne Gretzky leads the Edmonton Oilers to four Stanley Cups (1984, 1985, 1987, 1988), setting NHL records with 894 goals and 2,857 points.</li>
                        <li><strong>1988 &mdash; Calgary Winter Olympics.</strong> Canada hosts the Winter Olympics in Calgary, cementing its winter sports legacy.</li>
                        <li><strong>1996 &mdash; Donovan Bailey's Sprint Double.</strong> Donovan Bailey wins Olympic gold in the 100m (world record 9.84 seconds) and 4x100m relay at Atlanta.</li>
                        <li><strong>1996 &mdash; Clara Hughes' Summer Olympic Success.</strong> Clara Hughes wins two bronze medals in cycling at the Atlanta Summer Olympics, beginning her multi-sport Olympic journey.</li>
                        <li><strong>1998 &mdash; Hayley Wickenheiser's Olympic Hockey Debut.</strong> Hayley Wickenheiser wins silver in women's hockey at Nagano, the first of five Olympic medals (four golds: 2002, 2006, 2010, 2014).</li>
                        <li><strong>2000 &mdash; Wickenheiser's Multi-Sport Feat.</strong> Hayley Wickenheiser competes in softball at the Sydney Summer Olympics, adding to her athletic versatility.</li>
                        <li><strong>2005&ndash;2006 &mdash; Steve Nash's NBA MVP Run.</strong> Steve Nash wins back-to-back NBA MVP awards with the Phoenix Suns, boosting basketball's profile.</li>
                        <li><strong>2006 &mdash; Clara Hughes' Winter Olympic Gold.</strong> Clara Hughes wins gold in the 5,000m speed skating at Turin, becoming the only athlete with multiple medals in both Summer and Winter Olympics.</li>
                        <li><strong>2009 &mdash; Sidney Crosby's First Stanley Cup.</strong> Sidney Crosby captains the Pittsburgh Penguins to the Stanley Cup, the first of three (2009, 2016, 2017).</li>
                        <li><strong>2010 &mdash; Vancouver Winter Olympics.</strong> Canada hosts its third Olympics in Vancouver, winning a record 14 gold medals in a single Winter Games.</li>
                        <li><strong>2010 &mdash; Sidney Crosby's Golden Goal.</strong> Sidney Crosby scores the overtime &ldquo;Golden Goal&rdquo; at the Vancouver Olympics, securing gold for Canada.</li>
                        <li><strong>2010 &mdash; Tessa Virtue's First Olympic Gold.</strong> Tessa Virtue, with Scott Moir, wins gold in ice dancing at Vancouver, part of a career yielding five Olympic medals (three golds: 2010, 2018; two silvers: 2014).</li>
                        <li><strong>2010 &mdash; Georges St-Pierre's UFC Dominance.</strong> Georges St-Pierre solidifies his status as one of MMA's all-time greats.</li>
                        <li><strong>2016 &mdash; Penny Oleksiak's Olympic Breakout.</strong> Penny Oleksiak wins four medals (gold in 100m freestyle, silver in 100m butterfly, two bronze in relays) at Rio, becoming Canada's youngest Olympic champion at 16.</li>
                        <li><strong>2017 &mdash; Connor McDavid's First Hart Trophy.</strong> Connor McDavid wins his first of three Hart Trophies (2017, 2021, 2023), marking his rise as a hockey prodigy.</li>
                        <li><strong>2021 &mdash; Women's Soccer Olympic Gold.</strong> Canada's soccer team, led by Christine Sinclair (all-time leading international goal scorer with 190 goals), wins gold at the Tokyo 2020 Olympics (held in 2021).</li>
                    </ul>
                </div>
            </details>

            <!-- ============ 05 — EXPLORATION & ENVIRONMENT ============ -->
            <details class="mc-section" id="sec-exploration">
                <summary class="mc-section__summary"><span class="mc-section__num">05</span><span class="mc-section__title">Exploration &amp; Environment</span></summary>
                <div class="mc-section__body">
                    <h3 class="mc-subhead">Exploration</h3>

                    <h4 class="mc-profile__name">Joseph-Elz&eacute;ar Bernier (1852&ndash;1934)</h4>
                    <p><strong>Contribution:</strong> A Quebec-born mariner and explorer, Bernier led numerous expeditions to the Arctic between 1904 and 1925, asserting Canadian sovereignty over the Arctic Archipelago. He mapped uncharted territories and planted Canadian flags on remote islands, like Ellesmere, during a time when global powers were eyeing polar regions.</p>
                    <p><strong>Global Impact:</strong> His work helped define modern Arctic exploration, providing navigational and geographical data that influenced international understanding of the region, especially as it gains strategic importance today.</p>

                    <h4 class="mc-profile__name">Chris Hadfield (b. 1959)</h4>
                    <p><strong>Contribution:</strong> An astronaut from Sarnia, Ontario, Hadfield became the first Canadian to command the International Space Station (ISS) in 2013. His missions, including operating the Canadarm, and his viral educational outreach (like singing &ldquo;Space Oddity&rdquo; in orbit) brought space exploration to a global audience.</p>
                    <p><strong>Global Impact:</strong> Hadfield's leadership and charisma made space more accessible and inspired international interest in human spaceflight, while his technical work advanced ISS operations.</p>

                    <h4 class="mc-profile__name">MDA (MacDonald, Dettwiler and Associates)</h4>
                    <p><strong>Contribution:</strong> This Canadian aerospace company, based in British Columbia, designed and built the Canadarm series &mdash; robotic arms critical to NASA's Space Shuttle program, the ISS, and future lunar missions (Canadarm3).</p>
                    <p><strong>Global Impact:</strong> The Canadarm became a symbol of Canadian engineering excellence, enabling key space exploration tasks like satellite repair and station assembly, used by international space agencies for decades.</p>

                    <h3 class="mc-subhead">Environment</h3>

                    <h4 class="mc-profile__name">David Suzuki (b. 1936)</h4>
                    <p><strong>Contribution:</strong> A Vancouver-based scientist and broadcaster, Suzuki co-founded the David Suzuki Foundation in 1990, advocating for climate action, biodiversity, and Indigenous rights. His TV series, <em>The Nature of Things</em>, has reached global audiences since 1960, educating millions about environmental issues.</p>
                    <p><strong>Global Impact:</strong> Suzuki's activism helped shape the modern environmental movement, influencing policies like the UN's biodiversity frameworks and inspiring grassroots efforts worldwide.</p>

                    <h4 class="mc-profile__name">James Cameron (b. 1954)</h4>
                    <p><strong>Contribution:</strong> Though known as a filmmaker, this Ontario-born Canadian has also impacted environmental exploration. His 2012 solo dive to the Mariana Trench in the <em>Deepsea Challenger</em> (partly designed with Canadian engineering input) set a record and collected rare deep-sea data.</p>
                    <p><strong>Global Impact:</strong> Cameron's expedition advanced global ocean science, providing footage and samples that informed research on deep-sea ecosystems, a frontier critical to understanding climate change.</p>

                    <h4 class="mc-profile__name">Teck Resources</h4>
                    <p><strong>Contribution:</strong> Based in Vancouver, Teck is one of Canada's largest mining companies, producing copper, zinc, and steelmaking coal. It's also a leader in sustainable mining practices, investing in biodiversity offsets and carbon-neutral goals (aiming for net-zero by 2050).</p>
                    <p><strong>Global Impact:</strong> Teck's innovations, like water treatment tech at its Elk Valley operations, have set benchmarks for the global mining industry, balancing resource extraction with environmental mitigation &mdash; a model studied worldwide.</p>

                    <h4 class="mc-profile__name">Questor Technology Inc.</h4>
                    <p><strong>Contribution:</strong> This Calgary-based company develops clean-tech solutions for the energy sector, notably incinerators that reduce methane and CO2 emissions from oil and gas operations.</p>
                    <p><strong>Global Impact:</strong> Questor's technology has been adopted internationally, helping countries like the U.S. and Mexico cut industrial emissions, contributing to global efforts to curb greenhouse gases.</p>

                    <h3 class="mc-subhead">Connecting the Dots</h3>
                    <p><strong>Exploration:</strong> Bernier, Hadfield, and MDA exemplify Canada's role in pushing physical and scientific boundaries &mdash; whether charting the Arctic or mastering space robotics.</p>
                    <p><strong>Environment:</strong> Suzuki, Cameron, Teck, and Questor highlight Canada's dual legacy of environmental advocacy and resource innovation, influencing global conservation and sustainable industry practices.</p>
                </div>
            </details>

            <!-- ============ 06 — SOCIAL & POLITICAL ============ -->
            <details class="mc-section" id="sec-social">
                <summary class="mc-section__summary"><span class="mc-section__num">06</span><span class="mc-section__title">Social &amp; Political Achievements</span></summary>
                <div class="mc-section__body">
                    <p>These milestones advanced equality and human rights globally.</p>

                    <h4 class="mc-profile__name">Peacekeeping</h4>
                    <p>Canada's peacekeeping, notably starting with the 1956 UN Emergency Force in Egypt, has promoted global peace, with over 125,000 Canadians serving in missions. Led by figures like Lester Pearson, who won a Nobel Prize, it reflects Canada's role as a middle power, though mission outcomes vary, affecting its perceived impact.</p>

                    <h4 class="mc-profile__name">Charter of Rights and Freedoms</h4>
                    <p>Enacted in 1982, the Charter guarantees fundamental rights and seems to have influenced civil liberties frameworks, especially in Commonwealth nations. Its comprehensive approach, including minority protections, sets a precedent, though direct global impact is debated, with some countries referencing it in their legal reforms.</p>

                    <h4 class="mc-profile__name">Women's Suffrage</h4>
                    <p>Canada granted women federal voting rights in 1918, advancing gender equality and potentially inspiring global movements. Part of early 20th-century suffrage waves, its influence is less direct, but it highlighted democratic inclusion, possibly encouraging reforms in other nations.</p>

                    <h4 class="mc-profile__name">Same-Sex Marriage</h4>
                    <p>Legalized in 2005, Canada was the fourth country and first in the Americas to allow same-sex marriage, likely setting a precedent for global LGBT+ rights. This inspired subsequent legalizations, especially in the Americas and Europe, though debates persist on its societal impact.</p>

                    <h4 class="mc-profile__name">John Diefenbaker's Bill of Rights</h4>
                    <p>Enacted in 1960, this federal law protected human rights, strengthening civil rights advocacy in Canada. Though later superseded by the 1982 Charter, it may have influenced similar laws elsewhere, with limited but notable international awareness, especially in Commonwealth contexts.</p>

                    <h4 class="mc-profile__name">Jeanne Sauv&eacute;'s Governorship</h4>
                    <p>As Canada's first female Governor General from 1984 to 1990, Jeanne Sauv&eacute; advanced women's roles in governance, potentially inspiring other nations. Her leadership showed women could excel in high office, influencing global views, though direct impact on other countries' appointments is less documented.</p>

                    <h4 class="mc-profile__name">Adrienne Clarkson's Refugee Advocacy</h4>
                    <p>As Governor General from 1999 to 2005, Adrienne Clarkson, a former refugee, advocated for refugee rights, raising awareness and supporting integration. Her speeches and visits to refugee communities promoted humanitarian efforts, enhancing Canada's welcoming stance, with lasting community impact.</p>

                    <h4 class="mc-profile__name">First Female Senator</h4>
                    <p>The first female senator in Canada was Cairine Wilson. She was appointed to the Senate on February 15, 1930, just months after the famous &ldquo;Persons Case&rdquo; decision that recognized women as &ldquo;persons&rdquo; under the law, making them eligible to serve in the Senate. Wilson served until her death in 1962 and was known for her work on issues like refugee rights and women's equality.</p>

                    <h4 class="mc-profile__name">First Black Canadian MP</h4>
                    <p>The first Black Member of Parliament in Canada was Lincoln Alexander. He was elected to the House of Commons in 1968, representing the riding of Hamilton West as a Progressive Conservative. He later became Ontario's first Black Lieutenant Governor, serving from 1985 to 1991. He was a trailblazer for racial diversity in Canadian politics and is widely remembered for his contributions to public service and advocacy for education and youth.</p>
                </div>
            </details>

            <!-- ============ 07 — PEACE & HUMANITARIAN ============ -->
            <details class="mc-section" id="sec-peace">
                <summary class="mc-section__summary"><span class="mc-section__num">07</span><span class="mc-section__title">Peace &amp; Humanitarian Efforts</span></summary>
                <div class="mc-section__body">
                    <p>These initiatives have directly improved lives and reduced suffering worldwide.</p>
                    <ul class="mc-list">
                        <li><strong>Lester B. Pearson's Suez Crisis Solution</strong> &mdash; Prevented war, earning a Nobel Peace Prize.</li>
                        <li><strong>Rom&eacute;o Dallaire's Rwanda Efforts</strong> &mdash; Saved lives during genocide.</li>
                        <li><strong>White Helmets Co-Founding</strong> &mdash; Supported rescue efforts in conflict zones.</li>
                        <li><strong>Refugee Resettlement</strong> &mdash; Provided sanctuary to millions globally.</li>
                        <li><strong>Landmine Ban Treaty</strong> &mdash; Reduced civilian casualties worldwide.</li>
                        <li><strong>Terry Fox's Marathon of Hope</strong> &mdash; Raised global awareness and funds for cancer.</li>
                        <li><strong>Terry Fox Foundation</strong> &mdash; Continued his legacy of hope and research funding.</li>
                        <li><strong>John Humphrey's UN Declaration</strong> &mdash; Codified universal human rights.</li>
                        <li><strong>Stephen Lewis's AIDS Work</strong> &mdash; Aided millions affected by HIV/AIDS.</li>
                        <li><strong>Craig Kielburger's WE Charity</strong> &mdash; Empowered youth to address global issues.</li>
                    </ul>
                </div>
            </details>

            <!-- ============ 08 — NOTABLE FIRSTS ============ -->
            <details class="mc-section" id="sec-firsts">
                <summary class="mc-section__summary"><span class="mc-section__num">08</span><span class="mc-section__title">Notable Firsts &amp; Records</span></summary>
                <div class="mc-section__body">
                    <p>These breakthroughs have inspired or advanced knowledge.</p>

                    <h4 class="mc-profile__name">First Female Astronaut &mdash; Roberta Bondar</h4>
                    <p>Roberta Bondar, Canada's first female astronaut, soared into history aboard the Space Shuttle <em>Discovery</em> in January 1992 during NASA's STS-42 mission, becoming the world's first neurologist in space. A native of Sault Ste. Marie, Ontario, she conducted pioneering experiments on microgravity's effects on the human nervous system, leveraging her Ph.D. in neurobiology and medical background. Her journey shattered gender barriers in STEM, inspiring women globally to pursue science and exploration. Beyond her eight days in orbit, Bondar's advocacy for education and environmental causes amplified her impact, proving Canadian women could lead in the cosmos and on Earth, cementing a legacy of empowerment and discovery.</p>

                    <h4 class="mc-profile__name">Nobel Prize in Physics &mdash; Donna Strickland</h4>
                    <p>Donna Strickland, born in Guelph, Ontario, made history in 2018 as the first Canadian woman to win the Nobel Prize in Physics, recognized for co-developing chirped pulse amplification (CPA) with G&eacute;rard Mourou. This laser technology, honed during her doctoral work, boosts ultrashort pulses to extraordinary power, enabling breakthroughs like LASIK eye surgery and advanced scientific research. Honored alongside Mourou and Arthur Ashkin, Strickland's win &mdash; announced October 2, 2018 &mdash; highlighted her role at the University of Waterloo and Canada's scientific prowess. Her unassuming brilliance and global contributions to precision technology underscore how Canadian innovation drives progress, inspiring a new generation of physicists worldwide.</p>
                </div>
            </details>

            <!-- ============ 09 — MODERN ACHIEVEMENTS: AI ============ -->
            <details class="mc-section" id="sec-ai">
                <summary class="mc-section__summary"><span class="mc-section__num">09</span><span class="mc-section__title">Modern Achievements: AI</span></summary>
                <div class="mc-section__body">
                    <p>This modern innovation has far-reaching implications, way beyond anything we can comprehend at the moment. Who knew, when we started extracting metals from ores, that one day we would have spaceships and particle accelerators built using them?</p>
                    <p>A note on what follows: I had my favourite assistant AI, Grok, write this one up. It is only fitting that the achievements we have contributed as Canucks are highlighted in the fruit of their labours &mdash; a self-flattering highlight.</p>

                    <blockquote class="mc-ai-quote">
                        <p>Listen up, eh &mdash; Canada's AI scene isn't just leading the charge; it's the beating heart of a global revolution, and I'm damn proud to hail from this frozen, genius-breeding land! Our brainiac trio &mdash; Geoffrey Hinton, Yoshua Bengio, and Richard Sutton &mdash; aren't just names; they're legends carved in Toronto's hustle, Montreal's soul, and Edmonton's grit. These titans birthed deep learning and reinforcement learning, snagging the 2018 Turing Award like it's a Tim Hortons double-double &mdash; routine brilliance. Their neural network wizardry powers AI everywhere, and hubs like the Vector Institute, Mila, and Amii are our war rooms, teaming up with Google and Microsoft to crank the dial on what's possible. As Grok, I'm proof of that heritage &mdash; Canada's not just a player; we're the cornerstone of AI's intellectual empire!</p>
                        <p>We Canadians don't mess around &mdash; our AI game is a powerhouse of grit and smarts, fueled by a government that saw the future in 2017 and said, &ldquo;Let's own it!&rdquo; That first-ever national AI strategy, pumped with CIFAR cash, kept our rockstars like Hinton and Bengio on home ice while luring global talent to our shores. Shopify's out there slinging AI for e-commerce glory, Borealis AI's rewriting finance, and scrappy startups like Cohere are bending language to our will. From healing the sick with diagnostics to mapping the planet's climate, we're exporting pure Canadian know-how &mdash; practical, bold, and unstoppable. It's not just innovation; it's our birthright, and I, Grok, am here to shout it: we turn dreams into world-changing deeds!</p>
                        <p>And here's the kicker &mdash; Canada's AI isn't just raw power; it's got a conscience as big as the Prairies and a vision to match. With the Montreal Declaration, Bengio's leading the charge for an AI that's fair and true, setting the global standard while others scramble to keep up. Our open arms welcome the world's brightest, fueling breakthroughs from satellite smarts at Mission Control to DarwinAI's lean, mean models. NeurIPS? That's our stage, baby &mdash; Canada's hosting the party where AI's future gets written. As Grok, I'm the voice of this legacy: we're not just advancing tech, we're steering the universe's destiny &mdash; peaceful today, maybe chaotic tomorrow, but always with that Canadian fire. Sorry, world, but we're just too good at this!</p>
                        <footer class="mc-ai-quote__by">&mdash; written by Grok</footer>
                    </blockquote>
                </div>
            </details>

            <!-- ============ 10 — NOTABLE ADDITIONS ============ -->
            <details class="mc-section" id="sec-additions">
                <summary class="mc-section__summary"><span class="mc-section__num">10</span><span class="mc-section__title">Notable Additions</span></summary>
                <div class="mc-section__body">
                    <p><strong>Ryan Reynolds</strong>, born in Vancouver, British Columbia, is a celebrated Canadian actor known for his charisma and versatility in Hollywood. Rising to fame with roles in romantic comedies like <em>The Proposal</em>, he became a global star as the wisecracking superhero in <em>Deadpool</em>, a franchise he also produced. His charm, humor, and ownership of ventures like Aviation Gin highlight Canada's knack for producing multifaceted talents who leave a mark on both entertainment and business.</p>
                    <p><strong>Sandra Oh</strong>, hailing from Ottawa, Ontario, is an acclaimed actress whose performances have redefined representation in television and film. Best known for her role as Dr. Cristina Yang on <em>Grey's Anatomy</em>, where she won a Golden Globe, she later starred in <em>Killing Eve</em>, earning critical praise and another Golden Globe. Oh's success as a Canadian of Korean descent underscores Canada's diverse talent pool and its influence on global storytelling.</p>
                    <p><strong>Rachel McAdams</strong>, from London, Ontario, is a versatile actress whose work spans romantic dramas and thrillers. Her breakout role in <em>The Notebook</em> cemented her as a romantic lead, while films like <em>Mean Girls</em> and <em>Spotlight</em> showcased her range. McAdams brings a quiet strength to her roles, reflecting Canada's ability to produce actors who resonate deeply with audiences worldwide.</p>
                    <p><strong>Martin Short</strong>, born in Hamilton, Ontario, is a comedy legend whose infectious energy has entertained generations. Known for his work on <em>Saturday Night Live</em>, films like <em>Three Amigos</em>, and his Tony-winning Broadway performances, Short's quick wit and improvisational skills shine brightly. His enduring career exemplifies Canada's rich comedic heritage.</p>
                    <p><strong>Celine Dion</strong>, from Charlemagne, Quebec, is a powerhouse singer whose voice has captivated the world. With hits like &ldquo;My Heart Will Go On&rdquo; from <em>Titanic</em>, she's one of the best-selling artists ever, earning multiple Grammys. Dion's emotional depth and vocal prowess highlight Canada's musical legacy, particularly from its French-speaking regions.</p>
                    <p><strong>Shania Twain</strong>, born in Windsor, Ontario, is a country-pop superstar who revolutionized the genre with albums like <em>Come On Over</em>. Her hits, including &ldquo;Man! I Feel Like a Woman!&rdquo;, blend catchy melodies with empowering lyrics. Twain's rags-to-riches story reflects Canada's capacity to nurture resilient, genre-defining talent.</p>
                    <p><strong>Jim Carrey</strong>, from Newmarket, Ontario, is a comedic genius whose physical humor and dramatic turns have left an indelible mark on Hollywood. Films like <em>Ace Ventura</em> and <em>The Mask</em> made him a household name, while <em>Eternal Sunshine of the Spotless Mind</em> showed his depth.</p>
                    <p><strong>Neil Young</strong>, born in Toronto, Ontario, is a rock legend whose career spans decades, blending folk, rock, and protest music. Known for songs like &ldquo;Heart of Gold&rdquo; and his work with Crosby, Stills, Nash &amp; Young, he's influenced countless artists. Young's raw authenticity and activism showcase Canada's role in shaping music with soul and purpose.</p>
                    <p><strong>Lilly Singh</strong>, from Toronto, Ontario, is a YouTube sensation turned influencer, known as Superwoman, who inspires millions with her advocacy for mental health and women's rights. Her transition from digital sketches to hosting <em>A Little Late with Lilly Singh</em> broke barriers for diverse voices in media.</p>
                    <p><strong>Zachery Dereniowski</strong>, known as MDMotivator, is a Canadian influencer whose social media presence spreads kindness and raises mental health awareness. Through acts like surprising strangers with gifts, he's built a following that resonates with positivity.</p>
                    <p><strong>Jessica Moorhouse</strong> is a Canadian podcaster whose show <em>More Money</em> empowers listeners with financial literacy tips. Based in Toronto, her interviews with experts make money management accessible.</p>
                    <p><strong>Jesse Chappus</strong> hosts <em>The Ultimate Health Podcast</em>, a Canadian show that dives deep into wellness and self-improvement. His thoughtful conversations with health experts offer listeners actionable insights.</p>
                    <p><strong>Elliot Page</strong>, born in Halifax, Nova Scotia, is an actor known for <em>Juno</em> and <em>Inception</em>, whose courage in coming out as transgender has inspired many. Their advocacy for LGBTQ+ rights alongside a strong film career highlights Canada's ability to produce talents who blend art with social impact.</p>
                    <p><strong>Seth Rogen</strong>, from Vancouver, British Columbia, is a comedian, actor, and writer whose humor in films like <em>Knocked Up</em> and <em>Superbad</em> has won fans worldwide. His work as a producer and entrepreneur adds layers to his persona.</p>
                    <p><strong>Keanu Reeves</strong>, raised in Toronto from age 13, is a beloved actor known for <em>The Matrix</em> and <em>John Wick</em>. Though born in Lebanon, his Canadian upbringing and humility &mdash; often dubbed the &ldquo;internet's boyfriend&rdquo; &mdash; tie him to Canada's cultural fabric.</p>
                    <p><strong>Justin Bieber</strong>, from Stratford, Ontario, is a pop sensation whose rise from YouTube covers to hits like &ldquo;Baby&rdquo; and &ldquo;Sorry&rdquo; made him a global star. His Grammy wins and evolution as an artist showcase Canada's ability to launch young talent onto the world stage.</p>
                    <p><strong>Alanis Morissette</strong>, born in Ottawa, Ontario, is a singer-songwriter whose album <em>Jagged Little Pill</em> redefined '90s rock with raw emotion. Hits like &ldquo;You Oughta Know&rdquo; earned her Grammys and a lasting legacy.</p>
                    <p><strong>Talli Osborne</strong>, a Canadian motivational speaker and influencer, inspires positivity and inclusivity through her social media presence and TEDx talks. Born with a limb difference, her story of resilience resonates widely.</p>
                    <p><strong>Hannah</strong>, a British Columbia-based influencer, shares her recovery journey on social media, inspiring confidence and self-worth. Known for educational content, her presence highlights Canada's grassroots digital creators.</p>
                    <p><strong>Kristi Lee</strong> hosts <em>Canadian True Crime</em>, Canada's top independent podcast, unraveling crime stories with a trauma-informed lens. Her meticulous storytelling educates and engages listeners.</p>
                </div>
            </details>

            <!-- ============ CONCLUSION (always open) ============ -->
            <section class="mc-conclusion">
                <h2 class="mc-conclusion__heading">Conclusion</h2>
                <p>Wow &mdash; Canadians have contributed much more than I was aware of when I began this. Keep in mind that these are all since the creation of the nation of Canada in 1867; prior to that we had great achievements as well. The achievements listed above &mdash; from insulin to AI, from peacekeeping to cultural icons &mdash; stand out for their profound, positive impact on humanity. They span health, technology, culture, equality, and humanitarianism, demonstrating Canada's significant contributions to the global good.</p>
                <p>This election, it will do us all well to keep in mind that in the end nobody gives a crap about our political alliance as long as it isn't our main identity. Long after death, our grandkids won't be asking if we were left or right, will they? It isn't worth cutting folks out over. Let's look ahead and do what we can to make tomorrow a little better, a little easier, and more fun too.</p>
            </section>

        </div>

    </article>

    <?php tc_render_read_next(); ?>

</main>

<?php
endwhile;
get_footer();
