export interface Category {
  name: string;
  action?: Function;
  children?: Category[];
}
