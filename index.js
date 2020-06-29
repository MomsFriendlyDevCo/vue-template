var _ = require('lodash');
var vueCompiler = require('vue-template-compiler');

module.exports = function(html, options) {
	var settings = {
		selfClosingTags: new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']), // Set sourced from http://xahlee.info/js/html5_non-closing_tag.html
	};

	var template = vueCompiler.compileToFunctions(html);
	var context = {
		_c: (tag, attr, children) => { // Compute DOM element
			// Argument mangling
			if (_.isArray(attr)) [attr, children] = [{}, attr];

			// If tag is empty but is a valid self-closing tag return the minimal element
			if ((!children || !children.length) && settings.selfClosingTags.has(tag)) return `<${tag}/>`;

			var domAttrs = [
				attr.staticClass ? `class="${attr.staticClass}"` : null, // Copy class definition
				...Object.keys(attr.attrs || {}) // Copy static attributes
					.map(key => attr.attrs[key] ? `${key}="${attr.attrs[key]}"` : key),
			].filter(i => i) // Remove duds

			return '<'
				+ tag
				+ (domAttrs.length ? ' ' + domAttrs.join(' ') : '')
			+ '>'
				+ (children || []).join(' ')
			+ '</' + tag + '>';
		},
		_v: value => value, // Render literal value
		_m: offset => template.staticRenderFns[offset].call(context), // Render a sub-module by offset
		_l: (list, func) => list.map(func), // Render list (really a map operation)
		_s: value => value, // Lookup value from context
	};

	return data => template.render.call({
		...context,
		...data,
	});
};
