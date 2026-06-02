<?php
/**
 * Shared heritage breadcrumb trail.
 *
 * Replaces the single "← back" link that the heritage hub, the short spokes,
 * and the long-reads each used to carry, with a full hierarchical trail:
 *
 *   Family › Heritage › The Dochertys › The McIvers
 *
 * Render by setting $tc_crumbs (ordered, root → current) and require()-ing
 * this file:
 *
 *   $tc_crumbs = array(
 *       array( 'label' => 'Family',        'url' => home_url( '/family' ) ),
 *       array( 'label' => 'Heritage',      'url' => home_url( '/family/heritage' ) ),
 *       array( 'label' => 'The Dochertys', 'url' => home_url( '/family/heritage/dochertys' ) ),
 *       array( 'label' => 'The McIvers' ),   // last crumb, no 'url' = current page
 *   );
 *   require get_stylesheet_directory() . '/inc/heritage-breadcrumb.php';
 *
 * The final crumb (the one with no 'url') renders as the current page
 * (aria-current="page"); every earlier crumb is a link.
 */

if ( ! defined( 'ABSPATH' ) ) { exit; }

$tc_crumbs = ( isset( $tc_crumbs ) && is_array( $tc_crumbs ) ) ? $tc_crumbs : array();
if ( empty( $tc_crumbs ) ) { return; }
?>
<nav class="heritage-breadcrumb" aria-label="Breadcrumb">
    <ol class="heritage-breadcrumb__list">
        <?php
        foreach ( $tc_crumbs as $tc_c ) :
            $c_label = isset( $tc_c['label'] ) ? (string) $tc_c['label'] : '';
            $c_url   = isset( $tc_c['url'] )   ? (string) $tc_c['url']   : '';
            if ( $c_label === '' ) { continue; }
        ?>
            <li class="heritage-breadcrumb__item">
                <?php if ( $c_url !== '' ) : ?>
                    <a class="heritage-breadcrumb__link" href="<?php echo esc_url( $c_url ); ?>"><?php echo esc_html( $c_label ); ?></a>
                <?php else : ?>
                    <span class="heritage-breadcrumb__current" aria-current="page"><?php echo esc_html( $c_label ); ?></span>
                <?php endif; ?>
            </li>
        <?php endforeach; ?>
    </ol>
</nav>
