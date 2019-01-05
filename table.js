var StateMachine = require('./stateMachine');
var _ = require("lodash");

var TABLESTATUS = {
    'UNGAME':0,         //没有游戏状态还从没开始过
    'SLEEP':1,            //休眠状态 没有开始（此时玩家人数不足）
    'READY':2,           //准备阶段 1秒进入下一阶段
    'GAMBLING':3,          // 抢庄阶段
    'CHIPIN':4,          //下注倍数阶段
    'GAMEING':5,          //游戏中状态
    'GAMERESULT':6,       //游戏结果阶段 5秒给客户端展示阶段
    'GAMEOVER':7,          //游戏结束 桌子解散
};
var _TABLESTATUS = [
    'UNGAME',         //没有游戏状态还从没开始过
    'SLEEP',            //休眠状态 没有开始（此时玩家人数不足）
    'READY',           //准备阶段 1秒进入下一阶段
    'GAMBLING',          // 抢庄阶段
    'CHIPIN',          //下注倍数阶段
    'GAMEING',          //游戏中状态
    'GAMERESULT',       //游戏结果阶段 5秒给客户端展示阶段
    'GAMEOVER',          //游戏结束 桌子解散
];

var timeConfig = {
	
	readyTime : 5,
	resultTime : 5,
	showTime :5
}
var Instance = function(){
	this.index = 1;
	this.timeStatus = 0;                          //状态计时器 切换状态则清理
	this.machine = new StateMachine(this,_TABLESTATUS);
}

Instance.prototype.start = function(){
	this.machine.init();
	this.machine.setStateHandler('UNGAME', this.UNGAME_Handler.bind(this));
    this.machine.setStateHandler('SLEEP', this.SLEEP_Handler.bind(this));
    this.machine.setStateHandler('READY', this.READY_Handler.bind(this));
    this.machine.setStateHandler('GAMERESULT', this.GAMERESULT_Handler.bind(this));
    this.machine.setStateHandler('GAMEING', this.GAMEING_Handler.bind(this));
    this.machine.run(this.tick.bind(this));
}


Instance.prototype.UNGAME_Handler = function () {
    console.log("@table UNGAME_Handler");
};

Instance.prototype.SLEEP_Handler = function () {
	console.log("@talbe SLEEP_Handler");
};


Instance.prototype.READY_Handler = function() {
	console.log("@table READY_Handler");
};

Instance.prototype.GAMERESULT_Handler = function() {
   console.log("@table GAMERESULT_Handler");
};

Instance.prototype.GAMEING_Handler = function() {
   console.log("@table GAMEING_Handler");
};

Instance.prototype.tick = function(ticks) {
   console.log('-------------tick', this.TableStatus);
   console.log("state:",this.machine.state())
    switch (this.machine.state()) {
        case 'SLEEP': 
            console.log('------------SLEEP-tick', this.timeStatus);
			if(ticks >= (timeConfig.readyTime +1)*10){         
				this.timeStatus = 0;
				this.TableStatus = TABLESTATUS.READY;		
				this.machine.next();
			}
      
            break;
        case 'GAMERESULT': 
			console.log("this.timeStatus:",this.timeStatus);  
			if (ticks >= (timeConfig.resultTime + 3)*10){
				this.machine.next();  
			}	
            break;
        case 'READY': 
            console.log("桌子准备状态>>>>>>>>");
			if(_.random(1,4) == 4){
				this.TableStatus = TABLESTATUS.SLEEP;
				this.timeStatus = 0;
				this.machine.next(); 
			} 
            break;
        case 'GAMBLING': 
            this.timeStatus = ticks;           
			console.log("this.timeStatus:",this.timeStatus);  
			this.tableStatus = TABLESTATUS.CHIPIN;
			this.machine.next();	
            break;
        case 'CHIPIN': 
			console.log("CHIPIN");
            this.timeStatus = ticks;		
			console.log("this.timeStatus:",this.timeStatus);
			this.timeStatus = 0;
            this.TableStatus = TABLESTATUS.GAMEING;

            this.machine.next();
            break;
        case 'GAMEING': 
           	console.log("this.timeStatus:",this.timeStatus);  
			this.timeStatus = 0;
			this.TableStatus = TABLESTATUS.GAMERESULT;

			this.machine.next();			
            break;
    }
};

module.exports = Instance;