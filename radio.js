var API_KEY = "hnrdj02nxhto6r";

class Radio {
  constructor(id) {
    this.self = id;
    this.peer = new Peer(id, {key: API_KEY});
    // this.conn = null;
    this.opened_connection = false;

    this.peer.on('connection', function(conn) {
      conn.on('data', function(data){
        console.log(data);
      });
    });
    console.log("Initializing peer with id '" + id + "'");
  }

  connect(id) {
    this.other = id;
    this.conn = this.peer.connect(id);
    var self = this;
    console.log("Opening connection with id '" + id + "'...");
    this.conn.on('open', function() {
      // self.conn.send('hi');
      console.log("Connection opened!");
      self.opened_connection = true;
    });
  }

}

var radio = null;

document.getElementById("btn-selfid").addEventListener('click', function(e) {
  if (document.getElementById("input-selfid").value != "") {
    document.getElementById("input-selfid").disabled = true;
    radio = new Radio(document.getElementById("input-selfid").value);
  }
});

document.getElementById("btn-otherid").addEventListener('click', function(e) {
  if (radio) {
    if (document.getElementById("input-otherid").value != "") {
      document.getElementById("input-otherid").disabled = true;
      radio.connect(document.getElementById("input-otherid").value);
    }
  } else {
    alert('You must set your own id before doing that!');
  }
});
