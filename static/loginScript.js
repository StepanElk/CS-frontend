let username = '';
let connection = null;
let uuid = null;

async function login(form , event){
    event.preventDefault(); 
    const formData = new FormData(form);
    let password = formData.get('password') ;
    username = formData.get('username') ;
    
    await connection.invoke("TryAuthorise" ,username, password , uuid);
}

async function checkLogin(answer){
    if(answer == 0){
        connection.stop();
        location.href = "/chat";
    }
    else if(answer == 1){
        let loginError = document.getElementById('loginError');
        loginError.style.display = "block";
    }
    else{
        let passwordError = document.getElementById('passwordError');
        passwordError.style.display = "block";
    }
}

function hideError(prefix){
    let error = document.getElementById(`${prefix}Error`);
    error.style.display = "none";
}

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

    connection.on("RecieveServerAnswer" , (answer) =>{
        console.log(answer);
        checkLogin(answer);
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
