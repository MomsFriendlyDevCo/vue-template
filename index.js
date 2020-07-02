var _ = require('lodash');
var vueCompiler = require('vue-template-compiler');

var isArray = input => typeof input == 'object' && Object.prototype.toString.call(input) == '[object Array]';

module.exports = function(html, options) {
	var settings = {
		selfClosingTags: new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']), // Set sourced from http://xahlee.info/js/html5_non-closing_tag.html
	};

	var template = vueCompiler.compileToFunctions(html);
	var context = {
		_c: (tag, attr, children) => { // Compute DOM element
			// Argument mangling
			if (_.isArray(attr)) [attr, children] = [{}, attr];

			var domAttrs = [
				// Class meta type
				attr && (attr.staticClass || attr.class)
					? 'class="' + [
						attr.staticClass || '',
						attr.class && isArray(attr.class) ? attr.class.join(' ')
							: typeof attr.class == 'object' ? Object.keys(attr.class).filter(a => attr.class[a]).join(' ')
							: attr.class ? attr.class
							: ''
					].filter(i => i).join(' ') + '"'
					: null,

				// Other attrs
				...Object.keys(attr && attr.attrs ? attr.attrs : {})
					.map(key => attr.attrs[key] ? `${key}="${attr.attrs[key]}"` : key),
			].filter(i => i) // Remove duds

			if ((!children || !children.length) && settings.selfClosingTags.has(tag)) { // Is self closing
				return '<'
					+ tag
					+ (domAttrs.length ? ' ' + domAttrs.join(' ') : '')
				+ '/>';
			} else {
				return '<'
					+ tag
					+ (domAttrs.length ? ' ' + domAttrs.join(' ') : '')
				+ '>'
					+ (children || []).join(' ')
				+ '</' + tag + '>';
			}
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
