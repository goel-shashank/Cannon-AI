var rows = parseInt(document.currentScript.getAttribute('rows'));
var size = parseInt(document.currentScript.getAttribute('size'));
var townspace = parseInt(document.currentScript.getAttribute('townspace'));
var contingent = parseInt(document.currentScript.getAttribute('contingent'));

var dimension = [size, size];

var game_canvas = document.getElementById('GameBoard');
game_canvas.width = dimension[1];
game_canvas.height = dimension[1];
var game_ctx = game_canvas.getContext('2d');

var piece_canvas = document.getElementById('PieceLayer');
piece_canvas.width = dimension[1];
piece_canvas.height = dimension[1];
var piece_ctx = piece_canvas.getContext('2d');

var guide_canvas = document.getElementById('GuideLayer');
guide_canvas.width = dimension[1];
guide_canvas.height = dimension[1];
var guide_ctx = guide_canvas.getContext('2d');

var test_canvas = document.getElementById('TestLayer');
test_canvas.width = dimension[1];
test_canvas.height = dimension[1];
var test_ctx = test_canvas.getContext('2d');

game_ctx.fillStyle = "#ffffff";
game_ctx.fillRect(0, 0, game_canvas.width, game_canvas.height);

var centerx = game_canvas.width / 2;
var centery = game_canvas.width / 2;

var spacing = game_canvas.height / rows;

var current_player = 0;

var player = new Array(2);
player[0] = {townhalls: 4, color: "#000000", current_soldier: [-1,-1], soldiers: []};
player[1] = {townhalls: 4, color: "#ffffff", current_soldier: [-1,-1], soldiers: []};

var is_valid = 0;
var required_move = 0;

function SwitchPlayer()
{
		current_player = 1 - current_player;
}

function Pair(x, y)
{
		this.x = x;
		this.y = y;
}

function Point(x, y)
{
	  this.x = x;
	  this.y = y;
	  this.piece = 0;
	  this.guide = 0;
}

var guides_move = [];
var guides_bomb = [];

var positions = new Array(rows);
for (var i = 0; i < rows; i++)
{
  	positions[i] = new Array(rows);
}

var corners = new Array(rows + 1);
for (var i = 0; i < rows + 1; i++)
{
  	corners[i] = new Array(rows + 1);
}

function PlotPoints()
{
		for (var i = 0; i < rows; i++)
		{
				for (var j = 0; j < rows; j++)
				{
						var x = i - rows / 2;
						var y = j - rows / 2;

						positions[i][j] = new Point(centerx + spacing * x + spacing / 2, centery + spacing * y + spacing / 2);
						positions[i][j].valid = true;
				}
		}
}

function PlotCorners()
{
		for (var i = 0; i < rows + 1; i++)
		{
				for (var j = 0; j < rows + 1; j++)
				{
						var x = i - rows / 2;
						var y = j - rows / 2;

						corners[i][j] = new Point(centerx + spacing * x, centery + spacing * y);
						corners[i][j].valid = false;
				}
		}
}

function FillBoardSquares()
{
		for(var i = 0; i < rows; i++)
		{
				for(var j = 0; j < rows; j++)
				{
						if((i + j) % 2)
								game_ctx.fillStyle = "#505050";
						else
								game_ctx.fillStyle = "#B0B0B0";

						game_ctx.fillRect(corners[i][j].x, corners[i][j].y, spacing, spacing);
				}
		}
}

function PlaceSoldiers()
{
		var places = new Array(2);

		places[0] = new Array(contingent);
		for(var i = 0; i < contingent; i++)
				places[0][i] = (rows - 1) - i;

		places[1] = new Array(contingent);
		for(var i = 0; i < contingent; i++)
				places[1][i] = i;

		for(var i = 0; i < rows; i++)
		{
				for(var j = 0; j < contingent; j++)
				{
						piece_ctx.beginPath();
						piece_ctx.strokeStyle = player[i % 2].color;
						piece_ctx.lineWidth = 5;
						piece_ctx.arc(positions[i][places[i % 2][j]].x, positions[i][places[i % 2][j]].y, spacing / 3.0, 0, 2 * Math.PI);
						piece_ctx.stroke();
						piece_ctx.lineWidth = 1;

						positions[i][places[i % 2][j]].piece = Math.pow(-1, i % 2);
						var pair = new Pair(i, places[i % 2][j]);
						player[i % 2].soldiers.push(pair);
				}
		}
}

