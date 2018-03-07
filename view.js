var CASE_SIZE = 30;

class ViewCase {
  constructor(view, row, col) {
    this.view = view;
    this.row = row;
    this.col = col;
    this.el = document.createElement("div");
  }
}

class ViewShip {
  constructor(view, model) {
    this.view = view;
    this.model = model;
    this.el = document.createElement("div");
    this.el.className = "ship";
    var sub_div = document.createElement("div");
    if (this.model.dir === 1) {
      sub_div.style.width = (CASE_SIZE - 2) + "px";
      sub_div.style.height = (this.model.size * CASE_SIZE - 2) + "px";
      this.el.style.width = CASE_SIZE + "px";
      this.el.style.height = (this.model.size * CASE_SIZE) + "px";
    } else {
      sub_div.style.width = (this.model.size * CASE_SIZE - 2) + "px";
      sub_div.style.height = (CASE_SIZE - 2) + "px";
      this.el.style.width = (this.model.size * CASE_SIZE) + "px";
      this.el.style.height = CASE_SIZE + "px";
    }
    this.el.style.top = (this.model.row * CASE_SIZE) + "px";
    this.el.style.left = (this.model.col * CASE_SIZE) + "px";
    this.el.appendChild(sub_div);
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
    this.board_self = [];
    this.board_other = [];
    for (var row = 0; row < this.height; row++) {
      for (var col = 0; col < this.width; col++) {
        this.board_self.push(new ViewCase(this, row, col));
        this.board_other.push(new ViewCase(this, row, col));
      }
    }
    this.ships = [];
    for (var s = 0; s < this.controller.model.ships_self.length; s++) {
      var ship = this.controller.model.ships_self[s];
      this.ships.push(new ViewShip(this, ship));
    }
    this.update();
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
        var case_bg = document.createElement('div');
        case_bg.className = "case-bg";
        case_bg.appendChild(document.createElement('div'));
	      board.appendChild(case_bg);
      }
    }
    return board;
  }

  update_pregame() {
    this.container.innerHTML = "";
    var board = this.create_blank_grid();
    for (var s = 0; s < this.ships.length; s++) {
      board.appendChild(this.ships[s].el);
    }
    this.container.appendChild(board);
  }

}
