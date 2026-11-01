import type { INodeProperties } from 'n8n-workflow';
import { optionsCollection, pathSegment } from '../shared/descriptions';

export const termDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['term'] } },
		options: [
			{
				name: 'Get',
				value: 'get',
				action: 'Explain a perfumery term',
				description: 'Explain a perfumery term from the Scento lexicon',
				routing: {
					request: { method: 'GET', url: `=/lexicon/${pathSegment('term')}` },
				},
			},
		],
		default: 'get',
	},
	{
		displayName: 'Term',
		name: 'term',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'e.g. sillage',
		description: 'A perfumery term, for example sillage, chypre or edp-vs-edt',
		displayOptions: { show: { resource: ['term'], operation: ['get'] } },
	},
	optionsCollection('term', 'get'),
];
