import { conf } from '../config/base-config';

import '../templates/_badges.hbs';
import HomeTemplate from '../templates/home.hbs';

export class Main {
  public render(holderElementId: string): void {
    const greetTemplate = HomeTemplate(conf);
    const container = document.getElementsByClassName(holderElementId)[0];
    container.innerHTML = greetTemplate;
  }
}
