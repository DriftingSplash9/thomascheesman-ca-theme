<?php
/**
 * Front Page / Homepage Template
 * TC 'ventures Child Theme
 */

get_header(); ?>

<main id="primary" class="site-main">
    
    <!-- HERO SECTION -->
    <section class="hero-section" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 120px 0; text-align: center; color: white;">
        <div class="container" style="max-width: 900px; margin: 0 auto; padding: 0 20px;">
            <h1 class="hero-title" style="font-size: 3.5rem; margin: 0 0 20px 0; font-weight: 700; line-height: 1.2;">
                Welcome to TC 'ventures — DEPLOY TEST 1
            </h1>
            <p class="hero-subtitle" style="font-size: 1.25rem; margin: 0; opacity: 0.95; font-weight: 300;">
                Exploring life, family, and what matters most
            </p>
        </div>
    </section>

    <!-- THREE PILLARS SECTION -->
    <section class="pillars-section scroll-animate" style="padding: 80px 20px; background: #f9f9f9;">
        <div class="container" style="max-width: 1200px; margin: 0 auto;">
            <h2 style="text-align: center; font-size: 2.5rem; margin-bottom: 60px; color: #333;">What Defines TC 'ventures</h2>
            
            <div class="pillars-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 40px;">
                
                <!-- PILLAR 1: FAMILY -->
                <div class="pillar-card scroll-animate" style="background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); transition: transform 0.3s ease;">
                    <div class="pillar-icon" style="width: 60px; height: 60px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 20px;">
                        <span style="font-size: 30px;">👨‍👩‍👧‍👦</span>
                    </div>
                    <h3 style="font-size: 1.5rem; margin: 0 0 15px 0; color: #333;">Family & Stories</h3>
                    <p style="color: #666; line-height: 1.6; margin: 0;">
                        Life's greatest joy comes from the people we love. Discover the stories of Patience, Daniel, Faith, and the extended family that makes us whole.
                    </p>
                    <a href="<?php echo home_url('/family'); ?>" style="display: inline-block; margin-top: 15px; color: #667eea; text-decoration: none; font-weight: 600;">
                        Explore Family Stories →
                    </a>
                </div>

                <!-- PILLAR 2: KNOWLEDGE & HCS -->
                <div class="pillar-card scroll-animate" style="background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); transition: transform 0.3s ease;">
                    <div class="pillar-icon" style="width: 60px; height: 60px; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 20px;">
                        <span style="font-size: 30px;">🔬</span>
                    </div>
                    <h3 style="font-size: 1.5rem; margin: 0 0 15px 0; color: #333;">Knowledge & HCS</h3>
                    <p style="color: #666; line-height: 1.6; margin: 0;">
                        Living with Hajdu-Cheney Syndrome means learning to adapt. I share insights, research, and personal experiences about HCS.
                    </p>
                    <a href="https://buildingyourrare.com" target="_blank" rel="noopener noreferrer" style="display: inline-block; margin-top: 15px; color: #f5576c; text-decoration: none; font-weight: 600;">
                        Learn More at BYR →
                    </a>
                </div>

                <!-- PILLAR 3: COMMUNITY -->
                <div class="pillar-card scroll-animate" style="background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); transition: transform 0.3s ease;">
                    <div class="pillar-icon" style="width: 60px; height: 60px; background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 20px;">
                        <span style="font-size: 30px;">🤝</span>
                    </div>
                    <h3 style="font-size: 1.5rem; margin: 0 0 15px 0; color: #333;">Community & Service</h3>
                    <p style="color: #666; line-height: 1.6; margin: 0;">
                        Giving back matters. I volunteer with Grande Prairie Residential Society to provide accessible housing in our community.
                    </p>
                    <a href="https://www.gpresidentialsociety.com" target="_blank" rel="noopener noreferrer" style="display: inline-block; margin-top: 15px; color: #00f2fe; text-decoration: none; font-weight: 600;">
                        Visit GPRS →
                    </a>
                </div>

            </div>
        </div>
    </section>

    <!-- LATEST POSTS SECTION -->
    <section class="blog-section scroll-animate" style="padding: 80px 20px; background: white;">
        <div class="container" style="max-width: 1200px; margin: 0 auto;">
            <h2 style="text-align: center; font-size: 2.5rem; margin-bottom: 60px; color: #333;">Latest Blog Posts</h2>
            
            <div class="posts-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 40px;">
                <?php
                $args = array(
                    'post_type'      => 'post',
                    'posts_per_page' => 3,
                    'orderby'        => 'date',
                    'order'          => 'DESC',
                );
                
                $query = new WP_Query( $args );
                
                if ( $query->have_posts() ) :
                    while ( $query->have_posts() ) : $query->the_post();
                        ?>
                        <article class="post-card scroll-animate" style="background: #f9f9f9; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.08); transition: transform 0.3s ease;">
                            
                            <?php if ( has_post_thumbnail() ) : ?>
                                <div style="height: 220px; overflow: hidden;">
                                    <?php the_post_thumbnail( 'medium', array( 'style' => 'width: 100%; height: 100%; object-fit: cover;' ) ); ?>
                                </div>
                            <?php endif; ?>
                            
                            <div style="padding: 30px;">
                                <div style="color: #667eea; font-size: 0.9rem; font-weight: 600; text-transform: uppercase; margin-bottom: 10px;">
                                    <?php echo get_the_date( 'F j, Y' ); ?>
                                </div>
                                
                                <h3 style="margin: 0 0 15px 0; font-size: 1.35rem; line-height: 1.4;">
                                    <a href="<?php the_permalink(); ?>" style="color: #333; text-decoration: none;">
                                        <?php the_title(); ?>
                                    </a>
                                </h3>
                                
                                <p style="color: #666; line-height: 1.6; margin: 0 0 20px 0;">
                                    <?php echo wp_trim_words( get_the_excerpt(), 20 ); ?>
                                </p>
                                
                                <a href="<?php the_permalink(); ?>" style="color: #667eea; text-decoration: none; font-weight: 600; display: inline-block;">
                                    Read More →
                                </a>
                            </div>
                        </article>
                        <?php
                    endwhile;
                    wp_reset_postdata();
                endif;
                ?>
            </div>

            <div style="text-align: center; margin-top: 60px;">
                <a href="<?php echo home_url('/blog'); ?>" class="btn-primary" style="display: inline-block; padding: 15px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; transition: transform 0.3s ease;">
                    View All Posts
                </a>
            </div>
        </div>
    </section>

    <!-- CTA SECTION -->
    <section class="cta-section scroll-animate" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 80px 20px; color: white; text-align: center;">
        <div class="container" style="max-width: 700px; margin: 0 auto;">
            <h2 style="font-size: 2.5rem; margin: 0 0 20px 0; font-weight: 700;">Let's Connect</h2>
            <p style="font-size: 1.1rem; margin: 0 0 30px 0; opacity: 0.95;">
                Have questions? Want to chat? I'd love to hear from you. Get in touch and let's build something meaningful together.
            </p>
            <a href="<?php echo home_url('/contact'); ?>" class="btn-secondary" style="display: inline-block; padding: 15px 40px; background: white; color: #667eea; text-decoration: none; border-radius: 8px; font-weight: 600; transition: transform 0.3s ease; cursor: pointer;">
                Get In Touch
            </a>
        </div>
    </section>

</main>

<?php get_footer(); ?>