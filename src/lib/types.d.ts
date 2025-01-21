export {};

interface Personnel {
  id: string;
  name: string;
  unit: '32 CER'|'32 Svc Bn'|'32 CBG HQ'|'2 Int Coy'|'GGHG'|'Tor Scot R'|'Royal Regt of C'|'32 Sigs Regt'|'Lorne Scots'|'48 Highrs'|'7 Tor Regt'|'QOR'|'QYRang';
  armoury: 'FYA'|'MPA'|'Denison'|'Other';
}

interface Shift {
  id: string;
  personnelId: string;
  day: string;
  startTime: number;
  duration: number;
}

declare module '*.svelte' {
  import type { ComponentType } from 'svelte';
  const component: ComponentType;
  export default component;
}

// Extend Window interface to include localStorage
interface Window {
  localStorage: Storage;
}