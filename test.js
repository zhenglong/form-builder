var a = {
	valueOf: function() {
		return 1;
	},
	toString: function() {
		return '1';
	}
};

var b = {};

b[a] = 'aaaaaaaa';

for(prop in b) console.log(prop);
