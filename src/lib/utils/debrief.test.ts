import { strict as assert } from 'assert';
import { debrief } from './debrief';
import { test } from 'vitest';

const obj = {
	arr: Array.from({ length: 10 }, (_, i) => i),
	one: {
		two: {
			three: {
				four: 5,
			},
		},
	},
	sibling: 'test',
};

test('{ depth: 0 }', () => {
	console.log(debrief(obj, { depth: 0 }));

	assert.deepEqual(debrief(obj, { depth: 0 }), {
		arr: '[...10 items]',
		one: '{...1 item}',
		sibling: '...',
	});
});

test('{ depth: 1, siblings: 3 }', () => {
	console.log(debrief(obj, { depth: 1, siblings: 3 }));

	assert.deepEqual(debrief(obj, { depth: 1, siblings: 3 }), {
		arr: [0, 1, 2, '...7 more'],
		one: {
			two: '{...1 item}',
		},
		sibling: 'test',
	});
});

test('{ depth: 2, siblings: 10 }', () => {
	console.log(debrief(obj, { depth: 2, siblings: 10 }));

	assert.deepEqual(debrief(obj, { depth: 2, siblings: 10 }), {
		arr: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
		one: {
			two: {
				three: '{...1 item}',
			},
		},
		sibling: 'test',
	});
});

test('{ depth: 2, siblings: 2 }', () => {
	console.log(debrief(obj, { depth: 2, siblings: 2 }));

	assert.deepEqual(debrief(obj, { depth: 2, siblings: 2 }), {
		arr: [0, 1, '...8 more'],
		one: {
			two: {
				three: '{...1 item}',
			},
		},
		'...': '1 more',
	});
});
