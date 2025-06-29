export enum InputType {
  Text = 'text',
  Pdf = 'pdf',
  Url = 'url',
}

export type GeneratedSection = {
  title: string;
  content: string;
};

export type ParsedScript = GeneratedSection[];

declare global {
  interface Window {
    pdfjsLib: any;
  }
}
