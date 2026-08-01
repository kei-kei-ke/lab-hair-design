<?php
/**
 * Plugin Name: Lab Headless Bridge
 * Description: Registers WordPress content types and exposes an aggregated REST endpoint for the Astro frontend.
 * Version: 0.4.0
 * Author: GitHub Copilot
 */

if (! defined('ABSPATH')) {
    exit;
}

class Lab_Headless_Bridge {
    private const OPTION_KEY = 'lab_headless_settings';
    private const DEPLOY_WEBHOOK_LOCK_KEY = 'lab_headless_deploy_webhook_lock';

    private array $settings_fields = [
        'name' => 'サロン名',
        'kana' => 'サロン名カナ',
        'instagramUrl' => 'InstagramアカウントURL',
        'instagramGraphAccessToken' => 'Instagram Graph Access Token',
        'instagramBusinessAccountId' => 'Instagram Business Account ID（任意）',
        'instagramFeedJson' => 'Instagramフィード(JSON)',
        'hotpepperUrl' => 'Hot Pepper URL',
        'bookingUrl' => '予約URL',
        'telPageUrl' => '電話URL',
        'address' => '住所',
        'accessSummary' => 'アクセス概要',
        'accessGuide1' => 'アクセス案内 1',
        'accessGuide2' => 'アクセス案内 2',
        'hours' => '営業時間',
        'lastReception' => '最終受付',
        'closed' => '定休日',
        'stationAccess' => '駅からのアクセス',
        'parking' => '駐車場',
        'payment' => '支払い方法',
        'cutPrice' => 'カット価格',
        'seats' => '席数',
        'staffCount' => 'スタッフ数',
        'rating' => '評価',
        'reviewCount' => '口コミ件数',
        'lead' => 'リード文',
        'intro' => '導入文',
        'features' => '特徴（改行区切り）',
        'deployWebhookUrl' => 'Deploy Webhook URL',
        'deployWebhookAuthHeader' => 'Deploy Webhook 認証ヘッダー名（任意）',
        'deployWebhookAuthToken' => 'Deploy Webhook 認証トークン（任意）',
        'deployWebhookSecret' => 'Deploy Webhook シークレット（任意）',
        'deployWebhookEventType' => 'Deploy Webhook event_type',
        'deployWebhookCooldownSeconds' => 'Deploy Webhook 連続発火抑制秒数',
    ];

    private array $deploy_trigger_post_types = ['lab_style', 'lab_photo'];

    private array $meta_boxes = [
        'lab_staff' => [
            'kana' => 'かな',
            'role' => '役職',
            'history' => '経歴',
        ],
        'lab_style' => [
            'stylist' => '担当スタイリスト',
            'category' => 'カテゴリ',
        ],
        'lab_menu' => [
            'category' => '表示カテゴリ',
            'price' => '価格',
            'label' => 'TOP掲載ラベル',
            'highlight' => 'TOP掲載する (1 または 0)',
        ],
        'lab_home_card' => [
            'label' => 'ラベル',
        ],
        'lab_info' => [
            'label' => 'ラベル',
            'external_link_url' => '外部リンクURL',
        ],
    ];

    public function __construct() {
        add_action('init', [$this, 'register_post_types']);
        add_action('init', [$this, 'register_rest_meta']);
        add_action('add_meta_boxes', [$this, 'register_meta_boxes']);
        add_action('save_post', [$this, 'save_meta_boxes']);
        add_action('save_post', [$this, 'trigger_deploy_on_save'], 20, 3);
        add_action('before_delete_post', [$this, 'trigger_deploy_on_before_delete'], 10, 1);
        add_action('trashed_post', [$this, 'trigger_deploy_on_trashed'], 10, 1);
        add_action('untrashed_post', [$this, 'trigger_deploy_on_untrashed'], 10, 1);
        add_action('set_post_thumbnail', [$this, 'trigger_deploy_on_set_thumbnail'], 10, 3);
        add_action('add_attachment', [$this, 'trigger_deploy_on_attachment_add'], 10, 1);
        add_action('edit_attachment', [$this, 'trigger_deploy_on_attachment_edit'], 10, 1);
        add_action('delete_attachment', [$this, 'trigger_deploy_on_attachment_delete'], 10, 1);
        add_action('admin_menu', [$this, 'register_options_page']);
        add_action('admin_init', [$this, 'register_settings']);
        add_action('rest_api_init', [$this, 'register_rest_routes']);
    }

