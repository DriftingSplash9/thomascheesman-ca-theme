<?php
/**
 * Tools → Generate Agent Password — fallback when the standard
 * Application Passwords UI is broken by host plugins.
 *
 * On this install, the standard wp-admin user-edit Application
 * Passwords section renders the name input but is MISSING the
 * "Add New Application Password" button (the host plugin is
 * suppressing the button HTML or its JS handler). The kitchen-sink
 * filter overrides in inc/agent-role.php got the section to render
 * but couldn't get the button back.
 *
 * This page bypasses the entire UI gate by calling
 * WP_Application_Passwords::create_new_application_password()
 * directly. Result: same App Password the standard UI would have
 * produced, just generated via our own form.
 *
 * Access: capability `manage_options` (i.e. site admins only).
 * The generated password is shown once and never again — matches
 * the standard UI's contract.
 *
 * To retire (once the standard UI works, e.g. host plugin update
 * or removal): delete this file and its require_once line in
 * functions.php. Future agents shouldn't depend on this page.
 *
 * @package tc-ventures-child
 */

if ( ! defined( 'ABSPATH' ) ) exit;

add_action( 'admin_menu', 'tc_agent_password_register_page' );

function tc_agent_password_register_page() {
    add_management_page(
        __( 'Generate Agent Password', 'tc-ventures-child' ),
        __( 'Generate Agent Password', 'tc-ventures-child' ),
        'manage_options',
        'tc-agent-password',
        'tc_agent_password_render'
    );
}

function tc_agent_password_render() {
    if ( ! current_user_can( 'manage_options' ) ) {
        wp_die( esc_html__( 'Permission denied.', 'tc-ventures-child' ) );
    }

    $created_password = null;
    $created_user     = null;
    $error            = null;

    if ( isset( $_POST['tc_create_app_pw'] ) && check_admin_referer( 'tc_create_app_pw' ) ) {
        $user_id = isset( $_POST['user_id'] ) ? intval( $_POST['user_id'] ) : 0;
        $name    = isset( $_POST['name'] )    ? sanitize_text_field( wp_unslash( $_POST['name'] ) ) : '';

        if ( $user_id <= 0 || $name === '' ) {
            $error = __( 'Pick a user and enter a name.', 'tc-ventures-child' );
        } else {
            $user = get_user_by( 'id', $user_id );
            if ( ! $user ) {
                $error = __( 'User not found.', 'tc-ventures-child' );
            } else {
                $result = WP_Application_Passwords::create_new_application_password(
                    $user_id,
                    array( 'name' => $name )
                );
                if ( is_wp_error( $result ) ) {
                    $error = $result->get_error_message();
                } else {
                    // $result is array( $unhashed_password, $item_meta )
                    $created_password = $result[0];
                    $created_user     = $user;
                }
            }
        }
    }

    $users = get_users( array(
        'fields'  => array( 'ID', 'user_login', 'display_name' ),
        'orderby' => 'display_name',
    ) );
    ?>
    <div class="wrap">
        <h1><?php esc_html_e( 'Generate Agent Password', 'tc-ventures-child' ); ?></h1>
        <p class="description">
            Fallback for when the standard Users → Profile → Application
            Passwords UI is broken by a host plugin. Generates a real
            WP Application Password by calling the API directly.
        </p>

        <?php if ( $error ) : ?>
            <div class="notice notice-error"><p><?php echo esc_html( $error ); ?></p></div>
        <?php endif; ?>

        <?php if ( $created_password && $created_user ) : ?>
            <div class="notice notice-success">
                <h2 style="margin-top: 0;">
                    <?php esc_html_e( 'Application Password created — copy it now', 'tc-ventures-child' ); ?>
                </h2>
                <p>
                    <strong>User:</strong> <?php echo esc_html( $created_user->display_name ); ?>
                    (<code><?php echo esc_html( $created_user->user_login ); ?></code>)
                </p>
                <p>
                    <strong><?php esc_html_e( 'Password:', 'tc-ventures-child' ); ?></strong>
                </p>
                <p>
                    <input type="text"
                           readonly
                           value="<?php echo esc_attr( $created_password ); ?>"
                           onclick="this.select();"
                           style="width: 380px; font-family: monospace; font-size: 1.15em; padding: 8px; user-select: all;" />
                </p>
                <p>
                    <em><?php esc_html_e( 'This password is shown ONCE. Copy it now — WordPress will not show it again. You can always generate a new one and revoke this one if you lose it.', 'tc-ventures-child' ); ?></em>
                </p>
            </div>
        <?php endif; ?>

        <form method="post" style="max-width: 640px;">
            <?php wp_nonce_field( 'tc_create_app_pw' ); ?>
            <input type="hidden" name="tc_create_app_pw" value="1" />

            <table class="form-table" role="presentation">
                <tr>
                    <th scope="row"><label for="user_id"><?php esc_html_e( 'User', 'tc-ventures-child' ); ?></label></th>
                    <td>
                        <select name="user_id" id="user_id" required>
                            <?php foreach ( $users as $user ) :
                                $is_agent = user_can( $user->ID, 'edit_pages' )
                                    && ! user_can( $user->ID, 'manage_options' );
                            ?>
                                <option value="<?php echo esc_attr( $user->ID ); ?>"<?php echo $is_agent ? ' selected' : ''; ?>>
                                    <?php echo esc_html( $user->display_name ); ?>
                                    (<?php echo esc_html( $user->user_login ); ?>)
                                </option>
                            <?php endforeach; ?>
                        </select>
                        <p class="description">
                            The narrow <code>Agent (Page Editor)</code> user is pre-selected.
                        </p>
                    </td>
                </tr>
                <tr>
                    <th scope="row"><label for="name"><?php esc_html_e( 'Password name', 'tc-ventures-child' ); ?></label></th>
                    <td>
                        <input type="text"
                               name="name"
                               id="name"
                               placeholder="Claude Code"
                               required
                               class="regular-text" />
                        <p class="description">
                            A label so you can identify and revoke this password later.
                            Used in WP's Application Passwords list.
                        </p>
                    </td>
                </tr>
            </table>

            <p>
                <button type="submit" class="button button-primary">
                    <?php esc_html_e( 'Generate Application Password', 'tc-ventures-child' ); ?>
                </button>
            </p>
        </form>
    </div>
    <?php
}
