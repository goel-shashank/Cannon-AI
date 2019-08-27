# Cannon
Simulator supporting a user interface for Cannon, an abstract strategy board game.

## Details
This is a course assignment for the graduate-level Artificial Intelligence course taught by [**Prof. Mausam**](http://homes.cs.washington.edu/~mausam).  
The assignment documentation can be found [here]()

### Teaching Assistants
+ [Divyanshu Saxena](https://github.com/DivyanshuSaxena)
+ [Pratyush Maini](https://github.com/pratyush911)
+ [Shashank Goel](https://github.com/goelShashank007)
+ [Vipul Rathore](https://github.com/rathorevipul28)

## Rules
The rules of the game can be found [here](https://nestorgames.com/rulebooks/CANNON_EN.pdf)
We will be having three TownHalls instead of 1 and that too fixed in position.

## Dependencies
+ Python2.7
+ Chrome Webdriver
+ Jinja2
+ Multiset
+ Numpy
+ Selenium

`pip install -r requirements.txt`

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
  > `n` (optional) - The Board Size. Default: 10  
  > `NC` (optional) - Number of Clients. Default: 2  
  > `TL` (optional) - Time Limit. Default:150  
  > `LOG` (optional) - The Log File.  

## Run Instructions
Here are the sample instructions used to match two random players against each other over the server network.
### Setup Server
`python server.py 10000 -n 10 -NC 2 -TL 150 -LOG server.log`
### Setup Client 1
`export PATH=$PATH:'/home/chrome_driver_directory`
`python client.py 0.0.0.0 10000 RandomPlayer.py -mode GUI`
### Setup Client 2
`export PATH=$PATH:'/home/chrome_driver_directory`
`python client.py 0.0.0.0 10000 RandomPlayer.py`

## Gameplay
The game play consists of the players executing a sequence of moves in a single turn.
A move is a triple: `type` `x` `y`.  

### Movetype
+ S - Select a soldier
+ M - Move a soldier
+ B - Throw a Bomb

### Board Settings
The board is an n x n board.
The top-left corner point is the origin.
The horizontal direction towards the right is the positive x-axis.
The vertical direction towards up is the positive y-axis.

#### Moving a Soldier
To move a soldier from (1, 2) to (2, 4)
`S 1 2 M 2 4`

#### Throwing a Bomb
To throw a bomb, select any of the soldiers of a cannon, and throw it at any viable target of the cannon(s) formed by that soldier.
`S 2 4 B 6 4`

## Scoring
At the end of a game both players will be given a score.

### The Town Hall Margin
This score will be based on the extent of victory. It is calculated as follows:  

| Your Town Halls Remaining | Opponent's Town Halls Remaining | Town Hall Margin Score |  
| ------------- | ------------- | ------------- |
| 3 | 0 | 10 |  
| 3 | 1 | 9 |  
| 3 | 2 | 8 |  
| 2 | 0 | 7 |  
| 2 | 1 | 6 |  
| 1 | 0 | 6 |  
| 3 | 3 | 5 |  
| 2 | 2 | 5 |  
| 1 | 1 | 5 |  
| 0 | 1 | 4 |  
| 1 | 2 | 4 |  
| 0 | 2 | 3 |  
| 2 | 3 | 2 |  
| 1 | 3 | 1 |  
| 0 | 3 | 0 |  

### The Army Margin
This score directly depends on the number of soldiers you have left at the end of the game. It is calculated as follows:  
`Army Margin Score = # (Soldiers Remaining) / 100`

### Final Score
The final score is simply: `(Town Hall Margin Score).(Army Margin Score)`
Example. Assume the following:  
Player 1 has 3 Town Halls remaining and has 12 soldiers left on the board.  
Player 2 has 1 Town Hall remaining and has 11 soldiers left on the board.  
Player 1 score will be: **9.12**  
Player 2 score will be: **1.11**  

Note) In case a player suffers a TIMEOUT or INVALID move, he/she will automatically lose the gane and it will count as a (*x*-3) defeat towards the player and a (3-*x*) win for the opponent, where *x* is the number of Town Halls remaining with the player.
