<?php
/**
 * Plugin Name:       Linkable Group Block
 * Description:       Example block scaffolded with Create Block tool.
 * Version:           0.1.0
 * Requires at least: 6.7
 * Requires PHP:      7.4
 * Author:            The WordPress Contributors
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       linkable-group-block
 *
 * @package CreateBlock
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}
/**
 * Registers the block using a `blocks-manifest.php` file, which improves the performance of block type registration.
 * Behind the scenes, it also registers all assets so they can be enqueued
 * through the block editor in the corresponding context.
 *
 * @see https://make.wordpress.org/core/2025/03/13/more-efficient-block-type-registration-in-6-8/
 * @see https://make.wordpress.org/core/2024/10/17/new-block-type-registration-apis-to-improve-performance-in-wordpress-6-7/
 */
function create_block_linkable_group_block_block_init() {
	/**
	 * Registers the block(s) metadata from the `blocks-manifest.php` and registers the block type(s)
	 * based on the registered block metadata.
	 * Added in WordPress 6.8 to simplify the block metadata registration process added in WordPress 6.7.
	 *
	 * @see https://make.wordpress.org/core/2025/03/13/more-efficient-block-type-registration-in-6-8/
	 */
	if ( function_exists( 'wp_register_block_types_from_metadata_collection' ) ) {
		wp_register_block_types_from_metadata_collection( __DIR__ . '/build', __DIR__ . '/build/blocks-manifest.php' );
		return;
	}

	/**
	 * Registers the block(s) metadata from the `blocks-manifest.php` file.
	 * Added to WordPress 6.7 to improve the performance of block type registration.
	 *
	 * @see https://make.wordpress.org/core/2024/10/17/new-block-type-registration-apis-to-improve-performance-in-wordpress-6-7/
	 */
	if ( function_exists( 'wp_register_block_metadata_collection' ) ) {
		wp_register_block_metadata_collection( __DIR__ . '/build', __DIR__ . '/build/blocks-manifest.php' );
	}
	/**
	 * Registers the block type(s) in the `blocks-manifest.php` file.
	 *
	 * @see https://developer.wordpress.org/reference/functions/register_block_type/
	 */
	$manifest_data = require __DIR__ . '/build/blocks-manifest.php';
	foreach ( array_keys( $manifest_data ) as $block_type ) {
		register_block_type( __DIR__ . "/build/{$block_type}" );
	}
}
add_action( 'init', 'create_block_linkable_group_block_block_init' );

add_action( 'wp_enqueue_scripts', 'linkable_group_block_enqueue_styles' );

function linkable_group_block_enqueue_styles() {

    $style_url  = plugins_url( 'build/linkable-group-block/style-index.css', __FILE__ );

    wp_enqueue_style(
        'linkable-group-block-style',
        $style_url,
    );

}


// Filter the rendered core/group block
add_filter( 'render_block_core/group', 'linkable_group_wrap_with_link', 10, 2 );

function linkable_group_wrap_with_link( $block_content, $block ) {
    if (
        empty( $block['attrs']['linkUrl'] ) ||
        ! is_string( $block['attrs']['linkUrl'] )
    ) {
        return $block_content;
    }

    $url     = esc_url( $block['attrs']['linkUrl'] );
	$target  = ! empty( $block['attrs']['linkTarget'] ) && $block['attrs']['linkTarget'] === '_blank' ? '_blank' : null;
	$rel     = 'noopener noreferrer' . ( ! empty( $block['attrs']['rel'] ) && $block['attrs']['rel'] === 'nofollow' ? ' nofollow' : '' );
	$aria    = esc_attr( $url );

    // Create stretched link HTML
	$link_html = sprintf(
		'<a href="%s"%s%s class="stretched-link" aria-label="%s"></a>',
		$url,
		$target ? ' target="' . $target . '"' : '',
		$rel ? ' rel="' . $rel . '"' : '',
		$aria
	);


	// Modify the img attributes using the HTML API.
	$processor = new WP_HTML_Tag_Processor( $block_content );

	if ( $processor->next_tag( 'div' ) ) {
		$processor->add_class( 'is-linkable' );
		$block_content = $processor->get_updated_html();
	}
	
	$pos = strrpos($block_content, '</div>');

	if ($pos !== false) {
		// Insert the $link_html before the last closing </div>
		$block_content = substr_replace($block_content, $link_html, $pos, 0);
	}



	return $block_content;
}