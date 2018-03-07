var CASE_SIZE = 30;

class ViewCase {
  constructor(board, row, col) {
    this.board = board;
    this.row = row;
    this.col = col;
    this.el = document.createElement("div");
    this.el.className = "case-bg";
    this.el.appendChild(document.createElement('div'));
  }

}

class ViewShip {
  constructor(view, index) {
    this.view = view;
    this.index = index;
    this.el = document.createElement("div");
    this.el.className = "ship";
    this.sub_div = document.createElement("div");
    this.update();
    this.el.appendChild(this.sub_div);
    this.el.draggable = "true";
    var self = this;
    this.el.addEventListener("dragstart", function(event) {
      event.dataTransfer.setDragImage(document.createElement('div'), 0, 0);
      event.dataTransfer.ship = self;
      self.view.current_ship_drag = self;
    });
    this.el.addEventListener("drag", function(event) {
      var row = self.view.board_self.getRow(event);
      var col = self.view.board_self.getCol(event);
      var model = self.model();
      if (row != model.row || col != model.col) {
        var success =
          self.view.controller.model.move_ship(self.index, row, col, model.dir);
        if (success) {
          self.view.update();
        }
      }
    });
  }

  model() {
    return this.view.controller.model.ships_self[this.index];
  }

  update() {
    var model = this.model();
    if (model.dir === 1) {
      this.sub_div.style.width = (CASE_SIZE - 2) + "px";
      this.sub_div.style.height = (model.size * CASE_SIZE - 2) + "px";
      this.el.style.width = CASE_SIZE + "px";
      this.el.style.height = (model.size * CASE_SIZE) + "px";
    } else {
      this.sub_div.style.width = (model.size * CASE_SIZE - 2) + "px";
      this.sub_div.style.height = (CASE_SIZE - 2) + "px";
      this.el.style.width = (model.size * CASE_SIZE) + "px";
      this.el.style.height = CASE_SIZE + "px";
    }
    this.el.style.top = (model.row * CASE_SIZE) + "px";
    this.el.style.left = (model.col * CASE_SIZE) + "px";
  }
}


class ViewBoard {
  constructor(view) {
    this.view = view;
    this.init();
  }

  init() {
    this.cases = [];
    for (var row = 0; row < this.view.height; row++) {
      for (var col = 0; col < this.view.width; col++) {
        this.cases.push(new ViewCase(this, row, col));
      }
    }
    this.el = this.view.create_blank_grid();
  }

  getCol(event) {
    return Math.floor((event.pageX - this.el.offsetLeft) / CASE_SIZE);
  }

  getRow(event) {
    return Math.floor((event.pageY - this.el.offsetTop) / CASE_SIZE);
  }

  update() {

  }

}


class View {
  constructor(controller) {
    this.controller = controller;
    this.container = document.getElementById("game-panel");
  }

  init(dimensions) {
    console.log("Initializing view");
    this.began = false;
    this.width = dimensions[0];
    this.height = dimensions[1];
    this.container.innerHTML = "";
    this.board_self = new ViewBoard(this);
    this.board_other = new ViewBoard(this);
    this.ships = [];
    for (var s = 0; s < this.controller.model.ships_self.length; s++) {
      this.ships.push(new ViewShip(this, s));
    }

    // pre-game
    for (var s = 0; s < this.ships.length; s++) {
      this.board_self.el.appendChild(this.ships[s].el);
    }
    this.container.appendChild(this.board_self.el);

  }

  update() {
    console.log("Updating view");
    if (!this.began) {
      this.update_pregame();
    } else  {
      this.update_game();
    }
  }

  create_blank_grid() {
    var board = document.createElement('div');
    board.className = "board";
    for (var row = 0; row < this.height; row++) {
      for (var col = 0; col < this.width; col ++) {
        var view_case = new ViewCase(this, row, col);
	      board.appendChild(view_case.el);
      }
    }
    board.addEventListener("dragover", function(event) {
      event.preventDefault();
    });
    board.addEventListener("dragenter", function(event) {
      event.preventDefault();
    });
    return board;
  }

  update_pregame() {
    for (var s = 0; s < this.ships.length; s++) {
      this.ships[s].update();
    }
  }

  start_moving(ship) {

  }

}
