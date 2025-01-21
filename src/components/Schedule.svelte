<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { draggable, droppable } from '../lib/actions/dnd';
  import Shift from './Shift.svelte';
  import type { Personnel, Shift as ShiftType } from '../lib/stores';

  export let shifts: ShiftType[] = [];
  export let personnel: Personnel[] = [];
  export let selectedPersonnel: Personnel | null = null;

  const dispatch = createEventDispatcher();
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const timeSlots = Array.from({ length: 12 }, (_, i) => i + 12);

  function handleShiftCreate(personnelId: string, day: string, time: number, duration: number = 1) {
    dispatch('shiftCreate', { personnelId, day, time, duration });
  }

  function handleShiftDelete(shiftId: string) {
    dispatch('shiftDelete', { shiftId });
  }

  function handleShiftResize(shiftId: string, newDuration: number) {
    dispatch('shiftResize', { shiftId, newDuration });
  }

  interface DragData {
    type: 'PERSONNEL' | 'SHIFT';
    id: string;
    shiftId?: string;
    personnelId?: string;
    duration?: number;
  }

  async function handleDropEvent(event: Event, day: string, time: number) {
    // Prevent default for both native and custom events
    event.preventDefault();
    
    if (event instanceof CustomEvent) {
      const { data } = event.detail;
      if (data.type === 'PERSONNEL') {
        handleShiftCreate(data.id, day, time);
      } else if (data.type === 'SHIFT') {
        // For SHIFT type, ensure we create the new shift after deleting the old one
        const { id: shiftId, personnelId, duration } = data;
        if (personnelId && duration) {
          // Delete old shift and wait for it to complete before creating new one
          try {
            await new Promise<void>((resolve, reject) => {
              dispatch('shiftDelete', { shiftId, onComplete: resolve, onError: reject });
            });
            handleShiftCreate(personnelId, day, time, duration);
          } catch (error) {
            console.error('Failed to delete shift during move:', error);
          }
        }
      }
    }
  }

</script>

<div class="schedule-container">
  <!-- Time Column -->
  <div class="time-column">
    <div class="time-header">Time</div>
    <div class="time-slots">
      {#each timeSlots as hour}
        <div class="time-slot">
          {hour}:00
        </div>
      {/each}
    </div>
  </div>

  <!-- Days Container -->
  <div class="days-container">
    {#each days as day}
      <div class="day-column">
        <div class="day-header">{day}</div>
        {#each timeSlots as time}
          <div
            class="slot"
            use:droppable
            on:drop={e => handleDropEvent(e, day, time)}
          >
            {#each shifts.filter(s => s.day === day && s.startTime === time) as shift (shift.id)}
              <Shift
                {shift}
                {personnel}
                isSelected={selectedPersonnel?.id === shift.personnelId}
                on:delete={() => handleShiftDelete(shift.id)}
                on:resize={e => handleShiftResize(shift.id, e.detail)}
              />
            {/each}
          </div>
        {/each}
      </div>
    {/each}
  </div>
</div>