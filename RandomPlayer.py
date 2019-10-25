
from game import Game
import random
import sys
import time

class RandomPlayer:
	def __init__(self):
		data = sys.stdin.readline().strip().split()
		self.player = int(data[0]) - 1
		self.n = int(data[1])
		self.m = int(data[2])
		self.time_left = int(data[3])
		self.game = Game(self.n, self.m)
		self.play()

	def selectSoldier(self):
		type = 'S'
		valid_soldiers = self.game.getValidSoldiers()
		i = random.randint(0, len(valid_soldiers) - 1)
		x, y = valid_soldiers[i]['x'], valid_soldiers[i]['y']
		return '{type} {x} {y}'.format(type = type, x = x, y = y), type, x, y

	def moveSoldier(self):
		type = 'M'
		valid_moves = self.game.getValidMoves()
		if(len(valid_moves) == 0):
			return -1, -1, -1, -1
		i = random.randint(0, len(valid_moves) - 1)
		x, y = valid_moves[i]['x'], valid_moves[i]['y']
		return '{type} {x} {y}'.format(type = type, x = x, y = y), type, x, y

	def throwBomb(self):
		type = 'B'
		valid_targets = self.game.getValidTargets()
		if(len(valid_targets) == 0):
			return -1, -1, -1, -1
		i = random.randint(0, len(valid_targets) - 1)
		x, y = valid_targets[i]['x'], valid_targets[i]['y']
		return '{type} {x} {y}'.format(type = type, x = x, y = y), type, x, y

	def play_move_seq(self, move_sequence):
		moves = ' '.join(move_sequence) + '\n'
		sys.stdout.write(moves)
		sys.stdout.flush()

	def play(self):
		if(self.player == 1):
			move = sys.stdin.readline().strip()
			self.game.execute_move(move)
		while(1):
			move_sequence = []
			while(1):
				state = self.game.check_player_state()

				if(state == 0):
					move, type, x, y = self.selectSoldier()
					success = self.game.execute_move(move)
					if(success != 0):
						move_sequence.append(move)
						state = 1

				if(state == 1):
					while(1):
						r = random.randint(0, 6)
						if(r < 6):
							move, type, x, y = self.moveSoldier()
						else:
							move, type, x, y = self.throwBomb()
						if(move != -1):
							break

					success = self.game.execute_move(move)
					if(success != 0):
						move_sequence.append(move)
						break

			self.play_move_seq(move_sequence)

			move = sys.stdin.readline().strip()
			self.game.execute_move(move)

random_player = RandomPlayer()
