<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { draggable } from '../lib/actions/dnd';
  import { deletePersonnel } from '../lib/stores';
  
  let showDeleteConfirm: string | null = null;
  import type { Personnel } from '../lib/stores';

  export let personnel: Personnel[] = [];
  export let selectedPersonnel: Personnel | null = null;

  const dispatch = createEventDispatcher();

  function handlePersonnelClick(person: Personnel) {
    const newSelection = selectedPersonnel && selectedPersonnel.id === person.id ? null : person;
    dispatch('select', newSelection);
  }

  async function handleDelete(person: Personnel) {
    if (confirm(`Are you sure you want to delete ${person.name}?`)) {
      try {
        await deletePersonnel(person.id);
        if (selectedPersonnel?.id === person.id) {
          dispatch('select', null);
        }
      } catch (error) {
        console.error('Error deleting personnel:', error);
        alert('Failed to delete personnel. Please try again.');
      }
    }
  }
</script>

<div class="bg-white rounded-lg shadow p-4 mb-4">
  <h2 class="text-xl font-semibold mb-4">Personnel</h2>
  <div class="space-y-2">
    {#each personnel.filter(p => p && p.id) as person (person.id)}
      <div
        use:draggable={{ type: 'PERSONNEL', id: person.id }}
        class="p-3 bg-gray-50 rounded cursor-pointer hover:bg-gray-100 transition-colors relative
               {selectedPersonnel && selectedPersonnel.id === person.id ? 'ring-2 ring-blue-500' : ''}"
        on:click={() => handlePersonnelClick(person)}
        role="button"
        tabindex="0"
        on:keypress={(e) => e.key === 'Enter' && handlePersonnelClick(person)}
      >
        <div class="font-medium">{person.name}</div>
        <button
          class="delete-btn absolute top-1 right-1 z-50 p-1 hover:bg-gray-200 rounded-full transition-colors"
          on:click|stopPropagation={() => handleDelete(person)}
          aria-label="Delete personnel"
          on:mousedown|stopPropagation={() => {}}
        >🗑️</button>
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