import { NodeConnectionTypes, type INodeType, type INodeTypeDescription } from 'n8n-workflow';
import { familyDescription } from './resources/family';
import { houseDescription } from './resources/house';
import { journalDescription } from './resources/journal';
import { materialDescription } from './resources/material';
import { occasionDescription } from './resources/occasion';
import { perfumeDescription } from './resources/perfume';
import { searchDescription } from './resources/search';
import { termDescription } from './resources/term';
import { wardrobeDescription } from './resources/wardrobe';

export class ScentoPerfume implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Scento Perfume',
		name: 'scentoPerfume',
		icon: { light: 'file:../../icons/scento.svg', dark: 'file:../../icons/scento.dark.svg' },
		group: ['input'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description:
			'Perfume notes, similar perfumes, raw materials, houses and scent families from the free Scento Perfume API',
		defaults: {
			name: 'Scento Perfume',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		requestDefaults: {
			baseURL: 'https://www.scento.com/api/perfume/v1',
			headers: {
				Accept: 'application/json',
			},
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Family', value: 'family' },
					{ name: 'House', value: 'house' },
					{ name: 'Journal', value: 'journal' },
					{ name: 'Material', value: 'material' },
					{ name: 'Occasion', value: 'occasion' },
					{ name: 'Perfume', value: 'perfume' },
					{ name: 'Search', value: 'search' },
					{ name: 'Term', value: 'term' },
					{ name: 'Wardrobe', value: 'wardrobe' },
				],
				default: 'perfume',
			},
			...perfumeDescription,
			...materialDescription,
			...houseDescription,
			...familyDescription,
			...occasionDescription,
			...wardrobeDescription,
			...termDescription,
			...journalDescription,
			...searchDescription,
		],
	};
}
