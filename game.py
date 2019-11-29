from __future__ import print_function

import os
import sys
import time
import copy
import json
import math
import numpy as np

from multiset import Multiset
from selenium import webdriver
from jinja2 import Environment, FileSystemLoader
from selenium.webdriver.chrome.options import Options

display = {8: 600, 10: 750}

PATH = os.path.dirname(os.path.abspath(__file__))
TEMPLATE_ENVIRONMENT = Environment(autoescape = False, loader = FileSystemLoader(os.path.join(PATH, 'templates')), trim_blocks = False)

def render_template(template_filename, context):
	return TEMPLATE_ENVIRONMENT.get_template(template_filename).render(context)

def create_index_html(rows, cols, height, width):
	fname = "Cannon.html"
	context = {
		'rows': rows,
		'cols': cols,
		'height': height,
		'width': width
	}
	with open(fname, 'w') as f:
		html = render_template('index.html', context)
		f.write(html)

class Game:
	def __init__(self, n, m, mode = 'CUI', time = 120):
		if(n in display and m in display):
			self.rows = int(n)
			self.cols = int(m)
			self.height = display[n]
			self.width = display[m]
		else:
			raise AssertionError("Board dimensions should be 8 or 10")

		# setup Driver
		create_index_html(self.rows, self.cols, self.height, self.width)

		options = Options()
		options.add_argument("--disable-infobars")
		if(mode != 'GUI'):
			options.add_argument('headless')
		self.driver = webdriver.Chrome(options = options)

		abs_path = os.path.abspath('Cannon.html')
		self.driver.get("file:" + abs_path)
		self.driver.set_window_size(width = self.width + 10, height = self.height + 132.5)

		self.timer = time
		self.townhalls = self.cols // 2
		self.spacing = float(self.height) / self.rows

	def click_at(self, x, y) :
		e = self.driver.find_elements_by_id('PieceLayer')
		action = webdriver.common.action_chains.ActionChains(self.driver)
		action.move_to_element_with_offset(e[0], x * self.spacing + self.spacing / 2, y * self.spacing + self.spacing / 2)
		action.click()
		action.perform()

	def check_move_validity(self):
		return self.driver.execute_script('return is_valid;')

	def check_player_state(self):
		return self.driver.execute_script('return required_move;')

	def get_current_player(self):
		return self.driver.execute_script('return current_player;')

	def getValidSoldiers(self):
		valid_soldiers = list(self.driver.execute_script('return player[current_player].soldiers;'))
		return valid_soldiers

	def getValidMoves(self):
		valid_moves = list(self.driver.execute_script('return guides_move;'))
		return valid_moves

	def getValidTargets(self):
		valid_targets = list(self.driver.execute_script('return guides_bomb;'))
		return valid_targets

	def calculate_score(self, tA, tB, sA, sB, error_state):
		if(error_state == '1'):
			tA = 2
		elif(error_state == '2'):
			tB = 2

		if(tA == 4 and tB == 2):
			scoreA = 10
			scoreB = 0
		elif(tA == 3 and tB == 2):
			scoreA = 8
			scoreB = 2
		elif(tA == 2 and tB == 3):
			scoreA = 2
			scoreB = 8
		elif(tA == 2 and tB == 4):
			scoreA = 0
			scoreB = 10
		else:
			if(self.get_current_player() == 1):
				if(self.driver.execute_script('return player[current_player].soldiers.length;') == 0):
					if(tA == 4 and tB == 3):
						scoreA = 10
						scoreB = 0
					elif(tA == 4 and tB == 4):
						scoreA = 8
						scoreB = 2
					elif(tA == 3 and tB == 3):
						scoreA = 8
						scoreB = 2
					elif(tA == 3 and tB == 4):
						scoreA = 6
						scoreB = 4
				else:
					if(tA == 4 and tB == 3):
						scoreA = 8
						scoreB = 2
					elif(tA == 4 and tB == 4):
						scoreA = 6
						scoreB = 4
					elif(tA == 3 and tB == 3):
						scoreA = 6
						scoreB = 4
					elif(tA == 3 and tB == 4):
						scoreA = 4
						scoreB = 6
			else:
				if(self.driver.execute_script('return player[current_player].soldiers.length;') == 0):
					if(tA == 4 and tB == 3):
						scoreA = 4
						scoreB = 6
					elif(tA == 4 and tB == 4):
						scoreA = 2
						scoreB = 8
					elif(tA == 3 and tB == 3):
						scoreA = 2
						scoreB = 8
					elif(tA == 3 and tB == 4):
						scoreA = 0
						scoreB = 10
				else:
					if(tA == 4 and tB == 3):
						scoreA = 6
						scoreB = 4
					elif(tA == 4 and tB == 4):
						scoreA = 4
						scoreB = 6
					elif(tA == 3 and tB == 3):
						scoreA = 4
						scoreB = 6
					elif(tA == 3 and tB == 4):
						scoreA = 2
						scoreB = 8

		scoreA = scoreA + float(sA) / 100.0
		scoreB = scoreB + float(sB) / 100.0

		return [scoreA, scoreB]

	def get_score(self, id, error_state = 0):
		soldiersA = 0
		soldiersB = 0
		townhallsA = 0
		townhallsB = 0

		positions = list(self.driver.execute_script('return positions;'))

		for i in range(self.rows):
			for j in range(self.cols):
				piece = dict(positions[i][j])['piece']
				if(piece == 2):
					townhallsA += 1
				elif(piece == 1):
					soldiersA += 1
				elif(piece == -1):
					soldiersB += 1
				elif(piece == -2):
					townhallsB += 1

		return self.calculate_score(townhallsA, townhallsB, soldiersA, soldiersB, error_state)[int(id) - 1]

	def check_finished(self):
		required_move = self.driver.execute_script('return required_move;')
		return (required_move == 2)

	def check_stagnant(self):
		is_stagnant = self.driver.execute_script('return is_stagnant;')
		return (is_stagnant == 1)

	def sign(self, x):
		if(x == 0):
			return 0
		else:
			return x / abs(x)

	def execute_sequence(self, moves):
		success = 1
		move = []
		id = self.get_current_player()
		for i, j in enumerate(moves):
			if(i % 3 == 2):
				move += [j]
				move_success = self.execute_move(' '.join(move))
				if(move_success == 0):
					return 0
				success = success and move_success
				move = []
			else:
				move += [j]
		player = self.get_current_player()
		if(id == player):
			return 0
		return success

	"""
	## Move types
	# S - Select a Soldier
	# M - Move a soldier
	# B - Bombard a shot

	"""
	def execute_move(self, cmd) :
		moves = cmd.split()

		if(len(moves) > 3):
			return self.execute_sequence(moves)

		type = moves[0]
		x = int(moves[1])
		y = int(moves[2])

		success = 1
		string_valid = 1

		positions = list(self.driver.execute_script('return positions;'))

		if(type == 'S'):
			self.click_at(x, y)
		elif(type == 'M' and (dict(positions[x][y])['guide'] == 1 or dict(positions[x][y])['guide'] == 3)):
			self.driver.execute_script('setAction(0);')
			self.click_at(x, y)
		elif(type == 'B' and (dict(positions[x][y])['guide'] == 2 or dict(positions[x][y])['guide'] == 3)):
			self.driver.execute_script('setAction(1);')
			self.click_at(x, y)
		else:
			string_valid = 0

		move_valid = self.check_move_validity()
		finished = self.check_finished()
		stagnant = self.check_stagnant()

		if(not (string_valid and move_valid)):
			success = 0
		elif(finished):
			success = 2
		elif(stagnant):
			success = 3

		return success

	def simulate(self, filename):
		with open(filename) as f:
			lines = [line for line in f.readlines()]
			for line in lines[:-1]:
				parts = line.split('}')
				part = parts[0] + '}'
				out = json.loads(part)
				exec("self.execute_move(\"" + out['data'] + "\")")

if __name__ == "__main__":
	game = Game(8, 8, 'GUI')
	game.simulate(sys.argv[1])
