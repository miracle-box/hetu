import { DashboardHeader } from '~web/libs/components/DashboardHeader';
import { DashboardNavbar } from '~web/libs/components/DashboardNavbar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="flex min-h-screen flex-col">
			<DashboardHeader />

			<main className="flex-1">
				<DashboardNavbar />
				<div>{children}</div>
			</main>
		</div>
	);
}
