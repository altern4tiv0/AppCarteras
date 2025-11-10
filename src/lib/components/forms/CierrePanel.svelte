<script lang="ts">
import type { Salida, VendedorDetallado } from '$lib';

export let salida: Salida | null = null;
export let vendedores: VendedorDetallado[] = [];

export let onUpdate: (id: string, cambios: Partial<VendedorDetallado>) => Promise<void>;
export let onAddGasto: (args: { vendedorId: string; etiqueta: string; monto: number }) => Promise<void>;
export let onRemoveGasto: (gastoId: string) => Promise<void>;

let gastoDrafts: Record<string, { etiqueta: string; monto: string }> = {};

	const getDraft = (id: string) =>
		(gastoDrafts[id] ??= {
			etiqueta: '',
			monto: ''
		});

	const handleUpdate = async (id: string, campo: keyof VendedorDetallado, valor: number) => {
		await onUpdate(id, { [campo]: valor });
	};

	const handleAgregarGasto = async (vendedorId: string) => {
		const draft = getDraft(vendedorId);
		if (!draft.etiqueta.trim() || !draft.monto) return;
		await onAddGasto({
			vendedorId,
			etiqueta: draft.etiqueta.trim(),
			monto: Number(draft.monto)
		});
		gastoDrafts[vendedorId] = { etiqueta: '', monto: '' };
	};

	$: usaDistribucion = salida?.usaDistribucion ?? true;
</script>

<section class="panel">
	<h2>Cierre y gastos</h2>
	<p>Registra sobrantes, ingresos y consumos para cuadrar cada jornada.</p>

	{#if !salida || vendedores.length === 0}
		<p style="margin-top: 1rem;">Agrega vendedores para habilitar el cierre.</p>
	{:else}
		{#if !usaDistribucion}
			<div class="alerta" style="margin-top: 1rem;">
				Modo un solo punto: las carteras vendidas y sobrantes se calculan automaticamente en base a los ingresos.
			</div>
		{/if}

		<div style="display: flex; flex-direction: column; gap: 1.25rem; margin-top: 1rem;">
			{#each vendedores as vendedor}
				{@const draft = getDraft(vendedor.id)}
				<div style="border: 1px solid #e2e8f0; border-radius: 16px; padding: 1rem;">
					<div
						style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;"
					>
						<div>
							<h3>{vendedor.nombre}</h3>
							<p style="margin: 0; color: #64748b;">
								{#if usaDistribucion}
									Asignadas: {vendedor.stockAsignado}
								{:else}
									Control por ingresos
								{/if}
							</p>
						</div>
						<div class="tag">
							Diferencia: {vendedor.indicadores.diferencia.toFixed(2)} S/
						</div>
					</div>
					<div class="grid-two" style="gap: 1rem; margin-top: 1rem;">
						<label>
							Ingreso efectivo (S/)
							<input
								type="number"
								min="0"
								step="0.1"
								value={vendedor.ingresosEfectivo}
								on:change={(event) =>
									handleUpdate(
										vendedor.id,
										'ingresosEfectivo',
										Number((event.target as HTMLInputElement).value)
									)}
							/>
						</label>
						<label>
							Ingreso Yape (S/)
							<input
								type="number"
								min="0"
								step="0.1"
								value={vendedor.ingresosYape}
								on:change={(event) =>
									handleUpdate(
										vendedor.id,
										'ingresosYape',
										Number((event.target as HTMLInputElement).value)
									)}
							/>
						</label>
					</div>

					<div style="margin-top: 1rem;">
						<strong>Gastos reportados</strong>
						{#if vendedor.gastos.length === 0}
							<p style="margin: 0.25rem 0 0;">Sin gastos.</p>
						{:else}
							<ul
								style="list-style: none; padding: 0; margin: 0.5rem 0 0; display: flex; flex-direction: column; gap: 0.5rem;"
							>
								{#each vendedor.gastos as gasto}
									<li
										style="display: flex; justify-content: space-between; align-items: center; background: #f8fafc; border-radius: 10px; padding: 0.5rem 0.75rem; gap: 0.5rem;"
									>
										<span>{gasto.etiqueta} - {gasto.monto.toFixed(2)} S/</span>
										<button
											type="button"
											class="danger"
											style="padding: 0.25rem 0.75rem;"
											on:click={() => onRemoveGasto(gasto.id)}
										>
											Eliminar
										</button>
									</li>
								{/each}
							</ul>
						{/if}

						<div class="grid-two" style="gap: 0.5rem; margin-top: 0.75rem;">
							<input placeholder="Descripcion" bind:value={draft.etiqueta} />
							<input
								type="number"
								min="0"
								step="0.1"
								placeholder="Monto"
								bind:value={draft.monto}
							/>
						</div>
						<button
							type="button"
							class="secondary"
							style="margin-top: 0.5rem;"
							on:click={() => handleAgregarGasto(vendedor.id)}
						>
							Agregar gasto
						</button>
					</div>

					<div
						style="margin-top: 1rem; display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 0.75rem;"
					>
						<div>
							<p style="margin: 0; color: #94a3b8;">Vendidas estimadas</p>
							<strong>{vendedor.indicadores.carterasVendidas.toFixed(2)} uds</strong>
						</div>
						{#if usaDistribucion}
							<div>
								<p style="margin: 0; color: #94a3b8;">Sobrantes estimados</p>
								<strong>{vendedor.indicadores.sobrantesCalculados} uds</strong>
							</div>
						{/if}
						<div>
							<p style="margin: 0; color: #94a3b8;">Ventas esperadas</p>
							<strong>{vendedor.indicadores.ventasEsperadas.toFixed(2)} S/</strong>
						</div>
						<div>
							<p style="margin: 0; color: #94a3b8;">Ingresos reportados</p>
							<strong>{vendedor.indicadores.ingresosReportados.toFixed(2)} S/</strong>
						</div>
						<div>
							<p style="margin: 0; color: #94a3b8;">Gastos</p>
							<strong>{vendedor.indicadores.totalGastos.toFixed(2)} S/</strong>
						</div>
						<div>
							<p style="margin: 0; color: #94a3b8;">Utilidad neta</p>
							<strong>{vendedor.indicadores.utilidadNeta.toFixed(2)} S/</strong>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</section>











