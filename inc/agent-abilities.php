<?php
/**
 * Agent Abilities — Phase 2 of WP 7.0 autonomous controls.
 *
 * Registers a narrow starter set of typed, permission-gated
 * Abilities via the WordPress 7.0 Abilities API. Each Ability is
 * exposed to the MCP Adapter (when installed) so MCP-aware AI
 * clients (Claude Code, Cursor, Claude Desktop) can call them as
 * native tool calls.
 *
 * --- Abilities registered here ---------------------------------
 *
 * READ-ONLY (low risk; permission_callback requires 'read'):
 *
 *   tc-portfolio/list-pages         — id, slug, title, status of
 *                                      every published page
 *   tc-portfolio/get-page            — single page's full content +
 *                                      metadata, by id or slug
 *   tc-portfolio/list-quotes         — current daily-quote/riddle
 *                                      pool (inc/data/quotes.json)
 *   tc-portfolio/get-leaderboard     — top arcade scores per game
 *
 * WRITE (medium risk; permission_callback requires 'edit_pages'):
 *
 *   tc-portfolio/update-page-content — replace a page's post_content
 *   tc-portfolio/append-quote        — add a new entry to the
 *                                      quotes.json pool
 *   tc-portfolio/create-page         — create a new page (title, slug,
 *                                      parent, status) via wp_insert_post;
 *                                      bypasses the block editor
 *
 * Every Ability:
 *   - Has input_schema + output_schema (validated on every call)
 *   - Has a permission_callback (run before execute)
 *   - Sets meta.mcp.public = true so the MCP Adapter's default
 *     server picks it up
 *
 * --- Why this list / scope ------------------------------------
 *
 * 6 Abilities is the minimum useful set: enough to do real work
 * (read site state, edit pages, expand the quote pool, view the
 * arcade leaderboard) without being overwhelming. Add more by
 * registering new ones in this file -- the MCP Adapter picks them
 * up automatically.
 *
 * --- Phase 2 wp-admin steps for Thomas after this deploys -----
 *
 *   1. Install the MCP Adapter plugin:
 *      Download from https://github.com/wordpress/mcp-adapter/releases
 *      wp-admin -> Plugins -> Add New -> Upload Plugin -> upload zip
 *      Activate.
 *
 *   2. Verify abilities are discoverable:
 *      curl https://thomascheesman.ca/wp-json/wp/v2/abilities
 *      (should return the 6 abilities below)
 *
 *   3. Add MCP server to Claude Code config (~/.claude.json):
 *      {
 *        "mcpServers": {
 *          "thomascheesman": {
 *            "command": "npx",
 *            "args": ["-y", "@automattic/mcp-wordpress-remote@latest"],
 *            "env": {
 *              "WP_API_URL":      "https://thomascheesman.ca/wp-json/mcp/mcp-adapter-default-server",
 *              "WP_API_USERNAME": "Claude-Agent",
 *              "WP_API_PASSWORD": "<the App Password>"
 *            }
 *          }
 *        }
 *      }
 *
 *   4. Restart Claude Code. A new session should see the
 *      thomascheesman MCP server and its 6 tools available.
 *
 * @package tc-ventures-child
 */

if ( ! defined( 'ABSPATH' ) ) exit;

// Two separate hooks for the Abilities API in WP 7.0:
//
//   wp_abilities_api_categories_init  -- categories must register here
//   wp_abilities_api_init             -- abilities must register here
//                                        (fires AFTER categories_init)
//
// Each function silently returns null and trips _doing_it_wrong()
// when called outside its expected hook. Abilities that reference
// an unregistered category fail the same way.
add_action( 'wp_abilities_api_categories_init', 'tc_register_agent_ability_categories' );
add_action( 'wp_abilities_api_init',            'tc_register_agent_abilities' );

/* --------------------------------------------------------------
   Named permission callbacks.

   wp_register_ability() requires `is_callable()` to return true on
   both execute_callback and permission_callback. String callables
   (function names) and array callables (class+method pairs) work;
   we use strings here. Inline closures also work in WP 7.0 per the
   official docstring example, but named functions are easier to
   grep and test.
   -------------------------------------------------------------- */

