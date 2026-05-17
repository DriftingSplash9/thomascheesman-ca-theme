<?php
/**
 * Front Page / Homepage Template
 * TC 'ventures Child Theme
 */

get_header(); ?>

<main id="primary" class="site-main">
    
    <!-- HERO SECTION -->
    <section class="hero-section">
        <div class="container">
            <h1 class="hero-title kinetic-text" aria-label="Welcome to TC 'ventures">
                Welcome to TC 'ventures
            </h1>
            <p class="hero-subtitle kinetic-fade">
                Exploring life, family, and what matters most to me
            </p>
        </div>
    </section>

    <!-- THREE PILLARS SECTION -->
    <section class="pillars-section">
        <div class="container">
            <h2 class="pillars-heading kinetic-text-scroll" aria-label="What Defines TC 'ventures">What Defines TC 'ventures</h2>

            <div class="pillars-grid">

                <!-- PILLAR 1: FAMILY -->
                <div class="pillar-card">
                    <div class="pillar-icon">
                        <span>👨‍👩‍👧‍👦</span>
                    </div>
                    <h3>Family &amp; Stories</h3>
                    <p>
                        Life's greatest joy comes from the people we love. Discover the stories of Patience, Daniel, Faith, and the extended family that makes me whole.
                    </p>
                    <a href="<?php echo home_url('/family'); ?>">Explore My Family Stories &rarr;</a>
                </div>

                <!-- PILLAR 2: RARE DISEASE & BYR -->
                <div class="pillar-card">
                    <div class="pillar-icon">
                        <span>🔬</span>
                    </div>
                    <h3>Rare Disease &amp; BYR</h3>
                    <p>
                        Hajdu-Cheney Syndrome shaped how I think about rare conditions. I built Bare Your Rare so patients with ultra-rare diseases could tell their stories together — that's where the deeper writing lives.
                    </p>
                    <a href="https://bareyourrare.org" target="_blank" rel="noopener noreferrer">Visit Bare Your Rare &rarr;</a>
                </div>

                <!-- PILLAR 3: COMMUNITY -->
                <div class="pillar-card">
                    <div class="pillar-icon">
                        <span>🤝</span>
                    </div>
                    <h3>Community &amp; Service</h3>
                    <p>
                        Giving back matters. I volunteer with Grande Prairie Residential Society to provide accessible housing in our community.
                    </p>
                    <a href="https://www.gpresidentialsociety.com" target="_blank" rel="noopener noreferrer">Visit GPRS (I created this website too!) &rarr;</a>
                </div>

            </div>
        </div>
    </section>

    <!-- LATEST POSTS SECTION -->
    <section class="blog-section scroll-animate">
        <div class="container">
            <h2>Latest Blog Posts</h2>

            <div class="posts-grid">
                <?php
                $args = array(
                    'post_type'      => 'post',
                    'posts_per_page' => 5,
                    'orderby'        => 'date',
                    'order'          => 'DESC',
                );

                $query = new WP_Query( $args );

                if ( $query->have_posts() ) :
                    while ( $query->have_posts() ) : $query->the_post();
                        ?>
                        <article class="post-card">

                            <?php if ( has_post_thumbnail() ) : ?>
                                <div class="post-card-thumb">
                                    <?php the_post_thumbnail( 'medium' ); ?>
                                </div>
                            <?php endif; ?>

                            <div class="post-card-body">
                                <div class="post-card-meta">
                                    <?php echo get_the_date( 'F j, Y' ); ?>
                                </div>

                                <h3>
                                    <a href="<?php the_permalink(); ?>">
                                        <?php the_title(); ?>
                                    </a>
                                </h3>

                                <p>
                                    <?php echo wp_trim_words( get_the_excerpt(), 20 ); ?>
                                </p>

                                <a href="<?php the_permalink(); ?>" class="post-card-readmore">
                                    Read More &rarr;
                                </a>
                            </div>
                        </article>
                        <?php
                    endwhile;
                    wp_reset_postdata();
                endif;
                ?>
            </div>

            <div class="blog-section-cta">
                <a href="<?php echo home_url('/blog'); ?>" class="btn-primary">View All Posts</a>
            </div>
        </div>
    </section>

    <!-- CTA SECTION -->
    <section class="cta-section scroll-animate">
        <div class="container">
            <h2>Let's Connect</h2>
            <p>
                Have questions? Want to chat? I'd love to hear from you. Get in touch and let's build something meaningful together.
            </p>
            <a href="<?php echo home_url('/contact'); ?>" class="btn-secondary">Get In Touch</a>
        </div>
    </section>

</main>

<?php get_footer(); ?>