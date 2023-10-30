import test from 'ava';
import vt from '../index.js';

test('Render simple passthru HTML', async t => {
	let str, ans;

	str = '<div>A</div>';
	t.is(await vt(str)(), str);

	str = '<div class="strong" custom1="custom1Val" custom2>A</div>';
	t.is(await vt(str)(), str);

	t.is(await vt('<img src="imgSrc1"/>')(), '<img src="imgSrc1">');

	str = '<img :src="iSrc"/>';
	t.is(await vt(str)({iSrc: 'imgSrc2'}), '<img src="imgSrc2">');

	str = '<div><span>A</span>B<span>C</span></div>';
	t.is(await vt(str)(), str);

	t.is(await vt('<div>A<br/>B</div>')(), '<div>A<br>B</div>');

});


test('Render the meta "class" attribute', async t => {
	t.is(await vt('<a class="simple">1</a>')({}), '<a class="simple">1</a>');
	t.is(await vt('<a class="simple1 simple2">1</a>')({}), '<a class="simple1 simple2">1</a>');
	t.is(await vt('<a :class="\'simple2\'">1</a>')({}), '<a class="simple2">1</a>');
	t.is(await vt('<a :class="lookup">1</a>')({lookup: 'Lookup!'}), '<a class="Lookup!">1</a>');
	t.is(await vt('<a :class="aLookup">1</a>')({aLookup: ['a1', 'a2', 'a3']}), '<a class="a1 a2 a3">1</a>');
	t.is(await vt('<a :class="[a, b, c]">1</a>')({a: 'a1', b: 'b1', c: 'c1'}), '<a class="a1 b1 c1">1</a>');
	t.is(await vt('<a :class="tern ? \'a1\' : \'b1\'">1</a>')({tern: true}), '<a class="a1">1</a>');
	t.is(await vt('<a :class="tern ? \'a1\' : \'b1\'">1</a>')({tern: false}), '<a class="b1">1</a>');
	t.is(await vt('<a :class="[\'a1\', b, c ? \'c1\' : \'c2\']">1</a>')({b: 'b1', c: true}), '<a class="a1 b1 c1">1</a>');
	t.is(await vt('<a :class="{a1: true, b1: false, c1: true || false}">1</a>')({}), '<a class="a1 c1">1</a>');
});

test('Render simple mustaches ({{val}})', async t => {
	t.is(await vt('<div>Hello {{v}}</div>')({v: 'Foo'}), '<div>Hello Foo</div>');
	t.is(await vt('<div><span>{{a}}</span> {{b}} <span>{{c}}</span></div>')({a: 'Foo', b: 'Bar', c: 'Baz'}), '<div><span>Foo</span> Bar <span>Baz</span></div>');
});

test('Conditionals (v-if, v-else-if, v-else)', async t => {
	t.is(await vt('<div>=<span v-if="a">Y</span></div>')({a: true}), '<div>=<span>Y</span></div>');
	t.is(await vt('<div>=<span v-if="a">Y</span><span v-else>N</span></div>')({a: true}), '<div>=<span>Y</span></div>');
	t.is(await vt('<div>=<span v-if="a">Y</span><span v-else>N</span></div>')({a: false}), '<div>=<span>N</span></div>');
	t.is(await vt('<div>=<span v-if="a == 1">1</span><span v-else-if="a == 2">2</span><span v-else>3</span></div>')({a: 1}), '<div>=<span>1</span></div>');
	t.is(await vt('<div>=<span v-if="a == 1">1</span><span v-else-if="a == 2">2</span><span v-else>3</span></div>')({a: 2}), '<div>=<span>2</span></div>');
	t.is(await vt('<div>=<span v-if="a == 1">1</span><span v-else-if="a == 2">2</span><span v-else>3</span></div>')({a: 3}), '<div>=<span>3</span></div>');
	t.not(await vt('<div><span v-if="a == 7">Y</span></div>')({a: 3}), '<div><span>Y</span></div>');
});

test('should support iteration (v-for)', async t => {
	t.is(await vt('<ol><li v-for="i in l">{{i}}</li></ol>')({l: [1, 2, 3]}), '<ol><!--[--><li>1</li><li>2</li><li>3</li><!--]--></ol>');
	t.is(await vt('<ol><li v-for="i in l">{{i}}</li><li>foo</li></ol>')({l: [1, 2, 3]}), '<ol><!--[--><li>1</li><li>2</li><li>3</li><!--]--><li>foo</li></ol>');
});