function tc_ability_can_read() {
    return current_user_can( 'read' );
}

function tc_ability_can_edit_pages() {
    return current_user_can( 'edit_pages' );
}

function tc_ability_can_edit_page_by_input( $input ) {
    $id = isset( $input['id'] ) ? intval( $input['id'] ) : 0;
    return $id > 0 && current_user_can( 'edit_page', $id );
}

/**
 * Categories registration — fires on wp_abilities_api_categories_init.
 * MUST be on this exact hook; the API gates category registration the
 * same way it gates ability registration (silent null + _doing_it_wrong
 * outside the hook).
 */
function tc_register_agent_ability_categories() {
    if ( ! function_exists( 'wp_register_ability_category' ) ) {
        return;
    }
    wp_register_ability_category( 'tc-content', array(
        'label'       => 'Portfolio content',
        'description' => 'Pages, quotes / riddles, and other site content.',
    ) );
    wp_register_ability_category( 'tc-games', array(
        'label'       => 'Arcade',
        'description' => 'Leaderboard and other arcade-related abilities.',
    ) );
}

function tc_register_agent_abilities() {
    static $done = false;
    if ( $done ) {
        return;
    }
    if ( ! function_exists( 'wp_register_ability' ) ) {
        return;
    }
    $done = true;

    /*
     * ============================================================
     *  READ-ONLY ABILITIES
     * ============================================================
     */

    wp_register_ability( 'tc-portfolio/list-pages', array(
        'label'         => 'List pages',
        'description'   => 'List every page on the site with id, slug, title, and status. Read-only.',
        'category'      => 'tc-content',
        'input_schema'  => array(
            'type'       => 'object',
            'properties' => array(
                'status' => array(
                    'type'        => 'string',
                    'description' => 'WP post status to filter by (publish, draft, any). Default: publish.',
                    'enum'        => array( 'publish', 'draft', 'any' ),
                    'default'     => 'publish',
                ),
            ),
        ),
        'output_schema' => array(
            'type'  => 'array',
            'items' => array(
                'type'       => 'object',
                'properties' => array(
                    'id'     => array( 'type' => 'integer' ),
                    'slug'   => array( 'type' => 'string' ),
                    'title'  => array( 'type' => 'string' ),
                    'status' => array( 'type' => 'string' ),
                ),
            ),
        ),
        'execute_callback'    => 'tc_ability_list_pages',
        'permission_callback' => 'tc_ability_can_read',
        'meta' => array( 'mcp' => array( 'public' => true ) ),
    ) );

    wp_register_ability( 'tc-portfolio/get-page', array(
        'label'         => 'Get a page by id or slug',
        'description'   => 'Return a single page including its full post_content. Read-only.',
        'category'      => 'tc-content',
        'input_schema'  => array(
            'type'       => 'object',
            'properties' => array(
                'id'   => array( 'type' => 'integer', 'description' => 'Page ID. Provide this OR slug.' ),
                'slug' => array( 'type' => 'string',  'description' => 'Page slug. Provide this OR id.' ),
            ),
        ),
        'output_schema' => array(
            'type'       => 'object',
            'properties' => array(
                'id'       => array( 'type' => 'integer' ),
                'slug'     => array( 'type' => 'string' ),
                'title'    => array( 'type' => 'string' ),
                'status'   => array( 'type' => 'string' ),
                'content'  => array( 'type' => 'string' ),
                'modified' => array( 'type' => 'string' ),
            ),
        ),
        'execute_callback'    => 'tc_ability_get_page',
        'permission_callback' => 'tc_ability_can_read',
        'meta' => array( 'mcp' => array( 'public' => true ) ),
    ) );

    wp_register_ability( 'tc-portfolio/list-quotes', array(
        'label'         => 'List daily quote/riddle pool',
        'description'   => 'Return the current contents of inc/data/quotes.json — the rotation pool for the daily quote/riddle shown in the footer drawer. Read-only.',
        'category'      => 'tc-content',
        'input_schema'  => array( 'type' => 'object' ),
        'output_schema' => array(
            'type'  => 'array',
            'items' => array( 'type' => 'object' ),
        ),
        'execute_callback'    => 'tc_ability_list_quotes',
        'permission_callback' => 'tc_ability_can_read',
        'meta' => array( 'mcp' => array( 'public' => true ) ),
    ) );

    wp_register_ability( 'tc-portfolio/get-leaderboard', array(
        'label'         => 'Get arcade leaderboard',
        'description'   => 'Return top scores for an arcade game (snake, pong, pacman, asteroids, brickles, solitaire, pinball). Read-only.',
        'category'      => 'tc-games',
        'input_schema'  => array(
            'type'       => 'object',
            'properties' => array(
                'game' => array(
                    'type'        => 'string',
                    'description' => 'Game key. Returns all games when omitted.',
                    'enum'        => array( 'snake', 'pong', 'pacman', 'asteroids', 'brickles', 'solitaire', 'pinball' ),
                ),
            ),
        ),
        'output_schema' => array( 'type' => 'object' ),
        'execute_callback'    => 'tc_ability_get_leaderboard',
        'permission_callback' => 'tc_ability_can_read',
        'meta' => array( 'mcp' => array( 'public' => true ) ),
    ) );

    /*
     * ============================================================
     *  WRITE ABILITIES
     * ============================================================
     */

    wp_register_ability( 'tc-portfolio/update-page-content', array(
        'label'         => 'Update a page\'s content',
        'description'   => 'Replace the post_content of a specific page. WordPress sanitises the HTML via wp_kses_post(). Writes a revision.',
        'category'      => 'tc-content',
        'input_schema'  => array(
            'type'       => 'object',
            'properties' => array(
                'id'      => array(
                    'type'        => 'integer',
                    'description' => 'Page ID to update.',
                ),
                'content' => array(
                    'type'        => 'string',
                    'description' => 'New HTML content. Sanitised by wp_kses_post() before save.',
                ),
            ),
            'required' => array( 'id', 'content' ),
        ),
        'output_schema' => array(
            'type'       => 'object',
            'properties' => array(
                'id'      => array( 'type' => 'integer' ),
                'success' => array( 'type' => 'boolean' ),
            ),
        ),
        'execute_callback'    => 'tc_ability_update_page_content',
        'permission_callback' => 'tc_ability_can_edit_page_by_input',
        'meta' => array(
            'mcp'         => array( 'public' => true ),
            'destructive' => false,
            'idempotent'  => true,
        ),
    ) );

    wp_register_ability( 'tc-portfolio/append-quote', array(
        'label'         => 'Append a quote or riddle to the pool',
        'description'   => 'Add a new entry to inc/data/quotes.json. Type must be "quote" (with text + author) or "riddle" (with question + answer). The drawer picker re-derives indices from list length, so additions take effect on the next page load.',
        'category'      => 'tc-content',
        'input_schema'  => array(
            'type'       => 'object',
            'properties' => array(
                'type'     => array( 'type' => 'string', 'enum' => array( 'quote', 'riddle' ) ),
                'text'     => array( 'type' => 'string', 'description' => 'For quotes.' ),
                'author'   => array( 'type' => 'string', 'description' => 'For quotes.' ),
                'question' => array( 'type' => 'string', 'description' => 'For riddles.' ),
                'answer'   => array( 'type' => 'string', 'description' => 'For riddles.' ),
            ),
            'required' => array( 'type' ),
        ),
        'output_schema' => array(
            'type'       => 'object',
            'properties' => array(
                'total_entries' => array( 'type' => 'integer' ),
                'success'       => array( 'type' => 'boolean' ),
            ),
        ),
        'execute_callback'    => 'tc_ability_append_quote',
        'permission_callback' => 'tc_ability_can_edit_pages',
        'meta' => array(
            'mcp'         => array( 'public' => true ),
            'destructive' => false,
            'idempotent'  => false,
        ),
    ) );

    wp_register_ability( 'tc-portfolio/create-page', array(
        'label'         => 'Create a new page',
        'description'   => 'Create a new WordPress page (post_type=page) with a title, optional slug, optional parent (slug or numeric id), status, and optional HTML content. Runs server-side via wp_insert_post(), so it bypasses the block editor entirely. Most TC pages render from a slug-matched PHP template, so content can be left empty. Returns the new page id, slug, status, and URL.',
        'category'      => 'tc-content',
        'input_schema'  => array(
            'type'       => 'object',
            'properties' => array(
                'title'   => array( 'type' => 'string', 'description' => 'Page title (required).' ),
                'slug'    => array( 'type' => 'string', 'description' => 'Optional slug; derived from the title if omitted.' ),
                'parent'  => array( 'type' => 'string', 'description' => 'Optional parent page slug or numeric id (nests the page, e.g. under "family").' ),
                'status'  => array(
                    'type'    => 'string',
                    'enum'    => array( 'publish', 'draft', 'pending', 'private' ),
                    'default' => 'publish',
                ),
                'content' => array( 'type' => 'string', 'description' => 'Optional HTML body. Sanitised by wp_kses_post(). Leave empty for template-rendered pages.' ),
            ),
            'required' => array( 'title' ),
        ),
        'output_schema' => array(
            'type'       => 'object',
            'properties' => array(
                'id'     => array( 'type' => 'integer' ),
                'slug'   => array( 'type' => 'string' ),
                'status' => array( 'type' => 'string' ),
                'url'    => array( 'type' => 'string' ),
            ),
        ),
        'execute_callback'    => 'tc_ability_create_page',
        'permission_callback' => 'tc_ability_can_edit_pages',
        'meta' => array(
            'mcp'         => array( 'public' => true ),
            'destructive' => false,
            'idempotent'  => false,
        ),
    ) );
}

