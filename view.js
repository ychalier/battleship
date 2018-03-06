class ViewCase {
  constructor(view, row, col) {
    this.view = view;
    this.row = row;
    this.col = col;
    this.el = document.createElement("div");
  }

}

class View {
  constructor(controller) {
    this.controller = controller;
    this.container = document.getElementById("game-panel");
  }

  init(dimensions) {
    console.log("Initializing view");
    this.width = dimensions[0];
    this.height = dimensions[1];
    this.container.innerHTML = "";
    this.board_self = [];
    this.board_other = [];
    for (var row=0; row<this.height; row++) {
      for (var col=0; col<this.width; col++) {
        this.board_self.push(new ViewCase(this, row, col));
        this.board_other.push(new ViewCase(this, row, col));
      }
    }
    this.update();
  }

  update() {
    console.log("Updating view");
  }
}
