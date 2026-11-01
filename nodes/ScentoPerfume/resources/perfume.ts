import type { INodeProperties } from 'n8n-workflow';
import {
	CSV_VALUE,
	continuationOption,
	optionsCollection,
	pathSegment,
	returnAllParameter,
	showFor,
} from '../shared/descriptions';

export const perfumeDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['perfume'] } },
		options: [
			{
				name: 'Compare',
				value: 'compare',
				action: 'Compare perfumes side by side',
				description: 'Compare two to four perfumes side by side',
				routing: { request: { method: 'GET', url: '/contrast' } },
			},
			{
				name: 'Get',
				value: 'get',
				action: 'Get a perfume portrait',
				description: 'Get the note pyramid, family, character and wear times of a perfume',
				routing: {
					request: { method: 'GET', url: `=/perfumes/${pathSegment('perfume')}` },
				},
			},
			{
				name: 'Get Similar',
				value: 'getSimilar',
				action: 'Find similar perfumes',
				description: 'Find perfumes that smell close to a given perfume',
				routing: {
					request: {
						method: 'GET',
						url: `=/perfumes/${pathSegment('perfume')}/neighbours`,
					},
				},
			},
			{
				name: 'Search',
				value: 'search',
				action: 'Search perfumes',
				description: 'Search perfumes, houses and notes by name',
				routing: { request: { method: 'GET', url: '/perfumes' } },
			},
		],
		default: 'get',
	},

	// Get and Get Similar
	{
		displayName: 'Perfume',
		name: 'perfume',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'e.g. tom-ford-oud-wood',
		description: 'Perfume slug or name, for example oud-wood or tom-ford-oud-wood',
		displayOptions: {
			show: { resource: ['perfume'], operation: ['get', 'getSimilar'] },
		},
	},
	optionsCollection('perfume', 'get'),
	returnAllParameter('perfume', 'getSimilar'),
	optionsCollection('perfume', 'getSimilar', [
		continuationOption,
		{
			displayName: 'Same House Only',
			name: 'same_house',
			type: 'boolean',
			default: false,
			description: 'Whether to only look within the same perfume house',
			routing: { send: { type: 'query', property: 'same_house' } },
		},
	]),

	// Search
	{
		displayName: 'Query',
		name: 'q',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'e.g. oud',
		description: 'Name, house, note or mood word',
		displayOptions: { show: showFor('perfume', 'search') },
		routing: { send: { type: 'query', property: 'q' } },
	},
	returnAllParameter('perfume', 'search'),
	optionsCollection('perfume', 'search', [continuationOption]),

	// Compare
	{
		displayName: 'Perfumes',
		name: 'perfumes',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'e.g. tom-ford-oud-wood, dior-sauvage',
		description: 'Two to four perfume slugs or names, comma-separated',
		displayOptions: { show: showFor('perfume', 'compare') },
		routing: { send: { type: 'query', property: 'perfumes', value: CSV_VALUE } },
	},
	optionsCollection('perfume', 'compare'),
];
