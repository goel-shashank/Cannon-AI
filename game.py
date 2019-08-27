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

display_sizes = {10: 750}
townspace_sizes = {10: 3}
contingent_sizes = {10: 3}

PATH = os.path.dirname(os.path.abspath(__file__))
TEMPLATE_ENVIRONMENT = Environment(autoescape = False, loader = FileSystemLoader(os.path.join(PATH, 'templates')), trim_blocks = False)

def render_template(template_filename, context):
	return TEMPLATE_ENVIRONMENT.get_template(template_filename).render(context)

def create_index_html(rows, size, townspace, contingent):
	fname = "Cannon.html"
	context = {
		'rows': rows,
		'size': size,
		'townspace': townspace,
		'contingent': contingent
	}
	with open(fname, 'w') as f:
		html = render_template('index.html', context)
		f.write(html)

class Game:
	def __init__(self, n, mode = 'CUI', time = 120):
		if(n in display_sizes):
			self.rows = int(n)
			self.display = display_sizes[n]
			self.townspace = townspace_sizes[n]
			self.contingent = contingent_sizes[n]
		else:
			raise AssertionError("Board size must be 10")

		# setup Driver
		create_index_html(self.rows, self.display, self.townspace, self.contingent)

		options = Options()
		options.add_argument("--disable-infobars")
		if(mode != 'GUI'):
			options.add_argument('headless');
		self.driver = webdriver.Chrome(options = options)

		abs_path = os.path.abspath('Cannon.html')
		self.driver.get("file:" + abs_path)
		self.driver.set_window_size(width = self.display + 10, height = self.display + 132.5)

		self.timer = time
		self.centerx = int(self.display) / 2
		self.centery = int(self.display) / 2
		self.spacing = float(self.display) / self.rows

	def click_at(self, x, y) :
		e = self.driver.find_elements_by_id('PieceLayer')
		action = webdriver.common.action_chains.ActionChains(self.driver)
		action.move_to_element_with_offset(e[0], x, y)
		action.click()
		action.perform()

	def check_move_validity(self):
		return self.driver.execute_script('return is_valid;')

	def check_player_state(self):
		return self.driver.execute_script('return required_move;')

	def get_current_player(self):
		return self.driver.execute_script('return current_player;')

	def board2pos_coord(self, x, y):
		positions = list(self.driver.execute_script('return positions;'))
		for i in range(self.rows):
			for j in range(self.rows):
				if(positions[i][j]['x'] - self.altitude / 2 < x and positions[i][j]['x'] + self.spacing / 2 > x and positions[i][j]['y'] - self.spacing / 2 < y and positions[i][j]['y'] + self.spacing / 2 > y):
					return (i,j)

	def calculate_score(self, tA, tB, sA, sB, error_state):
		if(error_state == '1'):
			tB = 3
		elif(error_state == '2'):
			tA = 3

		if(tB == 5):
			tB = 0
		if(tA == 5):
			tA = 0

		if(tA == 3):
			scoreA = 10 - tB
			scoreB = tB
		elif(tB == 3):
			scoreA = tA;
			scoreB = 10 - tA
		elif(tB == tA):
			scoreA = 5
			scoreB = 5
		elif(tA - tB == 2):
			scoreA = 7
			scoreB = 3
		elif(tB - tA == 2):
			scoreA = 3
			scoreB = 7
		elif(tA > tB):
			scoreA = 6; scoreB = 4
		elif(tB > tA):
			scoreA = 4
			scoreB = 6
		else:
			AssertionError('cannot calculate score')

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
			for j in range(self.rows):
				piece = dict(positions[i][j])['piece']
				if(piece == 2):
					townhallsA += 1
				elif(piece == 1):
					soldiersA += 1
				elif(piece == -1):
					soldiersB += 1
				elif(piece == -2):
					townhallsB += 1

		return self.calculate_score(self.townhalls - townhallsA, self.townhalls - townhallsB, soldiersA, soldiersB, error_state)[int(id) - 1]

	def check_finished(self):
		required_move = self.driver.execute_script('return required_move;')
		return (required_move == 3)

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

		if(type == 'S'):
			self.click_at(x, y)
		elif(type == 'M'):
			self.click_at(x, y)
		elif(type == 'B'):
			self.click_at(x, y)
		else:
			string_valid = 0

		move_valid = self.check_move_validity()
		finished = self.check_won()

		if(not (string_valid and move_valid)):
			success = 0
		elif(finished):
			success = 2

		return success

	def simulate(self, filename):
		with open(filename) as f:
			for line in f.readlines():
				parts = line.split('}')
				part = parts[0] + '}'
				out = json.loads(part)
				exec("self.execute_move(\"" + out['data'] + "\")")

if __name__ == "__main__":
	game = Game(10, 'GUI')
	game.simulate(sys.argv[1])
