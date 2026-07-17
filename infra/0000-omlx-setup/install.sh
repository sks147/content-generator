brew tap jundot/omlx https://github.com/jundot/omlx

brew trust --formula jundot/omlx/omlx

brew install omlx

# ==> Would install 1 formula:
# omlx
# ==> Would install 7 dependencies for omlx:
# libssh2
# libgit2
# z3
# llvm
# pkgconf
# rust
# python@3.11

# Upgrade to the latest version
brew update && brew upgrade omlx

# Run as a background service (auto-restarts on crash)
omlx start

# Optional: MCP (Model Context Protocol) support
/opt/homebrew/opt/omlx/libexec/bin/pip install mcp

# qwen/qwen3-4b
omlx serve --model-dir ~/.lmstudio/models/lmstudio-community/Qwen3-4B-MLX-4bit --port 1234