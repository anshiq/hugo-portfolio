.PHONY: check-deps all build clean serve prod

# Default target
all: check-deps build

# Build Hugo site
build:
	@echo "📦 Building Hugo site..."
	@hugo --minify

# Production build (alias for build)
prod: clean check-deps build
	@echo "🚀 Production build complete."
	@echo "   └── public/ (Hugo site)"

# Check system dependencies
REQUIRED_CMDS := git hugo python3

check-deps:
	@echo "🔍 Checking system dependencies..."
	@for cmd in $(REQUIRED_CMDS); do \
		if ! command -v $$cmd >/dev/null 2>&1; then \
			echo "❌ Missing: $$cmd"; \
			exit 1; \
		else \
			echo "✅ Found: $$cmd"; \
		fi; \
	done
	@echo "✅ All dependencies satisfied."

# Clean build artifacts
clean:
	@echo "🧹 Cleaning build artifacts..."
	@rm -rf public/
	@echo "✅ Clean complete."

# Serve Hugo locally (drafts included)
serve:
	@echo "🌍 Serving Hugo site locally..."
	@hugo server -D
