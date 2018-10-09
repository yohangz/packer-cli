import { conf } from '../config/base-config';

import '../templates/_badges.hbs';
import HomeTemplate from '../templates/home.hbs';

export class Main {
  public render(selector: string): void {
    const greetTemplate = HomeTemplate(conf);
    const container = document.querySelectorAll(selector)[0];
    container.innerHTML = greetTemplate;
  }
}
