var CASE_SIZE = 30;

class ViewCase {
  constructor(board, row, col) {
    this.board = board;
    this.row = row;
    this.col = col;
    this.el = document.createElement("div");
    this.el.className = "case";
    var self = this;
    this.el.addEventListener('click', function(event) {
      self.board.handle_click(self.row, self.col);
    });
    this.el.style.width = (CASE_SIZE - 2) + "px";
    this.el.style.height = (CASE_SIZE - 2) + "px";
    this.el.style.top = (CASE_SIZE * this.row) + "px";
    this.el.style.left = (CASE_SIZE * this.col) + "px";
  }

  update(model) {
    switch (model[this.row][this.col]) {
      case 0:
        this.el.innerHTML = "";
        this.el.className = "case";
        break;
      case 1:
        this.el.innerHTML = "•";
        this.el.className = "case miss";
        break;
      case 2:
        this.el.innerHTML = "•";
        this.el.className = "case hit";
        break;
    }
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
    this.el.addEventListener("click", function(event) {
      var model = self.model();
      var success = self.view.controller.model.move_ship(
        self.index, model.row, model.col, 1 - model.dir);
      if (success) {
        self.view.update();
      }
    });
  }

  model() {
    return this.view.controller.model.ships[this.index];
  }

  update() {
    var model = this.model();
    if (model.dir === 1) {
      /*this.sub_div.style.width = (CASE_SIZE - 2) + "px";
      this.sub_div.style.height = (model.size * CASE_SIZE - 2) + "px";*/
      this.el.style.width = (CASE_SIZE - 2) + "px";
      this.el.style.height = (model.size * CASE_SIZE - 2) + "px";
    } else {
      /*this.sub_div.style.width = (model.size * CASE_SIZE - 2) + "px";
      this.sub_div.style.height = (CASE_SIZE - 2) + "px";*/
      this.el.style.width = (model.size * CASE_SIZE - 2) + "px";
      this.el.style.height = (CASE_SIZE - 2) + "px";
    }
    this.el.style.top = (model.row * CASE_SIZE) + "px";
    this.el.style.left = (model.col * CASE_SIZE) + "px";
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
    this.el.className = "board";
    for (var c = 0; c < this.cases.length; c++) {
	    this.el.appendChild(this.cases[c].el);
    }
    this.el.addEventListener("dragover", function(event) {
      event.preventDefault();
    });
    this.el.addEventListener("dragenter", function(event) {
      event.preventDefault();
    });
  }

  getCol(event) {
    return Math.floor((event.pageX - this.el.offsetLeft) / CASE_SIZE);
  }

  getRow(event) {
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
        this.cases[c].update(this.view.controller.model.grid_self);
      } else if (this.type === 1) {
        this.cases[c].update(this.view.controller.model.grid_other);
      }
    }
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
    this.board_self = new ViewBoard(this, 0);
    this.board_other = new ViewBoard(this, 1);

    this.ships = [];
    for (var s = 0; s < this.controller.model.ships.length; s++) {
      this.ships.push(new ViewShip(this, s));
    }

    // pre-game
    for (var s = 0; s < this.ships.length; s++) {
      this.board_self.el.appendChild(this.ships[s].el);
    }
    this.container.appendChild(this.board_self.el);
    this.container.appendChild(this.board_other.el);

  }

  update() {
    console.log("Updating view");
    /* if (!this.began) {
      this.update_pregame();
    } else {
      this.update_game();
    } */
    this.update_pregame();
    this.update_game();
  }

  update_pregame() {
    for (var s = 0; s < this.ships.length; s++) {
      this.ships[s].update();
    }
  }

  update_game() {
    this.board_self.update();
    this.board_other.update();
  }

  start_moving(ship) {

  }

}
