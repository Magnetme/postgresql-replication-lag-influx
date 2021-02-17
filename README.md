[![Magnet.me Logo](https://cdn.magnet.me/images/logo-2015-full.svg)](https://magnet.me "Discover the best companies, jobs and internships at Magnet.me")

[![GitHub release](https://img.shields.io/github/release/magnetme/postgresql-replication-lag-influx.svg)](https://github.com/Magnetme/postgresql-replication-lag-influx/releases)
[![Docker pulls](https://img.shields.io/docker/pulls/magnetme/postgresql-replication-lag-influx.svg)](https://hub.docker.com/r/magnetme/postgresql-replication-lag-influx/)
[![Docker build](https://img.shields.io/docker/automated/magnetme/postgresql-replication-lag-influx.svg)](https://hub.docker.com/r/magnetme/postgresql-replication-lag-influx/)
[![Code Climate](https://img.shields.io/codeclimate/github/magnetme/postgresql-replication-lag-influx.svg)](https://codeclimate.com/github/Magnetme/postgresql-replication-lag-influx)
[![Github stars](https://img.shields.io/github/stars/magnetme/postgresql-replication-lag-influx.svg?style=social&label=Star)](https://github.com/Magnetme/postgresql-replication-lag-influx)

# postgresql-replication-lag-influx

We use the following simple script/Docker container at [Magnet.me](https://magnet.me?ref=github-pg-lag "Discover the best companies, jobs and internships at Magnet.me") monitor the lag or our postgresql slaves continuously.

You can use the container like this:
 
 ```bash
 docker run \
	 -e INFLUX_URL=http://root:root@localhost:8096/infra \
	 -e RATE=250 \
	 -e PGUSER=replication \ 
	 -e PGPASSWORD=yoursecret \ 
	 -e SERVERS=localhost:5433,localhost:5434 \
	 magnetme/postgresql-replication-lag-influx
 ```
