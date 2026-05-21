# WordPress 7.0 "Armstrong" — project briefing

**Release date:** 2026-05-20 · **Codename:** "Armstrong" (Louis Armstrong, "Satchmo") · **Release lead:** Matias Ventura

This doc captures everything a Claude session needs to know about WP 7.0 *as it affects this project*. CLAUDE.md points future agents here.

---

## TL;DR

1. **Our theme is fully compatible with 7.0.** Every hook, API, and pattern we use (`parse_request`, `wp_enqueue_scripts`, `wp_localize_script`, `wp_head`, `wp_footer`, `register_rest_route`, `WP_REST_Server::READABLE/CREATABLE`, `esc_url_raw`, `home_url`, `get_stylesheet_directory*`, `wp_get_theme()`, `nocache_headers`, `status_header`) is unchanged. Nothing broke.
2. **AI is now in core, but as infrastructure, not features.** Three new APIs: AI Client (`wp_ai_client_prompt()`), Connectors API (Settings → Connectors), Abilities API (`wp_register_ability()`). A separate first-party-track **MCP Adapter plugin** turns Abilities into MCP tools that Claude can call.
3. **PHP 7.4 minimum.** Hostinger should already be on 8.x — verify in hPanel if you ever see the upgrade prompt suppressed.
4. **Astra must be 4.13.1+** (4.13.0 had a critical JS error — hotfix in 4.13.1). LiteSpeed Cache has no known 7.0 issues.
5. **The block-library CSS win we observed** actually shipped in 6.9 and 7.0 inherited it. Real, intended, ~100KB/page saved on classic-template prose pages. Keep it on.

---

## Action items for THIS project

In priority order. Each item is independently shippable.

### A. Persist the project context (this commit)

- [x] CLAUDE.md at repo root (committed in `61088ca`)
- [x] `docs/WORDPRESS-7.0.md` (this file)
- [ ] Verify Astra is 4.13.1+ in wp-admin → Themes (one click in Hostinger panel)

### B. Phase 1 — set up agent-friendly write access (next session, ~1 hour)

The goal: give Claude *narrow*, *scoped* write access to this site without exposing the whole admin.

1. Add `inc/agent-role.php` that registers an `agent_page_editor` role at theme-activation:
   ```php
   register_activation_hook OR after_setup_theme hook → add_role( 'agent_page_editor', 'Agent (Page Editor)', array(
       'read' => true,
       'edit_pages' => true,
       'edit_published_pages' => true,
       'edit_others_pages' => true,
       'upload_files' => true,
       // intentionally NO: edit_themes, edit_plugins, install_plugins,
       // update_plugins, manage_options, edit_users, activate_plugins
   ) );
   ```
2. Thomas in wp-admin → Users → Add New → create user `claude-agent` with role `Agent (Page Editor)`
3. Users → Profile (of claude-agent) → **Application Passwords** → generate one named "Claude Code"
4. Save the app password somewhere Thomas can find it (1Password / paper).
5. Now Claude can call `POST /wp-json/wp/v2/pages` with `Authorization: Basic base64(claude-agent:app-password)` to edit pages without touching the theme repo.

### C. Phase 2 — install the MCP Adapter (next session after Phase 1)

The MCP Adapter plugin turns WordPress Abilities into MCP tools that Claude Code can call as first-class tool calls (not raw REST). Cleaner than direct REST.

