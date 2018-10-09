import { conf } from '../config/base-config';

import '../templates/_badges.hbs';
import HomeTemplate from '../templates/home.hbs';

export class Main {
  render(selector) {
    const greetTemplate = HomeTemplate(conf);
    const container = document.querySelectorAll(selector)[0];
    container.innerHTML = greetTemplate;
  }
}
