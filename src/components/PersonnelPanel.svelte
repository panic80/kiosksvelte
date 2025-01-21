<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { draggable } from '../lib/actions/dnd';
  import type { Personnel } from '../lib/stores';

  export let personnel: Personnel[] = [];
  export let selectedPersonnel: Personnel | null = null;

  const dispatch = createEventDispatcher();

  function handlePersonnelClick(person: Personnel) {
    const newSelection = selectedPersonnel && selectedPersonnel.id === person.id ? null : person;
    dispatch('select', newSelection);
  }
</script>

<div class="bg-white rounded-lg shadow p-4 mb-4">
  <h2 class="text-xl font-semibold mb-4">Personnel</h2>
  <div class="space-y-2">
    {#each personnel as person (person.id)}
      <div
        use:draggable={{ type: 'PERSONNEL', id: person.id }}
        class="p-3 bg-gray-50 rounded cursor-pointer hover:bg-gray-100 transition-colors
               {selectedPersonnel && selectedPersonnel.id === person.id ? 'ring-2 ring-blue-500' : ''}"
        on:click={() => handlePersonnelClick(person)}
      >
        <div class="font-medium">{person.name}</div>
        <div class="text-sm text-gray-600 flex gap-2">
          <span>{person.unit}</span>
          <span>•</span>
          <span>{person.armoury}</span>
        </div>
      </div>
    {/each}
    {#if personnel.length === 0}
      <div class="text-gray-500 text-center py-4">
        No personnel added yet
      </div>
    {/if}
  </div>
</div>