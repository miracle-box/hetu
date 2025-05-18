import type { drizzleClient } from './drizzle';
import { AsyncLocalStorage } from 'node:async_hooks';

type DrizzleDatabase = typeof drizzleClient;

type DrizzleTransaction<TDb extends DrizzleDatabase = DrizzleDatabase> = Parameters<
	Parameters<TDb['transaction']>[0]
>[0];

type AfterCommitCallback = () => Promise<unknown>;

type TransactionContextState = {
	activeTransaction: DrizzleTransaction;
	committed: boolean;
	afterCommitCallbacks: AfterCommitCallback[];
};

type TransactionFunctionContext = {
	/**
	 * Database client for current transaction
	 */
	transaction: DrizzleTransaction;
	/**
	 * Register an after commit hook for executing side effects
	 * @param callback hook function
	 */
	registerAfterCommit(callback: AfterCommitCallback): void;
};

type TransactionCallback<TResult> = (context: TransactionFunctionContext) => Promise<TResult>;

/**
 * Create helper function for transaction handling using AsyncLocalStorage.
 *
 * Copied from drizzle-orm#543.
 *
 * @see https://github.com/drizzle-team/drizzle-orm/issues/543#issuecomment-1645257280
 * @param database Drizzle ORM client
 * @returns transaction helpers
 */
export function createTransactionHelper(database: DrizzleDatabase) {
	const alsStore = new AsyncLocalStorage<TransactionContextState>();

	/**
	 * Execute queries in transactions. Will reuse parent transactions.
	 *
	 * * Not handling savepoints for simpler logics.
	 *
	 * @param callback Action to execute
	 * @returns the final result
	 */
	async function withTransaction<TResult>(
		callback: TransactionCallback<TResult>,
	): Promise<TResult> {
		const parentContext = alsStore.getStore();

		// Resue parent transaction context when we can
		if (parentContext && !parentContext.committed) {
			return callback({
				transaction: parentContext.activeTransaction,
				registerAfterCommit(cb) {
					parentContext.afterCommitCallbacks.push(cb);
				},
			});
		}

		const hookedCallbacks: AfterCommitCallback[] = [];

		const finalResult = await database.transaction(async (newTx) =>
			alsStore.run(
				{
					activeTransaction: newTx,
					committed: false,
					afterCommitCallbacks: hookedCallbacks,
				},
				async () => {
					return await callback({
						transaction: newTx,
						registerAfterCommit(cb) {
							hookedCallbacks.push(cb);
						},
					});
				},
			),
		);

		// Transaction is commited
		const context = alsStore.getStore();
		if (context) context.committed = true;

		for (const hook of hookedCallbacks) {
			await hook();
		}

		return finalResult;
	}

	/**
	 * Get database client from the context.
	 * @returns the current database client
	 */
	function useDatabase(): DrizzleDatabase | DrizzleTransaction {
		const ctx = alsStore.getStore();
		return ctx && !ctx.committed ? ctx.activeTransaction : database;
	}

	return { withTransaction, useDatabase };
}
