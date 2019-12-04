#! /usr/bin/node

var ffmpeg = require("fluent-ffmpeg");
var youtubedl = require("youtube-dl");
var moment = require("moment");
var program = require("commander");
var filenamify = require("filenamify");
var package = require('./package.json');

//8mb -u https://www.youtube.com/watch?v=oHg5SJYRHA0 -s 0:18 -e 0:36
//node 8mb.js -u https://www.youtube.com/watch?v=oHg5SJYRHA0 -s 0:18 -e 0:36
//node 8mb.js -u https://www.youtube.com/watch?v=td-qFfTig88 -s 0:08 -e 0:25
//node 8mb.js -u https://www.youtube.com/watch?v=ShtIRODxvmc -s 0:06 -e 0:19
//node 8mb.js -u https://www.youtube.com/watch?v=mj-v6zCnEaw -s 1:33 -e 1:57
//node 8mb.js -u https://www.youtube.com/watch?v=4K7nJpH-B_s -s 0:07 -e 0:26
program.version(package.version);
program
  .option("-s, --start-time <string>", "start time")
  .option("-e, --end-time <string>", "end time")
  .option("-u, --url <string>", "youtube url")
  .option("-a, --audio-ratio <number>", "percentage of bitrate dedicated to audio", 1/4)
  .option("-m, --megabytes <number>", "(hopefully) max filesize in MB", 8)
  .option("-w, --max-width <number>", "width", 640)
  .option("-h, --max-height <number>", "height", 480)
  .option("-ao, --audio-only <boolean>", "audio only", false);

program.parse(process.argv);
var maxSize = program.megabytes * 1024 * 1024 //8mb
var overhead = 0.1; //10% overhead
var audioRatio = program.audioRatio;

var url = program.url;
var maxWidth = program.maxWidth;
var maxHeight = program.maxHeight;
var startTime = program.startTime;
var endTime = program.endTime;
var audioOnly = program.audioOnly

async function main()
{
  //calculate duration
  var t1 = moment(startTime, "mm:ss");
  var t2 = moment(endTime, "mm:ss");
  var duration = t2.diff(t1) / 1000;
  var durationHMS = moment(duration * 1000).format("mm:ss");
  //calculate bitrates
  var bitrate = maxSize * (1 - overhead) / duration;
  var abr = bitrate * audioRatio / 1024  * 8;
  var vbr = bitrate * (1 - audioRatio) / 1024 * 8;
  //download video
  var video = youtubedl(url);

  var info = await new Promise((res, rej) => video.on('info', (info) => res(info)));

  if (audioOnly === false) {
    var filename = filenamify(`${info.title}-${startTime}-${endTime}.mp4`, {replacement:"_"});
  } else if (audioOnly === true) {
    var filename = filenamify(`${info.title}-${startTime}-${endTime}.mp3`, {replacement:"_"});
  }

  var command = new ffmpeg(video)
    .setStartTime(startTime)
    .setDuration(durationHMS)
    .videoCodec("libx264")
    .audioCodec("aac")
    .format("mp4")
    .videoBitrate(vbr)
    .audioBitrate(abr)
    .videoFilter(`scale=w=${maxWidth}:h=${maxHeight}:force_original_aspect_ratio=decrease`)
    .on('progress', function(progress) {
      console.log('Processing: ' + progress.timemark);
    })
    .on("end", () =>
    {
      console.log(`All Done.\nSaved ${filename}`)
    })
    .on("error", (err) =>
    {
      throw err;
    });

  if (audioOnly === true) {
    command.noVideo()
    command.save(filename)
  } else {
    command.save(filename)
  }
}

main();
