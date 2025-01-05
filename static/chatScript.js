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
            

    connection.on("RecieveMessage" , (json) =>{
        // console.log(json);
        let obj  = JSON.parse(json);
        
        drawMessage(obj)
    });

    connection.on("RecieveChatMessages" , (json) =>{
        let obj  = JSON.parse(json);
        for (let mess of obj){
            drawMessage(mess);
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


function drawMessage(object) {
    let name = object.UserName;
    let content = object.Content;
    let isMine = object.IsMine;
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
            <img src="https://via.placeholder.com/40" alt="My avatar" class="w-8 h-8 rounded-full"> `;
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
            htmlContent = `<img src="https://via.placeholder.com/40" alt="User avatar" class="w-8 h-8 rounded-full">
                            <div class="flex flex-col">
                            <div class="bg-white p-3 rounded-lg rounded-tl-none shadow-sm max-w-xs lg:max-w-md text-left">
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