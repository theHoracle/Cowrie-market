
# -----------------------------------------------------------------------------
# Configuration
# -----------------------------------------------------------------------------
CONTRACT_NAME      = cowrie-marketplace
WASM_FILE          = target/wasm32-unknown-unknown/release/$(CONTRACT_NAME).wasm
OPTIMIZER_VERSION  = 0.13.0
OPTIMIZER_IMAGE    = cosmwasm/optimizer:$(OPTIMIZER_VERSION)

# -----------------------------------------------------------------------------
# Network configuration (customize these values)
# -----------------------------------------------------------------------------
CHAIN_ID           = malaga-420
NODE_URL           = https://rpc.malaga-420.cosmwasm.com:443
WALLET_NAME        = my-wallet
# CONTRACT_ADDRESS is empty by default; set it when needed.
CONTRACT_ADDRESS   =

# -----------------------------------------------------------------------------
# Build configuration
# -----------------------------------------------------------------------------
RUST_TARGET        = wasm32-unknown-unknown

# -----------------------------------------------------------------------------
# PHONY targets
# -----------------------------------------------------------------------------
.PHONY: all deps clean build-debug build test schema optimize check store instantiate migrate query execute

all: clean build optimize

# -----------------------------------------------------------------------------
# Install all required dependencies
# -----------------------------------------------------------------------------
deps:
	@echo "Installing dependencies..."
	# Add the wasm target for Rust if not already installed.
	rustup target add $(RUST_TARGET)
	# Install cargo-generate and cosmwasm-check if not already installed.
	cargo install cargo-generate || true
	cargo install cosmwasm-check || true

