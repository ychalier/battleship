class Controller {
  constructor() {
    this.model = new Model(this);
    this.view = new View(this);
    this.radio = new Radio(this);
  }

  init(dimensions, layout) {
    console.log("Initializing controller");
    this.model.init(dimensions, layout);
    this.view.init(dimensions);
    this.began = false;
    this.turn = false;
  }

  init_radio(id) {
    this.radio.init(id);
  }

  connect_radio(id) {
    this.radio.connect(id);
  }

  ready() {
    return this.radio.ready();
  }

  start() {
    if (this.radio.opened_connection) {
      console.log("Game is starting !");
      if (this.radio.self_connected_first) {
        this.turn = true;
        console.log("Player " + this.radio.self + " is starting.");
      } else {
        console.log("Player " + this.radio.other + " is starting.");
      }
      this.model.start();
      this.view.start();
      this.began = true;
    } else {
      alert("Setup the connection with your friend first!");
    }
  }

  handle_click(row, col) {
    if (!this.turn || !this.began || !this.model.clear(row, col))
      return false;
    this.turn = false;
    this.radio.shoot(row, col);
    return true;
  }

  handle_shot(pos) {
    if (this.began && !this.turn) {
      var success = this.model.handle_shot(pos.row, pos.col);
      this.radio.answer(pos.row, pos.col, success);
      if (!success.success) {
        this.turn = true;
      }
      this.check_winner();
      this.view.update();
    }
  }

  handle_result(out) {
    if (this.began) {
      this.model.handle_result(out.row, out.col, out.success);
      if (out.success.success) {
        this.turn = true;
      }
      this.check_winner();
      this.view.update();
    }
  }

  get_ships() {
    return this.model.ships;
  }

  get_grid_self() {
    return this.model.grid_self;
  }

  get_grid_other() {
    return this.model.grid_other;
  }

  move(index, row, col, dir) {
    if (this.model.move(index, row, col, dir)) {
      this.view.update();
    }
  }

  check_winner() {
    var winner = this.model.check_winner();
    if (winner > 0) {
      this.view.win();
    } else if (winner < 0) {
      this.view.lose();
    }
  }

}

var LAYOUT_TEST = [[1, 1], [3, 1]];
var LAYOUT_BASIC = [[2, 4], [3, 3], [4, 2], [5, 1]];
var LAYOUT_VARIANT = [[1, 4], [2, 3], [3, 2], [4, 1]];
var controller = new Controller();
controller.init([10, 10], LAYOUT_VARIANT);


function touchHandler(event) {
    var touch = event.changedTouches[0];

    var simulatedEvent = document.createEvent("MouseEvent");
        simulatedEvent.initMouseEvent({
        touchstart: "mousedown",
        touchmove: "mousemove",
        touchend: "mouseup"
    }[event.type], true, true, window, 1,
        touch.screenX, touch.screenY,
        touch.clientX, touch.clientY, false,
        false, false, false, 0, null);

    touch.target.dispatchEvent(simulatedEvent);
    event.preventDefault();
}


document.addEventListener("touchstart", touchHandler, true);
document.addEventListener("touchmove", touchHandler, true);
document.addEventListener("touchend", touchHandler, true);
document.addEventListener("touchcancel", touchHandler, true);
