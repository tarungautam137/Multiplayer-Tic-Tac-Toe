import React from 'react'
import { useState ,useEffect} from 'react'
import swal from 'sweetalert2'
import {io} from 'socket.io-client'
import Confetti from './confetti'

const App = () => {

    const [board,setboard]=useState(Array(9).fill(null));
    const [next,setnext]=useState('X');
    const [isPlaying,setIsPlaying]=useState(false);
    const [name,setName]=useState("");
    const [socket,setSocket]=useState(null);
    const [opponentName,setOpponentName]=useState(null);
    const [playingAs,setPlayingAs]=useState(null)
    const [winner,setWinner]=useState(null);

    useEffect(()=>{calculateWinner()},[board]);

    const calculateWinner=()=>{

        let winningPlayer=null;
        const arr=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
        
        for(let i=0;i<=7;i++){

            const [a,b,c]=arr[i];

            if(board[a]===board[b] && board[b]===board[c] && board[a]!==null) {

                winningPlayer=board[a];
                setWinner(winningPlayer);
                break;
            }
        }
    }

    
    const handleClick=(index)=>{


        if(board[index]!==null || winner || playingAs!==next) return;

        socket?.emit("playermove",{index:index,sign:next});
        

        const newboard=[...board];

        newboard[index]=next;

        if(next==='X') setnext('O');
        else setnext('X');
        
        setboard(newboard);
    }

    const handlePlay=async ()=>{


        const res = await swal.fire({
        title: "Enter your Name",
        input: "text",
        showCancelButton: true,
        inputValidator: (value) => { if (!value) { return "You need to write something!" } }
        });

        if(res.isConfirmed) setName(res.value);

        const newsocket=io("http://localhost:3000");

        setName(res.value);

        newsocket.emit("find_opponent",{playerName:res.value})

        setSocket(newsocket);
    }

    socket?.on("connect",()=>{setIsPlaying(true)})

    socket?.on("opponentFound",({opponentName,playingAs})=>{

        setOpponentName(opponentName);
        setPlayingAs(playingAs);
    })

    socket?.on("servermove",({index,sign})=>{

        const newboard=[...board];

        newboard[index]=sign;

        if(sign==='X') setnext('O');
        else setnext('X');
        
        setboard(newboard);
    })

    socket?.on("opponentLeftTheMatch",()=>{

        if(winner===null){

            setOpponentName("bhagoda");
            setWinner(playingAs);
        }
    })

    if(!isPlaying){

        return(
            <div className='w-screen h-screen bg-gray-500  flex justify-center items-center'>
                <button className='py-4 px-10 bg-sky-300 rounded-sm hover:bg-sky-500' onClick={handlePlay}>PLAY ONLINE</button>
            </div>
        )
    } 

    if(isPlaying && opponentName===null){

        return(
            <div className='w-screen h-screen bg-gray-500  flex justify-center items-center'>
                <div className='py-4 px-10 bg-sky-300 rounded-sm'>WAITING FOR OPPONENT</div>
            </div>
        )
    }
    
    return (opponentName && (
    <div className="w-screen h-screen flex  flex-col items-center justify-center bg-gray-400">
        
        <div>
            <button className=" w-16 h-16 border-y-6 border-4 border-gray-500 text-2xl" onClick={()=>handleClick(0)}>{board[0] === null ? '\u00A0' : board[0]}</button>
            <button className=" w-16 h-16 border-y-6 border-4 border-gray-500 text-2xl" onClick={()=>handleClick(1)}>{board[1] === null ? '\u00A0' : board[1]}</button>
            <button className=" w-16 h-16 border-y-6 border-4 border-gray-500 text-2xl" onClick={()=>handleClick(2)}>{board[2] === null ? '\u00A0' : board[2]}</button>
        </div>
        <div>
            <button className=" w-16 h-16 border-y-6 border-4 border-gray-500 text-2xl" onClick={()=>handleClick(3)}>{board[3] === null ? '\u00A0' : board[3]}</button>
            <button className=" w-16 h-16 border-y-6 border-4 border-gray-500 text-2xl" onClick={()=>handleClick(4)}>{board[4] === null ? '\u00A0' : board[4]}</button>
            <button className=" w-16 h-16 border-y-6 border-4 border-gray-500 text-2xl" onClick={()=>handleClick(5)}>{board[5] === null ? '\u00A0' : board[5]}</button>
        </div>
        <div>
            <button className=" w-16 h-16 border-y-6 border-4 border-gray-500 text-2xl" onClick={()=>handleClick(6)}>{board[6] === null ? '\u00A0' : board[6]}</button>
            <button className=" w-16 h-16 border-y-6 border-4 border-gray-500 text-2xl" onClick={()=>handleClick(7)}>{board[7] === null ? '\u00A0' : board[7]}</button>
            <button className=" w-16 h-16 border-y-6 border-4 border-gray-500 text-2xl" onClick={()=>handleClick(8)}>{board[8] === null ? '\u00A0' : board[8]}</button>
        </div>

        

        {winner===null && opponentName!==null && (<div>YOU ARE PLAYING AGAINST {opponentName}</div>)}
        {winner!==null && opponentName==="bhagoda" && (<div>YOU  WON THE GAME OPPONENT LEFT THE MATCH</div>)}
        {winner===playingAs && <Confetti/>}
        {winner!==null && opponentName!==null && opponentName!=="bhagoda" && (<div>YOU {winner===playingAs?"WON":"LOST"} THE GAME</div>)}

    </div>)
    )
}

export default App

