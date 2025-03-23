export function H1({ children }: React.ComponentProps<'h1'>) {
	return (
		<h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
			{children}
		</h1>
	);
}

export function H2({ children }: React.ComponentProps<'h2'>) {
	return (
		<h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
			{children}
		</h2>
	);
}

export function H3({ children }: React.ComponentProps<'h3'>) {
	return <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">{children}</h3>;
}

export function H4({ children }: React.ComponentProps<'h4'>) {
	return <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">{children}</h4>;
}

export function H5({ children }: React.ComponentProps<'p'>) {
	return <p className="leading-7 [&:not(:first-child)]:mt-6">{children}</p>;
}

export function Blockuote({ children }: React.ComponentProps<'blockquote'>) {
	return <blockquote className="mt-6 border-l-2 pl-6 italic">{children}</blockquote>;
}

export function InlineCode({ children }: React.ComponentProps<'code'>) {
	return (
		<code className="bg-muted relative rounded px-[0.3rem] py-[0.2rem] font-mono text-sm">
			{children}
		</code>
	);
}

export function Lead({ children }: React.ComponentProps<'p'>) {
	return <p className="text-muted-foreground text-xl">{children}</p>;
}

export function Large({ children }: React.ComponentProps<'div'>) {
	return <div className="text-lg font-semibold">{children}</div>;
}

export function Small({ children }: React.ComponentProps<'small'>) {
	return <small className="text-sm leading-none font-medium">{children}</small>;
}

export function Muted({ children }: React.ComponentProps<'p'>) {
	return <p className="text-muted-foreground text-sm">{children}</p>;
}

export function UnorderdList({ children }: React.ComponentProps<'ul'>) {
	return <ul className="my-6 ml-6 list-disc [&>li]:mt-2">{children}</ul>;
}

export function OrderdList({ children }: React.ComponentProps<'ol'>) {
	return <ol className="my-6 ml-6 list-decimal [&>li]:mt-2">{children}</ol>;
}