# -----------------------------------------------------------------------------
# Clean build artifacts
# -----------------------------------------------------------------------------
clean:
	@echo "Cleaning build artifacts..."
	cargo clean
	# Remove optimized wasm files in the artifacts folder.
	rm -f artifacts/*.wasm

# -----------------------------------------------------------------------------
# Build the contract in debug mode
# -----------------------------------------------------------------------------
build-debug:
	@echo "Building contract in debug mode..."
	cargo build --lib -p $(CONTRACT_NAME)

# -----------------------------------------------------------------------------
# Build the contract in release mode
# -----------------------------------------------------------------------------
build:
	@echo "Building contract in release mode..."
	# Added --release flag to build optimized artifacts.
	cargo build --release --lib -p $(CONTRACT_NAME)

# -----------------------------------------------------------------------------
# Run contract tests
# -----------------------------------------------------------------------------
test:
	@echo "Running tests..."
	cargo test

# -----------------------------------------------------------------------------
# Generate JSON schema
# -----------------------------------------------------------------------------
schema:
	@echo "Generating schema..."
	cargo schema

# -----------------------------------------------------------------------------
# Optimize the wasm binary using the CosmWasm optimizer Docker image
# -----------------------------------------------------------------------------
optimize: build
	@echo "Optimizing wasm binary..."
	@mkdir -p artifacts
	# Run the optimizer on the wasm file generated in release mode.
	# The optimized file will be written directly to the artifacts folder.
	docker run --rm -v $(shell pwd):/code \
		--mount type=volume,source=registry_cache,target=/usr/local/cargo/registry \
		$(OPTIMIZER_IMAGE) \
		/code/target/wasm32-unknown-unknown/release/$(CONTRACT_NAME).wasm \
		-o /code/artifacts/$(CONTRACT_NAME)_optimized.wasm

# -----------------------------------------------------------------------------
# Check if the wasm binary is valid
# -----------------------------------------------------------------------------
check: optimize
	@echo "Checking wasm binary..."
	cosmwasm-check artifacts/$(CONTRACT_NAME)_optimized.wasm

# -----------------------------------------------------------------------------
# Store the contract on chain (returns code ID)
# -----------------------------------------------------------------------------
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

# -----------------------------------------------------------------------------
# Instantiate a new instance of the contract
# Usage: make instantiate CODE_ID=<code_id>
# -----------------------------------------------------------------------------
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

# -----------------------------------------------------------------------------
# Migrate contract to new code
# Usage: make migrate CONTRACT_ADDRESS=<address> CODE_ID=<new_code_id>
# -----------------------------------------------------------------------------
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

# -----------------------------------------------------------------------------
# Query contract state
# Usage: make query CONTRACT_ADDRESS=<address> QUERY='{"get_config": {}}'
# -----------------------------------------------------------------------------
query:
	@if [ -z "$(CONTRACT_ADDRESS)" ] || [ -z "$(QUERY)" ]; then \
		echo "Error: CONTRACT_ADDRESS and QUERY are required."; \
		echo "Usage: make query CONTRACT_ADDRESS=<address> QUERY='<query_json>'"; \
		exit 1; \
	fi
	@echo "Querying contract..."
	wasmd query wasm contract-state smart $(CONTRACT_ADDRESS) '$(QUERY)'

# -----------------------------------------------------------------------------
# Execute contract function
# Usage: make execute CONTRACT_ADDRESS=<address> MSG='{"create_listing": {...}}'
# -----------------------------------------------------------------------------
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

# -----------------------------------------------------------------------------
# Update a listing
# Usage: make update_listing CONTRACT_ADDRESS=<address>
# -----------------------------------------------------------------------------
.PHONY: update_listing
update_listing:
	@if [ -z "$(CONTRACT_ADDRESS)" ]; then \
		echo "Error: CONTRACT_ADDRESS is required. Usage: make update_listing CONTRACT_ADDRESS=<address>"; \
		exit 1; \
	fi
	@echo "Updating listing..."
	wasmd tx wasm execute $(CONTRACT_ADDRESS) '{"update_listing": {"listing_id": 1, "title": "Updated Title", "description": "Updated description", "price": "200"}}' \
		--from $(WALLET_NAME) \
		--chain-id $(CHAIN_ID) \
		--node $(NODE_URL) \
		--gas-prices 0.025umlg \
		--gas auto \
		--gas-adjustment 1.3 \
		-y

# -----------------------------------------------------------------------------
# Cancel a listing
# Usage: make cancel_listing CONTRACT_ADDRESS=<address>
# -----------------------------------------------------------------------------
.PHONY: cancel_listing
cancel_listing:
	@if [ -z "$(CONTRACT_ADDRESS)" ]; then \
		echo "Error: CONTRACT_ADDRESS is required. Usage: make cancel_listing CONTRACT_ADDRESS=<address>"; \
		exit 1; \
	fi
	@echo "Cancelling listing..."
	wasmd tx wasm execute $(CONTRACT_ADDRESS) '{"cancel_listing": {"listing_id": 1}}' \
		--from $(WALLET_NAME) \
		--chain-id $(CHAIN_ID) \
		--node $(NODE_URL) \
		--gas-prices 0.025umlg \
		--gas auto \
		--gas-adjustment 1.3 \
		-y

# -----------------------------------------------------------------------------
# Update contract config
# Usage: make update_config CONTRACT_ADDRESS=<address>
# -----------------------------------------------------------------------------
.PHONY: update_config
update_config:
	@if [ -z "$(CONTRACT_ADDRESS)" ]; then \
		echo "Error: CONTRACT_ADDRESS is required. Usage: make update_config CONTRACT_ADDRESS=<address>"; \
		exit 1; \
	fi
	@echo "Updating contract config..."
	wasmd tx wasm execute $(CONTRACT_ADDRESS) '{"update_config": {"commission_rate": 300}}' \
		--from $(WALLET_NAME) \
		--chain-id $(CHAIN_ID) \
		--node $(NODE_URL) \
		--gas-prices 0.025umlg \
		--gas auto \
		--gas-adjustment 1.3 \
		-y

