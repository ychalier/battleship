class Model {
  constructor(controller){
    this.controller = controller;
  }

  init(dimensions, layout) {
    this.began = false;
    this.width = dimensions[0];
    this.height = dimensions[1];
    /** Array of arrays [size, count] for each ship */
    this.layout = layout;

    // Building grids
    this.grid_self = init_grid(this.height, this.width);
    this.grid_other = init_grid(this.height, this.width);

    // Building ships
    this.ships = [];
    this.nShips = 0;
    this.ships_down_self = 0;
    this.ships_down_other = 0;
    for (var k = 0; k < this.layout.length; k++) {
      this.nShips += this.layout[k][1];
    }
    this.init_ships();

    console.log("Model initialized: " +  this.nShips + " ships in a "
      + this.width + "*" + this.height + " grid");
  }

  start() {
    this.began = true;
  }

  is_outside(row, col) {
    return row < 0 || col < 0 || row >= this.height || col >= this.width;
  }

  init_ships() {
    /** Places all ships in order at the beginning */
    var row = 0, col = 0;
    for (var s = 0; s < this.layout.length; s++) {
      var size = this.layout[s][0];
      var count = this.layout[s][1];
      for (var c = 0; c < count; c++) {
        while (true) {
          var ship = new Ship(this, size, row, col, 0);
          if (this.fits(ship)) {
            this.ships.push(ship);
            break;
          } else {
            col++;
            if (col === this.width) {
              col = 0;
              row ++;
            }
            if (row === this.height) {
              alert("Could not place ships, no space found!");
              console.log("Could not place ships, no space found!");
              return false;
            }
          }
        }
      }
    }
    return true;
  }

  fits(ship) {
    /** Return whether the new ship does overlap with any other one */
    if (!ship.fit)
      return false;
    for (var p = 0; p < this.ships.length; p++) {
      if (ship.overlap(this.ships[p]))
        return false;
    }
    return true;
  }

  move(index, row, col, dir) {
    if (this.began)
      return false;
    var old_ship = this.ships[index];
    var new_ship = new Ship(this, old_ship.size, row, col, dir);
    this.ships.splice(index, 1);
    if (this.fits(new_ship)) {
      this.ships.splice(index, 0, new_ship);
      return true;
    } else {
      this.ships.splice(index, 0, old_ship);
      return false;
    }
  }

  clear(row, col) {
    return this.grid_other[row][col] === 0;
  }

  handle_result(row, col, result) {
    console.log("Handling result from " + row + ", " + col);
    if (!result.success) {
      this.grid_other[row][col] = 1;
    } else {
      this.grid_other[row][col] = 2;
    }
    if (result.sink) {
      this.ships_down_other++;
      var shp = new Ship(this, result.size, result.row, result.col, result.dir);
      for (var c = 0; c < shp.surroundings.length; c++) {
        var pos = shp.surroundings[c];
        this.grid_other[pos[0]][pos[1]] = 1;
      }
    }
  }

  handle_shot(row, col) {
    console.log("Handling shot at " + row + "," + col);
    var result = {};
    result.success = false;

    // Identifying targetted ship
    var target = 0;
    for (var s = 0; s < this.ships.length; s++) {
      if (this.ships[s].shoot(row, col)) {
        result.success = true;
        target = s;
        break;
      }
    }

    // Building result when a ship is hit
    if (result.success) {
      if (this.ships[target].is_down()) {
        result.sink = true;
        result.size = this.ships[target].size;
        result.row = this.ships[target].row;
        result.col = this.ships[target].col;
        result.dir = this.ships[target].dir;
        this.ships_down_self++;
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

  check_winner() {
    if (this.ships_down_other === this.nShips) {
      console.log("Player wins!");
      return 1;
    } else if (this.ships_down_self === this.nShips) {
      console.log("Player loses!");
      return -1;
    } else {
      return 0;
    }
  }

}


function init_grid(height, width) {
  var grid = [];
  for (var row = 0; row < height; row++) {
    grid.push([]);
    for (var col = 0; col < width; col++) {
      grid[row].push(0);
    }
  }
  return grid;
}
