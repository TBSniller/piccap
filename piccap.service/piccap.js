// Usage:
//
//  NODE_PATH=/usr/lib/nodejs:/usr/lib/node_modules node server.js --disable-timeouts
//
//  Open:
//    http://TV:4444
//    http://TV:4444/?format=JPEG&width=256&height=144

var Service = require("webos-service");
var http = require("http");
var fs = require("fs");
var url = require("url");
var logvar = "Starting log! \n";

var svc = new Service("com.tbsniller.piccap.service");


function capture(res, method, w, h, format, stats) {
  if (!stats) {
    stats = { cnt: 0, start: Date.now() };
  }
  var path = "/tmp/capture_" + Date.now() + ".jpg";
  svc.call(
    "luna://com.webos.service.capture/executeOneShot",
    {
      path: path,
      method: method,
      format: format,
      width: w,
      height: h,
    },
    function (result) {
		logvar += JSON.stringify(result.payload) + "\n";
        fs.readFile(path, function (err, data) {
        if (err) {
          res.end();
        } else {
          fs.unlink(path);
          if (!res.finished) {
            res.write("--myboundary\r\n");
            res.write("Content-Type: image/jpeg\r\n");
            res.write("Content-Length: " + data.length + "\r\n");
            res.write("\r\n");
            res.write(data, "binary");
            res.write("\r\n");
            stats.cnt += 1;
            if (stats.cnt == 60) {
              console.info(
                "Framerate:",
                stats.cnt / ((Date.now() - stats.start) / 1000.0)
              );
              stats.cnt = 0;
              stats.start = Date.now();
            }
            capture(res, method, w, h, format, stats);
          }
        }
      });
    }
  );
}

var server = http.createServer(function (req, res) {
  res.writeHead(200, {
    "Content-Type": "multipart/x-mixed-replace; boundary=myboundary",
    "Cache-Control": "no-cache",
    Connection: "close",
    Pragma: "no-cache",
  });
  res.on("close", function () {
    res.end();
  });
  var parsed = url.parse(req.url, true);
  console.info(parsed);
  capture(
    res,
    parsed.query.method || "GRAPHIC",
    parseInt(parsed.query.width) || 1280,
    parseInt(parsed.query.height) || 720,
    parsed.query.format || "JPEG"
  );
});

svc.register("start", function(message) {
	server.listen(4444, function () {
		console.info("Listening on :4444");
	});
	message.respond({
		data: "Listening on :4444"
	});
	logvar += "Starting bruh! \n";
	svc.activityManager.create("keepAlive", function(activity) {
		keepAlive = activity; 
	});

});

svc.register("log", function(message){
	message.respond({
		data: logvar
	});
});

svc.register("stop", function(message){
	svc.activityManager.complete(keepAlive, function(activity) { 
		console.log("Service stopping!"); 
	});
	message.respond({
		data: "Stopping!"
	});
});