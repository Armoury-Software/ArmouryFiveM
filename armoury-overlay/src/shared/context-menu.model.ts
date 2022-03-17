export interface ContextMenu {
  items: ContextItem[];
  title: string;
  id: string;
}

export interface ContextItem {
  label: string;
  active?: boolean;
}
