@MomsFriendlyDevCo/Vue-Template
===============================
Compile a simple HTML string via Vue style templates.

This package exports a single function to compile a Vue-style template and return a render function which can then be provided with data.

```javascript
var vueTemplate = require('@momsfriendlydevco/vue-template');

var template = vueTemplate('<div>Hello {{name}}</div>');

template({name: 'Joe'}); //= "<div>Hello Joe</div>"
template({name: 'Jane'}); //= "<div>Hello Jane</div>"
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
}) // Compiled version of the above template
```


API
===

vueTemplate(html, options)
---------------------------
Compile raw HTML into a Vue render function and return a template wrapper function. See `template(data)` for documentation on how to use the templator return.

Options:

| Option            | Type  | Default  | Description                                                                     |
|-------------------|-------|----------|---------------------------------------------------------------------------------|
| `selfClosingTags` | `Set` | See code | A Set object initialized with all tags which support the HTML self closing spec |


template(data)
--------------
Takes an object of context data to use when rendering, renders the template and returns the HTML output.
