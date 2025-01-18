import type { PlopTypes } from '@turbo/gen';

export default function generator(plop: PlopTypes.NodePlopAPI): void {
	plop.setGenerator('react-component', {
		description: 'Adds a new react component',
		prompts: [
			{
				type: 'input',
				name: 'name',
				message: 'What is the name of the component?',
			},
		],
		actions: [
			{
				type: 'add',
				path: 'src/{{pascalCase name}}/index.tsx',
				templateFile: 'templates/component.hbs',
			},
			{
				type: 'append',
				path: 'package.json',
				pattern: /"exports": {(?<insertion>)/g,
				template: '    "./{{pascalCase name}}": "./src/{{pascalCase name}}/index.tsx",',
			},
		],
	});
}
