<?php
/**
 * Plugin Name: IG Sync Helper
 * Description: Provides a simple REST endpoint to check existing Instagram media and saves instagram_id meta on instagram_media creation via REST.
 * Version: 0.1
 * Author: Copilot
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly
}

add_action('init', function() {
    // Register a lightweight custom post type for Instagram media so REST API can expose it
    $labels = array(
        'name' => 'Instagram Media',
        'singular_name' => 'Instagram Media',
        'menu_name' => 'Instagram Media',
        'name_admin_bar' => 'Instagram Media',
    );
    $args = array(
        'labels' => $labels,
        'public' => false, // not publicly queryable on the front-end
        'show_ui' => true,
        'show_in_rest' => true,
        'rest_base' => 'instagram_media',
        'has_archive' => false,
        'rewrite' => false,
        'supports' => array('title', 'editor', 'thumbnail'),
        'capability_type' => 'post',
    );
    register_post_type('instagram_media', $args);

    // Ensure meta is registered so REST can accept it
    register_post_meta('instagram_media', 'instagram_id', array(
        'single' => true,
        'type' => 'string',
        'show_in_rest' => true,
    ));
});

add_action('rest_api_init', function () {
    register_rest_route('ig-sync/v1', '/exists', array(
        'methods' => 'GET',
        'callback' => 'igsync_exists',
        'permission_callback' => function () {
            return current_user_can('edit_posts');
        },
    ));
});

function igsync_exists( WP_REST_Request $request ) {
    $ig_id = $request->get_param('ig_id');
    if ( empty( $ig_id ) ) {
        return new WP_REST_Response( array( 'exists' => false, 'error' => 'missing ig_id' ), 400 );
    }

    $args = array(
        'post_type' => 'instagram_media',
        'meta_query' => array(
            array(
                'key' => 'instagram_id',
                'value' => sanitize_text_field( $ig_id ),
                'compare' => '='
            )
        ),
        'posts_per_page' => 1,
        'fields' => 'ids',
        'no_found_rows' => true,
    );

    $q = new WP_Query( $args );
    wp_reset_postdata();
    return array( 'exists' => (bool) $q->have_posts() );
}

// When an instagram_media post is created via REST, ensure instagram_id meta is saved
add_action('rest_insert_instagram_media', function( $post, $request, $creating ) {
    if ( ! $creating ) return;
    $meta = $request->get_param('meta');
    if ( is_array( $meta ) && isset( $meta['instagram_id'] ) ) {
        update_post_meta( $post->ID, 'instagram_id', sanitize_text_field( $meta['instagram_id'] ) );
    }
}, 10, 3);

// Optional: helper to add CORS for simple testing (only in dev)
add_action('rest_api_init', function() {
    remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
    add_filter('rest_pre_serve_request', function($value) {
        if ( isset($_SERVER['HTTP_ORIGIN']) ) {
            header('Access-Control-Allow-Origin: ' . esc_url_raw($_SERVER['HTTP_ORIGIN']));
            header('Access-Control-Allow-Credentials: true');
            header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
            header('Access-Control-Allow-Headers: Authorization, Content-Type');
        }
        return $value;
    });
});
