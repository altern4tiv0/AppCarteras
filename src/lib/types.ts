export type MetodoCobro = 'efectivo' | 'yape';

export interface Salida {
	id: string;
	fechaISO: string; // fecha de la salida
	precioUnitario: number;
	totalStock: number;
	usaDistribucion: boolean;
	sobrantesGenerales: number;
	notas?: string;
	createdAt: number;
	updatedAt: number;
}

export interface VendedorAsignado {
	id: string;
	salidaId: string;
	nombre: string;
	stockAsignado: number;
	sobrantes: number;
	ingresosEfectivo: number;
	ingresosYape: number;
	notas?: string;
	createdAt: number;
	updatedAt: number;
}

export interface GastoExtra {
	id: string;
	vendedorId: string;
	etiqueta: string;
	monto: number;
	createdAt: number;
}

export interface IndicadoresVendedor {
	carterasVendidas: number;
	ventasEsperadas: number;
	totalGastos: number;
	ingresosReportados: number;
	sobrantesCalculados: number;
	diferencia: number;
	utilidadNeta: number;
}

export interface ReporteSalida {
	salidaId: string;
	carterasVendidas: number;
	totalIngresos: number;
	totalGastos: number;
	ingresosNetos: number;
	totalDiferencias: number;
	totalUtilidad: number;
	sobrantesReportados: number;
	inventarioPendiente: number;
	generadoEn: number;
}

export interface VendedorDetallado extends VendedorAsignado {
	gastos: GastoExtra[];
	indicadores: IndicadoresVendedor;
}

export interface VistaSalida {
	salida: Salida;
	vendedores: VendedorDetallado[];
	resumen: ReporteSalida;
	descuadreInventario: number;
}

export interface GastoDraft {
	etiqueta: string;
	monto: number | '';
}

export interface VendedorDraft {
	nombre: string;
	stockAsignado: number | '';
}

export const PRECIO_POR_DEFECTO = 10;
