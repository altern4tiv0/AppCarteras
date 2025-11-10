import { describe, expect, it } from 'vitest';
import { calcularIndicadoresVendedor, construirReporteSalida } from './calculations';
import type { GastoExtra, Salida, VendedorAsignado } from './types';

const mockSalida: Salida = {
	id: 'salida-1',
	fechaISO: '2025-01-01',
	precioUnitario: 10,
	totalStock: 300,
	usaDistribucion: true,
	sobrantesGenerales: 0,
	createdAt: Date.now(),
	updatedAt: Date.now()
};

const vendedorBase: VendedorAsignado = {
	id: 'v-1',
	salidaId: mockSalida.id,
	nombre: 'Ana',
	stockAsignado: 100,
	sobrantes: 10,
	ingresosEfectivo: 700,
	ingresosYape: 200,
	createdAt: Date.now(),
	updatedAt: Date.now()
};

const gastosBase: GastoExtra[] = [
	{ id: 'g-1', vendedorId: vendedorBase.id, etiqueta: 'Almuerzo', monto: 12, createdAt: Date.now() },
	{ id: 'g-2', vendedorId: vendedorBase.id, etiqueta: 'Agua', monto: 5, createdAt: Date.now() }
];

describe('calcularIndicadoresVendedor', () => {
	it('calcula ventas, ingresos y diferencia correctamente', () => {
		const indicadores = calcularIndicadoresVendedor(mockSalida, vendedorBase, gastosBase);
		expect(indicadores.carterasVendidas).toBe(90);
		expect(indicadores.ventasEsperadas).toBeCloseTo(900);
		expect(indicadores.totalGastos).toBeCloseTo(17);
		expect(indicadores.ingresosReportados).toBeCloseTo(900);
		expect(indicadores.sobrantesCalculados).toBe(10);
		expect(indicadores.diferencia).toBeCloseTo(0);
		expect(indicadores.utilidadNeta).toBeCloseTo(883);
	});
});

describe('construirReporteSalida', () => {
	it('resume totales de todos los vendedores', () => {
		const vendedorDos: VendedorAsignado = {
			...vendedorBase,
			id: 'v-2',
			nombre: 'Luz',
			ingresosEfectivo: 550,
			ingresosYape: 350
		};
		const gastos: GastoExtra[] = [
			...gastosBase,
			{ id: 'g-3', vendedorId: vendedorDos.id, etiqueta: 'Taxi', monto: 20, createdAt: Date.now() }
		];

		const resumen = construirReporteSalida(mockSalida, [vendedorBase, vendedorDos], gastos);

		expect(resumen.carterasVendidas).toBe(180);
		expect(resumen.totalIngresos).toBeCloseTo(1800);
		expect(resumen.totalGastos).toBeCloseTo(37);
		expect(resumen.ingresosNetos).toBeCloseTo(1763);
		expect(resumen.totalDiferencias).toBeCloseTo(0);
		expect(resumen.sobrantesReportados).toBe(mockSalida.totalStock - 180);
		expect(resumen.inventarioPendiente).toBe(0);
	});
});

describe('modo un solo punto', () => {
	it('usa ventas reportadas y sobrantes generales', () => {
		const salidaSinDistribucion: Salida = {
			...mockSalida,
			id: 'salida-2',
			usaDistribucion: false,
			sobrantesGenerales: 15
		};

		const vendedor: VendedorAsignado = {
			...vendedorBase,
			salidaId: salidaSinDistribucion.id,
			stockAsignado: 0,
			sobrantes: 0,
			ingresosEfectivo: 150,
			ingresosYape: 150
		};
		const gastos: GastoExtra[] = [
			{ id: 'g-3', vendedorId: vendedor.id, etiqueta: 'Almuerzo', monto: 20, createdAt: Date.now() },
			{ id: 'g-4', vendedorId: vendedor.id, etiqueta: 'Movilidad', monto: 10, createdAt: Date.now() }
		];

		const indicadores = calcularIndicadoresVendedor(salidaSinDistribucion, vendedor, gastos);
		expect(indicadores.carterasVendidas).toBe(30);
		expect(indicadores.ventasEsperadas).toBeCloseTo(300);
		expect(indicadores.diferencia).toBeCloseTo(0);
		expect(indicadores.utilidadNeta).toBeCloseTo(270);

		const resumen = construirReporteSalida(salidaSinDistribucion, [vendedor], gastos);
		expect(resumen.carterasVendidas).toBe(30);
		expect(resumen.sobrantesReportados).toBe(270);
		expect(resumen.ingresosNetos).toBeCloseTo(270);
		expect(resumen.inventarioPendiente).toBe(0);
	});
});
