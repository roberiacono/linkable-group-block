import { addFilter } from "@wordpress/hooks";
import { createHigherOrderComponent } from "@wordpress/compose";
import { Fragment, useState } from "@wordpress/element";
import { BlockControls } from "@wordpress/block-editor";
import {
	ToolbarGroup,
	ToolbarButton,
	Popover,
	TextControl,
	ToggleControl,
	Button,
	Flex,
	FlexBlock,
	FlexItem,
} from "@wordpress/components";
import { BlockListBlock } from "@wordpress/block-editor";
import { LinkControl } from "@wordpress/block-editor";
import { check, adminLinks } from "@wordpress/icons";

import "./style.scss";

// Add `linkUrl` attribute
addFilter(
	"blocks.registerBlockType",
	"linkable-group-block/add-attributes",
	(settings, name) => {
		if (name !== "core/group") return settings;

		return {
			...settings,
			attributes: {
				...settings.attributes,
				linkUrl: {
					type: "string",
					default: "",
				},
				linkTarget: {
					type: "string",
					default: undefined,
				},
				rel: {
					type: "string",
					default: undefined,
				},
			},
		};
	},
);

// Add toolbar button to editor
addFilter(
	"editor.BlockEdit",
	"linkable-group-block/add-toolbar",
	createHigherOrderComponent((BlockEdit) => {
		return (props) => {
			const { name, attributes, setAttributes, isSelected } = props;

			if (name !== "core/group") return <BlockEdit {...props} />;

			const { linkUrl, linkTarget, rel } = attributes;
			const [showPopover, setShowPopover] = useState(false);

			return (
				<Fragment>
					<BlockEdit {...props} />
					{isSelected && (
						<BlockControls>
							<ToolbarGroup>
								<ToolbarButton
									icon="admin-links"
									label="Set Group Block Link"
									isActive={!!linkUrl}
									onClick={() => setShowPopover(!showPopover)}
								/>
							</ToolbarGroup>
						</BlockControls>
					)}
					{isSelected && showPopover && (
						<Popover
							position="bottom"
							onClose={() => setShowPopover(false)}
							focusOnMount={false}
						>
							<div style={{ width: 360 }}>
								<LinkControl
									searchInputPlaceholder="Search or type URL"
									value={{
										url: attributes.linkUrl,
										opensInNewTab: attributes.linkTarget === "_blank",
									}}
									onChange={(newValue) => {
										setAttributes({
											linkUrl: newValue.url,
											linkTarget: newValue.opensInNewTab ? "_blank" : undefined,
										});
									}}
									settings={[
										{
											id: "opensInNewTab",
											title: "Open in new tab",
											onChange: (isNewTab) =>
												setAttributes({
													linkTarget: isNewTab ? "_blank" : undefined,
												}),
											checked: attributes.linkTarget === "_blank",
										},
										{
											id: "markAsNofollow",
											title: "Mark as nofollow",
											onChange: (value) =>
												setAttributes({ rel: value ? "nofollow" : undefined }),
											checked: attributes.rel === "nofollow",
										},
									]}
									onRemove={() =>
										setAttributes({
											linkUrl: undefined,
											linkTarget: undefined,
											rel: undefined,
										})
									}
								/>
							</div>
						</Popover>
					)}
				</Fragment>
			);
		};
	}, "withGroupLinkToolbar"),
);

// Modify how block appears inside editor — wrap with <a>
/* addFilter(
	"editor.BlockListBlock",
	"linkable-group-block/wrap-editor-preview",
	(BlockComponent) => (props) => {
		const { name, attributes } = props;

		if (name === "core/group" && attributes.linkUrl) {
			return (
				<a
					href={attributes.linkUrl}
					style={{ textDecoration: "none", color: "inherit", display: "block" }}
				>
					<BlockComponent {...props} />
				</a>
			);
		}

		return <BlockComponent {...props} />;
	},
); */

// Modify how block saves — wrap saved content
addFilter(
	"blocks.getSaveContent.extraProps",
	"linkable-group-block/save-wrapper",
	(extraProps, blockType, attributes) => {
		if (blockType.name !== "core/group") return extraProps;

		if (attributes.linkUrl) {
			extraProps["data-link-url"] = attributes.linkUrl;
		}

		return extraProps;
	},
);
