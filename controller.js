class Controller {
  constructor() {
    this.model = new Model(this);
    this.view = new View(this);
  }

  init(dimensions, ships_settings) {
    console.log("Initializing controller");
    this.model.init(dimensions, ships_settings);
    this.view.init(dimensions);
  }

  handle_click(row, col) {
    if (!this.model.can_shoot(row, col))
      return false;

    // TODO: Send this via RTC
    var success = this.model.handle_shot(row, col);
    this.handle_shot_results(row, col, success);

    return true;
  }

  handle_shot_results(row, col, success) {
    this.model.send_shot_results(row, col, success);
    this.view.update();
  }
}

var controller = new Controller();
controller.init([10, 10], SHIPS_SETTINGS_VARIANT);
