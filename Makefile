TESTS += test/*.test.js

test:
	@mocha \
		--reporter spec \
		--slow 2000ms \
		--bail \
		$(TESTS)

.PHONY: test
