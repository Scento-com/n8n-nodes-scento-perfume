import type { INodeProperties } from 'n8n-workflow';
import { CSV_VALUE, optionsCollection, showFor } from '../shared/descriptions';

export const wardrobeDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['wardrobe'] } },
		options: [
			{
				name: 'Compose',
				value: 'compose',
				action: 'Build a fragrance wardrobe',
				description: 'Build a small fragrance wardrobe from perfumes and notes a person loves',
				routing: { request: { method: 'GET', url: '/wardrobe' } },
			},
		],
		default: 'compose',
	},
	{
		displayName: 'Loves',
		name: 'loves',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'e.g. tom-ford-oud-wood, vanilla',
		description: 'Up to six perfumes or materials the person loves, comma-separated',
		displayOptions: { show: showFor('wardrobe', 'compose') },
		routing: { send: { type: 'query', property: 'loves', value: CSV_VALUE } },
	},
	optionsCollection('wardrobe', 'compose', [
		{
			displayName: 'Avoid',
			name: 'avoid',
			type: 'string',
			default: '',
			placeholder: 'e.g. patchouli, aquatic',
			description: 'Up to six perfumes, materials or families to leave out, comma-separated',
			routing: { send: { type: 'query', property: 'avoid', value: CSV_VALUE } },
		},
		{
			displayName: 'Size',
			name: 'size',
			type: 'number',
			typeOptions: { minValue: 3, maxValue: 5 },
			default: 3,
			description: 'How many perfumes the wardrobe holds',
			routing: { send: { type: 'query', property: 'size' } },
		},
	]),
];
