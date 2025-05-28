const firebaseConfig = {
  apiKey: "AIzaSyAIr3NTcE_RCe5l2m5EGLvIiQO0l9uvz_M",
  authDomain: "midea-art-project.firebaseapp.com",
  databaseURL: "https://midea-art-project-default-rtdb.firebaseio.com",
  projectId: "midea-art-project",
  storageBucket: "midea-art-project.appspot.com",
  messagingSenderId: "826265566034",
  appId: "1:826265566034:web:1e133a6e7145e59339588b",
  measurementId: "G-K8NFG4CEES"
};
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

let memoryTexts = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER, CENTER);
  noStroke();
  background(0);

  const ref = database.ref("memories");
  ref.remove(); // 새로고침 시 초기화

  ref.limitToLast(20).on("value", (snapshot) => {
    let newTexts = [];
    snapshot.forEach((child) => {
      newTexts.push(child.val().text);
    });
    generateMemoryTexts(newTexts);
  });
}

function draw() {
  background(0);
  for (let m of memoryTexts) {
    m.update();
    m.display();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  for (let m of memoryTexts) {
    m.recalculatePosition();
  }
  background(0); // Safari 대응: 강제 갱신
}

function generateMemoryTexts(textArray) {
  memoryTexts = [];
  for (let text of textArray) {
    for (let i = 0; i < 12; i++) {
      memoryTexts.push(new MemoryText(text));
    }
  }
}

class MemoryText {
  constructor(text) {
    this.text = text;
    this.relX = random(0.05, 0.95); // 상대 위치
    this.relY = random(0.05, 0.95);
    this.size = random() < 0.1 ? random(60, 80) : random(10, 22);
    this.color = random() < 0.5 ? color(255) : color(255, 0, 0);
    this.alpha = 255;
    this.hiddenTime = null;
    this.recalculatePosition();
  }

  recalculatePosition() {
    this.x = this.relX * width;
    this.y = this.relY * height;
  }

  update() {
    if (this.hiddenTime && millis() - this.hiddenTime > 2000) {
      this.alpha += 5;
      if (this.alpha >= 255) {
        this.alpha = 255;
        this.hiddenTime = null;
      }
    }
  }

  display() {
    if (this.alpha > 0) {
      fill(red(this.color), green(this.color), blue(this.color), this.alpha);
      textSize(this.size);
      text(this.text, this.x, this.y);
    }
  }

  isTouched(mx, my) {
    return dist(mx, my, this.x, this.y) < this.size * 0.8;
  }

  hide() {
    this.alpha = 0;
    this.hiddenTime = millis();
  }
}

function touchMoved() {
  for (let m of memoryTexts) {
    if (m.isTouched(mouseX, mouseY)) {
      m.hide();
    }
  }
  return false;
}
