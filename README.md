# Cannon
Simulator supporting a user interface for Cannon, an abstract strategy board game.

## Details
This is a course assignment for the graduate-level Artificial Intelligence course taught by [**Prof. Mausam**](http://homes.cs.washington.edu/~mausam).  
The assignment documentation can be found [here](http://www.cse.iitd.ac.in/~mausam/courses/col333/autumn2019/A2/A2.pdf)

### Teaching Assistants
+ [Divyanshu Saxena](https://github.com/DivyanshuSaxena)
+ [Pratyush Maini](https://github.com/pratyush911)
+ [Shashank Goel](https://github.com/goelShashank007)
+ [Vipul Rathore](https://github.com/rathorevipul28)

## Rules
The rules of the original game can be found [here](https://nestorgames.com/rulebooks/CANNON_EN.pdf)

However, we will be having an 8x8 board and 4 Town Halls instead of 1. The position of the Town Halls is fixed. Further instructions are mentioned in the Assignment Document.

## Dependencies
+ Python2.7
+ Chrome Webdriver
+ Jinja2
+ Multiset
+ Numpy
+ Selenium

`pip install -r requirements.txt`

Download the chrome driver executable according to your chrome version from the following link:
https://chromedriver.chromium.org/downloads

You can check you chrome version following the steps below:
- Launch Google Chrome.
- Click on the icon in the upper right corner that looks like 3 short bars.
- Select About Google Chrome to display the version number.

## Main Files
+ `game.py` - This has an instance of the game. It can be run locally to hand play a game of Cannon or re-play a recorded game. Should be run in `GUI` mode to make game board visible.
+ `RandomPlayer.py` - This is an implementation of a random bot. It is a good place to start understanding the flow of the game and the various game states.
+ `client.py` - This will encapsulate your process and help it connect to the game server.
  > `ip` (mandatory) - The Server IP.  
  > `port` (mandatory) - The Server Port.  
  > `exe` (mandatory) - The Executable.  
  > `mode` (optional) - The View Mode ('GUI' / 'CUI'). Default: 'CUI'  
+ `server.py` - This connects the clients and manages the transfer of information.
  > `port` (mandatory) - The Server Port.  
  > `ip` (optional) - The Server IP. Default: 0.0.0.0   
  > `n` (optional) - The Board Size. Default: 8  
  > `NC` (optional) - Number of Clients. Default: 2  
  > `TL` (optional) - Time Limit. Default:150  
  > `LOG` (optional) - The Log File.  

## Run Instructions
Here are the sample instructions used to match two random players against each other over the server network.
### Setup Server
`python server.py 10000 -n 8 -m 8 -NC 2 -TL 150 -LOG server.log`
### Setup Client 1
`export PATH=$PATH:'/home/chrome_driver_directory'`

`python client.py 0.0.0.0 10000 RandomPlayer.py -mode GUI`
### Setup Client 2
`export PATH=$PATH:'/home/chrome_driver_directory'`

`python client.py 0.0.0.0 10000 RandomPlayer.py`

## Gameplay
The game play consists of the players executing a sequence of moves in a single turn.
A move is a triple: `type` `x` `y`.  

### Movetype
+ S - Select a soldier
+ M - Move a soldier
+ B - Throw a Bomb

### Board Settings
The board is an n x m board.
The top-left corner point is the origin.
The horizontal direction towards the right is the positive x-axis.
The vertical direction towards down is the positive y-axis.
The indexing begins with 0 in both the directions.

#### Moving a Soldier
To move a soldier from (1, 2) to (2, 4).

`S 1 2 M 2 4`

#### Throwing a Bomb
To throw a bomb, select any of the soldiers of a cannon, and throw it at any viable target of the cannon(s) formed by that soldier.

`S 2 4 B 6 4`

### Replay
A server.log file is created during the gameplay that consist of the moves played in the game. You can simulate/re-run it using the following command:

`python game.py server.log`

## Scoring
At the end of a game both players will be given a score.

### The Town Hall Margin
This score will be based on the extent of victory. It is calculated as follows:  

|Town Halls Left: A	|Town Halls Left: B	|Town Hall Margin Score: A	|Town Hall Margin Score: B|
| ------------- | ------------- | ------------- | ------------- | 
| 4 | 2 | 10 | 0 |
| 3 | 2 | 8 | 2 |


#### Condition for Stalemate

**Case 1**: Player B has lost all its soldiers and Player A still has moves to play.

|Town Halls Left: A	|Town Halls Left: B	|Town Hall Margin Score: A	|Town Hall Margin Score: B|
| ------------- | ------------- | ------------- | ------------- | 
| 4 |	3 |	10 |	0 |
| 4 |	4 |	8 |	2 |
| 3 |	3 |	8 |	2 |
| 3 |	4 |	6 |	4 |

**Case 2**: Both Players have soldiers left, but Player B has no immediate moves to play

|Town Halls Left: A	|Town Halls Left: B	|Town Hall Margin Score: A	|Town Hall Margin Score: B|
| ------------- | ------------- | ------------- | ------------- | 
| 4 |	3 |	8 |	2 |
| 4 |	4 |	6 |	4 |
| 3 |	3 |	6 |	4 |
| 3 |	4 |	4 |	6 |

#### Timeout or Invalid Move

Note) In case a player suffers a TIMEOUT or INVALID move, he/she will automatically lose the gane and it will count as a (2-*x*) defeat towards the player and a (*x*-2) win for the opponent, where *x* is the number of Town Halls remaining with the opponent.

### The Army Margin
This score directly depends on the number of soldiers you have left at the end of the game. It is calculated as follows:  
`Army Margin Score = # (Soldiers Remaining) / 100`

### Final Score
The final score is simply: `(Town Hall Margin Score).(Army Margin Score)`
Example. Assume the following:  
Player 1 has 3 Town Halls remaining and has 12 soldiers left on the board.  
Player 2 has 2 Town Hall remaining and has 9 soldiers left on the board.  
Player 1 score will be: **8.12**  
Player 2 score will be: **2.09**  