    public function register_post_types(): void {
        $common = [
            'public' => true,
            'show_in_rest' => true,
            'supports' => ['title', 'editor', 'excerpt', 'thumbnail', 'page-attributes'],
            'menu_position' => 20,
        ];

        register_post_type('lab_staff', array_merge($common, [
            'labels' => [
                'name' => 'Lab Staff',
                'singular_name' => 'Lab Staff',
            ],
        ]));

        register_post_type('lab_style', array_merge($common, [
            'labels' => [
                'name' => 'Lab Styles',
                'singular_name' => 'Lab Style',
            ],
        ]));

        register_post_type('lab_menu', array_merge($common, [
            'labels' => [
                'name' => 'Lab Menus',
                'singular_name' => 'Lab Menu',
            ],
        ]));

        register_post_type('lab_home_card', array_merge($common, [
            'labels' => [
                'name' => 'Lab Home Cards',
                'singular_name' => 'Lab Home Card',
            ],
            'rest_base' => 'home-cards',
        ]));

        register_post_type('lab_info', array_merge($common, [
            'labels' => [
                'name' => 'Lab Info',
                'singular_name' => 'Lab Info',
            ],
        ]));

        register_post_type('lab_photo', array_merge($common, [
            'labels' => [
                'name' => 'Lab Photos',
                'singular_name' => 'Lab Photo',
            ],
        ]));

        register_post_type('lab_access', array_merge($common, [
            'labels' => [
                'name' => 'Lab Access',
                'singular_name' => 'Lab Access',
            ],
        ]));

        register_post_type('lab_recruit', array_merge($common, [
            'labels' => [
                'name' => 'Lab Recruit',
                'singular_name' => 'Lab Recruit',
            ],
        ]));

        register_post_type('lab_shop', array_merge($common, [
            'labels' => [
                'name' => 'Lab Shop',
                'singular_name' => 'Lab Shop',
            ],
        ]));
    }

    public function register_rest_meta(): void {
        register_post_meta('lab_info', 'external_link_url', [
            'type' => 'string',
            'single' => true,
            'show_in_rest' => true,
            'sanitize_callback' => 'esc_url_raw',
            'auth_callback' => '__return_true',
            'description' => 'Lab Info external destination URL',
        ]);
    }

    public function register_meta_boxes(): void {
        foreach ($this->meta_boxes as $post_type => $fields) {
            add_meta_box(
                'lab_headless_' . $post_type,
                'Headless Fields',
                function ($post) use ($post_type, $fields) {
                    wp_nonce_field('lab_headless_meta', 'lab_headless_meta_nonce');
                    echo '<table class="form-table"><tbody>';
                    foreach ($fields as $key => $label) {
                        $value = get_post_meta($post->ID, $key, true);
                        echo '<tr>';
                        echo '<th><label for="' . esc_attr($key) . '">' . esc_html($label) . '</label></th>';
                        echo '<td><input type="text" class="regular-text" id="' . esc_attr($key) . '" name="lab_headless_meta[' . esc_attr($key) . ']" value="' . esc_attr($value) . '" /></td>';
                        echo '</tr>';
                    }
                    echo '</tbody></table>';
                },
                $post_type,
                'normal',
                'default'
            );
        }
    }

