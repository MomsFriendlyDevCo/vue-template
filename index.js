var _ = require('lodash');
var vueCompiler = require('vue-template-compiler');

var isArray = input => typeof input == 'object' && Object.prototype.toString.call(input) == '[object Array]';

var VueTemplate = function(html, options) {
	var settings = {
		context: {},
		selfClosingTags: new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']), // Set sourced from http://xahlee.info/js/html5_non-closing_tag.html
		async: false,
		keySerialize: JSON.stringify,
		fixOmittedStyle: true,
		fixStrippedStyle: true,
		onPreTemplate: (template, settings) => {
			return settings.fixStrippedStyle
				? template.replace(/(?!:)style="(.*?)"/g, '_STYLE="$1"')
				: template
		},
		onPostGenerate: (content, settings) => {
			return settings.fixStrippedStyle
				? content.replace(/_STYLE="(.*?)"/g, 'style="$1"')
				: content
		},
		...options,
	};

	// Set rendering as server-side so tags like <style/> are correctly passed through
	if (settings.fixOmittedStyle) {
		var oldVueEnv = process.env.VUE_ENV;
		process.env.VUE_ENV = 'server';
	}

	var template = vueCompiler.compileToFunctions(settings.onPreTemplate(html, settings));

	if (settings.fixOmittedStyle) {
		if (oldVueEnv === undefined) {
			delete process.env.VUE_ENV;
		} else {
			process.env.VUE_ENV = oldVueEnv;
		}
	}

	var context = {
		_c: (tag, attr, children) => { // Compute DOM element
			// Argument mangling
			if (isArray(attr)) [attr, children] = [{}, attr];

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
					+ ( isArray(children) ? children.flat(Infinity).join(' ') : '' )
				+ '</' + tag + '>';
			}
		},
		_v: value => value, // Render literal value
		_m: offset => template.staticRenderFns[offset].call(context), // Render a sub-module by offset
		_l: (list, func) => list.map(func), // Render list (really a map operation)
		_s: value => value, // Lookup value from context
		_e: ()=> {}, // Set v-else to do nothing by default
		_promiseMap: new Map(), // Promises we are waiting on in async mode, each key is the func name + args, populated by _s(v)
		...context,
	};

	return data => {
		if (!settings.async) { // Sync mode - return simple string
			return settings.onPostGenerate(template.render.call({
				...context,
				...data,
			}), settings)
		} else { // Async mode - eval as Promise and return {{{
			return Promise.resolve() // Start promise chain
				.then(()=> void template.render.call({ // Call render and ignore initial result to populate _promises
					...context,
					..._.mapValues(data, (val, name) => {
						if (typeof val == 'function') {
							return (...args) => {
								var id = settings.keySerialize([name, ...args]);
								if (!context._promiseMap.has(id)) // Not seen this function signature before - queue it
									context._promiseMap.set(
										id, // Serialized key made of func name + args
										Promise.resolve(data[name](...args)) // Val is the (assumed async promise) func to wait on
											.then(result => context._promiseMap.set(id, result)) // Set final result
									);
								return '[PROMISE-PENDING]';
							};
						} else {
							return val;
						}
					}),
				}))
				.then(()=> Promise.all(context._promiseMap.values()))
				.then(()=> template.render.call({ // Call render again now all promises have settled
					...context,
					..._.mapValues(data, (val, name) => {
						if (typeof val == 'function') {
							return (...args) => {
								var id = settings.keySerialize([name, ...args]);
								return context._promiseMap.get(id);
							};
						} else {
							return val;
						}
					}),
				}))
				.then(content => settings.onPostGenerate(content, settings))
			// }}}
		}
	};
};

VueTemplate.async = (html, options) =>
	VueTemplate(html, {
		async: true,
		...options,
	})

module.exports = VueTemplate;
