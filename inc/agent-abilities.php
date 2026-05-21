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

// Abilities MUST be registered on this exact hook. Per WP 7.0
// wp-includes/abilities-api.php docstring: "Attempting to register
// an ability outside of this hook will fail and trigger a
// _doing_it_wrong() notice." Earlier multi-hook attempt added
// `init` priority 20 as a fallback -- which fires BEFORE this hook
// in the same request, so the static guard locked the function in
// and our wp_register_ability calls all ran outside the valid
// window, silently returning NULL.
add_action( 'wp_abilities_api_init', 'tc_register_agent_abilities' );

// Debug endpoint — dumps the Abilities registry so we can see
// whether registration is happening at all. Read-only, no secrets
// exposed, gated by 'read' so Claude-Agent can curl it during
// diagnosis. Remove this whole block once the MCP Adapter is
// reliably picking our abilities up.
add_action( 'rest_api_init', function () {
    register_rest_route( 'tc-debug/v1', '/abilities', array(
        'methods'             => 'GET',
        'permission_callback' => 'tc_ability_can_read',
        'callback'            => function () {
            $info = array(
                'has_wp_register_ability' => function_exists( 'wp_register_ability' ),
                'has_wp_get_abilities'    => function_exists( 'wp_get_abilities' ),
                'has_wp_get_ability'      => function_exists( 'wp_get_ability' ),
                'fired_hooks'             => array(),
                'abilities'               => array(),
            );
            global $wp_actions;
            foreach ( array( 'wp_abilities_api_init', 'abilities_api_init', 'init' ) as $h ) {
                $info['fired_hooks'][ $h ] = isset( $wp_actions[ $h ] ) ? (int) $wp_actions[ $h ] : 0;
            }
            if ( function_exists( 'wp_get_abilities' ) ) {
                $all = wp_get_abilities();
                if ( is_array( $all ) ) {
                    foreach ( $all as $key => $a ) {
                        $name = is_object( $a ) && isset( $a->name ) ? $a->name
                              : ( is_array( $a ) && isset( $a['name'] ) ? $a['name'] : $key );
                        $info['abilities'][] = $name;
                    }
                } else {
                    $info['abilities_raw_type'] = gettype( $all );
                }
            }

            // Surface what our wp_register_ability() calls returned.
            global $tc_ability_registration_results, $tc_ability_runtime_info;
            $info['registration_results'] = $tc_ability_registration_results ?: array();
            $info['runtime_info']         = $tc_ability_runtime_info ?: array( 'note' => 'function never ran' );

            // Show the full shape of one successfully-registered core
            // ability so we can compare arg names with ours.
            if ( function_exists( 'wp_get_ability' ) ) {
                $sample = wp_get_ability( 'core/get-site-info' );
                if ( $sample ) {
                    $info['sample_core_ability'] = is_object( $sample )
                        ? get_object_vars( $sample )
                        : $sample;
                }
            }
            return $info;
        },
    ) );
} );

// Captures the return value of each wp_register_ability() call so
// the diagnostic endpoint can show what's failing. Indexed by name.
global $tc_ability_registration_results;
$tc_ability_registration_results = array();

/* --------------------------------------------------------------
   Named permission callbacks.

   wp_register_ability() silently rejects abilities whose
   permission_callback is a Closure (cf. WP/mcp-adapter, which uses
   only string / array callables for the same reason — abilities
   must be serialisable for caching). Converting to named
   functions makes them registrable.
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

function tc_capture_register( $name, $args ) {
    global $tc_ability_registration_results;
    $result = wp_register_ability( $name, $args );
    if ( is_wp_error( $result ) ) {
        $tc_ability_registration_results[ $name ] = array(
            'error_code'    => $result->get_error_code(),
            'error_message' => $result->get_error_message(),
            'error_data'    => $result->get_error_data(),
        );
    } else {
        $tc_ability_registration_results[ $name ] = array(
            'type'  => is_object( $result ) ? get_class( $result ) : gettype( $result ),
            'value' => is_scalar( $result ) ? $result : null,
        );
    }
    return $result;
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

    global $tc_ability_registration_results, $tc_ability_runtime_info;

    // Capture the runtime state at the exact moment our function
    // runs. wp_register_ability() returns null when called outside
    // the wp_abilities_api_init action -- this tells us if we're
    // in the right place.
    $tc_ability_runtime_info = array(
        'current_filter'               => current_filter(),
        'doing_wp_abilities_api_init'  => doing_action( 'wp_abilities_api_init' ),
        'did_wp_abilities_api_init'    => did_action( 'wp_abilities_api_init' ),
        'theme_version'                => function_exists( 'wp_get_theme' ) ? wp_get_theme()->get( 'Version' ) : 'n/a',
        'callbacks_exist'              => array(
            'tc_ability_list_pages'    => function_exists( 'tc_ability_list_pages' ),
            'tc_ability_can_read'      => function_exists( 'tc_ability_can_read' ),
            'tc_ability_can_edit_pages' => function_exists( 'tc_ability_can_edit_pages' ),
        ),
        'category_fns_exist'           => array(
            'wp_register_ability_category' => function_exists( 'wp_register_ability_category' ),
            'wp_has_ability_category'      => function_exists( 'wp_has_ability_category' ),
        ),
        'doing_it_wrong_messages'      => array(),
    );

    // Capture _doing_it_wrong calls during our registration. That's
    // how the Abilities API reports the actual failure reason --
    // null is the return code, the real message is in the notice.
    add_action( 'doing_it_wrong_run', function ( $func, $msg, $ver ) {
        global $tc_ability_runtime_info;
        $tc_ability_runtime_info['doing_it_wrong_messages'][] = array(
            'function' => $func,
            'message'  => wp_strip_all_tags( $msg ),
        );
    }, 10, 3 );

    // Register ability categories first. The registry silently
    // rejects (returns null) any ability whose `category` arg
    // refers to an unregistered category.
    if ( function_exists( 'wp_register_ability_category' ) ) {
        wp_register_ability_category( 'tc-content', array(
            'label'       => 'Portfolio content',
            'description' => 'Pages, quotes / riddles, and other site content.',
        ) );
        wp_register_ability_category( 'tc-games', array(
            'label'       => 'Arcade',
            'description' => 'Leaderboard and other arcade-related abilities.',
        ) );
    }
    // Confirm categories actually landed in the registry.
    if ( function_exists( 'wp_has_ability_category' ) ) {
        $tc_ability_runtime_info['categories_registered'] = array(
            'tc-content' => wp_has_ability_category( 'tc-content' ),
            'tc-games'   => wp_has_ability_category( 'tc-games' ),
        );
    }

    /*
     * ============================================================
     *  READ-ONLY ABILITIES
     * ============================================================
     */

    tc_capture_register( 'tc-portfolio/list-pages', array(
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

    tc_capture_register( 'tc-portfolio/get-page', array(
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

    tc_capture_register( 'tc-portfolio/list-quotes', array(
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

    tc_capture_register( 'tc-portfolio/get-leaderboard', array(
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

    tc_capture_register( 'tc-portfolio/update-page-content', array(
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

    tc_capture_register( 'tc-portfolio/append-quote', array(
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
