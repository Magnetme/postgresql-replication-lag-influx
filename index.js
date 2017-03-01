const pg = require('pg');
const Influx = require('influx');

const IS_DEBUG = (process.env.DEBUG && process.env.DEBUG.toLowerCase() === 'true') || false;
const RATE = (process.env.RATE && parseInt(process.env.RATE, 10)) || 2500;
const CLUSTER_NAME = process.env.CLUSTER_NAME || null;

const LAG_QUERY = `SELECT
CASE
WHEN pg_last_xlog_receive_location() = pg_last_xlog_replay_location() THEN 0
ELSE EXTRACT (EPOCH FROM now() - pg_last_xact_replay_timestamp())
END
AS lag`;

console.log(`Cluster name is ${CLUSTER_NAME}`);
const pokeAll = () => process.env.SERVERS.split(',').map(url => {
	const splitted = url.split(':');
	console.log(`Will be monitoring ${url}`);
	return {
		host : splitted[0],
		port : splitted[1] || 5432,
		database : 'postgres'
	};
}).forEach(config => poke(config));

const resultData = (config, lag) => {
	const tags = Object.assign({}, {host : config.host, port : config.port});
	if (CLUSTER_NAME) tags.cluster = CLUSTER_NAME;
	return {
		tags : tags,
		fields : {lag : lag}
	};
};

const poke = (config) => {
	const client = new pg.Client(config);
	const url = `${config.host}:${config.port}`;

	client.connect(err => {
		if (err) {
			if(IS_DEBUG) console.warn(`Cannot connect to ${url}`);
			return;
		}

		// execute a query on our database
		client.query('SELECT pg_is_in_recovery() as is_slave;', [], (err, result) => {
			if (err) throw err;

			// just print the result to the console
			if (result.rows[0].is_slave) {
				// Server is a slave, fetch the replication lag
				client.query(LAG_QUERY, [], (err, result) => {
					if (err) throw err;

					const lagInMs = Math.round(result.rows[0].lag * 1000);

					setTimeout(() => poke(config), RATE);
					influx.writeMeasurement(`db.postgres.replication.lag`, [
						resultData(config, lagInMs)
					]);
					if (IS_DEBUG) console.log(`${url} had a replication of ${lagInMs} ms`);
				});
			} else {
				if (IS_DEBUG) {
					console.warn(`${url} is not a slave server`);
				}
				setTimeout(() => poke(config), RATE);
			}

			// disconnect the client
			client.end((err) => {
				if (err) throw err;
			});
		});
	});
};

const influx = new Influx.InfluxDB(process.env.INFLUX_URL);

pokeAll();