/*
 * ====================================================================
 *  EXECUTE CALLBACKS
 *  Kept as named functions (not closures) so they're easier to grep
 *  and reasonable to unit-test if we ever add tests.
 * ====================================================================
 */

function tc_ability_list_pages( $input ) {
    $status = isset( $input['status'] ) ? (string) $input['status'] : 'publish';
    $args   = array(
        'post_type'   => 'page',
        'post_status' => $status === 'any' ? array( 'publish', 'draft', 'pending', 'private' ) : $status,
        'numberposts' => -1,
        'orderby'     => 'title',
        'order'       => 'ASC',
    );
    $posts = get_posts( $args );
    return array_map( function ( $p ) {
        return array(
            'id'     => (int) $p->ID,
            'slug'   => (string) $p->post_name,
            'title'  => (string) $p->post_title,
            'status' => (string) $p->post_status,
        );
    }, $posts );
}

function tc_ability_get_page( $input ) {
    $page = null;
    if ( ! empty( $input['id'] ) ) {
        $page = get_post( intval( $input['id'] ) );
    } elseif ( ! empty( $input['slug'] ) ) {
        $page = get_page_by_path( (string) $input['slug'], OBJECT, 'page' );
    }
    if ( ! $page || $page->post_type !== 'page' ) {
        return new WP_Error( 'not_found', 'Page not found.' );
    }
    return array(
        'id'       => (int) $page->ID,
        'slug'     => (string) $page->post_name,
        'title'    => (string) $page->post_title,
        'status'   => (string) $page->post_status,
        'content'  => (string) $page->post_content,
        'modified' => (string) $page->post_modified_gmt,
    );
}

