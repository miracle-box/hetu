import * as React from 'react';
import styles from './styles.module.css';

// [TODO] This is just a temporary solution, and is not correctly styled and tested.
const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
	({ className, type, ...props }, ref) => {
		return (
			<div className={`${styles.root} rt-TextFieldRoot rt-r-size-2 rt-variant-surface`}>
				<input
					className={`${styles.input} rt-reset rt-TextFieldInput`}
					type={type}
					ref={ref}
					{...props}
				/>
			</div>
		);
	},
);
Input.displayName = 'Input';

export { Input };
