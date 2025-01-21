import { Button, Container, Flex, Grid, Heading, Text } from '@radix-ui/themes';
import { AppNav } from '~web/libs/basicui/AppNav';
import { getUserTextures } from '~web/libs/actions/api';
import { CreateTextureDialog } from './CreateTextureDialog';
import { TextureCard } from '~web/libs/basicui/TextureCard';

export default async function Textures() {
	const textures = await getUserTextures();

	return (
		<Container>
			<Flex gap="3" direction="column">
				<Heading>Textures</Heading>

				<AppNav />

				<CreateTextureDialog>
					<Button>Create texture</Button>
				</CreateTextureDialog>

				{textures && (
					<Grid columns={{ xs: '1', sm: '2', lg: '3' }} gap="3">
						{textures.map((texture) => (
							<TextureCard key={texture.id} texture={texture} />
						))}
					</Grid>
				)}

				{textures && textures.length <= 0 && <Text>No textures</Text>}
			</Flex>
		</Container>
	);
}
