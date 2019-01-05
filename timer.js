
var Timer = function(opts)
{
  this.delegate = opts.delegate;
  this.interval = opts.interval||1000;
};

Timer.prototype.__defineSetter__('Interval', function(y) {this.interval = y});

module.exports = Timer;

Timer.prototype.run = function () {
  this.interval = setInterval(this.tick.bind(this), this.interval);
};

Timer.prototype.close = function () {
  clearInterval(this.interval);
  this.delegate=null;
  this.interval=null;
};

Timer.prototype.tick = function()
{
  var delegate = this.delegate;
  if(!!delegate)
    delegate.update();
};