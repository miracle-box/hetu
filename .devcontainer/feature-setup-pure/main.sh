#!/bin/bash
set -e

echo "📦 Installing Pure ZSH prompt..."

mkdir -p "$HOME/.zsh"
git clone https://github.com/sindresorhus/pure.git "$HOME/.zsh/pure"

# Remove ZSH_THEME
sed -i 's/ZSH_THEME=".*"/ZSH_THEME=""/' ~/.zshrc

# Add fpath
echo "" >> ~/.zshrc
echo "# PURE prompt" >> ~/.zshrc
echo "fpath+=(\$HOME/.zsh/pure)" >> ~/.zshrc

# Load Pure prompt
echo "autoload -U promptinit; promptinit" >> ~/.zshrc
echo "prompt pure" >> ~/.zshrc

# Set some options
cat <<EOF >> ~/.zshrc

# Pure prompt settings
PURE_CMD_MAX_EXEC_TIME=10
EOF

echo "✅ Pure prompt installed."
