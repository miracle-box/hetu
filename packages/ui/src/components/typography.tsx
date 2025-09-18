import { cn } from '#lib/utils';

export function H1({ children, className }: React.ComponentProps<'h1'>) {
	return (
		<h1
			className={cn(
				'scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl',
				className,
			)}
		>
			{children}
		</h1>
	);
}

export function H2({ children, className }: React.ComponentProps<'h2'>) {
	return (
		<h2
			className={cn(
				'scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0',
				className,
			)}
		>
			{children}
		</h2>
	);
}

export function H3({ children, className }: React.ComponentProps<'h3'>) {
	return (
		<h3 className={cn('scroll-m-20 text-2xl font-semibold tracking-tight', className)}>
			{children}
		</h3>
	);
}

export function H4({ children, className }: React.ComponentProps<'h4'>) {
	return (
		<h4 className={cn('scroll-m-20 text-xl font-semibold tracking-tight', className)}>
			{children}
		</h4>
	);
}

export function H5({ children, className }: React.ComponentProps<'p'>) {
	return <p className={cn('leading-7 [&:not(:first-child)]:mt-6', className)}>{children}</p>;
}

export function Blockquote({ children, className }: React.ComponentProps<'blockquote'>) {
	return (
		<blockquote className={cn('mt-6 border-l-2 pl-6 italic', className)}>{children}</blockquote>
	);
}

export function InlineCode({ children, className }: React.ComponentProps<'code'>) {
	return (
		<code
			className={cn(
				'bg-muted relative rounded px-[0.3rem] py-[0.2rem] font-mono text-sm',
				className,
			)}
		>
			{children}
		</code>
	);
}

export function Lead({ children, className }: React.ComponentProps<'p'>) {
	return <p className={cn('text-muted-foreground text-xl', className)}>{children}</p>;
}

export function Large({ children, className }: React.ComponentProps<'div'>) {
	return <div className={cn('text-lg font-semibold', className)}>{children}</div>;
}

export function Small({ children, className }: React.ComponentProps<'small'>) {
	return <small className={cn('text-sm leading-none font-medium', className)}>{children}</small>;
}

export function Muted({ children, className }: React.ComponentProps<'p'>) {
	return <p className={cn('text-muted-foreground text-sm', className)}>{children}</p>;
}

export function UnorderedList({ children, className }: React.ComponentProps<'ul'>) {
	return <ul className={cn('my-6 ml-6 list-disc [&>li]:mt-2', className)}>{children}</ul>;
}

export function OrderedList({ children, className }: React.ComponentProps<'ol'>) {
	return <ol className={cn('my-6 ml-6 list-decimal [&>li]:mt-2', className)}>{children}</ol>;
}
