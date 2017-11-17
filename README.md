# wca_statistics [![Build Status](https://travis-ci.org/coder13/wca_statistics.svg?branch=master)](https://travis-ci.org/coder13/wca_statistics)

Based on [Jonton Klosko's site](https://github.com/jonatanklosko/wca_statistics).

## Getting started

Requirements: Ruby and MySQL.

- Clone the repository: `git clone https://github.com/coder13/wca_statistics.git`
- Download the WCA database: `bin/update_database.rb`

## Scripts

| Script | Description |
| ------ | ----------- |
| `compute.rb` | Computes a single statistics basing on the given statistic file path. |
| `update_database.rb` | Downloads and imports the WCA database copy. |
