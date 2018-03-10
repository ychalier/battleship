class Ship {
  constructor(model, size, row, col, dir) {
    this.model = model;
    this.size = size;
    this.row = row;
    this.col = col;
    this.dir = dir;  // 0: right, 1: bottom
    this.target = this.get_target();
    this.area = this.get_area();
    this.surroundings = this.get_surroundings();
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
