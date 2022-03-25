export interface ContextMenu {
  items: ContextItem[];
  title: string;
  id: string;
  metadata?: any;
}

export interface ContextItem {
  label: string;
  active?: boolean;
  adminLevel?: number;
  metadata?: any;
}
