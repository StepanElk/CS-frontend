let chatName = '';
let username = '';
let connection = 1;

function login(form , event){
    event.preventDefault(); // Предотвращаем отправку формы
    const formData = new FormData(form);
    chatName = formData.get('chatName') ;
    username = formData.get('username') ;
    
    JoinChat();
}


async function JoinChat(){
    connection = new signalR.HubConnectionBuilder()
            .withUrl("http://localhost:3000/chat", {
                skipNegotiation: true,  
                transport: signalR.HttpTransportType.WebSockets  
              })
            .withAutomaticReconnect()
            .build();

    connection.on("RecieveMessage" , (username , message) =>{
        console.log(username);
        console.log(message);
    });

    try{
        await connection.start();
        await connection.invoke("JoinChat" , username , chatName);
        // location.href = "chat.html";
    }
    catch(err){
        console.log(err);
    }
}

async function SendMessage(message){
    if (connection != null ){
        try{
            console.log("send mess")
            await connection.invoke("SendMessage" , message);
        }
        catch(err){
            console.log(err);
        }
    }
}


function clickSendMessage(){
    console.log(connection);
    SendMessage("messageInput.value");
    let messageInput = document.getElementById('messageInput');
    messageInput.value = '';
    console.log(2);
}