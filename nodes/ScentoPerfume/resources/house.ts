import type { INodeProperties } from 'n8n-workflow';
import { optionsCollection, pathSegment } from '../shared/descriptions';

export const houseDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['house'] } },
		options: [
			{
				name: 'Get',
				value: 'get',
				action: 'Get a perfume house',
				description: 'Profile a perfume house: its style, signature notes and perfumes',
				routing: {
					request: { method: 'GET', url: `=/houses/${pathSegment('house')}` },
				},
			},
		],
		default: 'get',
	},
	{
		displayName: 'House',
		name: 'house',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'e.g. tom-ford',
		description: 'Perfume house slug or name',
		displayOptions: { show: { resource: ['house'], operation: ['get'] } },
	},
	optionsCollection('house', 'get'),
];
