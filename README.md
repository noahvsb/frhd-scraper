# frhd-scraper

Scrapes all tracks and leaderboards from https://freeriderhd.com.

## background

https://freeriderhd.com hasn't been updated since 2018, modders and trackmakers have kept it alive with wonderful mods and beautiful tracks. But I fear it won't be long until the servers get shut down.

## install

###### I'm using `bun`, because `npm` is ass (see https://bun.sh/get for installation).

Run the following command to install the packages:
```sh
bun i
```

## scripts

| script       | description                                        |
| ------------ | -------------------------------------------------- |
| `bun test`   | runs the tests                                     |
| `bun scrape` | runs the scraper, run `bun scrape --help` for help |

## runtime and data size

Running both scrapers in parallel took me around 8.5 hours.

| command       | data size | disk space |
| ------------- | --------- | ---------- |
| `track`       |    5.2 GB |     7.3 GB |
| `leaderboard` |    2.2 GB |     4.1 GB |