// Request mapping of every operation, checked against the Scento Perfume API OpenAPI document.
// Uses the live document (https://www.scento.com/api/perfume/v1/openapi.json) and falls back to
// the snapshot in test/fixtures when offline. SCENTO_LIVE=1 also sends every request to the API.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { ScentoPerfume } = require('../dist/nodes/ScentoPerfume/ScentoPerfume.node.js');

const BASE = 'https://www.scento.com/api/perfume/v1';
const desc = new ScentoPerfume().description;
const props = desc.properties;

async function loadSpec() {
	try {
		const res = await fetch(`${BASE}/openapi.json`, { signal: AbortSignal.timeout(15000) });
		if (res.ok) return { spec: await res.json(), source: 'live' };
	} catch {}
	const snap = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures/openapi.snapshot.json'), 'utf8'));
	return { spec: snap, source: 'snapshot' };
}

// An expression body ("={{ ... }}" or "{{ ... }}" inside a string) evaluated with n8n's variables.
function evalExpr(template, scope) {
	const src = template.startsWith('=') ? template.slice(1) : template;
	return src.replace(/\{\{([\s\S]+?)\}\}/g, (_, body) => {
		const fn = new Function('$parameter', '$value', `return (${body});`);
		return String(fn(scope.$parameter, scope.$value));
	});
}

// Operations: [{ resource, operation, method, url, sends: [{ param, property, value, group }], required: [..] }]
function collectOperations() {
	const ops = [];
	for (const p of props) {
		if (p.name !== 'operation') continue;
		const [resource] = p.displayOptions.show.resource;
		for (const o of p.options) {
			ops.push({ resource, operation: o.value, method: o.routing.request.method, url: o.routing.request.url });
		}
	}
	const shows = (p, op) => {
		const s = p.displayOptions?.show;
		return s && s.resource?.includes(op.resource) && (!s.operation || s.operation.includes(op.operation));
	};
	for (const op of ops) {
		op.sends = [];
		op.required = [];
		for (const p of props) {
			if (p.name === 'operation' || p.name === 'resource' || !shows(p, op)) continue;
			if (p.type === 'collection') {
				for (const c of p.options) op.sends.push({ param: c.name, send: c.routing?.send, type: c.type, options: c.options, group: 'options' });
			} else {
				if (p.required) op.required.push(p.name);
				op.sends.push({ param: p.name, send: p.routing?.send, type: p.type, options: p.options, required: p.required, group: 'top', routing: p.routing });
			}
		}
	}
	return ops;
}
const ops = collectOperations();

function specPathOf(op) {
	// "=/perfumes/{{ encodeURIComponent(String($parameter["perfume"]).trim()) }}/neighbours" -> "/perfumes/{perfume}/neighbours"
	return op.url.replace(/^=/, '').replace(/\{\{[^}]*\$parameter\["(\w+)"\][^}]*\}\}/g, '{$1}');
}

test('node exposes the expected resources and operations', () => {
	const list = ops.map((o) => `${o.resource}.${o.operation}`).sort();
	assert.deepEqual(list, [
		'family.get', 'family.getAll', 'house.get', 'journal.search', 'material.findPerfumes',
		'material.get', 'occasion.get', 'perfume.compare', 'perfume.get', 'perfume.getSimilar',
		'perfume.search', 'search.search', 'term.get', 'wardrobe.compose',
	]);
	assert.equal(desc.credentials, undefined, 'the API needs no key, so no credentials');
});

test('every spec endpoint is covered, and every operation maps to a spec endpoint', async () => {
	const { spec, source } = await loadSpec();
	console.log(`openapi source: ${source}, ${Object.keys(spec.paths).length} paths`);
	assert.deepEqual(spec.security ?? [], [], 'spec declares no security: no key needed');
	assert.equal(desc.requestDefaults.baseURL, spec.servers[0].url);
	const specPaths = Object.keys(spec.paths).sort();
	const nodePaths = [...new Set(ops.map(specPathOf))].sort();
	assert.deepEqual(nodePaths, specPaths);
	for (const op of ops) {
		assert.equal(op.method, 'GET');
		assert.ok(spec.paths[specPathOf(op)].get, `${op.resource}.${op.operation}`);
	}
});

test('query parameters, required flags and enums match the spec', async () => {
	const { spec } = await loadSpec();
	for (const op of ops) {
		const specOp = spec.paths[specPathOf(op)].get;
		const label = `${op.resource}.${op.operation}`;
		const specQuery = specOp.parameters.filter((p) => p.in === 'query');
		const sentQuery = op.sends.filter((s) => s.send?.property && s.send.type === 'query');
		const paginated = op.sends.find((s) => s.param === 'returnAll');
		const names = new Set(sentQuery.map((s) => s.send.property));
		if (paginated) names.add('continuation'); // follow-up pages set it through pagination
		for (const q of specQuery) {
			assert.ok(names.has(q.name), `${label}: spec query "${q.name}" is not sent`);
			if (q.required) {
				const s = sentQuery.find((x) => x.send.property === q.name);
				assert.ok(s.required, `${label}: "${q.name}" must be a required field`);
			}
			if (q.schema.enum) {
				const s = sentQuery.find((x) => x.send.property === q.name);
				assert.deepEqual(s.options.map((o) => o.value).sort(), [...q.schema.enum].sort(), `${label}: ${q.name} enum`);
			}
			if (q.schema.default !== undefined && q.name !== 'lang' && q.schema.enum) {
				// defaults in the spec are the server's behaviour; the node must offer the same value
				assert.ok(sentQuery.find((x) => x.send.property === q.name).options.some((o) => o.value === q.schema.default));
			}
		}
		for (const n of names) assert.ok(specQuery.some((q) => q.name === n), `${label}: sends unknown query "${n}"`);
		for (const p of specOp.parameters.filter((x) => x.in === 'path')) {
			assert.ok(specPathOf(op).includes(`{${p.name}}`), `${label}: path param ${p.name}`);
			assert.ok(op.required.includes(p.name), `${label}: path param ${p.name} must be required`);
		}
	}
	const langSpec = spec.paths['/perfumes/{perfume}'].get.parameters.find((p) => p.name === 'lang');
	const langNode = props.find((p) => p.name === 'options' && p.displayOptions.show.resource[0] === 'perfume').options.find((o) => o.name === 'lang');
	assert.deepEqual(langNode.options.map((o) => o.value).sort(), [...langSpec.schema.enum].sort());
});

