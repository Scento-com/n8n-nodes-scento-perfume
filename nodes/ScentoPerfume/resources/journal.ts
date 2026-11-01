import type { INodeProperties } from 'n8n-workflow';
import {
	continuationOption,
	optionsCollection,
	returnAllParameter,
	showFor,
} from '../shared/descriptions';

export const journalDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['journal'] } },
		options: [
			{
				name: 'Search',
				value: 'search',
				action: 'Search the journal',
				description: 'Search Scento journal articles on perfumes, notes and houses by topic',
				routing: { request: { method: 'GET', url: '/journal' } },
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
		placeholder: 'e.g. oud',
		description: 'Topic to look for in the journal',
		displayOptions: { show: showFor('journal', 'search') },
		routing: { send: { type: 'query', property: 'q' } },
	},
	returnAllParameter('journal', 'search'),
	optionsCollection('journal', 'search', [continuationOption]),
];
