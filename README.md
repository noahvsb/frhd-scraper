# frhd-scraper

Scrapes all tracks and leaderboards from https://freeriderhd.com.

## background

https://freeriderhd.com hasn't been updated since 2018, modders and trackmakers have kept it alive with wonderful mods and beautiful tracks. But I fear it won't be long until the servers get shut down.

## install and usage

### windows

I made it easier for windows users with a .bat script:

Clone this repository or download the .zip and extract. Then double click `run-scraper.bat`, it will warn you, but just run it.

### install

###### I'm using `bun`, because `npm` is ass (see https://bun.sh/get for installation).

Run the following command to install the packages:
```sh
bun i
```

### scripts

| script                   | description                            |
| ------------------------ | -------------------------------------- |
| `bun test`               | runs the tests                         |
| `bun scrape track`       | runs the track scraper                 |
| `bun scrape leaderboard` | runs the leaderboard scraper           |
| `bun scrape --help`      | prints the help message with more info |

## runtime and data size

Running both scrapers in parallel took me around 8.5 hours.

| command       | data size | disk space |
| ------------- | --------- | ---------- |
| `track`       |    5.2 GB |     7.3 GB |
| `leaderboard` |    2.2 GB |     4.1 GB |