test('url templates build the right path, with encoding', () => {
	const get = ops.find((o) => o.resource === 'perfume' && o.operation === 'get');
	assert.equal(evalExpr(get.url, { $parameter: { perfume: ' tom-ford-oud-wood ' } }), '/perfumes/tom-ford-oud-wood');
	assert.equal(evalExpr(get.url, { $parameter: { perfume: 'Black Orchid & Co/1' } }), '/perfumes/Black%20Orchid%20%26%20Co%2F1');
	const sim = ops.find((o) => o.operation === 'getSimilar');
	assert.equal(evalExpr(sim.url, { $parameter: { perfume: 'oud-wood' } }), '/perfumes/oud-wood/neighbours');
});

test('comma-separated lists are tidied before they are sent', () => {
	const compare = ops.find((o) => o.operation === 'compare');
	const send = compare.sends.find((s) => s.param === 'perfumes').send;
	assert.equal(send.property, 'perfumes');
	assert.equal(evalExpr(send.value, { $value: ' oud-wood ,  dior-sauvage,, ' }), 'oud-wood,dior-sauvage');
});

test('Return All follows the continuation value and keeps the original query', async () => {
	for (const key of ['perfume.getSimilar', 'perfume.search', 'material.findPerfumes', 'journal.search', 'search.search']) {
		const [resource, operation] = key.split('.');
		const p = props.find((x) => x.name === 'returnAll' && x.displayOptions.show.resource[0] === resource && x.displayOptions.show.operation[0] === operation);
		assert.ok(p, key);
		assert.equal(p.routing.send.paginate, '={{ $value }}');
		const paginate = p.routing.operations.pagination;
		const seen = [];
		let part = 0;
		const ctx = {
			async makeRoutingRequest(opts) {
				seen.push({ ...opts.options.qs });
				part += 1;
				return [{ json: { folio: 'x', continuation: part < 3 ? `c${part}` : null } }];
			},
		};
		const out = await paginate.call(ctx, { options: { qs: { q: 'oud' } } });
		assert.equal(out.length, 3, `${key}: three parts`);
		assert.deepEqual(seen, [{ q: 'oud' }, { q: 'oud', continuation: 'c1' }, { q: 'oud', continuation: 'c2' }]);
	}
	// never loops forever
	let calls = 0;
	const endless = { async makeRoutingRequest() { calls += 1; return [{ json: { continuation: 'again' } }]; } };
	const p = props.find((x) => x.name === 'returnAll');
	await p.routing.operations.pagination.call(endless, { options: { qs: {} } });
	assert.equal(calls, 100);
});

// ---------- live: every operation against the real API ----------
const live = process.env.SCENTO_LIVE ? test : test.skip;
const SAMPLES = {
	'perfume.get': { perfume: 'oud-wood' },
	'perfume.getSimilar': { perfume: 'oud-wood' },
	'perfume.search': { q: 'oud' },
	'perfume.compare': { perfumes: 'oud-wood, tom-ford-black-orchid' },
	'material.get': { material: 'oud' },
	'material.findPerfumes': { materials: 'oud, vanilla' },
	'house.get': { house: 'tom-ford' },
	'family.get': { family: 'spice-route' },
	'family.getAll': {},
	'occasion.get': { occasion: 'date-night' },
	'wardrobe.compose': { loves: 'oud-wood, vanilla' },
	'term.get': { term: 'sillage' },
	'journal.search': { q: 'oud' },
	'search.search': { q: 'oud' },
};
for (const op of ops) {
	live(`live ${op.resource}.${op.operation}`, async () => {
		const params = { ...SAMPLES[`${op.resource}.${op.operation}`] };
		const url = new URL(BASE + evalExpr(op.url, { $parameter: params }));
		for (const s of op.sends) {
			if (s.group !== 'top' || !s.send || s.send.type !== 'query' || params[s.param] === undefined) continue;
			url.searchParams.set(s.send.property, s.send.value ? evalExpr(s.send.value, { $value: params[s.param] }) : params[s.param]);
		}
		const res = await fetch(url, { headers: { Accept: 'application/json' } });
		const body = await res.json();
		assert.equal(res.status, 200, `${url} -> ${JSON.stringify(body).slice(0, 200)}`);
		assert.ok(body.folio && body.lede && body.detail, `${url} is a folio`);
	});
}