function tc_ability_list_quotes() {
    $path = get_stylesheet_directory() . '/inc/data/quotes.json';
    if ( ! is_readable( $path ) ) {
        return new WP_Error( 'unreadable', 'quotes.json is missing or unreadable.' );
    }
    $entries = json_decode( file_get_contents( $path ), true );
    return is_array( $entries ) ? $entries : array();
}

function tc_ability_get_leaderboard( $input ) {
    $game = isset( $input['game'] ) ? sanitize_key( $input['game'] ) : '';
    $url  = rest_url( 'tc-games/v1/scores' );
    if ( $game ) {
        $url = add_query_arg( 'game', $game, $url );
    }
    $response = wp_remote_get( $url );
    if ( is_wp_error( $response ) ) {
        return $response;
    }
    $body = wp_remote_retrieve_body( $response );
    $data = json_decode( $body, true );
    return is_array( $data ) ? $data : array();
}

function tc_ability_update_page_content( $input ) {
    $id      = intval( $input['id'] );
    $content = (string) $input['content'];

    $result = wp_update_post( array(
        'ID'           => $id,
        'post_content' => $content,
    ), true ); // true = return WP_Error on failure

    if ( is_wp_error( $result ) ) {
        return $result;
    }
    return array(
        'id'      => $id,
        'success' => $result === $id,
    );
}

