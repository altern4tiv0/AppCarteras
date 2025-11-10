import { derived, get, writable } from 'svelte/store';
import { browser } from '$app/environment';
import { nanoid } from 'nanoid';
import { getDB } from '$lib/db';
import {
	construirVistaSalida,
	type GastoExtra,
	type Salida,
	type VendedorAsignado,
	type VistaSalida
} from '$lib';

type NuevaSalidaPayload = {
	fechaISO: string;
	precioUnitario: number;
	totalStock: number;
	notas?: string;
	usaDistribucion: boolean;
};

type VendedorPayload = Pick<VendedorAsignado, 'nombre' | 'stockAsignado'>;

const salidas = writable<Salida[]>([]);
const vendedores = writable<VendedorAsignado[]>([]);
const gastos = writable<GastoExtra[]>([]);
const activeSalidaId = writable<string | null>(null);
const inicializado = writable(false);
const loading = writable(false);

export const salidasStore = salidas;

const sortSalidas = (items: Salida[]) =>
	items
		.slice()
		.sort((a, b) => new Date(b.fechaISO).getTime() - new Date(a.fechaISO).getTime());

const withSalidaDefaults = (salida: Salida): Salida => ({
	...salida,
	usaDistribucion: salida.usaDistribucion ?? true,
	sobrantesGenerales: salida.sobrantesGenerales ?? 0
});

const dbOrThrow = () => {
	if (!browser) {
		throw new Error('La base de datos solo existe en el navegador.');
	}
	return getDB();
};

export const activeSalida = derived([salidas, activeSalidaId], ([$salidas, $id]) => {
	if (!$id) return null;
	return $salidas.find((salida) => salida.id === $id) ?? null;
});

export const vistaSalida = derived(
	[salidas, vendedores, gastos, activeSalidaId],
	([$salidas, $vendedores, $gastos, $salidaId]) => {
		if (!$salidaId) return null;
		const salida = $salidas.find((item) => item.id === $salidaId);
		if (!salida) return null;
		const vendedoresDeSalida = $vendedores.filter((item) => item.salidaId === $salidaId);
		const gastosDeSalida = $gastos.filter((item) =>
			vendedoresDeSalida.some((vend) => vend.id === item.vendedorId)
		);

		return construirVistaSalida(salida, vendedoresDeSalida, gastosDeSalida) as VistaSalida;
	}
);

export const estadoCarga = derived(
	[inicializado, loading],
	([$inicializado, $loading]) => ({
		listo: $inicializado,
		loading: $loading
	})
);

export const initSalidas = async () => {
	if (!browser) return;
	if (get(inicializado)) return;
	const db = dbOrThrow();

	const [salidasData, vendedoresData, gastosData] = await Promise.all([
		db.salidas.toArray(),
		db.vendedores.toArray(),
		db.gastos.toArray()
	]);

	const normalizadas = salidasData.map(withSalidaDefaults);
	salidas.set(sortSalidas(normalizadas));
	vendedores.set(vendedoresData);
	gastos.set(gastosData);

	if (salidasData.length && !get(activeSalidaId)) {
		activeSalidaId.set(sortSalidas(salidasData)[0].id);
	}

	inicializado.set(true);
};

export const crearSalida = async (payload: NuevaSalidaPayload) => {
	const db = dbOrThrow();
	loading.set(true);
	try {
		const now = Date.now();
		const salida: Salida = {
			id: nanoid(),
			...payload,
			notas: payload.notas?.trim() || undefined,
			sobrantesGenerales: 0,
			createdAt: now,
			updatedAt: now
		};

		await db.salidas.add(salida);
		salidas.update((items) => sortSalidas([salida, ...items]));
		activeSalidaId.set(salida.id);
		return salida;
	} finally {
		loading.set(false);
	}
};

export const actualizarSalida = async (salidaId: string, cambios: Partial<Salida>) => {
	const db = dbOrThrow();
	const trimmed = cambios.notas === undefined ? {} : { notas: cambios.notas?.trim() || undefined };
	const payload = { ...cambios, ...trimmed, updatedAt: Date.now() };

	await db.salidas.update(salidaId, payload);
	salidas.update((items) =>
		sortSalidas(
			items.map((item) => (item.id === salidaId ? withSalidaDefaults({ ...item, ...payload }) : item))
		)
	);
};

