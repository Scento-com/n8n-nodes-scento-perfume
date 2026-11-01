import type { INodeProperties } from 'n8n-workflow';
import {
	CSV_VALUE,
	continuationOption,
	optionsCollection,
	pathSegment,
	returnAllParameter,
	showFor,
} from '../shared/descriptions';

export const materialDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['material'] } },
		options: [
			{
				name: 'Find Perfumes',
				value: 'findPerfumes',
				action: 'Find perfumes by note',
				description: 'Find perfumes that contain all of one to four notes or materials',
				routing: { request: { method: 'GET', url: '/materials/match' } },
			},
			{
				name: 'Get',
				value: 'get',
				action: 'Get a material',
				description: 'Explain a note or raw material: what it smells like and where it is used',
				routing: {
					request: { method: 'GET', url: `=/materials/${pathSegment('material')}` },
				},
			},
		],
		default: 'get',
	},
	{
		displayName: 'Material',
		name: 'material',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'e.g. oud',
		description: 'A note or raw material, for example oud, bergamot or iris',
		displayOptions: { show: showFor('material', 'get') },
	},
	optionsCollection('material', 'get'),
	{
		displayName: 'Materials',
		name: 'materials',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'e.g. oud, rose',
		description: 'One to four notes or materials, comma-separated, that must all be present',
		displayOptions: { show: showFor('material', 'findPerfumes') },
		routing: { send: { type: 'query', property: 'materials', value: CSV_VALUE } },
	},
	returnAllParameter('material', 'findPerfumes'),
	optionsCollection('material', 'findPerfumes', [
		continuationOption,
		{
			displayName: 'Family',
			name: 'family',
			type: 'string',
			default: '',
			description: 'Scento family to stay within',
			routing: { send: { type: 'query', property: 'family' } },
		},
		{
			displayName: 'Pyramid Tier',
			name: 'tier',
			type: 'options',
			options: [
				{ name: 'Any', value: 'any' },
				{ name: 'Base', value: 'base' },
				{ name: 'Heart', value: 'heart' },
				{ name: 'Top', value: 'top' },
			],
			default: 'any',
			description: 'Where in the pyramid the materials must sit',
			routing: { send: { type: 'query', property: 'tier' } },
		},
	]),
];