    public function save_meta_boxes(int $post_id): void {
        if (! isset($_POST['lab_headless_meta_nonce']) || ! wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['lab_headless_meta_nonce'])), 'lab_headless_meta')) {
            return;
        }

        if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
            return;
        }

        if (! current_user_can('edit_post', $post_id)) {
            return;
        }

        $meta = isset($_POST['lab_headless_meta']) ? (array) wp_unslash($_POST['lab_headless_meta']) : [];
        foreach ($meta as $key => $value) {
            $sanitized_key = sanitize_key($key);
            if ($sanitized_key === 'external_link_url') {
                update_post_meta($post_id, $sanitized_key, esc_url_raw((string) $value));
                continue;
            }

            update_post_meta($post_id, $sanitized_key, sanitize_text_field($value));
        }
    }

    public function register_options_page(): void {
        add_options_page(
            'Lab Headless Settings',
            'Lab Headless Settings',
            'manage_options',
            'lab-headless-settings',
            [$this, 'render_options_page']
        );
    }

    public function register_settings(): void {
        register_setting('lab_headless_group', self::OPTION_KEY, [$this, 'sanitize_options']);
    }

    public function sanitize_options(array $input): array {
        $sanitized = [];
        foreach ($this->settings_fields as $key => $label) {
            $value = $input[$key] ?? '';
            if ($key === 'deployWebhookUrl') {
                $sanitized[$key] = esc_url_raw((string) $value);
            } elseif ($key === 'deployWebhookCooldownSeconds') {
                $seconds = absint($value);
                $sanitized[$key] = (string) min(max($seconds, 0), 600);
            } elseif ($key === 'deployWebhookEventType') {
                $sanitized[$key] = sanitize_key((string) $value);
            } elseif ($key === 'features' || $key === 'instagramFeedJson') {
                $sanitized[$key] = sanitize_textarea_field($value);
            } else {
                $sanitized[$key] = sanitize_text_field($value);
            }
        }
        return $sanitized;
    }

    public function render_options_page(): void {
        if (! current_user_can('manage_options')) {
            return;
        }

        $options = get_option(self::OPTION_KEY, []);
        echo '<div class="wrap">';
        echo '<h1>Lab Headless Settings</h1>';
        echo '<form method="post" action="options.php">';
        settings_fields('lab_headless_group');
        echo '<table class="form-table"><tbody>';
        foreach ($this->settings_fields as $key => $label) {
            $value = $options[$key] ?? '';
            echo '<tr>';
            echo '<th scope="row"><label for="' . esc_attr($key) . '">' . esc_html($label) . '</label></th>';
            echo '<td>';
            if ($key === 'features') {
                echo '<textarea class="large-text" rows="5" id="' . esc_attr($key) . '" name="' . esc_attr(self::OPTION_KEY) . '[' . esc_attr($key) . ']">' . esc_textarea($value) . '</textarea>';
            } elseif ($key === 'instagramGraphAccessToken') {
                echo '<input type="password" class="regular-text" id="' . esc_attr($key) . '" name="' . esc_attr(self::OPTION_KEY) . '[' . esc_attr($key) . ']" value="' . esc_attr($value) . '" autocomplete="off" />';
                echo '<p class="description">Instagram Graph APIで最新投稿を自動同期するためのトークンです。</p>';
            } elseif ($key === 'instagramBusinessAccountId') {
                echo '<input type="text" class="regular-text" id="' . esc_attr($key) . '" name="' . esc_attr(self::OPTION_KEY) . '[' . esc_attr($key) . ']" value="' . esc_attr($value) . '" />';
                echo '<p class="description">任意。未入力なら graph.instagram.com/me/media を使用します。</p>';
            } elseif ($key === 'instagramFeedJson') {
                echo '<textarea class="large-text code" rows="8" id="' . esc_attr($key) . '" name="' . esc_attr(self::OPTION_KEY) . '[' . esc_attr($key) . ']">' . esc_textarea($value) . '</textarea>';
                echo '<p class="description">例: [{"id":"1","permalink":"https://instagram.com/p/...","mediaUrl":"https://...jpg","caption":"..."}]</p>';
            } elseif ($key === 'deployWebhookUrl') {
                echo '<input type="url" class="large-text" id="' . esc_attr($key) . '" name="' . esc_attr(self::OPTION_KEY) . '[' . esc_attr($key) . ']" value="' . esc_attr($value) . '" placeholder="https://api.github.com/repos/OWNER/REPO/dispatches" />';
                echo '<p class="description">WordPress更新時に呼び出すWebhook URLです。GitHub Actionsの場合は repository dispatch API URL を指定してください。</p>';
            } elseif ($key === 'deployWebhookAuthHeader') {
                echo '<input type="text" class="regular-text" id="' . esc_attr($key) . '" name="' . esc_attr(self::OPTION_KEY) . '[' . esc_attr($key) . ']" value="' . esc_attr($value) . '" placeholder="Authorization" />';
                echo '<p class="description">任意。例: Authorization</p>';
            } elseif ($key === 'deployWebhookAuthToken') {
                echo '<input type="password" class="regular-text" id="' . esc_attr($key) . '" name="' . esc_attr(self::OPTION_KEY) . '[' . esc_attr($key) . ']" value="' . esc_attr($value) . '" autocomplete="off" />';
                echo '<p class="description">任意。Authorization を使う場合は Bearer から含めて入力してください。例: Bearer ghp_xxx</p>';
            } elseif ($key === 'deployWebhookSecret') {
                echo '<input type="password" class="regular-text" id="' . esc_attr($key) . '" name="' . esc_attr(self::OPTION_KEY) . '[' . esc_attr($key) . ']" value="' . esc_attr($value) . '" autocomplete="off" />';
                echo '<p class="description">任意。X-Lab-Webhook-Secret ヘッダーで送信されます。</p>';
            } elseif ($key === 'deployWebhookEventType') {
                $effective = $value !== '' ? $value : 'wp_content_updated';
                echo '<input type="text" class="regular-text" id="' . esc_attr($key) . '" name="' . esc_attr(self::OPTION_KEY) . '[' . esc_attr($key) . ']" value="' . esc_attr($effective) . '" />';
                echo '<p class="description">GitHub Actions repository dispatch 用の event_type。通常は wp_content_updated のままで問題ありません。</p>';
            } elseif ($key === 'deployWebhookCooldownSeconds') {
                $effective = $value !== '' ? $value : '15';
                echo '<input type="number" min="0" max="600" class="small-text" id="' . esc_attr($key) . '" name="' . esc_attr(self::OPTION_KEY) . '[' . esc_attr($key) . ']" value="' . esc_attr($effective) . '" />';
                echo '<p class="description">連続更新時の重複発火を防ぐ抑制秒数です（0〜600秒）。</p>';
            } else {
                echo '<input type="text" class="regular-text" id="' . esc_attr($key) . '" name="' . esc_attr(self::OPTION_KEY) . '[' . esc_attr($key) . ']" value="' . esc_attr($value) . '" />';
            }
            echo '</td>';
            echo '</tr>';
        }
        echo '</tbody></table>';
        submit_button();
        echo '</form>';
        echo '</div>';
    }

    public function register_rest_routes(): void {
        register_rest_route('lab/v1', '/site-content', [
            'methods' => 'GET',
            'permission_callback' => '__return_true',
            'callback' => [$this, 'get_site_content'],
        ]);

        register_rest_route('lab/v1', '/instagram-feed', [
            'methods' => 'GET',
            'permission_callback' => '__return_true',
            'callback' => [$this, 'get_instagram_feed'],
        ]);
    }

    public function get_site_content(): WP_REST_Response {
        $options = get_option(self::OPTION_KEY, []);

        $staff_posts = get_posts([
            'post_type' => 'lab_staff',
            'post_status' => 'publish',
            'posts_per_page' => -1,
            'orderby' => ['menu_order' => 'ASC', 'date' => 'DESC'],
        ]);

        $style_posts = get_posts([
            'post_type' => 'lab_style',
            'post_status' => 'publish',
            'posts_per_page' => -1,
            'orderby' => ['menu_order' => 'ASC', 'date' => 'DESC'],
        ]);

        $menu_posts = get_posts([
            'post_type' => 'lab_menu',
            'post_status' => 'publish',
            'posts_per_page' => -1,
            'orderby' => 'menu_order',
            'order' => 'ASC',
        ]);

        $home_posts = get_posts([
            'post_type' => 'lab_home_card',
            'post_status' => 'publish',
            'posts_per_page' => -1,
            'orderby' => ['menu_order' => 'ASC', 'date' => 'DESC'],
        ]);

        $info_posts = get_posts([
            'post_type' => 'lab_info',
            'post_status' => 'publish',
            'posts_per_page' => -1,
            'orderby' => ['menu_order' => 'ASC', 'date' => 'DESC'],
        ]);

        $photo_posts = get_posts([
            'post_type' => 'lab_photo',
            'post_status' => 'publish',
            'posts_per_page' => -1,
            'orderby' => ['menu_order' => 'ASC', 'date' => 'DESC'],
        ]);

        $access_posts = get_posts([
            'post_type' => 'lab_access',
            'post_status' => 'publish',
            'posts_per_page' => 1,
            'orderby' => ['menu_order' => 'ASC', 'date' => 'DESC'],
        ]);

        $recruit_posts = get_posts([
            'post_type' => 'lab_recruit',
            'post_status' => 'publish',
            'posts_per_page' => 1,
            'orderby' => ['menu_order' => 'ASC', 'date' => 'DESC'],
        ]);

        $shop_posts = get_posts([
            'post_type' => 'lab_shop',
            'post_status' => 'publish',
            'posts_per_page' => 1,
            'orderby' => ['menu_order' => 'ASC', 'date' => 'DESC'],
        ]);

        $staff_members = array_map(function ($post) {
            return [
                'slug' => $post->post_name,
                'name' => $post->post_title,
                'kana' => get_post_meta($post->ID, 'kana', true),
                'role' => get_post_meta($post->ID, 'role', true),
                'history' => get_post_meta($post->ID, 'history', true),
                'profile' => wp_strip_all_tags($post->post_content),
                'image' => $this->get_featured_image_url($post->ID),
            ];
        }, $staff_posts);

        $hair_styles = array_map(function ($post) {
            return [
                'slug' => $post->post_name,
                'title' => $post->post_title,
                'stylist' => get_post_meta($post->ID, 'stylist', true),
                'category' => get_post_meta($post->ID, 'category', true),
                'image' => $this->get_featured_image_url($post->ID),
            ];
        }, $style_posts);

        $style_categories = array_values(array_unique(array_filter(array_map(function ($style) {
            return $style['category'] ?? '';
        }, $hair_styles))));

        $price_sections = [];
        $price_highlights = [];
        $shop_care_items = [];

        foreach ($menu_posts as $post) {
            $category = get_post_meta($post->ID, 'category', true);
            $raw_price = trim((string) get_post_meta($post->ID, 'price', true));
            $label = get_post_meta($post->ID, 'label', true);
            $highlight = get_post_meta($post->ID, 'highlight', true);
            $raw_note = trim((string) wp_strip_all_tags($post->post_content ?: $post->post_excerpt));
            $menu_order = (int) ($post->menu_order ?? 0);
            $created_at = get_post_time('c', true, $post);

            $price = $raw_price;
            $note = $raw_note;

            if ($price === '' && preg_match('/(?:¥|￥)?\s*[0-9０-９,，]+\s*円?$/u', $raw_note)) {
                $price = $raw_note;
                $note = '';
            }

            $item = [
                'name' => $post->post_title,
                'price' => $price,
                'note' => $note,
                'menuOrder' => $menu_order,
                'createdAt' => $created_at,
            ];

            if (! isset($price_sections[$category])) {
                $price_sections[$category] = [
                    'category' => $category,
                    'menuOrder' => $menu_order,
                    'createdAt' => $created_at,
                    'items' => [],
                ];
            }
            $price_sections[$category]['items'][] = $item;

            if ($highlight === '1') {
                $price_highlights[] = [
                    'label' => $label ?: 'Menu',
                    'title' => $post->post_title,
                    'price' => $price,
                    'text' => $note,
                ];
            }

            if ($category === 'Care') {
                $shop_care_items[] = [
                    'label' => $label ?: 'Care Menu',
                    'title' => $post->post_title,
                    'price' => $price,
                    'text' => $note,
                ];
            }
        }

        $home_info = array_map(function ($post) {
            return [
                'label' => get_post_meta($post->ID, 'label', true),
                'title' => $post->post_title,
                'body' => wp_strip_all_tags($post->post_content ?: $post->post_excerpt),
                'image' => $this->get_featured_image_url($post->ID),
            ];
        }, $home_posts);

        $info_entries = array_map(function ($post) {
            return [
                'label' => get_post_meta($post->ID, 'label', true),
                'title' => $post->post_title,
                'text' => wp_strip_all_tags($post->post_content ?: $post->post_excerpt),
            ];
        }, $info_posts);

        $photo_gallery = array_values(array_filter(array_map(function ($post) {
            $image = $this->get_featured_image_url($post->ID);
            if ($image === '') {
                return null;
            }

            return [
                'slug' => $post->post_name,
                'title' => $post->post_title,
                'image' => $image,
                'caption' => wp_strip_all_tags($post->post_excerpt ?: $post->post_content),
            ];
        }, $photo_posts)));

        $access_page = $this->map_single_page_post($access_posts[0] ?? null);
        $recruit_page = $this->map_single_page_post($recruit_posts[0] ?? null);
        $shop_page = $this->map_single_page_post($shop_posts[0] ?? null);

        $instagram_payload = $this->resolve_instagram_feed($options, $style_posts);

        $payload = [
            'salon' => [
                'name' => $options['name'] ?? '',
                'kana' => $options['kana'] ?? '',
                'instagramUrl' => $options['instagramUrl'] ?? '',
                'hotpepperUrl' => $options['hotpepperUrl'] ?? '',
                'bookingUrl' => $options['bookingUrl'] ?? '',
                'telPageUrl' => $options['telPageUrl'] ?? '',
                'address' => $options['address'] ?? '',
                'accessSummary' => $options['accessSummary'] ?? '',
                'accessGuide' => array_values(array_filter([$options['accessGuide1'] ?? '', $options['accessGuide2'] ?? ''])),
                'hours' => $options['hours'] ?? '',
                'lastReception' => $options['lastReception'] ?? '',
                'closed' => $options['closed'] ?? '',
                'stationAccess' => $options['stationAccess'] ?? '',
                'parking' => $options['parking'] ?? '',
                'payment' => $options['payment'] ?? '',
                'cutPrice' => $options['cutPrice'] ?? '',
                'seats' => $options['seats'] ?? '',
                'staffCount' => $options['staffCount'] ?? '',
                'rating' => $options['rating'] ?? '',
                'reviewCount' => $options['reviewCount'] ?? '',
                'lead' => $options['lead'] ?? '',
                'intro' => $options['intro'] ?? '',
                'features' => array_values(array_filter(array_map('trim', preg_split('/\r\n|\r|\n/', $options['features'] ?? '')))),
            ],
            'staffMembers' => $staff_members,
            'styleCategories' => $style_categories,
            'hairStyles' => $hair_styles,
            'homeInfo' => $home_info,
            'infoEntries' => $info_entries,
            'priceSections' => array_values($price_sections),
            'priceHighlights' => $price_highlights,
            'shopCareItems' => $shop_care_items,
            'photoGallery' => $photo_gallery,
            'accessPage' => $access_page,
            'recruitPage' => $recruit_page,
            'shopPage' => $shop_page,
            'instagramFeed' => $instagram_payload['items'],
        ];

        return new WP_REST_Response($payload, 200);
    }

    private function get_featured_image_url(int $post_id): string {
        $image_id = get_post_thumbnail_id($post_id);
        if (! $image_id) {
            return '';
        }

        $image = wp_get_attachment_image_url($image_id, 'large');
        return $image ?: '';
    }

    private function map_single_page_post($post): array {
        if (! $post instanceof WP_Post) {
            return [
                'slug' => '',
                'title' => '',
                'body' => '',
                'excerpt' => '',
                'image' => '',
            ];
        }

        return [
            'slug' => $post->post_name,
            'title' => $post->post_title,
            'body' => wp_strip_all_tags($post->post_content),
            'excerpt' => wp_strip_all_tags($post->post_excerpt),
            'image' => $this->get_featured_image_url($post->ID),
        ];
    }

    public function get_instagram_feed(): WP_REST_Response {
        $options = get_option(self::OPTION_KEY, []);
        $instagram_payload = $this->resolve_instagram_feed($options);

        $payload = [
            'accountUrl' => $this->get_instagram_account_url($options),
            'accountName' => $instagram_payload['accountName'],
            'items' => $instagram_payload['items'],
            'source' => $instagram_payload['source'],
            'message' => $instagram_payload['message'],
            'updatedAt' => gmdate('c'),
        ];

        return new WP_REST_Response($payload, 200);
    }

    private function resolve_instagram_feed(array $options): array {
        $graph_payload = $this->fetch_instagram_graph_feed($options);
        if (! empty($graph_payload['items'])) {
            return $graph_payload;
        }

        $account_name = $this->infer_instagram_account_name((string) ($options['instagramUrl'] ?? ''));
        if ($account_name === '') {
            $account_name = 'lab.hair.design';
        }

        $raw = $options['instagramFeedJson'] ?? '';
        if (is_string($raw) && trim($raw) !== '') {
            $decoded = json_decode($raw, true);
            if (is_array($decoded)) {
                $items = array_map(function ($item) {
                    if (! is_array($item)) {
                        return null;
                    }

                    $media = isset($item['mediaUrl']) ? esc_url_raw((string) $item['mediaUrl']) : '';
                    $permalink = isset($item['permalink']) ? esc_url_raw((string) $item['permalink']) : '';
                    if ($media === '' || $permalink === '') {
                        return null;
                    }

                    return [
                        'id' => sanitize_text_field((string) ($item['id'] ?? wp_generate_uuid4())),
                        'permalink' => $permalink,
                        'mediaUrl' => $media,
                        'caption' => sanitize_text_field((string) ($item['caption'] ?? '')),
                        'timestamp' => sanitize_text_field((string) ($item['timestamp'] ?? '')),
                        'username' => sanitize_text_field((string) ($item['username'] ?? '')),
                    ];
                }, $decoded);

                $items = array_values(array_filter($items));
                if (! empty($items)) {
                    if ($account_name === '') {
                        $first_username = sanitize_text_field((string) ($items[0]['username'] ?? ''));
                        $account_name = $first_username;
                    }

                    return [
                        'accountName' => $account_name,
                        'items' => $items,
                        'source' => 'manual-json',
                        'message' => '',
                    ];
                }
            }
        }

        return [
            'accountName' => $account_name,
            'items' => [],
            'source' => 'unconfigured',
            'message' => 'Instagram Graph Access Token is not configured.',
        ];
    }

    private function fetch_instagram_graph_feed(array $options): array {
        $access_token = trim((string) ($options['instagramGraphAccessToken'] ?? ''));
        if ($access_token === '') {
            return [
                'accountName' => 'lab.hair.design',
                'items' => [],
                'source' => 'missing-token',
                'message' => 'Instagram Graph Access Token is not configured.',
            ];
        }

        $account_id = trim((string) ($options['instagramBusinessAccountId'] ?? ''));
        $cache_key = 'lab_ig_graph_' . md5($account_id . '|' . $access_token);
        $cached = get_transient($cache_key);
        if (is_array($cached) && isset($cached['items']) && is_array($cached['items'])) {
            return $cached;
        }

        $endpoint = $account_id !== ''
            ? 'https://graph.facebook.com/v23.0/' . rawurlencode($account_id) . '/media'
            : 'https://graph.instagram.com/me/media';

        $request_url = add_query_arg([
            'fields' => 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,username',
            'limit' => '12',
            'access_token' => $access_token,
        ], $endpoint);

        $response = wp_remote_get($request_url, [
            'timeout' => 10,
        ]);

        if (is_wp_error($response)) {
            return [
                'accountName' => 'lab.hair.design',
                'items' => [],
                'source' => 'graph-error',
                'message' => $response->get_error_message(),
            ];
        }

        $status = (int) wp_remote_retrieve_response_code($response);
        if ($status < 200 || $status >= 300) {
            return [
                'accountName' => 'lab.hair.design',
                'items' => [],
                'source' => 'graph-http-error',
                'message' => 'Instagram Graph API returned HTTP ' . $status,
            ];
        }

        $decoded = json_decode((string) wp_remote_retrieve_body($response), true);
        $media_list = is_array($decoded['data'] ?? null) ? $decoded['data'] : [];

        $items = array_values(array_filter(array_map(function ($media) {
            if (! is_array($media)) {
                return null;
            }

            $media_url = esc_url_raw((string) ($media['media_url'] ?? $media['thumbnail_url'] ?? ''));
            $permalink = esc_url_raw((string) ($media['permalink'] ?? ''));

            if ($media_url === '' || $permalink === '') {
                return null;
            }

            return [
                'id' => sanitize_text_field((string) ($media['id'] ?? wp_generate_uuid4())),
                'permalink' => $permalink,
                'mediaUrl' => $media_url,
                'caption' => sanitize_text_field((string) ($media['caption'] ?? '')),
                'timestamp' => sanitize_text_field((string) ($media['timestamp'] ?? '')),
                'username' => sanitize_text_field((string) ($media['username'] ?? '')),
            ];
        }, array_slice($media_list, 0, 6))));

        $account_name = '';
        if (! empty($items)) {
            $account_name = sanitize_text_field((string) ($items[0]['username'] ?? ''));
        }
        if ($account_name === '') {
            $account_name = $this->infer_instagram_account_name((string) ($options['instagramUrl'] ?? ''));
        }

        $payload = [
            'accountName' => $account_name,
            'items' => $items,
            'source' => ! empty($items) ? 'graph' : 'graph-empty',
            'message' => ! empty($items) ? '' : 'Instagram Graph API returned no items.',
        ];

        if (! empty($items)) {
            set_transient($cache_key, $payload, 5 * MINUTE_IN_SECONDS);
        }

        return $payload;
    }

    private function infer_instagram_account_name(string $instagram_url): string {
        $path = wp_parse_url($instagram_url, PHP_URL_PATH);
        if (! is_string($path) || trim($path) === '') {
            return '';
        }

        $segments = array_values(array_filter(explode('/', $path)));
        if (empty($segments)) {
            return '';
        }

        return sanitize_text_field(ltrim((string) $segments[0], '@'));
    }

    private function get_instagram_account_url(array $options): string {
        $url = trim((string) ($options['instagramUrl'] ?? ''));
        if ($url !== '') {
            return $url;
        }

        return 'https://www.instagram.com/lab.hair.design/';
    }

    public function trigger_deploy_on_save(int $post_id, WP_Post $post, bool $update): void {
        if ($this->is_ignored_save_request($post_id)) {
            return;
        }

        if (! $this->is_deploy_target_post_type($post->post_type)) {
            return;
        }

        $this->trigger_deploy_webhook($update ? 'post_updated' : 'post_created', [
            'postId' => $post_id,
            'postType' => $post->post_type,
            'status' => $post->post_status,
        ]);
    }

    public function trigger_deploy_on_before_delete(int $post_id): void {
        if (! $this->is_deploy_target_post_id($post_id)) {
            return;
        }

        $this->trigger_deploy_webhook('post_deleted', [
            'postId' => $post_id,
            'postType' => get_post_type($post_id),
        ]);
    }

    public function trigger_deploy_on_trashed(int $post_id): void {
        if (! $this->is_deploy_target_post_id($post_id)) {
            return;
        }

        $this->trigger_deploy_webhook('post_trashed', [
            'postId' => $post_id,
            'postType' => get_post_type($post_id),
        ]);
    }

    public function trigger_deploy_on_untrashed(int $post_id): void {
        if (! $this->is_deploy_target_post_id($post_id)) {
            return;
        }

        $this->trigger_deploy_webhook('post_untrashed', [
            'postId' => $post_id,
            'postType' => get_post_type($post_id),
        ]);
    }

    public function trigger_deploy_on_set_thumbnail(int $post_id, int $thumbnail_id, bool $meta_value): void {
        if (! $this->is_deploy_target_post_id($post_id)) {
            return;
        }

        $this->trigger_deploy_webhook('featured_image_updated', [
            'postId' => $post_id,
            'postType' => get_post_type($post_id),
            'thumbnailId' => $thumbnail_id,
            'hasThumbnail' => $meta_value,
        ]);
    }

    public function trigger_deploy_on_attachment_add(int $attachment_id): void {
        $this->trigger_deploy_webhook('attachment_added', [
            'attachmentId' => $attachment_id,
        ]);
    }

    public function trigger_deploy_on_attachment_edit(int $attachment_id): void {
        $this->trigger_deploy_webhook('attachment_edited', [
            'attachmentId' => $attachment_id,
        ]);
    }

    public function trigger_deploy_on_attachment_delete(int $attachment_id): void {
        $this->trigger_deploy_webhook('attachment_deleted', [
            'attachmentId' => $attachment_id,
        ]);
    }

    private function is_ignored_save_request(int $post_id): bool {
        if (wp_is_post_autosave($post_id) || wp_is_post_revision($post_id)) {
            return true;
        }

        return defined('DOING_AUTOSAVE') && DOING_AUTOSAVE;
    }

    private function is_deploy_target_post_type(string $post_type): bool {
        return in_array($post_type, $this->deploy_trigger_post_types, true);
    }

    private function is_deploy_target_post_id(int $post_id): bool {
        $post_type = get_post_type($post_id);
        if (! is_string($post_type) || $post_type === '') {
            return false;
        }

        return $this->is_deploy_target_post_type($post_type);
    }

    private function trigger_deploy_webhook(string $event, array $context = []): void {
        $options = get_option(self::OPTION_KEY, []);
        $url = esc_url_raw((string) ($options['deployWebhookUrl'] ?? ''));
        if ($url === '') {
            return;
        }

        $cooldown = absint($options['deployWebhookCooldownSeconds'] ?? 15);
        $cooldown = min(max($cooldown, 0), 600);

        if ($cooldown > 0 && get_transient(self::DEPLOY_WEBHOOK_LOCK_KEY)) {
            return;
        }

        $event_type = sanitize_key((string) ($options['deployWebhookEventType'] ?? ''));
        if ($event_type === '') {
            $event_type = 'wp_content_updated';
        }

        $client_payload = array_merge([
            'event' => $event,
            'source' => 'lab-headless-bridge',
            'siteUrl' => home_url('/'),
            'timestamp' => gmdate('c'),
        ], $context);

        $payload = [
            'event_type' => $event_type,
            'client_payload' => $client_payload,
        ];

        $headers = [
            'Content-Type' => 'application/json',
            'Accept' => 'application/json',
            'X-Lab-Webhook-Event' => $event,
        ];

        $secret = trim((string) ($options['deployWebhookSecret'] ?? ''));
        if ($secret !== '') {
            $headers['X-Lab-Webhook-Secret'] = $secret;
        }

        $auth_header = trim((string) ($options['deployWebhookAuthHeader'] ?? ''));
        $auth_token = trim((string) ($options['deployWebhookAuthToken'] ?? ''));
        if ($auth_header !== '' && $auth_token !== '') {
            $headers[$auth_header] = $auth_token;
        }

        if (strpos($url, 'api.github.com/repos/') !== false) {
            $headers['Accept'] = 'application/vnd.github+json';
            $headers['X-GitHub-Api-Version'] = '2022-11-28';
        }

        $response = wp_remote_post($url, [
            'timeout' => 10,
            'headers' => $headers,
            'body' => wp_json_encode($payload),
        ]);

        if (! is_wp_error($response)) {
            $status = (int) wp_remote_retrieve_response_code($response);
            if ($status >= 200 && $status < 300 && $cooldown > 0) {
                set_transient(self::DEPLOY_WEBHOOK_LOCK_KEY, '1', $cooldown);
            }
            return;
        }

        error_log('[lab-headless-bridge] Deploy webhook request failed: ' . $response->get_error_message());
    }
}

new Lab_Headless_Bridge();
