#!/bin/bash

# Directory containing the SCSS files
scss_dir="./src/lib/css"

# Path to the index.scss file
index_file="${scss_dir}/index.scss"

# Create or empty the index.scss file
# echo "// Generated with 'pnpm generate:css'" >"$index_file"
# echo "" >>"$index_file"
echo -e "// Generated with 'pnpm generate:css'\n" >"$index_file"

# Generate the index.scss with imports
for file in ${scss_dir}/*.scss; do
    if [ "$(basename "$file")" != "index.scss" ]; then
        echo "@import '$(basename "$file" .scss)';" >>"$index_file"
    fi
done

# Compile each SCSS file including the newly created index.scss
for file in ${scss_dir}/*.scss; do
    sass "$file" "${file%.scss}.css"
done

# Message.
mgn() { printf "\e[35m%s\e[0m" "$1"; }
gry() { printf "\e[90m%s\e[0m" "$1"; }
dim() { printf "\e[2m%s\e[0m" "$1"; }
bld() { printf "\e[1m%s\e[0m" "$1"; }
grn() { printf "\e[32m%s\e[0m" "$1"; }
log() {
    local text="$1"; shift
    for style in "$@"; do
        text=$($style "$text")
    done
    printf "%s" "$text"
}
echo
log '✓' grn bld
log ' generate:' gry
log 'css' bld mgn
echo