function PlaceTownHalls()
{
		piece_ctx.fillStyle = player[0].color;
		for(var i = 0; i < 4; i++)
		{
				piece_ctx.fillRect(corners[i * townspace + 1][rows - 1].x + 10, corners[i * townspace + 1][rows - 1].y + 10, spacing - 20, spacing - 20);
				positions[i * townspace + 1][rows - 1].piece = 2;
		}

		piece_ctx.fillStyle = player[1].color;
		for(var i = 0; i < 4; i++)
		{
				piece_ctx.fillRect(corners[rows - 2 - i * townspace][0].x + 10, corners[rows - 2 - i * townspace][0].y + 10, spacing - 20, spacing - 20);
				positions[rows - 2 - i * townspace][0].piece = -2;
		}
}

PlotPoints();
PlotCorners();
FillBoardSquares();
PlaceSoldiers();
PlaceTownHalls();

function isInBoard(x, y)
{
			if(x >= 0 && x <= (rows - 1) && y >= 0 && y <= (rows - 1))
					return true;
			return false;
}

function SelectSoldier(x, y)
{
		if(positions[x][y].piece == Math.pow(-1, current_player))
		{
				guides_move = [];
				guides_bomb = [];
				var executable = Guides(x, y, true);

				if(executable == 0)
						return false;

				required_move = 1;
				player[current_player].current_soldier = [x, y];

				guide_ctx.beginPath();
				guide_ctx.strokeStyle = "black";
				guide_ctx.arc(positions[x][y].x, positions[x][y].y, spacing * 3 / 10, 0, Math.PI * 2);
				var grd = guide_ctx.createRadialGradient(positions[x][y].x, positions[x][y].y, spacing * 3 / 20, positions[x][y].x, positions[x][y].y, spacing * 3 / 10);
				grd.addColorStop(0, player[current_player].color);
				grd.addColorStop(1, "#444444");
				guide_ctx.fillStyle = grd;
				guide_ctx.fill();
				guide_ctx.stroke();

	      return true;
		}
		else
		{
				return false;
	  }
}

function DeSelectSoldier()
{
		var p = corners[player[current_player].current_soldier[0]][player[current_player].current_soldier[1]];
		guide_ctx.clearRect(p.x, p.y, spacing, spacing);
		Guides(player[current_player].current_soldier[0], player[current_player].current_soldier[1], false);

		required_move = 0;
}

function sign(i)
{
		if(i > 0)
				return 1;
		if(i == 0)
				return 0;
		if(i < 0)
				return -1;
}

