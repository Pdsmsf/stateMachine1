

var async = require('async');
var _ = require('lodash');

var Timer = require('./timer');


/**
 *
 * @param states  eg: ['UNGAME', 'SLEEP', 'READY', ... 'GAMEOVER']
 */
var Machine = function(table, states ){
    this.table = table;
    this.states = states; 

    this.handlers = {};

    this.timer = new Timer({delegate: this, interval: 100});

    this.running = false;
    this.current = 0;
    this.ticks = 0; // 当前状态持续时长
    this.tickCb = null; // tick周期回调

    this.ticksPrevState = 0;

    console.log('Machine', states);
};

Machine.prototype.init = function() {
    this.handlers['UNGAME'] = [this.default_UNGAME_Handler.bind(this)];
    this.handlers['SLEEP'] = [this.default_SLEEP_Handler.bind(this)];
    this.handlers['GAMEOVER'] = [this.default_GAMEOVER_Handler.bind(this)];
};

Machine.prototype.stop = function(cb) {
    this.timer.close();
    this.running = false;
    if (!!cb)
        cb();
};

Machine.prototype.run = function(tickCb) {
    console.log("Machine run ---- tableId:", this.table.index);

    this.timer.run();
    this.running = true;
    this.tickCb = tickCb;
	console.log(this.states," = ",this.current);
    this.moveTo(this.states[this.current]);
};

Machine.prototype.next = function() { // 状态顺序切换一次
    console.log("Machine next ---- tableId:", this.table.index);

    this.current = ++this.current % this.states.length;
    if (!!this.handlers[this.states[this.current]])
        _.forEach(this.handlers[this.states[this.current]], function (handler) {
            handler(this.states[this.current], this.ticks);
        }.bind(this));
    this.ticksPrevState = this.ticks;
    this.ticks = 0;

    if (this.current == this.states.length-1) // GAMEOVER
        this.stop();
};

Machine.prototype.prev = function() { // 状态倒序切换一次
    this.current = --this.current;
    if (this.current <= 0)
        this.current = 0;

    if (!!this.handlers[this.states[this.current]])
        _.forEach(this.handlers[this.states[this.current]], function (handler) {
            handler(this.states[this.current], this.ticks);
        }.bind(this));
    this.ticksPrevState = this.ticks;
    this.ticks = 0;
};

Machine.prototype.moveTo = function(state) {
    for (var i=0; i<this.states.length; i++) {
        if (state == this.states[i]) {
            this.current = i;
            break;
        }
    }

    console.log("Machine moveTo:", this.states[this.current]);

    if (!!this.handlers[this.states[this.current]] && this.handlers[this.states[this.current]].length > 0)
        _.forEach(this.handlers[this.states[this.current]], function (handler) {
            handler(this.states[this.current], this.ticks);
        }.bind(this));
    this.ticksPrevState = this.ticks;
    this.ticks = 0;

    if (this.current == this.states.length-1) // GAMEOVER
        this.stop();
};

Machine.prototype.state = function() {
    return this.states[this.current];
};

Machine.prototype.setStateHandler = function(state, handler) {
    if (!!state && !!handler && !!this.handlers[state] && this.handlers[state].length > 0)
        this.handlers[state].splice(0, 0, handler); // 新加的状态处理回调放在默认处理函数之后
    else
        this.handlers[state] = [handler];
};

Machine.prototype.update = function() {
    this.ticks++;
    //console.log("Machine tick", this.ticks, this.ticksPrevState, this.state());

    if (!!this.tickCb)
        this.tickCb(this.ticks);
};

// ------------------------- default state handler ------------------------
Machine.prototype.default_UNGAME_Handler = function() {
    console.log('default_UNGAME_Handler ');
    
    this.next(); // 切到下一状态
  
};

Machine.prototype.default_SLEEP_Handler = function() {
   console.log('default_SLEEP_Handler ');
};

Machine.prototype.default_GAMEOVER_Handler = function() {
    console.log('stateMachine GAMEOVER');   
};

module.exports = Machine;