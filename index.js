import {createSSRApp} from 'vue';
import {renderToString} from 'vue/server-renderer';

export default function vueTemplate(html) {
	return async input => {
		let data = {}, methods = {};
		Object.entries(input || {}).forEach(([key, val]) => {
			if (typeof val == 'function') {
				methods[key] = val;
			} else {
				data[key] = val;
			}
		})

		const app = createSSRApp({
			data: ()=> data,
			methods,
			template: html,
		});

		return await renderToString(app)
	};
}
