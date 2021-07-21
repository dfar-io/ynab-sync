mortgage_balance := $(shell node main.ts $(username) $(password))

all:
	@echo $(mortgage_balance)