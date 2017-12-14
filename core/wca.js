module.exports.events = ['333', '222', '444', '555', '666', '777', '333bf', '333fm', '333oh', '333ft', 'minx', 'pyram', 'clock', 'skewb', '444bf', '555bf', '333mbf'];
module.exports.timedEvents = ['333', '222', '444', '555', '666', '777', '333bf', '333oh', '333ft', 'minx', 'pyram', 'clock', 'skewb', '444bf', '555bf'];

module.exports.eventNames = {
	'333': '3x3',
	'222': '2x2',
	'444': '4x4',
	'555': '5x5',
	'666': '6x6',
	'777': '7x7',
	'333bf': '3BLD',
	'333fm': 'FMC',
	'333oh': 'OH',
	'333ft': 'Feet',
	'minx': 'Megaminx',
	'pyram': 'Pyraminx',
	'clock': 'Clock',
	'skewb': 'Skewb',
	'444bf': '4BLD',
	'555bf': '5BLD',
	'333mbf': 'MBLD'
};

const pad = (n) => (n < 10 ? '0' : '') + n;
const fixed = (n,d) => Number(n).toFixed(d === undefined ? 2 : d);

const formatSolveTime = module.exports.formatResult = function (solveTime) {
	if (solveTime === '99999') {
		return '?:??:??';
	}

	let s = solveTime / 100;
	let hours = Math.floor(s / 3600);
	s %= 3600;
	let minutes = Math.floor(s / 60);
	let seconds = fixed(s % 60, (minutes + hours * 60) > 10 ? 0 : 2);

	return `${hours ? hours + ':' : ''}${minutes ? (hours ? pad(minutes, '0') : minutes) + ':' : ''}${minutes ? pad(seconds, '0') : seconds}`;
};

const formatMbld = module.exports.formatMbld = function (solveTime, old) {
	let timeStr = solveTime.toString();
	if (old) { // old: 1SSAATTTTT
		let solved = 99 - timeStr.substring(1, 3);
		let attempted = +timeStr.substring(3, 5);
		let time = formatSolveTime(timeStr.substring(5, 11) * 100);

		return `${solved}/${attempted} ${time}`;
	} else { // new: DDTTTTTMM
		let difference = 99 - timeStr.substring(0, 2);
		let time = formatSolveTime(timeStr.substring(2, 7) * 100);
		let missed = +timeStr.substring(7, 9);

		let solved = difference + missed;
		let attempted = solved + missed;

		return `${solved}/${attempted} ${time}`;
	}
};

const formatResult = module.exports.formatResult = function (result, eventId, average) {
	if (result === -2) {
		return 'DNS';
	} else if (result < 0) {
		return 'DNF';
	} else if (result === 0) {
		return '';
	}

	if (eventId === '333mbf') {
		return formatMbld(result, false);
	} else if (eventId === '333mbo') {
		return formatMbld(result, true);
	} else if (eventId === '333fm') {
		return average ? fixed(result / 100, 2) : result;
	} else {
		return formatSolveTime(result);
	}
};
