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
}

var controller = new Controller();
controller.init([10, 10], SHIPS_SETTINGS_BASIC);
