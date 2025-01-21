import type { Action } from 'svelte/action';

interface DragData {
  type: 'PERSONNEL' | 'SHIFT';
  id: string;
  personnelId?: string;
  duration?: number;
}

interface DragEvent extends Event {
  dataTransfer: DataTransfer;
  clientX: number;
  clientY: number;
}

interface DropEvent extends Event {
  dataTransfer: DataTransfer;
}

export const draggable: Action<HTMLElement, DragData> = (node, data) => {
  let dragStartX: number;
  let dragStartY: number;
  
  function handleDragStart(event: DragEvent) {
    dragStartX = event.clientX;
    dragStartY = event.clientY;
    
    node.dispatchEvent(new CustomEvent('dragstart', {
      detail: { data }
    }));
    
    node.classList.add('dragging');
    
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', JSON.stringify(data));
  }
  
  function handleDragEnd(event: DragEvent) {
    node.classList.remove('dragging');
    node.dispatchEvent(new CustomEvent('dragend'));
  }
  
  node.draggable = true;
  node.addEventListener('dragstart', handleDragStart as EventListener);
  node.addEventListener('dragend', handleDragEnd as EventListener);
  
  return {
    update(newData: DragData) {
      data = newData;
    },
    destroy() {
      node.removeEventListener('dragstart', handleDragStart as EventListener);
      node.removeEventListener('dragend', handleDragEnd as EventListener);
    }
  };
};

export const droppable: Action<HTMLElement> = (node) => {
  let dragEnterCount = 0;
  
  function handleDragEnter(event: DragEvent) {
    event.preventDefault();
    dragEnterCount++;
    if (dragEnterCount === 1) {
      node.classList.add('drag-over');
    }
  }
  
  function handleDragLeave(event: DragEvent) {
    event.preventDefault();
    dragEnterCount--;
    if (dragEnterCount === 0) {
      node.classList.remove('drag-over');
    }
  }
  
  function handleDragOver(event: DragEvent) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }
  
  function handleDrop(event: DropEvent) {
    event.preventDefault();
    dragEnterCount = 0;
    node.classList.remove('drag-over');
    
    try {
      const data = JSON.parse(event.dataTransfer.getData('text/plain'));
      node.dispatchEvent(new CustomEvent('drop', {
        detail: { data }
      }));
    } catch (error) {
      console.error('Error parsing drop data:', error);
    }
  }
  
  node.addEventListener('dragenter', handleDragEnter as EventListener);
  node.addEventListener('dragleave', handleDragLeave as EventListener);
  node.addEventListener('dragover', handleDragOver as EventListener);
  node.addEventListener('drop', handleDrop as EventListener);
  
  return {
    destroy() {
      node.removeEventListener('dragenter', handleDragEnter as EventListener);
      node.removeEventListener('dragleave', handleDragLeave as EventListener);
      node.removeEventListener('dragover', handleDragOver as EventListener);
      node.removeEventListener('drop', handleDrop as EventListener);
    }
  };
};