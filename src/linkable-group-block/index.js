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

			const { linkUrl, linkTarget } = attributes;
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
							<div style={{ width: 360, padding: 12 }}>
								<Flex>
									<FlexBlock>
										<TextControl
											placeholder="Paste or type a URL"
											value={attributes.linkUrl}
											onChange={(url) => setAttributes({ linkUrl: url })}
										/>
									</FlexBlock>
									<FlexItem>
										<ToolbarButton
											icon={check}
											label="Apply"
											onClick={() => setShowPopover(false)}
										/>
									</FlexItem>
									{attributes.linkUrl && (
										<FlexItem>
											<ToolbarButton
												//icon={no}
												label="Clear"
												onClick={() => {
													setAttributes({ linkUrl: "", linkTarget: undefined });
													setShowPopover(false);
												}}
											/>
										</FlexItem>
									)}
								</Flex>

								<ToggleControl
									label="Open in new tab"
									checked={attributes.linkTarget === "_blank"}
									onChange={(value) =>
										setAttributes({ linkTarget: value ? "_blank" : undefined })
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
