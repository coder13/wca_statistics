require 'bundler/setup'
require 'yaml'
require 'mysql2'

module Database
  DATABASE_CONFIG_PATH = File.expand_path("../database.yml", __dir__)
  DATABASE_CONFIG = YAML.load_file(DATABASE_CONFIG_PATH)
  REQUIRED_TABLES = %w(
    championships
    Competitions
    competition_delegates
    ConciseAverageResults
    ConciseSingleResults
    Continents
    Countries
    Events
    Formats
    Persons
    preferred_formats
    RanksAverage
    RanksSingle
    RoundTypes
    Results
    users
  )

  def self.client
    Mysql2::Client.new(DATABASE_CONFIG)
  end
end
