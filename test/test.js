var expect = require('chai').expect;
var vt = require('../index');

describe('Render simple structures', ()=> {

	it('should render a simple HTML blocks (no special directives)', ()=> {
		var str = '<div>A</div>';
		expect(vt(str)()).to.equal(str);

		str = '<div><span>A</span>B<span>C</span></div>';
		expect(vt(str)().replace(/\s*B\s*/, 'B')).to.equal(str);

		expect(vt('<div>A<br/>B</div>')()).to.equal('<div>A <br/> B</div>');
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
	});

	it('should support iteration (v-for)', ()=> {
		expect(vt('<ol><li v-for="i in l">{{i}}</li></ol>')({l: [1, 2, 3]})).to.equal('<ol><li>1</li> <li>2</li> <li>3</li></ol>');
	});

	it('should render a complex example', ()=> {
		expect(vt(
			'<body>'
				+ 'Hello {{user.name.first}} {{user.name.last}}<br/>'
				+ 'Your favourite color<span v-if="user.color.toLowerCase() == \'blue\'">is blue</span><span v-else>is<strong>NOT</strong>blue</span><br/>'
				+ 'Your pets are:<ol><li v-for="pet in user.pets">{{pet.name}} ({{pet.type}})</li></ol>'
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
				+ 'Your pets are: <ol><li>Pepper (Cat)</li> <li>Meg (Dog)</li></ol>'
			+ '</body>'
		);
	});

});
