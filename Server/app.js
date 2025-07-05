const http=require('http')
const server=http.createServer();

const socket=require('socket.io')

const webSocketServer=socket(server,{
    cors:{
        origin:"http://localhost:5173",
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

server.listen(3000);

console.log("server is listening at port 3000")