function tc_ability_create_page( $input ) {
    $title = isset( $input['title'] ) ? trim( (string) $input['title'] ) : '';
    if ( $title === '' ) {
        return new WP_Error( 'bad_input', 'A title is required.' );
    }

    $status = isset( $input['status'] ) ? (string) $input['status'] : 'publish';
    if ( ! in_array( $status, array( 'publish', 'draft', 'pending', 'private' ), true ) ) {
        $status = 'publish';
    }

    // Resolve an optional parent by numeric id or slug.
    $parent_id = 0;
    if ( ! empty( $input['parent'] ) ) {
        if ( is_numeric( $input['parent'] ) ) {
            $parent_id = intval( $input['parent'] );
        } else {
            $parent = get_page_by_path( (string) $input['parent'], OBJECT, 'page' );
            if ( $parent ) {
                $parent_id = (int) $parent->ID;
            }
        }
    }

    $postarr = array(
        'post_type'    => 'page',
        'post_title'   => $title,
        'post_status'  => $status,
        'post_content' => isset( $input['content'] ) ? (string) $input['content'] : '',
        'post_parent'  => $parent_id,
    );
    if ( ! empty( $input['slug'] ) ) {
        $postarr['post_name'] = sanitize_title( (string) $input['slug'] );
    }

    $id = wp_insert_post( $postarr, true ); // true = WP_Error on failure
    if ( is_wp_error( $id ) ) {
        return $id;
    }

    $post = get_post( $id );
    return array(
        'id'     => (int) $id,
        'slug'   => (string) $post->post_name,
        'status' => (string) $post->post_status,
        'url'    => (string) get_permalink( $id ),
    );
}

function tc_ability_append_quote( $input ) {
    $path = get_stylesheet_directory() . '/inc/data/quotes.json';
    if ( ! is_readable( $path ) || ! is_writable( $path ) ) {
        return new WP_Error( 'not_writable', 'quotes.json is missing or not writable.' );
    }
    $entries = json_decode( file_get_contents( $path ), true );
    if ( ! is_array( $entries ) ) {
        $entries = array();
    }

    $type = isset( $input['type'] ) ? (string) $input['type'] : '';
    $new  = null;
    if ( $type === 'quote' ) {
        if ( empty( $input['text'] ) || empty( $input['author'] ) ) {
            return new WP_Error( 'bad_input', 'Quote requires text and author.' );
        }
        $new = array(
            'type'   => 'quote',
            'text'   => (string) $input['text'],
            'author' => (string) $input['author'],
        );
    } elseif ( $type === 'riddle' ) {
        if ( empty( $input['question'] ) || empty( $input['answer'] ) ) {
            return new WP_Error( 'bad_input', 'Riddle requires question and answer.' );
        }
        $new = array(
            'type'     => 'riddle',
            'question' => (string) $input['question'],
            'answer'   => (string) $input['answer'],
        );
    } else {
        return new WP_Error( 'bad_input', 'Type must be "quote" or "riddle".' );
    }

    $entries[] = $new;
    $written  = file_put_contents( $path, wp_json_encode( $entries, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE ) );
    if ( $written === false ) {
        return new WP_Error( 'write_failed', 'Could not write quotes.json.' );
    }

    return array(
        'total_entries' => count( $entries ),
        'success'       => true,
    );
}
