// TODO IDEAS
// moving finish
// checkpoints
// once Quinton implements the virtual camera, have the finish be offscreen so that player has to travel to it
// random obstacle size
// random range of movement for moving obstacles (already have random rotating obstacles)

// * EDITOR MODE *
// change shape of player in editor mode
// change size of objects
// change range of movement for moving and rotating obstacles
// able to play your edited level

document.addEventListener("contextmenu", (event) => event.preventDefault());

let player, goal, ball, startCoords, movingXPos, movingObstacles;
let staticStart;
let obstacles;
let rotatingObstacles;
let rotatingObstacle;
let stationaryObstacles;
let lines, nodes;
let shouldMakeWall = false;
let goals;
let points = 0;

let phaseShift = 1;
let playerShape = 0;

let mouseHeld = false;
let draggedObstacle;
let dragXAdjust = 0;
let dragYAdjust = 0;
let typeOfObstacle = null;

let inMainMenu = true;
let inLevelEditor = false;
let inRandomGame = false;
let inEditorGame = false;

let test = 1;

function randInt(min, max) {
  randNum = Math.floor(Math.random() * max + 1);
  while (randNum < min || randNum > max) {
    randNum = Math.floor(Math.random() * max + 1);
  }
  return randNum;
}

function setup() {
  // createCanvas size is determined by the window size

  let h = window.innerHeight;
  let w = (window.innerHeight * 16) / 9;

  if (w > window.innerWidth) {
    w = window.innerWidth;
    h = (window.innerWidth * 9) / 16;
  }

  createCanvas(w, h);
  world.gravity.y = 10;

  obstacles = new Group();

  goals = new Group();
  goals.collider = "static";
  goals.shapeColor = "green";
  goals.diameter = width * 0.02;

  stationaryObstacles = new obstacles.Group();
  stationaryObstacles.collider = "static";
  stationaryObstacles.shapeColor = "red";
  stationaryObstacles.width = width * 0.02;
  stationaryObstacles.height = height * 0.12;

  movingObstacles = new obstacles.Group();
  movingObstacles.collider = "static";
  movingObstacles.shapeColor = "blue";
  movingObstacles.width = width * 0.02;
  movingObstacles.height = height * 0.12;

  rotatingObstacles = new obstacles.Group();
  rotatingObstacles.collider = "kinematic";
  rotatingObstacles.shapeColor = "green";
  rotatingObstacles.width = width * 0.02;
  rotatingObstacles.height = height * 0.12;

  lines = new Group();
  lines.friction = 0;

  nodes = new Group();
  nodes.overlap(allSprites);

  // testing
  // startLevelEditor();
}

function placePlayerAndGoal() {
  if (inLevelEditor) {
    startCoords = [0.1, 0.1];
    finishCoords = [0.7, 0.7];
  } else {
    startCoords = [random(0.05, 0.95), random(0.05, 0.15)];
    finishCoords = [random(0.05, 0.95), random(0.06, 0.95)];
    while (
      finishCoords[1] < startCoords[1] ||
      ((10 * finishCoords[0] - 10 * startCoords[0]) ** 2 +
        (10 * finishCoords[1] - 10 * startCoords[1]) ** 2) /
        10 <
        8 ||
      Math.abs(finishCoords[0] - startCoords[0]) < 0.5
    ) {
      startCoords = [random(0.05, 0.95), random(0.05, 0.15)];
      finishCoords = [random(0.06, 0.95), random(0.06, 0.95)];
    }
  }
  player = new Sprite(
    width * startCoords[0],
    height * startCoords[1],
    width * 0.02
  );
  player.shapeColor = 200;

  new goals.Sprite(width * finishCoords[0], height * finishCoords[1]);
}