export const eliminarSalida = async (salidaId: string) => {
	const db = dbOrThrow();
	let vendedoresIds: string[] = [];
	await db.transaction('rw', db.salidas, db.vendedores, db.gastos, async () => {
		vendedoresIds = (await db.vendedores.where({ salidaId }).primaryKeys()) as string[];
		await db.salidas.delete(salidaId);
		await db.vendedores.where({ salidaId }).delete();
		if (vendedoresIds.length) {
			await db.gastos.where('vendedorId').anyOf(vendedoresIds).delete();
		}
	});

	salidas.update((items) => items.filter((item) => item.id !== salidaId));
	vendedores.update((items) => items.filter((item) => item.salidaId !== salidaId));
	if (vendedoresIds.length) {
		const ids = new Set(vendedoresIds);
		gastos.update((items) => items.filter((item) => !ids.has(item.vendedorId)));
	}

	const current = get(activeSalidaId);
	if (current === salidaId) {
		const restantes = get(salidas);
		activeSalidaId.set(restantes[0]?.id ?? null);
	}
};

export const seleccionarSalida = (salidaId: string) => {
	activeSalidaId.set(salidaId);
};

const assertActiveSalida = () => {
	const salidaId = get(activeSalidaId);
	if (!salidaId) throw new Error('Selecciona o crea una salida primero.');
	return salidaId;
};

export const agregarVendedor = async (payload: VendedorPayload) => {
	const db = dbOrThrow();
	const salidaId = assertActiveSalida();
	const salidaActual = get(activeSalida);
	const now = Date.now();
	const vendedor: VendedorAsignado = {
		id: nanoid(),
		salidaId,
		nombre: payload.nombre.trim(),
		stockAsignado: salidaActual?.usaDistribucion ? Number(payload.stockAsignado) || 0 : 0,
		sobrantes: 0,
		ingresosEfectivo: 0,
		ingresosYape: 0,
		createdAt: now,
		updatedAt: now
	};

	await db.vendedores.add(vendedor);
	vendedores.update((items) => [...items, vendedor]);
	return vendedor;
};

export const actualizarVendedor = async (
	vendedorId: string,
	cambios: Partial<VendedorAsignado>
) => {
	const db = dbOrThrow();
	vendedores.update((items) => {
		return items.map((item) =>
			item.id === vendedorId ? { ...item, ...cambios, updatedAt: Date.now() } : item
		);
	});

	await db.vendedores.update(vendedorId, { ...cambios, updatedAt: Date.now() });
};

export const eliminarVendedor = async (vendedorId: string) => {
	const db = dbOrThrow();
	await db.transaction('rw', db.vendedores, db.gastos, async () => {
		await db.vendedores.delete(vendedorId);
		await db.gastos.where({ vendedorId }).delete();
	});

	vendedores.update((items) => items.filter((item) => item.id !== vendedorId));
	gastos.update((items) => items.filter((item) => item.vendedorId !== vendedorId));
};

export const registrarGasto = async (vendedorId: string, etiqueta: string, monto: number) => {
	const db = dbOrThrow();
	const gasto: GastoExtra = {
		id: nanoid(),
		vendedorId,
		etiqueta: etiqueta.trim() || 'Gasto',
		monto: Number(monto) || 0,
		createdAt: Date.now()
	};

	await db.gastos.add(gasto);
	gastos.update((items) => [...items, gasto]);
	return gasto;
};

export const eliminarGasto = async (gastoId: string) => {
	const db = dbOrThrow();
	await db.gastos.delete(gastoId);
	gastos.update((items) => items.filter((item) => item.id !== gastoId));
};

export const upsertGastos = (list: GastoExtra[]) => {
	gastos.set(list);
};

export const resumenSalidas = derived(salidas, ($salidas) =>
	$salidas.map((salida) => ({
		...salida,
		fechaDisplay: new Date(salida.fechaISO).toLocaleDateString('es-PE', {
			year: 'numeric',
			month: 'short',
			day: '2-digit'
		})
	}))
);
