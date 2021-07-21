all:
	$(eval mortgage_balance := $(shell node main.ts $(username) $(password)))
	@echo $(mortgage_balance)