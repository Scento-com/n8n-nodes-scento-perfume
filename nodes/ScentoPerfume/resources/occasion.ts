import type { INodeProperties } from 'n8n-workflow';
import { optionsCollection, pathSegment } from '../shared/descriptions';

export const occasionDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['occasion'] } },
		options: [
			{
				name: 'Get Edit',
				value: 'get',
				action: 'Get perfumes for an occasion',
				description: 'Get a Scento pick of perfumes for an occasion',
				routing: {
					request: { method: 'GET', url: `=/edits/${pathSegment('occasion')}` },
				},
			},
		],
		default: 'get',
	},
	{
		displayName: 'Occasion',
		name: 'occasion',
		type: 'options',
		required: true,
		default: 'everyday',
		displayOptions: { show: { resource: ['occasion'], operation: ['get'] } },
		options: [
			{ name: 'Cold Weather', value: 'cold-weather' },
			{ name: 'Date Night', value: 'date-night' },
			{ name: 'Everyday', value: 'everyday' },
			{ name: 'First Impressions', value: 'first-impressions' },
			{ name: 'Gym', value: 'gym' },
			{ name: 'Long-Lasting', value: 'long-lasting' },
			{ name: 'Night Out', value: 'night-out' },
			{ name: 'Office', value: 'office' },
			{ name: 'Sport', value: 'sport' },
			{ name: 'Summer Days', value: 'summer-days' },
			{ name: 'Under the Radar', value: 'under-the-radar' },
			{ name: 'Wedding', value: 'wedding' },
			{ name: 'Weekend', value: 'weekend' },
			{ name: 'Workout', value: 'workout' },
		],
	},
	optionsCollection('occasion', 'get', [
		{
			displayName: 'Gender Lean',
			name: 'gender_lean',
			type: 'options',
			options: [
				{ name: 'Feminine', value: 'feminine' },
				{ name: 'Masculine', value: 'masculine' },
				{ name: 'Shared', value: 'shared' },
			],
			default: 'shared',
			description: 'Optional lean, read from the materials by convention. It only reorders.',
			routing: { send: { type: 'query', property: 'gender_lean' } },
		},
	]),
];