function Guides(x, y, guide)
{
		var executable = 0;

		var b;
		var s;
		var check;
		var tx, ty;

		var dx, dy;
		var cdx, cdy;
		var adjx, adjy;
		var bombx, bomby;
		var soldierx, soldiery;

		direction = 1 - current_player * 2;

		// Forward
		b = [1, 1, 1, 0, 0];
		dx = [-1, 0, 1, -1, 1];
		dy = [-1, -1, -1, 0, 0];
		for (var i = 0; i < dx.length; i++)
		{
				tx = x + dx[i];
				ty = y + dy[i] * direction;

				if(!isInBoard(tx, ty) || (sign(positions[tx][ty].piece) == Math.pow(-1, current_player)) || (b[i] == 0 && sign(positions[tx][ty].piece) != Math.pow(-1, current_player + 1)))
						continue;

				if(guide)
				{
						guide_ctx.beginPath();
						guide_ctx.strokeStyle = "#35230a";
						guide_ctx.arc(positions[tx][ty].x, positions[tx][ty].y, spacing / 8, 0, Math.PI * 2);
						guide_ctx.fillStyle = "#35230a";
						guide_ctx.fill();
						guide_ctx.stroke();
						positions[tx][ty].guide = 1;
						var pair = new Pair(tx, ty);
						guides_move.push(pair);
				}
				else
				{
						guide_ctx.clearRect(corners[tx][ty].x, corners[tx][ty].y, spacing, spacing);
						positions[tx][ty].guide = 0;
				}
				executable = 1;
		}

		// Backward
		check = 0;
		adjx = [-1, -1, 0, 1, 1];
		adjy = [0, -1, -1, -1, 0];
		for(var i = 0; i < adjx.length && check == 0; i++)
		{
				tx = x + adjx[i];
				ty = y + adjy[i] * direction;

				if(isInBoard(tx, ty) && positions[tx][ty].piece == Math.pow(-1, current_player + 1))
						check = 1;
		}
		dx = [-1, 0, 1];
		dy = [2, 2, 2];

		if(check)
		{
				for (var i = 0; i < dx.length; i++)
				{
						tx = x + dx[i];
						ty = y + dy[i] * direction;

						if(!isInBoard(tx, ty) || sign(positions[tx][ty].piece) == Math.pow(-1, current_player))
								continue;

						if(guide)
						{
								guide_ctx.beginPath();
								guide_ctx.strokeStyle = "#35230a";
								guide_ctx.arc(positions[tx][ty].x, positions[tx][ty].y, spacing / 8, 0, Math.PI * 2);
								guide_ctx.fillStyle = "#35230a";
								guide_ctx.fill();
								guide_ctx.stroke();
								positions[tx][ty].guide = 1;
								var pair = new Pair(tx, ty);
								guides_move.push(pair);
						}
						else
						{
								guide_ctx.clearRect(corners[tx][ty].x, corners[tx][ty].y, spacing, spacing);
								positions[tx][ty].guide = 0;
						}
						executable = 1;
				}
		}

		// Cannon
		dx = [[[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]], [[-3, -2, 4, 5], [-4, -3, 3, 4], [-5, -4, 2, 3]], [[-3, -2, 4, 5], [-4, -3, 3, 4], [-5, -4, 2, 3]], [[-3, -2, 4, 5], [-4, -3, 3, 4], [-5, -4, 2, 3]]];
		dy = [[[-3, -2, 4, 5], [-4, -3, 3, 4], [-5, -4, 2, 3]], [[-3, -2, 4, 5], [-4, -3, 3, 4], [-5, -4, 2, 3]], [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]], [[3, 2, -4, -5], [4, 3, -3, -4], [5, 4, -2, -3]]];
		valid_dx = [[[0, 0], [0, 0], [0, 0]], [[-1, 3], [-2, 2], [-3, 1]], [[-1, 3], [-2, 2], [-3, 1]], [[-1, 3], [-2, 2], [-3, 1]]];
		valid_dy = [[[-1, 3], [-2, 2], [-3, 1]], [[-1, 3], [-2, 2], [-3, 1]], [[0, 0], [0, 0], [0, 0]], [[1, -3], [2, -2], [3, -1]]];
		cdx = [[[0], [], [0]], [[3], [], [-3]], [[3], [], [-3]], [[3], [], [-3]]];
		cdy = [[[3], [], [-3]], [[3], [], [-3]], [[0], [], [0]], [[-3], [], [3]]];
		soldierx = [[[0, 0], [0, 0], [0, 0]], [[1, 2], [-1, 1], [-2, -1]], [[1, 2], [-1, 1], [-2, -1]], [[1, 2], [-1, 1], [-2, -1]]];
		soldiery = [[[1, 2], [-1, 1], [-2, -1]], [[1, 2], [-1, 1], [-2, -1]], [[0, 0], [0, 0], [0, 0]], [[-1, -2], [1, -1], [2, 1]]];

		for(var i = 0; i < dx.length; i++)
		{
				for(var j = 0; j < dx[0].length; j++)
				{
						check = 1;

						s = [[x + valid_dx[i][j][0], y + valid_dy[i][j][0] * direction], [x + valid_dx[i][j][1], y + valid_dy[i][j][1] * direction]];
						if((isInBoard(s[0][0], s[0][1]) && (positions[s[0][0]][s[0][1]].piece == 0)) || (isInBoard(s[1][0], s[1][1]) && (positions[s[1][0]][s[1][1]].piece == 0)))
						{
								for(var k = 0; k < soldierx[0][0].length; k++)
								{
										tx = x + soldierx[i][j][k];
										ty = y + soldiery[i][j][k] * direction;

										if(!isInBoard(tx, ty) || positions[tx][ty].piece != Math.pow(-1, current_player))
												check = 0;
								}

								if(check)
								{
										for(var k = 0; k < dx[0][0].length; k++)
										{
												if((isInBoard(s[Math.floor(k / 2)][0], s[Math.floor(k / 2)][1]) && (positions[s[Math.floor(k / 2)][0]][s[Math.floor(k / 2)][1]].piece == 0)))
												{
														tx = x + dx[i][j][k];
														ty = y + dy[i][j][k] * direction;

														if(isInBoard(tx, ty) && sign(positions[tx][ty].piece) != Math.pow(-1, current_player))
														{
																if(guide)
																{
																		guide_ctx.beginPath();
																		guide_ctx.strokeStyle = "#8b0000";
																		guide_ctx.arc(positions[tx][ty].x, positions[tx][ty].y, spacing / 8, 0, Math.PI * 2);
																		guide_ctx.fillStyle = "#8b0000";
																		guide_ctx.fill();
																		guide_ctx.stroke();
																		positions[tx][ty].guide = 2;
																		var pair = new Pair(tx, ty);
																		guides_bomb.push(pair);
																}
																else
																{
																		guide_ctx.clearRect(corners[tx][ty].x, corners[tx][ty].y, spacing, spacing);
																		positions[tx][ty].guide = 0;
																}
																executable = 1;
														}
												}
										}

										for(var k = 0; k < cdx[0][0].length; k++)
										{
												tx = x + cdx[i][j][k];
												ty = y + cdy[i][j][k] * direction;

												if(!isInBoard(tx, ty) || sign(positions[tx][ty].piece) == Math.pow(-1, current_player))
														continue;

												if(guide)
												{
														guide_ctx.beginPath();
														guide_ctx.strokeStyle = "#35230a";
														guide_ctx.arc(positions[tx][ty].x, positions[tx][ty].y, spacing / 8, 0, Math.PI * 2);
														guide_ctx.fillStyle = "#35230a";
														guide_ctx.fill();
														guide_ctx.stroke();
														positions[tx][ty].guide = 1;
														var pair = new Pair(tx, ty);
														guides_move.push(pair);
												}
												else
												{
														guide_ctx.clearRect(corners[tx][ty].x, corners[tx][ty].y, spacing, spacing);
														positions[tx][ty].guide = 0;
												}

												executable = 1;
										}
								}
						}
				}
		}

		return executable;
}

