// TODO IDEAS
// moving finish
// checkpoints
// once Quinton implements the virtual camera, have the finish be offscreen so that player has to travel to it

// * EDITOR
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



let phaseShift = 1;
let playerShape = 0;

let mouseHeld = false;
let draggedObstacle;
let dragXAdjust = 0;
let dragYAdjust = 0;
let typeOfObstacle = null;

let onMainMenu = true;
let inLevelEditor = false;
let inGame = false;

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
	new World(0, 9.8);

	obstacles = new Group();

	stationaryObstacles = obstacles.subGroup();
	stationaryObstacles.collider = "static";
	stationaryObstacles.shapeColor = "red";
	stationaryObstacles.width = width * 0.02;
	stationaryObstacles.height = height * 0.12;

	movingObstacles = obstacles.subGroup();
	movingObstacles.collider = "static";
	movingObstacles.shapeColor = "blue";
	movingObstacles.width = width * 0.02;
	movingObstacles.height = height * 0.12;

	rotatingObstacles = obstacles.subGroup();
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
	player = createSprite(
		width * startCoords[0],
		height * startCoords[1],
		width * 0.02
	);
	player.shapeColor = 200;

	goal = createSprite(
		width * finishCoords[0],
		height * finishCoords[1],
		width * 0.02,
		"static"
	);
	goal.shapeColor = "green";
	player.overlap(goal, win);
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
	player = createSprite(width * startCoords[0], height * startCoords[1], 30);
	player.shapeColor = 200;

	goal = createSprite(
		width * finishCoords[0],
		height * finishCoords[1],
		30,
		"static"
	);
	goal.shapeColor = "green";
	player.overlap(goal, win);

	stationaryObstacles.removeSprites();

	for (let i = 0; i < randInt(5, 7); i++) {
		let xPos = random(
			min(startCoords[0], finishCoords[0]) + 0.05,
			max(startCoords[0], finishCoords[0]) - 0.05
		);
		let yPos = random(0.05, 0.95);
		let coords = [xPos * width, yPos * height];

		let obstacle = stationaryObstacles.sprite(coords[0], coords[1]);
		obstacle.shapeColor = "red";
		obstacle.rotation = random(0, 360);
	}

	player.overlap(stationaryObstacles, reset);

	// Trying to group moving obstacles together
	for (let i = 0; i < 2; i++) {
		staticStart = 200;
		movingXPos = random(
			min(startCoords[0], finishCoords[0]) + 0.05,
			max(startCoords[0], finishCoords[0]) - 0.05
		);
		let movingObstacle = movingObstacles.sprite(
			width * movingXPos,
			height * random(0.3, 0.7)
		);
		movingObstacle.range = random(4, 8);
		movingObstacle.initAngle = random(0, 360);
	}

	for (let i = 0; i < randInt(1, 2); i++) {
		movingXPos = random(
			min(startCoords[0], finishCoords[0]) + 0.05,
			max(startCoords[0], finishCoords[0]) - 0.05
		);
		let rotatingObstacle = rotatingObstacles.sprite(
			width * movingXPos,
			height * random(0.3, 0.7)
		);
		rotatingObstacle.rotationSpeed = Math.sign(random(-0.1, 0.1))*random(0.5, 1);
	}
}

function reset() {
	console.log("reset");
	lines.removeSprites();
	nodes.removeSprites();
	player.remove();
	switch (playerShape) {
		case 0:
			player = createSprite(
				window.innerWidth * startCoords[0],
				window.innerHeight * startCoords[1],
				30
			);
			break;
		case 1:
			player = createSprite(
				window.innerWidth * startCoords[0],
				window.innerHeight * startCoords[1],
				30,
				30
			);
			break;
		case 2:
			player = createSprite(
				window.innerWidth * startCoords[0],
				window.innerHeight * startCoords[1],
				[30, 120, 3]
			);
			break;
	}
	player.shapeColor = 200;
	player.overlap(stationaryObstacles, reset);
	player.overlap(rotatingObstacles, reset);
	player.overlap(goal, win);
	player.overlap(movingObstacles, reset);
	staticStart = 200;
}

function draw() {
	background(220);
	fill(0);
	if (onMainMenu) {
		textAlign(CENTER, CENTER);

		let x = width / 2;
		let y = height / 2;
		textSize(36);
		text("Draw the Line", x, y - 100);
		textSize(24);
		text("Space: Play Endless Mode", x, y);
		text("E: Open Level Editor", x, y + 30);
	}
	if (inGame) {
		staticStart--;

		if (staticStart > 0) {
			player.x = startCoords[0] * window.innerWidth;
			player.y = startCoords[1] * window.innerHeight;
			player.speed = 0;
		}

		if (player.y > height) {
			reset();
		}

		for (let movingObstacle of movingObstacles) {
			movingObstacle.y +=
				Math.cos(movingObstacle.initAngle) * movingObstacle.range;
			movingObstacle.initAngle += 0.025;
		}
	}
	if (inLevelEditor) {
		makePanel();
		// TODO make able to release player (ie if-statement here)
		player.x = startCoords[0] * window.innerWidth;
		player.y = startCoords[1] * window.innerHeight;
		player.speed = 0;
	}

}

function win() {
	console.log("win");
	lines.removeSprites();
	nodes.removeSprites();
	player.remove();
	goal.remove();
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

	if (key === "z") {
		reset();
	}

	if (key === "e") {
		inLevelEditor = true;
		if (onMainMenu) startLevelEditor();
		onMainMenu = false;
	}

	if (key === " " && !inGame) {
		onMainMenu = false;
		inGame = true;
		startNewGame();
	}
}

function startLevelEditor() {
	placePlayerAndGoal();

	stationaryObstacles.sprite(width - 75, height * 0.25);
	movingObstacles.sprite(width - 75, height * 0.5);
	rotatingObstacles.sprite(width - 75, height * 0.75);
}

function mousePressed() {
	if (inGame) {
		if (mouseButton === LEFT) {
			let lastNode;
			if (nodes.length) lastNode = nodes[nodes.length - 1];

			if (!nodes.length || lastNode.x != mouseX || lastNode.y != mouseY) {
				let node = nodes.sprite(mouseX, mouseY, 10, "static");
				node.life = 200;

				if (nodes.length > 1 && shouldMakeWall) {
					let coords = [
						[mouseX, mouseY],
						[lastNode.x, lastNode.y],
					];
					let line = lines.sprite(mouseX, mouseY, coords, "static");
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
				if (obstacle.x - obstacle.width / 2 < mouseX && obstacle.y - obstacle.height / 2 < mouseY && obstacle.x + obstacle.width / 2 > mouseX && obstacle.y + obstacle.height / 2 > mouseY ) {
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
			switch(typeOfObstacle) {
				case 0:
					draggedObstacle = stationaryObstacles.sprite(width - 75, height * 0.25);
					typeOfObstacle = 3;
					break;
				case 1:
					draggedObstacle = movingObstacles.sprite(width - 75, height * 0.5);
					typeOfObstacle = 3;
					break;
				case 2:
					draggedObstacle = rotatingObstacles.sprite(width - 75, height * 0.75);
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
//     s = createSprite(mouseX, mouseY, 30, 30);
// }
// else if (key === 't') {
//     s = createSprite(mouseX, mouseY, [30, 120, 3]);
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
