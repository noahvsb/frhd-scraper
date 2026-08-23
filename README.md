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

### track

I scraped all community classics, which is about 10000 tracks. They took 475 seconds scrape and it's 300 MB of files. Currently there are almost 1 million tracks, so if we multiple both numbers by 100, we get a rough estimate of the total runtime and data size:

**13 hours** and **30 GB**

### leaderboard

Not yet implemented, but only 1 fetch is necessary, so I believe the runtime will be lower. For the data size I believe it will be about the same magnitude.
