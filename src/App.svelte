<script lang="ts">
  import type { Personnel, Shift } from './lib/stores';
  import { 
    personnel, 
    shifts, 
    selectedPersonnel, 
    isModalOpen, 
    saveState, 
    handleUndo,
    addPersonnel,
    addShift,
    deleteShift
  } from './lib/stores';
  import Schedule from './components/Schedule.svelte';
  import PersonnelPanel from './components/PersonnelPanel.svelte';
  import PersonnelModal from './components/PersonnelModal.svelte';

  async function handleAddPersonnel(event: CustomEvent<Personnel>) {
    try {
      const newPersonnel = event.detail;
      await addPersonnel(newPersonnel);
      selectedPersonnel.set(newPersonnel);
      isModalOpen.set(false);
    } catch (error) {
      console.error('Failed to add personnel:', error);
      alert('Failed to add personnel. Please try again.');
    }
  }

  async function handleShiftCreate(event: CustomEvent<{
    personnelId: string;
    day: string;
    time: number;
    duration?: number;
  }>) {
    const { personnelId, day, time, duration = 1 } = event.detail;
    
    // Check for existing shift
    const existingShift = $shifts.find(s =>
      s.day === day &&
      s.startTime === time &&
      s.personnelId === personnelId
    );

    if (existingShift) {
      await deleteShiftById(existingShift.id);
      return;
    }

    try {
      const newShift: Shift = {
        id: Date.now().toString(),
        personnelId,
        day,
        startTime: time,
        duration
      };
      await addShift(newShift);
    } catch (error) {
      console.error('Failed to create shift:', error);
      alert('Failed to create shift. Please try again.');
    }
  }

  async function deleteShiftById(shiftId: string) {
    try {
      await deleteShift(shiftId);
    } catch (error) {
      console.error('Failed to delete shift:', error);
      alert('Failed to delete shift. Please try again.');
    }
  }

  function handleShiftDelete(event: CustomEvent<{
    shiftId: string;
    onComplete?: () => void;
    onError?: (error: Error) => void;
  }>) {
    const { shiftId, onComplete, onError } = event.detail;
    deleteShiftById(shiftId)
      .then(() => onComplete?.())
      .catch(error => {
        console.error('Error in handleShiftDelete:', error);
        onError?.(error);
      });
  }

  async function handleShiftResize(event: CustomEvent<{
    shiftId: string;
    newDuration: number;
  }>) {
    const { shiftId, newDuration } = event.detail;
    saveState();
    shifts.update(prev => prev.map(shift =>
      shift.id === shiftId ? { ...shift, duration: newDuration } : shift
    ));
  }
</script>

<div class="app-container">
  <header class="mb-4">
    <h1 class="text-3xl font-bold">Kiosk Scheduler</h1>
    <div class="header-controls">
      <button on:click={() => isModalOpen.set(true)}>
        Add Personnel
      </button>
      <button on:click={handleUndo}>
        Undo
      </button>
    </div>
  </header>

  <main class="flex gap-4 h-[calc(100vh-8rem)]">
    <aside class="personnel-sidebar">
      <PersonnelPanel
        personnel={$personnel}
        selectedPersonnel={$selectedPersonnel}
        on:select={e => selectedPersonnel.set(e.detail)}
      />
    </aside>
    <div class="flex-1 overflow-x-auto">
      <Schedule
        shifts={$shifts}
        personnel={$personnel}
        selectedPersonnel={$selectedPersonnel}
        on:shiftCreate={handleShiftCreate}
        on:shiftDelete={handleShiftDelete}
        on:shiftResize={handleShiftResize}
      />
    </div>
  </main>

  {#if $isModalOpen}
    <div class="modal-backdrop">
      <div class="modal-container">
        <PersonnelModal
          isOpen={$isModalOpen}
          on:close={() => isModalOpen.set(false)}
          on:submit={handleAddPersonnel}
        />
      </div>
    </div>
  {/if}
</div>
