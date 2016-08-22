import R from 'ramda';
import withSideEffect from 'react-side-effect';

import escapeHTML from 'escape-html';

import React from 'react';

const getNodes = (tagType) =>
	Array.prototype.slice.call(document.querySelectorAll(`${tagType}[data-freud]`));

const syncNodes = (tagType, newTagsRepresentation = []) => {
	const areEqual = (repr, node) =>
		Object.keys(repr).reduce((prev, prop) => prev && repr[prop] === node.getAttribute(prop), true);

	/* remove old tags */
	getNodes(tagType).forEach((mountedNode) => {
		const found = newTagsRepresentation.some((newTag) =>
			areEqual(newTag, mountedNode)
		);
		if (!found) {
			document.head.removeChild(mountedNode);
		}
	});

	/* add new tags */
	let mountedNodes = getNodes(tagType);
	newTagsRepresentation.forEach((newTag) => {
		const found = mountedNodes.some((mountedNode) =>
			areEqual(newTag, mountedNode)
		);
		if (!found) {
			const newNode = document.createElement(tagType);
			Object.keys(newTag).forEach(prop => newNode.setAttribute(prop, newTag[prop]));
			newNode.setAttribute('data-freud', true);
			document.head.appendChild(newNode);
		}
	});
}

const reduceTitle = (state) => {
	const newTitle = state.title || state.defaultTitle;
	return newTitle ? (state.titleTemplate || '%s').replace(/%s/, newTitle) : '';
};

function handleClientStateChange(state) {
	/* so that I can override defaultTitle and titleTemplate */
	const newState = { ...state };

	/* from server rendering */
	if (!newState.titleTemplate || !newState.defaultTitle) {
		/* I shouldn't do this here but I can't do it anywhere else either... */
		const titleTag = document.querySelector('title');
		newState.defaultTitle = titleTag.getAttribute('data-default-title');
		newState.titleTemplate = titleTag.getAttribute('data-title-template');
	}

	document.title = reduceTitle(newState) || document.title;

	syncNodes('script', newState.scripts);
	syncNodes('link', newState.links);
	syncNodes('meta', newState.metas);
}

const buildAttrsString = (obj) =>
	[
		'data-freud="true"',
		...Object.keys(obj).map(attr => `${attr}="${escapeHTML(obj[attr])}"`)
	].join(' ');

const renderTags = (type, objs, selfClosing = true) => () => {
	return objs.map(
		obj => `<${type} ${buildAttrsString(obj)} ${selfClosing ? '/' : `></${type}`}>`
	).join("\n")
};

function mapStateOnServer(state) {
	const titleAttrs = {
		'data-default-title': state.defaultTitle || '',
		'data-title-template': state.titleTemplate || ''
	};
	return {
		title: { toString: () => `<title ${buildAttrsString(titleAttrs)}>${escapeHTML(reduceTitle(state) || '')}</title>` },
		scripts: { toString: renderTags('script', state.scripts || [], false) },
		links: { toString: renderTags('link', state.links || []) },
		metas: { toString: renderTags('meta', state.metas || []) }
	};
}

function reducePropsToState(propsList) {
	return propsList.reduce((prev, next) => {
		/* merge array attributes */
		const arrays = {};
		for (let attr in prev) {
			if (Array.isArray(prev[attr]) && next[attr]) {
				arrays[attr] = R.uniq([ ...prev[attr], ...(Array.isArray(next[attr]) ? next[attr] : []) ]);
			}
		}
		/* merge other attributes */
		return {
			...prev,
			...next,
			...arrays
		}
	});
}

export default withSideEffect(
	reducePropsToState,
	handleClientStateChange,
	mapStateOnServer
)(() => null);
