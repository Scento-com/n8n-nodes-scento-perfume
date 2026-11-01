import type { INodeProperties } from 'n8n-workflow';
import {
	continuationOption,
	optionsCollection,
	returnAllParameter,
	showFor,
} from '../shared/descriptions';

export const searchDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['search'] } },
		options: [
			{
				name: 'Search',
				value: 'search',
				action: 'Search the perfume database',
				description: 'Search perfumes, houses and notes in one go',
				routing: { request: { method: 'GET', url: '/search' } },
			},
		],
		default: 'search',
	},
	{
		displayName: 'Query',
		name: 'q',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'e.g. smoky vanilla',
		description: 'Name, house, note or mood word',
		displayOptions: { show: showFor('search', 'search') },
		routing: { send: { type: 'query', property: 'q' } },
	},
	returnAllParameter('search', 'search'),
	optionsCollection('search', 'search', [
		continuationOption,
		{
			displayName: 'Kind',
			name: 'kind',
			type: 'options',
			options: [
				{ name: 'Any', value: 'any' },
				{ name: 'House', value: 'house' },
				{ name: 'Material', value: 'material' },
				{ name: 'Perfume', value: 'perfume' },
			],
			default: 'any',
			description: 'Limit the results to one kind',
			routing: { send: { type: 'query', property: 'kind' } },
		},
	]),
];
