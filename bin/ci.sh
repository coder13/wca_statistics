#!/bin/bash
# Based on https://github.com/jonatanklosko/wca_statistics/blob/master/bin/travis.sh

changed_statistic_files=`git diff --name-only $TRAVIS_COMMIT_RANGE | grep 'statistics/'`

if [[ "$TRAVIS_EVENT_TYPE" != "cron" && "$changed_statistic_files" == "" && "$FORCE_COMPUTE_ALL" != true ]]; then
  echo "There is nothing to compute."
else
  # Set up database.
  mkdir build/
  bin/update_database.rb
  mysql -u root -p wca_statistics --password="" < bin/extras.sql
  # When a cron job compute all statistics, otherwise just the updated and new ones.
  if [[ "$TRAVIS_EVENT_TYPE" == "cron" || "$FORCE_COMPUTE_ALL" == true ]]; then
    bin/compute.js statistics/*
  else
    # Copy existing files from gh-pages to the build directory.
    
    git checkout gh-pages .
    files_to_copy=$(git ls-tree --name-only gh-pages | grep '.md')
    if [[ "$files_to_copy" != "" ]]; then
      mv $files_to_copy build
    fi

    echo "$changed_statistic_files" | while read line; do
      echo "File has changed: $line"
      bin/compute.js $line
    done
  fi

  # Update the home file in both cases.
  bin/compute_home.js
fi
