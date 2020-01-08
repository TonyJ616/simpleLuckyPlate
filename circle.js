var EventUtil={
        
    addHandler:function(element,type,handler){ //添加事件
        if(element.addEventListener){
          element.addEventListener(type,handler,false);  //使用DOM2级方法添加事件
       }else if(element.attachEvent){                    //使用IE方法添加事件
            element.attachEvent("on"+type,handler);
        }else{
          element["on"+type]=handler;          //使用DOM0级方法添加事件
        }
    }, 

    removeHandler:function(element,type,handler){  //取消事件
        if(element.removeEventListener){
            element.removeEventListener(type,handler,false);
        }else if(element.detachEvent){
            element.detachEvent("on"+type,handler);
        }else{
            element["on"+type]=null;
        }
    },

    getEvent:function(event){  //使用这个方法跨浏览器取得event对象
        return event?event:window.event;
    },
    
    getTarget:function(event){  //返回事件的实际目标
        return event.target||event.srcElement;
    },
        
    preventDefault:function(event){   //阻止事件的默认行为
        if(event.preventDefault){
            event.preventDefault();
        }else{
            event.returnValue=false;
        }
    },
    
    stopPropagation:function(event){  //立即停止事件在DOM中的传播
                                      //避免触发注册在document.body上面的事件处理程序
        if(event.stopPropagation){
            event.stopPropagation();
        }else{
            event.cancelBubble=true;
        }
    },
            
    getRelatedTarget:function(event){  //获取mouseover和mouseout相关元素
        if(event.relatedTarget){
            return event.relatedTarget;
       }else if(event.toElement){      //兼容IE8-
            return event.toElement;
        }else if(event.formElement){
            return event.formElement;
        }else{
            return null;
        }
    },
            
    getButton:function(event){    //获取mousedown或mouseup按下或释放的按钮是鼠标中的哪一个
        if(document.implementation.hasFeature("MouseEvents","2.0")){
            return event.button;
        }else{
            switch(event.button){   //将IE模型下的button属性映射为DOM模型下的button属性
                case 0:
                case 1:
                case 3:
                case 5:
                case 7:
                    return 0;  //按下的是鼠标主按钮（一般是左键）
                case 2:
                case 6:
                    return 2;  //按下的是中间的鼠标按钮
                case 4:
                    return 1;  //鼠标次按钮（一般是右键）
            }
        }
    },

    getWheelDelta:function(event){ //获取表示鼠标滚轮滚动方向的数值
        if(event.wheelDelta){
            return event.wheelDelta;
        }else{
            return -event.detail*40;
        }
    },
            
    getCharCode:function(event){   //以跨浏览器取得相同的字符编码，需在keypress事件中使用
        if(typeof event.charCode=="number"){
            return event.charCode;
        }else{
            return event.keyCode;
        }
    }

};

//限制概率只能输入数字
var probs = document.getElementsByClassName("prob-input");
for (var i = 0; i < probs.length; i++){
    EventUtil.addHandler(probs[i], "keypress", function(event){
        event = EventUtil.getEvent(event);
        var target = EventUtil.getTarget(event);
        var charCode = EventUtil.getCharCode(event);

        if (!/\d/.test(String.fromCharCode(charCode)) && charCode > 9){
            EventUtil.preventDefault(event);
        }
    });
}

// ------控制添加/删除N等奖按钮-------
//获取当前N等奖数目
var uesrSetting = document.getElementsByClassName("user-setting")[0];
var classesDivs = uesrSetting.getElementsByClassName("classes");
var deleteBtn = document.getElementById("deleteBtn");
var addBtn = document.getElementById("addBtn");
var thankyouBtn = document.getElementById("thankyouBtn");
var saveBtn = document.getElementById("save");

EventUtil.addHandler(deleteBtn, "click", btnContentChange);
EventUtil.addHandler(addBtn, "click", btnContentChange);
EventUtil.addHandler(thankyouBtn, "click", btnContentChange);