1. Download from [github.com/WordPress/mcp-adapter/releases](https://github.com/wordpress/mcp-adapter/releases)
2. Upload via wp-admin → Plugins → Add New → Upload Plugin (Thomas-side)
3. Add `inc/agent-abilities.php` to this theme registering a tight set of Abilities (start read-only, expand carefully):
   - `tc-portfolio/list-pages` — read-only
   - `tc-portfolio/get-page-content` — read-only
   - `tc-portfolio/update-page-content` — write, gated by `current_user_can('edit_page', $page_id)`
   - `tc-portfolio/get-leaderboard-scores` — read-only, wraps `/wp-json/tc-games/v1/scores`
4. Add to `~/.claude.json` (or `.mcp.json` per-project):
   ```json
   {
     "mcpServers": {
       "thomascheesman": {
         "command": "npx",
         "args": ["-y", "@automattic/mcp-wordpress-remote@latest"],
         "env": {
           "WP_API_URL": "https://thomascheesman.ca/wp-json/mcp/mcp-adapter-default-server",
           "WP_API_USERNAME": "claude-agent",
           "WP_API_PASSWORD": "the-app-password-from-step-B3"
         }
       }
     }
   }
   ```
5. Test: in a new Claude Code session, ask Claude to list pages. It should call the MCP tool directly without me touching files.

### D. Phase 3 — opt-in AI features in the theme (optional, low priority)

Things we *could* do with the new AI Client in core, only if Thomas wants them:

- Auto-generate alt text for newly uploaded photos via `wp_ai_client_prompt()->with_file(...)->generate_text()`. Saves manual work on the photo galleries.
- Auto-suggest related-page links inside HCS articles by feeding the page content to a prompt that searches the site's index. Possibly overkill.
- Daily-quote / daily-riddle generation via AI if we ever want to expand the static JSON pool. Probably worse than human curation.

None of these are necessary. The site is hand-crafted prose — AI-generated content would dilute it.

---

## What's actually new in 7.0 — comprehensive

### Headline framing

From the [official announcement](https://wordpress.org/news/2026/05/wordpress-7-0-armstrong/): *"WordPress 7.0 marks the start of a new era, laying the foundation for AI across the WordPress experience."*

### Release stats (from the [Field Guide](https://make.wordpress.org/core/2026/05/14/wordpress-7-0-field-guide/))

- 419 total Core Trac tickets
- 76+ enhancements / feature requests
- 300+ bug fixes
- 40+ editor-focused, 90+ wp-admin-focused
- 411 Gutenberg enhancements; 486+ Gutenberg bug fixes (Gutenberg 22.0–22.6)

### Major features beyond AI

| Feature | What it is |
|---|---|
| **Modern admin** | New "Modern" admin color scheme, **view transitions** between dashboard screens, **Command Palette** (Cmd/Ctrl+K) in the admin bar |
| **Font Library** | Central place to install/manage fonts; works for block, hybrid, *and* classic themes |
| **Visual Revisions** | Slider compare + clickable change summaries |
| **Iframed editor enforced** | When all blocks declare Block API v3+; falls back to un-iframed if any v2 block is present |
| **Responsive editing mode** | Viewport-targeted block visibility (Mobile/Tablet/Desktop) |
| **Custom Navigation Overlays** | New block-side equivalent of what our desk-menu does in classic PHP |
| **New blocks** | Heading split into H1–H6 variations; Breadcrumbs (with filters); Icons; Cover (video embed bg); Gallery (lightbox); Paragraph (column layout, `textIndent`) |
| **Custom CSS per block** | Per-instance CSS without writing a stylesheet |
| **PHP-only block registration** | `'supports' => array( 'autoRegister' => true )` + render callback auto-exposes the block to the client |
| **Interactivity API** | `effect()` → `watch()`, new `data-wp-watch` directive, `state.url` populated server-side |
| **Real-time co-editing (partial)** | Yjs infrastructure shipped; full user-facing rollout scoped to 7.1 |

### Deprecated/removed/breaking

- **PHP 7.2 and 7.3 dropped.** Minimum is now **PHP 7.4**.
- **HTML5 script theme support removed** ([Trac #64442](https://core.trac.wordpress.org/ticket/64442)).
- **Iframed editor enforced** for Block API v3+ blocks — plugins that reached out of the editor iframe break.
- **Classic meta boxes** registered with `add_meta_box()` disable real-time collaboration for the whole post type.
- **Interactivity API:** `state.navigation.hasStarted`/`hasFinished` deprecated; replacement promised in 7.1.
- **DataViews:** `groupByField` (string) → `groupBy` (object with `field`, `direction`, `showLabel`).
- **Heading block restructuring** may break custom block styles/filters that targeted the old single-block shape.
- **Administrator/Editor roles removed from default user-registration role selector** in Settings → General; new `default_role_dropdown_excluded_roles` filter.
- **Bundled library bumps:** CodeMirror → v5; Esprima → **Espree**; Backbone.js → 1.6.1; Requests → 2.0.17; PHPMailer → 7.0.2.

**None of these affect our theme.**

---

## AI in core — the three new APIs

### 1. AI Client — `wp_ai_client_prompt()`

[Dev note: Introducing the AI Client in WordPress 7.0](https://make.wordpress.org/core/2026/03/24/introducing-the-ai-client-in-wordpress-7-0/)

A provider-agnostic PHP API. Returns a fluent builder. Built on `wordpress/php-ai-client`, bundled in core, wrapped with snake_case + `WP_Error`.

**Canonical usage:**

```php
$text = wp_ai_client_prompt( 'Your prompt here' )
    ->using_temperature( 0.7 )
    ->generate_text();

if ( is_wp_error( $text ) ) { /* handle */ }
echo wp_kses_post( $text );
```

**Builder methods:** `with_text()`, `with_file()`, `with_history()`, `using_system_instruction()`, `using_temperature()`, `using_max_tokens()`, `using_top_p()`, `using_top_k()`, `using_stop_sequences()`, `using_model_preference()`, `as_output_modalities()`, `as_json_response($schema)`

**Generation methods:** `generate_text()`, `generate_texts(n)`, `generate_image()`, `generate_images(n)`, `generate_video_result()`, `convert_text_to_speech_result()`, `generate_speech_result()`, `generate_result()` (multimodal)

**Support detection** (deterministic, no API call): `is_supported_for_text_generation()`, `is_supported_for_image_generation()`, `is_supported_for_text_to_speech_conversion()`, `is_supported_for_speech_generation()`, `is_supported_for_video_generation()`

**Access control filter** (use this if we ever expose AI calls from this theme):

```php
add_filter( 'wp_ai_client_prevent_prompt',
    function ( bool $prevent, WP_AI_Client_Prompt_Builder $builder ): bool {
        if ( ! current_user_can( 'manage_options' ) ) return true;
        return $prevent;
    }, 10, 2 );
```

### 2. Connectors API — Settings → Connectors

[Dev note: Introducing the Connectors API](https://make.wordpress.org/core/2026/03/18/introducing-the-connectors-api-in-wordpress-7-0/)

Central registry for external service credentials. New admin screen at **Settings → Connectors**.

**Default AI providers pre-registered:** Anthropic, Google, OpenAI. Community connectors exist for OpenRouter, Ollama, Mistral.

- Authentication types: `api_key`, `none`
- Key resolution order: **env var → PHP constant → DB**
- Naming convention: `{PROVIDER_ID}_API_KEY` (e.g. `ANTHROPIC_API_KEY`)
- **DB-stored keys are masked in UI but NOT encrypted at rest.** Encryption is on the roadmap.
- Hook to register: `wp_connectors_init`
- Helpers: `wp_is_connector_registered()`, `wp_get_connector( $id )`, `wp_get_connectors()`

**⚠️ Site-wide scope:** keys are site-level — *any* plugin on the site can use any registered key. There is no per-plugin scope. Treat keys in Connectors as effectively shared.

**Experimental:** JS registration of non-`api_key` connectors is explicitly experimental, expanding in future releases.

### 3. Abilities API — `wp_register_ability()`

[Abilities API reference (developer.wordpress.org)](https://developer.wordpress.org/apis/abilities-api/) · [Client-Side Abilities API dev note](https://make.wordpress.org/core/2026/03/24/client-side-abilities-api-in-wordpress-7-0/) · [Background: Abilities API in 6.9](https://make.wordpress.org/core/2025/11/10/abilities-api-in-wordpress-6-9/)

The foundation that makes the MCP story work. Landed in 6.9; stable as of 7.0.

**Register inside `wp_abilities_api_init`:**

```php
wp_register_ability( 'namespace/ability-name', array(
    'label'               => 'Human label',
    'description'         => 'What this does',
    'category'            => 'content',
    'input_schema'        => array( /* JSON Schema */ ),
    'output_schema'       => array( /* JSON Schema */ ),
    'execute_callback'    => function ( $input ) { /* ... */ },
    'permission_callback' => function ( $input ) {
        return current_user_can( 'edit_pages' );
    },
    'meta' => array(
        'mcp' => array( 'public' => true ),
        // 'readonly' => true,
        // 'destructive' => false,
        // 'idempotent' => true,
    ),
) );
```

**Every ability execution passes through `permission_callback`** — whether triggered via PHP, REST, or an AI agent through MCP. Return false → throws `ability_permission_denied`. Input/output schemas validated on every call.

**Three default core abilities ship:** `core/get-site-info`, `core/get-user-info`, `core/get-environment-info`.

**Client-side counterpart:** `@wordpress/abilities` and `@wordpress/core-abilities` JS packages. React `useSelect` supported.

**⚠️ Verification gap:** Secondary write-ups describe "OAuth 2.1 scoped tokens, per-ability permission checks, rate limiting, audit logging, and human-in-the-loop approval for destructive actions" as the Abilities API security model. **This OAuth 2.1 claim does NOT appear on the official developer.wordpress.org Abilities API page.** Treat as community-claimed but not yet confirmed in core docs. WordPress.com uses OAuth 2.1 for its MCP connector; self-hosted is still Application Passwords territory in core.

### 4. MCP Adapter (plugin, not core)

[Dev blog: From Abilities to AI Agents — Introducing the WordPress MCP Adapter](https://developer.wordpress.org/news/2026/02/from-abilities-to-ai-agents-introducing-the-wordpress-mcp-adapter/) · [github.com/WordPress/mcp-adapter](https://github.com/wordpress/mcp-adapter)

**Not in 7.0 core itself.** A first-party-track plugin maintained by the WordPress org, superseding the older Automattic/wordpress-mcp repo. Proposed for core merge in a future release.

**What it does:**

- Reads everything registered through the Abilities API
- Exposes abilities as MCP **tools** (executable) or **resources** (passive data)
- Auto-registers three meta tools: `mcp-adapter-discover-abilities`, `mcp-adapter-get-ability-info`, `mcp-adapter-execute-ability`
- Default server name: `mcp-adapter-default-server`
- REST endpoint pattern: `/wp-json/mcp/<server-id>`
- Abilities opt in with `meta.mcp.public = true` to appear on the default server (custom servers explicitly enumerate, no opt-in needed)

**Transports:**

- **STDIO via WP-CLI** (local-dev only):
  ```
  wp mcp-adapter serve --server=mcp-adapter-default-server --user=admin
  ```
- **HTTP via the Automattic remote proxy** (production):
  ```
  npx -y @automattic/mcp-wordpress-remote@latest
  ```
  with `WP_API_URL`, `WP_API_USERNAME`, `WP_API_PASSWORD` (App Password) env vars.

**Claude Code config** (already shown in Action Items B, repeated here for reference):

```json
{
  "mcpServers": {
    "your-site": {
      "command": "npx",
      "args": ["-y", "@automattic/mcp-wordpress-remote@latest"],
      "env": {
        "WP_API_URL":      "https://yoursite.example/wp-json/mcp/mcp-adapter-default-server",
        "WP_API_USERNAME": "your_user",
        "WP_API_PASSWORD": "xxxx xxxx xxxx xxxx xxxx xxxx"
      }
    }
  }
}
```

Claude Desktop and Cursor use the same `mcpServers` shape; VS Code uses `.vscode/mcp.json` with a `servers` object (different key).

**Security guidance from the dev note (do all of these):**

1. Permission callbacks must be strict — **never `__return_true`** on destructive ops.
2. Create a **dedicated user with minimal capabilities** for MCP. Not the admin account.
3. For public HTTP servers, prefer **read-only abilities** until you're confident.
4. Implement custom error/observability handlers to log MCP activity.
5. OAuth provides better security than Application Passwords for untrusted clients.

### 5. Two adjacent things to know about

- **[WordPress.org MCP Server](https://developer.wordpress.org/plugins/wordpress-org/using-the-mcp-server/)** — a *different* server hosted by WordPress.org for plugin authors (validate readme, check review status, submit plugins). `npx -y @wporg/mcp`. **Not relevant for editing our own site.**
- **[Telex](https://telex.automattic.ai/)** — Automattic's hosted "v0/Lovable for Gutenberg." Text prompt → downloadable WP plugin zip. **Not in 7.0 core.** Scoped to block/plugin generation, not autonomous site editing.

---

## Compatibility audit — our theme vs WP 7.0

Every API surface our theme uses, mapped against 7.0:

| API | Status in 7.0 | Notes |
|---|---|---|
| `parse_request` | ✅ Unchanged | Our Bing-verification hook is fine |
| `wp_enqueue_scripts` | ✅ Unchanged | |
| `wp_localize_script` | ⚠️ Not formally deprecated | Discouraged for non-i18n; `wp_add_inline_script()` is the modern path. Our `tcDeskGames` localization works fine on frontend. |
| `wp_head` / `wp_footer` | ✅ Unchanged | Bing meta tag works |
| `init`, `after_setup_theme`, `template_redirect` | ✅ Unchanged | |
| `register_rest_route` | ✅ Unchanged | Permission callback already required since 5.5; we have one. |
| `WP_REST_Server::READABLE`/`CREATABLE` | ✅ Unchanged | Leaderboard works. |
| `register_post_type` filter | ✅ Unchanged | |
| `esc_url_raw`, `home_url`, `get_stylesheet_directory*`, `wp_get_theme()->get('Version')`, `nocache_headers`, `status_header` | ✅ All unchanged | |
| `file_get_contents` on local JSON (quotes.json) | ✅ Unchanged (PHP built-in) | Cleaner alternative: `WP_Filesystem`. Not urgent. |

**Conclusion: nothing in our theme breaks on 7.0.** No deprecation alarms.

### PHP version

**Minimum PHP 7.4.** Verify in Hostinger hPanel → PHP Version. Modern Hostinger plans should be on 8.0+. If on 7.2/7.3, the 7.0 auto-update prompt is suppressed and you stay on 6.9.

### Astra parent theme

- **Must be 4.13.1+.** **4.13.0 shipped a critical admin JS error**; hotfix in 4.13.1. **Confirm we're on 4.13.1+ post-upgrade.** (Smoke test on 2026-05-20 reported `?ver=4.13.3` so we're past it — but double-check in wp-admin → Themes if anything looks off.)
- Astra disabled its own command-palette icon on WP 7.0+ since core ships one. No action.
- No reported breakage interacting with custom child themes.
- [Astra changelog](https://wpastra.com/changelog/astra-theme) · [WordPress.org support: 4.13.0 critical error](https://wordpress.org/support/topic/4-13-has-a-critical-error-need-astra-4-13-1-asap/)

### LiteSpeed Cache

- Requires WP 5.3+ and PHP 7.2+; 7.0 well above floor.
- No 7.0-specific known issues found.
- After 7.0 upgrade: **Purge LSCache once**, then re-check Page Optimization → CSS/JS combine settings. If conditional block CSS loading changes which files exist per page (it does — see next section), combined-CSS hashes regenerate; expect one slow pageview per template the first time it's hit.

---

## The block-library CSS observation — correct, but it shipped in 6.9

Our smoke test noticed `wp-includes/css/dist/block-library/style.min.css` was no longer emitted on our classic-PHP-template pages. That observation is **correct** and **good**, but the change actually landed in **WP 6.9**, not 7.0 — 7.0 inherited it.

**Sources:** [Trac #64099](https://core.trac.wordpress.org/ticket/64099) · [6.9 Frontend Performance Field Guide](https://make.wordpress.org/core/2025/11/18/wordpress-6-9-frontend-performance-field-guide/)

**What changed:**

- **Pre-6.9:** Classic themes always loaded the full `block-library/style.min.css` (~120KB) on every page, because PHP-rendered classic templates print `<head>` before the body is parsed, so WP didn't know which blocks would appear.
- **6.9+:** An output-buffer-based template enhancement scans rendered HTML for block markers; `print_late_styles()` + `wp_hoist_late_printed_styles()` hoist late-printed per-block styles into `<head>` right after `wp-block-library-inline-css`. The big monolithic file is no longer enqueued on pages that don't need it.

**Impact:** ~**10–15% LCP improvement** on core classic themes; ~**100KB CSS saved per pageview** on prose-heavy pages like ours.

**Our hardcoded PHP page templates** render zero core blocks, so the late-printed style logic correctly omits the big stylesheet. **This is intended and good.**

**Opt-out if anything breaks** (don't do this without a reason):

```php
add_filter( 'should_load_separate_core_block_assets', '__return_false' );
```

Or the [Load Combined Core Block Assets plugin](https://wordpress.org/plugins/load-combined-core-block-assets/).

**Recommendation: keep it on.** Our prose-heavy hand-coded templates are exactly the case this optimization was built for.

---

## Performance opportunities

- **Speculation Rules / Speculative Loading** — landed in 6.8, still on in 7.0. [Speculative Loading plugin](https://wordpress.org/plugins/speculation-rules/). Prerender-on-hover would be a perceived-speed win at near-zero cost for a 14-page site.
- **View transitions** — 7.0 ships them for admin. Frontend opt-in via `@view-transition` CSS rule. Easy add to our child theme stylesheet for smoother page-to-page nav (Chrome/Edge/Safari TP).
- **`wp_hoist_late_printed_styles()`** — only relevant if we start emitting late `<style>` blocks. Not now.
- **Font Library** — if we ever move our custom fonts (Caveat, Fraunces, Italiana) from `wp_enqueue_style`/Google Fonts into the Font Library, WP handles preloads. Not urgent.

---

## Security notes for 7.0

No 7.0-specific changes to nonce semantics. The [2023 nonces dev blog post](https://developer.wordpress.org/news/2023/08/understand-and-use-wordpress-nonces-properly/) still applies.

Our `/wp-json/tc-games/v1/scores` endpoint:
- Already uses `permission_callback` (required since 5.5).
- Accepts public POST (anonymous score submission) — by design, with sanity limits in code.
- If we ever tighten this to require auth, validate `X-WP-Nonce` for cookie-auth + accept App Password for non-interactive.

[Trac #53994](https://core.trac.wordpress.org/ticket/53994) (session cookie + nonce edge case) is still open. Our defense remains: do `current_user_can()` checks; never rely on nonce alone.

---

## Unstable bits — what to avoid building on yet

- **Connectors API JS registration of non-`api_key` providers** — explicitly experimental. Avoid until 7.1.
- **`state.navigation.hasStarted`/`hasFinished`** — deprecated; 7.1 replacement coming. We don't use the Interactivity API, so n/a.
- **Real-time collaboration** — partly scoped to 7.1. We're a single-author portfolio, n/a.
- **Heading block H1–H6 variations** — n/a (hardcoded PHP, no block content).
- **OAuth 2.1 scoped tokens in Abilities API** — claimed in community write-ups, **not yet confirmed in core docs**. Plan as if it doesn't exist until you can verify.

---

## Primary-source link index

- [WordPress 7.0 "Armstrong" announcement](https://wordpress.org/news/2026/05/wordpress-7-0-armstrong/)
- [WordPress 7.0 Field Guide](https://make.wordpress.org/core/2026/05/14/wordpress-7-0-field-guide/)
- [Version 7.0 documentation](https://wordpress.org/documentation/wordpress-version/version-7-0/)
- [Make WP 7.0 hub](https://make.wordpress.org/core/7-0/) · [Dev notes 7-0](https://make.wordpress.org/core/tag/dev-notes+7-0/)
- [AI Client dev note](https://make.wordpress.org/core/2026/03/24/introducing-the-ai-client-in-wordpress-7-0/)
- [Connectors API dev note](https://make.wordpress.org/core/2026/03/18/introducing-the-connectors-api-in-wordpress-7-0/)
- [Client-Side Abilities API dev note](https://make.wordpress.org/core/2026/03/24/client-side-abilities-api-in-wordpress-7-0/)
- [Abilities API reference](https://developer.wordpress.org/apis/abilities-api/) · [Abilities API in 6.9](https://make.wordpress.org/core/2025/11/10/abilities-api-in-wordpress-6-9/)
- [MCP Adapter dev blog post](https://developer.wordpress.org/news/2026/02/from-abilities-to-ai-agents-introducing-the-wordpress-mcp-adapter/) · [github.com/WordPress/mcp-adapter](https://github.com/wordpress/mcp-adapter)
- [WordPress.org MCP Server](https://developer.wordpress.org/plugins/wordpress-org/using-the-mcp-server/)
- [WP 6.9 Frontend Performance Field Guide](https://make.wordpress.org/core/2025/11/18/wordpress-6-9-frontend-performance-field-guide/) (block CSS change origin)
- [Trac #64099](https://core.trac.wordpress.org/ticket/64099) (load block styles on demand in classic themes)
- [Application Passwords (Advanced Administration)](https://developer.wordpress.org/advanced-administration/security/application-passwords/) · [Application Passwords Integration Guide](https://make.wordpress.org/core/2020/11/05/application-passwords-integration-guide/)
- [Telex (Automattic)](https://telex.automattic.ai/)
- [Astra theme changelog](https://wpastra.com/changelog/astra-theme)
- [LiteSpeed Cache plugin page](https://wordpress.org/plugins/litespeed-cache/)
- [github.com/google/site-kit-wp/releases](https://github.com/google/site-kit-wp/releases) (Site Kit changelog)

---

## What I (the writing agent) could NOT verify

Future agent — fill these in if you can:

1. **Abilities API OAuth 2.1 scoped tokens** — secondary sources describe it, the official developer.wordpress.org Abilities API page does not. Verify on next inspection of that page.
2. **Site Kit 1.179.0 release notes** — were not findable in search at briefing time (May 20, 2026, same day as the WP 7.0 release). Check [github.com/google/site-kit-wp/releases](https://github.com/google/site-kit-wp/releases) directly when needed.
