import { conf } from '../config/base-config';

import '../templates/_badges.hbs';
import HomeTemplate from '../templates/home.hbs';

export class Main {
  public getTemplate(): string {
    return HomeTemplate(conf);
  }

  public render(selector: string): void {
    const template = this.getTemplate();
    const container = document.querySelectorAll(selector)[0];
    container.innerHTML = template;
  }
}