test('should render a complex example', async t => {
	t.is(await vt(
		'<body>'
			+ 'Hello {{user.name.first}} {{user.name.last}}<br/>'
			+ 'Your favourite color '
				+ '<span v-if="user.color.toLowerCase() == \'blue\'">is blue</span>'
				+ '<span v-else>is <strong>NOT </strong>blue</span>'
			+ '<br/>'
			+ 'Your pets are: '
				+ '<ol class="list-unordered pets">'
					+ '<li v-for="pet in user.pets">'
						+ '{{pet.name}} ({{pet.type}})'
					+ '</li>'
				+'</ol>'
		+ '</body>',
	)({
		user: {
			name: {first: 'Joe', middle: 'H', last: 'Random'},
			color: 'Red',
			pets: [
				{name: 'Pepper', type: 'Cat'},
				{name: 'Meg', type: 'Dog'},
			],
		},
	}),
		'<body>'
			+ 'Hello Joe Random<br>'
			+ 'Your favourite color <span>is <strong>NOT </strong>blue</span><br>'
			+ 'Your pets are: <ol class="list-unordered pets">'
				+ '<!--[-->'
					+ '<li>Pepper (Cat)</li>'
					+ '<li>Meg (Dog)</li>'
				+ '<!--]-->'
			+ '</ol>'
		+ '</body>'
	);
});

test('Handle <style/> tags', async t => {
	process.env.VUE_ENV = 'client';
	var content = await vt(''
		+ '<html>'
			+ '<head>'
				+ '<style>'
					+ '.person {color: blue}'
				+ '</style>'
			+ '</head>'
			+ '<body style="background: white">'
				+ 'Hello <span class="person">{{user.name.first}} {{user.name.last}}</span>'
			+ '</body>'
		+ '</html>'
	)({
		user: {
			name: {first: 'Joe', middle: 'H', last: 'Random'},
		},
	});

	t.regex(content, /<style>.*<span class="person">Joe Random<\/span>/)

	var bodyDef = content.replace(/.*(<body.*?>).*/, '$1');
	t.is(bodyDef, '<body style="background:white;">');

	t.is(process.env.VUE_ENV, 'client');
});

test('Handle <style/> tags + attrs (async)', async t => Promise.resolve()
	.then(()=> process.env.VUE_ENV = 'client')
	.then(()=> vt(''
		+ '<html>'
			+ '<head>'
				+ '<style>'
					+ '.person {color: blue}'
				+ '</style>'
			+ '</head>'
			+ '<body style="background: white">'
				+ 'Hello <span class="person">{{user.name.first}} {{user.name.last}}</span>'
			+ '</body>'
		+ '</html>',
	))
	.then(template => template({
		user: {
			name: {first: 'Joe', middle: 'H', last: 'Random'},
		},
	}))
	.then(content => {
		t.regex(content, /<style>.*<span class="person">Joe Random<\/span>/);
		var bodyDef = content.replace(/.*(<body.*?>).*/, '$1');
		t.is(bodyDef, '<body style="background:white;">');
		t.is(process.env.VUE_ENV, 'client');
	})
);

test('Functions', async t => {
	t.is(await vt('<p>Hello {{caps(name)}}</p>')({
		name: 'Matt',
		caps: str => str.toUpperCase(),
	}), '<p>Hello MATT</p>');
});


test('Errors (mismatched tags)', async t => {
	// Annoyingly the renderer fixes both these cases
	await t.notThrowsAsync(()=> vt('<p>Hello</div></div>')());
	await t.notThrowsAsync(()=> vt('<div>Hello</p>')());
});

test('Errors (undefined variables)', async t => {
	// Annoyingly the renderer fixes these cases
	await t.notThrowsAsync(()=> vt('<p>Hello {{undef}}</pre>')())
	await t.notThrowsAsync(()=> vt('<div v-if="thing">Hello</div>')());
	await t.notThrowsAsync(()=> vt('<div v-for="stuff in everything">Hello</div>')());
});