function MoveSoldier(x, y)
{
		if(positions[x][y].guide == 1)
		{
				required_move = 0;

				var p = corners[player[current_player].current_soldier[0]][player[current_player].current_soldier[1]];
				guide_ctx.clearRect(p.x, p.y, spacing, spacing);
				piece_ctx.clearRect(p.x, p.y, spacing, spacing);
				positions[player[current_player].current_soldier[0]][player[current_player].current_soldier[1]].piece = 0;
				Guides(player[current_player].current_soldier[0], player[current_player].current_soldier[1], false);

				if(positions[x][y].piece == Math.pow(-1, current_player + 1) * 2)
				{
						player[1 - current_player]['townhalls'] -= 1;
						if(player[1 - current_player]['townhalls'] == 2)
								required_move = 2;
				}
				else if(positions[x][y].piece == Math.pow(-1, current_player + 1))
				{
						for(var i = 0; i < player[1 - current_player].soldiers.length; i++)
						{
								if(x == player[1 - current_player].soldiers[i].x && y == player[1 - current_player].soldiers[i].y)
								{
										player[1 - current_player].soldiers.splice(i, 1);
										break;
								}
						}
				}

				positions[x][y].piece = Math.pow(-1, current_player);
				piece_ctx.clearRect(corners[x][y].x, corners[x][y].y, spacing, spacing);
				piece_ctx.beginPath();
				piece_ctx.strokeStyle = player[current_player].color;
				piece_ctx.lineWidth = 5;
				piece_ctx.arc(positions[x][y].x, positions[x][y].y, spacing / 3.0, 0, 2 * Math.PI);
				piece_ctx.stroke();
				piece_ctx.lineWidth = 1;

				for(var i = 0; i < player[current_player].soldiers.length; i++)
				{
						if(player[current_player].current_soldier[0] == player[current_player].soldiers[i].x && player[current_player].current_soldier[1] == player[current_player].soldiers[i].y)
						{
							 	player[current_player].soldiers[i].x = x;
								player[current_player].soldiers[i].y = y;
								break;
						}
				}

				SwitchPlayer();
				check_end();
				return true;
		}
		else
		{
				return false;
		}
}

