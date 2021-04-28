var expect = require('chai').expect;
var vt = require('../index');

describe('Render simple structures', ()=> {

	it('should render a simple HTML blocks (no special directives)', ()=> {
		var str = '<div>A</div>';
		expect(vt(str)()).to.equal(str);

		str = '<div class="">A</div>';
		expect(vt(str)()).to.equal('<div>A</div>', 'remove empty class attribute #1');

		str = '<div class>A</div>';
		expect(vt(str)()).to.equal('<div>A</div>', 'remote empty class attribute #2');

		str = '<div class="strong" custom1="custom1Val" custom2>A</div>';
		expect(vt(str)()).to.equal(str);

		str = '<img src="imgSrc1"/>';
		expect(vt(str)()).to.equal(str);

		str = '<img :src="iSrc"/>';
		expect(vt(str)({iSrc: 'imgSrc2'})).to.equal('<img src="imgSrc2"/>');

		str = '<div><span>A</span>B<span>C</span></div>';
		expect(vt(str)().replace(/\s*B\s*/, 'B')).to.equal(str);

		expect(vt('<div>A<br/>B</div>')()).to.equal('<div>A <br/> B</div>');
	});

	it('should render the meta "class" attribute', ()=> {
		expect(vt('<a class="simple">1</a>')({})).to.equal('<a class="simple">1</a>');
		expect(vt('<a class="simple1 simple2">1</a>')({})).to.equal('<a class="simple1 simple2">1</a>');
		expect(vt('<a :class="\'simple2\'">1</a>')({})).to.equal('<a class="simple2">1</a>');
		expect(vt('<a :class="lookup">1</a>')({lookup: 'Lookup!'})).to.equal('<a class="Lookup!">1</a>');
		expect(vt('<a :class="aLookup">1</a>')({aLookup: ['a1', 'a2', 'a3']})).to.equal('<a class="a1 a2 a3">1</a>');
		expect(vt('<a :class="[a, b, c]">1</a>')({a: 'a1', b: 'b1', c: 'c1'})).to.equal('<a class="a1 b1 c1">1</a>');
		expect(vt('<a :class="tern ? \'a1\' : \'b1\'">1</a>')({tern: true})).to.equal('<a class="a1">1</a>');
		expect(vt('<a :class="tern ? \'a1\' : \'b1\'">1</a>')({tern: false})).to.equal('<a class="b1">1</a>');
		expect(vt('<a :class="[\'a1\', b, c ? \'c1\' : \'c2\']">1</a>')({b: 'b1', c: true})).to.equal('<a class="a1 b1 c1">1</a>');
		expect(vt('<a :class="{a1: true, b1: false, c1: true || false}">1</a>')({})).to.equal('<a class="a1 c1">1</a>');
	});

	it('should render simple mustaches ({{val}})', ()=> {
		expect(vt('<div>Hello {{v}}</div>')({v: 'Foo'})).to.equal('<div>Hello Foo</div>');
		expect(vt('<div><span>{{a}}</span>{{b}}<span>{{c}}</span></div>')({a: 'Foo', b: 'Bar', c: 'Baz'})).to.equal('<div><span>Foo</span> Bar <span>Baz</span></div>');
	});

	it('should support conditionals (v-if, v-else-if, v-else)', ()=> {
		expect(vt('<div>=<span v-if="a">Y</span></div>')({a: true})).to.equal('<div>= <span>Y</span></div>');
		expect(vt('<div>=<span v-if="a">Y</span><span v-else>N</span></div>')({a: true})).to.equal('<div>= <span>Y</span></div>');
		expect(vt('<div>=<span v-if="a">Y</span><span v-else>N</span></div>')({a: false})).to.equal('<div>= <span>N</span></div>');
		expect(vt('<div>=<span v-if="a == 1">1</span><span v-else-if="a == 2">2</span><span v-else>3</span></div>')({a: 1})).to.equal('<div>= <span>1</span></div>');
		expect(vt('<div>=<span v-if="a == 1">1</span><span v-else-if="a == 2">2</span><span v-else>3</span></div>')({a: 2})).to.equal('<div>= <span>2</span></div>');
		expect(vt('<div>=<span v-if="a == 1">1</span><span v-else-if="a == 2">2</span><span v-else>3</span></div>')({a: 3})).to.equal('<div>= <span>3</span></div>');
		expect(vt('<div><span v-if="a == 7">Y</span></div>')({a: 3})).to.not.equal('<div><span>Y</span></div>');
	});

	it('should support iteration (v-for)', ()=> {
		expect(vt('<ol><li v-for="i in l">{{i}}</li></ol>')({l: [1, 2, 3]})).to.equal('<ol><li>1</li> <li>2</li> <li>3</li></ol>');
		expect(vt('<ol><li v-for="i in l">{{i}}</li><li>foo</li></ol>')({l: [1, 2, 3]})).to.equal('<ol><li>1</li> <li>2</li> <li>3</li> <li>foo</li></ol>');
	});

	it('should render a complex example', ()=> {
		expect(vt(
			'<body>'
				+ 'Hello {{user.name.first}} {{user.name.last}}<br/>'
				+ 'Your favourite color<span v-if="user.color.toLowerCase() == \'blue\'">is blue</span><span v-else>is<strong>NOT</strong>blue</span><br/>'
				+ 'Your pets are:<ol class="list-unordered pets"><li v-for="pet in user.pets">{{pet.name}} ({{pet.type}})</li></ol>'
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
		})).to.equal(
			'<body>'
				+ 'Hello Joe Random <br/> '
				+ 'Your favourite color <span>is <strong>NOT</strong> blue</span> <br/> '
				+ 'Your pets are: <ol class="list-unordered pets"><li>Pepper (Cat)</li> <li>Meg (Dog)</li></ol>'
			+ '</body>'
		);
	});

	it('should handle <style/> tags', ()=> {
		expect(vt(''
			+ '<html>'
				+ '<head>'
					+ '<style>'
						+ '.person {color: blue}'
					+ '</style>'
				+ '</head>'
				+ '<body>'
					+ 'Hello <span class="person">{{user.name.first}} {{user.name.last}}</span>'
				+ '</body>'
			+ '</html>'
		)({
			user: {
				name: {first: 'Joe', middle: 'H', last: 'Random'},
			},
		})).to.match(/<style>.*<span class="person">Joe Random<\/span>/)
	});


	it('should handle functions', ()=> {
		expect(vt('<p>Hello {{caps(name)}}</p>')({
			name: 'Matt',
			caps: str => str.toUpperCase(),
		})).to.equal('<p>Hello MATT</p>');
	});

	it('should async handle functions', ()=>
		vt.async('<p>Hello {{decaps(name)}}</p>')({
			name: 'Matt',
			decaps: str => new Promise(resolve => setTimeout(()=> resolve(str.toLowerCase()), 100)),
		})
			.then(res => expect(res).to.equal('<p>Hello matt</p>'))
	);

	it('should handle async promise chains', ()=>
		vt.async('<p>Hello {{caps(name)}}</p>')({
			name: 'Matt',
			caps: str => new Promise(resolve =>
				setTimeout(()=>
					new Promise(resolve2 =>
						setTimeout(()=> resolve2(str.toLowerCase()), 100)
					).then(resolve)
				, 100)
			),
		})
			.then(res => expect(res).to.equal('<p>Hello matt</p>'))
	);

});
