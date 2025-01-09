let connection = null;
let uuid = null;

window.addEventListener('beforeunload',async function (event) {
    // Отменяем поведение по умолчанию
    event.preventDefault();
    connection.stop();
    this.document.cookie= "";
    // Chrome требует наличия returnValue
    event.returnValue = ''
})

document.addEventListener("DOMContentLoaded",async () => {
    
    if(document.cookie.length == 0 || document.cookie == "" ){
        uuid=crypto.randomUUID();
        document.cookie = `id=${uuid}`;
    }
    else{
        uuid = document.cookie.split('=')[1];
        console.log(uuid)
    }

    connection = new signalR.HubConnectionBuilder()
            .withUrl("http://localhost:3000/chat", {
                skipNegotiation: true,  
                transport: signalR.HttpTransportType.WebSockets  
              })
            .withAutomaticReconnect()
            .build();
            

    connection.on("RecieveMessage" , (json ,senderUuid) =>{
        console.log(json);
        let obj  = JSON.parse(json);
        obj.IsMine = uuid == senderUuid;
        console.log(obj);
        switch(obj.Type){
            case("text"):
                drawMessage(obj);
            case("event"):
                drawEvent(obj);
        }
        
    });

    connection.on("RecieveChatMessages" , (json) =>{
        let obj  = JSON.parse(json);
        console.log(obj)
        for (let mess of obj){
            switch(mess.Type){
                case("text"):
                    console.log(0)
                    drawMessage(mess);
                    break;
                case("event"):
                    console.log(1)
                    drawEvent(mess);
                    break;
            }
        }
    });
    try{
        await connection.start();
        await connection.invoke("Connect" ,uuid);
        console.log("Connected!")
        JoinChat();
    }
    catch(err){
        console.log(err);
    }
});

function drawEvent(object){
    let name = object.UserName;
    let isMine = object.IsMine;
    let userPhoto = object.UserPhoto;
    let photo = object.Photo;
    let eventName = object.EventName;
    let eventDate = object.EventDate;
    let description = object.EventDescription;
    let location = object.Location;
    let messageDiv = document.createElement('div');
    let messClass = isMine ? ["flex" ,"items-start" ,"justify-end" ,"space-x-2"] : ["flex","items-start", "space-x-2"];
    messageDiv.classList.add(...messClass);
    let d = new Date(object.SendDate);
    let htmlContent = `<div class="flex flex-col">
                        <div class="bg-white p-3 rounded-lg rounded-tl-none shadow-sm max-w-xs lg:max-w-md text-left">
                            <span class="text-sm text-black font-bold mt-1"><i>${name}</i>  предложил мероприятие</span>
                            <p class="text-lg text-black font-medium mt-1">${eventName}</p>
                            <p class="text-sm break-words text-gray-800">${description}</p>
                            <span class="text-base text-black font-medium mt-1"><i>Дата: </i>${eventDate}</span>
                            <p class="text-base text-black font-medium mt-1"><i>Место: </i> ${location}</p>
                            <img class="mt-4" src="${photo}" alt="">
                        </div>
                        <span class="text-xs text-gray-500 mt-1">${d.toTimeString().slice(0,5)} ${d.toDateString()}</span>
                        </div>`;
    if(isMine){
        htmlContent += `<img src="${userPhoto}" alt="My avatar" class="object-cover w-8 h-8 rounded-full"> `;
    }
    else{
        
        htmlContent = `<img src="${userPhoto}" alt="My avatar" class="object-cover w-8 h-8 rounded-full"> `+ htmlContent;
    }
    
    messageDiv.innerHTML = htmlContent;
    document.getElementById("chatMessages").append(messageDiv);
    messageDiv.scrollIntoView(false);
}

function drawMessage(object) {
    let name = object.UserName;
    let content = object.Content;
    let isMine = object.IsMine;
    let photo = object.UserPhoto;
    let messageDiv = document.createElement('div');
    let messClass = isMine ? ["flex" ,"items-start" ,"justify-end" ,"space-x-2"] : ["flex","items-start", "space-x-2"];
    messageDiv.classList.add(...messClass);
    let htmlContent = "";
    let d = new Date(object.SendDate);
    if(isMine){
        htmlContent = 
           `<div class="flex flex-col items-end">
              <div class="bg-blue-500 p-3 rounded-lg rounded-tr-none shadow-sm max-w-xs lg:max-w-md">
                
                <p class="text-sm text-white break-words">${content}</p>
              </div>
              <span class="text-xs text-gray-500 mt-1">${d.toTimeString().slice(0,5)} ${d.toDateString()}</span>
            </div>
            <img src="${photo}" alt="My avatar" class="object-cover w-8 h-8 rounded-full"> `;
    }
    else{
        if(name == "Admin"){
            messageDiv.classList.add("justify-center");
            htmlContent = `
            <div class="flex flex-col items-end">
              <div class="bg-gray-500 p-3 rounded-lg  shadow-sm max-w-xs lg:max-w-md">
                <p class="text-sm text-white">${content}</p>
              </div>
            </div>`;
        }
        else {
            htmlContent = `<img src="${photo}" alt="User avatar" class="object-cover w-8 h-8 rounded-full">
                            <div class="flex flex-col">
                            <div class="bg-white p-3  rounded-tl-none  rounded-lg shadow-sm max-w-xs lg:max-w-md text-left">
                                <span class="text-sm text-black font-bold mt-1">${name}</span>
                                <p class="text-sm break-words text-gray-800">${content}</p>
                            </div>
                            <span class="text-xs text-gray-500 mt-1">${d.toTimeString().slice(0,5)} ${d.toDateString()}</span>
                            </div>`
        }
    }
    
    messageDiv.innerHTML = htmlContent;
    document.getElementById("chatMessages").append(messageDiv);
    messageDiv.scrollIntoView(false);
}
    


async function JoinChat(){
    try{
        await connection.invoke("JoinChat" , uuid);
        await connection.invoke("LoadMessages" , uuid);
    }
    catch(err){
        console.log(err);
    }
}

async function SendMessage(message){
    if (connection != null ){
        try{
            await connection.invoke("SendMessage" , message , uuid);
        }
        catch(err){
            console.log(err);
        }
    }
}


function SendMessageValue(){
    let messageInput = document.getElementById('messageInput');
    if(messageInput.value.trim() != ""){
        SendMessage(messageInput.value);
        messageInput.value = '';
    }
}
function keySendMessage( event){
    if (event.keyCode === 13) {
        SendMessageValue();
    }
}

async function sendEvent(event , form){
    event.preventDefault();
    let formmm = new FormData(form);
    let name = formmm.get('eventName');
    let description = formmm.get('description');
    let date = formmm.get('date');
    let location = formmm.get('location');
    let photo = formmm.get('url-photo');
    await connection.invoke("PostEvent" , uuid , name , description ,location, date , photo);
}