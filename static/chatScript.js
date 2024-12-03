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
            

    connection.on("RecieveMessage" , (username , message , isMyMessage) =>{
        console.log(username);
        console.log(message);
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


function drawMessage(username , message , isMyMessage) {
    let messageDiv = document.createElement('div');
    let messClass = isMyMessage ? "flex items-start justify-end space-x-2" : "flex items-start space-x-2";
    messageDiv.classList.add(messClass);

    if(isMyMessage){

    }
    else{

    }
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


function clickSendMessage(){
    let messageInput = document.getElementById('messageInput');
    SendMessage(messageInput.value);
    messageInput.value = '';
}