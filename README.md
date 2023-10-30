@MomsFriendlyDevCo/Vue-Template
===============================
Compile a simple HTML string via Vue style templates.

This package exports a single function to compile a Vue-style template and return a render function which can then be provided with data.

```javascript
import vueTemplate from '@momsfriendlydevco/vue-template';

let template = vueTemplate('<div>Hello {{name}}</div>');

await template({name: 'Joe'}); //~= "<div>Hello Joe</div>"
await template({name: 'Jane'}); //~= "<div>Hello Jane</div>"
```


All built in Vue directives are supported:

```javascript
var vueTemplate = require('@momsfriendlydevco/vue-template');

var template = vueTemplate(`
	<body>
		<p>Hello {{user.name.first}} {{user.name.last}}</p>
		<p>
			Your favourite color
			<span v-if="user.color.toLowerCase() == 'blue'">is blue</span>
			<span v-else>is<strong>NOT</strong>blue</span>
		</p>
		<p>
			Your pets are:
			<ol v-if="user.pets && user.pets.length">
				<li v-for="pet in user.pets">
					{{pet.name}} ({{pet.type}})
				</li>
			</ol>
			<span v-else>You have no pets (aw!)</span>
		</p>
	</body>
`);

template({
	user: {
		name: {first: 'Joe', middle: 'H', last: 'Random'},
		color: 'Red',
		pets: [
			{name: 'Pepper', type: 'Cat'},
			{name: 'Meg', type: 'Dog'},
		],
	},
}) //~= Compiled version of the above template
```


Support table
-------------
The below is a non-exhaustive list of templating functions that are supported.
If you find a Vue feature that isn't listed below please file an issue or add a [test](./test) for it.


| Feature     | Supported          | Notes        |
|-------------|--------------------|--------------|
| `v-if`      | :white_check_mark: |              |
| `v-on`      | :no_entry_sign:    | `events`     |
| `v-for`     | :white_check_mark: |              |
| `v-pre`     | ?                  |              |
| `v-bind`    | ?                  |              |
| `v-else`    | :white_check_mark: |              |
| `v-else-if` | :white_check_mark: |              |
| `v-html`    | ?                  |              |
| `v-once`    | :no_entry_sign:    | `events`     |
| `v-show`    | ?                  |              |
| `v-slot`    | :no_entry_sign:    | `components` |
| `v-text`    | ?                  |              |
| `v-cloak`   | ?                  |              |
| `v-model`   | ?                  |              |
| `:class`    | :white_check_mark: | `classes`    |
| `:style`    | ?                  |              |


**Notes:**
* `classes` - All styles of class binding are supported (e.g. static, lookup, array lookup, objects, mixed)
* `components` - At this point this module does not support custom components
* `events` - Events are entirely unsupported as this is a "one-pass" templator that returns HTML and does not react to async states


API
===

vueTemplate(html)
-----------------
Compile raw HTML into a Vue render function and return a template wrapper function. See `template(data)` for documentation on how to use the templator return.


template(data)
--------------
Takes an object of context data to use when rendering, renders the template and returns the HTML output.
All functions are automatically converted into Vue component methods.
