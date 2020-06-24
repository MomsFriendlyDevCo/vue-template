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
