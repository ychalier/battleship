class Controller {
  constructor() {
    this.model = new Model(this);
    this.view = new View(this);
    this.radio = new Radio(this);
  }

  init(dimensions, layout) {
    console.log("Initializing controller");
    this.radio.init(rand_id(4));
    this.model.init(dimensions, layout);
    this.view.init(dimensions);
    this.began = false;
    this.turn = false;
  }

  get_radio_id() {
    return this.radio.self;
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
      } else if ("vibrate" in navigator) {
        navigator.vibrate(500);
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
        if ("vibrate" in navigator) {
          navigator.vibrate(500);
        }
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

  first_turn() {
    this.turn = true;
    this.view.update();
  }

}


function rand_id(len) {
  var id = "";
  for (var i = 0; i < len; i++) {
    id += String.fromCharCode(Math.floor(Math.random() * 26) + 97);
  }
  return id;
}


var LAYOUT_TEST = [[1, 1], [3, 1]];
var LAYOUT_BASIC = [[2, 4], [3, 3], [4, 2], [5, 1]];
var LAYOUT_VARIANT = [[1, 4], [2, 3], [3, 2], [4, 1]];
var controller = new Controller();
controller.init([10, 10], LAYOUT_VARIANT);
