class Controller {
  constructor() {
    this.model = new Model(this);
    this.view = new View(this);
    this.radio = new Radio(this);
  }

  init(dimensions, ships_settings) {
    console.log("Initializing controller");
    this.model.init(dimensions, ships_settings);
    this.view.init(dimensions);
    this.began = false;
  }

  start() {
    if (this.radio.opened_connection) {
      document.getElementById("btn-start").style.display = "none";
      this.model.start();
      this.view.start();
      this.began = true;
    } else {
      alert("Setup the connection with your friend first!");
    }
  }

  handle_click(row, col) {
    if (!this.began || !this.model.can_shoot(row, col))
      return false;
    this.radio.shoot(row, col);
    return true;
  }

  handle_shot(rowCol) {
    if (this.began) {
      var success = this.model.handle_shot(rowCol.row, rowCol.col);
      this.radio.answer(rowCol.row, rowCol.col, success);
      this.view.update();
    }
  }

  handle_shot_results(out) {
    if (this.began) {
      this.model.send_shot_results(out.row, out.col, out.success);
      this.view.update();
    }
  }
}

var controller = new Controller();
controller.init([10, 10], SHIPS_SETTINGS_VARIANT);

document.getElementById("btn-selfid").addEventListener('click', function(e) {
  if (document.getElementById("input-selfid").value != "") {
    document.getElementById("input-selfid").disabled = true;
    controller.radio.init(document.getElementById("input-selfid").value);
  }
});

document.getElementById("btn-otherid").addEventListener('click', function(e) {
  if (controller.radio.ready()) {
    if (document.getElementById("input-otherid").value != "") {
      document.getElementById("input-otherid").disabled = true;
      controller.radio.connect(document.getElementById("input-otherid").value);
    }
  } else {
    alert('You must set your own id before doing that!');
  }
});

document.getElementById("btn-start").addEventListener('click', function(e) {
  controller.start();
});
