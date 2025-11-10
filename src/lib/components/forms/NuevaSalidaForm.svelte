<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { Salida } from '$lib';
	import { PRECIO_POR_DEFECTO } from '$lib';

type Payload = Pick<
	Salida,
	'fechaISO' | 'precioUnitario' | 'totalStock' | 'notas' | 'usaDistribucion'
>;

	const dispatch = createEventDispatcher<{ crear: Payload }>();

	export let busy = false;

	let mensaje = '';

let form: Payload = {
	fechaISO: new Date().toISOString().slice(0, 10),
	precioUnitario: PRECIO_POR_DEFECTO,
	totalStock: 0,
	notas: '',
	usaDistribucion: true
};

	const validar = () => {
		if (!form.fechaISO) {
			mensaje = 'Selecciona una fecha válida.';
			return false;
		}

		if (form.totalStock <= 0) {
			mensaje = 'Ingresa la cantidad de carteras que salen.';
			return false;
		}

		mensaje = '';
		return true;
	};

	const handleSubmit = () => {
		if (!validar()) return;
		dispatch('crear', { ...form });
	};
</script>

<section class="panel">
	<div class="grid-two" style="align-items: center; gap: 1.25rem;">
		<div>
			<h2>Nueva salida</h2>
			<p>Registra la carga inicial para controlar stock, ventas y gastos del día.</p>
		</div>
		<form on:submit|preventDefault={handleSubmit} class="grid-two" style="gap: 1rem;">
			<label>
				Fecha
				<input
					type="date"
					bind:value={form.fechaISO}
					max="9999-12-31"
					required
					disabled={busy}
				/>
			</label>

			<label>
				Precio unitario (S/)
				<input
					type="number"
					min="0"
					step="0.1"
					bind:value={form.precioUnitario}
					required
					disabled={busy}
				/>
			</label>

			<label>
				Total de carteras
				<input
					type="number"
					min="0"
					step="1"
					bind:value={form.totalStock}
					required
					disabled={busy}
				/>
			</label>

			<label>
				¿Se repartio el stock por vendedor?
				<select
					value={form.usaDistribucion ? 'true' : 'false'}
					on:change={(event) => (form.usaDistribucion = (event.target as HTMLSelectElement).value === 'true')}
					disabled={busy}
				>
					<option value="true">Si, cada vendedor recibe carteras</option>
					<option value="false">No, todos venden en un solo punto</option>
				</select>
			</label>

			<label>
				Notas
				<textarea rows="1" maxlength="120" bind:value={form.notas} disabled={busy}></textarea>
			</label>

			<div style="grid-column: 1 / -1; display: flex; gap: 1rem; align-items: center;">
				<button class="primary" type="submit" disabled={busy}>Crear salida</button>
				{#if mensaje}
					<span class="alerta">{mensaje}</span>
				{/if}
			</div>
		</form>
	</div>
</section>