function ThrowBomb(x, y)
{
		if(positions[x][y].guide == 2)
		{
				required_move = 0;

				var p = corners[player[current_player].current_soldier[0]][player[current_player].current_soldier[1]];
				guide_ctx.clearRect(p.x, p.y, spacing, spacing);
				Guides(player[current_player].current_soldier[0], player[current_player].current_soldier[1], false);

				if(positions[x][y].piece == Math.pow(-1, current_player + 1) * 2)
				{
						player[1 - current_player]['townhalls'] -= 1;
						if(player[1 - current_player]['townhalls'] == 2)
								required_move = 2;
				}
				else if(positions[x][y].piece == Math.pow(-1, current_player + 1))
				{
						for(var i = 0; i < player[1 - current_player].soldiers.length; i++)
						{
								if(x == player[1 - current_player].soldiers[i].x && y == player[1 - current_player].soldiers[i].y)
								{
										player[1 - current_player].soldiers.splice(i, 1);
										break;
								}
						}
				}

				positions[x][y].piece = 0;
				piece_ctx.clearRect(corners[x][y].x, corners[x][y].y, spacing, spacing);

				SwitchPlayer();
				check_end();
				return true;
		}
		else
		{
				return false;
		}
}

function check_end()
{
		// for(var i = 0; i < player[current_player].soldiers.length; i++)
		// {
		// 		var x = player[current_player].soldiers[i].x;
		// 		var y = player[current_player].soldiers[i].y;
		//
		// 		SelectSoldier(x, y);
		// 		DeSelectSoldier();
		// 		if(guides_move.length != 0 || guides_bomb.length != 0)
		// 				return;
		// }
		// required_move = 2;
		return;
}

var startX = null;
var startY = null;
function IsClickValid(mouse)
{
		for(var i = 0; i < rows; i++)
		{
				for(var j = 0; j < rows; j++)
				{
						if(positions[i][j].x - spacing / 2 < mouse.x && positions[i][j].x + spacing / 2 > mouse.x && positions[i][j].y - spacing / 2 < mouse.y && positions[i][j].y + spacing / 2 > mouse.y)
						{
              	valid = false;
								if(positions[i][j].piece == 1 - 2 * current_player)
								{
										if(required_move == 1)
												valid = DeSelectSoldier();
										valid = SelectSoldier(i, j);
								}
								if(positions[i][j].guide == 1)
								{
										valid = MoveSoldier(i, j);
								}
								if(positions[i][j].guide == 2)
								{
										valid = ThrowBomb(i, j);
								}
								is_valid = valid;
						}
				}
		}
}

function getCanvasMousePosition (event)
{
  	var rect = piece_canvas.getBoundingClientRect();
  	return {x: event.clientX - rect.left, y: event.clientY - rect.top}
}

document.addEventListener('click', function(event)
{
    lastDownTarget = event.target;
    if(lastDownTarget == piece_canvas || lastDownTarget == guide_canvas || lastDownTarget == game_canvas)
		{
    		var canvasMousePosition = getCanvasMousePosition(event);
    		IsClickValid(canvasMousePosition);
    }
}, false);
