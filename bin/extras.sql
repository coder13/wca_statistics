START TRANSACTION;

DROP FUNCTION IF EXISTS resultId;
CREATE FUNCTION resultId(competitionId varchar(32), personId varchar(10), eventId varchar(6), roundTypeId char(1))
RETURNS varchar(255) DETERMINISTIC
RETURN CONCAT(competitionId, '-', personId, '-', eventId, '-', roundTypeId);

## Attaches Dates and continent ids to results

DROP TABLE IF EXISTS ResultDates;
CREATE TABLE ResultDates AS (
  SELECT resultId(R.competitionId, R.personId, R.eventId, R.roundTypeId) resultId,
  R.personId, R.personName, R.countryId, Continents.recordName personContinentId,
  R.competitionId, R.eventId, R.roundTypeId, R.formatId, R.pos, R.average, R.best, R.regionalAverageRecord, R.regionalSingleRecord,
  @date := DATE(CONCAT(year, '-', month, '-', day)) date,
  @weekend := DATE(DATE_SUB(@date, INTERVAL (DAYOFWEEK(@date) + 2) % 7 DAY)) weekend
  FROM Results R
  JOIN Competitions ON R.competitionId = Competitions.id
  JOIN Countries ON Countries.id = R.countryId
  LEFT JOIN Continents ON Countries.continentId = Continents.id
);

# ~1:30

CREATE INDEX resultId ON ResultDates(resultId);
CREATE INDEX eventRound ON ResultDates(eventId, roundTypeId);
CREATE INDEX roundEventComp ON ResultDates(roundTypeId, eventId, competitionId);
CREATE INDEX eventCountryDate ON ResultDates(eventId, countryId, date);
CREATE INDEX eventContinentDate ON ResultDates(eventId, personContinentId, date);
CREATE INDEX eventDateAvg ON ResultDates(eventId, date, average);
CREATE INDEX personIdEventIdDate ON ResultDates(personId, eventId, date);

DROP TABLE IF EXISTS W;
DROP TABLE IF EXISTS C;
DROP TABLE IF EXISTS N;

COMMIT;
