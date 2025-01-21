<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { Personnel } from '../lib/types';

  export let isOpen = false;

  const dispatch = createEventDispatcher();
  let name = '';
  let unit: Personnel['unit'] = '32 CER';
  let armoury: Personnel['armoury'] = 'FYA';

  function handleSubmit(e: Event): void {
    e.preventDefault();

    const newPersonnel: Personnel = {
      id: Date.now().toString(),
      name: name.trim(),
      unit,
      armoury,
    };

    dispatch('submit', newPersonnel);
    resetForm();
  }

  function handleClose(): void {
    resetForm();
    dispatch('close');
  }

  function resetForm(): void {
    name = '';
    unit = '32 CER';
    armoury = 'FYA';
  }
</script>

{#if isOpen}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
    <div class="bg-white rounded-lg p-6 w-full max-w-md">
      <h2 class="text-xl font-semibold mb-4">Add Personnel</h2>

      <form on:submit|preventDefault={handleSubmit} class="space-y-4">
        <div>
          <label for="name" class="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            id="name"
            bind:value={name}
            required
            class="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label for="unit" class="block text-sm font-medium text-gray-700">Unit</label>
          <select
            id="unit"
            bind:value={unit}
            required
            class="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="" disabled>Select Unit</option>
            <option value="32 CER">32 CER</option>
            <option value="32 Svc Bn">32 Svc Bn</option>
            <option value="32 CBG HQ">32 CBG HQ</option>
            <option value="2 Int Coy">2 Int Coy</option>
            <option value="GGHG">GGHG</option>
            <option value="Tor Scot R">Tor Scot R</option>
            <option value="Royal Regt of C">Royal Regt of C</option>
            <option value="32 Sigs Regt">32 Sigs Regt</option>
            <option value="Lorne Scots">Lorne Scots</option>
            <option value="48 Highrs">48 Highrs</option>
            <option value="7 Tor Regt">7 Tor Regt</option>
            <option value="QOR">QOR</option>
            <option value="QYRang">QYRang</option>
          </select>
        </div>

        <div>
          <label for="armoury" class="block text-sm font-medium text-gray-700">Armoury</label>
          <select
            id="armoury"
            bind:value={armoury}
            required
            class="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="" disabled>Select Armoury</option>
            <option value="FYA">FYA</option>
            <option value="MPA">MPA</option>
            <option value="Denison">Denison</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div class="flex justify-end gap-2 mt-6">
          <button
            type="button"
            on:click={handleClose}
            class="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 transition-colors"
          >
            Add
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}