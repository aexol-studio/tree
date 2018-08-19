export type TabsProps = {
  tabs: string[];
  tab: string;
  addTab: (name: string) => void;
  removeTab: (name: string) => void;
  renameTab: (name: string, newName: string) => void;
  onSelect: (name: string) => void;
};
export const MAIN_TAB_NAME = "Main"
export type TabsState = {
  renamed?: string;
  renamedString?:string;
};
