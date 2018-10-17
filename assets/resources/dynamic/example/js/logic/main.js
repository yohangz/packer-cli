import { conf } from '../config/base-config';

import '../templates/_badges.hbs';
import HomeTemplate from '../templates/home.hbs';

export class Main {
  getTemplate () {
    return HomeTemplate(conf);
  }

  render (selector) {
    const template = this.getTemplate();
    const container = document.querySelectorAll(selector)[0];
    container.innerHTML = template;
  }
}
