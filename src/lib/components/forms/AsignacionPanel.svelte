<script lang="ts">
	import type { Salida, VendedorDetallado } from '$lib';

	export let salida: Salida | null = null;
	export let vendedores: VendedorDetallado[] = [];
	export let busy = false;

	export let onAdd: (values: { nombre: string; stockAsignado: number }) => Promise<void>;
	export let onUpdate: (id: string, cambios: Partial<VendedorDetallado>) => Promise<void>;
	export let onRemove: (id: string) => Promise<void>;

	let draft = { nombre: '', stockAsignado: '' };
	let error = '';

	$: usaDistribucion = salida?.usaDistribucion ?? true;
	$: totalAsignado = vendedores.reduce((acc, item) => acc + item.stockAsignado, 0);
	$: disponible = salida ? salida.totalStock - totalAsignado : 0;

	const resetDraft = () => {
		draft = { nombre: '', stockAsignado: '' };
	};

	const handleAdd = async () => {
		if (!salida) {
			error = 'Primero crea una salida.';
			return;
		}
		if (!draft.nombre.trim()) {
			error = 'El vendedor necesita un nombre.';
			return;
		}
		const stock = usaDistribucion ? Number(draft.stockAsignado) : 0;
		if (usaDistribucion && Number.isNaN(stock)) {
			error = 'Ingresa la cantidad asignada.';
			return;
		}

		await onAdd({ nombre: draft.nombre.trim(), stockAsignado: stock });
		resetDraft();
		error = '';
	};

	const handleRemove = async (id: string) => {
		await onRemove(id);
	};

	const handleUpdate = async (id: string, stock: number) => {
		await onUpdate(id, { stockAsignado: stock });
	};
</script>

<section class="panel">
	<div
		style="display: flex; justify-content: space-between; align-items: center; gap: 1rem; flex-wrap: wrap;"
	>
		<div>
			<h2>Asignacion por vendedor</h2>
			<p>
				{#if usaDistribucion}
					Distribuye las carteras entre tu equipo y ajusta cantidades durante el dia.
				{:else}
					Modo un solo punto: registra vendedores para seguir sus gastos e ingresos.
				{/if}
			</p>
		</div>
		{#if salida && usaDistribucion}
			<div class="tag">
				Total salida: {salida.totalStock} · Disponible: {Math.max(disponible, 0)}
			</div>
		{/if}
	</div>

	{#if !salida}
		<p style="margin-top: 1rem;">Crea una salida para comenzar.</p>
	{:else}
		<div class="grid-two" style="gap: 1rem; margin-top: 1rem;">
			<label>
				Nombre del vendedor
				<input
					placeholder="Ej. Ana"
					bind:value={draft.nombre}
					disabled={busy}
				/>
			</label>
			{#if usaDistribucion}
				<label>
					Carteras asignadas
					<input
						type="number"
						min="0"
						step="1"
						bind:value={draft.stockAsignado}
						disabled={busy}
					/>
				</label>
			{/if}
		</div>
		<div style="margin-top: 0.5rem; display: flex; gap: 1rem; align-items: center;">
			<button class="primary" type="button" on:click={handleAdd} disabled={busy}>
				Agregar vendedor
			</button>
			{#if error}
				<span class="alerta">{error}</span>
			{/if}
		</div>

		{#if vendedores.length === 0}
			<p style="margin-top: 1rem;">Aun no has registrado vendedores.</p>
		{:else}
			<div style="margin-top: 1.5rem; display: flex; flex-direction: column; gap: 1rem;">
				{#each vendedores as vendedor}
					<div
						style="border: 1px solid #e2e8f0; border-radius: 12px; padding: 1rem; display: flex; flex-direction: column; gap: 0.75rem;"
					>
						<div style="display: flex; justify-content: space-between; gap: 1rem; flex-wrap: wrap;">
							<div>
								<strong>{vendedor.nombre}</strong>
								{#if usaDistribucion}
									<p style="margin: 0; color: #475467;">Asignadas: {vendedor.stockAsignado}</p>
								{/if}
							</div>
							<button class="danger" type="button" on:click={() => handleRemove(vendedor.id)}>
								Quitar
							</button>
						</div>
						{#if usaDistribucion}
							<label>
								Actualizar asignacion
								<input
									type="number"
									min="0"
									step="1"
									value={vendedor.stockAsignado}
									on:change={(event) =>
										handleUpdate(
											vendedor.id,
											Number((event.target as HTMLInputElement).value)
										)}
								/>
							</label>
						{/if}
					</div>
				{/each}
			</div>
		{/if}
	{/if}
</section>

