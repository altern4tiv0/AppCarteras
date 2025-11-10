<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { Salida } from '$lib';

	const dispatch = createEventDispatcher<{ close: void }>();

	export let open = false;
	export let salida: Salida | null = null;
	export let onUpdate: (cambios: Partial<Salida>) => Promise<void>;
	export let onDelete: () => Promise<void>;

	let busy = false;
	let error = '';
	let overlayEl: HTMLDivElement | null = null;

	const handleChange = async (
		campo: keyof Salida,
		valor: string | number | boolean | undefined
	) => {
		if (!salida) return;
		busy = true;
		try {
			await onUpdate({ [campo]: valor } as Partial<Salida>);
			error = '';
		} catch (err) {
			error = 'No se pudo actualizar, intenta de nuevo.';
			console.error(err);
		} finally {
			busy = false;
		}
	};

	const handleDelete = async () => {
		if (!salida) return;
		const confirmar = confirm(
			'Esta accion eliminara la salida y todos sus registros. ¿Continuar?'
		);
		if (!confirmar) return;
		busy = true;
		try {
			await onDelete();
			dispatch('close');
		} finally {
			busy = false;
		}
	};

	const close = () => {
		if (busy) return;
		dispatch('close');
	};

	const handleOverlayKey = (event: KeyboardEvent) => {
		if (event.key === 'Escape' || event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			close();
		}
	};

	$: if (open && overlayEl) {
		overlayEl.focus();
	}
</script>

{#if open && salida}
	<div
		class="modal-overlay"
		tabindex="-1"
		role="button"
		bind:this={overlayEl}
		on:click|self={close}
		on:keydown={handleOverlayKey}
	>
		<div class="modal-card">
			<header style="display: flex; justify-content: space-between; align-items: center;">
				<div>
					<h2>Configurar salida</h2>
					<p style="margin: 0;">Ajusta datos base o elimina la salida seleccionada.</p>
				</div>
				<button class="secondary" type="button" on:click={close}>Cerrar</button>
			</header>

			<div class="grid-two" style="gap: 1rem; margin-top: 1.25rem;">
				<label>
					Fecha
					<input
						type="date"
						value={salida.fechaISO}
						on:change={(event) =>
							handleChange('fechaISO', (event.target as HTMLInputElement).value)}
						disabled={busy}
					/>
				</label>
				<label>
					Precio unitario (S/)
					<input
						type="number"
						min="0"
						step="0.1"
						value={salida.precioUnitario}
						on:change={(event) =>
							handleChange('precioUnitario', Number((event.target as HTMLInputElement).value))}
						disabled={busy}
					/>
				</label>
				<label>
					Total de carteras
					<input
						type="number"
						min="0"
						step="1"
						value={salida.totalStock}
						on:change={(event) =>
							handleChange('totalStock', Number((event.target as HTMLInputElement).value))}
						disabled={busy}
					/>
				</label>
				<label>
					Distribucion
					<select
						value={salida.usaDistribucion ? 'true' : 'false'}
						on:change={(event) =>
							handleChange('usaDistribucion', (event.target as HTMLSelectElement).value === 'true')}
						disabled={busy}
					>
						<option value="true">Repartida por vendedor</option>
						<option value="false">Un solo punto</option>
					</select>
				</label>
				<label style="grid-column: 1 / -1;">
					Notas
					<textarea
						rows="2"
						maxlength="220"
						value={salida.notas ?? ''}
						on:change={(event) => handleChange('notas', (event.target as HTMLTextAreaElement).value)}
						disabled={busy}
					></textarea>
				</label>
			</div>

			{#if error}
				<p class="alerta" style="margin-top: 0.75rem;">{error}</p>
			{/if}

			<div
				style="margin-top: 1.5rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;"
			>
				<span class="tag">{salida.usaDistribucion ? 'Distribuida' : 'Un solo punto'}</span>
				<button class="danger" type="button" on:click={handleDelete} disabled={busy}>
					Eliminar salida
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.modal-overlay {
		position: fixed;
		inset: 0;
		background: rgba(15, 23, 42, 0.55);
		display: grid;
		place-items: center;
		padding: 1rem;
		z-index: 50;
	}

	.modal-card {
		width: min(640px, 100%);
		background: #fff;
		padding: 1.5rem;
		border-radius: 24px;
		box-shadow: 0 20px 60px rgba(15, 23, 42, 0.35);
		max-height: 90vh;
		overflow-y: auto;
	}
</style>
