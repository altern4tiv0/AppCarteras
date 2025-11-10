<script lang="ts">
	import type { VistaSalida } from '$lib';

	export let vista: VistaSalida | null = null;
	export let onExportJson: (() => void) | null = null;
	export let onExportCsv: (() => void) | null = null;
	export let onExportPdf: (() => void) | null = null;
	export let onImprimir: (() => void) | null = null;
	export let resumenRef: HTMLElement | null = null;
</script>

<section class="panel printable">
	<div style="display: flex; justify-content: space-between; gap: 1rem; flex-wrap: wrap;">
		<div>
			<h2>Resumen</h2>
			<p>Cuadra ingresos vs. ventas esperadas y revisa diferencias por vendedor.</p>
		</div>
		{#if vista}
			<div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
				<button class="secondary" type="button" on:click={() => onExportJson?.()}>
					Exportar JSON
				</button>
				<button class="secondary" type="button" on:click={() => onExportCsv?.()}>Exportar CSV</button>
				<button class="secondary" type="button" on:click={() => onExportPdf?.()}>
					Descargar PDF
				</button>
				<button class="primary" type="button" on:click={() => onImprimir?.()}>Imprimir</button>
			</div>
		{/if}
	</div>

	{#if !vista}
		<p style="margin-top: 1rem;">Completa y selecciona una salida para ver resultados.</p>
	{:else}
		{@const usaDistribucion = vista.salida.usaDistribucion}
		<div class="resumen-wrapper" bind:this={resumenRef}>
			<div class="tabla-scroll">
				<table class="tabla-resumen">
					<thead>
						<tr>
							<th>Vendedor</th>
							<th>Asignadas</th>
							<th>Vendidas</th>
							<th>Sobrantes</th>
							<th>Ventas esperadas</th>
							<th>Efectivo</th>
							<th>Yape</th>
							<th>Gastos</th>
							<th>Diferencia</th>
						</tr>
					</thead>
				<tbody>
					{#each vista.vendedores as vendedor}
						<tr>
							<td>{vendedor.nombre}</td>
							<td>{usaDistribucion ? vendedor.stockAsignado : '-'}</td>
							<td>{vendedor.indicadores.carterasVendidas.toFixed(2)}</td>
							<td>
								{usaDistribucion
									? vendedor.indicadores.sobrantesCalculados
									: '-'}
							</td>
							<td>{vendedor.indicadores.ventasEsperadas.toFixed(2)}</td>
							<td>{vendedor.ingresosEfectivo.toFixed(2)}</td>
							<td>{vendedor.ingresosYape.toFixed(2)}</td>
						<td>{vendedor.indicadores.totalGastos.toFixed(2)}</td>
						<td class={vendedor.indicadores.diferencia === 0 ? 'ok' : ''}>
							{vendedor.indicadores.diferencia.toFixed(2)}
						</td>
						</tr>
					{/each}
				</tbody>
			</table>
			</div>

			<div
				style="margin-top: 1.5rem; display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 1rem;"
			>
				<div>
					<p style="margin: 0; color: #94a3b8;">Vendidas</p>
					<strong>{vista.resumen.carterasVendidas.toFixed(2)} unidades</strong>
				</div>
				<div>
					<p style="margin: 0; color: #94a3b8;">Sobrantes de Carteras</p>
					<strong>{vista.resumen.sobrantesReportados.toFixed(2)} uds</strong>
				</div>
				<div>
					<p style="margin: 0; color: #94a3b8;">Ingresos</p>
					<strong>{vista.resumen.totalIngresos.toFixed(2)} S/</strong>
				</div>
				<div>
					<p style="margin: 0; color: #94a3b8;">Gastos</p>
					<strong>{vista.resumen.totalGastos.toFixed(2)} S/</strong>
				</div>
				<div>
					<p style="margin: 0; color: #94a3b8;">Ingresos netos</p>
					<strong style="color: #14803c;">{vista.resumen.ingresosNetos.toFixed(2)} S/</strong>
				</div>
				<div>
					<p style="margin: 0; color: #94a3b8;">Diferencia total</p>
					<strong class={vista.resumen.totalDiferencias === 0 ? 'ok' : 'warn'}>
						{vista.resumen.totalDiferencias.toFixed(2)} S/
					</strong>
				</div>
				<div>
					<p style="margin: 0; color: #94a3b8;">Descuadre inventario</p>
					<strong class={vista.resumen.inventarioPendiente === 0 ? 'ok' : 'warn'}>
						{vista.resumen.inventarioPendiente.toFixed(2)} uds
					</strong>
				</div>
			</div>
		</div>
	{/if}
</section>
