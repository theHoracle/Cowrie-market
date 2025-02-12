# Configuration
CONTRACT_NAME = cowrie-marketplace
WASM_FILE = target/wasm32-unknown-unknown/release/$(CONTRACT_NAME).wasm
OPTIMIZER_VERSION = 0.13.0
OPTIMIZER_IMAGE = cosmwasm/optimizer:$(OPTIMIZER_VERSION)

# Network configuration (customize these values)
CHAIN_ID = malaga-420
NODE_URL = https://rpc.malaga-420.cosmwasm.com:443
WALLET_NAME = my-wallet
CONTRACT_ADDRESS = # This will be set after deployment

# Build configuration
RUST_TARGET = wasm32-unknown-unknown

.PHONY: all
all: clean build optimize

# Install all required dependencies
.PHONY: deps
deps:
	@echo "Installing dependencies..."
	rustup target add $(RUST_TARGET)
	cargo install cargo-generate
	cargo install cosmwasm-check

# Clean build artifacts
.PHONY: clean
clean:
	@echo "Cleaning build artifacts..."
	cargo clean
	rm -f artifacts/*.wasm

# Build the contract in debug mode
.PHONY: build-debug
build-debug:
	@echo "Building contract in debug mode..."
	cargo build --target $(RUST_TARGET)

# Build the contract in release mode
.PHONY: build
build:
	@echo "Building contract in release mode..."
	cargo build --target $(RUST_TARGET) --release

# Run contract tests
.PHONY: test
test:
	@echo "Running tests..."
	cargo test

# Generate JSON schema
.PHONY: schema
schema:
	@echo "Generating schema..."
	cargo schema

# Optimize the wasm binary
.PHONY: optimize
optimize: build
	@echo "Optimizing wasm binary..."
	@mkdir -p artifacts
	docker run --rm -v $(shell pwd):/code \
		--mount type=volume,source=registry_cache,target=/usr/local/cargo/registry \
		$(OPTIMIZER_IMAGE) ./src/main.rs
	@mv artifacts/$(CONTRACT_NAME).wasm artifacts/$(CONTRACT_NAME)_optimized.wasm

# Check if the wasm binary is valid
.PHONY: check
check: optimize
	@echo "Checking wasm binary..."
	cosmwasm-check artifacts/$(CONTRACT_NAME)_optimized.wasm

# Store the contract on chain (returns code ID)
.PHONY: store
store: optimize
	@echo "Storing contract..."
	wasmd tx wasm store artifacts/$(CONTRACT_NAME)_optimized.wasm \
		--from $(WALLET_NAME) \
		--chain-id $(CHAIN_ID) \
		--node $(NODE_URL) \
		--gas-prices 0.025umlg \
		--gas auto \
		--gas-adjustment 1.3 \
		-y

# Initialize a new instance of the contract
# Usage: make instantiate CODE_ID=<code_id>
.PHONY: instantiate
instantiate:
	@if [ -z "$(CODE_ID)" ]; then \
		echo "Error: CODE_ID is required. Usage: make instantiate CODE_ID=<code_id>"; \
		exit 1; \
	fi
	@echo "Instantiating contract..."
	wasmd tx wasm instantiate $(CODE_ID) \
		'{"commission_rate": 250}' \
		--from $(WALLET_NAME) \
		--chain-id $(CHAIN_ID) \
		--node $(NODE_URL) \
		--label "Marketplace v1" \
		--gas-prices 0.025umlg \
		--gas auto \
		--gas-adjustment 1.3 \
		--admin $(shell wasmd keys show $(WALLET_NAME) -a) \
		-y

# Migrate contract to new code
# Usage: make migrate CONTRACT_ADDRESS=<address> CODE_ID=<new_code_id>
.PHONY: migrate
migrate:
	@if [ -z "$(CONTRACT_ADDRESS)" ] || [ -z "$(CODE_ID)" ]; then \
		echo "Error: CONTRACT_ADDRESS and CODE_ID are required."; \
		echo "Usage: make migrate CONTRACT_ADDRESS=<address> CODE_ID=<new_code_id>"; \
		exit 1; \
	fi
	@echo "Migrating contract..."
	wasmd tx wasm migrate $(CONTRACT_ADDRESS) $(CODE_ID) \
		'{}' \
		--from $(WALLET_NAME) \
		--chain-id $(CHAIN_ID) \
		--node $(NODE_URL) \
		--gas-prices 0.025umlg \
		--gas auto \
		--gas-adjustment 1.3 \
		-y

# Query contract state
# Usage: make query CONTRACT_ADDRESS=<address> QUERY='{"get_config": {}}'
.PHONY: query
query:
	@if [ -z "$(CONTRACT_ADDRESS)" ] || [ -z "$(QUERY)" ]; then \
		echo "Error: CONTRACT_ADDRESS and QUERY are required."; \
		echo "Usage: make query CONTRACT_ADDRESS=<address> QUERY='<query_json>'"; \
		exit 1; \
	fi
	@echo "Querying contract..."
	wasmd query wasm contract-state smart $(CONTRACT_ADDRESS) '$(QUERY)'

# Execute contract function
# Usage: make execute CONTRACT_ADDRESS=<address> MSG='{"create_listing": {...}}'
.PHONY: execute
execute:
	@if [ -z "$(CONTRACT_ADDRESS)" ] || [ -z "$(MSG)" ]; then \
		echo "Error: CONTRACT_ADDRESS and MSG are required."; \
		echo "Usage: make execute CONTRACT_ADDRESS=<address> MSG='<msg_json>'"; \
		exit 1; \
	fi
	@echo "Executing contract function..."
	wasmd tx wasm execute $(CONTRACT_ADDRESS) \
		'$(MSG)' \
		--from $(WALLET_NAME) \
		--chain-id $(CHAIN_ID) \
		--node $(NODE_URL) \
		--gas-prices 0.025umlg \
		--gas auto \
		--gas-adjustment 1.3 \
		-y
