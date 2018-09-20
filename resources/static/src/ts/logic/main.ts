import { Greeter } from './greet';

export class Main {
  private greeter: Greeter;

  constructor(name: string) {
    this.greeter = new Greeter(name);
  }

  public greet(): void {
    this.greeter.greet();
  }
}