function startNewGame() {
  startCoords = [random(0.05, 0.95), random(0.05, 0.15)];
  finishCoords = [random(0.05, 0.95), random(0.06, 0.95)];
  while (
    finishCoords[1] < startCoords[1] ||
    ((10 * finishCoords[0] - 10 * startCoords[0]) ** 2 +
      (10 * finishCoords[1] - 10 * startCoords[1]) ** 2) /
      10 <
      8 ||
    Math.abs(finishCoords[0] - startCoords[0]) < 0.5
  ) {
    startCoords = [random(0.05, 0.95), random(0.05, 0.15)];
    finishCoords = [random(0.06, 0.95), random(0.06, 0.95)];
  }
  player = new Sprite(width * startCoords[0], height * startCoords[1], 30);
  player.shapeColor = 200;

  player.overlap(goals, (player, goal) => {
    goal.remove();
    if (goals.length == 0) {
      win();
    }
  });
  new goals.Sprite(width * finishCoords[0], height * finishCoords[1]);
  let xPos = random(
    min(startCoords[0], finishCoords[0]) + 0.05,
    max(startCoords[0], finishCoords[0]) - 0.05
  );
  let yPos = random(0.05, 0.95);
  let coords = [xPos * width, yPos * height];
  new goals.Sprite(coords[0], coords[1]);

  stationaryObstacles.removeSprites();

  for (let i = 0; i < 10; i++) {
    let xPos = random(
      min(startCoords[0], finishCoords[0]) + 0.05,
      max(startCoords[0], finishCoords[0]) - 0.05
    );
    let yPos = random(0.05, 0.95);
    let coords = [xPos * width, yPos * height];

    new stationaryObstacles.Sprite(coords[0], coords[1]);
  }

  player.overlap(stationaryObstacles, reset);
  staticStart = 200;

  // Trying to group moving obstacles together
}

function reset() {
  console.log("reset");
  lines.removeSprites();
  nodes.removeSprites();
  player.remove();
  switch (playerShape) {
    case 0:
      player = new Sprite(
        window.innerWidth * startCoords[0],
        window.innerHeight * startCoords[1],
        width * 0.02
      );
      break;
    case 1:
      player = new Sprite(
        window.innerWidth * startCoords[0],
        window.innerHeight * startCoords[1],
        width * 0.02,
        width * 0.02
      );
      break;
    case 2:
      player = new Sprite(
        window.innerWidth * startCoords[0],
        window.innerHeight * startCoords[1],
        [30, width * 0.02, 3]
      );
      break;
  }
  player.shapeColor = 200;
  player.overlap(stationaryObstacles, reset);
  player.overlap(rotatingObstacles, reset);
  player.overlap(goal, win);
  player.overlap(movingObstacles, reset);
  staticStart = 200;
  if (inEditorGame) {
    inEditorGame = false;
  }
}

function draw() {
  background(220);
  fill(0);
  if (inMainMenu) {
    textAlign(CENTER, CENTER);

    let x = width / 2;
    let y = height / 2;
    textSize(36);
    text("Draw the Line", x, y - 100);
    textSize(24);
    text("Space: Play Endless Mode", x, y);
    text("E: Open Level Editor", x, y + 30);
  }
  if (inRandomGame) {
    staticStart--;

    if (staticStart > 0) {
      player.shapeColor = staticStart + 100;
      player.x = startCoords[0] * window.innerWidth;
      player.y = startCoords[1] * window.innerHeight;
      player.speed = 0;
    }

    for (let movingObstacle of movingObstacles) {
      movingObstacle.y +=
        Math.cos(movingObstacle.initAngle) * movingObstacle.range;
      movingObstacle.initAngle += 0.025;
    }
    if (player.y - player.h * 2 > height) {
      console.log("start");
      reset();
    }
  }
  if (inLevelEditor) {
    makePanel();
    // TODO make able to release player (ie if-statement here)
    if (inEditorGame) {
    } else {
      player.x = startCoords[0] * window.innerWidth;
      player.y = startCoords[1] * window.innerHeight;
      player.speed = 0;
    }
  }
}

function win() {
  console.log("win");
  lines.removeSprites();
  nodes.removeSprites();
  player.remove();
  movingObstacles.removeSprites();
  rotatingObstacles.removeSprites();
  playerShape = 0;
  startNewGame();
}

function makePanel() {
  fill(160);
  let panelWidth = width * 0.1;
  rect(width - panelWidth, 0, panelWidth, height);
}

