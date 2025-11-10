import Dexie, { type Table } from 'dexie';
import { browser } from '$app/environment';
import type { GastoExtra, Salida, VendedorAsignado } from './types';

class CarterasDB extends Dexie {
	salidas!: Table<Salida, string>;
	vendedores!: Table<VendedorAsignado, string>;
	gastos!: Table<GastoExtra, string>;

	constructor() {
		super('appcarteras-db');
		this.version(1).stores({
			salidas: 'id, fechaISO',
			vendedores: 'id, salidaId, nombre',
			gastos: 'id, vendedorId'
		});
	}
}

let dbInstance: CarterasDB | null = null;

export const getDB = () => {
	const safeWindow = browser ? window : undefined;
	if (!safeWindow) {
		throw new Error('La base de datos local solo está disponible en el navegador.');
	}

	if (!dbInstance) {
		dbInstance = new CarterasDB();
	}

	return dbInstance;
};
