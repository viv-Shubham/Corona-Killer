let board = document.querySelector('.board');
let start = document.querySelector('.start');
let start_btn = document.querySelector('.btn');
let score_val = document.querySelector('.score_val');
let progress_bar = document.querySelector('.meter_span');
// const progress_reduction_factor = progress_bar.style.width / 5;
let power = 100;
board.height = window.innerHeight;
board.width = window.innerWidth;
let center_x = board.width / 2;
let center_y = board.height / 2;
let earth_dimension =
  (board.width <= board.height ? board.width : board.height) * 0.14;
let ctx = board.getContext('2d');
let space_img = new Image();
space_img.src = 'space.jpg';
let corona_img = new Image();
corona_img.src = 'corona.png';
let corona_size =
  (board.width <= board.height ? board.width : board.height) * 0.07;
let earth_img = new Image();
earth_img.src = 'earth.png';
class Planet {
  constructor(x, y, size) {
    this.x = x;
    this.y = y;
    this.size = size;
  }
  draw() {
    ctx.drawImage(earth_img, this.x, this.y, this.size, this.size);
  }
}
let bullets = [];
class Bullet {
  constructor(x, y, size, dx, dy) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.dx = dx;
    this.dy = dy;
  }
  draw() {
    ctx.fillStyle = 'white';
    ctx.fillRect(this.x, this.y, this.size, this.size);
  }
  update() {
    this.draw();
    this.x = this.x + this.dx;
    this.y = this.y + this.dy;
  }
}
let coronas = [];
class Corona {
  constructor(x, y, size, dx, dy) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.dx = dx;
    this.dy = dy;
  }
  draw() {
    ctx.drawImage(corona_img, this.x, this.y, corona_size, corona_size);
  }
  update() {
    this.draw();
    this.x = this.x + this.dx;
    this.y = this.y + this.dy;
  }
}
let particles = [];
class Particle {
  constructor(x, y, radius, dx, dy) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.dx = dx;
    this.dy = dy;
    this.alpha = 1;
  }
  draw() {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.restore();
  }
  update() {
    this.draw();
    this.alpha -= 0.01;
    this.x += this.dx;
    this.y += this.dy;
  }
}
function detect_collision(e1, e2) {
  if (
    e1.x < e2.x + e2.size &&
    e2.x < e1.x + e1.size &&
    e1.y < e2.y + e2.size &&
    e2.y < e1.y + e1.size
  )
    return true;
}
function animate() {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
  ctx.drawImage(space_img, 0, 0, board.width, board.height);
  let earth = new Planet(
    center_x - earth_dimension / 2,
    center_y - earth_dimension / 2,
    earth_dimension
  );
  particles.forEach((particle, i) => {
    if (particle.alpha <= 0) {
      particles.splice(i, 1);
    } else particle.update();
  });
  bullets.forEach((bullet, i) => {
    bullet.update();
    if (
      bullet.x < 0 ||
      bullet.x > board.width ||
      bullet.y < 0 ||
      bullet.y > board.height
    ) {
      setTimeout(() => {
        bullets.splice(i, 1);
      }, 0);
    }
  });
  earth.draw();
  coronas.forEach((corona, i) => {
    corona.update();
    if (detect_collision(corona, earth)) {
      setTimeout(() => {
        coronas.splice(i, 1);
        if (power == 0) {
          alert('GAME OVER');
          progress_bar.style.width = '100%';
          power = 100;
          bullets = [];
          coronas = [];
          score_val.innerHTML = 0;
          particles = [];
        } else {
          power = power - 20;
          progress_bar.style.width = power + '%';
        }
      }, 0);
    } else {
      bullets.forEach((bullet, j) => {
        if (detect_collision(bullet, corona)) {
          setTimeout(() => {
            for (k = 0; k <= bullet.size * 4; k++) {
              let particle = new Particle(
                bullet.x,
                bullet.y,
                Math.random() * (bullet.size / 3.4),
                (Math.random() - 0.5) * (Math.random() * 6),
                (Math.random() - 0.5) * (Math.random() * 6)
              );
              particles.push(particle);
            }
            bullets.splice(j, 1);
            coronas.splice(i, 1);
            score_val.innerHTML = +score_val.innerHTML + 10;
          }, 0);
        }
      });
    }
  });

  requestAnimationFrame(animate);
}
function create_corona() {
  setInterval(() => {
    let x = Math.random() * board.width;
    let y = Math.random() * board.height;
    let decide = Math.random();
    if (decide <= 0.5) {
      // horizontal
      if (x / board.width <= 0.5) {
        // left
        x = 0 - corona_size;
      } else {
        // right
        x = board.width;
      }
    } else {
      // vertical
      if (y / board.height <= 0.5) {
        // top
        y = 0 - corona_size;
      } else {
        // bottom
        y = board.height;
      }
    }
    let theta = Math.atan2(
      board.height / 2 - (y + corona_size / 2),
      board.width / 2 - (x + corona_size / 2)
    );
    let corona = new Corona(
      x,
      y,
      corona_size,
      Math.cos(theta) * 1.5,
      Math.sin(theta) * 1.5
    );
    coronas.push(corona);
  }, 1000);
}
start_btn.addEventListener('click', (e) => {
  e.stopImmediatePropagation();
  start.style.display = 'none';
  animate();
  create_corona();
  window.addEventListener('click', (e) => {
    let theta = Math.atan2(
      e.clientY - board.height / 2,
      e.clientX - board.width / 2
    );
    let bullet = new Bullet(
      center_x,
      center_y,
      7,
      Math.cos(theta) * 7,
      Math.sin(theta) * 7
    );
    bullets.push(bullet);
  });
});
