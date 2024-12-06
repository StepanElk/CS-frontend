let connection = null;
let uuid = null;

window.addEventListener('beforeunload',async function (event) {
    // Отменяем поведение по умолчанию
    event.preventDefault();
    await connection.invoke("Disconnect" ,uuid);
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
            

    connection.on("RecieveMessage" , (username , message , senderUuid) =>{
        console.log(username);
        console.log(message);
        console.log(senderUuid);

        drawMessage(username , message , senderUuid)
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


function drawMessage(username , message , senderUuid) {
    let messageDiv = document.createElement('div');
    let isMyMessage = senderUuid == uuid;
    let messClass = isMyMessage ? ["flex" ,"items-start" ,"justify-end" ,"space-x-2"] : ["flex","items-start", "space-x-2"];
    messageDiv.classList.add(...messClass);
    let htmlContent = "";
    let date = new Date();
    if(isMyMessage){
        htmlContent = 
           `<div class="flex flex-col items-end">
              <div class="bg-blue-500 p-3 rounded-lg rounded-tr-none shadow-sm max-w-xs lg:max-w-md">
                
                <p class="text-sm text-white break-words">${message}</p>
              </div>
              <span class="text-xs text-gray-500 mt-1">${date.toTimeString().slice(0,5)}</span>
            </div>
            <img src="https://via.placeholder.com/40" alt="My avatar" class="w-8 h-8 rounded-full"> `;
    }
    else{
        if(senderUuid == "admin"){
            messageDiv.classList.add("justify-center");
            htmlContent = `
            <div class="flex flex-col items-end">
              <div class="bg-gray-500 p-3 rounded-lg  shadow-sm max-w-xs lg:max-w-md">
                <p class="text-sm text-white">${message}</p>
              </div>
            </div>`;
        }
        else {
            htmlContent = `<img src="https://via.placeholder.com/40" alt="User avatar" class="w-8 h-8 rounded-full">
                            <div class="flex flex-col">
                            <div class="bg-white p-3 rounded-lg rounded-tl-none shadow-sm max-w-xs lg:max-w-md text-left">
                                <span class="text-sm text-black font-bold mt-1">${username}</span>
                                <p class="text-sm break-words text-gray-800">${message}</p>
                            </div>
                            <span class="text-xs text-gray-500 mt-1">${date.toTimeString().slice(0,5)}</span>
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