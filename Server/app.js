const http=require('http')

const http = require('http');
const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end('Tic-Tac-Toe Server Running');
});

require('dotenv').config()

const socket=require('socket.io')

const webSocketServer=socket(server,{
    cors:{
        origin:"https://multiplayer-tic-tac-toe-client.onrender.com",
        credentials:true
    }
    
});

let allUsers={};
let allRooms=[];


webSocketServer.on("connection",(socket)=>{

    socket.on("find_opponent",({playerName})=>{

        allUsers[socket.id]={
        socket:socket,
        playing:false,
        online:true,
        playerName:playerName
        }

        let opponent=null;
        const currentUser=allUsers[socket.id];

        for(let key in allUsers){

            if(key!==socket.id && !(allUsers[key].playing) && allUsers[key].online){

                opponent=allUsers[key];
                break;
            } 
        }
        
        if(opponent){

            allRooms.push({p1:allUsers[socket.id],p2:opponent});

            allUsers[socket.id].playing=true;
            opponent.playing=true;

            opponent.socket.emit("opponentFound",{opponentName:playerName,playingAs:'X'})
            currentUser.socket.emit("opponentFound",{opponentName:opponent.playerName,playingAs:'O'})

            socket.on("playermove",({index,sign})=>{

                opponent.socket.emit("servermove",{index:index,sign:sign});
            })

            opponent.socket.on("playermove",({index,sign})=>{

                socket.emit("servermove",{index:index,sign:sign});
            })
        }
    })

    socket.on("disconnect",()=>{

        if(allUsers[socket.id]){

            allUsers[socket.id].playing=false;
            allUsers[socket.id].online=false;
        }

        for(const room of allRooms){

            if(room.p1.socket.id===socket.id) {

                room.p2.socket.emit("opponentLeftTheMatch");
                break;
            }
            if(room.p2.socket.id===socket.id) {

                room.p1.socket.emit("opponentLeftTheMatch");
                break;
            }
        }
    })

})

const PORT=process.env.PORT||3000
server.listen(PORT, '0.0.0.0', () => { console.log("server is listening at port", PORT)});