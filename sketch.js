// ✅ Firebase 설정
const firebaseConfig = {
  apiKey: "AIzaSyAIr3NTcE_RCe5l2m5EGLvIiQO0l9uvz_M",
  authDomain: "midea-art-project.firebaseapp.com",
  databaseURL: "https://midea-art-project-default-rtdb.firebaseio.com",
  projectId: "midea-art-project",
  storageBucket: "midea-art-project.firebasestorage.app",
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

// ✅ 비율 기반으로 텍스트 생성
function generateMemoryTexts(textArray) {
  memoryTexts = [];
  for (let text of textArray) {
    for (let i = 0; i < 12; i++) {
      memoryTexts.push(new MemoryText(text));
    }
  }
}

// ✅ 메모리 텍스트 클래스
class MemoryText {
  constructor(text) {
    this.text = text;
    this.xRatio = random(0.05, 0.95); // 화면 비율로 저장
    this.yRatio = random(0.05, 0.95);
    this.size = random() < 0.1 ? random(60, 80) : random(10, 22);
    this.color = random() < 0.5 ? color(255) : color(255, 0, 0);
    this.alpha = 255;
    this.hiddenTime = null;
  }

  get x() {
    return this.xRatio * width;
  }

  get y() {
    return this.yRatio * height;
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

// ✅ 터치 시 텍스트 사라졌다가 다시 나타나기
function touchMoved() {
  for (let m of memoryTexts) {
    if (m.isTouched(mouseX, mouseY)) {
      m.hide();
    }
  }
  return false;
}

// ✅ 창 크기 변경 시 캔버스 리사이징 (텍스트도 자동 비율로 대응됨)
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
