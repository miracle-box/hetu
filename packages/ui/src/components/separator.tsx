'use client';

import * as SeparatorPrimitive from '@radix-ui/react-separator';
import * as React from 'react';

import { cn } from '#lib/utils';

function Separator({
	className,
	orientation = 'horizontal',
	decorative = true,
	...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root>) {
	return (
		<SeparatorPrimitive.Root
			data-slot="separator"
			decorative={decorative}
			orientation={orientation}
			className={cn(
				'bg-border text-muted-foreground shrink-0 text-sm',
				'data-[orientation=horizontal]:my-2 data-[orientation=horizontal]:w-full data-[orientation=horizontal]:text-center data-[orientation=horizontal]:leading-px',
				'[&[data-orientation=horizontal]_>_*]:px-2',
				'data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px',
				className,
			)}
			{...props}
		/>
	);
}

export { Separator };