function btnContentChange(event){
    event = EventUtil.getEvent(event);
    var target = EventUtil.getTarget(event);
    if (this.innerText.substring(0,2) == "删除" && this.innerText.substring(4,5) == "奖"){
        //获得要删除的DIV
        var toDeleteDiv = classesDivs[classesDivs.length-1];
        toDeleteDiv.parentElement.removeChild(toDeleteDiv);

        //如果只有一、二等奖，则不能继续删除奖项
        //动态设置按钮内容
        var classCount = document.getElementsByClassName("classes").length;
        if (classCount < 3){
            deleteBtn.disabled = true;
        } else if (classCount > 3){
            addBtn.disabled = false;
        } else {
            deleteBtn.disabled = false;
        }
        switch (classCount) {
            case 2:
                this.innerText = "无法删除更多奖项";
                addBtn.innerText = "添加三等奖";
                break;
            case 3:
                this.innerText = "删除三等奖";
                addBtn.innerText = "添加四等奖";
                break;
            case 4:
                this.innerText = "删除四等奖";
                addBtn.innerText = "添加五等奖";
                break;
        }

    } else if (this.innerText.substring(0,2) == "添加" && this.innerText.substring(4,5) == "奖"){
        var classCount = document.getElementsByClassName("classes").length;

        // ----------动态创建奖项DIV-------------
        var newClassFrame = document.createElement("div");
        newClassFrame.className = "classes";
        newClassFrame.setAttribute("id", "class"+(classCount+1));
        uesrSetting.insertBefore(newClassFrame, classesDivs[classCount-1].nextElementSibling);

        var newClassTitle = document.createElement("p");
        var titleName = "";
        switch (classCount){
            case 2:
                titleName = "三等奖：";
                break;
            case 3:
                titleName = "四等奖：";
                break;
            case 4:
                titleName = "五等奖：";
                break;
        }
        newClassTitle.innerText = titleName;
        newClassFrame.appendChild(newClassTitle);

        var newClassContent = document.createElement("div");
        newClassContent.className = "class-content";
        newClassContent.setAttribute("id", "content"+(classCount+1));
        newClassFrame.appendChild(newClassContent);

        //name-frame
        var newNameFrame = document.createElement("div");
        newNameFrame.className = "name-frame";
        newClassContent.appendChild(newNameFrame);

        var newNameLabel = document.createElement("label");
        var currentCount = classCount + 1;
        newNameLabel.setAttribute("for", "name"+currentCount);
        newNameLabel.className = "names";
        newNameLabel.innerText = "奖品名：";
        newNameFrame.appendChild(newNameLabel);

        var newNameInput = document.createElement("input");
        newNameInput.setAttribute("type", "text");
        newNameInput.className = "name-input";
        newNameInput.setAttribute("name", "name"+currentCount);
        newNameInput.setAttribute("maxlength", "12");
        newNameFrame.appendChild(newNameInput);

        //proob-frame
        var newProbFrame = document.createElement("div");
        newProbFrame.className = "prob-frame";
        newClassContent.appendChild(newProbFrame);

        var newProbLabel = document.createElement("label");
        newProbLabel.setAttribute("for", "prob"+currentCount);
        newProbLabel.className = "probs";
        newProbLabel.innerText = "概率(%)：";
        newProbFrame.appendChild(newProbLabel);

        var newProbInput = document.createElement("input");
        newProbInput.setAttribute("type", "text");
        newProbInput.className = "prob-input";
        newProbInput.setAttribute("name", "prob"+currentCount);
        newProbInput.setAttribute("maxlength", "2");
        newProbFrame.appendChild(newProbInput);

        // ----------------------------------------------

        //动态设置按钮内容
        switch (classCount) {
            case 2:
                this.innerText = "添加四等奖";
                deleteBtn.innerText = "删除三等奖";
                break;
            case 3:
                this.innerText = "添加五等奖";
                deleteBtn.innerText = "删除四等奖";
                break;
            case 4:
                this.innerText = "无法添加更多奖项";
                deleteBtn.innerText = "删除五等奖";
                break;
        }
        if (classCount > 3){
            addBtn.disabled = true;
        } else if (classCount < 3){
            deleteBtn.disabled = false;
        } else {
            addBtn.disabled = false;
        }

    }  else if (this.innerText.substring(0,1) == "添" && this.innerText.substring(3,4) == "谢"){
        //将添加谢谢参与变成删除谢谢参与
        this.innerText = "删除“谢谢参与”";
        // ----------动态创建谢谢参与DIV-------------
        var newClassFrame = document.createElement("div");
        newClassFrame.className = "thankyou";
        newClassFrame.setAttribute("id", "classThankyou");
        uesrSetting.insertBefore(newClassFrame, uesrSetting.lastElementChild.previousElementSibling);

        var newClassTitle = document.createElement("p");
        newClassTitle.innerText = "谢谢参与：";
        newClassFrame.appendChild(newClassTitle);

        var newClassContent = document.createElement("div");
        newClassContent.className = "class-content";
        newClassContent.setAttribute("id", "contentThankyou");
        newClassFrame.appendChild(newClassContent);

        //name-frame
        var newNameFrame = document.createElement("div");
        newNameFrame.className = "name-frame";
        newClassContent.appendChild(newNameFrame);

        var newNameLabel = document.createElement("label");
        var currentCount = classCount + 1;
        newNameLabel.setAttribute("for", "nameThankyou");
        newNameLabel.className = "names";
        newNameLabel.innerText = "奖品名：";
        newNameFrame.appendChild(newNameLabel);

        var newNameInput = document.createElement("input");
        newNameInput.setAttribute("type", "text");
        newNameInput.className = "name-input";
        newNameInput.setAttribute("name", "nameThankyou");
        newNameInput.setAttribute("maxlength", "12");
        newNameFrame.appendChild(newNameInput);

        //proob-frame
        var newProbFrame = document.createElement("div");
        newProbFrame.className = "prob-frame";
        newClassContent.appendChild(newProbFrame);

        var newProbLabel = document.createElement("label");
        newProbLabel.setAttribute("for", "probThankyou");
        newProbLabel.className = "probs";
        newProbLabel.innerText = "概率(%)：";
        newProbFrame.appendChild(newProbLabel);

        var newProbInput = document.createElement("input");
        newProbInput.setAttribute("type", "text");
        newProbInput.className = "prob-input";
        newProbInput.setAttribute("name", "probThankyou");
        newProbInput.setAttribute("maxlength", "2");
        newProbFrame.appendChild(newProbInput);

        // ----------------------------------------------
    } else if (this.innerText.substring(0,1) == "删" && this.innerText.substring(3,4) == "谢"){
        var thankyouDiv = document.getElementsByClassName("thankyou")[0];
        thankyouDiv.parentElement.removeChild(thankyouDiv);
        this.innerText = "添加“谢谢参与”";
    }

}

