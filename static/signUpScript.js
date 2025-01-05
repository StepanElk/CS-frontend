let codeword = '';
let connection = null;
let uuid = null;

var currentTab = 0;


async function login(form , event){
    event.preventDefault(); 
    const dataFirst= new FormData(document.getElementById('form-1'));
    const dataSecond  = new FormData(form);

    let name = dataFirst.get('name');
    let sex = document.querySelector('input[name="sex"]:checked').value;
    let word = dataFirst.get('word');
    let password = dataSecond.get('password') ;
    let passwordCopy = dataSecond.get('passwordCopy') ;
    codeword = dataSecond.get('codeword') ;

    console.log(name , sex, word);

    if(password != passwordCopy){
        document.getElementById("passwordCopyError").style.display = "block";
    }
    
    //Логика регистрации
    await connection.invoke("TrySignUp" ,codeword , uuid , name ,word , sex, password);
    
}

async function checkServerAnswer(answer ){
    if(answer == 0 ){
        connection.stop();
        location.href = "/chat";
    }
    else{
        if(answer == 1){
            document.getElementById('codewordError').style.display = "block";
        }
        else{
            movePrevPage()
            document.getElementById('wordError').style.display = "block";
        }
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

    connection.on("RecieveServerAnswer" , (answer ) =>{
        console.log(answer);
        checkServerAnswer(answer);
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

function moveNextPage(event){
    event.preventDefault();
    let form1 = document.getElementById("form-1");
    let form2 = document.getElementById("form-2");

    form1.style.display = "none";
    form2.style.display = "block";
}

function movePrevPage(){
    let form1 = document.getElementById("form-1");
    let form2 = document.getElementById("form-2");

    form2.style.display = "none";
    form1.style.display = "block";
}
