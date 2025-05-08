import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class ButtonComponent extends Component {
  @tracked wasClicked = false;

  @action click() {
    this.wasClicked = true;
  }
}
