export interface AppNav {
  toast(message: string): void;
  home(): void;
  back(): void;
  openPetSelect(required?: boolean): void;
  openFeed(): void;
  openClean(): void;
  openPlay(): void;
  openStyle(): void;
  openRoom(): void;
  openCollection(): void;
}
