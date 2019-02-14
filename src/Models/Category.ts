export interface Category {
  name: string;
  action?: Function;
  help?: string;
  children?: Category[];
}
