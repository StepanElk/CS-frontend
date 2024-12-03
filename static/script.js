
let chatName = '';
let username = '';
let connection = null;
let uuid = null;

async function login(form , event){
    event.preventDefault(); // Предотвращаем отправку формы
    const formData = new FormData(form);
    chatName = formData.get('chatName') ;
    username = formData.get('username') ;

    await connection.invoke("LoginUser" ,username,  chatName , uuid);
    connection.stop();
    location.href = "/chat";
}

// window.addEventListener('beforeunload',async function (event) {
//     // Отменяем поведение по умолчанию
//     event.preventDefault();
//     await connection.invoke("Disconnect" ,uuid,  chatName);
//     connection.stop();
//     // this.document.cookie='';
//     // Chrome требует наличия returnValue
//     event.returnValue = ''
// })

document.addEventListener("DOMContentLoaded",async () => {
    
    uuid=crypto.randomUUID();
    document.cookie = `id=${uuid}`;
    console.log(document.cookie)
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
        await connection.invoke("Connect" ,uuid);
        console.log("Connected!")
    }
    catch(err){
        console.log(err);
    }
});

// async function JoinChat(){
//     try{
//         await connection.invoke("JoinChat" , username , chatName , uuid);

//         connection.stop();
//         location.href = "/chat";
//     }
//     catch(err){
//         console.log(err);
//     }
// }

// async function SendMessage(message){
//     if (connection != null ){
//         try{
//             console.log("send mess")
//             await connection.invoke("SendMessage" , message , uuid);
//         }
//         catch(err){
//             console.log(err);
//         }
//     }
// }


// function clickSendMessage(){
//     let messageInput = document.getElementById('messageInput');
//     SendMessage(messageInput.value);
//     messageInput.value = '';
// }