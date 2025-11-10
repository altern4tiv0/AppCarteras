import type {
	GastoExtra,
	IndicadoresVendedor,
	ReporteSalida,
	Salida,
	VendedorAsignado,
	VendedorDetallado
} from './types';

const toFixed2 = (value: number) => Number(value.toFixed(2));

export const calcularIndicadoresVendedor = (
	salida: Salida,
	vendedor: VendedorAsignado,
	gastos: GastoExtra[]
): IndicadoresVendedor => {
	const totalGastos = toFixed2(gastos.reduce((acc, gasto) => acc + gasto.monto, 0));
	const ingresosReportados = toFixed2(vendedor.ingresosEfectivo + vendedor.ingresosYape);
	const precio = salida.precioUnitario || 1;

	const unidadesPorIngresos = precio > 0 ? ingresosReportados / precio : 0;

	let carterasVendidas = unidadesPorIngresos;
	if (salida.usaDistribucion) {
		carterasVendidas = Math.min(unidadesPorIngresos, vendedor.stockAsignado);
	}

	const sobrantesCalculados = salida.usaDistribucion
		? Math.max(vendedor.stockAsignado - carterasVendidas, 0)
		: 0;

	const ventasEsperadas = toFixed2(carterasVendidas * precio);
	const diferencia = toFixed2(ventasEsperadas - ingresosReportados);
	const utilidadNeta = toFixed2(ingresosReportados - totalGastos);

	return {
		carterasVendidas,
		ventasEsperadas,
		totalGastos,
		ingresosReportados,
		sobrantesCalculados,
		diferencia,
		utilidadNeta
	};
};

export const mapearGastosPorVendedor = (
	gastos: GastoExtra[]
): Record<string, GastoExtra[]> => {
	return gastos.reduce<Record<string, GastoExtra[]>>((acc, gasto) => {
		acc[gasto.vendedorId] = acc[gasto.vendedorId] ?? [];
		acc[gasto.vendedorId].push(gasto);
		return acc;
	}, {});
};

export const construirVendedoresDetallados = (
	salida: Salida,
	vendedores: VendedorAsignado[],
	gastos: GastoExtra[]
): VendedorDetallado[] => {
	const gastosPorVendedor = mapearGastosPorVendedor(gastos);

	return vendedores.map((vendedor) => {
		const gastosDelVendedor = gastosPorVendedor[vendedor.id] ?? [];
		const indicadores = calcularIndicadoresVendedor(salida, vendedor, gastosDelVendedor);

		return {
			...vendedor,
			gastos: gastosDelVendedor,
			indicadores
		};
	});
};

export const construirReporteSalida = (
	salida: Salida,
	vendedores: VendedorAsignado[],
	gastos: GastoExtra[]
): ReporteSalida => {
	const vendedoresDetallados = construirVendedoresDetallados(salida, vendedores, gastos);

	const carterasVendidas = vendedoresDetallados.reduce(
		(acc, vendedor) => acc + vendedor.indicadores.carterasVendidas,
		0
	);
	const totalIngresos = vendedoresDetallados.reduce(
		(acc, vendedor) => acc + vendedor.indicadores.ingresosReportados,
		0
	);
	const totalGastos = vendedoresDetallados.reduce(
		(acc, vendedor) => acc + vendedor.indicadores.totalGastos,
		0
	);
	const totalDiferencias = vendedoresDetallados.reduce(
		(acc, vendedor) => acc + vendedor.indicadores.diferencia,
		0
	);
	const totalUtilidad = vendedoresDetallados.reduce(
		(acc, vendedor) => acc + vendedor.indicadores.utilidadNeta,
		0
	);

	const precio = salida.precioUnitario || 1;
	const ingresosEquivalentes = precio > 0 ? totalIngresos / precio : 0;
	const sobrantesReportados = Math.max(salida.totalStock - carterasVendidas, 0);
	const ingresosNetos = toFixed2(totalIngresos - totalGastos);
	const descuadreInventario =
		precio > 0 ? toFixed2(Math.abs(totalDiferencias) / precio) : 0;

	return {
		salidaId: salida.id,
		carterasVendidas,
		totalIngresos: toFixed2(totalIngresos),
		totalGastos: toFixed2(totalGastos),
		ingresosNetos,
		totalDiferencias: toFixed2(totalDiferencias),
		totalUtilidad: toFixed2(totalUtilidad),
		sobrantesReportados,
		inventarioPendiente: descuadreInventario,
		generadoEn: Date.now()
	};
};

export const construirVistaSalida = (
	salida: Salida,
	vendedores: VendedorAsignado[],
	gastos: GastoExtra[]
) => {
	const vendedoresDetallados = construirVendedoresDetallados(salida, vendedores, gastos);
	const resumen = construirReporteSalida(salida, vendedores, gastos);

	return {
		salida,
		vendedores: vendedoresDetallados,
		resumen,
		descuadreInventario: resumen.inventarioPendiente
	};
};
