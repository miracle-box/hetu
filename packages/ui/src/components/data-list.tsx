'use client';

import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '#lib/utils';

const DataListOrientationContext = React.createContext<'horizontal' | 'vertical'>('horizontal');

const dataListVariants = cva('overflow-hidden font-normal text-left', {
	variants: {
		orientation: {
			horizontal: 'flex flex-col',
			vertical: 'flex flex-col',
		},
		size: {
			default: 'text-base',
			sm: 'text-sm',
			lg: 'text-lg',
		},
	},
	defaultVariants: {
		orientation: 'horizontal',
		size: 'default',
	},
});

export type DataListProps = React.HTMLAttributes<HTMLDListElement> &
	VariantProps<typeof dataListVariants> & {
		asChild?: boolean;
	};

const DataList = ({
	ref,
	className,
	orientation = 'horizontal',
	size,
	asChild = false,
	...props
}: DataListProps & { ref?: React.RefObject<HTMLDListElement | null> }) => {
	const Comp = asChild ? Slot : 'dl';

	return (
		<DataListOrientationContext value={orientation || 'horizontal'}>
			<Comp
				ref={ref}
				className={cn(dataListVariants({ orientation, size }), className)}
				{...props}
			/>
		</DataListOrientationContext>
	);
};
DataList.displayName = 'DataList';

export type DataListItemProps = React.HTMLAttributes<HTMLDivElement> & {
	className?: string;
};

const DataListItem = ({
	ref,
	className,
	...props
}: DataListItemProps & { ref?: React.RefObject<HTMLDivElement | null> }) => {
	const orientation = React.use(DataListOrientationContext);

	return (
		<div
			ref={ref}
			className={cn(
				className,
				'flex',
				orientation === 'horizontal' ? 'items-center' : 'flex-col',
			)}
			{...props}
		/>
	);
};
DataListItem.displayName = 'DataListItem';

export type DataListLabelProps = React.HTMLAttributes<HTMLDivElement> & {
	className?: string;
};

const DataListLabel = ({
	ref,
	className,
	...props
}: DataListLabelProps & { ref?: React.RefObject<HTMLDivElement | null> }) => (
	<dt ref={ref} className={cn('text-gray-600 dark:text-gray-400', className)} {...props} />
);
DataListLabel.displayName = 'DataListLabel';

export type DataListValueProps = React.HTMLAttributes<HTMLDivElement> & {
	className?: string;
};

const DataListValue = ({
	ref,
	className,
	...props
}: DataListValueProps & { ref?: React.RefObject<HTMLDivElement | null> }) => (
	<dd ref={ref} className={cn('text-black dark:text-white', className)} {...props} />
);
DataListValue.displayName = 'DataListValue';

export { DataList, DataListItem, DataListLabel, DataListValue };
