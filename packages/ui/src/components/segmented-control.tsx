import * as ToggleGroupPrimitive from '@radix-ui/react-toggle-group';
import * as React from 'react';

import { cn } from '#lib/utils';

function SegmentedControl({
	className,
	children,
	...props
}: Omit<ToggleGroupPrimitive.ToggleGroupSingleProps, 'type'> &
	React.RefAttributes<HTMLDivElement>) {
	const [internalValue, setInternalValue] = React.useState(props.defaultValue);

	const isControlled = props.value !== undefined;
	const currentValue = isControlled ? props.value : internalValue;

	const handleValueChange = (newValue: string) => {
		if (newValue) {
			if (!isControlled) setInternalValue(newValue);
			if (props.onValueChange) props.onValueChange(newValue);
		}
	};

	return (
		<ToggleGroupPrimitive.Root
			data-slot="segmented-control"
			{...props}
			type="single"
			asChild={false}
			className={cn(
				'border-input relative isolate inline-grid h-9 min-w-[max-content] auto-cols-fr grid-flow-col items-stretch rounded-md border text-center align-top shadow-xs',
				'disabled:opacity-50',
				className,
			)}
			value={currentValue}
			onValueChange={handleValueChange}
		>
			{children}

			{/* Indicator */}
			<span
				data-slot="segmented-control-indicator"
				className={cn(
					'pointer-events-none absolute top-0 left-0 -z-10 hidden h-full transition-transform duration-150 ease-out',
					'before:bg-input before:absolute before:inset-[3px] before:h-[calc(100%-6px)] before:w-[calc(100%-6px)] before:rounded-sm',
					'[:where([data-slot=segmented-control-item][data-state=on])_~_&]:block',
					// Positioning
					'in-nth-1:w-[calc(100%/1)] [:where([data-slot=segmented-control-item][data-state=on]:nth-child(1))_~_&]:translate-x-[0%]',
					'in-nth-2:w-[calc(100%/2)] [:where([data-slot=segmented-control-item][data-state=on]:nth-child(2))_~_&]:translate-x-[100%]',
					'in-nth-3:w-[calc(100%/3)] [:where([data-slot=segmented-control-item][data-state=on]:nth-child(3))_~_&]:translate-x-[200%]',
					'in-nth-4:w-[calc(100%/4)] [:where([data-slot=segmented-control-item][data-state=on]:nth-child(4))_~_&]:translate-x-[300%]',
					'in-nth-5:w-[calc(100%/5)] [:where([data-slot=segmented-control-item][data-state=on]:nth-child(5))_~_&]:translate-x-[400%]',
					'in-nth-5:w-[calc(100%/6)] [:where([data-slot=segmented-control-item][data-state=on]:nth-child(6))_~_&]:translate-x-[500%]',
					'in-nth-5:w-[calc(100%/7)] [:where([data-slot=segmented-control-item][data-state=on]:nth-child(7))_~_&]:translate-x-[600%]',
					'in-nth-5:w-[calc(100%/8)] [:where([data-slot=segmented-control-item][data-state=on]:nth-child(8))_~_&]:translate-x-[700%]',
				)}
			/>
		</ToggleGroupPrimitive.Root>
	);
}

function SegmentedControlItem({
	className,
	children,
	...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Item>) {
	return (
		<ToggleGroupPrimitive.Item
			data-slot="segmented-control-item"
			{...props}
			className={cn(
				'group',
				'relative flex cursor-pointer items-stretch outline-none select-none',
				'disabled:opacity-50',
				className,
			)}
		>
			{/* Separator */}
			<span
				data-slot="segmented-control-separator"
				className={cn(
					'bg-input -z-10 -mx-[0.5px] my-1 w-px transition-opacity duration-75 ease-out',
					'group-first:opacity-0 group-focus-visible:duration-[0ms]',
					// Needs fast to appear and slow to disappear, so ease-in here
					'group-[[data-state=on]]:opacity-0 group-[[data-state=on]]:ease-in',
					'group-[[data-state=on]_+_*]:opacity-0 group-[[data-state=on]_+_*]:ease-in',
				)}
			/>

			{/* Label */}
			<span
				data-slot="segmented-control-label"
				className={cn(
					'border-box relative z-10 m-[3px] flex grow items-center justify-center rounded-sm transition-all',
					'group-hover:bg-input/30',
					// Focus ring
					'group-focus-visible:outline-ring group-focus-visible:ring-ring/50 group-focus-visible:ring-[4px] group-focus-visible:ring-offset-[3px] group-focus-visible:outline group-focus-visible:outline-offset-[3px]',
					// Do not shrink icons
					'[&_svg]:shrink-0',
				)}
			>
				<span
					data-slot="segmented-control-label-inactive"
					className={cn(
						'text-muted-foreground absolute font-normal transition-opacity duration-75',
						'group-[[data-state=on]]:opacity-0',
					)}
				>
					{children}
				</span>
				<span
					data-slot="segmented-control-label-active"
					className={cn(
						'text-foreground absolute font-medium -tracking-[0.01em] transition-opacity duration-75',
						'group-[[data-state=off]]:opacity-0',
					)}
				>
					{children}
				</span>
			</span>
		</ToggleGroupPrimitive.Item>
	);
}

export { SegmentedControl, SegmentedControlItem };
