# 8mb.js

Quickly clip YouTube videos at the specified timestamps (and transcode them to be less than 8mb, usually)

# Installation

## The Dummy Method
* Probably requires FFmpeg to be installed
* Probably also requires youtube-dl to be installed

Then just clone and run `8mb.js`

## Using Yarn

```
yarn global add https://github.com/tehZevo/8mb.git#master
```
It just works:tm:

## Usage
```
# node 8mb.js -u https://www.youtube.com/watch?v=oHg5SJYRHA0 -s 0:19 -e 0:36
```
