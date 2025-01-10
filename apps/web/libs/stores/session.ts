import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type SessionState = {
	session: {
		id: string;
		token: string;
		userId: string;
		expiresAt: Date;
		metadata: { scope: 'default' };
	} | null;
	setSession: (session: NonNullable<SessionState['session']>) => void;
	clearSession: () => void;
};

export const useSessionStore = create<SessionState>()(
	persist(
		(set) => ({
			session: null,
			setSession: (session: NonNullable<SessionState['session']>) => set(() => ({ session })),
			clearSession: () => set({ session: null }),
		}),
		{
			name: 'session-state',
		},
	),
);
