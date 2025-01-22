<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { draggable } from '../lib 2/actions/dnd';
  import type { Personnel, Shift as ShiftType } from '../lib/stores';

  export let shift: ShiftType;
  export let personnel: Personnel[];
  export let isSelected = false;

  const dispatch = createEventDispatcher();
  
  let resizing = false;
  let tempHeight = shift.duration * 60;
  let resizeStartRef: { y: number; height: number } = { y: 0, height: 0 };
  
  $: {
    // Update tempHeight when shift.duration changes
    tempHeight = shift.duration * 60;
  }
  
  // Calculate start and end time based on shift position and duration
  function getTimeString(hours: number): string {
    const h = Math.floor(hours);
    const m = Math.round((hours % 1) * 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  }

  $: startTime = getTimeString(shift.startTime);
  $: endTime = getTimeString(shift.startTime + (tempHeight / 60));
  $: person = personnel.find((p: Personnel) => p.id === shift.personnelId);
  
  let isResizing = false;
  let initialY = 0;
  let initialHeight = 0;

  function handleResizeStart(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    
    isResizing = true;
    resizing = true;
    initialY = e.clientY;
    initialHeight = tempHeight;
    
    // Disable text selection during resize
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'ns-resize';
    
    function handleMouseMove(e: MouseEvent) {
      if (!isResizing) return;
      
      const deltaY = e.clientY - initialY;
      // Snap to 30px (half hour) increments
      const newHeight = Math.max(30, Math.round((initialHeight + deltaY) / 30) * 30);
      tempHeight = newHeight;
    }
    
    function handleMouseUp(e: MouseEvent) {
      isResizing = false;
      resizing = false;
      
      // Re-enable text selection
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
      
      // Calculate new duration in hours (allowing half hours)
      const newDuration = Math.round(tempHeight / 60 * 2) / 2;
      if (newDuration !== shift.duration) {
        dispatch('resize', newDuration);
      }
      
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }
</script>

{#if person}
  <div
    class="shift {isSelected ? 'selected' : ''} {resizing ? 'resizing' : ''}"
    style="height: {tempHeight}px; z-index: {resizing ? 100 : isSelected ? 2 : 1}"
    use:draggable={{
      type: 'SHIFT',
      id: shift.id,
      personnelId: shift.personnelId,
      duration: shift.duration
    }}
  >
    <div 
      class="shift-delete" 
      on:click|stopPropagation={() => dispatch('delete')}
    >×</div>
    
    <div class="shift-content">
      <div class="shift-name">{person.name}</div>
      <div class="shift-details">
        <span class="shift-unit">{person.unit}</span>
        <span class="shift-armoury">{person.armoury}</span>
      </div>
    </div>
    
    <div class="shift-duration">
      <svg class="duration-icon" viewBox="0 0 24 24" width="14" height="14">
        <path fill="currentColor" d="M12,0C5.4,0,0,5.4,0,12s5.4,12,12,12s12-5.4,12-12S18.6,0,12,0z M12,22C6.5,22,2,17.5,2,12S6.5,2,12,2s10,4.5,10,10S17.5,22,12,22z M12.5,7v5.2l4.5,2.7l-0.8,1.3L11,13V7H12.5z"/>
      </svg>
      <span class="duration-text">{Math.round(tempHeight / 30) / 2}h</span>
    </div>

    <div class="shift-times">
      {startTime} - {endTime}
    </div>
    
    <!-- Prevent drag on resize handle -->
    <div
      class="resize-handle"
      on:mousedown|preventDefault|stopPropagation={handleResizeStart}
      on:dragstart|preventDefault|stopPropagation
      draggable="false"
      style="touch-action: none; -webkit-user-drag: none;"
    ></div>
  </div>
{/if}

<style>
  .resize-handle {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 6px;
    cursor: ns-resize;
    background: transparent;
    user-select: none;
    touch-action: none;
  }
  
  .resize-handle:hover {
    background: rgba(0, 0, 0, 0.1);
  }
  
  .resizing .resize-handle {
    pointer-events: none;
  }

  .shift-times {
    position: absolute;
    bottom: 8px;
    left: 8px;
    font-size: 12px;
    color: #666;
    background: rgba(255, 255, 255, 0.9);
    padding: 2px 4px;
    border-radius: 3px;
    z-index: 1;
    pointer-events: none;
    margin-bottom: 6px;
  }
</style>