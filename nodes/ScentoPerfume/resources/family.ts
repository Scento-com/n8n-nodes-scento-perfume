import type { INodeProperties } from 'n8n-workflow';
import { optionsCollection, pathSegment } from '../shared/descriptions';

export const familyDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['family'] } },
		options: [
			{
				name: 'Get',
				value: 'get',
				action: 'Get a fragrance family',
				description: 'Get one Scento fragrance family: its definition, subfamilies and signature perfumes',
				routing: {
					request: { method: 'GET', url: `=/families/${pathSegment('family')}` },
				},
			},
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many fragrance families',
				description: 'Get many Scento fragrance families: the 14 families, each with its definition and perfume count',
				routing: { request: { method: 'GET', url: '/families' } },
			},
		],
		default: 'getAll',
	},
	{
		displayName: 'Family',
		name: 'family',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'e.g. spice-route',
		description: 'Scento fragrance family slug or name',
		displayOptions: { show: { resource: ['family'], operation: ['get'] } },
	},
	optionsCollection('family', 'get'),
	optionsCollection('family', 'getAll'),
];
