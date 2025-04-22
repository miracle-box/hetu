import { DashboardHeader } from '~web/libs/components/DashboardHeader';
import { DashboardNavbar } from '~web/libs/components/DashboardNavbar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
	return (
		<>
			<DashboardHeader />

			<main className="flex-1">
				<DashboardNavbar />
				<div>{children}</div>
			</main>
		</>
	);
}
