var API_KEY = "hnrdj02nxhto6r";
var ICE = null;

class Radio {
  constructor(controller) {
    this.controller = controller;
    this.peer_created = false;
    this.opened_connection = false;
    this.other_is_connected = false;
    this.self_connected_first = false;
    this.retrieve_ice();
  }

  init(id) {
    this.self = id;
    if (ICE) {
      this.peer = new Peer(id, {key: API_KEY, secure: false,
        config: {'iceServers': ICE.v.iceServers}});
      this.opened_connection = false;
      var radio = this;
      this.peer.on('connection', function(conn) {
        conn.on('data', function(data){
          radio.handle(data);
        });
      });
      this.peer_created = true;
      console.log("Initializing peer with id '" + id + "'");
    }
  }

  retrieve_ice() {
    var xhr = new XMLHttpRequest();
    var self = this;
    xhr.onreadystatechange = function(event){
      if(xhr.readyState == 4 && xhr.status == 200){
        ICE = JSON.parse(xhr.responseText);
        console.log('ICE url: ', ICE);
        self.init(self.self);
      }
    }
    xhr.open("PUT", "https://ws.xirsys.com/_turn/Battleship/", true);
    xhr.setRequestHeader ("Authorization", "Basic "
      + btoa("devyss:f8c57884-2526-11e8-8abe-9a0532c07c01") );
    xhr.send();
  }

  connect(id) {
    this.other = id;
    var conn = this.peer.connect(id);
    var self = this;
    conn.on('open', function() {
      conn.send("HELO " + self.self);
      self.opened_connection = true;
      if (!self.other_is_connected) {
        self.self_connected_first = true;
      }
      console.log("Connection opened!");
      self.controller.start();
    });
    console.log("Opening connection with id '" + id + "'...");
  }

  send(message) {
    var conn = this.peer.connect(this.other);
    conn.on('open', function() {
      conn.send(message);
    });
  }

  ready() {
    return this.peer_created;
  }

  shoot(row, col) {
    var message = "SHOT " + this.self + " " + row + " " + col;
    this.send(message);
  }

  answer(row, col, results) {
    var message = "RESU " + this.self + " " + row + " " + col + " ";
    if (results.success) {
      message += "1 ";
      if (results.sink) {
        message += "1 ";
        message += results.size + " " + results.row + " " + results.col + " "
                 + results.dir;
      } else {
        message += "0";
      }

    } else {
      message += "0";
    }
    this.send(message);
  }

  read_shot(data) {
    var out = {};
    out.row = parseInt(data.split(" ")[2]);
    out.col = parseInt(data.split(" ")[3]);
    return out;
  }

  read_answer(data) {
    var out = {};
    var sub = {};
    var split = data.split(" ");
    out.row = parseInt(split[2]);
    out.col = parseInt(split[3]);
    sub.success = split[4] === "1";
    if (sub.success) {
      sub.sink = split[5] === "1";
      sub.size = parseInt(split[6]);
      sub.row = parseInt(split[7]);
      sub.col = parseInt(split[8]);
      sub.dir = parseInt(split[9]);
    }
    out.success = sub;
    return out;
  }

  handle(data) {
    var split = data.split(" ");
    switch (split[0]) {
      case "HELO":
        this.other_is_connected = true;
        if (this.self_connected_first) {
          this.controller.first_turn();
        } else {
          this.connect(split[1]);
        }
        console.log("Connected to " + split[1]);
        break;
      case "SHOT":
        this.controller.handle_shot(this.read_shot(data));
        break;
      case "RESU":
        this.controller.handle_result(this.read_answer(data));
        break;
      default:
        console.log("-----BEGIN RECEIVED DATA-----\n" + data
          + "\n-----END RECEIVED DATA-----");

    }
  }

}
