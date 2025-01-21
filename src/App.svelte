<script lang="ts">
  import { onMount } from 'svelte';
  import type { Personnel, Shift } from './lib/stores';
  import { 
    personnel, 
    shifts, 
    selectedPersonnel, 
    isModalOpen, 
    saveState, 
    handleUndo 
  } from './lib/stores';
  import Schedule from './components/Schedule.svelte';
  import PersonnelPanel from './components/PersonnelPanel.svelte';
  import PersonnelModal from './components/PersonnelModal.svelte';

  // Clear localStorage on mount to prevent stale data
  onMount(() => {
    localStorage.clear();
  });

  function handleAddPersonnel(event: CustomEvent<Personnel>) {
    const newPersonnel = event.detail;
    saveState($personnel, $shifts);
    personnel.update(prev => [...prev, newPersonnel]);
    selectedPersonnel.set(newPersonnel);
    isModalOpen.set(false);
  }

  function handleShiftCreate(event: CustomEvent<{
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
      handleShiftDelete(existingShift.id);
      return;
    }

    saveState($personnel, $shifts);
    const newShift: Shift = {
      id: Date.now().toString(),
      personnelId,
      day,
      startTime: time,
      duration
    };
    shifts.update(prev => [...prev, newShift]);
  }

  function handleShiftDelete(shiftId: string) {
    saveState($personnel, $shifts);
    shifts.update(prev => prev.filter(shift => shift.id !== shiftId));
  }

  function handleShiftResize(event: CustomEvent<{
    shiftId: string;
    newDuration: number;
  }>) {
    const { shiftId, newDuration } = event.detail;
    saveState($personnel, $shifts);
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
        on:shiftDelete={e => handleShiftDelete(e.detail)}
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
