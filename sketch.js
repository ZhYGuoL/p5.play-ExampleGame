// IDEAS
// Force the game to have a more horizontal aspect ratio
// rotating obstacles
// moving obstacles
// moving finish
// checkpoints
// once Quinton implements the virtual camera, have the finish be offscreen so that player has to travel to it
// polygon player objects

document.addEventListener("contextmenu", (event) => event.preventDefault());

let player, goal, ball;
let staticStart;
let staticObstacles, spinningObstacles, lines, nodes;
let shouldMakeWall = false;

function setup() {
	// createCanvas size is determined by the window size
	createCanvas(window.innerWidth, window.innerHeight);
	new World(0, 9.8);
	
	staticObstacles = new Group();
	spinningObstacles = new Group();

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
		console.log("finding new finish coords: " + startCoords);
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

	staticObstacles.removeSprites();
	spinningObstacles.removeSprites();
	for (let i = 0; i < 10; i++) {
		console.log(i);
		let xPos = random(
			min(startCoords[0], finishCoords[0]) + 0.05,
			max(startCoords[0], finishCoords[0]) - 0.05
		);
		let yPos = random(
			min(startCoords[1], finishCoords[1]) + 0.05,
			max(startCoords[1], finishCoords[1]) - 0.05
		);
		let coords = [xPos * window.innerWidth, yPos * window.innerHeight];
		
		
		if (Math.random > 0.5) {
			let obstacle = staticObstacles.sprite(coords[0], coords[1], 50, 200, "static");
			obstacle.shapeColor = "red";
		}
		else {
			let obstacle = spinningObstacles.sprite(coords[0], coords[1], 50, 200, "static");
			obstacle.rotationSpeed = random(-10, 10);
			obstacle.shapeColor = "blue";
		}
	}
	player.overlap(staticObstacles, reset);
	staticStart = 200;
}

function reset() {
	console.log("reset");
	lines.removeSprites();
	nodes.removeSprites();
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
}

function win() {
	console.log("win");
	lines.removeSprites();
	nodes.removeSprites();
	player.remove();
	goal.remove();
	startNewGame();
}

function keyPressed() {
	if (key === " " && staticStart) {
		staticStart = !staticStart;
	}
	if (key === "z") {
		nodes.removeSprites();
		lines.removeSprites();
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
