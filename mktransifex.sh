#!/usr/bin/env bash

set -e

cd "$(dirname "$0")"

function gen_file() {
  cd public/locales/en
  local common_found="false"

  echo "git:"
  echo "  filters:"
  for name in $(find . | grep -v '^.$' | cut -d '/' -f 2 | cut -d '.' -f 1 | sort | xargs); do
    echo "    - filter_type: file"
    echo "      file_format: KEYVALUEJSON"
    echo "      source_file: public/locales/en/$name.json"
    echo "      source_language: en"
    echo "      translation_files_expression: 'public/locales/<lang>/$name.json'"
    echo
    if [ "$name" == "common" ]; then
      common_found="true"
    fi
  done

  cd ../../..

  [ "$common_found" == "true" ] # verify common was in list of files
}

gen_file > transifex.yml
git add transifex.yml