//设置转盘样式
EventUtil.addHandler(saveBtn, "click", function(){
    var classDivs = document.getElementsByClassName("user-setting")[0].children;
    var counts = classDivs.length;
    //创建N等奖的扇形盘
    //获取元素插入位置
    var classSectors = document.getElementsByClassName("classSectors")[0];
    for (var i = 2; i < counts - 2; i++){
        var newSector = document.createElement("div");
        newSector.className = "sector"+(i+1);
        classSectors.appendChild(newSector);
    }
    //获取每个概率输入框的值
    var values = new Array(counts-2);
    //检查输入的概率之和是不是100，如果不是，按比例分配
    var sum = 0;
    for (var i = 0; i < counts-2; i++){
        var probinput = classDivs[i].lastElementChild.lastElementChild.lastElementChild;
        if (probinput.value){
            values[i] = parseInt(probinput.value);
            sum += values[i];
        } else {
            alert("概率不能为空！");
            break;
        }
        
    }

    //如果概率和为100
    if (sum == 100){
        var degrees = new Array(counts-2);
        var totalDegree = 0;
        for (var i = 0; i < counts-2; i++){
            degrees[i] = 360 * values[i] / 100;
            //如果有概率大于50%
            if (degrees[i] > 180){
                var sectors = classSectors.children;
                //如果是谢谢参与
                if (classDivs[counts-3].firstElementChild.innerText.substring(0,1) == "谢"){
                    $(".plate").css("background-color", "gray");
                    $(".sector"+(counts-2)).css("transform", "translate(-50%, -50%)");
                    $("<style>.sector"+(counts-2)+"::after{transform: rotate(0deg);}</style>").appendTo("head");
                    continue;
                }
                //如果不是谢谢参与
                switch (i) {
                    case 0:
                        $(".plate").css("background-color", "rgb(211, 28, 165)");
                        $(".sector"+(i+1)).css("transform", "translate(-50%, -50%)");
                        $("<style>.sector"+(i+1)+"::after{transform: rotate(0deg);}</style>").appendTo("head");
                        break;
                    case 1:
                        $(".plate").css("background-color", "rgb(25, 97, 190)");
                        $(".sector"+(i+1)).css("transform", "translate(-50%, -50%)");
                        $("<style>.sector"+(i+1)+"::after{transform: rotate(0deg);}</style>").appendTo("head");
                        break;
                    case 2:
                        $(".plate").css("background-color", "rgb(5, 173, 61)");
                        $(".sector"+(i+1)).css("transform", "translate(-50%, -50%)");
                        $("<style>.sector"+(i+1)+"::after{transform: rotate(0deg);}</style>").appendTo("head");
                        break;
                    case 3:
                        $(".plate").css("background-color", "rgb(170, 29, 29)");
                        $(".sector"+(i+1)).css("transform", "translate(-50%, -50%)");
                        $("<style>.sector"+(i+1)+"::after{transform: rotate(0deg);}</style>").appendTo("head");
                        break;
                    case 4:
                        $(".plate").css("background-color", "rgb(11, 168, 147)");
                        $(".sector"+(i+1)).css("transform", "translate(-50%, -50%)");
                        $("<style>.sector"+(i+1)+"::after{transform: rotate(0deg);}</style>").appendTo("head");
                        break;
                }
                continue;
            }

            if (i > 0){
                $(".sector"+(i+1)).css("transform", "translate(-50%, -50%) rotate("+totalDegree+"deg)");
            }
            $("<style>.sector"+(i+1)+"::after{transform: rotate("+degrees[i]+"deg);}</style>").appendTo("head");
            totalDegree += degrees[i];
        }
    } else {
        alert("概率和应该为100！");
    }
    
});

//开始旋转
var startBtn = document.getElementById("startBtn");
EventUtil.addHandler(startBtn, "click", luckyNow);

function luckyNow(event){
    event = EventUtil.getEvent(event);
    target = EventUtil.getTarget(event);

    if (this.classList.contains("stopped")){
        this.classList.remove("stopped");
        var rotateTime = Math.random() * 3;
        console.log(Math.floor(rotateTime*1000 + 900));
        setTimeout(function(){
            startBtn.classList.add("stopped");
        }, (Math.floor(rotateTime*1000 + 900)));

    }
}
