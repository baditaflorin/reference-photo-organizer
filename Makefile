SHELL := /bin/bash
VERSION := $(shell node -p "require('./package.json').version")
PAGES_BASE ?= /reference-photo-organizer/
GIT_COMMIT := $(shell git rev-parse --short HEAD 2>/dev/null || echo local)

.PHONY: help install-hooks dev build data test test-integration smoke lint fmt pages-preview release clean hooks-pre-commit hooks-commit-msg hooks-pre-push hooks-post-checkout audit secret-scan

help:
	@printf "Targets:\n"
	@printf "  make install-hooks     Wire .githooks\n"
	@printf "  make dev               Run local frontend dev server\n"
	@printf "  make build             Build GitHub Pages site into docs/\n"
	@printf "  make data              Mode A placeholder\n"
	@printf "  make test              Run unit tests\n"
	@printf "  make test-integration  Run Playwright e2e tests\n"
	@printf "  make smoke             Build, serve Pages output, run smoke test\n"
	@printf "  make lint              Run lint, typecheck, formatting, audit\n"
	@printf "  make fmt               Autoformat\n"
	@printf "  make pages-preview     Serve docs/ under the Pages base path\n"
	@printf "  make release           Test, smoke, and create semver tag\n"
	@printf "  make clean             Remove generated local artifacts\n"

install-hooks:
	git config core.hooksPath .githooks
	chmod +x .githooks/*

dev:
	PAGES_BASE=/ npm run dev

build:
	PAGES_BASE=$(PAGES_BASE) GIT_COMMIT=$(GIT_COMMIT) npm run build

data:
	@printf "Mode A has no static data pipeline.\n"

test:
	npm run test

test-integration:
	npx playwright test

smoke:
	npm run smoke

lint: audit
	npm run lint
	npm run typecheck
	npm run fmt:check

fmt:
	npm run fmt

pages-preview: build
	rm -rf tmp/pages
	mkdir -p tmp/pages/reference-photo-organizer
	cp -R docs/. tmp/pages/reference-photo-organizer/
	npx http-server tmp/pages -a 127.0.0.1 -p 4177 -c-1

release: lint test smoke
	git tag -a v$(VERSION) -m "release: v$(VERSION)"

clean:
	rm -rf tmp coverage dist dist-data node_modules/.tmp

audit:
	npm audit --audit-level=high

secret-scan:
	gitleaks protect --staged --redact

hooks-pre-commit:
	make lint
	make secret-scan

hooks-commit-msg:
	@bash .githooks/commit-msg "$${COMMIT_MSG_FILE:?COMMIT_MSG_FILE is required}"

hooks-pre-push:
	make test
	make build
	make smoke

hooks-post-checkout:
	@printf "Mode A: no generated code to refresh.\n"
