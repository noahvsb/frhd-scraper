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

## estimate of runtime and data size

I scraped all community classics on a pretty good laptop with a wireless connection:

| command       | runtime | data size |
| ------------- | ------- | --------- |
| `track`       |  236.0s |  303.3 MB |
| `leaderboard` |  254.4s |   58.6 MB |

There are about 10000 community classics and in total there are around 1 million tracks, so this gives the following estimates:

| command       | runtime | data size |
| ------------- | ------- | --------- |
| `track`       |    6.5h |  30.33 GB |
| `leaderboard` |      7h |   5.86 GB |

