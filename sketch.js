// IDEAS
// TODOForce the game to have a more horizontal aspect ratio
// make it so rotating objects are always rotating higher than a certain speed (two ranges for randomizing speed)
// moving finish
// group obstacles together
// randomize number of obstacles
// checkpoints
// once Quinton implements the virtual camera, have the finish be offscreen so that player has to travel to it

document.addEventListener("contextmenu", (event) => event.preventDefault());

let player, goal, ball, startCoords, movingObstacle1, movingObstacle2, rotatingObstacle1, rotatingObstacle2, movingXPos;
let staticStart;
let obstacles, lines, nodes;
let shouldMakeWall = false;
let cosValue = 0;
let phaseShift = 1;
let playerShape = 0;

function setup() {
	// createCanvas size is determined by the window size
	createCanvas(window.innerWidth, window.innerHeight);
	new World(0, 9.8);
	
	obstacles = new Group();

	lines = new Group();
	lines.friction = 0;

	nodes = new Group();
	nodes.overlap(allSprites);

	startNewGame();
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
		finishCoords = [random(0.06, 1), random(0.06, 1)];
	}
	player = createSprite(
		window.innerWidth * startCoords[0],
		window.innerHeight * startCoords[1],
		30
	);
	player.shapeColor = 200;

	goal = createSprite(
		window.innerWidth * finishCoords[0],
		window.innerHeight * finishCoords[1],
		30,
		"static"
	);
	goal.shapeColor = "green";
	player.overlap(goal, win);

	obstacles.removeSprites();

	for (let i = 0; i < 6; i++) {
		let xPos = random(
			min(startCoords[0], finishCoords[0]) + 0.05,
			max(startCoords[0], finishCoords[0]) - 0.05
		);
		let yPos = random(0.05, 0.95);
		let coords = [xPos * window.innerWidth, yPos * window.innerHeight];
		
		let obstacle = new Sprite(coords[0], coords[1], 50, 200, "static");
		obstacle.shapeColor = "red";
		obstacle.rotation = random(0, 360);


		obstacles.add(obstacle);
		// if (Math.random() > 0.5) {
			// 	obstacle.shapeColor = "red";
			// }
			// else {
				// 	obstacle.rotationSpeed = random(-10, 10);
				// 	obstacle.shapeColor = "blue";
				// }
	}
	player.overlap(obstacles, reset);
	staticStart = 200;
	movingXPos = random(
		min(startCoords[0], finishCoords[0]) + 0.05,
		max(startCoords[0], finishCoords[0]) - 0.05
	);
	movingObstacle1 = createSprite(window.innerWidth * movingXPos, window.innerHeight * random(0.3, 0.7), 50, 200, "static");
	movingObstacle1.shapeColor = "blue";
	player.overlap(movingObstacle1, reset);
	movingXPos = random(
		min(startCoords[0], finishCoords[0]) + 0.05,
		max(startCoords[0], finishCoords[0]) - 0.05
	);
	movingObstacle2 = createSprite(window.innerWidth * movingXPos, window.innerHeight * random(0.3, 0.7), 50, 200, "static");
	movingObstacle2.shapeColor = "blue";
	player.overlap(movingObstacle2, reset);

	movingXPos = random(
		min(startCoords[0], finishCoords[0]) + 0.05,
		max(startCoords[0], finishCoords[0]) - 0.05
	);
	rotatingObstacle1 = new Sprite(window.innerWidth * movingXPos, window.innerHeight * random(0.3, 0.7), 50, 200, "kinematic");
	rotatingObstacle1.shapeColor = "purple";
	rotatingObstacle1.rotationSpeed = random(-0.5, 0.5);
	player.overlap(rotatingObstacle1, reset);
	movingXPos = random(
		min(startCoords[0], finishCoords[0]) + 0.05,
		max(startCoords[0], finishCoords[0]) - 0.05
	);
	rotatingObstacle2 = new Sprite(window.innerWidth * movingXPos, window.innerHeight * random(0.3, 0.7), 50, 200, "kinematic");
	rotatingObstacle2.shapeColor = "purple";
	rotatingObstacle2.rotationSpeed = random(-0.5, 0.5);
	player.overlap(rotatingObstacle2, reset);
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
				30, 30
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
	player.overlap(obstacles, reset);
	player.overlap(goal, win);
	player.overlap(movingObstacle1, reset);
	player.overlap(movingObstacle2, reset);
	staticStart = 200;
}

function draw() {
	background(220);

	fill(0);

	staticStart--;

	if (staticStart > 0) {
		player.x = startCoords[0] * window.innerWidth;
		player.y = startCoords[1] * window.innerHeight;
		player.speed = 0;
	}

	if (player.y > height) {
		reset();
	}

	movingObstacle1.y = movingObstacle1.y + Math.cos(cosValue) * 5;
	movingObstacle2.y = movingObstacle2.y + Math.cos(cosValue + phaseShift) * 5;
	cosValue += 0.025;
}

function win() {
	console.log("win");
	lines.removeSprites();
	nodes.removeSprites();
	player.remove();
	goal.remove();
	movingObstacle1.remove();
	movingObstacle2.remove();
	rotatingObstacle1.remove();
	rotatingObstacle2.remove();
	playerShape = 0;
	startNewGame();
}

function keyPressed() {
	// if (key === " " && staticStart) {
	// 	staticStart = !staticStart;
	// }
	if (key === "x") {
		playerShape = (playerShape + 1) % 3;
		reset()
	}

	if (key === "z") {
		reset()
	}
}

function mousePressed() {
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
