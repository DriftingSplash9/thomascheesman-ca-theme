<?php
/**
 * Agent role registration — Phase 1 of WP 7.0 autonomous controls.
 *
 * Registers a narrow `agent_page_editor` WordPress role for non-
 * interactive AI agents (Claude Code, MCP clients, etc.) that need
 * scoped write access to the site without admin capability.
 *
 * --- Capability set ---------------------------------------------
 *
 * GRANTED:
 *   read                       — required for App Passwords + dashboard access
 *   edit_pages                 — read/edit pages in the editor
 *   edit_published_pages       — edit pages that are live
 *   edit_others_pages          — edit pages authored by other users
 *                                 (most pages were authored by the admin)
 *   publish_pages              — publish drafts (allows autonomous publishing)
 *   upload_files               — add to the media library
 *
 * INTENTIONALLY DENIED (do NOT add without conscious risk review):
 *   edit_themes, edit_plugins  — agent should never edit code files
 *   install_plugins,           — agent should not install/update plugins
 *     update_plugins,
 *     activate_plugins
 *   manage_options             — Settings → anything is off-limits
 *   edit_users, create_users,  — agent cannot manage user accounts
 *     delete_users, promote_users
 *   delete_pages,              — agent cannot delete content
 *     delete_published_pages,
 *     delete_others_pages
 *
 * --- Registration strategy -------------------------------------
 *
 * Roles persist in the wp_options table once added. add_role() is
 * a no-op if a role already exists, so we use a version-stamp:
 * bumping TC_AGENT_ROLE_VERSION forces remove_role() + add_role()
 * so a capability-set change actually takes effect. Without this,
 * existing sites would silently keep the old caps.
 *
 * --- After this code deploys: the wp-admin steps ---------------
 *
 *   1. wp-admin → Users → Add New
 *      - Username: claude-agent (or any name)
 *      - Email: a real address you control (WP requires one)
 *      - Send User Notification: optional
 *      - Role: "Agent (Page Editor)"
 *      - Save
 *
 *   2. wp-admin → Users → claude-agent → edit profile → scroll
 *      to "Application Passwords"
 *      - Name: "Claude Code" (or whatever client you're configuring)
 *      - Click "Add New Application Password"
 *      - Copy the password shown -- it is shown ONCE
 *      - Save it somewhere safe (1Password, paper, etc.)
 *
 *   3. Use the password as HTTP Basic Auth on REST calls:
 *        Authorization: Basic <base64( "claude-agent:the-password" )>
 *
 * Phase 2 (next session): install the MCP Adapter plugin, register
 * a narrow set of Abilities, wire Claude Code's MCP config at this
 * user's credentials. See docs/WORDPRESS-7.0.md → Action Items C.
 *
 * @package tc-ventures-child
 */

if ( ! defined( 'ABSPATH' ) ) exit;

const TC_AGENT_ROLE_SLUG    = 'agent_page_editor';
const TC_AGENT_ROLE_LABEL   = 'Agent (Page Editor)';
const TC_AGENT_ROLE_VERSION = 1;

add_action( 'init', 'tc_register_agent_role' );

function tc_register_agent_role() {
    $current = (int) get_option( 'tc_agent_role_version', 0 );
    if ( $current === TC_AGENT_ROLE_VERSION ) {
        return;
    }

    // Re-register from scratch so the cap set is exactly what's in
    // this file (no stale caps lingering from older versions).
    remove_role( TC_AGENT_ROLE_SLUG );

    add_role(
        TC_AGENT_ROLE_SLUG,
        TC_AGENT_ROLE_LABEL,
        array(
            'read'                 => true,
            'edit_pages'           => true,
            'edit_published_pages' => true,
            'edit_others_pages'    => true,
            'publish_pages'        => true,
            'upload_files'         => true,
            // No admin caps. No deletion caps. No plugin / theme caps.
            // No user-management caps. See the docblock above for
            // the deliberate denial list.
        )
    );

    update_option( 'tc_agent_role_version', TC_AGENT_ROLE_VERSION );
}
