<script lang="ts">
	import { onMount } from 'svelte';
	import NuevaSalidaForm from '$lib/components/forms/NuevaSalidaForm.svelte';
	import AsignacionPanel from '$lib/components/forms/AsignacionPanel.svelte';
	import CierrePanel from '$lib/components/forms/CierrePanel.svelte';
	import SalidaSettingsModal from '$lib/components/forms/SalidaSettingsModal.svelte';
	import ResumenPanel from '$lib/components/reportes/ResumenPanel.svelte';
	import {
		initSalidas,
		crearSalida,
		seleccionarSalida,
		agregarVendedor,
		actualizarVendedor,
		eliminarVendedor,
		registrarGasto,
		eliminarGasto,
		actualizarSalida,
		eliminarSalida,
		resumenSalidas,
		activeSalida,
		vistaSalida,
		estadoCarga
	} from '$lib/stores/salidas';
		import { exportElementToPdf } from '$lib';
		import type { Salida } from '$lib';
		import { browser } from '$app/environment';

	let resumenRef: HTMLElement | null = null;
	let configModalOpen = false;

	onMount(() => {
		initSalidas();
	});

	const handleCrearSalida = async (
		event: CustomEvent<{
			fechaISO: string;
			precioUnitario: number;
			totalStock: number;
			notas?: string;
			usaDistribucion: boolean;
		}>
	) => {
		await crearSalida(event.detail);
	};

	const handleAddVendedor = async (values: { nombre: string; stockAsignado: number }) => {
		await agregarVendedor(values);
	};

		const handleUpdateVendedor = async (
			id: string,
			cambios: {
				stockAsignado?: number;
				sobrantes?: number;
				ingresosEfectivo?: number;
				ingresosYape?: number;
			}
		) => {
			await actualizarVendedor(id, cambios);
		};

	const handleRemoveVendedor = async (id: string) => {
		await eliminarVendedor(id);
	};

	const handleAddGasto = async (payload: { vendedorId: string; etiqueta: string; monto: number }) => {
		await registrarGasto(payload.vendedorId, payload.etiqueta, payload.monto);
	};

	const handleRemoveGasto = async (gastoId: string) => {
		await eliminarGasto(gastoId);
	};

	const handleUpdateSalida = async (cambios: Partial<Salida>) => {
		if (!$activeSalida) return;
		await actualizarSalida($activeSalida.id, cambios);
	};

	const handleDeleteSalida = async () => {
		if (!$activeSalida) return;
		await eliminarSalida($activeSalida.id);
		configModalOpen = false;
	};

	const handleExportJson = () => {
		if (!$vistaSalida) return;
		const blob = new Blob([JSON.stringify($vistaSalida, null, 2)], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `salida-${$vistaSalida.salida.fechaISO}.json`;
		a.click();
		URL.revokeObjectURL(url);
	};

	const handleExportCsv = () => {
		if (!$vistaSalida) return;
		const header = [
			'Vendedor',
			'Asignadas',
			'Vendidas',
			'Ventas esperadas',
			'Efectivo',
			'Yape',
			'Gastos',
			'Diferencia'
		];

		const usaDistribucion = $vistaSalida.salida.usaDistribucion;

		const rows = $vistaSalida.vendedores.map((vend) => [
			vend.nombre,
			usaDistribucion ? vend.stockAsignado : '-',
			vend.indicadores.carterasVendidas,
			vend.indicadores.ventasEsperadas.toFixed(2),
			vend.ingresosEfectivo.toFixed(2),
			vend.ingresosYape.toFixed(2),
			vend.indicadores.totalGastos.toFixed(2),
			vend.indicadores.diferencia.toFixed(2)
		]);

		const csv = [header, ...rows].map((row) => row.join(';')).join('\n');
		const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `salida-${$vistaSalida.salida.fechaISO}.csv`;
		a.click();
		URL.revokeObjectURL(url);
	};

	const handleExportPdf = async () => {
		if (!resumenRef || !$vistaSalida) return;
		await exportElementToPdf(resumenRef, `salida-${$vistaSalida.salida.fechaISO}.pdf`);
	};

	const handlePrint = () => {
		if (typeof window === 'undefined') return;
		window.print();
	};

	const openConfigModal = () => {
		if (!$activeSalida) return;
		configModalOpen = true;
	};

	const closeConfigModal = () => {
		configModalOpen = false;
	};

	$: if (browser) {
		document.body.classList.toggle('modal-open', configModalOpen);
	}
</script>

<main>
	<header style="display: flex; justify-content: space-between; align-items: center; gap: 1rem; flex-wrap: wrap;">
		<div>
			<h1>App Carteras</h1>
			<p style="margin: 0; color: #475467;">Control diario de stock, ventas y gastos por vendedor.</p>
		</div>
		<div class="tag">
			Precio base: {#if $activeSalida}{ $activeSalida.precioUnitario.toFixed(2) }{:else}10{/if} S/
		</div>
	</header>

	<NuevaSalidaForm on:crear={handleCrearSalida} busy={$estadoCarga.loading} />

		<section class="panel">
			<div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
				<div>
					<h2>Salidas registradas</h2>
					{#if !$resumenSalidas.length}
						<p style="margin: 0;">Aun no tienes registros.</p>
					{/if}
				</div>
				<button class="secondary" type="button" on:click={openConfigModal} disabled={!$activeSalida}>
					Configurar salida
				</button>
			</div>
			{#if $resumenSalidas.length}
				<div class="salidas-grid">
					{#each $resumenSalidas as salidaItem}
						<button
							type="button"
							class={`salida-card ${$activeSalida?.id === salidaItem.id ? 'active' : ''}`}
							on:click={() => seleccionarSalida(salidaItem.id)}
						>
							<strong>{salidaItem.fechaDisplay}</strong>
							<small>{salidaItem.totalStock} carteras · {salidaItem.precioUnitario} S/</small>
						</button>
					{/each}
				</div>
			{/if}
		</section>

	<AsignacionPanel
		salida={$activeSalida}
		vendedores={$vistaSalida?.vendedores ?? []}
		onAdd={handleAddVendedor}
		onUpdate={handleUpdateVendedor}
		onRemove={handleRemoveVendedor}
	/>

	<CierrePanel
		salida={$activeSalida}
		vendedores={$vistaSalida?.vendedores ?? []}
		onUpdate={handleUpdateVendedor}
		onAddGasto={handleAddGasto}
		onRemoveGasto={handleRemoveGasto}
	/>

	<ResumenPanel
		vista={$vistaSalida}
		onExportJson={handleExportJson}
		onExportCsv={handleExportCsv}
		onExportPdf={handleExportPdf}
		onImprimir={handlePrint}
		bind:resumenRef={resumenRef}
	/>
</main>

<SalidaSettingsModal
	open={configModalOpen}
	salida={$activeSalida}
	onUpdate={handleUpdateSalida}
	onDelete={handleDeleteSalida}
	on:close={closeConfigModal}
/>