function keyPressed() {
  // if (key === " " && staticStart) {
  // 	staticStart = !staticStart;
  // }
  if (key === "x") {
    playerShape = (playerShape + 1) % 3;
    reset();
  }

  if (key === "z" && inRandomGame) {
    reset();
  }

  if (key === "e" && inMainMenu) {
    inLevelEditor = true;
    startLevelEditor();
    inMainMenu = false;
  }

  if (key === " " && inLevelEditor) {
    inEditorGame = true;
  } else if (key === " " && inMainMenu) {
    inRandomGame = true;
    startNewGame();
    inMainMenu = false;
  }
}

function startLevelEditor() {
  placePlayerAndGoal();

  new stationaryObstacles.Sprite(width - 75, height * 0.25);
  new movingObstacles.Sprite(width - 75, height * 0.5);
  new rotatingObstacles.Sprite(width - 75, height * 0.75);
}

function mousePressed() {
  if (inRandomGame) {
    if (mouseButton === LEFT) {
      let lastNode;
      if (nodes.length) lastNode = nodes[nodes.length - 1];
      if (!nodes.length || lastNode.x != mouseX || lastNode.y != mouseY) {
        let node = new nodes.Sprite(mouseX, mouseY, 10, "static");
        node.life = 200;
        if (nodes.length > 1 && shouldMakeWall) {
          let coords = [
            [mouseX, mouseY],
            [lastNode.x, lastNode.y],
          ];
          let line = new lines.Sprite(mouseX, mouseY, coords, "static");
          line.life = 200;
        }
        shouldMakeWall = true;
      }
    } else if (mouseButton === RIGHT) {
      shouldMakeWall = false;
    }
  }
}

function mouseDragged() {
  if (inLevelEditor) {
    if (!mouseHeld) {
      typeOfObstacle = 0;
      for (let obstacle of obstacles) {
        if (
          obstacle.x - obstacle.width / 2 < mouseX &&
          obstacle.y - obstacle.height / 2 < mouseY &&
          obstacle.x + obstacle.width / 2 > mouseX &&
          obstacle.y + obstacle.height / 2 > mouseY
        ) {
          dragXAdjust = obstacle.x - mouseX;
          dragYAdjust = obstacle.y - mouseY;
          draggedObstacle = obstacle;
          mouseHeld = true;
          break;
        }
        typeOfObstacle++;
      }
    }
    if (mouseHeld) {
      switch (typeOfObstacle) {
        case 0:
          draggedObstacle = new stationaryObstacles.Sprite(
            width - 75,
            height * 0.25
          );
          typeOfObstacle = 3;
          break;
        case 1:
          draggedObstacle = new movingObstacles.Sprite(
            width - 75,
            height * 0.5
          );
          typeOfObstacle = 3;
          break;
        case 2:
          draggedObstacle = new rotatingObstacles.Sprite(
            width - 75,
            height * 0.75
          );
          typeOfObstacle = 3;
          break;
        case 3:
          break;
      }
      draggedObstacle.x = mouseX + dragXAdjust;
      draggedObstacle.y = mouseY + dragYAdjust;
    }

    // console.log(typeOfObstacle)
    // console.log(obstacles)
  }
}

function mouseReleased() {
  if (inLevelEditor) {
    mouseHeld = false;
    draggedObstacle = null;
  }
}

// window.addEventListener('resize', onWindowResize, false)
//     function onWindowResize() {
//     }

//create a sprite at the mouse position and store it in a temporary variable
// let s;
// if (key === 's') {
//     s = new Sprite(mouseX, mouseY, 30, 30);
// }
// else if (key === 't') {
//     s = new Sprite(mouseX, mouseY, [30, 120, 3]);
// }
// else {
//     return;
// }
//if no image or animation is associated it will be a rectangle of the specified size
//and a random color

//now you can use the variable to set properties
//e.g. a random velocity on the x and y coordinates
// s.rotationSpeed = random(-2, 2);
// s.velocity.x = random(-5, 5);
// s.velocity.y = random(-5, 5);
