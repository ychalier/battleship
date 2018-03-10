var CASE_SIZE = 30;
var GAME_DIV = "game-panel";
var SELF_BTN = "btn-selfid";
var OTHER_BTN = "btn-otherid";
var START_BTN = "btn-start";
var PLAYER_DIV = "player-info";
var SELF_INPUT = "input-selfid";
var OTHER_INPUT = "input-otherid";

class ViewCase {
  constructor(board, row, col) {
    this.board = board;
    this.row = row;
    this.col = col;
    this.el = document.createElement('div');
    this.el.className = 'case';
    var self = this;
    this.el.addEventListener('click', function(event) {
      if (!self.board.view.over) {
        self.board.handle_click(self.row, self.col);
      }
    });
    set_dimensions(this.el, CASE_SIZE - 2, CASE_SIZE - 2);
    set_position(this.el, CASE_SIZE * this.row, CASE_SIZE * this.col);
  }

  update(model) {
    switch (model[this.row][this.col]) {
      case 0:
        this.el.innerHTML = '';
        this.el.className = 'case';
        break;
      case 1:
        this.el.innerHTML = '•';
        this.el.className = 'case miss';
        break;
      case 2:
        this.el.innerHTML = '•';
        this.el.className = 'case hit';
        break;
    }
  }

}


class ViewShip {
  constructor(view, index) {
    var self = this;

    this.view = view;
    this.index = index;
    this.el = document.createElement('div');
    this.el.className = 'ship';
    this.el.draggable = 'true';

    this.el.addEventListener('drag', function(event) {
      var row = self.view.board_self.get_row(event);
      var col = self.view.board_self.get_col(event);
      var m = self.model();
      if (row != m.row || col != m.col) {
        self.view.controller.move(self.index, row, col, m.dir);
      }
    });

    this.el.addEventListener('click', function(event) {
      var m = self.model();
      self.view.controller.move(self.index, m.row, m.col, 1 - m.dir);
    });

    this.update();
  }

  model() {
    return this.view.controller.get_ships()[this.index];
  }

  update() {
    var model = this.model();
    if (model.dir === 1) {
      set_dimensions(this.el, CASE_SIZE - 2, model.size * CASE_SIZE - 2);
    } else {
      set_dimensions(this.el, model.size * CASE_SIZE - 2, CASE_SIZE - 2);
    }
    set_position(this.el, CASE_SIZE * model.row, CASE_SIZE * model.col);
  }
}


class ViewBoard {
  constructor(view, type) {
    this.view = view;
    this.type = type;
    this.init();
  }

  init() {
    this.cases = [];

    for (var row = 0; row < this.view.height; row++) {
      for (var col = 0; col < this.view.width; col++) {
        this.cases.push(new ViewCase(this, row, col));
      }
    }

    this.el = document.createElement('div');
    this.el.className = 'board';
    set_dimensions(this.el,
      CASE_SIZE * this.view.width,
      CASE_SIZE * this.view.height);

    this.el.addEventListener('dragover', function(event) {
      event.preventDefault();
    });
    this.el.addEventListener('dragenter', function(event) {
      event.preventDefault();
    });

    for (var c = 0; c < this.cases.length; c++) {
	    this.el.appendChild(this.cases[c].el);
    }
  }

  get_col(event) {
    return Math.floor((event.pageX - this.el.offsetLeft) / CASE_SIZE);
  }

  get_row(event) {
    return Math.floor((event.pageY - this.el.offsetTop) / CASE_SIZE);
  }

  handle_click(row, col) {
    if (this.type === 1) {
      this.view.controller.handle_click(row, col);
    }
  }

  update() {
    for (var c = 0; c < this.cases.length; c++) {
      if (this.type === 0) {
        this.cases[c].update(this.view.controller.get_grid_self());
      } else if (this.type === 1) {
        this.cases[c].update(this.view.controller.get_grid_other());
      }
    }
  }

}


class View {
  constructor(controller) {
    this.controller = controller;
    this.container = document.getElementById(GAME_DIV);

    document.getElementById(SELF_BTN).addEventListener('click', function(e) {
      var input = document.getElementById(SELF_INPUT);
      if (input.value != "") {
        input.disabled = true;
        controller.init_radio(input.value);
      }
    });

    document.getElementById(OTHER_BTN).addEventListener('click', function(e) {
      if (controller.ready()) {
        var input = document.getElementById(OTHER_INPUT);
        if (input.value != "") {
          input.disabled = true;
          controller.connect_radio(input.value);
        }
      } else {
        alert('You must set your own id before doing that!');
      }
    });

    document.getElementById(START_BTN).addEventListener('click', function(e) {
      controller.start();
    });

  }

  init(dimensions) {
    console.log("Initializing view");
    this.began = false;
    this.over = false;
    this.width = dimensions[0];
    this.height = dimensions[1];
    this.container.innerHTML = "";
    this.board_self = new ViewBoard(this, 0);
    this.board_other = new ViewBoard(this, 1);

    this.ships = [];
    for (var s = 0; s < this.controller.get_ships().length; s++) {
      this.ships.push(new ViewShip(this, s));
    }

    for (var s = 0; s < this.ships.length; s++) {
      this.board_self.el.appendChild(this.ships[s].el);
    }
    this.container.appendChild(this.board_self.el);
    this.container.appendChild(this.board_other.el);
  }

  start() {
    this.began = true;
    document.getElementById(START_BTN).style.display = "none";
    document.getElementById(PLAYER_DIV).style.display = "inline-block";
    this.update();
  }

  update() {
    console.log("Updating view");
    if (!this.began) {
      this.update_ships();
    } else {
      this.update_boards();
      this.update_player();
    }
  }

  update_ships() {
    for (var s = 0; s < this.ships.length; s++) {
      this.ships[s].update();
    }
  }

  update_boards() {
    this.board_self.update();
    this.board_other.update();
  }

  update_player() {
    if (this.over) return;
    if (this.controller.turn) {
      var string = "It is your turn.";
    } else {
      var string = "Waiting for your opponent.";
    }
    document.getElementById(PLAYER_DIV).innerHTML = string;
  }

  win() {
    this.over = true;
    document.getElementById(PLAYER_DIV).innerHTML = "You win!";
  }

  lose() {
    this.over = true;
    document.getElementById(PLAYER_DIV).innerHTML = "You lose...";
  }

}


function px(value) {
  return value + "px";
}


function set_dimensions(element, width, height) {
  element.style.width = px(width);
  element.style.height = px(height);
}


function set_position(element, top, left) {
  element.style.top = px(top);
  element.style.left = px(left);
}
