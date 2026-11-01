import type {
	DeclarativeRestApiSettings,
	IDataObject,
	IExecutePaginationFunctions,
	INodeExecutionData,
	INodeProperties,
	INodePropertyOptions,
} from 'n8n-workflow';

export const LANGUAGES: INodePropertyOptions[] = [
	{ name: 'Czech', value: 'cs' },
	{ name: 'English', value: 'en' },
	{ name: 'French', value: 'fr' },
	{ name: 'German', value: 'de' },
	{ name: 'Greek', value: 'el' },
	{ name: 'Hungarian', value: 'hu' },
	{ name: 'Italian', value: 'it' },
	{ name: 'Polish', value: 'pl' },
	{ name: 'Romanian', value: 'ro' },
	{ name: 'Spanish', value: 'es' },
];

// The API takes lists as one comma-separated value; spaces around the commas are tidied here.
export const CSV_VALUE = '={{ String($value).split(",").map((s) => s.trim()).filter(Boolean).join(",") }}';

// Encodes a path segment typed by the user (a perfume name may contain spaces or ampersands).
export const pathSegment = (parameter: string) =>
	`{{ encodeURIComponent(String($parameter["${parameter}"]).trim()) }}`;

export const showFor = (resource: string, operation: string) => ({
	resource: [resource],
	operation: [operation],
});

export const languageOption: INodeProperties = {
	displayName: 'Language',
	name: 'lang',
	type: 'options',
	options: LANGUAGES,
	default: 'en',
	description:
		'Language of the scento.com links and labels in the answer. The answer text itself stays in English.',
	routing: { send: { type: 'query', property: 'lang' } },
};

export const continuationOption: INodeProperties = {
	displayName: 'Continuation',
	name: 'continuation',
	type: 'string',
	default: '',
	description:
		'Value from the previous answer, to fetch the next part of a list. Leave empty to start at the beginning, or use Return All instead.',
	routing: { send: { type: 'query', property: 'continuation' } },
};

// A list answer carries an opaque `continuation` value, which is null on the last part.
// Return All follows it, one item per part, and stops after 100 parts as a safety limit.
const MAX_PARTS = 100;

export async function followContinuation(
	this: IExecutePaginationFunctions,
	requestOptions: DeclarativeRestApiSettings.ResultOptions,
): Promise<INodeExecutionData[]> {
	const parts: INodeExecutionData[] = [];
	const qs = { ...(requestOptions.options.qs as IDataObject) };
	let continuation: string | undefined;
	for (let i = 0; i < MAX_PARTS; i++) {
		if (continuation) qs.continuation = continuation;
		requestOptions.options.qs = { ...qs };
		const part = await this.makeRoutingRequest(requestOptions);
		parts.push(...part);
		const next = part[part.length - 1]?.json?.continuation;
		if (typeof next !== 'string' || next === '') break;
		continuation = next;
	}
	return parts;
}

export function returnAllParameter(resource: string, operation: string): INodeProperties {
	return {
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		description: 'Whether to return all results or only up to a given limit',
		displayOptions: { show: showFor(resource, operation) },
		routing: {
			send: { paginate: '={{ $value }}' },
			operations: { pagination: followContinuation },
		},
	};
}

export function optionsCollection(
	resource: string,
	operation: string,
	extra: INodeProperties[] = [],
): INodeProperties {
	return {
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: { show: showFor(resource, operation) },
		options: [...extra, languageOption].sort((a, b) => a.displayName.localeCompare(b.displayName)),
	};
}
