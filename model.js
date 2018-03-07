var SHIPS_SETTINGS_BASIC = [[2, 4], [3, 3], [4, 2], [5, 1]];
var SHIPS_SETTINGS_VARIANT = [[1, 4], [2, 3], [3, 2], [4, 1]];


class Ship {
  constructor(model, size, row, col, dir) {
    this.model = model;
    this.size = size;
    this.row = row;
    this.col = col;
    this.dir = dir;  // 0: right, 1: bottom
    this.target = this.get_target();
    this.area = this.get_area();
    this.fit = this.target.length === this.size;
    this.shots = [];
  }

  get_target() {
    var cases = [];
    for (var i = 0; i < this.size; i++) {
      var row = this.row;
      var col = this.col;
      if (this.dir === 0) {
        col += i;
      } else {
        row += i;
      }
      if (!this.model.is_outside(row, col)) {
        cases.push([row, col]);
      }
    }
    return cases;
  }

  get_area() {
    var cases = [];
    for (var i = -1; i <= this.size; i++) {
      for (var j = -1; j < 2; j++) {
        var row = this.row;
        var col = this.col;
        if (this.dir === 0) {
          col += i;
          row += j;
        } else {
          row += i;
          col += j;
        }
        if (!this.model.is_outside(row, col)) {
          cases.push([row, col]);
        }
      }
    }
    return cases;
  }

  get_surroundings() {
    var cases = [];
    for (var i = -1; i <= this.size; i++) {
      for (var j = -1; j < 2; j++) {
        var row = this.row;
        var col = this.col;
        if (this.dir === 0) {
          col += i;
          row += j;
        } else {
          row += i;
          col += j;
        }
        if (!this.model.is_outside(row, col)
          && (j != 0 || i === -1 || i === this.size)) {
          cases.push([row, col]);
        }
      }
    }
    return cases;
  }

  overlap(other) {
    for (var i = 0; i < this.target.length; i++) {
      for (var j = 0; j < other.area.length; j++) {
        if (this.target[i][0] === other.area[j][0]
          && this.target[i][1] === other.area[j][1]) {
          return true;
        }
      }
    }
    return false;
  }

  shoot(row, col) {
    for (var i = 0; i < this.target.length; i++) {
      if (this.target[i][0] === row && this.target[i][1] === col) {
        this.shots.push([row, col]);
        return true;
      }
    }
    return false;
  }

  is_down() {
    return this.target.length === this.shots.length;
  }

}


class Model {
  constructor(controller, dimensions, ships_settings){
    this.controller = controller;

  }

  init(dimensions, ships_settings) {
    console.log("Initializing model");
    this.began = false;
    this.ships_settings = ships_settings;  // array of [size, count]
    this.width = dimensions[0];
    this.height = dimensions[1];
    this.ships = [];
    this.grid_self = [];
    this.grid_other = [];
    for (var row = 0; row < this.height; row++) {
      this.grid_self.push([]);
      this.grid_other.push([]);
      for (var col = 0; col < this.width; col++) {
        this.grid_self[row].push(0);
        this.grid_other[row].push(0);
      }
    }
    this.nShips = 0;
    for (var k = 0; k < this.ships_settings.length; k++) {
      this.nShips += this.ships_settings[k][1];
    }
    console.log("Model initialized: " + this.nShips + " ships; width: "
                + this.width + "; height: " + this.height);
    this.init_ships();
  }

  is_outside(row, col) {
    return row < 0 || col < 0 || row >= this.height || col >= this.width;
  }

  can_add_ship(ship) {
    var add = false;
    if (ship.fit) {
      var overlap = false;
      for (var p = 0; p < this.ships.length; p++) {
        overlap = overlap || ship.overlap(this.ships[p]);
        if (overlap) {
          break;
        }
      }
      if (!overlap) {
        add = true;
      }
    }
    return add;
  }

  init_ships() {
    // places all ships, at the beginning
    console.log("Placing ships");
    var row = 0, col = 0;
    for (var s = 0; s < this.ships_settings.length; s++) {
      var size = this.ships_settings[s][0];
      var count = this.ships_settings[s][1];
      for (var c = 0; c < count; c++) {
        while (true) {
          var ship = new Ship(this, size, row, col, 0);
          if (this.can_add_ship(ship)) {
            this.ships.push(ship);
            break;
          } else {
            col++;
            if (col === this.width) {
              col = 0;
              row ++;
            }
            if (row === this.height) {
              console.log("Could not place ships, no space found!");
              return false;
            }
          }
        }
      }
    }
    return true;
  }

  str() {
    var grid = [];
    for (var row = 0; row < this.height; row++) {
      grid.push([]);
      for (var col = 0; col < this.width; col++) {
        grid[row].push(" ");
      }
    }
    for (var s = 0; s < this.ships.length; s++) {
      var ship = this.ships[s];
      for (var t = 0; t < ship.target.length; t++) {
        var row = ship.target[t][0];
        var col = ship.target[t][1];
        grid[row][col] = "X";
      }
    }
    var string = "";
    for (var row = 0; row < this.height; row++) {

      for (var col = 0; col < this.width; col++) {
        string += "-";
      }
      string += "\n";

      for (var col = 0; col < this.width; col++) {
        string += grid[row][col];
      }
      string += "\n";

    }
    for (var col = 0; col < this.width; col++) {
      string += "-";
    }
    return string;
  }

  move_ship(index, row, col, dir) {
    if (this.began) {
      console.log("Warning: attempting to move a ship after game start!");
      return;
    }
    var old_ship = this.ships[index];
    this.ships.splice(index, 1);
    var new_ship = new Ship(this, old_ship.size, row, col, dir);
    if (this.can_add_ship(new_ship)) {
      this.ships.splice(index, 0, new_ship);
      console.log("Moved ship " + index + " to (" + row + ", " + col + ", "
                  + dir + ")");
      return true;
    } else {
      this.ships.splice(index, 0, old_ship);
      return false;
    }
  }

  can_shoot(row, col) {
    return this.grid_other[row][col] === 0;
  }

  send_shot_results(row, col, result) {
    if (!result.success) {
      this.grid_other[row][col] = 1;
    } else {
      this.grid_other[row][col] = 2;
      if (result.sink) {
        var ship =
          new Ship(this, result.size, result.row, result.col, result.dir);
        var surroundings = ship.get_surroundings();
        for (var c = 0; c < surroundings.length; c++) {
          this.grid_other[surroundings[c][0]][surroundings[c][1]] = 1;
        }
      }
    }
  }

  handle_shot(row, col) {
    console.log("Handling shot at " + row + "," + col);
    var result = {};
    result.success = false;
    var target = 0;
    for (var s = 0; s < this.ships.length; s++) {
      if (this.ships[s].shoot(row, col)) {
        result.success = true;
        target = s;
        break;
      }
    }
    if (result.success) {
      if (this.ships[target].is_down()) {
        result.sink = true;
        result.size = this.ships[target].size;
        result.row = this.ships[target].row;
        result.col = this.ships[target].col;
        result.dir = this.ships[target].dir;
        console.log("A ship is sinking!");
      } else {
        result.sink = false;
        console.log("It's a hit!");
      }
      this.grid_self[row][col] = 2;
    } else {
      console.log("It's a miss!");
      this.grid_self[row][col] = 1;
    }
    return result;
  }

}
