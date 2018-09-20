import { conf } from '../conf/conf1';

import '../templates/_greetingContent.hbs';
import HomeTemplate from '../templates/greeting.hbs';

export class Greeter {
  private readonly greeting: string;

  constructor(message: string) {
    this.greeting = message;
  }

  public greet(): void {
    const greetTemplate = HomeTemplate({
      logo: conf.logo,
      message: `${this.greeting} from ${conf.lang}!`,
    });
    const container = document.getElementsByClassName('container')[0];
    container.innerHTML = greetTemplate;
  }
}
